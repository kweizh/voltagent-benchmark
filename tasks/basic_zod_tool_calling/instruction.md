# VoltAgent Custom Tool with Zod

## Background
VoltAgent provides a code-first approach to agent development. You need to create a simple Node.js script that defines a custom tool with Zod schema descriptions and invokes an agent to use it.

## Requirements
- Initialize a project in `/home/user/agent-app`.
- Install `@voltagent/core`, `zod`, and `@ai-sdk/openai`.
- Create `index.js` that defines a `get_weather` tool using `createTool` from `@voltagent/core`.
- The tool parameters must use Zod's `.describe()` modifier on all fields (e.g., `city: z.string().describe("The name of the city")`).
- Create an `Agent` using the `openai("gpt-4o-mini")` model and the `get_weather` tool.
- The script should invoke the agent with the prompt "What is the weather in London?" and save the resulting JSON to `/home/user/agent-app/output.json`.

## Implementation Guide
1. `mkdir -p /home/user/agent-app && cd /home/user/agent-app`
2. `npm init -y`
3. `npm install @voltagent/core zod @ai-sdk/openai`
4. Write `index.js` to create the tool and agent, run the agent, and write the output to `output.json`.

## Constraints
- Project path: /home/user/agent-app
- Log file: /home/user/agent-app/output.json
- Start command: `node index.js`
