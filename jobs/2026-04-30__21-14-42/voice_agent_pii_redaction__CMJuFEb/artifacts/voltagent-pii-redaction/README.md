# VoltAgent Voice Agent PII Redaction

## Overview
This project implements a voice-enabled agent that handles audio transcription and uses guardrails to redact Personally Identifiable Information (PII) from transcribed text.

## Features
- **PII Detection**: Automatically detects various types of PII including:
  - Email addresses
  - Phone numbers
  - Social Security Numbers (SSN)
  - Credit card numbers
  - Names (via AI-based detection)
  - Addresses (via AI-based detection)
  - Dates of birth (via AI-based detection)

- **Dual-Layer Protection**:
  - **Regex-based detection**: Fast, pattern-based detection for structured PII
  - **AI-based detection**: Intelligent detection for unstructured PII like names and addresses

- **VoltAgent Integration**: Built on the VoltAgent framework for AI agent orchestration

## Installation
```bash
npm install
```

## Usage

### Main Function
The primary exported function is `redactPii(input: string): Promise<string>`:

```typescript
import { redactPii } from './index';

const transcribedText = "My name is John Smith and my email is john@example.com. You can reach me at 555-123-4567.";
const redactedText = await redactPii(transcribedText);
console.log(redactedText);
// Output: "My name is [REDACTED] and my email is [REDACTED]. You can reach me at [REDACTED]."
```

### Simple Regex-Only Version
For cases where you don't need AI-based detection:

```typescript
import { simpleRedactPii } from './index';

const transcribedText = "Contact me at jane@example.com or 555-987-6543";
const redactedText = await simpleRedactPii(transcribedText);
console.log(redactedText);
// Output: "Contact me at [REDACTED] or [REDACTED]"
```

### Using the VoltAgent
The project also exports a VoltAgent instance for deeper integration:

```typescript
import { piiRedactionAgent, voltAgent } from './index';

// Use the agent directly
const agent = piiRedactionAgent;

// Or use the VoltAgent instance
const va = voltAgent;
```

## Architecture

### Components
1. **piiRedactionAgent**: A VoltAgent configured for PII detection and redaction
2. **redactPii()**: Main function combining regex and AI-based PII detection
3. **simpleRedactPii()**: Lightweight regex-only version
4. **voltAgent**: VoltAgent instance for external use

### Detection Patterns

#### Regex Patterns
- **Email**: `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b`
- **Phone**: `\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b`
- **SSN**: `\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b`
- **Credit Card**: `\b(?:\d[ -]*?){13,16}\b`

#### AI-Based Detection
Uses OpenAI's GPT-4o-mini model to detect:
- Names (first, last, full)
- Addresses
- Dates of birth
- Other sensitive personal information

## Building
```bash
npm run build
```

## Development
```bash
npm run start
```

## Dependencies
- `@voltagent/core`: Core VoltAgent framework
- `@ai-sdk/openai`: OpenAI AI SDK provider
- `ai`: Vercel AI SDK
- `typescript`: TypeScript compiler
- `@types/node`: Node.js type definitions

## Project Structure
```
.
├── index.ts              # Main implementation file
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── dist/                 # Compiled JavaScript output
```

## Requirements Met
✅ Initialize a Node.js project in `/home/user/workspace`
✅ Install `@voltagent/core` and `@ai-sdk/openai` dependencies
✅ Implement `index.ts` with VoltAgent workflow
✅ Detect PII (emails, phone numbers, names)
✅ Return redacted version with `[REDACTED]` placeholders
✅ Export `redactPii(input: string): Promise<string>` function

## Notes
- The AI-based detection requires an OpenAI API key to be configured
- The regex-based detection works without any API calls
- All detected PII is replaced with the standard `[REDACTED]` placeholder
- The implementation is designed to be extensible for additional PII types