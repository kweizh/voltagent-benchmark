# VoltAgent Custom Tool with Zod

This project demonstrates creating a custom tool with Zod schema descriptions using VoltAgent.

## Files

- `index.js` - Main script that creates a get_weather tool and runs an agent
- `package.json` - Node.js project configuration
- `output.json` - Output from running the agent with the prompt "What is the weather in London?"

## Implementation Details

### Tool Definition

The `get_weather` tool is created using `createTool` from `@voltagent/core` with:
- Zod schema parameters with `.describe()` modifiers on all fields
- Parameters: city (required), country (optional), unit (optional)
- Simulated weather data execution function

### Agent Configuration

The agent is configured with:
- OpenAI GPT-4o-mini model
- The `get_weather` tool
- Instructions for being a helpful weather assistant

### Usage

Run the script with:
```bash
node index.js
```

The script will:
1. Create the agent with the custom tool
2. Invoke the agent with "What is the weather in London?"
3. Save the result to `output.json`

## Sample Output

The agent successfully:
- Called the `get_weather` tool with city="London", country="UK", unit="celsius"
- Received simulated weather data (15°C, partly cloudy, 65% humidity, 10 km/h wind)
- Generated a natural language response
- Saved complete metadata including tool calls, usage, and finish reason to output.json