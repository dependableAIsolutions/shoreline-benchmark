import { randomInt } from "node:crypto";
import { extractAnswerLine, extractLastInteger, type GeneratedTask, type TaskGenerator } from "./types";

function determinantBareiss(matrix: number[][]): bigint {
  const n = matrix.length;
  if (n === 0) return 0n;

  const a = matrix.map((row) => row.map((value) => BigInt(value)));
  let sign = 1n;
  let prevPivot = 1n;

  for (let k = 0; k < n - 1; k += 1) {
    let pivotRow = k;
    while (pivotRow < n && a[pivotRow][k] === 0n) pivotRow += 1;

    if (pivotRow === n) return 0n;

    if (pivotRow !== k) {
      [a[k], a[pivotRow]] = [a[pivotRow], a[k]];
      sign *= -1n;
    }

    const pivot = a[k][k];

    for (let i = k + 1; i < n; i += 1) {
      for (let j = k + 1; j < n; j += 1) {
        const numerator = a[i][j] * pivot - a[i][k] * a[k][j];
        a[i][j] = numerator / prevPivot;
      }
    }

    for (let i = k + 1; i < n; i += 1) {
      a[i][k] = 0n;
    }

    prevPivot = pivot;
  }

  return sign * a[n - 1][n - 1];
}

export const matrixTask: TaskGenerator = {
  key: "matrix",
  describeDifficulty(difficulty: number): string {
    return `compute exact determinant of a ${difficulty}x${difficulty} integer matrix`;
  },
  generate(difficulty: number): GeneratedTask {
    const n = Math.max(2, Math.min(12, Math.round(difficulty)));
    const matrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => randomInt(-9, 10))
    );

    const correct = determinantBareiss(matrix).toString();

    return {
      category: "matrix",
      difficulty,
      prompt: `Find the determinant of the matrix: ${JSON.stringify(matrix)}.`,
      correctAnswer: correct,
      preview: `${n}x${n} determinant`,
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
