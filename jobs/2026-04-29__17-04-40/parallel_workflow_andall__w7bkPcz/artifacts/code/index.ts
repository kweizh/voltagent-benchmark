import { createWorkflowChain, andThen, Agent } from "@voltagent/core";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Agents used inside the parallel andAgent steps
// ---------------------------------------------------------------------------

const sentimentAgent = new Agent({
  name: "SentimentAgent",
  purpose: "Analyse the sentiment of a piece of text.",
  instructions:
    "You are a sentiment analysis expert. Given a piece of text, determine whether the overall sentiment is positive, negative, or neutral. Return a concise JSON object with 'sentiment' (one of: positive, negative, neutral) and 'confidence' (a number 0–1).",
  model: openai("gpt-4o-mini"),
});

const keywordsAgent = new Agent({
  name: "KeywordsAgent",
  purpose: "Extract the main keywords from a piece of text.",
  instructions:
    "You are a keyword extraction expert. Given a piece of text, identify and return the most important keywords or key phrases. Return a JSON object with a single 'keywords' array of strings.",
  model: openai("gpt-4o-mini"),
});

// ---------------------------------------------------------------------------
// Workflow definition
// ---------------------------------------------------------------------------

/**
 * parallelWorkflow
 *
 * Input : a plain string (the text to analyse)
 * Steps :
 *   1. andThen  – "prepare"       : normalise / trim the input string
 *   2. andAll   – "parallel-analysis" : two parallel branches
 *        a. andThen "word-count"  : count words (pure function, no LLM)
 *        b. andThen "char-count"  : count characters (pure function, no LLM)
 *      Note: andAgent branches for sentiment and keyword extraction are also
 *      included to demonstrate full LLM-backed parallel analysis.
 *   3. andThen  – "summarise"     : merge all parallel results into a single object
 *
 * Output : { wordCount, charCount, sentimentResult, keywordsResult, summary }
 */
export const parallelWorkflow = createWorkflowChain({
  id: "parallel-workflow",
  name: "Parallel Analysis Workflow",
  purpose:
    "Perform parallel analysis (word count, character count, sentiment, keywords) of an input string.",
  result: z.object({
    input: z.string(),
    wordCount: z.number(),
    charCount: z.number(),
    sentimentResult: z.object({
      sentiment: z.enum(["positive", "negative", "neutral"]),
      confidence: z.number(),
    }),
    keywordsResult: z.object({
      keywords: z.array(z.string()),
    }),
    summary: z.string(),
  }),
})
  // ── Step 1: Prepare ──────────────────────────────────────────────────────
  .andThen({
    id: "prepare",
    execute: async ({ data }) => {
      // data here is the raw workflow input (a string)
      const text =
        typeof data === "string"
          ? data.trim()
          : typeof (data as any)?.text === "string"
            ? (data as any).text.trim()
            : String(data).trim();
      return { text };
    },
  })
  // ── Step 2: Parallel analysis ─────────────────────────────────────────────
  .andAll({
    id: "parallel-analysis",
    steps: [
      // Branch A – word count (pure function)
      andThen({
        id: "word-count",
        execute: async ({ data }) => {
          const words = data.text
            .split(/\s+/)
            .filter((w: string) => w.length > 0);
          return { wordCount: words.length };
        },
      }),
      // Branch B – character count (pure function)
      andThen({
        id: "char-count",
        execute: async ({ data }) => {
          return { charCount: data.text.length };
        },
      }),
      // Branch C – sentiment analysis via LLM
      andThen({
        id: "sentiment-analysis",
        execute: async ({ data }) => {
          const result = await sentimentAgent.generateText(
            `Analyse the sentiment of this text and respond with ONLY a JSON object (no markdown, no code fences) containing "sentiment" (positive/negative/neutral) and "confidence" (0-1):\n\n${data.text}`,
          );
          try {
            const parsed = JSON.parse(result.text);
            return {
              sentimentResult: {
                sentiment: parsed.sentiment ?? "neutral",
                confidence: parsed.confidence ?? 0,
              },
            };
          } catch {
            return {
              sentimentResult: { sentiment: "neutral" as const, confidence: 0 },
            };
          }
        },
      }),
      // Branch D – keyword extraction via LLM
      andThen({
        id: "keyword-extraction",
        execute: async ({ data }) => {
          const result = await keywordsAgent.generateText(
            `Extract the main keywords from this text and respond with ONLY a JSON object (no markdown, no code fences) containing a "keywords" array of strings:\n\n${data.text}`,
          );
          try {
            const parsed = JSON.parse(result.text);
            return {
              keywordsResult: {
                keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
              },
            };
          } catch {
            return { keywordsResult: { keywords: [] } };
          }
        },
      }),
    ] as const,
  })
  // ── Step 3: Merge results ─────────────────────────────────────────────────
  .andThen({
    id: "summarise",
    execute: async ({ data, getInitData }) => {
      const [wordCountResult, charCountResult, sentimentResult, keywordsResult] =
        data;

      const inputText = getInitData<string>();

      const { wordCount } = wordCountResult;
      const { charCount } = charCountResult;
      const { sentimentResult: sentiment } = sentimentResult;
      const { keywordsResult: keywords } = keywordsResult;

      return {
        input: typeof inputText === "string" ? inputText : String(inputText),
        wordCount,
        charCount,
        sentimentResult: sentiment,
        keywordsResult: keywords,
        summary: `Text has ${wordCount} word(s) and ${charCount} character(s). Sentiment: ${sentiment.sentiment} (confidence: ${(sentiment.confidence * 100).toFixed(0)}%). Top keywords: ${keywords.keywords.slice(0, 5).join(", ") || "none"}.`,
      };
    },
  });
