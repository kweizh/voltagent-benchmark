# VoltAgent Conditional Workflow with `andWhen`

## Background
VoltAgent provides a declarative API for building multi-step AI workflows. You need to implement a workflow using `createWorkflowChain` that conditionally executes a step using `andWhen`.

## Requirements
- Create a Node.js project in `/home/user/app`.
- Implement a workflow in `index.ts` that takes an input object: `{ value: number, operation: string }`.
- Use `createWorkflowChain` from `@voltagent/core`.
- Use `andWhen` to conditionally execute logic:
  - If `operation === 'double'`, return `{ result: input.value * 2 }`.
  - If `operation === 'square'`, return `{ result: input.value * input.value }`.
- Export the created workflow as the default export.

## Implementation Guide
1. `cd /home/user/app`
2. The project is already initialized with `@voltagent/core` and `typescript` installed.
3. Create `index.ts` and implement the logic.
4. Make sure to export the workflow as `export default workflow;`.

## Constraints
- Project path: /home/user/app
- Use `@voltagent/core` version `2.7.0` or compatible.
- Use `andWhen` for the conditional logic in the workflow chain.