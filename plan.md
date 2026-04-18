### 1. Library Overview
*   **Description**: VoltAgent is an open-source TypeScript framework designed for building, orchestrating, and observing sophisticated AI agents and multi-agent systems. It provides a code-first approach to agent development, bridging the gap between raw LLM calls and rigid no-code platforms.
*   **Ecosystem Role**: It acts as a comprehensive "Agentic OS" for the JS/TS ecosystem, integrating with the Vercel AI SDK for model provider flexibility and offering a dedicated observability platform (VoltOps) for real-time debugging.
*   **Project Setup**:
    ```bash
    # Initialize a new project via CLI
    npm create voltagent-app@latest my-agent-app

    # Select template (optional)
    # npm create voltagent-app@latest -- --example with-nextjs

    cd my-agent-app
    npm install
    # Configure .env with OPENAI_API_KEY or similar
    npm run dev
    ```
### 2. Core Primitives & APIs
*   **`Agent`**: The central class for defining an agent's identity, model, tools, and memory.
    ```typescript
    import { Agent } from "@voltagent/core";
    import { openai } from "@ai-sdk/openai";
    const agent = new Agent({
      name: "Assistant",
      instructions: "You are a helpful assistant.",
      model: openai("gpt-4o-mini"),
      tools: [myTool],
      memory: new LibSQLStorage({ url: "file:memory.db" })
    });
    ```
    *Documentation*: [Agents Guide](https://voltagent.dev/docs/agents/overview)
*   **`VoltAgent`**: The orchestrator that registers agents, workflows, and starts the HTTP/WebSocket server.
    ```typescript
    import { VoltAgent } from "@voltagent/core";
    import { honoServer } from "@voltagent/server-hono";
    new VoltAgent({
      agents: { assistant: agent },
      server: honoServer(),
    });
    ```
*   **`createWorkflowChain`**: A declarative, type-safe API for building multi-step AI pipelines.
    ```typescript
    import { createWorkflowChain, andAgent } from "@voltagent/core";
    const workflow = createWorkflowChain()
      .andThen(async (input) => ({ query: input.text }))
      .andAgent(researchAgent)
      .andAll({
        id: "parallel-tasks",
        steps: [andAgent(writerAgent), andAgent(criticAgent)]
      });
    ```
    *Documentation*: [Workflows Overview](https://voltagent.dev/docs/workflows/overview)
*   **`createTool`**: Define functional capabilities for agents with Zod validation.
    ```typescript
    import { createTool } from "@voltagent/core";
    import { z } from "zod";
    const weatherTool = createTool({
      name: "get_weather",
      description: "Get current weather for a city",
      parameters: z.object({ city: z.string() }),
      execute: async ({ city }) => ({ temp: 22, unit: "celsius" })
    });
    ```
### 3. Real-World Use Cases & Templates
*   **GitHub Repo Analyzer**: A multi-agent system that clones a repository, analyzes its structure, and answers technical questions. [Example Source](https://github.com/voltagent/voltagent/tree/main/examples/github-repo-analyzer)
*   **YouTube to Blog Agent**: Uses a supervisor agent and MCP tools to fetch transcripts and generate formatted blog posts. [Example Source](https://github.com/voltagent/voltagent/tree/main/examples/youtube-to-blog)
*   **WhatsApp Order Agent**: A conversational bot for handling food orders with persistent memory and state management. [Example Source](https://github.com/voltagent/voltagent/tree/main/examples/whatsapp-order-agent)
*   **HR/Support Agents**: Templates for automated screening and ticket resolution using specialized sub-agents.
### 4. Developer Friction Points
*   **Workflow Type Inference**: Users have reported issues where `createWorkflowChain`'s result schemas are not strictly enforced by the TypeScript compiler in complex branching scenarios ([Issue #458](https://github.com/VoltAgent/voltagent/issues/458)).
*   **Structured Output + Tool Calling**: Combining `generateObject` (for JSON output) and tool calling simultaneously can sometimes lead to model confusion or schema validation errors ([Issue #428](https://github.com/VoltAgent/voltagent/issues/428)).
*   **Provider-Specific Tool Results**: Certain providers (like Google Gemini) have had issues where `toolCalls` and `toolResults` are returned as `undefined` in the `generateText` output ([Issue #115](https://github.com/VoltAgent/voltagent/issues/115)).
### 5. Evaluation Ideas
*   **Basic**: Create an agent with a custom tool that uses `z.describe()` for all parameters and verify correct tool calling.
*   **Intermediate**: Build a multi-step workflow using `andAll` to perform parallel analysis of a single input string.
*   **Intermediate**: Implement a "Human-in-the-loop" workflow using the `suspend` and `resume` capabilities.
*   **Advanced**: Configure a Supervisor agent with two specialized sub-agents (e.g., Writer and Editor) and verify context propagation.
*   **Advanced**: Create a custom RAG retriever by extending `BaseRetriever` to fetch data from a non-standard source (e.g., a specific REST API).
*   **Advanced**: Set up an MCP client that connects to multiple local MCP servers and aggregates their tools for a single agent.
*   **Complex**: Implement a voice-enabled agent that handles real-time audio streaming and uses guardrails to redact PII from the transcription.
### 6. Sources
1.  [VoltAgent Documentation](https://voltagent.dev/docs/): Official documentation for the framework.
2.  [VoltAgent GitHub Repository](https://github.com/voltagent/voltagent): Source code, examples, and issue tracker.
3.  [VoltAgent llms.txt](https://voltagent.dev/llms.txt): Compressed technical summary for LLM context.
4.  [VoltAgent Examples Repo](https://github.com/voltagent/voltagent/tree/main/examples): Collection of starter templates and advanced use cases.
5.  [VoltOps Platform](https://console.voltagent.dev/): Observability and monitoring console for VoltAgent.
