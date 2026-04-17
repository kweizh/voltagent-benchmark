Agents frequently need to interface with non-standard, proprietary data sources beyond basic vector databases. 

You need to extend VoltAgent's `BaseRetriever` to create a custom retrieval class. This class must fetch contextual user documentation from a mock REST API endpoint (e.g., `/api/v1/docs?query=`) and return the data in a format compatible with VoltAgent's memory system.

**Constraints:**
- The new class MUST inherit directly from `BaseRetriever`.
- Do NOT use a pre-built vector store integration (like Pinecone, Chroma, or standard LibSQLStorage).
- The retriever must handle the network request and format the response into standard stringified context chunks.