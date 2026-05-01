import { createTool, Agent } from '@voltagent/core';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import fs from 'fs';

// Create the get_weather tool with Zod schema descriptions
const get_weather = createTool({
  name: 'get_weather',
  description: 'Get the current weather information for a specific city',
  parameters: z.object({
    city: z.string().describe('The name of the city'),
    country: z.string().optional().describe('The country code (e.g., US, UK)'),
    units: z.enum(['metric', 'imperial']).optional().describe('Temperature units: metric (Celsius) or imperial (Fahrenheit)')
  }),
  execute: async ({ city, country, units }) => {
    // Mock weather data for demonstration
    const weatherData = {
      city: city,
      country: country || 'N/A',
      temperature: units === 'imperial' ? 68 : 20,
      condition: 'Partly cloudy',
      humidity: 65,
      windSpeed: 10,
      description: `Weather in ${city}: ${units === 'imperial' ? '68°F' : '20°C'}, Partly cloudy, 65% humidity`
    };
    return weatherData;
  }
});

// Create the agent with the OpenAI model and the get_weather tool
const agent = new Agent({
  name: 'weather-agent',
  model: openai('gpt-4o-mini'),
  tools: [get_weather]
});

// Run the agent with the prompt
async function main() {
  try {
    const response = await agent.generateText('What is the weather in London?');
    
    // Save the output to output.json
    fs.writeFileSync('/home/user/agent-app/output.json', JSON.stringify(response, null, 2), 'utf-8');
    
    console.log('Agent response saved to output.json');
    console.log('Response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();