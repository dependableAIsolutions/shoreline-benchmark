import { describe, expect, it } from "vitest";
import { constrainedTask } from "./constrained";

describe("constrainedTask", () => {
  it("increases constraint depth with difficulty", () => {
    const low = constrainedTask.generate(1);
    const high = constrainedTask.generate(20);

    const lowConstraintLines = low.prompt.split("\n").slice(1);
    const highConstraintLines = high.prompt.split("\n").slice(1);

    expect(highConstraintLines.length).toBeGreaterThan(lowConstraintLines.length);
    expect(high.prompt).toContain('Do not use the letter "o".');
    expect(low.prompt).not.toContain('Do not use the letter "o".');
  });

  it("accepts a trivial valid construction at low difficulty", () => {
    const task = constrainedTask.generate(1);
    const spec = JSON.parse(task.correctAnswer) as {
      wordCount: number;
      requiredWord: string;
    };
    const response = Array.from({ length: spec.wordCount }, () => spec.requiredWord).join(" ");

    const result = task.evaluate(response);
    expect(result.isCorrect).toBe(true);
    expect(result.partialScore).toBe(1);
  });
});
