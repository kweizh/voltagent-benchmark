# VoltAgent MCP Client Integration

## Overview
Created a VoltAgent application that connects to two MCP servers (math and string) using stdio transport, aggregates their tools, and provides them to a single agent.

## Files Created
- `/home/user/app/index.js` - Main integration file
- `/logs/artifacts/code/index.js` - Artifact copy

## Implementation Details

### MCP Connections
- **Math Server**: Connects to `/home/user/servers/math-server.js` via stdio
  - Exposes `multiply` tool (takes numbers `a` and `b`, returns product)
- **String Server**: Connects to `/home/user/servers/string-server.js` via stdio
  - Exposes `reverse` tool (takes `text` string, returns reversed string)

### Architecture
1. Creates two MCP clients using `@modelcontextprotocol/sdk/client`
2. Connects to both servers using `StdioClientTransport`
3. Retrieves tools from each server using `listTools()`
4. Aggregates tools into a single array with handlers that call the respective MCP servers
5. Creates a VoltAgent `Agent` named `mcp-agent` with `VercelAIProvider`
6. Exports `runAgent(prompt)` function that runs the agent with `openai("gpt-4o-mini")`

### Usage
```javascript
import { runAgent } from './index.js';

const result = await runAgent("What is 5 times 7?");
console.log(result); // Agent will use multiply tool to calculate 35

const result2 = await runAgent("Reverse the word 'hello'");
console.log(result2); // Agent will use reverse tool to return 'olleh'
```

### Dependencies
All dependencies are already installed with compatible versions:
- `@voltagent/core@^0.1.86`
- `@voltagent/vercel-ai@^1.0.0`
- `@ai-sdk/openai@^2.0.2`
- `ai@^5.0.8`
- `@modelcontextprotocol/sdk@^1.12`
- `zod@^3.25`

## Key Features
- ✅ Async connection handling for MCP servers
- ✅ Tool aggregation from multiple MCP servers
- ✅ Proper error handling through MCP client
- ✅ Uses `VercelAIProvider` (capitalized) as required
- ✅ Compatible with AI SDK v5 + spec v2
- ✅ Uses `gpt-4o-mini` model
- ✅ ES module support (type: "module")