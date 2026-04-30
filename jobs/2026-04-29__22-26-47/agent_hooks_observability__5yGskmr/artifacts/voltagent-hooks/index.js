const { Agent, tool } = require('@voltagent/core');
const { z } = require('zod');
const fs = require('fs');

const LOG_FILE = '/home/user/app/hooks.log';

// Define the calculate_sum tool
const calculate_sum = tool({
  name: 'calculate_sum',
  description: 'Calculate the sum of two numbers',
  parameters: z.object({
    a: z.number().describe('The first number'),
    b: z.number().describe('The second number')
  }),
  execute: async ({ a, b }) => {
    return a + b;
  }
});

// Clear the log file at the start
if (fs.existsSync(LOG_FILE)) {
  fs.unlinkSync(LOG_FILE);
}

// Create the agent with model string
const agent = new Agent({
  name: 'Calculator',
  model: 'openai/gpt-4o-mini',
  tools: [calculate_sum],
  hooks: {
    onStart: () => {
      fs.appendFileSync(LOG_FILE, 'HOOK: onStart\n');
    },
    onToolStart: ({ tool }) => {
      fs.appendFileSync(LOG_FILE, `HOOK: onToolStart - calculate_sum\n`);
    },
    onToolEnd: ({ tool }) => {
      fs.appendFileSync(LOG_FILE, `HOOK: onToolEnd - calculate_sum\n`);
    },
    onEnd: () => {
      fs.appendFileSync(LOG_FILE, 'HOOK: onEnd\n');
    }
  }
});

// Run the agent
async function main() {
  try {
    const result = await agent.generateText('Calculate the sum of 15 and 27');
    console.log('Agent result:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

main();