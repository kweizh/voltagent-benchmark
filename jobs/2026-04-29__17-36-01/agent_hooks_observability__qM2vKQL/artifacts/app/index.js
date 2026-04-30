const fs = require("fs");
const path = require("path");
const { Agent, createTool } = require("@voltagent/core");
const { XSAIProvider } = require("@voltagent/xsai");
const { z } = require("zod");

const logPath = path.join(__dirname, "hooks.log");

const calculateSumTool = createTool({
  name: "calculate_sum",
  description: "Calculate the sum of two numbers.",
  parameters: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
  execute: async ({ a, b }) => ({
    sum: a + b,
  }),
});

const agent = new Agent({
  name: "sum-agent",
  instructions: "Always use the calculate_sum tool for addition.",
  llm: new XSAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  model: "openai/gpt-4o-mini",
  tools: [calculateSumTool],
  hooks: {
    onStart: async () => {
      fs.appendFileSync(logPath, "HOOK: onStart\n");
    },
    onToolStart: async ({ tool }) => {
      if (tool.name === "calculate_sum") {
        fs.appendFileSync(logPath, "HOOK: onToolStart - calculate_sum\n");
      }
    },
    onToolEnd: async ({ tool }) => {
      if (tool.name === "calculate_sum") {
        fs.appendFileSync(logPath, "HOOK: onToolEnd - calculate_sum\n");
      }
    },
    onEnd: async () => {
      fs.appendFileSync(logPath, "HOOK: onEnd\n");
    },
  },
});

const run = async () => {
  await agent.generateText({
    prompt: "Calculate the sum of 15 and 27",
  });
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
