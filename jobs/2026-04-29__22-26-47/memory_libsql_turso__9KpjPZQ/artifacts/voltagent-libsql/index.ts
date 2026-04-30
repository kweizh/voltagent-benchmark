import { Agent } from '@voltagent/core';
import { LibSQLMemoryAdapter } from '@voltagent/libsql';
import { createOpenAI } from '@ai-sdk/openai';

// Create OpenAI provider
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

// Create LibSQL memory adapter
const memoryAdapter = new LibSQLMemoryAdapter({
  url: 'file:memory.db',
});

// Create the agent with LibSQL memory
const agent = new Agent({
  name: 'MemoryAgent',
  instructions: 'You remember things.',
  model: openai('gpt-4o-mini'),
  memory: memoryAdapter,
});

// Exit to prevent hanging
process.exit(0);