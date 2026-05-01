import { createWorkflowChain, andThen } from '@voltagent/core';
import { z } from 'zod';

const inputSchema = z.object({
  value: z.number(),
  operation: z.string()
});

const outputSchema = z.object({
  result: z.number()
});

type InputType = z.infer<typeof inputSchema>;
type OutputType = z.infer<typeof outputSchema>;

const workflow = createWorkflowChain({
  id: 'conditional-operation',
  name: 'Conditional Operation Workflow',
  purpose: 'Applies different operations based on the input operation type',
  input: inputSchema,
  result: outputSchema
})
  .andWhen({
    id: 'double-operation',
    condition: async ({ data }) => (data as InputType).operation === 'double',
    step: andThen({
      id: 'double-execute',
      execute: async ({ data }) => ({ result: (data as InputType).value * 2 })
    })
  })
  .andWhen({
    id: 'square-operation',
    condition: async ({ data }) => (data as InputType).operation === 'square',
    step: andThen({
      id: 'square-execute',
      execute: async ({ data }) => ({ result: (data as InputType).value * (data as InputType).value })
    })
  });

export default workflow;