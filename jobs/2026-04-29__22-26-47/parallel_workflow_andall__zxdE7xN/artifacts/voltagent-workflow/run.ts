import { parallelWorkflow } from './index';
import { writeFile } from 'fs/promises';

async function main() {
  try {
    // Execute the workflow with a sample input string
    const result = await parallelWorkflow.run({
      text: 'The new AI-powered features in this application are truly remarkable and will greatly improve productivity for all users.'
    });

    // Save the output to output.json
    await writeFile('/home/user/my-agent-app/output.json', JSON.stringify(result, null, 2));

    console.log('Workflow completed successfully. Output saved to output.json');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error executing workflow:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  // Explicitly exit to prevent hanging due to VoltAgent's signal handlers
  process.exit(0);
}

main();