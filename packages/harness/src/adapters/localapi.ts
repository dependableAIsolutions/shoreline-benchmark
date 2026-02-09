import type { AdapterConfig, CompletionResult, ModelAdapter } from "./types";

interface LocalApiConfig extends AdapterConfig {
  apiUrl?: string;
  defaultSystemPrompt?: string;
  timeoutMs?: number;
}

interface LocalApiResponse {
  output?: Array<{
    type?: string;
    content?: string;
  }>;
  stats?: {
    input_tokens?: number;
    total_output_tokens?: number;
    tokens_per_second?: number;
    time_to_first_token_seconds?: number;
  };
}

export class LocalApiAdapter implements ModelAdapter {
  private readonly apiUrl: string;
  private readonly model: string;
  private readonly defaultSystemPrompt?: string;
  private readonly timeoutMs: number;

  constructor(config: LocalApiConfig) {
    this.apiUrl = config.apiUrl ?? "http://localhost:5555/api/v1/chat";
    this.model = config.model;
    this.defaultSystemPrompt = config.defaultSystemPrompt;
    this.timeoutMs = config.timeoutMs ?? 45_000;
  }

  getModelId(): string {
    return this.model;
  }

  async complete(prompt: string, systemPrompt?: string): Promise<CompletionResult> {
    const started = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          system_prompt: systemPrompt ?? this.defaultSystemPrompt,
          input: prompt
        })
      });
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw new Error(`Local API request timed out after ${this.timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Local API error ${response.status}: ${body}`);
    }

    const json = (await response.json()) as LocalApiResponse;
    const content =
      json.output
        ?.map((item) => item.content ?? "")
        .filter((item) => item.length > 0)
        .join("\n") ?? "";

    const inputTokens = json.stats?.input_tokens ?? 0;
    const outputTokens = json.stats?.total_output_tokens ?? 0;

    return {
      content,
      tokensUsed: inputTokens + outputTokens,
      latencyMs: Date.now() - started,
      promptTokens: inputTokens,
      completionTokens: outputTokens,
      costSource: "unavailable",
      tokensPerSecond: json.stats?.tokens_per_second,
      timeToFirstTokenMs:
        typeof json.stats?.time_to_first_token_seconds === "number"
          ? json.stats.time_to_first_token_seconds * 1000
          : undefined
    };
  }
}
