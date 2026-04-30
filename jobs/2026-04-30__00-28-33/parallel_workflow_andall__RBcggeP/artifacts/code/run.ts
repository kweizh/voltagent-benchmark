import { parallelWorkflow } from './index';
import * as fs from 'fs';

async function main() {
  const input = "VoltAgent is a powerful framework for building AI agents.";
  console.log(`Running workflow with input: "${input}"`);
  
  const result = await parallelWorkflow.run(input);
  
  console.log('Workflow completed. Status:', result.status);
  console.log('Result:', JSON.stringify(result.result, null, 2));
  
  // Save the full result object as requested
  fs.writeFileSync('/home/user/my-agent-app/output.json', JSON.stringify(result, null, 2));
  
  process.exit(0);
}

main().catch((err) => {
  console.error('Error running workflow:', err);
  process.exit(1);
});
