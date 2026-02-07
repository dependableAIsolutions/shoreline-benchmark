export interface CompletionResult {
  content: string;
  tokensUsed: number;
  latencyMs: number;
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
