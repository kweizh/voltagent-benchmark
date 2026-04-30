import { Agent, VoltAgent } from '@voltagent/core';
import { honoServer } from '@voltagent/server-hono';

const testAgent = new Agent({
  name: 'testAgent',
  instructions: 'You are a test agent.',
});

const app = new VoltAgent({
  agents: [testAgent],
  server: honoServer({
    port: 3000,
    configureApp: (app) => {
      app.get("/api/status", (c) => c.json({ status: "running" }));
    },
  }),
});

console.log('Starting VoltAgent server on port 3000...');
app.start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
