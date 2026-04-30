import { Agent, createWorkflowChain } from "@voltagent/core";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

async function main() {
  console.log("Starting main...");
  try {
    const writer = new Agent({
      name: "Writer",
      instructions: "You are a professional writer. Write a short article about the given topic. The output should be plain text.",
      model: openai("gpt-4o-mini"),
    });

    const editor = new Agent({
      name: "Editor",
      instructions: "You are a professional editor. Improve the grammar, clarity, and tone of the provided article. Maintain the original meaning but enhance the quality. The output should be plain text.",
      model: openai("gpt-4o-mini"),
    });

    const workflow = createWorkflowChain({
      id: "writer-editor-workflow",
      name: "Writer-Editor Workflow",
      purpose: "Draft and edit an article sequentially",
      input: z.string(),
      result: z.string(),
    })
      .andThen({
        id: "writer-step",
        execute: async ({ data }) => {
          console.log("Running writer step...");
          const response = await writer.generateText(data);
          console.log("Writer step finished.");
          return response.text;
        },
      })
      .andThen({
        id: "editor-step",
        execute: async ({ data }) => {
          console.log("Running editor step...");
          const response = await editor.generateText(data);
          console.log("Editor step finished.");
          return response.text;
        },
      });

    const topic = "The Future of AI";
    console.log(`Running workflow for topic: "${topic}"...`);
    
    const execution = await workflow.run(topic);
    console.log(`Execution status: ${execution.status}`);
    
    if (execution.status === "completed") {
      const finalOutput = execution.result;
      const outputPath = "/home/user/myproject/output.txt";
      fs.writeFileSync(outputPath, finalOutput as string);
      console.log(`Workflow completed. Output saved to ${outputPath}`);
    } else {
      console.error(`Workflow ended with status: ${execution.status}`);
      if (execution.error) {
        console.error("Error details:", execution.error);
      }
    }
  } catch (error) {
    console.error("Caught error in main:", error);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Unhandled error in main catch:", err);
  process.exit(1);
});
