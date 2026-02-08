import type { AdapterConfig, CompletionResult, ModelAdapter } from "./types";

interface OpenRouterConfig extends AdapterConfig {
  apiKey: string;
  timeoutMs?: number;
}

interface OpenRouterContentChunk {
  type?: string;
  text?: string;
  content?: string;
}

interface OpenRouterMessage {
  content?: string | OpenRouterContentChunk[];
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: OpenRouterMessage;
  }>;
  usage?: { total_tokens?: number };
}

function flattenMessageContent(content: string | OpenRouterContentChunk[] | undefined): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((chunk) => {
      if (!chunk || typeof chunk !== "object") return "";
      if (chunk.type && chunk.type !== "text" && chunk.type !== "output_text") return "";
      return chunk.text ?? chunk.content ?? "";
    })
    .join("");
}

export class OpenRouterAdapter implements ModelAdapter {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;
  private readonly timeoutMs: number;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.maxTokens = config.maxTokens ?? 2048;
    this.temperature = config.temperature ?? 0.7;
    this.timeoutMs = config.timeoutMs ?? 120000;
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
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          // Reasoning traces can consume completion budget on some models and yield blank `content`.
          // We only need final textual outputs for benchmark parsing/scoring.
          include_reasoning: false,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt }
          ]
        }),
        signal: controller.signal
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`OpenRouter timeout after ${this.timeoutMs}ms for model ${this.model}`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${body}`);
    }

    const json = (await response.json()) as OpenRouterResponse;
    const content = flattenMessageContent(json.choices?.[0]?.message?.content);

    return {
      content,
      tokensUsed: json.usage?.total_tokens ?? 0,
      latencyMs: Date.now() - started
    };
  }
}
