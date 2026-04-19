# VoltAgent A2A Protocol Server

## Background
VoltAgent is a TypeScript framework for orchestrating AI agents. Your task is to build a complex Agent-to-Agent (A2A) protocol server using VoltAgent and Hono. The server will orchestrate communication between two specialized agents.

## Requirements
- Initialize a Node.js project in `/home/user/agent-server`.
- Install `@voltagent/core`, `@voltagent/server-hono`, `@ai-sdk/openai`, `zod`, and `hono`.
- Create a `server.ts` that sets up a VoltAgent instance with a Hono server.
- Define two agents: `receiver` and `processor` using `gpt-4o-mini`.
- The `receiver` agent should be responsible for extracting a structured JSON payload from incoming text.
- The `processor` agent should analyze the extracted payload and generate a summary.
- Create a workflow chain that connects `receiver` to `processor`.
- Expose an endpoint `/api/process` that triggers this workflow.

## Implementation Guide
1. Run `npm init -y` and install the required dependencies.
2. In `server.ts`, define the agents and the workflow using `createWorkflowChain` and `andAgent`.
3. Configure `VoltAgent` with the `honoServer()` and register the workflow.
4. Start the server on port 3000.

## Constraints
- Project path: /home/user/agent-server
- Start command: `npx tsx server.ts`
- Port: 3000
- The server must run continuously when started.
- Use the OPENAI_API_KEY environment variable.

## Integrations
- None