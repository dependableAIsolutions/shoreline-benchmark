import type { CategoryDefinition } from "./types";

export const SHORELINE_LAYERS = {
  sand: "Phase 1 claimed depth",
  solid: "Phase 2 verified depth",
  concrete: "Failure-aware share of verified depth"
} as const;

// Sand normalization is intentionally model-agnostic and extends beyond
// the benchmarked range so 100 is a theoretical outer ceiling.
//
// With headroom=1.25, max tested difficulty maps to ~0.8 linear (80% of range).
// With exponent=1.15, this becomes ~0.77 normalized, leaving ~23% headroom
// for theoretical super-human performance beyond the tested range.
//
// Previous values (headroom=2, exponent=1.35) were too aggressive, causing
// all islands to compress into the 0-40 range even with perfect performance.
export const SAND_DIFFICULTY_HEADROOM_MULTIPLIER = 1.25;
export const SAND_DIFFICULTY_EXPONENT = 1.15;

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    key: "mult",
    label: "Multiplication",
    tier: 1,
    difficultyParam: "digitCount",
    minDifficulty: 2,
    maxDifficulty: 50, // Extended: 50-digit multiplication is challenging
    anchorDifficulties: [2, 4, 8, 16, 32, 50],
    description: "multiply two random integers with the same digit count"
  },
  {
    key: "modexp",
    label: "Modular Exponentiation",
    tier: 1,
    difficultyParam: "bitSize",
    minDifficulty: 4,
    maxDifficulty: 64, // Extended: larger bit sizes
    anchorDifficulties: [4, 8, 16, 32, 48, 64],
    description: "compute modular exponentiation using exact arithmetic"
  },
  {
    key: "bool",
    label: "Boolean Circuits",
    tier: 1,
    difficultyParam: "gateCount",
    minDifficulty: 2,
    maxDifficulty: 50, // Extended: complex circuits
    anchorDifficulties: [2, 5, 10, 20, 35, 50],
    description: "evaluate a boolean expression over NAND, NOR, and XOR"
  },
  {
    key: "matrix",
    label: "Matrix Determinants",
    tier: 1,
    difficultyParam: "matrixSize",
    minDifficulty: 2,
    maxDifficulty: 12, // Extended: 12x12 matrices are very hard
    anchorDifficulties: [2, 3, 5, 7, 9, 12],
    description: "compute the determinant of an integer matrix"
  },
  {
    key: "combo",
    label: "Combinatorics",
    tier: 1,
    difficultyParam: "constraintCount",
    minDifficulty: 1,
    maxDifficulty: 20, // Extended: more complex problems
    anchorDifficulties: [1, 3, 6, 10, 15, 20],
    description: "solve exact combinatorial counting tasks"
  },
  {
    key: "random",
    label: "Random Sequence",
    tier: 2,
    difficultyParam: "sequenceLength",
    minDifficulty: 20,
    maxDifficulty: 2000, // Extended: longer sequences
    anchorDifficulties: [20, 50, 100, 250, 500, 1000, 2000],
    description: "generate digit sequences tested for distribution quality"
  },
  {
    key: "constrained",
    label: "Constrained Writing",
    tier: 2,
    difficultyParam: "constraintDepth",
    minDifficulty: 1,
    maxDifficulty: 20, // Extended: more constraints
    anchorDifficulties: [1, 3, 6, 10, 15, 20],
    description: "generate text satisfying strict mechanical constraints"
  },
  {
    key: "sudoku",
    label: "Sudoku Generation",
    tier: 2,
    difficultyParam: "gridComplexity",
    minDifficulty: 1,
    maxDifficulty: 10, // Extended: more complex requirements
    anchorDifficulties: [1, 2, 4, 6, 8, 10],
    description: "produce Sudoku puzzles with validity constraints"
  },
  {
    key: "distrib",
    label: "Distribution Matching",
    tier: 2,
    difficultyParam: "sampleSize",
    minDifficulty: 10,
    maxDifficulty: 1000, // Extended: larger samples
    anchorDifficulties: [10, 25, 50, 100, 250, 500, 1000],
    description: "generate values that match a target distribution"
  },
  {
    key: "selfref",
    label: "Self Referential",
    tier: 2,
    difficultyParam: "propertyCount",
    minDifficulty: 1,
    maxDifficulty: 20, // Extended: more properties to track
    anchorDifficulties: [1, 3, 6, 10, 15, 20],
    description: "write text describing its own measurable properties"
  },
  {
    key: "counting",
    label: "Counting In Context",
    tier: 2,
    difficultyParam: "inputWords",
    minDifficulty: 10,
    maxDifficulty: 400, // Passage word count
    anchorDifficulties: [10, 20, 40, 80, 160, 320, 400],
    description: "count target word occurrences in a passage of N words"
  }
];

export const CATEGORY_ORDER = CATEGORY_DEFINITIONS.map((category) => category.key);
