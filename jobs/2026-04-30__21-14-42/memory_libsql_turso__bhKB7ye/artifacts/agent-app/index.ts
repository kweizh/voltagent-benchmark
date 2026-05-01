import { Agent, Memory } from '@voltagent/core';
import { LibSQLMemoryAdapter } from '@voltagent/libsql';

// Create the LibSQL memory adapter with the specified URL
const memoryStorage = new LibSQLMemoryAdapter({
  url: 'file:memory.db',
});

// Create a Memory instance with the LibSQL storage adapter
const memory = new Memory({
  storage: memoryStorage,
});

// Create the agent with LibSQL memory
const agent = new Agent({
  name: 'MemoryAgent',
  instructions: 'You remember things.',
  model: 'openai:gpt-4o',
  memory: memory,
});

// Exit to prevent the script from hanging
process.exit(0);