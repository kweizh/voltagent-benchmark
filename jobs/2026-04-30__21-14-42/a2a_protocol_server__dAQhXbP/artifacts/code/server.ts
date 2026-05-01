import { VoltAgent, createWorkflowChain, Agent } from '@voltagent/core';
import { honoServer } from '@voltagent/server-hono';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Define the schema for the extracted payload
const PayloadSchema = z.object({
  title: z.string(),
  description: z.string(),
  metadata: z.object({
    category: z.string(),
    priority: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Define the schema for the processor output
const ProcessorOutputSchema = z.object({
  summary: z.string(),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()).optional(),
});

// Create the receiver agent - extracts structured JSON from incoming text
const receiver = new Agent({
  name: 'Receiver Agent',
  model: openai('gpt-4o-mini'),
  instructions: 'You are a data extraction specialist. Extract structured information from incoming text and return it as JSON.',
});

// Create the processor agent - analyzes the extracted payload and generates a summary
const processor = new Agent({
  name: 'Processor Agent',
  model: openai('gpt-4o-mini'),
  instructions: 'You are a data analysis specialist. Analyze the provided JSON payload and generate a comprehensive summary.',
});

// Create a workflow chain that connects receiver to processor
const workflow = createWorkflowChain({
  id: 'process-workflow',
  name: 'Process Workflow',
  purpose: 'Extracts structured data from text and analyzes it',
  input: z.object({ text: z.string() }),
  result: z.object({
    extractedData: PayloadSchema,
    summary: z.string(),
    insights: z.array(z.string()),
    recommendations: z.array(z.string()).optional(),
  }),
})
  .andAgent(
    async ({ data }) => `Extract structured data from this text: "${data.text}"`,
    receiver,
    {
      schema: PayloadSchema,
    }
  )
  .andAgent(
    async ({ data }) => `Analyze this extracted data and generate a summary: ${JSON.stringify(data)}`,
    processor,
    {
      schema: ProcessorOutputSchema,
    }
  )
  .andThen({
    id: 'combine-results',
    execute: async ({ data, getStepData }) => {
      const extractedData = getStepData(0)?.output as z.infer<typeof PayloadSchema>;
      const processedData = getStepData(1)?.output as z.infer<typeof ProcessorOutputSchema>;
      
      return {
        extractedData: extractedData || data,
        summary: processedData?.summary || 'No summary generated',
        insights: processedData?.insights || [],
        recommendations: processedData?.recommendations,
      };
    },
  });

// Create the VoltAgent instance with the workflow and Hono server
const voltAgent = new VoltAgent({
  workflows: { workflow },
  apiKey: process.env.OPENAI_API_KEY,
  server: honoServer({
    port: 3000,
    configureApp: (app) => {
      // Expose the /api/process endpoint that triggers the workflow
      app.post('/api/process', async (c) => {
        try {
          const { text } = await c.req.json();

          if (!text) {
            return c.json({ error: 'Missing required field: text' }, 400);
          }

          // Execute the workflow
          const result = await workflow.run({ text });

          return c.json({
            success: true,
            result: result.result,
          });
        } catch (error) {
          console.error('Error processing request:', error);
          return c.json(
            { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
            500
          );
        }
      });
    },
  }),
});

console.log('Starting VoltAgent A2A Protocol Server on port 3000...');
console.log('Endpoint: http://localhost:3000/api/process');