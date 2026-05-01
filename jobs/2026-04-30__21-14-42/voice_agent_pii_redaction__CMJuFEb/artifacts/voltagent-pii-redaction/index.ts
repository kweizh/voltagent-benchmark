import { Agent, VoltAgent } from '@voltagent/core';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

/**
 * PII Redaction Agent
 * A VoltAgent that detects and redacts Personally Identifiable Information from transcribed voice text
 */
export const piiRedactionAgent = new Agent({
  name: 'pii-redaction-agent',
  instructions: 'You are a PII detection and redaction system. Your task is to identify and redact Personally Identifiable Information from the given text.',
  model: openai('gpt-4o-mini'),
});

/**
 * Main function to redact PII from input text
 * This is the exported function that can be called programmatically
 * Uses a combination of regex-based detection and AI-based detection
 * 
 * @param input - The input text (simulating transcribed audio)
 * @returns Promise<string> - The redacted text with PII replaced by [REDACTED]
 */
export async function redactPii(input: string): Promise<string> {
  try {
    // Step 1: Apply regex-based detection for structured PII
    let redactedText = input;
    
    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    redactedText = redactedText.replace(emailPattern, '[REDACTED]');
    
    // Phone number pattern
    const phonePattern = /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g;
    redactedText = redactedText.replace(phonePattern, '[REDACTED]');
    
    // SSN pattern
    const ssnPattern = /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g;
    redactedText = redactedText.replace(ssnPattern, '[REDACTED]');
    
    // Credit card pattern
    const creditCardPattern = /\b(?:\d[ -]*?){13,16}\b/g;
    redactedText = redactedText.replace(creditCardPattern, '[REDACTED]');
    
    // Step 2: Use AI to detect names and other PII that's hard to catch with regex
    try {
      const { text: aiRedacted } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: `You are a PII detection and redaction system. Your task is to identify and redact any remaining Personally Identifiable Information from the given text.
        
Rules:
- Identify names (first names, last names, full names) and replace them with [REDACTED]
- Identify addresses and replace them with [REDACTED]
- Identify dates of birth and replace them with [REDACTED]
- Identify any other sensitive personal information and replace it with [REDACTED]
- Keep all other text exactly as is
- Return ONLY the redacted text, no explanations

Text to redact: ${redactedText}`,
        temperature: 0.0,
      });
      
      redactedText = aiRedacted;
    } catch (error) {
      console.error('Error in AI-based PII detection:', error);
      // Continue with regex-based redaction if AI fails
    }
    
    return redactedText;
  } catch (error) {
    console.error('Error in PII redaction:', error);
    throw new Error('Failed to redact PII from input text');
  }
}

/**
 * Standalone PII redaction function that doesn't require AI
 * Useful for simple use cases where you just need regex-based PII redaction
 */
export async function simpleRedactPii(input: string): Promise<string> {
  try {
    // Apply regex-based detection for structured PII
    let redactedText = input;
    
    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    redactedText = redactedText.replace(emailPattern, '[REDACTED]');
    
    // Phone number pattern
    const phonePattern = /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g;
    redactedText = redactedText.replace(phonePattern, '[REDACTED]');
    
    // SSN pattern
    const ssnPattern = /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g;
    redactedText = redactedText.replace(ssnPattern, '[REDACTED]');
    
    // Credit card pattern
    const creditCardPattern = /\b(?:\d[ -]*?){13,16}\b/g;
    redactedText = redactedText.replace(creditCardPattern, '[REDACTED]');
    
    return redactedText;
  } catch (error) {
    console.error('Error in simple PII redaction:', error);
    throw new Error('Failed to redact PII from input text');
  }
}

/**
 * VoltAgent instance for external use
 * This allows the project to be used as a standalone VoltAgent application
 */
export const voltAgent = new VoltAgent({
  agents: {
    piiRedactionAgent
  }
});

// Default export for compatibility
export default {
  redactPii,
  simpleRedactPii,
  piiRedactionAgent,
  voltAgent
};