import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { Agent, createWorkflowChain } from "@voltagent/core";
import { z } from "zod";
import { writeFile } from "node:fs/promises";

const writerAgent = new Agent({
  name: "Writer",
  model: openai("gpt-4o-mini"),
  instructions: "Write concise, engaging short articles.",
});

const editorAgent = new Agent({
  name: "Editor",
  model: openai("gpt-4o-mini"),
  instructions: "Improve grammar, clarity, and tone while preserving meaning.",
});

const workflow = createWorkflowChain({
  id: "writer-editor",
  name: "Writer to Editor",
  purpose: "Draft an article and polish it.",
  input: z.object({
    topic: z.string(),
  }),
  result: z.object({
    text: z.string(),
  }),
})
  .andAgent(async ({ data }) => `Write a short article about: ${data.topic}`, writerAgent, {
    schema: z.object({
      article: z.string(),
    }),
  })
  .andAgent(
    async ({ data }) =>
      `Improve the grammar, clarity, and tone of the following article without changing its meaning:\n\n${data.article}`,
    editorAgent,
    {
      schema: z.object({
        text: z.string(),
      }),
    },
  );

const main = async () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in the environment.");
  }

  const execution = await workflow.run({ topic: "The Future of AI" });
  if (!execution.result) {
    throw new Error("Workflow did not return a result.");
  }

  await writeFile("/home/user/myproject/output.txt", execution.result.text, "utf-8");
  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
