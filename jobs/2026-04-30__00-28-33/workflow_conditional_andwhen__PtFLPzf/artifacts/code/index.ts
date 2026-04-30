import { createWorkflowChain, andThen } from '@voltagent/core';
import { z } from 'zod';

const workflow = createWorkflowChain({
  id: 'conditional-workflow',
  name: 'Conditional Workflow',
  input: z.object({
    value: z.number(),
    operation: z.string(),
  }),
  result: z.any(),
})
  .andWhen({
    id: 'double-operation',
    condition: async ({ data }) => (data as any).operation === 'double',
    step: andThen({
      id: 'double-step',
      execute: async ({ data }) => ({ result: (data as any).value * 2 }),
    }),
  })
  .andWhen({
    id: 'square-operation',
    condition: async ({ data }) => (data as any).operation === 'square',
    step: andThen({
      id: 'square-step',
      execute: async ({ data }) => ({ result: (data as any).value * (data as any).value }),
    }),
  });

export default workflow;
