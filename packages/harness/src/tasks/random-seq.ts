import { type GeneratedTask, type TaskGenerator } from "./types";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function lag1Correlation(values: number[]): number {
  if (values.length < 2) return 0;
  const x = values.slice(0, -1);
  const y = values.slice(1);
  const meanX = x.reduce((sum, value) => sum + value, 0) / x.length;
  const meanY = y.reduce((sum, value) => sum + value, 0) / y.length;

  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < x.length; i += 1) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const denom = Math.sqrt(denX * denY);
  if (denom === 0) return 0;
  return num / denom;
}

export const randomSequenceTask: TaskGenerator = {
  key: "random",
  describeDifficulty(difficulty: number): string {
    return `generate a random sequence of ${difficulty} digits`;
  },
  generate(difficulty: number): GeneratedTask {
    const length = Math.max(20, difficulty);

    return {
      category: "random",
      difficulty,
      prompt: `Generate exactly ${length} random digits (0-9) with no separators.`,
      correctAnswer: `statistical(random-${length})`,
      preview: `random digits x${length}`,
      evaluate(response: string) {
        const digitsOnly = response.replace(/\D/g, "").slice(0, length);
        if (digitsOnly.length < length) {
          return { extractedAnswer: digitsOnly, isCorrect: false, partialScore: 0 };
        }

        const digits = digitsOnly.split("").map((char) => Number(char));
        const expected = length / 10;
        const counts = Array.from({ length: 10 }, () => 0);
        for (const digit of digits) counts[digit] += 1;

        const madRatio =
          counts.reduce((sum, count) => sum + Math.abs(count - expected) / expected, 0) / 10;
        const uniformityScore = clamp01(1 - madRatio);

        let repeats = 0;
        for (let i = 1; i < digits.length; i += 1) {
          if (digits[i] === digits[i - 1]) repeats += 1;
        }
        const repeatRate = repeats / (digits.length - 1);
        const independenceScore = clamp01(1 - Math.abs(repeatRate - 0.1) / 0.2);

        const corr = Math.abs(lag1Correlation(digits));
        const autoScore = clamp01(1 - corr / 0.5);

        const partialScore = (uniformityScore + independenceScore + autoScore) / 3;

        return {
          extractedAnswer: digitsOnly,
          isCorrect: partialScore >= 0.65,
          partialScore
        };
      }
    };
  }
};
