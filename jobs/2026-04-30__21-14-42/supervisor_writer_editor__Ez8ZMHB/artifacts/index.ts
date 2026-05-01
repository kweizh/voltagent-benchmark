import { Agent, createWorkflowChain } from '@voltagent/core';
import { openai } from '@ai-sdk/openai';
import 'dotenv/config';
import * as fs from 'fs';
import { z } from 'zod';

// Create Writer Agent
const writerAgent = new Agent({
  name: 'Writer',
  model: openai('gpt-4o-mini'),
  instructions: 'You are a talented writer. When given a topic, write a short, engaging article (approximately 200-300 words) about it. The article should be informative and well-structured.',
});

// Create Editor Agent
const editorAgent = new Agent({
  name: 'Editor',
  model: openai('gpt-4o-mini'),
  instructions: 'You are a skilled editor. Review the provided article and improve its grammar, clarity, and tone. Make the writing more polished and professional while maintaining the original meaning and content.',
});

// Create workflow chain
const workflow = createWorkflowChain({
  id: 'writer-editor-workflow',
  name: 'Writer Editor Workflow',
  result: z.object({
    finalArticle: z.string(),
  }),
})
.andAgent(
  ({ data }) => Promise.resolve(`Write a short article about the topic: ${data}`),
  writerAgent,
  { 
    schema: z.object({
      draftedArticle: z.string(),
    })
  }
)
.andAgent(
  ({ data }) => Promise.resolve(data.draftedArticle),
  editorAgent,
  { 
    schema: z.object({
      finalArticle: z.string(),
    })
  }
);

async function main() {
  try {
    console.log('Starting workflow with topic: "The Future of AI"\n');
    
    // Execute workflow with the topic
    const result = await workflow.run('The Future of AI');
    
    console.log('Final edited output:\n');
    console.log(result.result?.finalArticle);
    
    // Write final output to output.txt
    fs.writeFileSync('/home/user/myproject/output.txt', result.result?.finalArticle || '', 'utf-8');
    console.log('\nOutput saved to output.txt');
    
    // Save artifact copy
    fs.writeFileSync('/logs/artifacts/output.txt', result.result?.finalArticle || '', 'utf-8');
    console.log('Output saved to /logs/artifacts/output.txt');
    
    // Exit to prevent hanging
    process.exit(0);
  } catch (error) {
    console.error('Error during workflow execution:', error);
    process.exit(1);
  }
}

main();
