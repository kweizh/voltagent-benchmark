import { BaseRetriever, type RetrieverOptions } from "@voltagent/core";

export interface RestApiRetrieverOptions extends RetrieverOptions {
  baseUrl: string;
}

export class RestApiRetriever extends BaseRetriever {
  protected baseUrl: string;

  constructor(options: RestApiRetrieverOptions) {
    const { baseUrl, ...rest } = options;
    super(rest);
    this.baseUrl = baseUrl;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async retrieve(query: string): Promise<Array<{ text: string }>> {
    const url = `${this.baseUrl}?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const docs: Array<{ text: string }> = await response.json();
    return docs;
  }
}

export default RestApiRetriever;
