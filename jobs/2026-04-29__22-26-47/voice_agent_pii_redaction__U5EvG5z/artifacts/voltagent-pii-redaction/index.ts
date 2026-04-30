import { Agent, Tool } from '@voltagent/core';
import { openai } from '@ai-sdk/openai';

// Define the PII redaction agent
const piiRedactionAgent = new Agent({
  name: 'PII Redaction Agent',
  description: 'An agent that detects and redacts Personally Identifiable Information from text',
  model: openai('gpt-4o'),
  tools: [],
  instructions: `You are a PII redaction specialist. Your task is to detect and redact the following types of Personally Identifiable Information (PII) from text:

1. Email addresses - Replace with [REDACTED]
2. Phone numbers - Replace with [REDACTED]
3. Full names - Replace with [REDACTED]

Rules:
- Only redact actual PII, not common words or placeholders
- Preserve the structure and formatting of the original text
- Replace each instance of PII with exactly "[REDACTED]"
- Do not add any additional text or explanations
- Return only the redacted text

Example:
Input: "My name is John Smith and my email is john@example.com. Call me at 555-123-4567."
Output: "My name is [REDACTED] and my email is [REDACTED]. Call me at [REDACTED]."`,
});

// Main redaction function
export async function redactPii(input: string): Promise<string> {
  try {
    const response = await piiRedactionAgent.run(input);
    return response.text;
  } catch (error) {
    console.error('Error redacting PII:', error);
    throw new Error('Failed to redact PII from input text');
  }
}

// Example usage (for testing)
if (require.main === module) {
  (async () => {
    const testInput = 'My name is John Smith and my email is john@example.com. Please call me at 555-123-4567 if you have questions.';
    
    console.log('Original text:', testInput);
    console.log('Redacted text:', await redactPii(testInput));
  })();
}