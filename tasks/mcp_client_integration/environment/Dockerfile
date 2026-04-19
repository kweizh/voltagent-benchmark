FROM ubuntu:24.04

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        curl ca-certificates git python3 python3-pip python3-pytest bash && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/user && chmod 0755 /home/user

LABEL Author="any-task-builder"
LABEL Description="VoltAgent MCP Client Integration Environment"

RUN mkdir -p /home/user/app && \
    cd /home/user/app && \
    npm init -y

RUN mkdir -p /home/user/servers && \
    cd /home/user/servers && \
    npm init -y && \
    npm pkg set type="module" && \
    npm install @modelcontextprotocol/sdk && \
    cat > math-server.js <<'EOF'
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({ name: "math", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "multiply",
    description: "Multiply two numbers",
    inputSchema: {
      type: "object",
      properties: { a: { type: "number" }, b: { type: "number" } },
      required: ["a", "b"]
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "multiply") {
    const { a, b } = request.params.arguments;
    return { content: [{ type: "text", text: String(a * b) }] };
  }
  throw new Error("Tool not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);
EOF

RUN cd /home/user/servers && \
    cat > string-server.js <<'EOF'
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({ name: "string", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "reverse",
    description: "Reverse a string",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"]
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "reverse") {
    const { text } = request.params.arguments;
    return { content: [{ type: "text", text: text.split('').reverse().join('') }] };
  }
  throw new Error("Tool not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);
EOF

# Container contents:
#   - Node.js v20 and npm
#   - /home/user/app - initialized npm project
#   - /home/user/servers - two MCP servers (math-server.js, string-server.js) with @modelcontextprotocol/sdk installed

CMD ["/bin/bash", "-c", "trap : TERM INT; sleep infinity & wait"]
