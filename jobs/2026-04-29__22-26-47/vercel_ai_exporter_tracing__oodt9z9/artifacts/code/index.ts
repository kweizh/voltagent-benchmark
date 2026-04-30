import { Agent } from "@voltagent/core";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes, defaultResource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { createVoltAgentObservability } from "@voltagent/core";
import * as fs from "fs";
import * as path from "path";

// Configure OpenTelemetry SDK
const resource = defaultResource().merge(
  resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: "voltagent-tracing-app",
    [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
  })
);

const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
});

const tracerProvider = new NodeTracerProvider({
  resource,
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
});

tracerProvider.register();

// Create VoltAgent observability with OTLP exporter
const observability = createVoltAgentObservability({
  serviceName: "voltagent-tracing-app",
  serviceVersion: "1.0.0",
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
  flushOnFinishStrategy: "always",
});

// Create agent with observability
const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
  model: "openai:gpt-4o-mini",
  observability,
});

async function main() {
  const outputPath = path.join(__dirname, "output.log");
  
  try {
    // Send "Hello" message to the agent
    const result = await agent.generateText("Hello");
    
    // Log the response to output.log
    const responseText = JSON.stringify(result, null, 2);
    fs.writeFileSync(outputPath, responseText, "utf-8");
    
    console.log("Response logged to output.log");
    console.log("Response:", result.text);
  } catch (error) {
    console.error("Error:", error);
    fs.writeFileSync(outputPath, JSON.stringify({ error: String(error) }, null, 2), "utf-8");
    throw error;
  } finally {
    // Flush the tracer to ensure all traces are exported
    try {
      await tracerProvider.forceFlush();
    } catch (flushError) {
      console.error("Error flushing tracer:", flushError);
    }
    
    try {
      await observability.shutdown();
    } catch (shutdownError) {
      console.error("Error shutting down observability:", shutdownError);
    }
    
    // Exit the process to prevent hanging
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});