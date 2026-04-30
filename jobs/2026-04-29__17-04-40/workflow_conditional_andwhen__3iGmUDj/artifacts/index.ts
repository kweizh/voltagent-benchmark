import { createWorkflowChain, andThen } from "@voltagent/core";
import { z } from "zod";

const inputSchema = z.object({
  value: z.number(),
  operation: z.string(),
});

const resultSchema = z.object({
  result: z.number(),
});

const workflow = createWorkflowChain({
  id: "conditional-operation-workflow",
  name: "Conditional Operation Workflow",
  input: inputSchema,
  result: resultSchema,
})
  .andWhen({
    id: "double-step",
    condition: async ({ data }) =>
      (data as { operation?: string }).operation === "double",
    step: andThen({
      id: "do-double",
      execute: async ({ data }) => {
        const d = data as { value: number; operation: string };
        return { result: d.value * 2 };
      },
    }),
  })
  .andWhen({
    id: "square-step",
    condition: async ({ data }) =>
      (data as { operation?: string }).operation === "square",
    step: andThen({
      id: "do-square",
      execute: async ({ data }) => {
        const d = data as { value: number; operation: string };
        return { result: d.value * d.value };
      },
    }),
  });

export default workflow;
