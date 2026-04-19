# VoltAgent Hono Server with Custom REST API

## Background
VoltAgent uses `@voltagent/server-hono` to serve its HTTP APIs. It allows developers to register custom REST API routes via the `configureApp` callback.

## Requirements
- Initialize a Node.js project in `/home/user/voltagent-app`.
- Install `@voltagent/core` and `@voltagent/server-hono`.
- Create a simple VoltAgent agent named `testAgent`.
- Configure the Hono server to listen on port `3000`.
- Register a custom GET endpoint at `/api/status` that returns `{"status": "running"}`.

## Implementation Guide
1. Create a directory `/home/user/voltagent-app` and initialize a Node.js project.
2. Install the required packages: `npm install @voltagent/core @voltagent/server-hono`.
3. Create an `index.js` file.
4. Define a basic agent using `Agent` from `@voltagent/core`.
5. Initialize `VoltAgent` with the agent and `honoServer`.
6. In `honoServer`, set `port: 3000` and use `configureApp: (app) => { app.get("/api/status", (c) => c.json({ status: "running" })); }` to add the `/api/status` route.

## Constraints
- Project path: `/home/user/voltagent-app`
- Start command: `node index.js`
- Port: `3000`

## Integrations
- None