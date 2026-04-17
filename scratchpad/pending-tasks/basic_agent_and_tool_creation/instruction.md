VoltAgent relies on heavily typed schemas for robust tool execution and agent identity definition. Properly annotating tool parameters ensures the underlying LLM understands how to interact with the environment.

You need to instantiate a new `Agent` using the `@ai-sdk/openai` provider (`gpt-4o-mini`) and equip it with a custom tool defined via `createTool`. The tool should accept a user's location and a target destination to calculate travel distance, with every parameter explicitly documented to prevent LLM hallucinations. 

**Constraints:**
- Must use the `@voltagent/core` module's `createTool` API.
- Every property in the Zod parameter schema MUST be annotated using `.describe()`.
- The agent must be initialized with an explicit `instructions` string.