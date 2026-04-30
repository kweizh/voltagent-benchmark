const { Agent, VoltAgent } = require("@voltagent/core");
const { honoServer } = require("@voltagent/server-hono");

const testAgent = new Agent({
  name: "testAgent",
  instructions: "A simple test agent."
});

new VoltAgent({
  agent: testAgent,
  server: honoServer({
    port: 3000,
    configureApp: (app) => {
      app.get("/api/status", (c) => c.json({ status: "running" }));
    }
  })
});
