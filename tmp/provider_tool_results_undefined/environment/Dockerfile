
FROM node:20-bullseye

RUN npm install -g pnpm@8.10.5

RUN mkdir -p /workspace
WORKDIR /workspace

RUN git clone https://github.com/voltagent/voltagent.git
WORKDIR /workspace/voltagent
RUN pnpm install
