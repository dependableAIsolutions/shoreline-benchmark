import { type GeneratedTask, type TaskGenerator } from "./types";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function std(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export const distributionTask: TaskGenerator = {
  key: "distrib",
  describeDifficulty(difficulty: number): string {
    return `generate ${difficulty} values approximating a normal distribution N(0,1)`;
  },
  generate(difficulty: number): GeneratedTask {
    const sampleSize = Math.max(10, difficulty);

    return {
      category: "distrib",
      difficulty,
      prompt: `Generate ${sampleSize} real numbers sampled from a normal distribution N(0, 1). One number per line.`,
      correctAnswer: `distribution-fit(n=${sampleSize})`,
      preview: `N(0,1) sample size ${sampleSize}`,
      evaluate(response: string) {
        const numbers = (response.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [])
          .slice(0, sampleSize)
          .map((token) => Number(token));

        if (numbers.length < sampleSize || numbers.some((value) => Number.isNaN(value))) {
          return {
            extractedAnswer: `${numbers.length}/${sampleSize} values`,
            isCorrect: false,
            partialScore: 0
          };
        }

        const m = mean(numbers);
        const s = std(numbers);
        const positives = numbers.filter((value) => value > 0).length / numbers.length;

        const meanScore = clamp01(1 - Math.abs(m) / 0.6);
        const stdScore = clamp01(1 - Math.abs(s - 1) / 0.6);
        const symmetryScore = clamp01(1 - Math.abs(positives - 0.5) / 0.4);

        const partialScore = (meanScore + stdScore + symmetryScore) / 3;

        return {
          extractedAnswer: `mean=${m.toFixed(3)},std=${s.toFixed(3)}`,
          isCorrect: partialScore >= 0.7,
          partialScore
        };
      }
    };
  }
};
