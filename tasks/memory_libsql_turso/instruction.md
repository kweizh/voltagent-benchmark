# VoltAgent with LibSQL Memory

## Background
VoltAgent supports persistent memory using LibSQL. You need to create a simple agent script that utilizes `LibSQLStorage`.

## Requirements
- Initialize a new Node.js project in `/home/user/agent-app`.
- Install `@voltagent/core`, `@ai-sdk/openai`, and any required dependencies for LibSQL.
- Create `index.ts` that defines an `Agent` using `LibSQLStorage` with the URL `file:memory.db`.
- The agent should have the name `MemoryAgent` and instructions `You remember things.`.
- Add a script to `package.json` to run `index.ts` (e.g., using `tsx` or `ts-node`).

## Implementation Guide
1. `mkdir -p /home/user/agent-app && cd /home/user/agent-app`
2. `npm init -y`
3. Install `@voltagent/core`, `@ai-sdk/openai`, `zod`, and `tsx`.
4. Write `index.ts` with the agent definition.

## Constraints
- Project path: `/home/user/agent-app`
- The database file must be created at `/home/user/agent-app/memory.db` after running the agent.
