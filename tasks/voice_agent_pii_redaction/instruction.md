# VoltAgent Voice Agent PII Redaction

## Background
VoltAgent provides a code-first approach to building agents. You need to implement a voice-enabled agent that handles audio transcription and uses guardrails to redact Personally Identifiable Information (PII) from the transcribed text.

## Requirements
- Initialize a Node.js project in `/home/user/workspace`.
- Install `@voltagent/core` and any necessary AI SDK providers (e.g., `@ai-sdk/openai`).
- Implement a script `index.ts` that defines a VoltAgent workflow.
- The workflow should take an input string (simulating transcribed audio), detect PII (like emails, phone numbers, and names), and return a redacted version of the text (replacing PII with `[REDACTED]`).
- Provide a function `redactPii(input: string): Promise<string>` exported from `index.ts`.

## Constraints
- Project path: `/home/user/workspace`
- Use `npm` for package management.
- Use `@voltagent/core` to orchestrate the agent.
- Export the `redactPii` function so it can be tested programmatically.