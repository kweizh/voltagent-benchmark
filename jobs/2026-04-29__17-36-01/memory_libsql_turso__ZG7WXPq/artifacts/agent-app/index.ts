import { openai } from "@ai-sdk/openai";
import { Agent } from "@voltagent/core";
import { LibSQLMemoryAdapter } from "@voltagent/libsql";

const memory = new LibSQLMemoryAdapter({
  url: "file:memory.db",
});

const agent = new Agent({
  name: "MemoryAgent",
  instructions: "You remember things.",
  model: openai("gpt-4o-mini"),
  memory,
});

const main = async () => {
  await agent.generateText("Remember that my favorite color is blue.");
  process.exit(0);
};

main().catch((error) => {
  console.error("Agent run failed:", error);
  process.exit(1);
});
