import dotenv from "dotenv";
import { Agent, createWorkflowChain, InMemoryStorage, VoltAgent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { writeFile } from "fs/promises";

// Load environment variables
dotenv.config();

// Create the Writer Agent
const writerAgent = new Agent({
  name: "Writer",
  instructions: "You are a professional writer. Your task is to write a short, engaging article (approximately 300-500 words) about a given topic. The article should be informative, well-structured, and suitable for a general audience. Return your response as a JSON object with an 'article' field containing the article text.",
  llm: new VercelAIProvider(),
  model: openai("gpt-4o-mini"),
  tools: [],
});

// Create the Editor Agent
const editorAgent = new Agent({
  name: "Editor",
  instructions: "You are a professional editor. Your task is to review and improve articles by enhancing grammar, clarity, and tone. Make the article more polished and professional while maintaining the original meaning and structure. Return your response as a JSON object with an 'editedArticle' field containing the improved article text.",
  llm: new VercelAIProvider(),
  model: openai("gpt-4o-mini"),
  tools: [],
});

// Create a workflow chain that runs Writer first, then passes the result to Editor
const workflow = createWorkflowChain({
  id: "writer-editor-workflow",
  name: "Writer-Editor Workflow",
  purpose: "Write and edit an article about a given topic",
  input: z.object({
    topic: z.string(),
  }),
  result: z.object({
    editedArticle: z.string(),
  }),
  memory: new InMemoryStorage(),
})
  .andAgent(
    ({ data }) => `Write a short, engaging article (approximately 300-500 words) about the topic: ${data.topic}`,
    writerAgent,
    { schema: z.object({ article: z.string() }) }
  )
  .andAgent(
    ({ data }) => `Review and improve the following article by enhancing grammar, clarity, and tone:\n\n${data.article}`,
    editorAgent,
    { schema: z.object({ editedArticle: z.string() }) }
  );

// Initialize VoltAgent with the workflow (this sets up the registry)
const voltAgent = new VoltAgent({
  agents: {
    writer: writerAgent,
    editor: editorAgent,
  },
  workflows: {
    writerEditorWorkflow: workflow,
  },
});

// Execute the workflow with the initial input
async function main() {
  try {
    console.log("Starting workflow with topic: 'The Future of AI'");
    
    const result = await workflow.run({
      topic: "The Future of AI",
    });

    console.log("Workflow completed successfully!");
    console.log("\nFinal edited article:");
    console.log("=".repeat(60));
    console.log(result.result.editedArticle);
    console.log("=".repeat(60));

    // Write the final output to output.txt
    await writeFile("/home/user/myproject/output.txt", result.result.editedArticle, "utf-8");
    console.log("\nOutput saved to output.txt");

    // Important: Call process.exit(0) to ensure the script terminates
    // VoltAgent registers signal handlers that keep the event loop alive
    process.exit(0);
  } catch (error) {
    console.error("Error executing workflow:", error);
    process.exit(1);
  }
}

main();
