FROM ubuntu:24.04

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        curl ca-certificates git python3 python3-pip python3-pytest bash \
        build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    npm install -g pnpm@9 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /workspace && chmod 0755 /workspace

LABEL Author="any-task-builder"
LABEL Description="VoltAgent repository for fixing workflow type inference bug."

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PUPPETEER_SKIP_DOWNLOAD=1

RUN git clone https://github.com/VoltAgent/voltagent.git /workspace/voltagent && \
    cd /workspace/voltagent && \
    git checkout main && \
    pnpm install && \
    cat >/workspace/instruction.md <<EOF
# Instruction

The \`createWorkflowChain\` function has a type inference bug in complex branching scenarios.
Your task is to fix the TypeScript definitions in the core package so that the result schemas are strictly enforced.
Once fixed, ensure all tests pass by running \`pnpm run test\` and \`pnpm run typecheck\` from the root directory.
EOF

# Container contents:
#   - Node.js v20 and pnpm v9
#   - /workspace/voltagent — VoltAgent repository cloned and dependencies installed
#   - /workspace/instruction.md — Task instruction

CMD ["/bin/bash", "-c", "trap : TERM INT; sleep infinity & wait"]
