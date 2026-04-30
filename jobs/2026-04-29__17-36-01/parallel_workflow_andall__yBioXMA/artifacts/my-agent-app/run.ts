import { writeFile } from "node:fs/promises";
import { parallelWorkflow } from "./index";

const input = "Parallel analysis with VoltAgent.";

const run = async () => {
  const result = await parallelWorkflow.run(input);
  await writeFile(
    new URL("./output.json", import.meta.url),
    JSON.stringify(result, null, 2),
    "utf-8"
  );
  process.exit(0);
};

run().catch(async (error) => {
  await writeFile(
    new URL("./output.json", import.meta.url),
    JSON.stringify({ error: error instanceof Error ? error.message : error }, null, 2),
    "utf-8"
  );
  process.exit(1);
});
