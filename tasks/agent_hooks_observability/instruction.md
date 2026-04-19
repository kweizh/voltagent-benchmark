# Agent Hooks Observability

## Background
VoltAgent provides Agent Hooks to intercept specific points in the agent execution pipeline for observability, logging, and behavior modification. You need to create an agent that uses these hooks to log its execution stages to a file.

## Requirements
- Initialize a Node.js project in `/home/user/app`.
- Install `@voltagent/core`, `@voltagent/xsai`, and `zod`.
- Create a tool named `calculate_sum` that takes two numbers `a` and `b` and returns their sum.
- Create an agent using `XSAIProvider` (with model `gpt-4o-mini`) and configure it with the `calculate_sum` tool.
- Configure the agent with the following hooks, each appending a specific string to `/home/user/app/hooks.log` (including a newline):
  - `onStart`: Append `HOOK: onStart\n`
  - `onToolStart`: Append `HOOK: onToolStart - calculate_sum\n`
  - `onToolEnd`: Append `HOOK: onToolEnd - calculate_sum\n`
  - `onEnd`: Append `HOOK: onEnd\n`
- Write a script `index.js` that initializes this agent and calls `agent.generateText({ prompt: "Calculate the sum of 15 and 27" })`.
- Run the script so that the agent executes the tool and triggers the hooks.

## Implementation Guide
1. `mkdir -p /home/user/app && cd /home/user/app`
2. `npm init -y`
3. `npm install @voltagent/core @voltagent/xsai zod`
4. Create `index.js` with the agent definition, tool definition, and hook configuration.
5. Ensure `OPENAI_API_KEY` is passed from the environment to `XSAIProvider`.
6. Run `node index.js` to generate the log file.

## Constraints
- Project path: `/home/user/app`
- Log file: `/home/user/app/hooks.log`
- Use `fs.appendFileSync` or similar to write to the log file.
- Do not hardcode the sum result; let the agent use the tool to calculate it.

## Integrations
- OpenAI