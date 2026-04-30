import workflow from "./index";

async function runDemo() {
  console.log("=== VoltAgent Conditional Workflow Demo ===\n");

  // Test case 1: Double operation
  console.log("Test 1: Double operation");
  const result1 = await workflow.run({ value: 5, operation: "double" });
  console.log("Input: { value: 5, operation: 'double' }");
  console.log("Output:", result1);
  console.log();

  // Test case 2: Square operation
  console.log("Test 2: Square operation");
  const result2 = await workflow.run({ value: 4, operation: "square" });
  console.log("Input: { value: 4, operation: 'square' }");
  console.log("Output:", result2);
  console.log();

  // Test case 3: Unknown operation (no condition matches)
  console.log("Test 3: Unknown operation");
  const result3 = await workflow.run({ value: 10, operation: "unknown" });
  console.log("Input: { value: 10, operation: 'unknown' }");
  console.log("Output:", result3);
  console.log();
}

runDemo().catch(console.error);