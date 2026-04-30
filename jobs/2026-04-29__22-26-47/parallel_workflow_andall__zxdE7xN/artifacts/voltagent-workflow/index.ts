import { createWorkflowChain, andThen } from '@voltagent/core';
import { z } from 'zod';

export const parallelWorkflow = createWorkflowChain({
  id: 'parallel-analysis-workflow',
  name: 'Parallel Analysis Workflow',
  purpose: 'Perform parallel analysis of input text',
  input: z.object({
    text: z.string()
  }),
  result: z.object({
    sentiment: z.string(),
    topic: z.string()
  })
})
.andAll({
  id: 'parallel-analysis',
  steps: [
    andThen({
      id: 'sentiment-analysis',
      execute: async ({ data }) => {
        // Simulate sentiment analysis
        return { 
          sentiment: 'positive'
        };
      }
    }),
    andThen({
      id: 'topic-categorization',
      execute: async ({ data }) => {
        // Simulate topic categorization
        return { 
          topic: 'Technology'
        };
      }
    })
  ]
})
.andThen({
  id: 'combine-results',
  execute: async ({ data }) => {
    // data is an array: [{ sentiment }, { topic }]
    return {
      sentiment: data[0].sentiment,
      topic: data[1].topic
    };
  }
});