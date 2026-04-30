"use strict";

const fs = require("fs");
const path = require("path");
const { z } = require("zod");

// Use the @voltagent/core bundled inside @voltagent/xsai (v0.1.86),
// which has the LLM provider API compatible with XSAIProvider.
const { Agent, createTool, createHooks } = require(
  "./node_modules/@voltagent/xsai/node_modules/@voltagent/core/dist/index.js"
);
const { XSAIProvider } = require("@voltagent/xsai");

const LOG_FILE = path.join(__dirname, "hooks.log");

// --- Tool Definition ---
const calculateSumTool = createTool({
  name: "calculate_sum",
  description: "Calculates the sum of two numbers a and b.",
  parameters: z.object({
    a: z.number().describe("The first number"),
    b: z.number().describe("The second number"),
  }),
  execute: async ({ a, b }) => {
    return { result: a + b };
  },
});

// --- Hooks Configuration ---
const hooks = createHooks({
  onStart: async () => {
    fs.appendFileSync(LOG_FILE, "HOOK: onStart\n");
  },
  onToolStart: async ({ tool }) => {
    fs.appendFileSync(LOG_FILE, `HOOK: onToolStart - ${tool.name}\n`);
  },
  onToolEnd: async ({ tool }) => {
    fs.appendFileSync(LOG_FILE, `HOOK: onToolEnd - ${tool.name}\n`);
  },
  onEnd: async () => {
    fs.appendFileSync(LOG_FILE, "HOOK: onEnd\n");
  },
});

// --- Agent Definition ---
const agent = new Agent({
  name: "SumAgent",
  instructions: "An agent that can calculate sums using the calculate_sum tool.",
  llm: new XSAIProvider({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  model: "gpt-4o-mini",
  tools: [calculateSumTool],
  hooks,
});

// --- Main Execution ---
async function main() {
  console.log("Running agent...");
  const result = await agent.generateText(
    "Calculate the sum of 15 and 27"
  );
  console.log("Agent response:", result.text);
  console.log("Log file written to:", LOG_FILE);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
