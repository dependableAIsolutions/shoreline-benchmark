import type { AdapterConfig, CompletionResult, ModelAdapter } from "./types";

interface LMStudioConfig extends AdapterConfig {
  baseUrl?: string;
}

interface LMStudioResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { total_tokens?: number };
}

export class LMStudioAdapter implements ModelAdapter {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(config: LMStudioConfig) {
    this.baseUrl = config.baseUrl ?? "http://localhost:1234/v1";
    this.model = config.model;
    this.maxTokens = config.maxTokens ?? 2048;
    this.temperature = config.temperature ?? 0.7;
  }

  getModelId(): string {
    return this.model;
  }

  async complete(prompt: string, systemPrompt?: string): Promise<CompletionResult> {
    const started = Date.now();
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
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
      throw new Error(`LM Studio error ${response.status}: ${body}`);
    }

    const json = (await response.json()) as LMStudioResponse;
    return {
      content: json.choices?.[0]?.message?.content ?? "",
      tokensUsed: json.usage?.total_tokens ?? 0,
      latencyMs: Date.now() - started
    };
  }
}
