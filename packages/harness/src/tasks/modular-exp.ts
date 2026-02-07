import { modularExpGroundTruth } from "../scoring/ground-truth";
import { randomBigIntBits } from "../utils/math";
import { extractAnswerLine, extractLastInteger, type GeneratedTask, type TaskGenerator } from "./types";

export const modularExpTask: TaskGenerator = {
  key: "modexp",
  describeDifficulty(difficulty: number): string {
    return `compute modular exponentiation with ~${difficulty}-bit integers`;
  },
  generate(difficulty: number): GeneratedTask {
    const base = randomBigIntBits(difficulty);
    const exp = randomBigIntBits(Math.max(4, Math.floor(difficulty * 0.6)));
    let mod = randomBigIntBits(difficulty);
    if (mod % 2n === 0n) mod += 1n;

    const correctAnswer = modularExpGroundTruth(base.toString(), exp.toString(), mod.toString());

    return {
      category: "modexp",
      difficulty,
      prompt: `Compute (${base.toString()} ^ ${exp.toString()}) mod ${mod.toString()}.`,
      correctAnswer,
      preview: `${base.toString().slice(0, 8)}^${exp.toString().slice(0, 8)} mod ${mod.toString().slice(0, 8)}`,
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
