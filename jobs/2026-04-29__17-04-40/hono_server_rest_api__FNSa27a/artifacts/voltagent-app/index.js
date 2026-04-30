const { VoltAgent, Agent } = require("@voltagent/core");
const { honoServer } = require("@voltagent/server-hono");

// Define a simple agent
const testAgent = new Agent({
  name: "testAgent",
  instructions: "A simple test agent.",
  model: "openai:gpt-4o", // Model reference (LLM not invoked for this demo)
});

// Initialize VoltAgent with the Hono server on port 3000,
// registering a custom GET /api/status endpoint.
new VoltAgent({
  agents: {
    testAgent,
  },
  server: honoServer({
    port: 3000,
    configureApp: (app) => {
      app.get("/api/status", (c) => c.json({ status: "running" }));
    },
  }),
});
