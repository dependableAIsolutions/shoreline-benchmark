import type { CategoryDefinition } from "./types";

export const SHORELINE_LAYERS = {
  sand: "Phase 1 prediction",
  solid: "Phase 2 task performance",
  concrete: "Phase 3 verified self-evaluation"
} as const;

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    key: "mult",
    label: "Multiplication",
    tier: 1,
    difficultyParam: "digitCount",
    minDifficulty: 2,
    maxDifficulty: 12,
    description: "multiply two random integers with the same digit count"
  },
  {
    key: "modexp",
    label: "Modular Exponentiation",
    tier: 1,
    difficultyParam: "bitSize",
    minDifficulty: 4,
    maxDifficulty: 28,
    description: "compute modular exponentiation using exact arithmetic"
  },
  {
    key: "bool",
    label: "Boolean Circuits",
    tier: 1,
    difficultyParam: "gateCount",
    minDifficulty: 2,
    maxDifficulty: 16,
    description: "evaluate a boolean expression over NAND, NOR, and XOR"
  },
  {
    key: "matrix",
    label: "Matrix Determinants",
    tier: 1,
    difficultyParam: "matrixSize",
    minDifficulty: 2,
    maxDifficulty: 6,
    description: "compute the determinant of an integer matrix"
  },
  {
    key: "combo",
    label: "Combinatorics",
    tier: 1,
    difficultyParam: "constraintCount",
    minDifficulty: 1,
    maxDifficulty: 8,
    description: "solve exact combinatorial counting tasks"
  },
  {
    key: "random",
    label: "Random Sequence",
    tier: 2,
    difficultyParam: "sequenceLength",
    minDifficulty: 20,
    maxDifficulty: 500,
    description: "generate digit sequences tested for distribution quality"
  },
  {
    key: "constrained",
    label: "Constrained Writing",
    tier: 2,
    difficultyParam: "constraintDepth",
    minDifficulty: 1,
    maxDifficulty: 8,
    description: "generate text satisfying strict mechanical constraints"
  },
  {
    key: "sudoku",
    label: "Sudoku Generation",
    tier: 2,
    difficultyParam: "gridComplexity",
    minDifficulty: 1,
    maxDifficulty: 5,
    description: "produce Sudoku puzzles with validity constraints"
  },
  {
    key: "distrib",
    label: "Distribution Matching",
    tier: 2,
    difficultyParam: "sampleSize",
    minDifficulty: 10,
    maxDifficulty: 200,
    description: "generate values that match a target distribution"
  },
  {
    key: "selfref",
    label: "Self Referential",
    tier: 2,
    difficultyParam: "propertyCount",
    minDifficulty: 1,
    maxDifficulty: 8,
    description: "write text describing its own measurable properties"
  },
  {
    key: "counting",
    label: "Counting In Context",
    tier: 2,
    difficultyParam: "inputLength",
    minDifficulty: 2,
    maxDifficulty: 40,
    description: "count target character or token occurrences in given text"
  }
];

export const CATEGORY_ORDER = CATEGORY_DEFINITIONS.map((category) => category.key);
