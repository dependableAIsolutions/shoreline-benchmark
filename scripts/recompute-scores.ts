import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CATEGORY_ORDER,
  type CategoryKey,
  type CategoryScore,
  type ModelResult,
  type TrialResult
} from "@shoreline/shared";
import { computeAggregateScores, computeCategoryScore } from "@shoreline/harness";

interface CheckpointCategory {
  boundary?: number;
}

interface CheckpointFile {
  categories?: Partial<Record<CategoryKey, CheckpointCategory>>;
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
        return [JSON.parse(line) as TrialResult];
      } catch {
        return [];
      }
    });
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

  const totalTokensUsed = trials.reduce(
    (sum, trial) => sum + trial.phase1.tokensUsed + trial.phase2.tokensUsed + trial.phase3.tokensUsed,
    0
  );
  const invalidTrials = trials.filter((trial) => trial.phase1.confidence === null || trial.phase3.confidence === null)
    .length;

  const timestamp = previousScore?.timestamp ?? trials[0]?.timestamp ?? new Date().toISOString();
  const modelId = previousScore?.modelId ?? modelDirName;
  const modelDisplayName = previousScore?.modelDisplayName ?? modelId;

  const updated: ModelResult = {
    modelId,
    modelDisplayName,
    timestamp,
    categories: categoryScores,
    aggregate,
    metadata: {
      adapter: previousScore?.metadata?.adapter ?? "localapi",
      temperature: previousScore?.metadata?.temperature ?? 0.7,
      totalTokensUsed,
      totalCost: previousScore?.metadata?.totalCost,
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
