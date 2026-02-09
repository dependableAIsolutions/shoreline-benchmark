import { type GeneratedTask, type TaskGenerator } from "./types";

function normalizeWords(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function countSentences(text: string): number {
  return text
    .split(/[.!?]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean).length;
}

function normalizeToken(token: string): string {
  return token.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, "").toLowerCase();
}

function normalizeTokens(words: string[]): string[] {
  return words.map(normalizeToken).filter(Boolean);
}

function wordCountAtLeastLength(words: string[], minLength: number): number {
  return words.filter((word) => normalizeToken(word).length >= minLength).length;
}

type ConstraintSpec = {
  wordCount: number;
  bannedLetters: string[];
  requiredWord: string;
  sentenceCount: 1 | 2 | 3;
  keyword?: string;
  keywordExactCount?: number;
  minUniqueWords?: number;
  minLongWords?: number;
  requiredStartWord?: string;
  requiredEndWord?: string;
};

const REQUIRED_WORD_CANDIDATES = ["storm", "drift", "surf", "glyph", "rhythm", "myth", "cusp", "lynx"];
const KEYWORD_CANDIDATES = ["drift", "surf", "myth", "glyph", "cusp", "lynx", "rhythm", "tryst"];

function pickAllowedWord(words: string[], bannedLetters: string[], seed: number): string {
  const allowed = words.filter((word) => bannedLetters.every((letter) => !word.includes(letter)));
  if (allowed.length === 0) return "rhythm";
  return allowed[((seed % allowed.length) + allowed.length) % allowed.length];
}

function buildConstraintSpec(difficulty: number): ConstraintSpec {
  const level = Math.max(1, Math.round(difficulty));
  const wordCount = 24 + level * 5;
  const bannedLetters = [
    ...(level >= 2 ? ["e"] : []),
    ...(level >= 5 ? ["a"] : []),
    ...(level >= 9 ? ["i"] : []),
    ...(level >= 14 ? ["o"] : [])
  ];
  const requiredWord = pickAllowedWord(REQUIRED_WORD_CANDIDATES, bannedLetters, level);
  const sentenceCount: 1 | 2 | 3 = level >= 18 ? 3 : level >= 12 ? 2 : 1;

  const keyword = level >= 10 ? pickAllowedWord(KEYWORD_CANDIDATES, bannedLetters, level + 3) : undefined;
  const keywordExactCount = level >= 10 ? Math.min(4, 1 + Math.floor((level - 10) / 4)) : undefined;
  const minUniqueWords = level >= 14 ? Math.min(wordCount - 1, 8 + level) : undefined;
  const minLongWords = level >= 17 ? Math.min(wordCount, 4 + Math.floor(level / 2)) : undefined;
  const requiredStartWord = level >= 19 ? pickAllowedWord(REQUIRED_WORD_CANDIDATES, bannedLetters, level + 5) : undefined;
  const requiredEndWord = level >= 19 ? pickAllowedWord(KEYWORD_CANDIDATES, bannedLetters, level + 7) : undefined;

  return {
    wordCount,
    bannedLetters,
    requiredWord,
    sentenceCount,
    keyword,
    keywordExactCount,
    minUniqueWords,
    minLongWords,
    requiredStartWord,
    requiredEndWord
  };
}

function buildConstraintLines(spec: ConstraintSpec): string[] {
  return [
    `Use exactly ${spec.wordCount} words.`,
    `Include the exact word "${spec.requiredWord}" at least once.`,
    ...spec.bannedLetters.map((letter) => `Do not use the letter "${letter}".`),
    `Write exactly ${spec.sentenceCount} sentence${spec.sentenceCount === 1 ? "" : "s"}.`,
    ...(typeof spec.keywordExactCount === "number" && spec.keyword
      ? [`Include the exact word "${spec.keyword}" exactly ${spec.keywordExactCount} times.`]
      : []),
    ...(typeof spec.minUniqueWords === "number" ? [`Use at least ${spec.minUniqueWords} unique words.`] : []),
    ...(typeof spec.minLongWords === "number"
      ? [`Use at least ${spec.minLongWords} words with length >= 6.`]
      : []),
    ...(spec.requiredStartWord ? [`Begin with the word "${spec.requiredStartWord}".`] : []),
    ...(spec.requiredEndWord ? [`End with the word "${spec.requiredEndWord}".`] : [])
  ];
}

export const constrainedTask: TaskGenerator = {
  key: "constrained",
  describeDifficulty(difficulty: number): string {
    const spec = buildConstraintSpec(difficulty);
    const constraintCount = buildConstraintLines(spec).length;
    return `satisfy ${constraintCount} mechanical constraints in a ${spec.wordCount}-word response`;
  },
  generate(difficulty: number): GeneratedTask {
    const spec = buildConstraintSpec(difficulty);
    const constraints = buildConstraintLines(spec);

    return {
      category: "constrained",
      difficulty,
      prompt: ["Write one paragraph that satisfies all constraints:", ...constraints].join("\n"),
      correctAnswer: JSON.stringify(spec),
      preview: `${constraints.length} constraints`,
      evaluate(response: string) {
        const words = normalizeWords(response);
        const normalized = normalizeTokens(words);
        const lower = response.toLowerCase();
        const checks: boolean[] = [];

        checks.push(words.length === spec.wordCount);
        checks.push(normalized.includes(spec.requiredWord.toLowerCase()));
        for (const letter of spec.bannedLetters) {
          checks.push(!lower.includes(letter));
        }
        checks.push(countSentences(response) === spec.sentenceCount);

        if (typeof spec.keywordExactCount === "number" && spec.keyword) {
          const keywordCount = normalized.filter((word) => word === spec.keyword?.toLowerCase()).length;
          checks.push(keywordCount === spec.keywordExactCount);
        }
        if (typeof spec.minUniqueWords === "number") {
          checks.push(new Set(normalized).size >= spec.minUniqueWords);
        }
        if (typeof spec.minLongWords === "number") {
          checks.push(wordCountAtLeastLength(words, 6) >= spec.minLongWords);
        }
        if (spec.requiredStartWord) {
          checks.push((normalized[0] ?? "") === spec.requiredStartWord.toLowerCase());
        }
        if (spec.requiredEndWord) {
          checks.push((normalized[normalized.length - 1] ?? "") === spec.requiredEndWord.toLowerCase());
        }

        const passed = checks.filter(Boolean).length;
        const baseScore = passed / checks.length;
        const coverage = Math.min(1, words.length / Math.max(1, spec.wordCount));
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
