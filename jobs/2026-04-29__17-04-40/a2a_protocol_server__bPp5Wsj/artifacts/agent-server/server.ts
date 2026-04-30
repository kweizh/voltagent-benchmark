import { VoltAgent, Agent, createWorkflowChain } from "@voltagent/core";
import { honoServer } from "@voltagent/server-hono";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Agent definitions
// ---------------------------------------------------------------------------

/**
 * Receiver agent
 * Responsible for extracting a structured JSON payload from raw incoming text.
 */
const receiverAgent = new Agent({
  name: "receiver",
  instructions: `You are a data-extraction specialist.
Your sole job is to read the incoming text and extract a structured JSON payload from it.
Always return your result as a valid JSON object with the following fields:
- "topic": a short label for the subject (string)
- "entities": an array of key names or objects mentioned (string[])
- "intent": the apparent purpose or action requested (string)
- "rawText": the original text you received (string)

Return ONLY the JSON object, no extra commentary.`,
  model: openai("gpt-4o-mini"),
});

/**
 * Processor agent
 * Responsible for analyzing the extracted payload and generating a human-readable summary.
 */
const processorAgent = new Agent({
  name: "processor",
  instructions: `You are an analytical summarizer.
You will receive a structured JSON payload produced by a data-extraction step.
Your job is to analyze that payload and return a concise, human-readable summary of the data.
Always return your result as a JSON object with the following fields:
- "summary": a one-paragraph plain-English description of what the data represents (string)
- "keyPoints": an array of the most important bullet-point observations (string[])
- "confidence": your confidence level in the extraction quality ("high" | "medium" | "low")

Return ONLY the JSON object, no extra commentary.`,
  model: openai("gpt-4o-mini"),
});

// ---------------------------------------------------------------------------
// Workflow schemas
// ---------------------------------------------------------------------------

const workflowInputSchema = z.object({
  text: z.string().describe("The raw incoming text to process"),
});

const extractedPayloadSchema = z.object({
  topic: z.string(),
  entities: z.array(z.string()),
  intent: z.string(),
  rawText: z.string(),
});

const processorOutputSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
});

const workflowResultSchema = z.object({
  extracted: extractedPayloadSchema,
  analysis: processorOutputSchema,
});

// Intermediate shape that carries both outputs through the chain
const intermediateSchema = z.object({
  // Original input
  text: z.string(),
  // Filled in after receiver step
  extracted: extractedPayloadSchema.optional(),
  // Filled in after processor step
  analysis: processorOutputSchema.optional(),
});

// ---------------------------------------------------------------------------
// A2A Workflow chain: receiver → processor
// ---------------------------------------------------------------------------

const a2aWorkflow = createWorkflowChain({
  id: "a2a-receiver-processor",
  name: "A2A Receiver → Processor Workflow",
  purpose:
    "Orchestrate two agents in sequence: receiver extracts structured data from text, processor analyses it and produces a summary.",
  input: workflowInputSchema,
  result: workflowResultSchema,
})
  // Step 1 – Receiver agent: extract structured JSON from the raw text.
  // The map function merges the agent output back with the accumulated data so
  // the processor step can access both the original text and the extraction.
  .andAgent(
    async ({ data }) =>
      `Extract structured information from the following text:\n\n${data.text}`,
    receiverAgent,
    { schema: extractedPayloadSchema },
    // map: (agentOutput, context) => merged data for next step
    (extracted, { data }) => ({
      text: data.text,
      extracted,
    })
  )
  // Step 2 – Processor agent: analyse the extracted payload and summarise.
  .andAgent(
    async ({ data }) =>
      `Analyse this extracted payload and provide a summary:\n\n${JSON.stringify(data.extracted, null, 2)}`,
    processorAgent,
    { schema: processorOutputSchema },
    // map: merge analysis result with everything gathered so far
    (analysis, { data }) => ({
      ...data,
      analysis,
    })
  )
  // Step 3 – Shape the final result to match workflowResultSchema.
  .andThen({
    id: "combine-outputs",
    execute: async ({ data }) => {
      const { extracted, analysis } = data as {
        text: string;
        extracted: z.infer<typeof extractedPayloadSchema>;
        analysis: z.infer<typeof processorOutputSchema>;
      };

      return { extracted, analysis };
    },
  });

// ---------------------------------------------------------------------------
// VoltAgent bootstrap
// ---------------------------------------------------------------------------

new VoltAgent({
  agents: {
    receiver: receiverAgent,
    processor: processorAgent,
  },
  workflows: {
    a2aWorkflow,
  },
  server: honoServer({
    port: 3000,
    configureApp: (app) => {
      /**
       * POST /api/process
       *
       * Body: { "text": "<raw text to process>" }
       *
       * Triggers the A2A workflow synchronously and returns the full result.
       */
      app.post("/api/process", async (c) => {
        try {
          const body = await c.req.json<{ text?: string }>();
          const text = body?.text;

          if (!text || typeof text !== "string" || text.trim() === "") {
            return c.json(
              {
                success: false,
                error: 'Request body must include a non-empty "text" field.',
              },
              400
            );
          }

          const result = await a2aWorkflow.run({ text: text.trim() });

          return c.json({
            success: true,
            workflowId: result.workflowId,
            executionId: result.executionId,
            status: result.status,
            data: result.result,
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Internal server error";
          console.error("[/api/process] Error:", err);
          return c.json({ success: false, error: message }, 500);
        }
      });
    },
  }),
});
