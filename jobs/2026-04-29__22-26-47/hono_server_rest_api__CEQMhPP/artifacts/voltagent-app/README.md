# VoltAgent Hono Server with Custom REST API

## Overview
This project demonstrates how to set up a VoltAgent Hono server with a custom REST API endpoint.

## Project Structure
```
voltagent-app/
├── node_modules/
├── package.json
└── index.js
```

## Requirements Met
✅ Node.js project initialized in `/home/user/voltagent-app`
✅ Installed `@voltagent/core` and `@voltagent/server-hono`
✅ Created a simple VoltAgent agent named `testAgent`
✅ Configured the Hono server to listen on port `3000`
✅ Registered a custom GET endpoint at `/api/status` that returns `{"status": "running"}`

## Installation
```bash
cd /home/user/voltagent-app
npm install
```

## Usage
Start the server:
```bash
node index.js
```

The server will start on `http://localhost:3000`

## Testing the Custom Endpoint
```bash
curl http://localhost:3000/api/status
```

Expected response:
```json
{"status":"running"}
```

## Available Endpoints
- `GET /api/status` - Custom endpoint that returns server status
- `GET /agents` - Lists all registered agents (including `testAgent`)
- `GET /ui` - Swagger UI for API documentation

## Agent Configuration
The `testAgent` is configured with:
- Name: `testAgent`
- Instructions: "A simple test agent"
- Model: `gpt-4o-mini` (via OpenAI)

## Server Configuration
- Port: `3000`
- Custom route: `/api/status`
- Swagger UI: Available at `/ui`

## Dependencies
- `@voltagent/core` - Core VoltAgent functionality
- `@voltagent/server-hono` - Hono server implementation
- `@ai-sdk/openai` - OpenAI model provider