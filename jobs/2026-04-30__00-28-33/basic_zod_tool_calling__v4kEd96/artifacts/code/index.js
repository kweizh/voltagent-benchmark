const { createTool, Agent } = require('@voltagent/core');
const { z } = require('zod');
const { openai } = require('@ai-sdk/openai');
const fs = require('fs');
const path = require('path');

// Define the get_weather tool
const getWeatherTool = createTool({
  name: 'get_weather',
  description: 'Get the weather for a given city',
  parameters: z.object({
    city: z.string().describe('The name of the city'),
  }),
  execute: async ({ city }) => {
    // Mock weather data
    return {
      city,
      weather: 'Cloudy',
      temperature: '15°C',
      forecast: 'Possible rain later in the day'
    };
  },
});

async function main() {
  // Create an Agent using gpt-4o-mini and the get_weather tool
  const agent = new Agent({
    model: openai('gpt-4o-mini'),
    tools: [getWeatherTool],
  });

  try {
    // Invoke the agent
    const result = await agent.generateText('What is the weather in London?');

    // Save the resulting JSON to output.json
    const outputPath = path.join(__dirname, 'output.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log('Agent run completed. Output saved to output.json');
  } catch (error) {
    console.error('Error running agent:', error);
    process.exit(1);
  }
}

main();
