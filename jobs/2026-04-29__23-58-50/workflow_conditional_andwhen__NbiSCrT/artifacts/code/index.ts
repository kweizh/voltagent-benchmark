import { createWorkflowChain, andThen } from '@voltagent/core';
import { z } from 'zod';

const workflow = createWorkflowChain({
  id: 'math-workflow',
  name: 'Math Workflow',
  input: z.object({
    value: z.number(),
    operation: z.string()
  }),
  result: z.object({
    result: z.number().optional()
  })
})
.andWhen({
  id: 'double-operation',
  condition: async ({ data }: { data: any }) => data.operation === 'double',
  step: andThen({
    id: 'double-step',
    execute: async ({ data }: { data: any }) => {
      return { result: data.value * 2 };
    }
  })
})
.andWhen({
  id: 'square-operation',
  condition: async ({ data }: { data: any }) => data.operation === 'square',
  step: andThen({
    id: 'square-step',
    execute: async ({ data }: { data: any }) => {
      return { result: data.value * data.value };
    }
  })
});

export default workflow;
