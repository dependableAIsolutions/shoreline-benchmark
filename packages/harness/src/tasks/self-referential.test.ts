import { describe, expect, it } from "vitest";
import { selfReferentialTask } from "./self-referential";

describe("selfReferentialTask", () => {
  it("requires more self-claims at higher difficulty", () => {
    const low = selfReferentialTask.generate(1);
    const high = selfReferentialTask.generate(20);

    const countClaims = (prompt: string) => (prompt.match(/Include a claim in the form/g) ?? []).length;

    expect(countClaims(high.prompt)).toBeGreaterThan(countClaims(low.prompt));
    expect(high.prompt).toContain("has N unique words");
  });

  it("marks outputs missing required claims as incorrect", () => {
    const task = selfReferentialTask.generate(20);
    const result = task.evaluate("This sentence has 6 words.");

    expect(result.isCorrect).toBe(false);
    expect(result.partialScore ?? 0).toBeLessThan(1);
  });
});
