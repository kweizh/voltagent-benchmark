import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Agent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";

// Initialize MCP clients
const mathClient = new Client({ name: "math-client", version: "1.0.0" }, {
  capabilities: {}
});

const stringClient = new Client({ name: "string-client", version: "1.0.0" }, {
  capabilities: {}
});

// Connect to MCP servers via stdio
const mathTransport = new StdioClientTransport({
  command: "node",
  args: ["/home/user/servers/math-server.js"]
});

const stringTransport = new StdioClientTransport({
  command: "node",
  args: ["/home/user/servers/string-server.js"]
});

// Connect and initialize clients
await mathClient.connect(mathTransport);
await stringClient.connect(stringTransport);

// Retrieve tools from both servers
const mathToolsResult = await mathClient.listTools();
const stringToolsResult = await stringClient.listTools();

// Aggregate tools from both servers
const allTools = [
  ...mathToolsResult.tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
    handler: async (args) => {
      const result = await mathClient.callTool({ name: tool.name, arguments: args });
      return result.content[0].text;
    }
  })),
  ...stringToolsResult.tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
    handler: async (args) => {
      const result = await stringClient.callTool({ name: tool.name, arguments: args });
      return result.content[0].text;
    }
  }))
];

// Create the agent with VercelAIProvider and aggregated tools
const agent = new Agent({
  name: "mcp-agent",
  provider: new VercelAIProvider(),
  tools: allTools
});

// Export the runAgent function
export async function runAgent(prompt) {
  const result = await agent.run(prompt, openai("gpt-4o-mini"));
  return result.text;
}