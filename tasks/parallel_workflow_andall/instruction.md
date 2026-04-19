# VoltAgent Parallel Workflow

## Background
VoltAgent is a TypeScript framework for AI agents. You need to build a multi-step workflow using `andAll` to perform parallel analysis of a single input string.

## Requirements
- You have an empty directory at `/home/user/my-agent-app`.
- Initialize a Node.js project there and install `@voltagent/core` and `@ai-sdk/openai`.
- Create an `index.ts` file that exports a workflow named `parallelWorkflow`.
- The workflow must use `createWorkflowChain()`.
- It should have an `andAll` step with ID `parallel-analysis` containing at least two parallel steps (e.g. `andAgent` or `andThen`).
- Provide a script `run.ts` that executes this workflow with an input string and saves the output to `/home/user/my-agent-app/output.json`.

## Implementation Guide
1. `cd /home/user/my-agent-app`
2. Run `npm init -y` and `npm install @voltagent/core @ai-sdk/openai typescript @types/node tsx`.
3. Create `index.ts` with the workflow definition.
4. Create `run.ts` to execute the workflow and write to `output.json`.
5. Run `npx tsx run.ts` to generate `output.json`.

## Constraints
- Project path: /home/user/my-agent-app
- Log file: /home/user/my-agent-app/output.json
- The workflow must use `andAll`.

## Integrations
- OpenAI