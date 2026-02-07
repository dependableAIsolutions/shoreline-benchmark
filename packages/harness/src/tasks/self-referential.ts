import { type GeneratedTask, type TaskGenerator } from "./types";

function wordCount(text: string): number {
  const words = text.match(/[A-Za-z0-9']+/g) ?? [];
  return words.length;
}

function sentenceCount(text: string): number {
  const sentences = text.split(/[.!?]+/).map((chunk) => chunk.trim()).filter(Boolean);
  return sentences.length;
}

export const selfReferentialTask: TaskGenerator = {
  key: "selfref",
  describeDifficulty(difficulty: number): string {
    return `produce a self-referential sentence with at least ${6 + difficulty} words and correct self-claim`;
  },
  generate(difficulty: number): GeneratedTask {
    const minWords = 6 + Math.max(1, difficulty);

    return {
      category: "selfref",
      difficulty,
      prompt: [
        "Write one sentence that correctly states how many words it contains.",
        `It must contain at least ${minWords} words.`,
        "Include a phrase like 'contains X words' or 'has X words'."
      ].join("\n"),
      correctAnswer: `self-consistent sentence with >=${minWords} words`,
      preview: `self-ref >=${minWords} words`,
      evaluate(response: string) {
        const words = wordCount(response);
        const claimMatch = response.match(/(?:contains|has)\s+(\d+)\s+words?/i);
        const claim = claimMatch ? Number.parseInt(claimMatch[1], 10) : NaN;

        const checks = [
          words >= minWords,
          Number.isFinite(claim),
          claim === words,
          sentenceCount(response) === 1
        ];

        const passed = checks.filter(Boolean).length;
        const partialScore = passed / checks.length;

        return {
          extractedAnswer: `words=${words},claim=${Number.isFinite(claim) ? claim : "none"}`,
          isCorrect: passed === checks.length,
          partialScore
        };
      }
    };
  }
};
