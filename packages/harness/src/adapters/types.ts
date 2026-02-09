export type CostSource = "provider_usage" | "provider_header" | "estimated" | "unavailable";

export interface CompletionResult {
  content: string;
  tokensUsed: number;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  cost?: number;
  costSource?: CostSource;
  tokensPerSecond?: number;
  timeToFirstTokenMs?: number;
}

export interface ModelAdapter {
  complete(prompt: string, systemPrompt?: string): Promise<CompletionResult>;
  getModelId(): string;
}

export interface AdapterConfig {
  model: string;
  maxTokens?: number;
  temperature?: number;
}
