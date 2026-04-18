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
LABEL Description="Node.js environment for VoltAgent multi-agent workflow task."

RUN mkdir -p /home/user/myproject && \
    cd /home/user/myproject && \
    npm init -y && \
    npm install typescript ts-node @types/node --save-dev && \
    npx tsc --init

# Container contents:
#   - Node.js v24 installed
#   - /home/user/myproject - Initialized Node.js project with TypeScript

CMD ["/bin/bash", "-c", "trap : TERM INT; sleep infinity & wait"]
