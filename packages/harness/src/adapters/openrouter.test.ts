import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenRouterAdapter } from "./openrouter";

function okJson(body: unknown, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json",
      ...(headers ?? {})
    }
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("OpenRouterAdapter metrics", () => {
  it("prefers provider usage cost when available", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({
        choices: [{ message: { content: "ANSWER: 42" } }],
        usage: {
          prompt_tokens: 200,
          completion_tokens: 50,
          total_tokens: 250,
          cost: 0.1234
        }
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new OpenRouterAdapter({
      apiKey: "test-key",
      model: "openai/test"
    });

    const result = await adapter.complete("What is 6 * 7?");

    expect(result.content).toBe("ANSWER: 42");
    expect(result.tokensUsed).toBe(250);
    expect(result.promptTokens).toBe(200);
    expect(result.completionTokens).toBe(50);
    expect(result.cost).toBeCloseTo(0.1234, 6);
    expect(result.costSource).toBe("provider_usage");
  });

  it("uses header cost when usage.cost is missing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson(
        {
          choices: [{ message: { content: "ANSWER: 7" } }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 20,
            total_tokens: 120
          }
        },
        {
          "x-openrouter-cost": "0.0456"
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new OpenRouterAdapter({
      apiKey: "test-key",
      model: "openai/test"
    });

    const result = await adapter.complete("Compute 3 + 4");

    expect(result.cost).toBeCloseTo(0.0456, 6);
    expect(result.costSource).toBe("provider_header");
  });

  it("estimates cost from manual pricing when provider cost is absent", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({
        choices: [{ message: { content: "ANSWER: 1" } }],
        usage: {
          prompt_tokens: 1200,
          completion_tokens: 300,
          total_tokens: 1500
        }
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new OpenRouterAdapter({
      apiKey: "test-key",
      model: "openai/test",
      pricing: {
        inputCostPerMillion: 2,
        outputCostPerMillion: 4
      }
    });

    const result = await adapter.complete("Return 1");

    const expected = (1200 / 1_000_000) * 2 + (300 / 1_000_000) * 4;
    expect(result.cost).toBeCloseTo(expected, 12);
    expect(result.costSource).toBe("estimated");
  });
});
