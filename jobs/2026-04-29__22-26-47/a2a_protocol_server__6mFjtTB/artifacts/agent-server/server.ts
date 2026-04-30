import { VoltAgent, createWorkflowChain, andAgent } from '@voltagent/core';
import { honoServer } from '@voltagent/server-hono';
import { openai } from '@ai-sdk/openai';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { z } from 'zod';

// Define the schema for the structured JSON payload
const PayloadSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  timestamp: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
});

type Payload = z.infer<typeof PayloadSchema>;

// Create the receiver agent that extracts structured JSON from incoming text
const receiverAgent = andAgent({
  name: 'receiver',
  description: 'Extract structured JSON payload from incoming text',
  model: openai('gpt-4o-mini'),
  systemPrompt: `You are a data extraction agent. Your task is to extract structured information from the provided text and return it as a JSON object.
  
The JSON object must have the following structure:
{
  "title": "string - the main title or subject",
  "content": "string - the main content or description",
  "tags": "array of strings - relevant keywords or tags",
  "timestamp": "string - ISO 8601 timestamp",
  "priority": "low|medium|high - priority level"
}

Extract the information accurately and ensure the JSON is valid.`,
});

// Create the processor agent that analyzes the extracted payload and generates a summary
const processorAgent = andAgent({
  name: 'processor',
  description: 'Analyze the extracted payload and generate a summary',
  model: openai('gpt-4o-mini'),
  systemPrompt: `You are a data analysis agent. Your task is to analyze the provided JSON payload and generate a comprehensive summary.

The summary should include:
1. A brief overview of the content
2. Key insights or important points
3. Priority assessment
4. Any recommendations or next steps

Provide a clear, concise, and actionable summary.`,
});

// Create a workflow chain connecting receiver to processor
const processingWorkflow = createWorkflowChain({
  name: 'data-processing-workflow',
  agents: [receiverAgent, processorAgent],
});

// Initialize VoltAgent with Hono server
const app = new Hono();

// Create VoltAgent instance
const voltAgent = new VoltAgent({
  server: honoServer(app),
  workflows: [processingWorkflow],
});

// Expose the /api/process endpoint
app.post('/api/process', async (c) => {
  try {
    const { text } = await c.req.json();
    
    if (!text) {
      return c.json({ error: 'Missing required field: text' }, 400);
    }

    // Execute the workflow
    const result = await voltAgent.executeWorkflow('data-processing-workflow', {
      input: text,
    });

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return c.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// Add a health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start the server on port 3000
const port = 3000;
console.log(`Starting VoltAgent A2A Protocol Server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running on http://localhost:${port}`);
console.log(`Available endpoints:`);
console.log(`  - POST /api/process - Process text through the agent workflow`);
console.log(`  - GET  /health      - Health check endpoint`);