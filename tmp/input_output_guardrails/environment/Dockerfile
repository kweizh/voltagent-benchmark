FROM ubuntu:24.04

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        curl ca-certificates git python3 python3-pip python3-pytest bash && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/user && chmod 0755 /home/user

LABEL Author="any-task-builder"
LABEL Description="Node.js environment with VoltAgent installed for the guardrails task."

RUN mkdir -p /home/user/voltagent-guardrails && \
    cd /home/user/voltagent-guardrails && \
    npm init -y && \
    npm install @voltagent/core @ai-sdk/openai zod

# Container contents:
#   - Node.js installed
#   - /home/user/voltagent-guardrails — initialized Node project with @voltagent/core, @ai-sdk/openai, and zod

CMD ["/bin/bash", "-c", "trap : TERM INT; sleep infinity & wait"]
