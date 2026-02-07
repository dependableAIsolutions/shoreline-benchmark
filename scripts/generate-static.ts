import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { ModelResult } from "@shoreline/shared";

function parseArg(name: string): string | undefined {
  const prefixed = `--${name}`;
  const found = process.argv.find((arg) => arg.startsWith(`${prefixed}=`));
  if (found) return found.slice(prefixed.length + 1);
  const idx = process.argv.indexOf(prefixed);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

async function findScoreFiles(inputDir: string): Promise<string[]> {
  const models = await readdir(inputDir, { withFileTypes: true });
  const scoreFiles: string[] = [];

  for (const modelDir of models) {
    if (!modelDir.isDirectory()) continue;
    const modelPath = path.join(inputDir, modelDir.name);
    const runs = await readdir(modelPath, { withFileTypes: true });

    for (const runDir of runs) {
      if (!runDir.isDirectory()) continue;
      const candidate = path.join(modelPath, runDir.name, "scores.json");
      try {
        await readFile(candidate, "utf8");
        scoreFiles.push(candidate);
      } catch {
        // skip
      }
    }
  }

  return scoreFiles;
}

async function main(): Promise<void> {
  const input = parseArg("input") ?? path.join(process.cwd(), "results");
  const output = parseArg("output") ?? path.join(process.cwd(), "apps", "web", "src", "data");

  const files = await findScoreFiles(input);
  const results: ModelResult[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    results.push(JSON.parse(content) as ModelResult);
  }

  const latestByModel = new Map<string, ModelResult>();
  for (const result of results) {
    const existing = latestByModel.get(result.modelId);
    if (!existing || new Date(result.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
      latestByModel.set(result.modelId, result);
    }
  }

  const latest = [...latestByModel.values()].sort((a, b) => b.aggregate.avgConcrete - a.aggregate.avgConcrete);

  await mkdir(output, { recursive: true });
  const jsonPath = path.join(output, "results.generated.json");
  const tsPath = path.join(output, "results.generated.ts");

  await writeFile(jsonPath, JSON.stringify(latest, null, 2));
  await writeFile(tsPath, `import type { ModelResult } from "@shoreline/shared";\n\nexport const generatedResults: ModelResult[] = ${JSON.stringify(latest, null, 2)};\n`);

  console.log(`Wrote ${latest.length} model result(s) to ${jsonPath}`);
  console.log(`Wrote ${tsPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
