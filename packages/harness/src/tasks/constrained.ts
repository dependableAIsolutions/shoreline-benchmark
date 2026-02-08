import { type GeneratedTask, type TaskGenerator } from "./types";

function normalizeWords(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

// Get a required word that doesn't conflict with banned letters at this difficulty
function getRequiredWord(difficulty: number): string | null {
  if (difficulty < 4) return null; // No required word at low difficulties

  // At difficulty 4+, we require a thematic word
  // Must choose words that don't contain banned letters at each level:
  // - difficulty 4: "e", "a" banned → use "storm" (no e, a, or i)
  // - difficulty 5+: "e", "a", "i" banned → use "surf", "fog", "dusk", "storm"
  const wordsWithoutEAI = ["storm", "surf", "fog", "dusk", "frost", "Gulf"];
  return wordsWithoutEAI[difficulty % wordsWithoutEAI.length];
}

export const constrainedTask: TaskGenerator = {
  key: "constrained",
  describeDifficulty(difficulty: number): string {
    return `write text satisfying ${Math.min(4, 2 + Math.floor(difficulty / 2))} strict constraints`;
  },
  generate(difficulty: number): GeneratedTask {
    const wordCount = 30 + Math.max(1, difficulty) * 4;
    const banned = ["e", ...(difficulty >= 3 ? ["a"] : []), ...(difficulty >= 5 ? ["i"] : [])];
    const requiredWord = getRequiredWord(difficulty);

    const constraints = [
      `Use exactly ${wordCount} words.`,
      ...banned.map((letter) => `Do not use the letter \"${letter}\".`),
      ...(requiredWord ? [`Include the exact word \"${requiredWord}\" at least once.`] : [])
    ];

    return {
      category: "constrained",
      difficulty,
      prompt: ["Write one paragraph that satisfies all constraints:", ...constraints].join("\n"),
      correctAnswer: JSON.stringify({ wordCount, banned, requiredWord }),
      preview: `${constraints.length} constraints`,
      evaluate(response: string) {
        const words = normalizeWords(response);
        const lower = response.toLowerCase();

        const checks: boolean[] = [];
        checks.push(words.length === wordCount);
        for (const letter of banned) {
          checks.push(!lower.includes(letter));
        }
        if (requiredWord) {
          const wordPattern = new RegExp(`\\b${requiredWord}\\b`, "i");
          checks.push(wordPattern.test(response));
        }

        const passed = checks.filter(Boolean).length;
        const baseScore = passed / checks.length;
        // Avoid rewarding trivially short/empty outputs that pass "banned letter" checks.
        const coverage = Math.min(1, words.length / Math.max(1, wordCount));
        const partialScore = baseScore * coverage;

        return {
          extractedAnswer: `${passed}/${checks.length} @ ${Math.round(coverage * 100)}% length`,
          isCorrect: passed === checks.length,
          partialScore
        };
      }
    };
  }
};
