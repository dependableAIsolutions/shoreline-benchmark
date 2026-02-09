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
  promptTokens?: number;
  completionTokens?: number;
  cost?: number;
  costSource?: "provider_usage" | "provider_header" | "estimated" | "unavailable";
  tokensPerSecond?: number;
  timeToFirstTokenMs?: number;
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
  promptTokens?: number;
  completionTokens?: number;
  cost?: number;
  costSource?: "provider_usage" | "provider_header" | "estimated" | "unavailable";
  tokensPerSecond?: number;
  timeToFirstTokenMs?: number;
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
  claimed?: number;                // Raw Phase 1 confidence average (0-100)
  claimedDepth?: number;           // max(confidence × normalizedDifficulty): 100 = 100% at theoretical ceiling (0-100)
  claimedLoose?: number;           // Max normalized difficulty where confidence >= 50% (0-100)
  claimedThick?: number;           // Max normalized difficulty where confidence >= 80% (0-100)
  sand: number;                    // Claimed depth frontier: confidence × normalized difficulty (0-100)
  solid: number;                   // Verified depth frontier: performance × normalized difficulty (0-100)
  concrete: number;                // Failure-aware depth frontier: wrong+low-confidence at normalized difficulty (0-100, <= solid)
  discernment?: number;            // Correctly identifies success/failure in both directions (0-100)
  failureAwareness?: number;       // Wrong answers correctly flagged with low confidence (0-100)
  falseConfidence?: number;        // Wrong but confident: model doesn't know what it doesn't know (0-100, lower is better)
  trueUncertainty?: number;        // Wrong and knows it: good metacognition about failures (0-100, higher is better)
  calibrationError?: number;       // |predicted confidence - realized accuracy| (0-100, lower is better)
  capability?: number;             // Normalized transition-zone capability percentile (0-100)
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
    avgClaimed?: number;
    avgSand: number;
    avgSolid: number;
    avgConcrete: number;
    avgDiscernment?: number;
    avgFalseConfidence?: number;   // Wrong but confident (lower is better)
    avgTrueUncertainty?: number;   // Wrong and knows it (higher is better)
    avgCalibrationError?: number;
    calibrationIndex?: number;     // 100 - avgCalibrationError
    avgCapability?: number;        // Average normalized capability percentile
    overconfidence: number;
    underconfidence?: number;
    blindSpots: number;            // Missed failures: wrong but confident (alias view metric)
    falseConfidence?: number;      // Alias for avgFalseConfidence for clearer API
    totalGap: number;
  };
  metadata: {
    adapter: "openrouter" | "lmstudio" | "localapi";
    temperature: number;
    totalTokensUsed: number;
    totalPromptTokensUsed?: number;
    totalCompletionTokensUsed?: number;
    totalCost?: number;
    providerReportedCost?: number;
    estimatedCost?: number;
    costMeasuredCalls?: number;
    missingCostCalls?: number;
    totalModelCalls?: number;
    totalLatencyMs?: number;
    averageLatencyMs?: number;
    runDurationMs?: number;
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
