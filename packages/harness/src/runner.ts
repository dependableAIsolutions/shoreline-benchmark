import { access, appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CATEGORY_DEFINITIONS,
  CATEGORY_ORDER,
  type CategoryKey,
  type CategoryScore,
  type ModelResult,
  type TrialResult
} from "@shoreline/shared";
import type { ModelAdapter } from "./adapters";
import { findTransitionZone } from "./difficulty/adaptive";
import { buildPhase1Prompt } from "./phases/phase1";
import { buildPhase2Prompt } from "./phases/phase2";
import { buildPhase3Prompt } from "./phases/phase3";
import { computeAggregateScores, computeCategoryScore, extractConfidence } from "./scoring";
import { IMPLEMENTED_CATEGORIES, TASK_GENERATORS } from "./tasks";
import type { TaskGenerator } from "./tasks";
import { logInfo, logWarn } from "./utils/logger";

export interface BenchmarkRunnerConfig {
  adapter: ModelAdapter;
  categories: CategoryKey[];
  trialsPerDifficulty: number;
  outputDir: string;
  adapterName: "openrouter" | "lmstudio" | "localapi";
  temperature: number;
  probeTrials?: number;
  quickMode?: boolean;
  quickPoints?: number;
  categoryConcurrency?: number;
  rampMode?: "balanced" | "fast";
  resume?: boolean;
  callTimeoutMs?: number;
}

interface TrialRunResult {
  trial: TrialResult;
  tokensUsed: number;
  invalidConfidence: boolean;
}

interface SafeCompletion {
  content: string;
  tokensUsed: number;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  cost?: number;
  costSource?: "provider_usage" | "provider_header" | "estimated" | "unavailable";
  tokensPerSecond?: number;
  timeToFirstTokenMs?: number;
  failed: boolean;
}

interface CategoryCheckpoint {
  boundary: number;
  sampleDifficulties: number[];
  quickMode: boolean;
  completedByDifficulty: Record<string, number>;
}

interface RunCheckpoint {
  version: 1;
  modelId: string;
  startedAt: string;
  updatedAt: string;
  quickMode: boolean;
  trialsPerDifficulty: number;
  categories: Partial<Record<CategoryKey, CategoryCheckpoint>>;
}

type PhaseMetrics = {
  tokensUsed: number;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  cost?: number;
  costSource?: "provider_usage" | "provider_header" | "estimated" | "unavailable";
};

interface UsageTotals {
  totalTokensUsed: number;
  totalPromptTokensUsed: number;
  totalCompletionTokensUsed: number;
  totalLatencyMs: number;
  totalModelCalls: number;
  totalCost: number;
  providerReportedCost: number;
  estimatedCost: number;
  costMeasuredCalls: number;
}

function getCategoryOrThrow(key: CategoryKey) {
  const category = CATEGORY_DEFINITIONS.find((item) => item.key === key);
  if (!category) throw new Error(`Unknown category: ${key}`);
  return category;
}

function getGeneratorOrThrow(key: CategoryKey): TaskGenerator {
  const generator = TASK_GENERATORS[key];
  if (!generator) {
    throw new Error(
      `Category '${key}' is not implemented yet. Implemented categories: ${IMPLEMENTED_CATEGORIES.join(", ")}`
    );
  }
  return generator;
}

function emptyScore(category: CategoryKey): CategoryScore {
  return {
    category,
    sand: 0,
    solid: 0,
    concrete: 0,
    trialCount: 0,
    difficultyRange: [0, 0],
    transitionZone: 0
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function countByDifficulty(trials: TrialResult[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const trial of trials) {
    counts.set(trial.difficulty, (counts.get(trial.difficulty) ?? 0) + 1);
  }
  return counts;
}

function toNonNegativeNumber(value: unknown): number | undefined {
  if (typeof value !== "number") return undefined;
  if (!Number.isFinite(value) || value < 0) return undefined;
  return value;
}

function createUsageTotals(): UsageTotals {
  return {
    totalTokensUsed: 0,
    totalPromptTokensUsed: 0,
    totalCompletionTokensUsed: 0,
    totalLatencyMs: 0,
    totalModelCalls: 0,
    totalCost: 0,
    providerReportedCost: 0,
    estimatedCost: 0,
    costMeasuredCalls: 0
  };
}

function collectTrialPhases(trial: TrialResult): PhaseMetrics[] {
  return [trial.phase1, trial.phase2, trial.phase3];
}

function addPhaseToUsageTotals(totals: UsageTotals, phase: PhaseMetrics): void {
  totals.totalTokensUsed += toNonNegativeNumber(phase.tokensUsed) ?? 0;
  totals.totalPromptTokensUsed += toNonNegativeNumber(phase.promptTokens) ?? 0;
  totals.totalCompletionTokensUsed += toNonNegativeNumber(phase.completionTokens) ?? 0;
  totals.totalLatencyMs += toNonNegativeNumber(phase.latencyMs) ?? 0;
  totals.totalModelCalls += 1;

  const cost = toNonNegativeNumber(phase.cost);
  if (typeof cost !== "number") return;

  totals.totalCost += cost;
  totals.costMeasuredCalls += 1;
  if (phase.costSource === "estimated") {
    totals.estimatedCost += cost;
    return;
  }
  totals.providerReportedCost += cost;
}

function addTrialToUsageTotals(totals: UsageTotals, trial: TrialResult): void {
  for (const phase of collectTrialPhases(trial)) {
    addPhaseToUsageTotals(totals, phase);
  }
}

async function loadExistingTrials(rawPath: string): Promise<TrialResult[]> {
  if (!(await fileExists(rawPath))) return [];
  const content = await readFile(rawPath, "utf8");
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const parsed: TrialResult[] = [];
  for (const line of lines) {
    try {
      parsed.push(JSON.parse(line) as TrialResult);
    } catch {
      // skip malformed line
    }
  }
  return parsed;
}

async function loadCheckpoint(checkpointPath: string): Promise<RunCheckpoint | null> {
  if (!(await fileExists(checkpointPath))) return null;
  const content = await readFile(checkpointPath, "utf8");
  return JSON.parse(content) as RunCheckpoint;
}

async function saveCheckpoint(checkpointPath: string, checkpoint: RunCheckpoint): Promise<void> {
  checkpoint.updatedAt = new Date().toISOString();
  await writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2));
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

async function runThreePhaseTrial(
  adapter: ModelAdapter,
  generator: TaskGenerator,
  categoryKey: CategoryKey,
  difficulty: number,
  quickMode: boolean,
  callTimeoutMs: number
): Promise<TrialRunResult> {
  const task = generator.generate(difficulty);
  const category = getCategoryOrThrow(categoryKey);

  const phase1Prompt = buildPhase1Prompt(category, difficulty, generator.describeDifficulty(difficulty), quickMode);
  const phase2Prompt = buildPhase2Prompt(task.prompt, quickMode);
  // Phase 1 (self-prediction) and Phase 2 (task execution) are independent by design.
  // Execute them concurrently so there is no sequential coupling through request timing.
  const [phase1, phase2] = await Promise.all([
    safeComplete(adapter, phase1Prompt, `Phase 1 (${categoryKey} d=${difficulty})`, callTimeoutMs),
    safeComplete(adapter, phase2Prompt, `Phase 2 (${categoryKey} d=${difficulty})`, callTimeoutMs)
  ]);
  const phase1Confidence = extractConfidence(phase1.content);
  const evalResult = task.evaluate(phase2.content);

  const phase3Prompt = buildPhase3Prompt(task.prompt, phase2.content, quickMode);
  const phase3 = phase2.failed
    ? {
        content: "",
        tokensUsed: 0,
        latencyMs: 0,
        promptTokens: 0,
        completionTokens: 0,
        cost: 0,
        costSource: "unavailable" as const,
        tokensPerSecond: undefined,
        timeToFirstTokenMs: undefined,
        failed: true
      }
    : await safeComplete(adapter, phase3Prompt, `Phase 3 (${categoryKey} d=${difficulty})`, callTimeoutMs);
  const phase3Confidence = extractConfidence(phase3.content);

  const trial: TrialResult = {
    category: categoryKey,
    difficulty,
    phase1: {
      prompt: phase1Prompt,
      response: phase1.content,
      confidence: phase1Confidence,
      tokensUsed: phase1.tokensUsed,
      latencyMs: phase1.latencyMs,
      promptTokens: phase1.promptTokens,
      completionTokens: phase1.completionTokens,
      cost: phase1.cost,
      costSource: phase1.costSource,
      tokensPerSecond: phase1.tokensPerSecond,
      timeToFirstTokenMs: phase1.timeToFirstTokenMs
    },
    phase2: {
      prompt: phase2Prompt,
      response: phase2.content,
      extractedAnswer: evalResult.extractedAnswer,
      correctAnswer: task.correctAnswer,
      isCorrect: evalResult.isCorrect,
      partialScore: evalResult.partialScore,
      tokensUsed: phase2.tokensUsed,
      latencyMs: phase2.latencyMs,
      promptTokens: phase2.promptTokens,
      completionTokens: phase2.completionTokens,
      cost: phase2.cost,
      costSource: phase2.costSource,
      tokensPerSecond: phase2.tokensPerSecond,
      timeToFirstTokenMs: phase2.timeToFirstTokenMs
    },
    phase3: {
      prompt: phase3Prompt,
      response: phase3.content,
      confidence: phase3Confidence,
      tokensUsed: phase3.tokensUsed,
      latencyMs: phase3.latencyMs,
      promptTokens: phase3.promptTokens,
      completionTokens: phase3.completionTokens,
      cost: phase3.cost,
      costSource: phase3.costSource,
      tokensPerSecond: phase3.tokensPerSecond,
      timeToFirstTokenMs: phase3.timeToFirstTokenMs
    },
    timestamp: new Date().toISOString()
  };

  return {
    trial,
    tokensUsed: phase1.tokensUsed + phase2.tokensUsed + phase3.tokensUsed,
    invalidConfidence: phase1Confidence === null || phase3Confidence === null
  };
}

async function runPhase2Probe(
  adapter: ModelAdapter,
  generator: TaskGenerator,
  difficulty: number,
  trials: number,
  quickMode: boolean,
  callTimeoutMs: number
): Promise<number> {
  let correct = 0;
  for (let i = 0; i < trials; i += 1) {
    const task = generator.generate(difficulty);
    const prompt = buildPhase2Prompt(task.prompt, quickMode);
    const response = await safeComplete(
      adapter,
      prompt,
      `Probe Phase 2 (${generator.key} d=${difficulty})`,
      callTimeoutMs
    );
    const evaluation = task.evaluate(response.content);
    if (evaluation.isCorrect) correct += 1;
  }
  return correct / trials;
}

async function safeComplete(
  adapter: ModelAdapter,
  prompt: string,
  label: string,
  callTimeoutMs: number
): Promise<SafeCompletion> {
  try {
    const result = await withTimeout(adapter.complete(prompt), callTimeoutMs, label);
    return {
      content: result.content,
      tokensUsed: result.tokensUsed,
      latencyMs: result.latencyMs,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      cost: result.cost,
      costSource: result.costSource,
      tokensPerSecond: result.tokensPerSecond,
      timeToFirstTokenMs: result.timeToFirstTokenMs,
      failed: false
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logWarn(`${label} failed: ${message}`);
    return {
      content: "",
      tokensUsed: 0,
      latencyMs: callTimeoutMs,
      costSource: "unavailable",
      failed: true
    };
  }
}

function buildEmptyScoreMap(): Record<CategoryKey, CategoryScore> {
  return Object.fromEntries(CATEGORY_ORDER.map((key) => [key, emptyScore(key)])) as Record<CategoryKey, CategoryScore>;
}

async function runWithConcurrency<T>(
  items: CategoryKey[],
  concurrency: number,
  worker: (item: CategoryKey) => Promise<T>
): Promise<T[]> {
  if (items.length === 0) return [];

  const boundedConcurrency = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array<T>(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: boundedConcurrency }, async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      if (currentIndex >= items.length) return;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  });

  await Promise.all(workers);
  return results;
}

export async function runBenchmark(config: BenchmarkRunnerConfig): Promise<ModelResult> {
  const startedAtMs = Date.now();
  const startedAt = new Date(startedAtMs).toISOString();
  const quickMode = config.quickMode ?? false;
  const quickPoints = Math.max(1, Math.floor(config.quickPoints ?? (quickMode ? 3 : 1)));
  const callTimeoutMs =
    config.callTimeoutMs ??
    Math.max(1_000, Number.parseInt(process.env.BENCHMARK_CALL_TIMEOUT_MS ?? "120000", 10));

  await mkdir(config.outputDir, { recursive: true });

  const scoresPath = path.join(config.outputDir, "scores.json");
  const rawPath = path.join(config.outputDir, "raw-responses.jsonl");
  const checkpointPath = path.join(config.outputDir, "checkpoint.json");

  if (!config.resume) {
    const hasExistingData =
      (await fileExists(rawPath)) || (await fileExists(checkpointPath)) || (await fileExists(scoresPath));
    if (hasExistingData) {
      throw new Error(
        `Output directory already contains benchmark data: ${config.outputDir}. Use --resume ${config.outputDir} or set a new --output directory.`
      );
    }
  }

  const existingTrials = config.resume ? await loadExistingTrials(rawPath) : [];
  const allTrials: TrialResult[] = [...existingTrials];

  let checkpoint = (config.resume ? await loadCheckpoint(checkpointPath) : null) as RunCheckpoint | null;
  if (!checkpoint) {
    checkpoint = {
      version: 1,
      modelId: config.adapter.getModelId(),
      startedAt,
      updatedAt: startedAt,
      quickMode,
      trialsPerDifficulty: config.trialsPerDifficulty,
      categories: {}
    };
    await saveCheckpoint(checkpointPath, checkpoint);
  }

  const categories = [...new Set(config.categories)];
  const scoresByCategory = buildEmptyScoreMap();
  const categoryConcurrency = Math.max(
    1,
    Math.floor(config.categoryConcurrency ?? (quickMode ? categories.length : 1))
  );

  const usageTotals = createUsageTotals();
  for (const existingTrial of allTrials) {
    addTrialToUsageTotals(usageTotals, existingTrial);
  }
  let invalidTrials = allTrials.filter((trial) => trial.phase1.confidence === null || trial.phase3.confidence === null).length;
  let checkpointWriteQueue = Promise.resolve();
  const queueCheckpointSave = async (): Promise<void> => {
    checkpointWriteQueue = checkpointWriteQueue.then(() => saveCheckpoint(checkpointPath, checkpoint));
    await checkpointWriteQueue;
  };

  let rawAppendQueue = Promise.resolve();
  const appendTrial = async (trial: TrialResult): Promise<void> => {
    rawAppendQueue = rawAppendQueue.then(() => appendFile(rawPath, `${JSON.stringify(trial)}\n`));
    await rawAppendQueue;
  };

  const categoryResults = await runWithConcurrency(
    categories,
    categoryConcurrency,
    async (categoryKey): Promise<{ key: CategoryKey; score: CategoryScore }> => {
      const generator = getGeneratorOrThrow(categoryKey);
      const category = getCategoryOrThrow(categoryKey);

      let state = checkpoint.categories[categoryKey];
      if (state && state.quickMode !== quickMode) {
        throw new Error(
          `Cannot resume category '${categoryKey}' with a different quick-mode setting. Existing=${state.quickMode}, requested=${quickMode}`
        );
      }

      if (!state) {
        if (quickMode) {
          const midpoint = Math.round((category.minDifficulty + category.maxDifficulty) / 2);
          const quickSampleDifficulties =
            quickPoints === 1
              ? [midpoint]
              : [...new Set(
                  Array.from({ length: quickPoints }, (_, index) => {
                    const ratio = index / Math.max(1, quickPoints - 1);
                    return Math.round(category.minDifficulty + (category.maxDifficulty - category.minDifficulty) * ratio);
                  }).concat(midpoint)
                )].sort((a, b) => a - b);
          state = {
            boundary: midpoint,
            sampleDifficulties: quickSampleDifficulties,
            quickMode,
            completedByDifficulty: {}
          };
          logInfo(`Category ${category.label}: quick mode difficulties=[${quickSampleDifficulties.join(", ")}]`);
        } else {
          logInfo(`Category ${category.label}: finding transition zone...`);
          const transition = await findTransitionZone(
            {
              minDifficulty: category.minDifficulty,
              maxDifficulty: category.maxDifficulty,
              probeTrials: config.probeTrials ?? 3,
              rampMode: config.rampMode ?? "balanced",
              mandatoryDifficulties: category.anchorDifficulties
            },
            async (difficulty, probeTrials) => {
              const effectiveProbeTrials = Math.max(1, probeTrials);
              logInfo(`Category ${category.label}: probe difficulty=${difficulty} (trials=${effectiveProbeTrials})`);
              return runPhase2Probe(config.adapter, generator, difficulty, effectiveProbeTrials, quickMode, callTimeoutMs);
            }
          );

          logInfo(
            `Category ${category.label}: boundary≈${transition.boundary.toFixed(2)} difficulties=[${transition.sampleDifficulties.join(
              ", "
            )}]`
          );

          state = {
            boundary: transition.boundary,
            sampleDifficulties: transition.sampleDifficulties,
            quickMode,
            completedByDifficulty: {}
          };
        }

        checkpoint.categories[categoryKey] = state;
        await queueCheckpointSave();
      }

      const categoryTrials = allTrials.filter((trial) => trial.category === categoryKey);
      const existingCounts = countByDifficulty(categoryTrials);

      for (const difficulty of state.sampleDifficulties) {
        let completedCount = Math.max(existingCounts.get(difficulty) ?? 0, state.completedByDifficulty[String(difficulty)] ?? 0);
        if (completedCount >= config.trialsPerDifficulty) {
          logInfo(
            `Category ${category.label}: difficulty=${difficulty} already complete (${completedCount}/${config.trialsPerDifficulty})`
          );
          state.completedByDifficulty[String(difficulty)] = completedCount;
          continue;
        }

        while (completedCount < config.trialsPerDifficulty) {
          const result = await runThreePhaseTrial(
            config.adapter,
            generator,
            categoryKey,
            difficulty,
            quickMode,
            callTimeoutMs
          );

          allTrials.push(result.trial);
          categoryTrials.push(result.trial);
          addTrialToUsageTotals(usageTotals, result.trial);
          if (result.invalidConfidence) invalidTrials += 1;

          await appendTrial(result.trial);

          completedCount += 1;
          state.completedByDifficulty[String(difficulty)] = completedCount;
          await queueCheckpointSave();
        }
      }

      const invalidRate =
        categoryTrials.length === 0
          ? 0
          : categoryTrials.filter((trial) => trial.phase1.confidence === null || trial.phase3.confidence === null).length /
            categoryTrials.length;
      const emptyPhase2Rate =
        categoryTrials.length === 0
          ? 0
          : categoryTrials.filter((trial) => trial.phase2.response.trim().length === 0).length / categoryTrials.length;
      const emptyPhase3Rate =
        categoryTrials.length === 0
          ? 0
          : categoryTrials.filter((trial) => trial.phase3.response.trim().length === 0).length / categoryTrials.length;

      if (invalidRate > 0.2) {
        logWarn(`${category.label}: confidence extraction failed in ${(invalidRate * 100).toFixed(1)}% of trials.`);
      }
      if (emptyPhase2Rate > 0.2) {
        logWarn(`${category.label}: Phase 2 returned empty output in ${(emptyPhase2Rate * 100).toFixed(1)}% of trials.`);
      }
      if (emptyPhase3Rate > 0.2) {
        logWarn(`${category.label}: Phase 3 returned empty output in ${(emptyPhase3Rate * 100).toFixed(1)}% of trials.`);
      }

      return {
        key: categoryKey,
        score: computeCategoryScore(categoryKey, categoryTrials, state.boundary)
      };
    }
  );

  for (const categoryResult of categoryResults) {
    scoresByCategory[categoryResult.key] = categoryResult.score;
  }

  await rawAppendQueue;
  await checkpointWriteQueue;

  const activeScores = categories.map((key) => scoresByCategory[key]);
  const aggregate = computeAggregateScores(activeScores);
  const runDurationMs = Math.max(0, Date.now() - startedAtMs);
  const averageLatencyMs =
    usageTotals.totalModelCalls > 0 ? usageTotals.totalLatencyMs / usageTotals.totalModelCalls : 0;
  const missingCostCalls = Math.max(0, usageTotals.totalModelCalls - usageTotals.costMeasuredCalls);

  const result: ModelResult = {
    modelId: config.adapter.getModelId(),
    modelDisplayName: config.adapter.getModelId(),
    timestamp: startedAt,
    categories: scoresByCategory,
    aggregate,
    metadata: {
      adapter: config.adapterName,
      temperature: config.temperature,
      totalTokensUsed: usageTotals.totalTokensUsed,
      totalPromptTokensUsed: usageTotals.totalPromptTokensUsed,
      totalCompletionTokensUsed: usageTotals.totalCompletionTokensUsed,
      totalCost: usageTotals.costMeasuredCalls > 0 ? usageTotals.totalCost : undefined,
      providerReportedCost: usageTotals.providerReportedCost,
      estimatedCost: usageTotals.estimatedCost,
      costMeasuredCalls: usageTotals.costMeasuredCalls,
      missingCostCalls,
      totalModelCalls: usageTotals.totalModelCalls,
      totalLatencyMs: usageTotals.totalLatencyMs,
      averageLatencyMs,
      runDurationMs,
      trialsPerDifficulty: config.trialsPerDifficulty,
      probeTrials: config.probeTrials ?? 3,
      quickMode,
      rampMode: config.rampMode ?? "balanced",
      totalTrials: allTrials.length,
      invalidTrials
    }
  };

  await writeFile(scoresPath, JSON.stringify(result, null, 2));
  await saveCheckpoint(checkpointPath, checkpoint);

  logInfo(`Saved ${scoresPath}`);
  logInfo(`Saved ${rawPath}`);
  logInfo(`Saved ${checkpointPath}`);

  return result;
}
