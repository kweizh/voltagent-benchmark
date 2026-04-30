import { createWorkflowChain, Agent, createDefaultPIIGuardrails } from "@voltagent/core";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const piiAgent = new Agent({
    id: "pii-redactor",
    name: "PII Redactor",
    instructions: "You are a PII redaction agent. Replace any Personally Identifiable Information (PII) such as emails, phone numbers, and names with '[REDACTED]'. Return ONLY the redacted text, with no additional commentary.",
    model: openai("gpt-4o-mini"),
    outputGuardrails: createDefaultPIIGuardrails({
        sensitiveNumber: { replacement: "[REDACTED]" },
        email: { replacement: "[REDACTED]" },
        phone: { replacement: "[REDACTED]" }
    })
});

export const piiRedactionWorkflow = createWorkflowChain({
    id: "pii-redaction",
    name: "PII Redaction Workflow",
    purpose: "Redact PII from transcribed audio",
    input: z.object({
        text: z.string(),
    }),
    result: z.object({
        redactedText: z.string(),
    }),
})
.andThen({
    id: "redact",
    execute: async ({ data }) => {
        const result = await piiAgent.generateText(data.text);
        return {
            redactedText: result.text,
        };
    }
});

export async function redactPii(input: string): Promise<string> {
    const result = await piiRedactionWorkflow.run({ text: input });
    if (!result.result) {
        throw new Error("Workflow did not return a result");
    }
    return result.result.redactedText;
}

// Test
if (require.main === module) {
    redactPii("My name is John Doe and my email is john.doe@example.com. Call me at 555-123-4567.")
        .then(res => {
            console.log(res);
            process.exit(0);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}
