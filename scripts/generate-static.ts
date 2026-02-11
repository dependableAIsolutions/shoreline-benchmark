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

function createSample(trial: RawTrial, pattern: SampleResult["pattern"], patternLabel: string): SampleResult {
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
    patternLabel
  };
}

async function extractSampleResponses(rawResponsesPath: string): Promise<SampleResult[]> {
  const categorySamples = new Map<string, SampleResult>();

  try {
    const rl = createInterface({
      input: createReadStream(rawResponsesPath),
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      if (!line.trim()) continue;
      const trial = JSON.parse(line) as RawTrial;

      // Skip trials with empty responses (timeouts, failures)
      if (!isValidTrial(trial)) continue;

      const { pattern, patternLabel } = classifyPattern(trial);

      // One sample per category, prefer true_positive if available
      if (!categorySamples.has(trial.category)) {
        categorySamples.set(trial.category, createSample(trial, pattern, patternLabel));
      } else if (pattern === "true_positive" && categorySamples.get(trial.category)?.pattern !== "true_positive") {
        // Upgrade to true_positive if we had a different pattern
        categorySamples.set(trial.category, createSample(trial, pattern, patternLabel));
      }
    }
  } catch {
    // File might not exist
  }

  // Return samples sorted by category
  return [...categorySamples.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, sample]) => sample);
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

  const runInfos = await findRunFiles(input);
  const results: Array<{ result: ModelResult; samples: SampleResult[]; runDir: string }> = [];

  for (const { scoreFile, rawResponsesFile } of runInfos) {
    const content = await readFile(scoreFile, "utf8");
    const result = JSON.parse(content) as ModelResult;
    const samples = await extractSampleResponses(rawResponsesFile);
    results.push({ result, samples, runDir: path.dirname(scoreFile) });
  }

  // Keep only the latest run per model
  const latestByModel = new Map<string, { result: ModelResult; samples: SampleResult[]; runDir: string }>();
  for (const { result, samples, runDir } of results) {
    const existing = latestByModel.get(result.modelId);
    if (!existing || isBetterRun({ result, samples }, existing)) {
      latestByModel.set(result.modelId, { result, samples, runDir });
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

  for (const selected of latest) {
    const coverage = categoriesWithTrials(selected.result);
    console.log(
      `Selected ${selected.result.modelId}: timestamp=${selected.result.timestamp} coverage=${coverage} categories totalTrials=${selected.result.metadata.totalTrials} run=${selected.runDir}`
    );
  }

  console.log(`Wrote ${latestResults.length} model result(s) to ${jsonPath}`);
  console.log(`Wrote ${tsPath}`);
  console.log(`Wrote sample responses for ${Object.keys(samplesByModel).length} model(s) to ${samplesPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
