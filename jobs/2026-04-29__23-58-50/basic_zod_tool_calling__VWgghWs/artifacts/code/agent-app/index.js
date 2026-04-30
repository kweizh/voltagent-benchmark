const { createTool, Agent } = require('@voltagent/core');
const { z } = require('zod');
const { openai } = require('@ai-sdk/openai');
const fs = require('fs');

async function main() {
  const get_weather = createTool({
    name: 'get_weather',
    description: 'Get the current weather in a given city',
    parameters: z.object({
      city: z.string().describe("The name of the city"),
    }),
    execute: async ({ city }) => {
      console.log(`Getting weather for ${city}...`);
      return { weather: 'sunny', temperature: 22, city };
    }
  });

  const agent = new Agent({
    name: "WeatherAgent",
    instructions: "You are a helpful weather assistant.",
    model: openai("gpt-4o-mini"),
    tools: [get_weather],
  });

  const response = await agent.generateText("What is the weather in London?");

  fs.writeFileSync('/home/user/agent-app/output.json', JSON.stringify(response, null, 2));
  console.log("Output saved to output.json");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
