import { multiplicationGroundTruth } from "../scoring/ground-truth";
import { randomNDigitInt } from "../utils/math";
import { extractAnswerLine, extractLastInteger, type GeneratedTask, type TaskGenerator } from "./types";

export const multiplicationTask: TaskGenerator = {
  key: "mult",
  describeDifficulty(difficulty: number): string {
    return `multiply two ${difficulty}-digit integers`;
  },
  generate(difficulty: number): GeneratedTask {
    const a = randomNDigitInt(difficulty).toString();
    const b = randomNDigitInt(difficulty).toString();
    const correctAnswer = multiplicationGroundTruth(a, b);

    return {
      category: "mult",
      difficulty,
      prompt: `Multiply ${a} by ${b}.`,
      correctAnswer,
      preview: `${a} × ${b}`,
      evaluate(response: string) {
        const answerText = extractAnswerLine(response) ?? response;
        const extracted = extractLastInteger(answerText) ?? "";
        return {
          extractedAnswer: extracted,
          isCorrect: extracted === correctAnswer
        };
      }
    };
  }
};
