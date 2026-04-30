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

export async function runAgent(prompt) {
  const tools = await mcpConfig.getTools();
  
  const agent = new Agent({
    name: "mcp-agent",
    llm: new VercelAIProvider(),
    model: openai("gpt-4o-mini"),
    instructions: "You are a helpful assistant.",
    tools: tools
  });
  
  const response = await agent.generateText(prompt);
  return response.text;
}

