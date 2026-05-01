import { BaseRetriever } from '@voltagent/core';

interface RestApiRetrieverOptions {
  baseUrl: string;
}

export default class RestApiRetriever extends BaseRetriever {
  private baseUrl: string;

  constructor(options: RestApiRetrieverOptions) {
    super();
    this.baseUrl = options.baseUrl;
  }

  async retrieve(query: string): Promise<{ text: string }[]> {
    const url = `${this.baseUrl}?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
}