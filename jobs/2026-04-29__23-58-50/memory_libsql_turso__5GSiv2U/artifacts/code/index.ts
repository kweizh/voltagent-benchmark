import VoltAgent, { Agent } from '@voltagent/core';
import { LibSQLMemoryAdapter } from '@voltagent/libsql';
import { openai } from '@ai-sdk/openai';

async function main() {
  const memory = new LibSQLMemoryAdapter({
    url: 'file:memory.db'
  });

  if (typeof memory.init === 'function') {
    await memory.init();
  }

  const agent = new Agent({
    name: 'MemoryAgent',
    instructions: 'You remember things.',
    model: openai('gpt-4o-mini'),
  });

  const app = new VoltAgent({
    agents: {
      memoryAgent: agent
    },
    memory
  });

  await app.ready;
  
  console.log('Agent created successfully.');
  
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
