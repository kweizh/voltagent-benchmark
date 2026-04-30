const { Agent, VoltAgent } = require('@voltagent/core');
const { honoServer } = require('@voltagent/server-hono');

const testAgent = new Agent({
  name: "testAgent",
  description: "A test agent",
  model: { modelId: "dummy" }
});

const app = new VoltAgent({
  agents: [testAgent],
  server: honoServer({
    port: 3000,
    configureApp: (app) => {
      app.get("/api/status", (c) => c.json({ status: "running" }));
    }
  })
});

process.on('unhandledRejection', (err) => {
  console.error("Unhandled Rejection:", err);
});
process.on('uncaughtException', (err) => {
  console.error("Uncaught Exception:", err);
});
