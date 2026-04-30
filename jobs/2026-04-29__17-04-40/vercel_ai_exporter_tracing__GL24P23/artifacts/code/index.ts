// OpenTelemetry must be initialised before any other imports so that the
// global tracer provider is in place when the Vercel AI SDK registers spans.
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

// Build the OTLP HTTP exporter targeting the local collector endpoint.
const exporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
});

// In OTel SDK v2 the resource and span processors are passed directly in the
// NodeTracerProvider constructor config – there is no addSpanProcessor() method.
const provider = new NodeTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "voltagent-tracing-app",
  }),
  spanProcessors: [
    // SimpleSpanProcessor: exports each span immediately (good for scripts).
    new SimpleSpanProcessor(exporter),
    // BatchSpanProcessor: buffers and flushes spans in bulk before shutdown.
    new BatchSpanProcessor(exporter),
  ],
});

// Register as the global OTel tracer provider so AI SDK spans are captured.
provider.register();

// --------------------------------------------------------------------------
// Application code – imported after OTel setup so instrumentation is active.
// --------------------------------------------------------------------------
import { Agent } from "@voltagent/core";
import { openai } from "@ai-sdk/openai";
import * as fs from "fs";
import * as path from "path";

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini"),
});

async function main(): Promise<void> {
  // Send a single "Hello" message to the agent.  VoltAgent calls the Vercel
  // AI SDK's generateText under the hood, which emits OTel spans via the
  // registered global provider.
  const result = await agent.generateText("Hello");

  // Normalise whatever VoltAgent returns into a plain string.
  const text: string =
    typeof result === "string"
      ? result
      : typeof (result as any)?.text === "string"
        ? (result as any).text
        : JSON.stringify(result);

  // Persist the response to the log file.
  const logPath = path.join(__dirname, "output.log");
  fs.writeFileSync(logPath, text + "\n", "utf8");
  console.log("Agent response written to output.log:", text);

  // Flush all buffered spans to the OTLP endpoint, then shut down cleanly.
  // Errors here (e.g. collector not reachable) are non-fatal – the script
  // has already done its job by this point.
  try {
    await provider.forceFlush();
  } catch (flushErr) {
    console.warn("Telemetry flush warning (non-fatal):", flushErr);
  }
  try {
    await provider.shutdown();
  } catch (shutErr) {
    console.warn("Telemetry shutdown warning (non-fatal):", shutErr);
  }

  // Explicitly exit so that VoltAgent's HTTP server and active OTel handles
  // do not keep the Node.js event loop alive indefinitely.
  process.exit(0);
}

main().catch(async (err) => {
  console.error("Error running agent:", err);
  try {
    await provider.forceFlush();
    await provider.shutdown();
  } catch (_) {
    // best-effort flush on error path
  }
  process.exit(1);
});
