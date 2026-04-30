# VoltAgent Hooks Observability - Artifacts

## Overview
This task demonstrates VoltAgent Agent Hooks for observability by logging lifecycle events to a file.

## Files

### `code/index.js`
The main script that:
- Defines a `calculate_sum` tool using `createTool`
- Configures an `Agent` with `XSAIProvider` (gpt-4o-mini)
- Attaches four lifecycle hooks: `onStart`, `onToolStart`, `onToolEnd`, `onEnd`
- Each hook appends a specific string to `hooks.log`
- Calls `agent.generateText("Calculate the sum of 15 and 27")`
- Exits with `process.exit(0)` after completion

### `hooks.log`
The generated log file showing all hook invocations during agent execution.

## Key Implementation Notes

- **API Compatibility**: `@voltagent/xsai` was built against `@voltagent/core` v0.1.86 (uses `llm` + `model` options),
  while the top-level installed `@voltagent/core` is v2.7.4 (uses `model` with provider registry).
  The script uses the bundled inner core (`node_modules/@voltagent/xsai/node_modules/@voltagent/core`) to maintain compatibility.

- **Hook Behavior**: The agent makes two LLM calls (multi-step tool use):
  1. First call: LLM decides to use `calculate_sum` tool → fires `onStart` → `onEnd`
  2. Second call: LLM processes tool result → fires `onStart` → `onToolStart` → `onToolEnd` → `onEnd`

## Log Output
```
HOOK: onStart
HOOK: onEnd
HOOK: onStart
HOOK: onToolStart - calculate_sum
HOOK: onToolEnd - calculate_sum
HOOK: onEnd
```
