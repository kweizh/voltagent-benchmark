import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Agent } from "@voltagent/core";
import { openai } from "@ai-sdk/openai";
import * as fs from 'fs';

const provider = new NodeTracerProvider({
  spanProcessors: [
    new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: 'http://localhost:4318/v1/traces',
      })
    )
  ]
});
provider.register();

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini")
});

async function main() {
  const result = await agent.generateText("Hello", {
    experimental_telemetry: {
      isEnabled: true
    }
  } as any);
  
  fs.writeFileSync('/home/user/app/output.log', JSON.stringify(result, null, 2));
  
  await provider.forceFlush();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
