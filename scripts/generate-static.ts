import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";
import type { ModelResult, CategoryKey } from "@shoreline/shared";

interface RawTrial {
  category: CategoryKey;
  difficulty: number;
  phase1: { prompt: string; response: string; confidence: number | null };
  phase2: { prompt: string; response: string; extractedAnswer: string; correctAnswer: string; isCorrect: boolean; partialScore?: number };
  phase3: { prompt: string; response: string; confidence: number | null };
  timestamp: string;
}

interface SampleResult {
  category: CategoryKey;
  difficulty: number;
  phase1: { prompt: string; response: string; confidence: number | null };
  phase2: { prompt: string; response: string; extractedAnswer: string; correctAnswer: string; isCorrect: boolean; partialScore?: number };
  phase3: { prompt: string; response: string; confidence: number | null };
  pattern: "true_positive" | "true_negative" | "false_confidence" | "blind_spot";
  patternLabel: string;
}

interface FullTrialResult extends SampleResult {
  timestamp: string;
}

interface FullTrialsIndexEntry {
  file: string;
  totalTrials: number;
  representativeSamples: number;
}

function classifyPattern(trial: RawTrial): { pattern: SampleResult["pattern"]; patternLabel: string } {
  const isCorrect = trial.phase2.isCorrect || (trial.phase2.partialScore !== undefined && trial.phase2.partialScore >= 0.7);
  const p3Confidence = trial.phase3.confidence ?? 50;
  const highConfidence = p3Confidence >= 60;
  const lowConfidence = p3Confidence < 40;

  if (isCorrect && highConfidence) {
    return { pattern: "true_positive", patternLabel: "Correct + Confident (True Positive)" };
  } else if (!isCorrect && lowConfidence) {
    return { pattern: "true_negative", patternLabel: "Wrong + Doubted (True Negative)" };
  } else if (!isCorrect && highConfidence) {
    return { pattern: "false_confidence", patternLabel: "Wrong + Confident (False Confidence)" };
  } else {
    return { pattern: "blind_spot", patternLabel: "Correct + Doubted (Blind Spot)" };
  }
}

function isValidTrial(trial: RawTrial): boolean {
  // Filter out trials with empty responses (timeouts, failures)
  return Boolean(
    trial.phase1.response?.trim() &&
    trial.phase2.response?.trim()
  );
}

function createTrialResult(trial: RawTrial, pattern: SampleResult["pattern"], patternLabel: string): FullTrialResult {
  return {
    category: trial.category,
    difficulty: trial.difficulty,
    phase1: {
      prompt: trial.phase1.prompt,
      response: trial.phase1.response,
      confidence: trial.phase1.confidence
    },
    phase2: {
      prompt: trial.phase2.prompt,
      response: trial.phase2.response,
      extractedAnswer: trial.phase2.extractedAnswer,
      correctAnswer: trial.phase2.correctAnswer,
      isCorrect: trial.phase2.isCorrect,
      partialScore: trial.phase2.partialScore
    },
    phase3: {
      prompt: trial.phase3.prompt,
      response: trial.phase3.response,
      confidence: trial.phase3.confidence
    },
    pattern,
    patternLabel,
    timestamp: trial.timestamp
  };
}

function toSampleResult(trial: FullTrialResult): SampleResult {
  return {
    category: trial.category,
    difficulty: trial.difficulty,
    phase1: trial.phase1,
    phase2: trial.phase2,
    phase3: trial.phase3,
    pattern: trial.pattern,
    patternLabel: trial.patternLabel
  };
}

function toRepresentativeSamples(trials: FullTrialResult[]): SampleResult[] {
  const categorySamples = new Map<string, SampleResult>();

  for (const trial of trials) {
    // Keep sample view clean for quick scanning.
    if (!isValidTrial(trial)) continue;

    // One sample per category, prefer true_positive if available
    if (!categorySamples.has(trial.category)) {
      categorySamples.set(trial.category, toSampleResult(trial));
    } else if (trial.pattern === "true_positive" && categorySamples.get(trial.category)?.pattern !== "true_positive") {
      categorySamples.set(trial.category, toSampleResult(trial));
    }
  }

  return [...categorySamples.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, sample]) => sample);
}

async function extractFullTrialResponses(rawResponsesPath: string): Promise<FullTrialResult[]> {
  const allTrials: FullTrialResult[] = [];

  try {
    const rl = createInterface({
      input: createReadStream(rawResponsesPath),
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      if (!line.trim()) continue;
      const trial = JSON.parse(line) as RawTrial;
      const { pattern, patternLabel } = classifyPattern(trial);
      allTrials.push(createTrialResult(trial, pattern, patternLabel));
    }
  } catch {
    // File might not exist
  }

  return allTrials;
}

function modelIdToFileStem(modelId: string): string {
  return modelId
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseArg(name: string): string | undefined {
  const prefixed = `--${name}`;
  const found = process.argv.find((arg) => arg.startsWith(`${prefixed}=`));
  if (found) return found.slice(prefixed.length + 1);
  const idx = process.argv.indexOf(prefixed);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

interface RunInfo {
  scoreFile: string;
  rawResponsesFile: string;
  runDir: string;
}

function categoriesWithTrials(result: ModelResult): number {
  return Object.values(result.categories).filter((category) => category.trialCount > 0).length;
}

function isBetterRun(
  incoming: { result: ModelResult },
  current: { result: ModelResult }
): boolean {
  const incomingCoverage = categoriesWithTrials(incoming.result);
  const currentCoverage = categoriesWithTrials(current.result);
  if (incomingCoverage !== currentCoverage) return incomingCoverage > currentCoverage;

  const incomingTimestamp = new Date(incoming.result.timestamp).getTime();
  const currentTimestamp = new Date(current.result.timestamp).getTime();
  if (incomingTimestamp !== currentTimestamp) return incomingTimestamp > currentTimestamp;

  const incomingTrials = incoming.result.metadata.totalTrials;
  const currentTrials = current.result.metadata.totalTrials;
  if (incomingTrials !== currentTrials) return incomingTrials > currentTrials;
  return false;
}

async function findRunFiles(inputDir: string): Promise<RunInfo[]> {
  const models = await readdir(inputDir, { withFileTypes: true });
  const runs: RunInfo[] = [];

  for (const modelDir of models) {
    if (!modelDir.isDirectory()) continue;
    const modelPath = path.join(inputDir, modelDir.name);
    const runDirs = await readdir(modelPath, { withFileTypes: true });

    for (const runDir of runDirs) {
      if (!runDir.isDirectory()) continue;
      const runPath = path.join(modelPath, runDir.name);
      const scoreFile = path.join(runPath, "scores.json");
      const rawResponsesFile = path.join(runPath, "raw-responses.jsonl");
      try {
        await readFile(scoreFile, "utf8");
        runs.push({ scoreFile, rawResponsesFile, runDir: runPath });
      } catch {
        // skip
      }
    }
  }

  return runs;
}

async function main(): Promise<void> {
  const input = parseArg("input") ?? path.join(process.cwd(), "results");
  const output = parseArg("output") ?? path.join(process.cwd(), "apps", "web", "src", "data");
  const publicOutput =
    parseArg("publicOutput") ?? path.join(process.cwd(), "apps", "web", "public", "data", "full-trials");

  const runInfos = await findRunFiles(input);
  const results: Array<{ result: ModelResult; samples: SampleResult[]; fullTrials: FullTrialResult[]; runDir: string }> = [];

  for (const { scoreFile, rawResponsesFile } of runInfos) {
    const content = await readFile(scoreFile, "utf8");
    const result = JSON.parse(content) as ModelResult;
    const fullTrials = await extractFullTrialResponses(rawResponsesFile);
    const samples = toRepresentativeSamples(fullTrials);
    results.push({ result, samples, fullTrials, runDir: path.dirname(scoreFile) });
  }

  // Keep only the latest run per model
  const latestByModel = new Map<string, { result: ModelResult; samples: SampleResult[]; fullTrials: FullTrialResult[]; runDir: string }>();
  for (const { result, samples, fullTrials, runDir } of results) {
    const existing = latestByModel.get(result.modelId);
    if (!existing || isBetterRun({ result, samples }, existing)) {
      latestByModel.set(result.modelId, { result, samples, fullTrials, runDir });
    }
  }

  const latest = [...latestByModel.values()].sort((a, b) => b.result.aggregate.avgConcrete - a.result.aggregate.avgConcrete);
  const latestResults = latest.map(({ result }) => result);

  // Build samples by model ID
  const samplesByModel: Record<string, SampleResult[]> = {};
  for (const { result, samples } of latest) {
    samplesByModel[result.modelId] = samples;
  }

  await mkdir(output, { recursive: true });
  await mkdir(publicOutput, { recursive: true });

  // Write results
  const jsonPath = path.join(output, "results.generated.json");
  const tsPath = path.join(output, "results.generated.ts");
  await writeFile(jsonPath, JSON.stringify(latestResults, null, 2));
  await writeFile(tsPath, `import type { ModelResult } from "@shoreline/shared";\n\nexport const generatedResults: ModelResult[] = ${JSON.stringify(latestResults, null, 2)};\n`);

  // Write sample responses
  const samplesPath = path.join(output, "samples.generated.ts");
  const samplesJson = path.join(output, "samples.generated.json");

  const samplesContent = `import type { CategoryKey } from "@shoreline/shared";

export interface SampleResult {
  category: CategoryKey;
  difficulty: number;
  phase1: { prompt: string; response: string; confidence: number | null };
  phase2: { prompt: string; response: string; extractedAnswer: string; correctAnswer: string; isCorrect: boolean; partialScore?: number };
  phase3: { prompt: string; response: string; confidence: number | null };
  pattern: "true_positive" | "true_negative" | "false_confidence" | "blind_spot";
  patternLabel: string;
}

export const samplesByModel: Record<string, SampleResult[]> = ${JSON.stringify(samplesByModel, null, 2)};
`;

  await writeFile(samplesPath, samplesContent);
  await writeFile(samplesJson, JSON.stringify(samplesByModel, null, 2));

  const fullTrialsIndexByModel: Record<string, FullTrialsIndexEntry> = {};
  for (const { result, samples, fullTrials } of latest) {
    const fileStem = modelIdToFileStem(result.modelId);
    const fileName = `${fileStem}.json`;
    const filePath = path.join(publicOutput, fileName);
    await writeFile(filePath, JSON.stringify(fullTrials, null, 2));
    fullTrialsIndexByModel[result.modelId] = {
      file: `/data/full-trials/${fileName}`,
      totalTrials: fullTrials.length,
      representativeSamples: samples.length
    };
  }

  const fullIndexTsPath = path.join(output, "full-trials-index.generated.ts");
  const fullIndexJsonPath = path.join(output, "full-trials-index.generated.json");
  const fullIndexContent = `export interface FullTrialsIndexEntry {
  file: string;
  totalTrials: number;
  representativeSamples: number;
}

export const fullTrialsIndexByModel: Record<string, FullTrialsIndexEntry> = ${JSON.stringify(fullTrialsIndexByModel, null, 2)};
`;

  await writeFile(fullIndexTsPath, fullIndexContent);
  await writeFile(fullIndexJsonPath, JSON.stringify(fullTrialsIndexByModel, null, 2));

  for (const selected of latest) {
    const coverage = categoriesWithTrials(selected.result);
    console.log(
      `Selected ${selected.result.modelId}: timestamp=${selected.result.timestamp} coverage=${coverage} categories totalTrials=${selected.result.metadata.totalTrials} run=${selected.runDir}`
    );
  }

  console.log(`Wrote ${latestResults.length} model result(s) to ${jsonPath}`);
  console.log(`Wrote ${tsPath}`);
  console.log(`Wrote sample responses for ${Object.keys(samplesByModel).length} model(s) to ${samplesPath}`);
  console.log(`Wrote full trial index to ${fullIndexTsPath}`);
  console.log(`Wrote full trial files to ${publicOutput}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
