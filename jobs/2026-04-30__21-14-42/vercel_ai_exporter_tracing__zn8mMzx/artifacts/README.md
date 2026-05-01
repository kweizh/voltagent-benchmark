# VoltAgent Tracing Setup

This document describes the OpenTelemetry tracing setup for the VoltAgent application.

## Overview

The application has been configured to export all LLM call traces using Vercel AI SDK's OpenTelemetry integration with a local OTLP HTTP collector.

## Changes Made

### 1. Installed OpenTelemetry Packages

The following packages were added to enable tracing:
- `@vercel/otel` - Vercel's OpenTelemetry integration
- `@opentelemetry/sdk-trace-node` - Node.js SDK for tracing
- `@opentelemetry/exporter-trace-otlp-http` - OTLP HTTP exporter for traces
- `@opentelemetry/instrumentation` - OpenTelemetry instrumentation support
- `ai` - Vercel AI SDK

### 2. Updated index.ts

The main entry point was updated to:
- Configure OpenTelemetry with an OTLP HTTP exporter
- Export traces to `http://localhost:4318/v1/traces`
- Enable `experimental_telemetry` in the generateText call
- Send a "Hello" message to the OpenAI model
- Log the response to `/home/user/app/output.log`
- Flush the tracer before exiting
- Call `process.exit(0)` to prevent the script from hanging

### 3. Updated tsconfig.json

The TypeScript configuration was updated to be more permissive:
- Set `strict: false` to handle version compatibility issues
- Set `noImplicitAny: false` for additional flexibility

## How It Works

1. **OpenTelemetry Configuration**: The script sets up a NodeTracerProvider with:
   - A resource with service name "voltagent-tracing-app"
   - A SimpleSpanProcessor with an OTLPTraceExporter
   - Export to a local OTLP collector at `http://localhost:4318/v1/traces`

2. **Telemetry Enablement**: The `generateText` call includes `experimental_telemetry: { isEnabled: true }` to enable automatic tracing of LLM calls.

3. **Execution Flow**:
   - OpenTelemetry is registered globally
   - A "Hello" message is sent to the OpenAI model
   - The response is logged to `output.log`
   - The tracer is flushed to ensure all traces are exported
   - The process exits cleanly

## Running the Application

```bash
npm start
```

Or with ts-node directly:

```bash
npx ts-node --transpile-only index.ts
```

## Tracing Backend

To view the traces, you need an OTLP-compatible collector running at `http://localhost:4318/v1/traces`. Common options include:

### Jaeger
```bash
docker run -p 4317:4317 -p 4318:4318 -p 16686:16686 jaegertracing/all-in-one:latest
```
Then access the UI at: http://localhost:16686

### OpenTelemetry Collector
See [OTEL Collector documentation](https://opentelemetry.io/docs/collector/) for setup instructions.

## Output

The agent's response is saved to `/home/user/app/output.log` in JSON format, containing:
- `text`: The generated response text
- `finishReason`: Why the generation finished
- `usage`: Token usage information
- `messages`: The full message exchange

## Notes

- The script is designed to run once and exit, making it suitable for testing and demonstrations
- All traces are exported to the configured OTLP endpoint before the process exits
- Error handling ensures the tracer is flushed even if an error occurs
- The OpenTelemetry configuration uses HTTP protocol for OTLP export
- The script requires an OpenAI API key to be configured in the environment

## Environment Variables

Make sure to set the following environment variable:

```bash
OPENAI_API_KEY=your_api_key_here
```

## Troubleshooting

If the script hangs or doesn't export traces:
1. Ensure an OTLP collector is running at `http://localhost:4318/v1/traces`
2. Check that the OpenAI API key is properly configured
3. Verify network connectivity to both OpenAI and the OTLP collector
4. Check the console for any error messages

## Architecture

```
┌─────────────────┐
│   index.ts      │
│                 │
│  OpenTelemetry  │
│  Configuration  │
└────────┬────────┘
         │
         │ Spans
         ▼
┌─────────────────┐
│  OTLP HTTP      │
│  Exporter       │
└────────┬────────┘
         │
         │ HTTP
         ▼
┌─────────────────┐
│  Local OTLP     │
│  Collector      │
│  :4318          │
└─────────────────┘
```