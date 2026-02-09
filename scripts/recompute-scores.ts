import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CATEGORY_ORDER,
  type CategoryKey,
  type CategoryScore,
  type ModelResult,
  type TrialResult
} from "@shoreline/shared";
import {
  computeAggregateScores,
  computeCategoryScore,
  extractAnswerLine,
  extractConfidence,
  extractLastInteger
} from "@shoreline/harness";

interface CheckpointCategory {
  boundary?: number;
}

interface CheckpointFile {
  modelId?: string;
  categories?: Partial<Record<CategoryKey, CheckpointCategory>>;
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

function parseArg(name: string): string | undefined {
  const prefixed = `--${name}`;
  const found = process.argv.find((arg) => arg.startsWith(`${prefixed}=`));
  if (found) return found.slice(prefixed.length + 1);
  const idx = process.argv.indexOf(prefixed);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

function emptyScore(category: CategoryKey): CategoryScore {
  return {
    category,
    claimed: 0,
    sand: 0,
    solid: 0,
    concrete: 0,
    discernment: 0,
    calibrationError: 0,
    capability: 0,
    trialCount: 0,
    difficultyRange: [0, 0],
    transitionZone: 0
  };
}

function parseRawTrials(content: string): TrialResult[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .flatMap((line) => {
      try {
        const parsed = JSON.parse(line) as TrialResult;
        const p1Confidence = extractConfidence(parsed.phase1.response);
        const p3Confidence = extractConfidence(parsed.phase3.response);
        const numericAnswerCategories: CategoryKey[] = ["mult", "modexp", "matrix", "combo", "counting", "bool"];
        const shouldReextractPhase2 = numericAnswerCategories.includes(parsed.category);
        const phase2AnswerText = shouldReextractPhase2 ? extractAnswerLine(parsed.phase2.response) ?? parsed.phase2.response : null;
        const extractedPhase2 = shouldReextractPhase2 ? extractLastInteger(phase2AnswerText ?? "") ?? "" : parsed.phase2.extractedAnswer;
        const normalizedPhase2 =
          parsed.category === "bool" ? (extractedPhase2 === "0" || extractedPhase2 === "1" ? extractedPhase2 : "") : extractedPhase2;
        const normalizedCorrect =
          shouldReextractPhase2 ? String(parsed.phase2.correctAnswer ?? "").replaceAll(",", "").trim() : parsed.phase2.correctAnswer;

        return [
          {
            ...parsed,
            phase1: {
              ...parsed.phase1,
              confidence: p1Confidence
            },
            phase2: shouldReextractPhase2
              ? {
                  ...parsed.phase2,
                  extractedAnswer: normalizedPhase2,
                  isCorrect: normalizedPhase2 === normalizedCorrect
                }
              : parsed.phase2,
            phase3: {
              ...parsed.phase3,
              confidence: p3Confidence
            }
          }
        ];
      } catch {
        return [];
      }
    });
}

function toNonNegativeNumber(value: unknown): number | undefined {
  if (typeof value !== "number") return undefined;
  if (!Number.isFinite(value) || value < 0) return undefined;
  return value;
}

function collectUsageTotals(trials: TrialResult[]): UsageTotals {
  const totals: UsageTotals = {
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

  for (const trial of trials) {
    const phases: PhaseMetrics[] = [trial.phase1, trial.phase2, trial.phase3];
    for (const phase of phases) {
      totals.totalTokensUsed += toNonNegativeNumber(phase.tokensUsed) ?? 0;
      totals.totalPromptTokensUsed += toNonNegativeNumber(phase.promptTokens) ?? 0;
      totals.totalCompletionTokensUsed += toNonNegativeNumber(phase.completionTokens) ?? 0;
      totals.totalLatencyMs += toNonNegativeNumber(phase.latencyMs) ?? 0;
      totals.totalModelCalls += 1;

      const cost = toNonNegativeNumber(phase.cost);
      if (typeof cost !== "number") continue;

      totals.totalCost += cost;
      totals.costMeasuredCalls += 1;
      if (phase.costSource === "estimated") {
        totals.estimatedCost += cost;
      } else {
        totals.providerReportedCost += cost;
      }
    }
  }

  return totals;
}

async function recomputeRun(modelDirPath: string, runDirPath: string, modelDirName: string): Promise<boolean> {
  const rawPath = path.join(runDirPath, "raw-responses.jsonl");
  const scorePath = path.join(runDirPath, "scores.json");
  const checkpointPath = path.join(runDirPath, "checkpoint.json");

  if (!(await fileExists(rawPath))) return false;

  const rawContent = await readFile(rawPath, "utf8");
  const trials = parseRawTrials(rawContent);
  if (trials.length === 0) return false;

  const previousScore = (await fileExists(scorePath)) ? await readJson<ModelResult>(scorePath) : null;
  const checkpoint = (await fileExists(checkpointPath)) ? await readJson<CheckpointFile>(checkpointPath) : null;

  const categories = [...new Set(trials.map((trial) => trial.category))] as CategoryKey[];
  const categoryScores = Object.fromEntries(CATEGORY_ORDER.map((key) => [key, emptyScore(key)])) as Record<
    CategoryKey,
    CategoryScore
  >;

  for (const category of categories) {
    const categoryTrials = trials.filter((trial) => trial.category === category);
    const fallbackBoundary =
      categoryTrials.reduce((sum, trial) => sum + trial.difficulty, 0) / Math.max(1, categoryTrials.length);
    const transition = checkpoint?.categories?.[category]?.boundary ?? fallbackBoundary;
    categoryScores[category] = computeCategoryScore(category, categoryTrials, transition);
  }

  const aggregate = computeAggregateScores(categories.map((category) => categoryScores[category]));

  const usageTotals = collectUsageTotals(trials);
  const invalidTrials = trials.filter((trial) => trial.phase1.confidence === null || trial.phase3.confidence === null)
    .length;
  const missingCostCalls = Math.max(0, usageTotals.totalModelCalls - usageTotals.costMeasuredCalls);
  const averageLatencyMs =
    usageTotals.totalModelCalls > 0 ? usageTotals.totalLatencyMs / usageTotals.totalModelCalls : 0;

  const timestamp = previousScore?.timestamp ?? trials[0]?.timestamp ?? new Date().toISOString();
  const modelId = checkpoint?.modelId ?? previousScore?.modelId ?? modelDirName;
  const modelDisplayName = checkpoint?.modelId ?? previousScore?.modelDisplayName ?? modelId;

  const updated: ModelResult = {
    modelId,
    modelDisplayName,
    timestamp,
    categories: categoryScores,
    aggregate,
    metadata: {
      adapter: previousScore?.metadata?.adapter ?? "localapi",
      temperature: previousScore?.metadata?.temperature ?? 0.7,
      totalTokensUsed: usageTotals.totalTokensUsed,
      totalPromptTokensUsed: usageTotals.totalPromptTokensUsed,
      totalCompletionTokensUsed: usageTotals.totalCompletionTokensUsed,
      totalCost: usageTotals.costMeasuredCalls > 0 ? usageTotals.totalCost : previousScore?.metadata?.totalCost,
      providerReportedCost:
        usageTotals.costMeasuredCalls > 0 ? usageTotals.providerReportedCost : previousScore?.metadata?.providerReportedCost,
      estimatedCost: usageTotals.costMeasuredCalls > 0 ? usageTotals.estimatedCost : previousScore?.metadata?.estimatedCost,
      costMeasuredCalls: usageTotals.costMeasuredCalls,
      missingCostCalls,
      totalModelCalls: usageTotals.totalModelCalls,
      totalLatencyMs: usageTotals.totalLatencyMs,
      averageLatencyMs,
      runDurationMs: previousScore?.metadata?.runDurationMs,
      totalTrials: trials.length,
      invalidTrials
    }
  };

  await writeFile(scorePath, JSON.stringify(updated, null, 2));
  return true;
}

async function main(): Promise<void> {
  const inputRoot = path.resolve(parseArg("input") ?? path.join(process.cwd(), "results"));
  const modelDirs = await readdir(inputRoot, { withFileTypes: true });

  let touched = 0;
  for (const modelDir of modelDirs) {
    if (!modelDir.isDirectory()) continue;
    const modelDirPath = path.join(inputRoot, modelDir.name);
    const runDirs = await readdir(modelDirPath, { withFileTypes: true });

    for (const runDir of runDirs) {
      if (!runDir.isDirectory()) continue;
      const runDirPath = path.join(modelDirPath, runDir.name);
      const updated = await recomputeRun(modelDirPath, runDirPath, modelDir.name);
      if (updated) {
        touched += 1;
        console.log(`recomputed: ${path.join(modelDir.name, runDir.name)}`);
      }
    }
  }

  console.log(`Done. recomputed runs: ${touched}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
