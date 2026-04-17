The `createWorkflowChain` API allows developers to build complex, declarative, and type-safe AI pipelines without relying on rigid DAG UI tools.

You need to build a multi-step workflow pipeline that takes a single user text input and processes it using the `andAll` operator. The workflow must execute two agents in parallel: a `sentimentAgent` that evaluates the tone, and a `keywordAgent` that extracts core topics. 

**Constraints:**
- Must use `createWorkflowChain` and the `andAll` parallel execution block.
- Both agents must receive the exact same initial text payload simultaneously.
- Do NOT execute the sentiment analysis and keyword extraction sequentially.