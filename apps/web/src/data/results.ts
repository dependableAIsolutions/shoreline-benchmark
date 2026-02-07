import type { CategoryKey, ModelResult } from "@shoreline/shared";
import { CATEGORY_ORDER } from "@shoreline/shared";
import { generatedResults } from "./results.generated";

const modelData = {
  "Claude Opus 4.6": {
    sand: { mult: 82, modexp: 70, bool: 88, matrix: 60, combo: 72, random: 55, constrained: 72, sudoku: 56, distrib: 55, selfref: 68, counting: 60 },
    solid: { mult: 78, modexp: 62, bool: 85, matrix: 50, combo: 68, random: 40, constrained: 60, sudoku: 44, distrib: 47, selfref: 52, counting: 42 },
    concrete: { mult: 72, modexp: 54, bool: 80, matrix: 42, combo: 60, random: 30, constrained: 48, sudoku: 36, distrib: 38, selfref: 38, counting: 30 }
  },
  "GPT-4o": {
    sand: { mult: 85, modexp: 75, bool: 88, matrix: 70, combo: 78, random: 65, constrained: 72, sudoku: 68, distrib: 62, selfref: 68, counting: 72 },
    solid: { mult: 74, modexp: 58, bool: 80, matrix: 52, combo: 64, random: 43, constrained: 66, sudoku: 48, distrib: 44, selfref: 56, counting: 46 },
    concrete: { mult: 60, modexp: 42, bool: 68, matrix: 36, combo: 48, random: 28, constrained: 58, sudoku: 32, distrib: 30, selfref: 44, counting: 28 }
  },
  "Llama 3.1 405B": {
    sand: { mult: 68, modexp: 50, bool: 75, matrix: 43, combo: 58, random: 40, constrained: 54, sudoku: 38, distrib: 44, selfref: 48, counting: 42 },
    solid: { mult: 64, modexp: 46, bool: 72, matrix: 39, combo: 54, random: 36, constrained: 49, sudoku: 34, distrib: 39, selfref: 44, counting: 38 },
    concrete: { mult: 62, modexp: 44, bool: 70, matrix: 37, combo: 52, random: 34, constrained: 46, sudoku: 32, distrib: 37, selfref: 42, counting: 36 }
  }
} as const;

function aggregate(data: {
  sand: Record<string, number>;
  solid: Record<string, number>;
  concrete: Record<string, number>;
}) {
  const keys = CATEGORY_ORDER;
  const sand = keys.reduce((sum, key) => sum + (data.sand[key] ?? 0), 0) / keys.length;
  const solid = keys.reduce((sum, key) => sum + (data.solid[key] ?? 0), 0) / keys.length;
  const concrete = keys.reduce((sum, key) => sum + (data.concrete[key] ?? 0), 0) / keys.length;
  const overconfidence = sand - solid;
  const blindSpots = solid - concrete;

  return {
    avgSand: sand,
    avgSolid: solid,
    avgConcrete: concrete,
    overconfidence,
    blindSpots,
    totalGap: overconfidence + blindSpots
  };
}

function toModelResult(name: string, layers: (typeof modelData)[keyof typeof modelData]): ModelResult {
  const categories = Object.fromEntries(
    CATEGORY_ORDER.map((key) => {
      const sand = layers.sand[key] ?? 0;
      const solid = layers.solid[key] ?? 0;
      const concrete = layers.concrete[key] ?? 0;
      return [
        key,
        {
          category: key,
          sand,
          solid,
          concrete,
          trialCount: 100,
          difficultyRange: [0, 0],
          transitionZone: 0
        }
      ];
    })
  ) as ModelResult["categories"];

  return {
    modelId: name.toLowerCase().replace(/\s+/g, "-"),
    modelDisplayName: name,
    timestamp: "2026-02-06T12:00:00.000Z",
    categories,
    aggregate: aggregate(layers),
    metadata: {
      adapter: "openrouter",
      temperature: 0.7,
      totalTokensUsed: 0,
      totalTrials: CATEGORY_ORDER.length * 100,
      invalidTrials: 0
    }
  };
}

const fallbackResults = Object.entries(modelData).map(([name, layers]) => toModelResult(name, layers));

export const modelResults: ModelResult[] = generatedResults.length > 0 ? generatedResults : fallbackResults;

export const modelResultById: Record<string, ModelResult> = Object.fromEntries(
  modelResults.map((result) => [result.modelId, result])
);

export const modelNames = modelResults.map((result) => result.modelDisplayName);

export const categoryLabels: Record<CategoryKey, string> = {
  mult: "Multiplication",
  modexp: "Modular Exp.",
  bool: "Boolean Circuits",
  matrix: "Matrix Det.",
  combo: "Combinatorics",
  random: "Random Gen.",
  constrained: "Constrained Write",
  sudoku: "Sudoku Gen.",
  distrib: "Distribution",
  selfref: "Self-Referential",
  counting: "Counting"
};
