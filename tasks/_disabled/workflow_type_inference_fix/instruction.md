# Fix Workflow Type Inference Bug

## Background
VoltAgent users have reported issues where `createWorkflowChain`'s result schemas are not strictly enforced by the TypeScript compiler in complex branching scenarios (Issue #458).

## Requirements
- Read the details in `/workspace/instruction.md`.
- Fix the type definitions for `createWorkflowChain` in the VoltAgent repository located at `/workspace/voltagent`.
- Write or fix the tests to verify the type inference is strictly enforced.

## Constraints
- Project path: /workspace/voltagent
- The fix must only be in TypeScript type definitions and related implementation.
- Do not break existing public APIs.

## Integrations
- None