FROM ubuntu:24.04

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        curl ca-certificates git python3 python3-pip python3-pytest bash && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/user && chmod 0755 /home/user

LABEL Author="any-task-builder"
LABEL Description="VoltAgent environment with Vercel AI SDK tracing setup"

RUN mkdir -p /home/user/app && \
    cd /home/user/app && \
    npm init -y && \
    npm install typescript ts-node @types/node --save-dev && \
    npm install @voltagent/core @ai-sdk/openai && \
    cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
EOF

RUN cd /home/user/app && \
    cat > package.json <<'EOF'
{
  "name": "voltagent-tracing-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.ts",
  "scripts": {
    "start": "ts-node index.ts"
  },
  "dependencies": {
    "@ai-sdk/openai": "^0.0.40",
    "@voltagent/core": "latest"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.0.0"
  }
}
EOF

RUN cd /home/user/app && \
    cat > index.ts <<'EOF'
import { Agent } from "@voltagent/core";
import { openai } from "@ai-sdk/openai";

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini")
});

async function main() {
  const result = await agent.run({ input: "Hello" });
  console.log(result);
}

main().catch(console.error);
EOF

CMD ["/bin/bash", "-c", "trap : TERM INT; sleep infinity & wait"]
