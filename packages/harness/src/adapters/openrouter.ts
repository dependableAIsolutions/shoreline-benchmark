import type { AdapterConfig, CompletionResult, ModelAdapter } from "./types";

interface OpenRouterConfig extends AdapterConfig {
  apiKey: string;
  timeoutMs?: number;
  maxRetries?: number;
  retryBaseDelayMs?: number;
  maxRetryDelayMs?: number;
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
  private readonly maxRetries: number;
  private readonly retryBaseDelayMs: number;
  private readonly maxRetryDelayMs: number;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.maxTokens = config.maxTokens ?? 2048;
    this.temperature = config.temperature ?? 0.7;
    this.timeoutMs = config.timeoutMs ?? 120000;
    this.maxRetries = Math.max(0, config.maxRetries ?? 4);
    this.retryBaseDelayMs = Math.max(100, config.retryBaseDelayMs ?? 1500);
    this.maxRetryDelayMs = Math.max(this.retryBaseDelayMs, config.maxRetryDelayMs ?? 30000);
  }

  getModelId(): string {
    return this.model;
  }

  async complete(prompt: string, systemPrompt?: string): Promise<CompletionResult> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= this.maxRetries) {
      const started = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
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

        if (!response.ok) {
          const body = await response.text();
          const retryAfterHeader = response.headers.get("retry-after");
          const retryAfterMs =
            retryAfterHeader && Number.isFinite(Number.parseFloat(retryAfterHeader))
              ? Math.max(0, Math.floor(Number.parseFloat(retryAfterHeader) * 1000))
              : null;

          const shouldRetry = response.status === 429 || response.status >= 500;
          if (shouldRetry && attempt < this.maxRetries) {
            const backoffMs = this.getRetryDelayMs(attempt, retryAfterMs);
            console.warn(
              `[shoreline] OpenRouter retry ${attempt + 1}/${this.maxRetries} after status ${response.status} for ${this.model} in ${backoffMs}ms`
            );
            await this.sleep(backoffMs);
            attempt += 1;
            continue;
          }

          throw new Error(`OpenRouter error ${response.status}: ${body}`);
        }

        const json = (await response.json()) as OpenRouterResponse;
        const content = flattenMessageContent(json.choices?.[0]?.message?.content);

        return {
          content,
          tokensUsed: json.usage?.total_tokens ?? 0,
          latencyMs: Date.now() - started
        };
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unknown OpenRouter error");
        const isAbort = err.name === "AbortError";
        const isNetworkError = /fetch failed|network|socket|econnreset|etimedout/i.test(err.message);
        const shouldRetry = isAbort || isNetworkError;

        if (shouldRetry && attempt < this.maxRetries) {
          const backoffMs = this.getRetryDelayMs(attempt);
          console.warn(
            `[shoreline] OpenRouter retry ${attempt + 1}/${this.maxRetries} after ${isAbort ? "timeout" : "network error"} for ${this.model} in ${backoffMs}ms`
          );
          await this.sleep(backoffMs);
          attempt += 1;
          lastError = err;
          continue;
        }

        if (isAbort) {
          throw new Error(`OpenRouter timeout after ${this.timeoutMs}ms for model ${this.model}`);
        }
        throw err;
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError ?? new Error(`OpenRouter retries exhausted for model ${this.model}`);
  }

  private getRetryDelayMs(attempt: number, retryAfterMs?: number | null): number {
    const exponential = this.retryBaseDelayMs * 2 ** attempt;
    const jitter = Math.floor(Math.random() * 250);
    const baseDelay = Math.min(exponential + jitter, this.maxRetryDelayMs);
    return Math.min(Math.max(retryAfterMs ?? 0, baseDelay), this.maxRetryDelayMs);
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
