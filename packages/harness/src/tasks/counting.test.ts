import { describe, expect, it } from "vitest";
import { countingTask } from "./counting";

describe("countingTask", () => {
  it("maps difficulty directly to approximate passage length", () => {
    const low = countingTask.generate(2);
    const mid = countingTask.generate(40);

    const lowWords = low.prompt.split("Passage:\n")[1].trim().split(/\s+/).length;
    const midWords = mid.prompt.split("Passage:\n")[1].trim().split(/\s+/).length;

    expect(lowWords).toBe(10);
    expect(midWords).toBe(40);
  });

  it("evaluates using extracted integer answer", () => {
    const task = countingTask.generate(30);
    const result = task.evaluate("ANSWER: 7");

    expect(result.extractedAnswer).toBe("7");
    expect(typeof result.isCorrect).toBe("boolean");
  });
});
