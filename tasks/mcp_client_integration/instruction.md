# VoltAgent MCP Client Integration

## Background
VoltAgent supports the Model Context Protocol (MCP) to connect agents to external tools. You need to set up a VoltAgent application that connects to two local MCP servers (a math server and a string manipulation server) using the `stdio` transport, aggregates their tools, and provides them to a single agent.

## Requirements
- Initialize a Node.js project in `/home/user/app`.
- Install `@voltagent/core`, `@voltagent/vercel-ai`, `@ai-sdk/openai`, and any required MCP packages.
- Two MCP servers are already provided in `/home/user/servers`: `math-server.js` and `string-server.js`.
- Create `/home/user/app/index.js` that:
  1. Configures an MCP client to connect to both `math-server.js` and `string-server.js` via `stdio` (e.g., using `node /home/user/servers/math-server.js`).
  2. Retrieves the tools from both servers.
  3. Creates a VoltAgent `Agent` named `mcp-agent` equipped with these aggregated tools.
  4. Exposes an async function `runAgent(prompt)` that takes a string prompt, runs the agent using `openai("gpt-4o-mini")`, and returns the text response.

## Constraints
- Project path: `/home/user/app`
- MCP Servers path: `/home/user/servers`
- You must use `stdio` transport for the MCP connections.
- Export the `runAgent` function from `index.js` so it can be tested.
- Ensure you handle the asynchronous connection to the MCP servers properly before executing the agent.