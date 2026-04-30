const { Agent, createTool } = require("@voltagent/core");
const { z } = require("zod");
const { openai } = require("@ai-sdk/openai");
const fs = require("fs/promises");

const getWeatherTool = createTool({
  name: "get_weather",
  description: "Get the current weather for a city.",
  parameters: z.object({
    city: z.string().describe("The name of the city"),
    unit: z
      .enum(["celsius", "fahrenheit"])
      .describe("Temperature unit to use")
  }),
  execute: async ({ city, unit }) => {
    const temperatureC = 15;
    const temperatureF = 59;
    const temperature = unit === "fahrenheit" ? temperatureF : temperatureC;

    return {
      city,
      unit,
      temperature,
      condition: "Partly cloudy"
    };
  }
});

const agent = new Agent({
  name: "Weather Agent",
  model: openai("gpt-4o-mini"),
  tools: [getWeatherTool]
});

const outputPath = "/home/user/agent-app/output.json";

async function main() {
  try {
    const result = await agent.generateText("What is the weather in London?");
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    console.log("Saved output to output.json");
  } catch (error) {
    const errorPayload = { error: error?.message || String(error) };
    await fs.writeFile(outputPath, JSON.stringify(errorPayload, null, 2));
    console.error("Failed to run agent:", error);
    process.exitCode = 1;
  }
}

main();
