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
LABEL Description="VoltAgent custom RAG retriever task environment."

RUN mkdir -p /home/user/voltagent-project/src && \
    mkdir -p /home/user/voltagent-project/test && \
    cd /home/user/voltagent-project && \
    cat >package.json <<'EOF'
{
  "name": "voltagent-project",
  "type": "module",
  "dependencies": {
    "@voltagent/core": "^2.7.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "scripts": {
    "test": "vitest run"
  }
}
EOF

RUN cd /home/user/voltagent-project && \
    npm install

RUN cat >/home/user/voltagent-project/test/retriever.test.ts <<'EOF'
import { describe, it, expect, vi } from 'vitest';
import RestApiRetriever from '../src/retriever.js';

describe('RestApiRetriever', () => {
  it('should fetch documents from the REST API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => [{ text: 'Mock document 1' }]
    });
    global.fetch = mockFetch;

    const retriever = new RestApiRetriever({ baseUrl: 'http://api.example.com/docs' });
    const docs = await retriever.retrieve('test query');

    expect(mockFetch).toHaveBeenCalledWith('http://api.example.com/docs?query=test%20query');
    expect(docs).toEqual([{ text: 'Mock document 1' }]);
  });
});
EOF

RUN cat >/home/user/voltagent-project/tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
EOF

# Container contents:
#   - Node.js v24 installed.
#   - /home/user/voltagent-project - VoltAgent project with vitest and @voltagent/core.
#   - /home/user/voltagent-project/test/retriever.test.ts - Test file to verify implementation.

CMD ["/bin/bash", "-c", "trap : TERM INT; sleep infinity & wait"]
