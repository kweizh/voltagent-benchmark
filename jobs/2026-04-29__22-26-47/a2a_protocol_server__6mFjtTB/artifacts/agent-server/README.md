# VoltAgent A2A Protocol Server

A TypeScript-based Agent-to-Agent (A2A) protocol server built with VoltAgent and Hono that orchestrates communication between two specialized AI agents.

## Features

- **Receiver Agent**: Extracts structured JSON payloads from incoming text
- **Processor Agent**: Analyzes extracted payloads and generates comprehensive summaries
- **Workflow Chain**: Connects receiver to processor for seamless data processing
- **REST API**: Exposes `/api/process` endpoint for triggering workflows
- **Health Check**: Provides `/health` endpoint for monitoring

## Installation

The project is already set up with all required dependencies:

```bash
cd /home/user/agent-server
npm install
```

## Usage

### Starting the Server

Make sure you have the `OPENAI_API_KEY` environment variable set:

```bash
export OPENAI_API_KEY=your_openai_api_key_here
npx tsx server.ts
```

The server will start on port 3000.

### API Endpoints

#### POST /api/process

Processes text through the agent workflow.

**Request:**
```json
{
  "text": "Your text here that needs to be processed by the agents"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Workflow execution results
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Urgent: Server crash detected at 2024-04-30T10:30:00Z. Multiple services affected including user authentication and payment processing. Priority issue requiring immediate attention."
  }'
```

#### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-04-30T10:30:00.000Z"
}
```

## Architecture

### Agents

1. **Receiver Agent**
   - Model: gpt-4o-mini
   - Purpose: Extract structured JSON from unstructured text
   - Output Schema:
     ```typescript
     {
       title: string;
       content: string;
       tags: string[];
       timestamp: string; // ISO 8601
       priority: 'low' | 'medium' | 'high';
     }
     ```

2. **Processor Agent**
   - Model: gpt-4o-mini
   - Purpose: Analyze extracted payload and generate summary
   - Output: Comprehensive summary with insights, priority assessment, and recommendations

### Workflow

The `data-processing-workflow` chains the two agents:
1. Text → Receiver Agent → Structured JSON
2. Structured JSON → Processor Agent → Summary

## Requirements

- Node.js (v18 or higher)
- TypeScript
- OpenAI API Key

## Dependencies

- `@voltagent/core`: Core VoltAgent framework
- `@voltagent/server-hono`: Hono server integration for VoltAgent
- `@ai-sdk/openai`: OpenAI AI SDK
- `hono`: Fast web framework
- `zod`: Schema validation
- `@hono/node-server`: Node.js server adapter for Hono
- `tsx`: TypeScript execution engine

## Development

The server runs continuously when started and processes requests asynchronously. All logs are output to the console for monitoring.

## Environment Variables

- `OPENAI_API_KEY`: Required for OpenAI model access

## License

ISC