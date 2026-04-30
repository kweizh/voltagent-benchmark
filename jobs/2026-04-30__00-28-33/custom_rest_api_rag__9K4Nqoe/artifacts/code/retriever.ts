import { BaseRetriever } from '@voltagent/core';

export default class RestApiRetriever extends BaseRetriever {
  private baseUrl: string;

  constructor(options: { baseUrl: string; [key: string]: any }) {
    const { baseUrl, ...rest } = options;
    super(rest);
    this.baseUrl = baseUrl;
  }

  async retrieve(query: string): Promise<{ text: string }[]> {
    const url = `${this.baseUrl}?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
}
