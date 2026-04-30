import { BaseRetriever, type BaseRetrieverOptions } from "@voltagent/core";

interface RestApiRetrieverOptions extends BaseRetrieverOptions {
  baseUrl: string;
}

export default class RestApiRetriever extends BaseRetriever {
  private baseUrl: string;

  constructor(options: RestApiRetrieverOptions) {
    const { baseUrl, ...rest } = options;
    super(rest);
    this.baseUrl = baseUrl;
  }

  async retrieve(query: string): Promise<{ text: string }[]> {
    const response = await fetch(
      `${this.baseUrl}?query=${encodeURIComponent(query)}`,
    );

    const data = (await response.json()) as Array<{ text: string }>;

    return data.map((item) => ({ text: item.text }));
  }
}
