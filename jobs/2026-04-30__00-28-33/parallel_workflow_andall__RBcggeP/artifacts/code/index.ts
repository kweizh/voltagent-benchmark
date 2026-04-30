import { createWorkflowChain, andThen } from '@voltagent/core';
import { z } from 'zod';

export const parallelWorkflow = createWorkflowChain({
  id: 'parallel-workflow',
  input: z.string(),
})
  .andAll({
    id: 'parallel-analysis',
    steps: [
      andThen({
        id: 'sentiment-analysis',
        execute: async ({ data }) => {
          return { sentiment: `Analyzed sentiment of: ${data}` };
        },
      }),
      andThen({
        id: 'keyword-extraction',
        execute: async ({ data }) => {
          return { keywords: [`Analyzed keywords of: ${data}`] };
        },
      }),
    ],
  });
