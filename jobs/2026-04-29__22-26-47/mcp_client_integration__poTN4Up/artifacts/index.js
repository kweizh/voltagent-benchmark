import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Agent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";

// Initialize math server client
const mathClient = new Client(
  { name: "math-client", version: "1.0.0" },
  { capabilities: {} }
);

// Initialize string server client
const stringClient = new Client(
  { name: "string-client", version: "1.0.0" },
  { capabilities: {} }
);

// Connect to both servers via stdio
const mathTransport = new StdioClientTransport({
  command: "node",
  args: ["/home/user/servers/math-server.js"]
});

const stringTransport = new StdioClientTransport({
  command: "node",
  args: ["/home/user/servers/string-server.js"]
});

// Connect and initialize clients
let mathTools = [];
let stringTools = [];

async function initializeClients() {
  await mathClient.connect(mathTransport);
  await stringClient.connect(stringTransport);

  // Get tools from math server
  const mathToolsResponse = await mathClient.listTools();
  mathTools = mathToolsResponse.tools;

  // Get tools from string server
  const stringToolsResponse = await stringClient.listTools();
  stringTools = stringToolsResponse.tools;
}

// Convert MCP tools to VoltAgent tools
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

// Create agent with aggregated tools
let agent;

async function createAgent() {
  await initializeClients();

  // Convert all tools from both servers
  const voltAgentTools = [
    ...mathTools.map(tool => convertMCPToolToVoltAgent(tool, mathClient)),
    ...stringTools.map(tool => convertMCPToolToVoltAgent(tool, stringClient))
  ];

  // Create the agent with VercelAIProvider
  agent = new Agent({
    name: "mcp-agent",
    provider: new VercelAIProvider(openai("gpt-4o-mini")),
    tools: voltAgentTools
  });
}

// Export runAgent function
export async function runAgent(prompt) {
  if (!agent) {
    await createAgent();
  }

  const result = await agent.run(prompt);
  return result;
}