import "dotenv/config";
import { Agent, createWorkflowChain } from "@voltagent/core";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// ── Agents ──────────────────────────────────────────────────────────────────

const writerAgent = new Agent({
  name: "Writer Agent",
  purpose: "Writes a short, engaging article on a given topic.",
  instructions:
    "You are a skilled writer. When given a topic, write a clear, " +
    "well-structured short article (3–5 paragraphs) on that topic. " +
    "Focus on accuracy, engaging prose, and a logical flow of ideas.",
  model: openai("gpt-4o-mini"),
});

const editorAgent = new Agent({
  name: "Editor Agent",
  purpose: "Reviews and improves a drafted article for grammar, clarity, and tone.",
  instructions:
    "You are a meticulous editor. When given a draft article, improve its " +
    "grammar, clarity, and overall tone. Fix any awkward phrasing, correct " +
    "grammatical errors, and ensure the writing is polished and professional. " +
    "Return only the revised article text, without any preamble or commentary.",
  model: openai("gpt-4o-mini"),
});

// ── Workflow ─────────────────────────────────────────────────────────────────

const writerOutputSchema = z.object({ article: z.string() });
const editorOutputSchema = z.object({ editedArticle: z.string() });

const workflow = createWorkflowChain({
  id: "writer-editor-workflow",
  name: "Writer-Editor Workflow",
  purpose: "Draft an article with the Writer Agent, then polish it with the Editor Agent.",
  input: z.object({ topic: z.string() }),
  result: z.object({ editedArticle: z.string() }),
})
  // Step 1: Writer Agent drafts the article
  .andAgent(
    async ({ data }) => `Write a short article about the following topic: ${data.topic}`,
    writerAgent,
    { schema: writerOutputSchema },
  )
  // Step 2: Editor Agent polishes the draft
  .andAgent(
    async ({ data }) =>
      `Please review and improve the following article for grammar, clarity, and tone:\n\n${data.article}`,
    editorAgent,
    { schema: editorOutputSchema },
  );

// ── Run ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Running Writer-Editor workflow with topic: "The Future of AI"…\n');

  const result = await workflow.run({ topic: "The Future of AI" });

  if (result.status !== "completed" || result.result === null) {
    console.error("Workflow did not complete successfully:", result.status, result.error);
    process.exit(1);
  }

  const finalArticle = result.result.editedArticle;
  console.log("── Final Edited Article ─────────────────────────────────────────\n");
  console.log(finalArticle);
  console.log("\n─────────────────────────────────────────────────────────────────");

  const outputPath = path.resolve("output.txt");
  fs.writeFileSync(outputPath, finalArticle, "utf-8");
  console.log(`\n✓ Output written to ${outputPath}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
