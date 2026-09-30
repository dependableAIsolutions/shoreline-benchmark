import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

it("static generation keeps valid trials after a malformed JSONL line", async () => {
  const fixtureDir = await mkdtemp(path.join(os.tmpdir(), "shoreline-jsonl-recovery-"));
  const runDir = path.join(fixtureDir, "input", "test-model", "run-1");
  const outputDir = path.join(fixtureDir, "output");
  const publicOutputDir = path.join(fixtureDir, "public");
  await mkdir(runDir, { recursive: true });

  await writeFile(path.join(runDir, "scores.json"), JSON.stringify({
    modelId: "test-model",
    timestamp: "2026-01-01T00:00:00.000Z",
    categories: {},
    aggregate: { avgConcrete: 0 },
    metadata: { totalTrials: 2 }
  }));

  const trial = (timestamp: string) => ({
    category: "logic",
    difficulty: 1,
    phase1: { prompt: "Question", response: "First response", confidence: 50 },
    phase2: { prompt: "Answer", response: "Second response", extractedAnswer: "yes", correctAnswer: "yes", isCorrect: true },
    phase3: { prompt: "Confidence", response: "Confident", confidence: 80 },
    timestamp
  });
  const rawResponses = [
    JSON.stringify(trial("2026-01-01T00:00:01.000Z")),
    "{ malformed JSON",
    JSON.stringify(trial("2026-01-01T00:00:03.000Z"))
  ].join("\n");
  await writeFile(path.join(runDir, "raw-responses.jsonl"), rawResponses);

  const generated = spawnSync(process.execPath, [
    "--import", "tsx",
    path.join(repoRoot, "scripts", "generate-static.ts"),
    `--input=${path.join(fixtureDir, "input")}`,
    `--output=${outputDir}`,
    `--publicOutput=${publicOutputDir}`
  ], { cwd: repoRoot, encoding: "utf8" });

  expect(generated.status, `${generated.stdout}\n${generated.stderr}`).toBe(0);
  const fullTrials = JSON.parse(await readFile(path.join(publicOutputDir, "test-model.json"), "utf8"));
  expect(fullTrials.map((result: { timestamp: string }) => result.timestamp)).toEqual([
    "2026-01-01T00:00:01.000Z",
    "2026-01-01T00:00:03.000Z"
  ]);
});
