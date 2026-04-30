import { Agent } from "@voltagent/core";
import { openai } from "@ai-sdk/openai";
import { trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { promises as fs } from "fs";

const tracerProvider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "voltagent-tracing-app"
  })
});

tracerProvider.addSpanProcessor(
  new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: "http://localhost:4318/v1/traces"
    })
  )
);

tracerProvider.register();

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini")
});

async function main() {
  const result = await agent.generateText("Hello", {
    experimental_telemetry: {
      isEnabled: true,
      tracer: trace.getTracer("voltagent-agent")
    }
  });

  const output = typeof result.text === "string" ? result.text : JSON.stringify(result, null, 2);
  await fs.writeFile("/home/user/app/output.log", output);

  await tracerProvider.forceFlush();
  await tracerProvider.shutdown();
  process.exit(0);
}

main().catch(async (error) => {
  console.error(error);
  try {
    await tracerProvider.forceFlush();
    await tracerProvider.shutdown();
  } finally {
    process.exit(1);
  }
});
