FROM ubuntu:24.04

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        curl ca-certificates git python3 python3-pip python3-pytest bash && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN pip3 install --break-system-packages chromadb

RUN mkdir -p /home/user && chmod 0755 /home/user

LABEL Author="any-task-builder"
LABEL Description="VoltAgent ChromaDB RAG Integration task environment."

RUN mkdir -p /home/user/project

# Container contents:
#   - Node.js v24 installed
#   - chromadb installed via pip
#   - /home/user/project: base directory for the project

CMD ["/bin/bash", "-c", "chroma run --host 127.0.0.1 --port 8000 & trap : TERM INT; sleep infinity & wait"]
