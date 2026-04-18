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
