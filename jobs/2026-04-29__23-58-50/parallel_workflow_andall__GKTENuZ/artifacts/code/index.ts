import { createWorkflowChain, andThen, andAgent, Agent } from '@voltagent/core';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const analyzerAgent = new Agent({
  name: "AnalyzerAgent",
  instructions: "You are an expert text analyzer.",
  model: openai('gpt-4o-mini')
});

export const parallelWorkflow = createWorkflowChain({
  id: "parallel-workflow",
  name: "Parallel Workflow",
  purpose: "Demonstrate parallel processing",
  input: z.string(),
  result: z.object({
    analysis1: z.string(),
    analysis2: z.string()
  })
})
.andAll({
  id: "parallel-analysis",
  steps: [
    andThen({
      id: "analysis1",
      name: "Analysis 1",
      purpose: "First analysis step using basic logic",
      execute: async ({ data }) => {
        return { analysis1: `Basic analysis: ${data.length} characters` };
      }
    }),
    andAgent(
      async ({ data }) => `Provide a brief 1-sentence analysis of this text: "${data}"`,
      analyzerAgent,
      { schema: z.object({ analysis2: z.string() }) }
    )
  ]
})
.andThen({
  id: "combine-results",
  name: "Combine Results",
  purpose: "Combine parallel results into a single object",
  execute: async ({ data }) => {
    return Object.assign({}, ...data as any[]);
  }
});
