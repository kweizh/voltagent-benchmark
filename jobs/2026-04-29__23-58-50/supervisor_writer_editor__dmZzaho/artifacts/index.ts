import { Agent, createWorkflowChain } from "@voltagent/core";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const writerAgent = new Agent({
  name: "Writer",
  model: openai("gpt-4o-mini"),
  instructions: "You are an expert writer. Write a short, engaging article about the provided topic."
});

const editorAgent = new Agent({
  name: "Editor",
  model: openai("gpt-4o-mini"),
  instructions: "You are an expert editor. Improve the grammar, clarity, and tone of the provided drafted article. Return the polished version."
});

const workflow = createWorkflowChain({
  id: "writer-editor-workflow",
  name: "Writer and Editor",
  input: z.object({ topic: z.string() }),
  result: z.object({ finalArticle: z.string() })
})
  .andAgent(
    async ({ data }) => `Write a short article about: ${data.topic}`,
    writerAgent,
    { schema: z.object({ draft: z.string() }) }
  )
  .andAgent(
    async ({ data }) => `Please edit this draft: \n\n${data.draft}`,
    editorAgent,
    { schema: z.object({ finalArticle: z.string() }) }
  )
  .toWorkflow();

async function main() {
  try {
    const result = await workflow.run({ topic: "The Future of AI" });
    if (!result.result) {
      throw new Error("No result returned from workflow");
    }
    fs.writeFileSync("/home/user/myproject/output.txt", result.result.finalArticle);
    
    // Save artifact
    fs.mkdirSync("/logs/artifacts", { recursive: true });
    fs.writeFileSync("/logs/artifacts/output.txt", result.result.finalArticle);
    
    console.log("Done");
    process.exit(0);
  } catch (error) {
    console.error("Error running workflow:", error);
    process.exit(1);
  }
}

main();