# VoltAgent Supervisor Writer-Editor Workflow

## Background
VoltAgent is an open-source TypeScript framework for building multi-agent systems. You need to create a multi-agent workflow where a Writer agent drafts an article, and an Editor agent reviews and revises it.

## Requirements
- Create a Writer Agent that takes a topic and writes a short article.
- Create an Editor Agent that takes a drafted article and improves its grammar, clarity, and tone.
- Create a workflow using `createWorkflowChain` that chains the Writer and Editor sequentially.
- Execute the workflow with the topic "The Future of AI" and save the final edited output to `output.txt`.

## Implementation Guide
1. Initialize a Node.js project in `/home/user/myproject` with TypeScript setup.
2. Install `@voltagent/core`, `@ai-sdk/openai`, `dotenv`, and `zod`.
3. Create an `index.ts` file.
4. Instantiate a Writer Agent and an Editor Agent using `Agent` from `@voltagent/core`.
   - Use `openai("gpt-4o-mini")` as the model for both.
5. Build a workflow using `createWorkflowChain()` that first runs the Writer Agent, then passes the result to the Editor Agent.
6. Run the workflow with the initial input text `"The Future of AI"`.
7. Write the final output string to `/home/user/myproject/output.txt`.

## Constraints
- Project path: /home/user/myproject
- Log file: /home/user/myproject/output.txt
- You must use `OPENAI_API_KEY` from the environment variables.
- `index.ts` must call `process.exit(0)` after writing `output.txt`. VoltAgent registers signal handlers / async resources that keep Node's event loop alive; without an explicit exit the script will hang.

## Integrations
- OpenAI