import fs from "node:fs";
import path from "node:path";
import { parallelWorkflow } from "./index";

const INPUT_TEXT =
  "VoltAgent is a powerful TypeScript framework for building AI-powered " +
  "multi-agent systems. It provides composable workflow primitives like " +
  "andThen, andAll, andRace and andAgent that make it straightforward to " +
  "orchestrate complex parallel and sequential AI pipelines.";

const OUTPUT_PATH = path.join(__dirname, "output.json");

async function main() {
  console.log("▶ Running parallelWorkflow …");
  console.log(`  Input: "${INPUT_TEXT.substring(0, 60)}…"\n`);

  const execution = await parallelWorkflow.run(INPUT_TEXT);

  console.log("✔ Workflow finished");
  console.log(`  Status : ${execution.status}`);
  console.log(`  Result : ${JSON.stringify(execution.result, null, 2)}\n`);

  const output = {
    executionId: execution.executionId,
    workflowId: execution.workflowId,
    status: execution.status,
    startAt: execution.startAt,
    endAt: execution.endAt,
    input: INPUT_TEXT,
    result: execution.result,
    usage: execution.usage,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");
  console.log(`✔ Output written to ${OUTPUT_PATH}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("✖ Workflow failed:", err);
  process.exit(1);
});
