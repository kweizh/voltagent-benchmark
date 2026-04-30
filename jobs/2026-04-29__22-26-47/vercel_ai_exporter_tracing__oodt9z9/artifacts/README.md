# VoltAgent Tracing Setup

## Overview
This project demonstrates how to enable OpenTelemetry tracing for a VoltAgent application with Vercel AI SDK integration.

## Implementation Details

### 1. Installed Packages
- `@vercel/otel` - Vercel's OpenTelemetry integration
- `@opentelemetry/auto-instrumentations-node` - Auto-instrumentations for Node.js
- `ai` - Vercel AI SDK (required peer dependency)

### 2. OpenTelemetry Configuration
The application is configured to export traces to a local OTLP HTTP collector at `http://localhost:4318/v1/traces`.

Key components:
- **NodeTracerProvider**: Manages the tracing infrastructure
- **OTLPTraceExporter**: Exports traces to the OTLP endpoint
- **BatchSpanProcessor**: Batches spans for efficient export
- **Resource**: Adds service metadata (name, version)

### 3. VoltAgent Observability
VoltAgent's built-in observability system is configured with:
- Custom span processors for OTLP export
- Automatic flush on finish strategy
- Service name and version attributes

### 4. Agent Configuration
The agent is configured with:
- Model: `openai:gpt-4o-mini`
- Observability integration enabled
- Simple instructions for a helpful assistant

### 5. Main Function Flow
1. Sends "Hello" message to the agent
2. Waits for the response
3. Logs the response to `/home/user/app/output.log`
4. Flushes the tracer to ensure all traces are exported
5. Shuts down observability
6. Calls `process.exit(0)` to prevent hanging

## Files
- `index.ts` - Main application file with telemetry configuration
- `package.json` - Project dependencies
- `output.log` - Agent response output

## Usage
```bash
npm start
```

## Notes
- The script will attempt to export traces to the OTLP collector
- If the collector is not available, the script will log an error but continue to exit cleanly
- The agent response is always logged to `output.log` regardless of trace export success
- The script uses `process.exit(0)` to ensure clean termination, as both VoltAgent and OpenTelemetry SDK can keep the Node.js event loop alive

## Testing
Run the application with:
```bash
npm start
```

Verify that:
1. The agent responds with "Hello! How can I assist you today?"
2. The response is logged to `output.log`
3. The script exits cleanly (no hanging)
4. Traces are exported to the OTLP collector (if available)