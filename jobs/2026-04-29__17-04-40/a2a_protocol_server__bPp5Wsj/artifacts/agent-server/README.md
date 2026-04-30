# VoltAgent A2A Protocol Server

## Project Structure

```
/home/user/agent-server/
├── server.ts         # Main server entry point
├── tsconfig.json     # TypeScript configuration
└── package.json      # Node.js project manifest
```

## Agents

### `receiver`
- **Model:** `gpt-4o-mini`
- **Role:** Extracts structured JSON payload from raw incoming text
- **Output schema:** `{ topic, entities[], intent, rawText }`

### `processor`
- **Model:** `gpt-4o-mini`
- **Role:** Analyzes the extracted payload and generates a human-readable summary
- **Output schema:** `{ summary, keyPoints[], confidence }`

## Workflow Chain

```
Input (text)
  └── andAgent (receiver) → extracts { topic, entities, intent, rawText }
        └── andAgent (processor) → produces { summary, keyPoints, confidence }
              └── andThen (combine-outputs) → shapes final result
```

The `andAgent` map functions carry accumulated data through each step so every
agent has access to all previously produced outputs.

## API

### `POST /api/process`

Triggers the A2A workflow and returns the combined output synchronously.

**Request:**
```json
{ "text": "Your raw text content here" }
```

**Response (200):**
```json
{
  "success": true,
  "workflowId": "a2a-receiver-processor",
  "executionId": "exec_...",
  "status": "completed",
  "data": {
    "extracted": {
      "topic": "...",
      "entities": ["..."],
      "intent": "...",
      "rawText": "..."
    },
    "analysis": {
      "summary": "...",
      "keyPoints": ["..."],
      "confidence": "high"
    }
  }
}
```

## Running

```bash
cd /home/user/agent-server
OPENAI_API_KEY=<your-key> npx tsx server.ts
```

The server starts on **port 3000**. The VoltOps console is available at
`http://localhost:3000/ui` and the Swagger docs at `http://localhost:3000/doc`.
