const { Agent, VoltAgent } = require("@voltagent/core");
const { honoServer } = require("@voltagent/server-hono");
const { openai } = require("@ai-sdk/openai");

// Create a simple VoltAgent agent named testAgent
const testAgent = new Agent({
  name: "testAgent",
  instructions: "A simple test agent",
  model: openai("gpt-4o-mini"),
});

// Initialize VoltAgent with the agent and honoServer
const app = new VoltAgent({
  agents: {
    testAgent,
  },
  server: honoServer({
    port: 3000,
    configureApp: (app) => {
      // Register a custom GET endpoint at /api/status
      app.get("/api/status", (c) => c.json({ status: "running" }));
    },
  }),
});