import { parallelWorkflow } from './index';
import fs from 'fs';
import path from 'path';

async function main() {
  const inputText = "The new AI-powered application has transformed how we handle customer service. Our response times have improved by 60%, and customer satisfaction scores have reached an all-time high. The automation features allow our team to focus on complex issues while routine inquiries are handled efficiently by the system.";

  console.log('Running parallel workflow with input:', inputText);
  console.log('');

  try {
    // Execute the workflow
    const result = await parallelWorkflow.run({ text: inputText });

    console.log('Workflow completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('');

    // Save output to JSON file
    const outputPath = path.join(__dirname, 'output.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`Output saved to: ${outputPath}`);

    // Explicitly exit to prevent hanging
    process.exit(0);
  } catch (error) {
    console.error('Error executing workflow:', error);
    process.exit(1);
  }
}

main();