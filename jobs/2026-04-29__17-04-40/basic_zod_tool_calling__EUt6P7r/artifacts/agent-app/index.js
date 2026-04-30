const { Agent, createTool } = require("@voltagent/core");
const { openai } = require("@ai-sdk/openai");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");

// Define the get_weather tool with Zod schema and .describe() on all fields
const getWeatherTool = createTool({
  name: "get_weather",
  description: "Retrieves the current weather information for a given city.",
  parameters: z.object({
    city: z.string().describe("The name of the city to get weather for"),
    unit: z
      .enum(["celsius", "fahrenheit"])
      .optional()
      .describe(
        "The temperature unit to use. Defaults to celsius if not specified."
      ),
  }),
  execute: async ({ city, unit = "celsius" }) => {
    // Simulated weather data (no real API call needed for this demo)
    const weatherData = {
      city,
      temperature: unit === "celsius" ? 15 : 59,
      unit,
      condition: "Partly cloudy",
      humidity: "72%",
      wind: "12 km/h",
    };
    return weatherData;
  },
});

// Create the Agent using gpt-4o-mini model and the get_weather tool
const agent = new Agent({
  name: "WeatherAgent",
  purpose: "An agent that provides weather information for cities.",
  instructions:
    "You are a helpful weather assistant. Use the get_weather tool to fetch weather data and provide a clear, concise summary to the user.",
  model: openai("gpt-4o-mini"),
  tools: [getWeatherTool],
});

// Main function: invoke the agent and save output to output.json
async function main() {
  console.log("Invoking agent with prompt: 'What is the weather in London?'");

  const result = await agent.generateText("What is the weather in London?");

  const output = {
    prompt: "What is the weather in London?",
    response: result.text,
    toolCalls: result.toolCalls ?? [],
    toolResults: result.toolResults ?? [],
    usage: result.usage ?? null,
    finishReason: result.finishReason ?? null,
  };

  const outputPath = path.join(__dirname, "output.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

  console.log("Output saved to output.json");
  console.log("Agent response:", result.text);
}

main().catch((err) => {
  console.error("Error running agent:", err);
  process.exit(1);
});
