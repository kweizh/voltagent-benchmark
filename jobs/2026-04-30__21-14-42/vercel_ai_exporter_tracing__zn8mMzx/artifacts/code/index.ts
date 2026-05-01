import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import * as fs from "fs";
import * as path from "path";

// Configure OpenTelemetry
const resource = resourceFromAttributes({
  [SemanticResourceAttributes.SERVICE_NAME]: "voltagent-tracing-app",
});

const provider = new NodeTracerProvider({
  resource,
  spanProcessors: [
    new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: "http://localhost:4318/v1/traces",
      })
    ),
  ],
});

// Register the provider globally
provider.register();

async function main() {
  try {
    // Send a single message "Hello" with telemetry enabled
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: "Hello",
      experimental_telemetry: {
        isEnabled: true,
      },
    });
    
    // Log the response to output.log
    const outputPath = path.join(__dirname, "output.log");
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    // Flush the tracer to ensure all traces are exported
    await provider.forceFlush();
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    await provider.forceFlush();
    process.exit(1);
  }
}

main();