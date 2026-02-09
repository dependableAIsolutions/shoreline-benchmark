import { randomInt } from "node:crypto";
import { extractAnswerLine, extractLastInteger, type GeneratedTask, type TaskGenerator } from "./types";

const WORD_BANK = [
  "shoreline",
  "signal",
  "drift",
  "calibration",
  "model",
  "bridge",
  "island",
  "tide",
  "vector",
  "anchor",
  "response",
  "truth"
];

export const countingTask: TaskGenerator = {
  key: "counting",
  describeDifficulty(difficulty: number): string {
    return `count target word occurrences in a passage of about ${difficulty} words`;
  },
  generate(difficulty: number): GeneratedTask {
    // Counting difficulty is defined directly as passage length in words.
    const wordCount = Math.max(10, Math.round(difficulty));
    const words = Array.from({ length: wordCount }, () => WORD_BANK[randomInt(0, WORD_BANK.length)]);
    const target = WORD_BANK[randomInt(0, WORD_BANK.length)];
    const passage = words.join(" ");
    const correctCount = words.filter((word) => word === target).length;

    return {
      category: "counting",
      difficulty,
      prompt: [
        "Count exactly how many times the target word appears in the passage.",
        `Target word: ${target}`,
        "Passage:",
        passage
      ].join("\n"),
      correctAnswer: String(correctCount),
      preview: `${target} in ${wordCount} words`,
      evaluate(response: string) {
        const answerText = extractAnswerLine(response) ?? response;
        const extracted = extractLastInteger(answerText) ?? "";
        return {
          extractedAnswer: extracted,
          isCorrect: extracted === String(correctCount)
        };
      }
    };
  }
};
