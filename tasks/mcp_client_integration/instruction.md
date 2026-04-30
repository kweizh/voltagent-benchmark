# VoltAgent MCP Client Integration

## Background
VoltAgent supports the Model Context Protocol (MCP) to connect agents to external tools. You need to set up a VoltAgent application that connects to two local MCP servers (a math server and a string manipulation server) using the `stdio` transport, aggregates their tools, and provides them to a single agent.

## Requirements
- A Node.js project is already initialized in `/home/user/app` with these pinned, mutually-compatible dependencies installed: `@voltagent/core@^0.1.86`, `@voltagent/vercel-ai@^1.0.0`, `@ai-sdk/openai@^2.0.2`, `ai@^5.0.8`, `@modelcontextprotocol/sdk@^1.12`, `zod@^3.25`. **Do not change these versions** — they are known to be compatible with each other (AI SDK v5 + spec v2) and with `gpt-4o-mini`.
- Two MCP servers are already provided in `/home/user/servers`: `math-server.js` and `string-server.js`.
- Note: `@voltagent/vercel-ai` exports `VercelAIProvider` (capitalized) — use that exact name.
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