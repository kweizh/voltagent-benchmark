import { Agent, Memory, VoltAgent } from "@voltagent/core";
import { LibSQLMemoryAdapter } from "@voltagent/libsql";
import { openai } from "@ai-sdk/openai";

async function main() {
  // Create the LibSQL memory adapter backed by a local SQLite file
  const storage = new LibSQLMemoryAdapter({ url: "file:memory.db" });

  // Wrap the adapter in a Memory instance
  const memory = new Memory({ storage });

  // Define the agent with persistent memory
  const agent = new Agent({
    name: "MemoryAgent",
    instructions: "You remember things.",
    model: openai("gpt-4o-mini"),
    memory,
  });

  // Bootstrap VoltAgent (registers signal handlers / async resources)
  const va = new VoltAgent({ agents: { agent } });

  // Wait for VoltAgent to finish initialization before exiting
  await va.ready;

  console.log("MemoryAgent initialized with LibSQL memory at file:memory.db");

  // Exit explicitly so Node's event loop does not hang
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
