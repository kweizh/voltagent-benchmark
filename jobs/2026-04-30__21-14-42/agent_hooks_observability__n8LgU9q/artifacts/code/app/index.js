const fs = require('fs');
const { Agent, tool } = require('@voltagent/core');
const { XSAIProvider } = require('@voltagent/xsai');
const { z } = require('zod');

// Define the calculate_sum tool
const calculateSum = tool({
  name: 'calculate_sum',
  description: 'Calculate the sum of two numbers',
  parameters: z.object({
    a: z.number(),
    b: z.number()
  }),
  execute: async ({ a, b }) => {
    return a + b;
  }
});

// Create the XSAIProvider
const provider = new XSAIProvider({
  apiKey: process.env.OPENAI_API_KEY
});

// Create the agent with hooks
const agent = new Agent({
  provider,
  model: 'openai/gpt-4o-mini',
  tools: [calculateSum],
  hooks: {
    onStart: async () => {
      fs.appendFileSync('/home/user/app/hooks.log', 'HOOK: onStart\n');
    },
    onToolStart: async (args) => {
      const toolName = args.tool?.name || 'calculate_sum';
      fs.appendFileSync('/home/user/app/hooks.log', `HOOK: onToolStart - ${toolName}\n`);
    },
    onToolEnd: async (args) => {
      const toolName = args.tool?.name || 'calculate_sum';
      fs.appendFileSync('/home/user/app/hooks.log', `HOOK: onToolEnd - ${toolName}\n`);
    },
    onEnd: async () => {
      fs.appendFileSync('/home/user/app/hooks.log', 'HOOK: onEnd\n');
    }
  }
});

// Run the agent and exit
agent.generateText('Calculate the sum of 15 and 27')
  .then((result) => {
    console.log('Result:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });