/**
 * VoltAgent Voice Agent PII Redaction
 *
 * This module implements a voice-enabled agent workflow that accepts a transcribed
 * audio string, detects Personally Identifiable Information (PII) such as email
 * addresses, phone numbers, and names, and returns a sanitised version of the text
 * with all PII replaced by "[REDACTED]".
 *
 * The pipeline is built with @voltagent/core and runs entirely in-process —
 * no LLM call is required for the regex-based guardrails, which makes it fast,
 * deterministic, and offline-friendly.
 */

import {
  createWorkflow,
  andThen,
  andGuardrail,
  createOutputGuardrail,
  createEmailRedactorGuardrail,
  createPhoneNumberGuardrail,
  createSensitiveNumberGuardrail,
} from "@voltagent/core";
import { z } from "zod";

// ─── Schemas ─────────────────────────────────────────────────────────────────

/** Input schema: the raw transcribed audio text. */
const InputSchema = z.object({
  transcript: z.string().describe("Raw transcribed audio text"),
});

/** Result schema: the PII-redacted version of the transcript. */
const ResultSchema = z.object({
  redacted: z.string().describe("PII-redacted transcript"),
  piiDetected: z.boolean().describe("Whether any PII was found and redacted"),
});

// ─── PII Patterns ─────────────────────────────────────────────────────────────

/** Matches common Western person-name patterns (two or more Title-Cased words). */
const NAME_PATTERN =
  /\b(?:[A-Z][a-z]{1,20})(?:\s+(?:[A-Z][a-z]{0,20}\.?)){1,3}\b/g;

/** Matches Social Security Numbers in common formats. */
const SSN_PATTERN = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g;

/** Matches credit-card-like 16-digit groups. */
const CREDIT_CARD_PATTERN = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;

/** Matches IPv4 addresses. */
const IP_PATTERN = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

const REPLACEMENT = "[REDACTED]";

// ─── Custom guardrail: Names, SSNs, credit cards, IPs ────────────────────────

/**
 * A VoltAgent output guardrail that uses regex patterns to redact common PII
 * not covered by the built-in guardrails (names, SSNs, credit cards, IPs).
 */
const customPiiGuardrail = createOutputGuardrail({
  id: "custom-pii-redactor",
  name: "Custom PII Redactor",
  description:
    "Redacts person names, SSNs, credit card numbers, and IP addresses.",
  severity: "critical",
  handler: async ({ output }) => {
    if (typeof output !== "string") {
      return { pass: true };
    }

    let sanitized = output
      .replace(SSN_PATTERN, REPLACEMENT)
      .replace(CREDIT_CARD_PATTERN, REPLACEMENT)
      .replace(IP_PATTERN, REPLACEMENT)
      .replace(NAME_PATTERN, REPLACEMENT);

    if (sanitized === output) {
      return { pass: true };
    }

    return {
      pass: true,
      action: "modify" as const,
      modifiedOutput: sanitized,
      message: "PII was detected and redacted.",
    };
  },
});

// ─── Workflow definition ───────────────────────────────────────────────────────

/**
 * The PII-redaction workflow.
 *
 * Step 1 – extract:  Pull the raw transcript out of the workflow input so
 *                    subsequent steps receive a plain string.
 *
 * Step 2 – redact:   Run a guardrail pass using VoltAgent's built-in email,
 *                    phone, and sensitive-number guardrails together with the
 *                    custom name/SSN/card/IP guardrail.  Each guardrail runs
 *                    its handler and, when it finds PII, replaces the match
 *                    with "[REDACTED]" via the "modify" action.
 *
 * Step 3 – wrap:     Package the sanitised string into the ResultSchema shape.
 */
export const piiRedactionWorkflow = createWorkflow(
  {
    id: "pii-redaction-workflow",
    name: "PII Redaction Workflow",
    purpose:
      "Detect and redact PII (emails, phone numbers, names, SSNs, credit cards) from transcribed audio.",
    input: InputSchema,
    result: ResultSchema,
  },

  // Step 1: extract transcript string
  andThen<z.infer<typeof InputSchema>, z.infer<typeof InputSchema>, string>({
    id: "extract-transcript",
    execute: async ({ data }) => data.transcript,
  }),

  // Step 2: apply all PII guardrails
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  andGuardrail<z.infer<typeof InputSchema>, string>({
    id: "pii-guardrail-step",
    outputGuardrails: [
      createEmailRedactorGuardrail({ replacement: REPLACEMENT }) as any,
      createPhoneNumberGuardrail({ replacement: REPLACEMENT }) as any,
      createSensitiveNumberGuardrail({
        replacement: REPLACEMENT,
        minimumDigits: 4,
      }) as any,
      customPiiGuardrail as any,
    ],
  }),

  // Step 3: build the result object
  andThen<z.infer<typeof InputSchema>, string, z.infer<typeof ResultSchema>>({
    id: "build-result",
    execute: async ({ data, getInitData }) => {
      const originalInput = getInitData<z.infer<typeof InputSchema>>();
      const original = originalInput?.transcript ?? "";
      return {
        redacted: data,
        piiDetected: data !== original,
      };
    },
  })
);

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Redact PII from a transcribed audio string.
 *
 * Detects and replaces the following categories of PII with "[REDACTED]":
 *   - Email addresses          (e.g. alice@example.com)
 *   - Phone numbers            (e.g. +1-800-555-0100)
 *   - Long numeric identifiers (e.g. account numbers ≥ 4 digits)
 *   - Social Security Numbers  (e.g. 123-45-6789)
 *   - Credit card numbers      (e.g. 4111 1111 1111 1111)
 *   - IPv4 addresses           (e.g. 192.168.0.1)
 *   - Person names             (two or more Title-Cased words)
 *
 * @param input - The raw transcribed audio text.
 * @returns A promise that resolves to the sanitised string.
 *
 * @example
 * ```ts
 * const clean = await redactPii(
 *   "Hi, I'm John Smith. Reach me at john@example.com or 555-867-5309."
 * );
 * // → "Hi, I'm [REDACTED]. Reach me at [REDACTED] or [REDACTED]."
 * ```
 */
export async function redactPii(input: string): Promise<string> {
  const result = await piiRedactionWorkflow.run({ transcript: input });

  if (result.status !== "completed" || result.result === null) {
    throw new Error(
      `PII redaction workflow failed with status: ${result.status}`
    );
  }

  return result.result.redacted;
}

// ─── CLI entry-point (optional) ───────────────────────────────────────────────

async function main() {
  const samples = [
    "Hi, my name is Jane Doe and my email is jane.doe@example.com.",
    "Please call John Smith at +1-800-555-0199 or 555.867.5309.",
    "My SSN is 123-45-6789 and my card number is 4111 1111 1111 1111.",
    "The server IP is 192.168.1.42, account number 987654321.",
    "No sensitive data here — just a normal sentence.",
  ];

  console.log("=== VoltAgent PII Redaction Demo ===\n");

  for (const sample of samples) {
    try {
      const redacted = await redactPii(sample);
      console.log("ORIGINAL :", sample);
      console.log("REDACTED :", redacted);
      console.log();
    } catch (err) {
      console.error("Error:", err);
    }
  }
}

// Run when executed directly (tsx index.ts)
main()
  .catch(console.error)
  .finally(() => process.exit(0));
