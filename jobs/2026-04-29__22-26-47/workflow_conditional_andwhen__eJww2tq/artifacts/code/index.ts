import { createWorkflowChain, andThen } from "@voltagent/core";
import { z } from "zod";

const workflow = createWorkflowChain({
  id: "math-operations",
  name: "Math Operations Workflow",
  input: z.object({
    value: z.number(),
    operation: z.string(),
  }),
  result: z.object({
    result: z.number(),
  }),
})
.andWhen({
  id: "check-double",
  condition: async ({ data }) => data.operation === 'double',
  step: andThen({
    id: "double",
    execute: async ({ data }) => {
      const inputData = data as { value: number; operation: string };
      return {
        ...inputData,
        result: inputData.value * 2,
      };
    },
  }),
})
.andWhen({
  id: "check-square",
  condition: async ({ data }) => data.operation === 'square',
  step: andThen({
    id: "square",
    execute: async ({ data }) => {
      const inputData = data as { value: number; operation: string };
      return {
        ...inputData,
        result: inputData.value * inputData.value,
      };
    },
  }),
});

export default workflow;