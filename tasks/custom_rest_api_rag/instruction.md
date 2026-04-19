# VoltAgent Custom REST API RAG

## Background
VoltAgent provides a `BaseRetriever` class in `@voltagent/core` that can be extended to create custom RAG retrievers. You have a VoltAgent project initialized at `/home/user/voltagent-project`.

## Requirements
- Create a `RestApiRetriever` class in `src/retriever.ts` that extends `BaseRetriever` from `@voltagent/core`.
- The constructor should accept an options object containing `baseUrl: string` and pass any other options to `super()`.
- Implement the `async retrieve(query: string)` method. It must fetch data from the REST API using `GET ${this.baseUrl}?query=${encodeURIComponent(query)}`.
- The REST API returns a JSON array of objects with a `text` property (e.g., `[{ text: "doc1" }]`).
- The `retrieve` method must return an array of objects, where each object has a `text` property containing the document text.
- Export the `RestApiRetriever` as the default export.

## Constraints
- Project path: `/home/user/voltagent-project`
- Use the native `fetch` API.
- Ensure the code passes the existing test suite. Run `npm test` to verify your implementation.

## Integrations
- None