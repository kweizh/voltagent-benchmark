const { Agent, VoltAgent } = require('@voltagent/core');
const { honoServer } = require('@voltagent/server-hono');

// Define a basic VoltAgent agent
const testAgent = new Agent({
  name: 'testAgent',
  instructions: 'You are a helpful assistant.'
});

// Initialize VoltAgent with the agent and Hono server
const agent = new VoltAgent({
  agent: testAgent,
  server: honoServer({
    port: 3000,
    configureApp: (app) => {
      // Register custom GET endpoint at /api/status
      app.get('/api/status', (c) => c.json({ status: 'running' }));
    }
  })
});

// Start the server
agent.start().then(() => {
  console.log('VoltAgent server is running on port 3000');
  console.log('Test the /api/status endpoint at http://localhost:3000/api/status');
}).catch((error) => {
  console.error('Failed to start server:', error);
});