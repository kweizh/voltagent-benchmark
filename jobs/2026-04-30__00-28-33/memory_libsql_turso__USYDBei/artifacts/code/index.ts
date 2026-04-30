import { VoltAgent, Agent } from '@voltagent/core';
import { LibSQLMemoryAdapter } from '@voltagent/libsql';
import { openai } from '@ai-sdk/openai';

async function main() {
  // Initialize the LibSQL memory adapter
  const memory = new LibSQLMemoryAdapter({
    url: 'file:memory.db',
  });

  // Define the agent
  const agent = new Agent({
    name: 'MemoryAgent',
    instructions: 'You remember things.',
    model: openai('gpt-4o'),
    memory,
  });

  // Initialize VoltAgent with the agent
  const voltAgent = new VoltAgent({
    agents: [agent],
  });

  // Wait for VoltAgent to be ready
  await voltAgent.ready;

  console.log(`Agent "${agent.name}" initialized and registered with VoltAgent.`);
  
  // Ensure the process exits as requested
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to run agent:', err);
  process.exit(1);
});
