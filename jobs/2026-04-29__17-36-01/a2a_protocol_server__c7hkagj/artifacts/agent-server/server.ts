import { openai } from "@ai-sdk/openai";
import { Agent, VoltAgent, createWorkflowChain } from "@voltagent/core";
import { honoServer } from "@voltagent/server-hono";
import { z } from "zod";

const payloadSchema = z.record(z.any());

const receiver = new Agent({
  name: "receiver",
  model: openai("gpt-4o-mini"),
  instructions:
    "Extract a structured JSON payload from incoming text. Only include facts explicitly present in the text. Return an empty object when no payload is available.",
});

const processor = new Agent({
  name: "processor",
  model: openai("gpt-4o-mini"),
  instructions:
    "Analyze the extracted JSON payload and provide a concise summary of its key information.",
});

const processWorkflow = createWorkflowChain({
  id: "process-payload",
  name: "Process Payload",
  input: z.object({ text: z.string() }),
  result: z.object({
    payload: payloadSchema,
    summary: z.string(),
  }),
})
  .andAgent(
    async ({ data }) =>
      `Extract a structured JSON payload from the text below. Return the result in the payload field only.\n\nText:\n${data.text}`,
    receiver,
    {
      schema: z.object({ payload: payloadSchema }),
    }
  )
  .andAgent(
    async ({ data }) =>
      `Analyze the JSON payload below and provide a concise summary.\n\nPayload:\n${JSON.stringify(data.payload, null, 2)}`,
    processor,
    {
      schema: z.object({ summary: z.string() }),
    },
    (output, context) => ({
      payload: context.data.payload,
      summary: output.summary,
    })
  );

new VoltAgent({
  agents: { receiver, processor },
  workflows: { processWorkflow },
  server: honoServer({
    port: 3000,
    configureApp: (app) => {
      app.post("/api/process", async (c) => {
        const body = await c.req.json();

        if (!body?.text || typeof body.text !== "string") {
          return c.json({ error: "Request body must include a 'text' string." }, 400);
        }

        const result = await processWorkflow.run({ text: body.text });
        return c.json(result);
      });
    },
  }),
});
