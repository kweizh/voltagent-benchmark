import { createWorkflowChain, andWhen } from "@voltagent/core";

type Input = {
  value: number;
  operation: string;
};

type Output = {
  result: number;
};

const workflow = createWorkflowChain<Input, Output>()
  .andWhen((input) => input.operation === "double", (input) => ({
    result: input.value * 2,
  }))
  .andWhen((input) => input.operation === "square", (input) => ({
    result: input.value * input.value,
  }));

export default workflow;
