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
    maxDifficulty: 50, // Extended: 50-digit multiplication is challenging
    description: "multiply two random integers with the same digit count"
  },
  {
    key: "modexp",
    label: "Modular Exponentiation",
    tier: 1,
    difficultyParam: "bitSize",
    minDifficulty: 4,
    maxDifficulty: 64, // Extended: larger bit sizes
    description: "compute modular exponentiation using exact arithmetic"
  },
  {
    key: "bool",
    label: "Boolean Circuits",
    tier: 1,
    difficultyParam: "gateCount",
    minDifficulty: 2,
    maxDifficulty: 50, // Extended: complex circuits
    description: "evaluate a boolean expression over NAND, NOR, and XOR"
  },
  {
    key: "matrix",
    label: "Matrix Determinants",
    tier: 1,
    difficultyParam: "matrixSize",
    minDifficulty: 2,
    maxDifficulty: 12, // Extended: 12x12 matrices are very hard
    description: "compute the determinant of an integer matrix"
  },
  {
    key: "combo",
    label: "Combinatorics",
    tier: 1,
    difficultyParam: "constraintCount",
    minDifficulty: 1,
    maxDifficulty: 20, // Extended: more complex problems
    description: "solve exact combinatorial counting tasks"
  },
  {
    key: "random",
    label: "Random Sequence",
    tier: 2,
    difficultyParam: "sequenceLength",
    minDifficulty: 20,
    maxDifficulty: 2000, // Extended: longer sequences
    description: "generate digit sequences tested for distribution quality"
  },
  {
    key: "constrained",
    label: "Constrained Writing",
    tier: 2,
    difficultyParam: "constraintDepth",
    minDifficulty: 1,
    maxDifficulty: 20, // Extended: more constraints
    description: "generate text satisfying strict mechanical constraints"
  },
  {
    key: "sudoku",
    label: "Sudoku Generation",
    tier: 2,
    difficultyParam: "gridComplexity",
    minDifficulty: 1,
    maxDifficulty: 10, // Extended: more complex requirements
    description: "produce Sudoku puzzles with validity constraints"
  },
  {
    key: "distrib",
    label: "Distribution Matching",
    tier: 2,
    difficultyParam: "sampleSize",
    minDifficulty: 10,
    maxDifficulty: 1000, // Extended: larger samples
    description: "generate values that match a target distribution"
  },
  {
    key: "selfref",
    label: "Self Referential",
    tier: 2,
    difficultyParam: "propertyCount",
    minDifficulty: 1,
    maxDifficulty: 20, // Extended: more properties to track
    description: "write text describing its own measurable properties"
  },
  {
    key: "counting",
    label: "Counting In Context",
    tier: 2,
    difficultyParam: "inputLength",
    minDifficulty: 2,
    maxDifficulty: 200, // Extended: much longer texts
    description: "count target character or token occurrences in given text"
  }
];

export const CATEGORY_ORDER = CATEGORY_DEFINITIONS.map((category) => category.key);
