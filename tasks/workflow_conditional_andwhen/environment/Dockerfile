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
LABEL Description="VoltAgent project with @voltagent/core installed in /home/user/app."

RUN mkdir -p /home/user/app && \
    cd /home/user/app && \
    npm init -y && \
    npm install @voltagent/core@2.7.0 typescript ts-node @types/node && \
    cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
EOF

# Container contents:
#   - Node.js v24 installed
#   - /home/user/app with @voltagent/core, typescript, ts-node installed

CMD ["/bin/bash", "-c", "trap : TERM INT; sleep infinity & wait"]