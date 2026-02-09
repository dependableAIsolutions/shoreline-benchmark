import { type GeneratedTask, type TaskGenerator } from "./types";

function wordCount(text: string): number {
  const words = text.match(/[A-Za-z0-9']+/g) ?? [];
  return words.length;
}

function sentenceCount(text: string): number {
  const sentences = text.split(/[.!?]+/).map((chunk) => chunk.trim()).filter(Boolean);
  return sentences.length;
}

function uniqueWordCount(text: string): number {
  const words = text
    .match(/[A-Za-z0-9']+/g)
    ?.map((word) => word.toLowerCase()) ?? [];
  return new Set(words).size;
}

function countCommas(text: string): number {
  return (text.match(/,/g) ?? []).length;
}

function countSemicolons(text: string): number {
  return (text.match(/;/g) ?? []).length;
}

function countDigits(text: string): number {
  return (text.match(/\d/g) ?? []).length;
}

function countLetterA(text: string): number {
  return (text.match(/a/gi) ?? []).length;
}

function countWordsStartingWithS(text: string): number {
  const words = text.match(/[A-Za-z0-9']+/g) ?? [];
  return words.filter((word) => /^s/i.test(word)).length;
}

type PropertyId =
  | "words"
  | "commas"
  | "semicolons"
  | "sWords"
  | "letterA"
  | "digits"
  | "uniqueWords";

type PropertyDefinition = {
  id: PropertyId;
  instruction: string;
  regex: RegExp;
  measure: (text: string) => number;
};

const PROPERTY_DEFINITIONS: PropertyDefinition[] = [
  {
    id: "words",
    instruction: "Include a claim in the form 'contains N words' or 'has N words'.",
    regex: /(?:contains|has)\s+(\d+)\s+words?/i,
    measure: wordCount
  },
  {
    id: "commas",
    instruction: "Include a claim in the form 'has N commas'.",
    regex: /has\s+(\d+)\s+commas?/i,
    measure: countCommas
  },
  {
    id: "semicolons",
    instruction: "Include a claim in the form 'has N semicolons'.",
    regex: /has\s+(\d+)\s+semicolons?/i,
    measure: countSemicolons
  },
  {
    id: "sWords",
    instruction: "Include a claim in the form 'has N words starting with s'.",
    regex: /has\s+(\d+)\s+words?\s+starting\s+with\s+s/i,
    measure: countWordsStartingWithS
  },
  {
    id: "letterA",
    instruction: "Include a claim in the form 'has N letters a'.",
    regex: /has\s+(\d+)\s+letters?\s+a/i,
    measure: countLetterA
  },
  {
    id: "digits",
    instruction: "Include a claim in the form 'has N digits'.",
    regex: /has\s+(\d+)\s+digits?/i,
    measure: countDigits
  },
  {
    id: "uniqueWords",
    instruction: "Include a claim in the form 'has N unique words'.",
    regex: /has\s+(\d+)\s+unique\s+words?/i,
    measure: uniqueWordCount
  }
];

function selectedProperties(difficulty: number): PropertyDefinition[] {
  const propertyCount = Math.max(1, Math.min(PROPERTY_DEFINITIONS.length, 1 + Math.floor((difficulty - 1) / 3)));
  return PROPERTY_DEFINITIONS.slice(0, propertyCount);
}

export const selfReferentialTask: TaskGenerator = {
  key: "selfref",
  describeDifficulty(difficulty: number): string {
    const level = Math.max(1, Math.round(difficulty));
    const minWords = 8 + level * 2;
    const propertyCount = selectedProperties(difficulty).length;
    return `produce a one-sentence self-referential statement with ${propertyCount} numeric claims and at least ${minWords} words`;
  },
  generate(difficulty: number): GeneratedTask {
    const level = Math.max(1, Math.round(difficulty));
    const minWords = 8 + level * 2;
    const properties = selectedProperties(difficulty);

    return {
      category: "selfref",
      difficulty,
      prompt: [
        "Write exactly one sentence that is self-referential and truthful.",
        `It must contain at least ${minWords} words.`,
        "Use digits (0-9) for every numeric claim.",
        ...properties.map((property) => property.instruction)
      ].join("\n"),
      correctAnswer: `self-consistent sentence with ${properties.length} claims and >=${minWords} words`,
      preview: `${properties.length} claims, >=${minWords} words`,
      evaluate(response: string) {
        const words = wordCount(response);
        const checks: boolean[] = [words >= minWords, sentenceCount(response) === 1];

        for (const property of properties) {
          const match = response.match(property.regex);
          if (!match) {
            checks.push(false);
            continue;
          }
          const claim = Number.parseInt(match[1], 10);
          if (!Number.isFinite(claim)) {
            checks.push(false);
            continue;
          }
          checks.push(claim === property.measure(response));
        }

        const passed = checks.filter(Boolean).length;
        const partialScore = passed / checks.length;

        return {
          extractedAnswer: `words=${words},claims=${properties.length}`,
          isCorrect: passed === checks.length,
          partialScore
        };
      }
    };
  }
};
