import {
  createDefaultPIIGuardrails,
  createOutputGuardrail,
  createPIIInputGuardrail,
  createWorkflow,
  andThen,
} from "@voltagent/core";
import { z } from "zod";

const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;

const nameRedactionGuardrail = createOutputGuardrail<string>({
  id: "redact-names",
  name: "Redact names",
  description: "Redacts detected name-like sequences.",
  handler: ({ output }) => {
    if (typeof output !== "string") {
      return { pass: true };
    }

    const redacted = output.replace(namePattern, "[REDACTED]");

    if (redacted === output) {
      return { pass: true };
    }

    return {
      pass: true,
      action: "modify",
      modifiedOutput: redacted,
      message: "Redacted name-like sequences.",
    };
  },
});

const piiGuardrails = createDefaultPIIGuardrails({
  email: { replacement: "[REDACTED]" },
  phone: { replacement: "[REDACTED]" },
  sensitiveNumber: { replacement: "[REDACTED]" },
});

const redactWorkflow = createWorkflow(
  {
    id: "pii-redaction",
    name: "PII Redaction Workflow",
    purpose: "Redact PII from transcribed audio text.",
    input: z.string(),
    result: z.string(),
    inputGuardrails: [
      createPIIInputGuardrail({
        replacement: "[REDACTED]",
        maskEmails: true,
        maskPhones: true,
      }),
    ],
    outputGuardrails: [...piiGuardrails, nameRedactionGuardrail],
  },
  andThen({
    id: "return-transcript",
    execute: async ({ data }) => data,
  })
);

export async function redactPii(input: string): Promise<string> {
  return redactWorkflow.run(input);
}
