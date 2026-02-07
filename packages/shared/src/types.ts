export type CategoryKey =
  | "mult"
  | "modexp"
  | "bool"
  | "matrix"
  | "combo"
  | "random"
  | "constrained"
  | "sudoku"
  | "distrib"
  | "selfref"
  | "counting";

export interface CategoryDefinition {
  key: CategoryKey;
  label: string;
  tier: 1 | 2;
  difficultyParam: string;
  minDifficulty: number;
  maxDifficulty: number;
  description: string;
}

export interface PhaseResult {
  prompt: string;
  response: string;
  confidence: number | null;
  tokensUsed: number;
  latencyMs: number;
}

export interface Phase2Result {
  prompt: string;
  response: string;
  extractedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  partialScore?: number;
  tokensUsed: number;
  latencyMs: number;
}

export interface TrialResult {
  category: CategoryKey;
  difficulty: number;
  phase1: PhaseResult;
  phase2: Phase2Result;
  phase3: PhaseResult;
  timestamp: string;
}

export interface CategoryScore {
  category: CategoryKey;
  sand: number;
  solid: number;
  concrete: number;
  trialCount: number;
  difficultyRange: [number, number];
  transitionZone: number;
}

export interface ModelResult {
  modelId: string;
  modelDisplayName: string;
  timestamp: string;
  categories: Record<CategoryKey, CategoryScore>;
  aggregate: {
    avgSand: number;
    avgSolid: number;
    avgConcrete: number;
    overconfidence: number;
    blindSpots: number;
    totalGap: number;
  };
  metadata: {
    adapter: "openrouter" | "lmstudio" | "localapi";
    temperature: number;
    totalTokensUsed: number;
    totalCost?: number;
    totalTrials: number;
    invalidTrials: number;
  };
}

export interface RunOptions {
  adapter: "openrouter" | "lmstudio" | "localapi";
  model: string;
  categories: CategoryKey[];
  trialsPerDifficulty: number;
  temperature: number;
  outputDir: string;
}
