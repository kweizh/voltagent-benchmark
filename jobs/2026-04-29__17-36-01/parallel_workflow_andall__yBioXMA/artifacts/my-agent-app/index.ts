import { andThen, createWorkflowChain } from "@voltagent/core";
import { z } from "zod";

const countWordsStep = andThen({
  id: "count-words",
  execute: async ({ data }: { data: { input: string } }) => {
    const words = data.input.trim().split(/\s+/).filter(Boolean);
    return { input: data.input, wordCount: words.length };
  },
});

const characterStatsStep = andThen({
  id: "character-stats",
  execute: async ({ data }: { data: { input: string } }) => ({
    input: data.input,
    characterCount: data.input.length,
    hasNumbers: /\d/.test(data.input),
  }),
});

export const parallelWorkflow = createWorkflowChain({
  id: "parallel-workflow",
  name: "Parallel Analysis Workflow",
  purpose: "Analyze an input string in parallel",
  input: z.string(),
  result: z.object({
    input: z.string(),
    analysis: z.object({
      wordCount: z.number(),
      characterCount: z.number(),
      hasNumbers: z.boolean(),
    }),
  }),
})
  .andThen({
    id: "wrap-input",
    execute: async ({ data }) => ({ input: data }),
  })
  .andAll({
    id: "parallel-analysis",
    steps: [countWordsStep, characterStatsStep],
  })
  .andThen({
    id: "combine-results",
    execute: async ({ data }) => {
      const [wordStats, charStats] = data;
      return {
        input: wordStats.input,
        analysis: {
          wordCount: wordStats.wordCount,
          characterCount: charStats.characterCount,
          hasNumbers: charStats.hasNumbers,
        },
      };
    },
  });
