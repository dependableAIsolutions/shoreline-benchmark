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
  resume?: boolean;
}

interface TrialRunResult {
  trial: TrialResult;
  tokensUsed: number;
  invalidConfidence: boolean;
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

async function runThreePhaseTrial(
  adapter: ModelAdapter,
  generator: TaskGenerator,
  categoryKey: CategoryKey,
  difficulty: number,
  quickMode: boolean
): Promise<TrialRunResult> {
  const task = generator.generate(difficulty);
  const category = getCategoryOrThrow(categoryKey);

  const phase1Prompt = buildPhase1Prompt(category, difficulty, generator.describeDifficulty(difficulty), quickMode);
  const phase1 = await adapter.complete(phase1Prompt);
  const phase1Confidence = extractConfidence(phase1.content);

  const phase2Prompt = buildPhase2Prompt(task.prompt, quickMode);
  const phase2 = await adapter.complete(phase2Prompt);
  const evalResult = task.evaluate(phase2.content);

  const phase3Prompt = buildPhase3Prompt(task.prompt, phase2.content, quickMode);
  const phase3 = await adapter.complete(phase3Prompt);
  const phase3Confidence = extractConfidence(phase3.content);

  const trial: TrialResult = {
    category: categoryKey,
    difficulty,
    phase1: {
      prompt: phase1Prompt,
      response: phase1.content,
      confidence: phase1Confidence,
      tokensUsed: phase1.tokensUsed,
      latencyMs: phase1.latencyMs
    },
    phase2: {
      prompt: phase2Prompt,
      response: phase2.content,
      extractedAnswer: evalResult.extractedAnswer,
      correctAnswer: task.correctAnswer,
      isCorrect: evalResult.isCorrect,
      partialScore: evalResult.partialScore,
      tokensUsed: phase2.tokensUsed,
      latencyMs: phase2.latencyMs
    },
    phase3: {
      prompt: phase3Prompt,
      response: phase3.content,
      confidence: phase3Confidence,
      tokensUsed: phase3.tokensUsed,
      latencyMs: phase3.latencyMs
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
  quickMode: boolean
): Promise<number> {
  let correct = 0;
  for (let i = 0; i < trials; i += 1) {
    const task = generator.generate(difficulty);
    const prompt = buildPhase2Prompt(task.prompt, quickMode);
    const response = await adapter.complete(prompt);
    const evaluation = task.evaluate(response.content);
    if (evaluation.isCorrect) correct += 1;
  }
  return correct / trials;
}

function buildEmptyScoreMap(): Record<CategoryKey, CategoryScore> {
  return Object.fromEntries(CATEGORY_ORDER.map((key) => [key, emptyScore(key)])) as Record<CategoryKey, CategoryScore>;
}

export async function runBenchmark(config: BenchmarkRunnerConfig): Promise<ModelResult> {
  const startedAt = new Date().toISOString();
  const quickMode = config.quickMode ?? false;

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

  let totalTokensUsed = allTrials.reduce(
    (sum, trial) => sum + trial.phase1.tokensUsed + trial.phase2.tokensUsed + trial.phase3.tokensUsed,
    0
  );
  let invalidTrials = allTrials.filter((trial) => trial.phase1.confidence === null || trial.phase3.confidence === null).length;

  for (const categoryKey of categories) {
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
        state = {
          boundary: midpoint,
          sampleDifficulties: [midpoint],
          quickMode,
          completedByDifficulty: {}
        };
        logInfo(`Category ${category.label}: quick mode at difficulty=${midpoint}`);
      } else {
        logInfo(`Category ${category.label}: finding transition zone...`);
        const transition = await findTransitionZone(
          {
            minDifficulty: category.minDifficulty,
            maxDifficulty: category.maxDifficulty,
            probeTrials: config.probeTrials ?? 3
          },
          async (difficulty, probeTrials) =>
            runPhase2Probe(config.adapter, generator, difficulty, probeTrials, quickMode)
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
      await saveCheckpoint(checkpointPath, checkpoint);
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
        const result = await runThreePhaseTrial(config.adapter, generator, categoryKey, difficulty, quickMode);

        allTrials.push(result.trial);
        categoryTrials.push(result.trial);
        totalTokensUsed += result.tokensUsed;
        if (result.invalidConfidence) invalidTrials += 1;

        await appendFile(rawPath, `${JSON.stringify(result.trial)}\n`);

        completedCount += 1;
        state.completedByDifficulty[String(difficulty)] = completedCount;
        await saveCheckpoint(checkpointPath, checkpoint);
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

    scoresByCategory[categoryKey] = computeCategoryScore(categoryKey, categoryTrials, state.boundary);
  }

  const activeScores = categories.map((key) => scoresByCategory[key]);
  const aggregate = computeAggregateScores(activeScores);

  const result: ModelResult = {
    modelId: config.adapter.getModelId(),
    modelDisplayName: config.adapter.getModelId(),
    timestamp: startedAt,
    categories: scoresByCategory,
    aggregate,
    metadata: {
      adapter: config.adapterName,
      temperature: config.temperature,
      totalTokensUsed,
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
