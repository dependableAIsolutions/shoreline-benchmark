import type { AdapterConfig, CompletionResult, ModelAdapter } from "./types";

interface OpenRouterConfig extends AdapterConfig {
  apiKey: string;
}

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string | Array<{ type: string; text?: string }> } }>;
  usage?: { total_tokens?: number };
}

export class OpenRouterAdapter implements ModelAdapter {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.maxTokens = config.maxTokens ?? 2048;
    this.temperature = config.temperature ?? 0.7;
  }

  getModelId(): string {
    return this.model;
  }

  async complete(prompt: string, systemPrompt?: string): Promise<CompletionResult> {
    const started = Date.now();
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${body}`);
    }

    const json = (await response.json()) as OpenRouterResponse;
    const choice = json.choices?.[0]?.message?.content;
    const content = Array.isArray(choice)
      ? choice
          .map((chunk) => (chunk.type === "text" ? (chunk.text ?? "") : ""))
          .join("")
      : (choice ?? "");

    return {
      content,
      tokensUsed: json.usage?.total_tokens ?? 0,
      latencyMs: Date.now() - started
    };
  }
}
