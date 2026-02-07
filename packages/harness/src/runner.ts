import { mkdir, writeFile } from "node:fs/promises";
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
}

interface TrialRunResult {
  trial: TrialResult;
  tokensUsed: number;
  invalidConfidence: boolean;
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
  trials: number
): Promise<number> {
  let correct = 0;
  for (let i = 0; i < trials; i += 1) {
    const task = generator.generate(difficulty);
    const prompt = buildPhase2Prompt(task.prompt);
    const response = await adapter.complete(prompt);
    const evaluation = task.evaluate(response.content);
    if (evaluation.isCorrect) correct += 1;
  }
  return correct / trials;
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

export async function runBenchmark(config: BenchmarkRunnerConfig): Promise<ModelResult> {
  const startedAt = new Date().toISOString();
  await mkdir(config.outputDir, { recursive: true });

  const categories = [...new Set(config.categories)];
  const scoresByCategory = Object.fromEntries(CATEGORY_ORDER.map((key) => [key, emptyScore(key)])) as Record<
    CategoryKey,
    CategoryScore
  >;

  const allTrials: TrialResult[] = [];
  let totalTokensUsed = 0;
  let invalidTrials = 0;

  for (const categoryKey of categories) {
    const generator = getGeneratorOrThrow(categoryKey);
    const category = getCategoryOrThrow(categoryKey);
    let transition:
      | {
          boundary: number;
          sampleDifficulties: number[];
        }
      | undefined;

    if (config.quickMode) {
      const midpoint = Math.round((category.minDifficulty + category.maxDifficulty) / 2);
      transition = {
        boundary: midpoint,
        sampleDifficulties: [midpoint]
      };
      logInfo(`Category ${category.label}: quick mode at difficulty=${midpoint}`);
    } else {
      logInfo(`Category ${category.label}: finding transition zone...`);
      transition = await findTransitionZone(
        {
          minDifficulty: category.minDifficulty,
          maxDifficulty: category.maxDifficulty,
          probeTrials: config.probeTrials ?? 3
        },
        async (difficulty, probeTrials) => runPhase2Probe(config.adapter, generator, difficulty, probeTrials)
      );

      logInfo(
        `Category ${category.label}: boundary≈${transition.boundary.toFixed(2)} difficulties=[${transition.sampleDifficulties.join(
          ", "
        )}]`
      );
    }

    const categoryTrials: TrialResult[] = [];

    for (const difficulty of transition.sampleDifficulties) {
      for (let trialIndex = 0; trialIndex < config.trialsPerDifficulty; trialIndex += 1) {
        const result = await runThreePhaseTrial(config.adapter, generator, categoryKey, difficulty, config.quickMode ?? false);
        categoryTrials.push(result.trial);
        allTrials.push(result.trial);
        totalTokensUsed += result.tokensUsed;
        if (result.invalidConfidence) invalidTrials += 1;
      }
    }

    const invalidRate = categoryTrials.length === 0 ? 0 : categoryTrials.filter((trial) => trial.phase1.confidence === null || trial.phase3.confidence === null).length / categoryTrials.length;
    if (invalidRate > 0.2) {
      logWarn(`${category.label}: confidence extraction failed in ${(invalidRate * 100).toFixed(1)}% of trials.`);
    }

    const score = computeCategoryScore(categoryKey, categoryTrials, transition.boundary);
    scoresByCategory[categoryKey] = score;
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

  const scoresPath = path.join(config.outputDir, "scores.json");
  const rawPath = path.join(config.outputDir, "raw-responses.jsonl");

  await writeFile(scoresPath, JSON.stringify(result, null, 2));
  await writeFile(rawPath, allTrials.map((trial) => JSON.stringify(trial)).join("\n"));

  logInfo(`Saved ${scoresPath}`);
  logInfo(`Saved ${rawPath}`);

  return result;
}
