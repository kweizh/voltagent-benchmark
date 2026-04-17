Advanced use cases often require routing queries to highly specialized sub-agents rather than relying on a single monolithic prompt. 

You need to configure a Supervisor agent that receives a complex drafting request and delegates tasks between a "Writer" sub-agent and an "Editor" sub-agent. The Supervisor must pass the drafted content from the Writer to the Editor, and finally output the polished text.

**Constraints:**
- Must define exactly three distinct `Agent` instances (Supervisor, Writer, Editor).
- The sub-agents must be properly registered so the Supervisor can access them (e.g., as tools or chained delegates).
- The context and output from the Writer must correctly propagate to the Editor.