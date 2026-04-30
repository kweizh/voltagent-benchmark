const { createTool, Agent } = require('@voltagent/core');
const { z } = require('zod');
const { openai } = require('@ai-sdk/openai');

// Define the get_weather tool with Zod schema using .describe() modifiers
const get_weather = createTool({
  name: 'get_weather',
  description: 'Get the current weather information for a specific city',
  parameters: z.object({
    city: z.string().describe('The name of the city'),
    country: z.string().optional().describe('The name of the country (optional)'),
    unit: z.enum(['celsius', 'fahrenheit']).optional().describe('The temperature unit to use (celsius or fahrenheit, default: celsius)')
  }),
  execute: async ({ city, country, unit = 'celsius' }) => {
    // Simulate weather data (in a real scenario, this would call a weather API)
    const weatherData = {
      city: city,
      country: country || 'Unknown',
      temperature: unit === 'celsius' ? 15 : 59,
      condition: 'Partly cloudy',
      humidity: 65,
      wind_speed: 10,
      unit: unit
    };
    
    return weatherData;
  }
});

// Create an Agent with the OpenAI model and the get_weather tool
const agent = new Agent({
  name: 'weather-agent',
  instructions: 'A helpful assistant that can check weather for any city',
  model: openai('gpt-4o-mini'),
  tools: [get_weather]
});

// Run the agent with the prompt
async function runAgent() {
  try {
    const result = await agent.generateText('What is the weather in London?');
    
    // Save the result to output.json
    const fs = require('fs');
    const outputPath = '/home/user/agent-app/output.json';
    
    // Convert result to JSON
    const outputData = {
      text: result.text,
      toolCalls: result.toolCalls,
      usage: result.usage,
      finishReason: result.finishReason
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log('Agent output saved to output.json');
    console.log('Response:', result.text);
  } catch (error) {
    console.error('Error running agent:', error.message);
    
    // Check if it's an API key error
    if (error.message.includes('API key')) {
      console.error('\nPlease set OPENAI_API_KEY environment variable:');
      console.error('export OPENAI_API_KEY=your-api-key-here');
    }
    process.exit(1);
  }
}

runAgent();