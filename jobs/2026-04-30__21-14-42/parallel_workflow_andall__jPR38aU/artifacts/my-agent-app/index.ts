import { createWorkflowChain, Agent, andAgent, andAll } from '@voltagent/core';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Create agents for parallel processing
const sentimentAgent = new Agent({
  name: 'Sentiment Analyzer',
  model: openai('gpt-4o-mini'),
  instructions: 'You are a sentiment analysis expert. Analyze the sentiment of the given text and classify it as positive, negative, or neutral. Provide a brief explanation.',
});

const topicAgent = new Agent({
  name: 'Topic Classifier',
  model: openai('gpt-4o-mini'),
  instructions: 'You are a topic classification expert. Identify the main topic of the given text and classify it into a category. Provide relevant keywords.',
});

const summaryAgent = new Agent({
  name: 'Summary Generator',
  model: openai('gpt-4o-mini'),
  instructions: 'You are a skilled summarizer. Create a concise summary of the given text in 2-3 sentences, capturing the main points.',
});

// Create the parallel workflow
export const parallelWorkflow = createWorkflowChain({
  id: 'parallel-analysis-workflow',
  name: 'Parallel Analysis Workflow',
  purpose: 'Perform parallel analysis of input text using multiple AI agents',
  input: z.object({
    text: z.string(),
  }),
  result: z.object({
    sentiment: z.object({
      sentiment: z.enum(['positive', 'negative', 'neutral']),
      explanation: z.string(),
    }),
    topic: z.object({
      topic: z.string(),
      category: z.string(),
      keywords: z.array(z.string()),
    }),
    summary: z.object({
      summary: z.string(),
      wordCount: z.number(),
    }),
  }),
})
  .andAll({
    id: 'parallel-analysis',
    steps: [
      // First parallel agent: Sentiment analysis
      andAgent(
        async ({ data }) => `Analyze sentiment of: ${data.text}`,
        sentimentAgent,
        {
          schema: z.object({
            sentiment: z.enum(['positive', 'negative', 'neutral']),
            explanation: z.string(),
          }),
        }
      ),
      // Second parallel agent: Topic classification
      andAgent(
        async ({ data }) => `Classify topic of: ${data.text}`,
        topicAgent,
        {
          schema: z.object({
            topic: z.string(),
            category: z.string(),
            keywords: z.array(z.string()),
          }),
        }
      ),
      // Third parallel agent: Summary generation
      andAgent(
        async ({ data }) => `Summarize in 2-3 sentences: ${data.text}`,
        summaryAgent,
        {
          schema: z.object({
            summary: z.string(),
            wordCount: z.number(),
          }),
        }
      ),
    ],
  });