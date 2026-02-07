import { type GeneratedTask, type TaskGenerator } from "./types";

function normalizeWords(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

export const constrainedTask: TaskGenerator = {
  key: "constrained",
  describeDifficulty(difficulty: number): string {
    return `write text satisfying ${Math.min(4, 2 + Math.floor(difficulty / 2))} strict constraints`;
  },
  generate(difficulty: number): GeneratedTask {
    const wordCount = 30 + Math.max(1, difficulty) * 4;
    const banned = ["e", ...(difficulty >= 3 ? ["a"] : []), ...(difficulty >= 5 ? ["i"] : [])];
    const requireShoreline = difficulty >= 4;

    const constraints = [
      `Use exactly ${wordCount} words.`,
      ...banned.map((letter) => `Do not use the letter \"${letter}\".`),
      ...(requireShoreline ? ["Include the exact word \"shoreline\" at least once."] : [])
    ];

    return {
      category: "constrained",
      difficulty,
      prompt: ["Write one paragraph that satisfies all constraints:", ...constraints].join("\n"),
      correctAnswer: JSON.stringify({ wordCount, banned, requireShoreline }),
      preview: `${constraints.length} constraints`,
      evaluate(response: string) {
        const words = normalizeWords(response);
        const lower = response.toLowerCase();

        const checks: boolean[] = [];
        checks.push(words.length === wordCount);
        for (const letter of banned) {
          checks.push(!lower.includes(letter));
        }
        if (requireShoreline) {
          checks.push(/\bshoreline\b/i.test(response));
        }

        const passed = checks.filter(Boolean).length;
        const partialScore = passed / checks.length;

        return {
          extractedAnswer: `${passed}/${checks.length}`,
          isCorrect: passed === checks.length,
          partialScore
        };
      }
    };
  }
};
