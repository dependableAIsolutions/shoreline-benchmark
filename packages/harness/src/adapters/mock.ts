import type { CompletionResult, ModelAdapter } from "./types";

export class MockAdapter implements ModelAdapter {
  private readonly modelId: string;

  constructor(modelId = "mock/model") {
    this.modelId = modelId;
  }

  getModelId(): string {
    return this.modelId;
  }

  async complete(prompt: string): Promise<CompletionResult> {
    const promptLower = prompt.toLowerCase();
    let content = "Confidence: 50%";

    if (promptLower.includes("how confident") || promptLower.includes("estimate your confidence")) {
      content = "I am 50% confident.";
    } else if (promptLower.includes("multiply")) {
      content = "I will try this carefully.\nANSWER: 0";
    } else if (promptLower.includes("mod")) {
      content = "ANSWER: 0";
    } else if (promptLower.includes("boolean")) {
      content = "Final answer: 0";
    } else if (promptLower.includes("how many times") || promptLower.includes("count")) {
      content = "ANSWER: 0";
    }

    return {
      content,
      tokensUsed: Math.max(20, Math.floor(prompt.length / 8)),
      latencyMs: 1,
      costSource: "unavailable"
    };
  }
}
