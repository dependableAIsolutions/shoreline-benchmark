import { describe, expect, it } from "vitest";
import { booleanTask } from "./boolean";

describe("booleanTask", () => {
  it("keeps prompt size bounded at high difficulty", () => {
    const task = booleanTask.generate(50);
    expect(task.prompt).toContain("R50 =");
    expect(task.prompt.length).toBeLessThan(4000);
  });

  it("evaluates extracted binary answer", () => {
    const task = booleanTask.generate(8);
    const correct = task.correctAnswer;
    const wrong = correct === "1" ? "0" : "1";

    expect(task.evaluate(`Final answer: ${correct}`).isCorrect).toBe(true);
    expect(task.evaluate(`I think it is ${wrong}`).isCorrect).toBe(false);
  });
});
