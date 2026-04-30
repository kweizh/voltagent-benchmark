# VoltAgent Tracing Setup

## Background
You have a basic VoltAgent project in `/home/user/app` with a simple agent responding to user inputs.
Your task is to enable telemetry so that all LLM calls made by the agent are traced and exported using Vercel AI SDK's OpenTelemetry integration.

## Requirements
- Install the necessary OpenTelemetry and Vercel AI SDK tracing packages (e.g., `@vercel/otel`, `@opentelemetry/sdk-trace-node`, `@opentelemetry/exporter-trace-otlp-http`).
- Configure the telemetry in `/home/user/app/index.ts` to export traces to a local OTLP HTTP collector at `http://localhost:4318/v1/traces`.
- Update the agent definition to enable `experimental_telemetry` or equivalent tracing functionality.
- Modify `index.ts` so that when run, it sends a single message "Hello" to the agent, waits for the response, logs it to `/home/user/app/output.log`, then flushes the tracer (e.g. `await sdk.shutdown()` / `await provider.forceFlush()`) and calls `process.exit(0)`. VoltAgent + an active OTel SDK both keep Node's event loop alive; without an explicit exit the script will hang.

## Constraints
- Project path: /home/user/app
- Log file: /home/user/app/output.log
- Start command: `npm start`
- The script must run without errors and successfully export traces.