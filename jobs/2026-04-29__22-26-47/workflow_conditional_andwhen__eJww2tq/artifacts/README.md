# VoltAgent Conditional Workflow Implementation

## Overview

This implementation demonstrates a VoltAgent workflow using `createWorkflowChain` with conditional logic using `andWhen`.

## Files

- `/home/user/app/index.ts` - Main workflow implementation
- `/home/user/app/demo.ts` - Demonstration of workflow usage
- `/home/user/app/package.json` - Project dependencies

## Implementation Details

### Workflow Structure

The workflow is created using `createWorkflowChain` with the following configuration:

```typescript
const workflow = createWorkflowChain({
  id: "math-operations",
  name: "Math Operations Workflow",
  input: z.object({
    value: z.number(),
    operation: z.string(),
  }),
  result: z.object({
    result: z.number(),
  }),
})
```

### Conditional Logic with `andWhen`

The workflow uses two `andWhen` conditions to execute different operations based on the `operation` field:

1. **Double Operation**: If `operation === 'double'`, multiplies the value by 2
   ```typescript
   .andWhen({
     id: "check-double",
     condition: async ({ data }) => data.operation === 'double',
     step: andThen({
       id: "double",
       execute: async ({ data }) => ({
         ...data,
         result: data.value * 2,
       }),
     }),
   })
   ```

2. **Square Operation**: If `operation === 'square'`, squares the value
   ```typescript
   .andWhen({
     id: "check-square",
     condition: async ({ data }) => data.operation === 'square',
     step: andThen({
       id: "square",
       execute: async ({ data }) => ({
         ...data,
         result: data.value * data.value,
       }),
     }),
   })
   ```

### Key Features

- **Type Safety**: Uses Zod schemas for input and result validation
- **Conditional Execution**: Only executes steps when conditions are met
- **Data Preservation**: Each step preserves the original input data while adding results
- **Default Export**: Workflow is exported as default for easy importing

## Usage

```typescript
import workflow from "./index";

// Double operation
const result1 = await workflow.run({ value: 5, operation: "double" });
// result1.result = 10

// Square operation
const result2 = await workflow.run({ value: 4, operation: "square" });
// result2.result = 16

// Unknown operation (no condition matches)
const result3 = await workflow.run({ value: 10, operation: "unknown" });
// result3 = { value: 10, operation: "unknown" } (unchanged)
```

## Test Results

All test cases pass successfully:

1. **Double operation**: `{ value: 5, operation: 'double' }` → `{ result: 10 }` ✓
2. **Square operation**: `{ value: 4, operation: 'square' }` → `{ result: 16 }` ✓
3. **Unknown operation**: `{ value: 10, operation: 'unknown' }` → unchanged ✓

## Dependencies

- `@voltagent/core` ^2.7.0
- `typescript` ^6.0.3
- `ts-node` ^10.9.2
- `zod` (included with @voltagent/core)

## Notes

- The workflow uses type assertions to handle TypeScript union types created by chaining multiple `andWhen` conditions
- Each step preserves the original input data using spread operator (`...data`)
- Conditions are evaluated asynchronously to match the expected function signature