# VoltAgent with LibSQL Memory

## Background
VoltAgent supports persistent memory using LibSQL. You need to create a simple agent script that wires up the LibSQL memory adapter from `@voltagent/libsql` (exported as `LibSQLStorage` in older versions, `LibSQLMemoryAdapter` in current versions — use whichever your installed version provides).

## Requirements
- Initialize a new Node.js project in `/home/user/agent-app`.
- Install `@voltagent/core`, `@voltagent/libsql`, `@ai-sdk/openai`, and any required dependencies for LibSQL.
- Create `index.ts` that defines an `Agent` using the LibSQL memory adapter (`LibSQLStorage` or `LibSQLMemoryAdapter`) with the URL `file:memory.db`.
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
- `index.ts` must call `process.exit(0)` after the work completes. `new VoltAgent(...)` registers signal handlers / async resources that keep Node's event loop alive; without an explicit exit the script will hang forever.
