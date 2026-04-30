import { Agent, MCPConfiguration } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";

const mcpConfig = new MCPConfiguration({
  servers: {
    math: {
      type: "stdio",
      command: "node",
      args: ["/home/user/servers/math-server.js"]
    },
    string: {
      type: "stdio",
      command: "node",
      args: ["/home/user/servers/string-server.js"]
    }
  }
});

let agentPromise;

async function getAgent() {
  if (!agentPromise) {
    agentPromise = (async () => {
      const tools = await mcpConfig.getTools();
      return new Agent({
        name: "mcp-agent",
        instructions: "A helpful assistant that can use MCP math and string tools.",
        llm: new VercelAIProvider(),
        model: openai("gpt-4o-mini"),
        tools
      });
    })();
  }

  return agentPromise;
}

export async function runAgent(prompt) {
  const agent = await getAgent();
  const response = await agent.generateText(prompt);
  return response.text;
}
