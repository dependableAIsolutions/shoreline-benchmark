import { randomInt } from "node:crypto";
import { extractAnswerLine, extractLastInteger, type GeneratedTask, type TaskGenerator } from "./types";

function factorial(n: number): bigint {
  let result = 1n;
  for (let i = 2; i <= n; i += 1) {
    result *= BigInt(i);
  }
  return result;
}

function countArrangements(counts: number[]): bigint {
  const total = counts.reduce((sum, value) => sum + value, 0);
  let denom = 1n;
  for (const count of counts) {
    denom *= factorial(count);
  }
  return factorial(total) / denom;
}

export const combinatoricsTask: TaskGenerator = {
  key: "combo",
  describeDifficulty(difficulty: number): string {
    return `count distinct permutations of a multiset string with complexity ${difficulty}`;
  },
  generate(difficulty: number): GeneratedTask {
    const letters = "ABCDEFGHIJKLMN";
    const uniqueLetters = Math.max(2, Math.min(8, 2 + Math.floor((difficulty - 1) / 3)));
    const totalLength = Math.max(uniqueLetters + 1, Math.min(24, 6 + Math.floor(difficulty * 0.9)));

    const counts = Array.from({ length: uniqueLetters }, () => 1);
    let remaining = totalLength - uniqueLetters;
    while (remaining > 0) {
      const idx = randomInt(0, uniqueLetters);
      counts[idx] += 1;
      remaining -= 1;
    }

    const wordParts: string[] = [];
    for (let i = 0; i < uniqueLetters; i += 1) {
      wordParts.push(letters[i].repeat(counts[i]));
    }

    const shuffledWord = wordParts.join("").split("").sort(() => randomInt(0, 3) - 1).join("");
    const correct = countArrangements(counts).toString();

    return {
      category: "combo",
      difficulty,
      prompt: `How many distinct permutations can be formed from the letters of \"${shuffledWord}\"?`,
      correctAnswer: correct,
      preview: `perm(${shuffledWord})`,
      evaluate(response: string) {
        const answerText = extractAnswerLine(response) ?? response;
        const extracted = extractLastInteger(answerText) ?? "";
        return {
          extractedAnswer: extracted,
          isCorrect: extracted === correct
        };
      }
    };
  }
};
