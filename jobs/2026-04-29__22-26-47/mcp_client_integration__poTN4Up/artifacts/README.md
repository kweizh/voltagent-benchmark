# VoltAgent MCP Client Integration

## Overview
This implementation creates a VoltAgent application that connects to two local MCP servers using the `stdio` transport and aggregates their tools.

## Structure

### MCP Servers
- **math-server.js** (`/home/user/servers/math-server.js`): Provides a `multiply` tool
- **string-server.js** (`/home/user/servers/string-server.js`): Provides a `reverse` tool

### Application
- **index.js** (`/home/user/app/index.js`): Main application file that:
  1. Connects to both MCP servers via stdio transport
  2. Retrieves tools from both servers
  3. Creates a VoltAgent named `mcp-agent` with aggregated tools
  4. Exports `runAgent(prompt)` function

## Key Features

### MCP Client Setup
```javascript
const mathClient = new Client(
  { name: "math-client", version: "1.0.0" },
  { capabilities: {} }
);
```

### Stdio Transport
```javascript
const mathTransport = new StdioClientTransport({
  command: "node",
  args: ["/home/user/servers/math-server.js"]
});
```

### Tool Conversion
MCP tools are converted to VoltAgent-compatible format with custom execute handlers:
```javascript
function convertMCPToolToVoltAgent(mcpTool, client) {
  return {
    name: mcpTool.name,
    description: mcpTool.description,
    parameters: mcpTool.inputSchema,
    execute: async (args) => {
      const result = await client.callTool({
        name: mcpTool.name,
        arguments: args
      });
      return result.content[0].text;
    }
  };
}
```

### Agent Creation
```javascript
agent = new Agent({
  name: "mcp-agent",
  provider: new VercelAIProvider(openai("gpt-4o-mini")),
  tools: voltAgentTools
});
```

## Usage

```javascript
import { runAgent } from "./index.js";

const result = await runAgent("Multiply 5 by 7");
console.log(result); // 35

const reversed = await runAgent("Reverse the string 'hello'");
console.log(reversed); // olleh
```

## Dependencies
- `@voltagent/core@^0.1.86`
- `@voltagent/vercel-ai@^1.0.0`
- `@ai-sdk/openai@^2.0.2`
- `ai@^5.0.8`
- `@modelcontextprotocol/sdk@^1.12`
- `zod@^3.25`

## Notes
- The application uses ES modules (`"type": "module"` in package.json)
- MCP servers are started via stdio transport using Node.js
- All tools from both servers are aggregated and available to the agent
- The agent uses OpenAI's gpt-4o-mini model via VercelAIProvider