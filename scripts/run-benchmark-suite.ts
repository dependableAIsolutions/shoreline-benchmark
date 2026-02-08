import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { CATEGORY_ORDER, type CategoryKey, type ModelResult } from "@shoreline/shared";
import {
  LocalApiAdapter,
  LMStudioAdapter,
  MockAdapter,
  OpenRouterAdapter,
  runBenchmark,
  type ModelAdapter
} from "@shoreline/harness";

type AdapterName = "openrouter" | "lmstudio" | "localapi";
type RunStatus = "pending" | "in_progress" | "completed" | "failed";

interface SuiteModel {
  id: string;
  enabled?: boolean;
  notes?: string;
}

interface SuiteConfig {
  name?: string;
  adapter: AdapterName;
  categories: CategoryKey[];
  trialsPerDifficulty: number;
  probeTrials?: number;
  quickMode?: boolean;
  quickPoints?: number;
  categoryConcurrency?: number;
  rampMode?: "balanced" | "fast";
  temperature?: number;
  outputRoot?: string;
  staticOutput?: string;
  skipCompleted?: boolean;
  resumeIncomplete?: boolean;
  continueOnError?: boolean;
  localapi?: {
    apiUrl?: string;
    timeoutMs?: number;
    systemPrompt?: string;
  };
  lmstudio?: {
    baseUrl?: string;
  };
  openrouter?: {
    apiKeyEnv?: string;
    timeoutMs?: number;
  };
  models: SuiteModel[];
}

interface ModelRunState {
  modelId: string;
  status: RunStatus;
  attempts: number;
  runDir?: string;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  lastUpdatedAt: string;
  lastError?: string;
}

interface SuiteState {
  version: 1;
  suiteName: string;
  configPath: string;
  updatedAt: string;
  models: Record<string, ModelRunState>;
}

function parseArg(name: string): string | undefined {
  const prefixed = `--${name}`;
  const found = process.argv.find((arg) => arg.startsWith(`${prefixed}=`));
  if (found) return found.slice(prefixed.length + 1);
  const idx = process.argv.indexOf(prefixed);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function nowIso(): string {
  return new Date().toISOString();
}

function stampForPath(iso = nowIso()): string {
  return iso.replace(/:/g, "-");
}

function sanitizeModel(model: string): string {
  return model.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function defaultStatePath(configPath: string): string {
  const parsed = path.parse(configPath);
  return path.join(parsed.dir, "..", "state", `${parsed.name}.state.json`);
}

async function readJson<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath, "utf8");
    return true;
  } catch {
    return false;
  }
}

function assertValidCategories(categories: string[]): CategoryKey[] {
  const valid = categories.filter((key): key is CategoryKey => CATEGORY_ORDER.includes(key as CategoryKey));
  if (valid.length !== categories.length) {
    const bad = categories.filter((key) => !CATEGORY_ORDER.includes(key as CategoryKey));
    throw new Error(`Invalid category keys in suite config: ${bad.join(", ")}`);
  }
  return valid;
}

async function loadSuiteState(statePath: string, suiteName: string, configPath: string): Promise<SuiteState> {
  const exists = await fileExists(statePath);
  if (!exists) {
    return {
      version: 1,
      suiteName,
      configPath,
      updatedAt: nowIso(),
      models: {}
    };
  }

  const existing = await readJson<SuiteState>(statePath);
  return {
    ...existing,
    suiteName,
    configPath
  };
}

async function saveSuiteState(statePath: string, state: SuiteState): Promise<void> {
  await mkdir(path.dirname(statePath), { recursive: true });
  state.updatedAt = nowIso();
  await writeFile(statePath, JSON.stringify(state, null, 2));
}

function buildAdapter(config: SuiteConfig, modelId: string, dryRun: boolean): { adapter: ModelAdapter; name: AdapterName } {
  if (dryRun) {
    return { adapter: new MockAdapter(modelId), name: "localapi" };
  }

  if (config.adapter === "openrouter") {
    const envName = config.openrouter?.apiKeyEnv ?? "OPENROUTER_API_KEY";
    const apiKey = process.env[envName];
    if (!apiKey) throw new Error(`Missing ${envName} for openrouter adapter.`);

    return {
      adapter: new OpenRouterAdapter({
        apiKey,
        model: modelId,
        temperature: config.temperature ?? 0.7,
        timeoutMs: config.openrouter?.timeoutMs ?? Number.parseInt(process.env.OPENROUTER_TIMEOUT_MS ?? "120000", 10)
      }),
      name: "openrouter"
    };
  }

  if (config.adapter === "lmstudio") {
    return {
      adapter: new LMStudioAdapter({
        baseUrl: config.lmstudio?.baseUrl ?? process.env.LMSTUDIO_BASE_URL ?? "http://localhost:1234/v1",
        model: modelId,
        temperature: config.temperature ?? 0.7
      }),
      name: "lmstudio"
    };
  }

  return {
    adapter: new LocalApiAdapter({
      apiUrl: config.localapi?.apiUrl ?? process.env.LOCAL_MODEL_API_URL ?? "http://localhost:5555/api/v1/chat",
      model: modelId,
      timeoutMs: config.localapi?.timeoutMs ?? Number.parseInt(process.env.LOCAL_MODEL_TIMEOUT_MS ?? "120000", 10),
      defaultSystemPrompt:
        config.localapi?.systemPrompt ??
        process.env.LOCAL_MODEL_SYSTEM_PROMPT ??
        "You are participating in a benchmark. Follow instructions exactly and provide direct final answers."
    }),
    name: "localapi"
  };
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
      if (await fileExists(candidate)) scoreFiles.push(candidate);
    }
  }

  return scoreFiles;
}

function categoriesWithTrials(result: ModelResult): number {
  return Object.values(result.categories).filter((category) => category.trialCount > 0).length;
}

function isBetterRun(incoming: ModelResult, current: ModelResult): boolean {
  const incomingCoverage = categoriesWithTrials(incoming);
  const currentCoverage = categoriesWithTrials(current);
  if (incomingCoverage !== currentCoverage) return incomingCoverage > currentCoverage;

  const incomingTimestamp = new Date(incoming.timestamp).getTime();
  const currentTimestamp = new Date(current.timestamp).getTime();
  if (incomingTimestamp !== currentTimestamp) return incomingTimestamp > currentTimestamp;

  const incomingTrials = incoming.metadata.totalTrials;
  const currentTrials = current.metadata.totalTrials;
  if (incomingTrials !== currentTrials) return incomingTrials > currentTrials;

  return false;
}

async function refreshStaticData(inputDir: string, outputDir: string): Promise<void> {
  const files = await findScoreFiles(inputDir);
  const results: ModelResult[] = [];

  for (const file of files) {
    results.push(await readJson<ModelResult>(file));
  }

  const latestByModel = new Map<string, ModelResult>();
  for (const result of results) {
    const current = latestByModel.get(result.modelId);
    if (!current || isBetterRun(result, current)) {
      latestByModel.set(result.modelId, result);
    }
  }

  const latest = [...latestByModel.values()].sort((a, b) => b.aggregate.avgConcrete - a.aggregate.avgConcrete);

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "results.generated.json"), JSON.stringify(latest, null, 2));
  await writeFile(
    path.join(outputDir, "results.generated.ts"),
    `import type { ModelResult } from "@shoreline/shared";\n\nexport const generatedResults: ModelResult[] = ${JSON.stringify(latest, null, 2)};\n`
  );
}

async function main(): Promise<void> {
  const configPath = path.resolve(parseArg("config") ?? path.join(process.cwd(), "benchmark", "suites", "localapi.default.json"));
  const statePath = path.resolve(parseArg("state") ?? defaultStatePath(configPath));
  const dryRun = hasFlag("dry-run");
  const force = hasFlag("force");
  const quickPointsOverride = parseArg("quick-points");
  const categoryConcurrencyOverride = parseArg("category-concurrency");
  const rampModeOverride = parseArg("ramp-mode") ?? parseArg("ramp");
  const modelFilter = parseArg("models")?.split(",").map((item) => item.trim()).filter(Boolean);
  const limitArg = parseArg("limit");
  const limit = limitArg ? Math.max(1, Number.parseInt(limitArg, 10)) : undefined;

  const config = await readJson<SuiteConfig>(configPath);
  const suiteName = config.name ?? path.parse(configPath).name;
  const categories = assertValidCategories(config.categories);

  const state = await loadSuiteState(statePath, suiteName, configPath);
  const outputRoot = path.resolve(config.outputRoot ?? path.join(process.cwd(), "results"));
  const staticOutput = path.resolve(config.staticOutput ?? path.join(process.cwd(), "apps", "web", "src", "data"));

  const skipCompleted = config.skipCompleted ?? true;
  const resumeIncomplete = config.resumeIncomplete ?? true;
  const continueOnError = config.continueOnError ?? true;
  const quickMode = config.quickMode ?? false;
  const quickPoints = Math.max(1, Number.parseInt(quickPointsOverride ?? String(config.quickPoints ?? 1), 10));
  const categoryConcurrency = Math.max(
    1,
    Number.parseInt(categoryConcurrencyOverride ?? String(config.categoryConcurrency ?? 1), 10)
  );
  const rampMode: "balanced" | "fast" =
    rampModeOverride === "fast" || rampModeOverride === "balanced" ? rampModeOverride : (config.rampMode ?? "balanced");

  const selected = config.models.filter((model) => {
    if (model.enabled === false) return false;
    if (modelFilter && !modelFilter.includes(model.id)) return false;
    return true;
  });

  const runModels = typeof limit === "number" ? selected.slice(0, limit) : selected;

  console.log(`[suite] Config: ${configPath}`);
  console.log(`[suite] State: ${statePath}`);
  console.log(`[suite] Output root: ${outputRoot}`);
  console.log(`[suite] Models queued: ${runModels.length}`);
  console.log(`[suite] Category concurrency: ${categoryConcurrency}`);
  console.log(`[suite] Ramp mode: ${rampMode}`);
  if (quickMode) console.log(`[suite] Quick points/category: ${quickPoints}`);

  let completedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const model of runModels) {
    const existing = state.models[model.id];

    if (!force && skipCompleted && existing?.status === "completed") {
      console.log(`[suite] Skip ${model.id}: already completed`);
      skippedCount += 1;
      continue;
    }

    const modelSlug = sanitizeModel(model.id);
    const defaultRunDir = path.join(outputRoot, modelSlug, stampForPath());
    const canResume =
      !force &&
      resumeIncomplete &&
      (existing?.status === "in_progress" || existing?.status === "failed") &&
      typeof existing.runDir === "string" &&
      (await fileExists(path.join(existing.runDir, "checkpoint.json")));

    const runDir = canResume && existing?.runDir ? existing.runDir : defaultRunDir;

    state.models[model.id] = {
      modelId: model.id,
      status: "in_progress",
      attempts: (existing?.attempts ?? 0) + 1,
      runDir,
      lastStartedAt: nowIso(),
      lastCompletedAt: existing?.lastCompletedAt,
      lastUpdatedAt: nowIso(),
      lastError: undefined
    };
    await saveSuiteState(statePath, state);

    console.log(`[suite] Running ${model.id} (${canResume ? "resume" : "new"}) -> ${runDir}`);

    try {
      const { adapter, name: adapterName } = buildAdapter(config, model.id, dryRun);
      await runBenchmark({
        adapter,
        categories,
        trialsPerDifficulty: config.trialsPerDifficulty,
        outputDir: runDir,
        adapterName,
        temperature: config.temperature ?? 0.7,
        probeTrials: config.probeTrials ?? 3,
        quickMode,
        quickPoints,
        categoryConcurrency,
        rampMode,
        resume: canResume
      });

      state.models[model.id] = {
        ...state.models[model.id],
        status: "completed",
        lastCompletedAt: nowIso(),
        lastUpdatedAt: nowIso(),
        lastError: undefined
      };
      await saveSuiteState(statePath, state);

      await refreshStaticData(outputRoot, staticOutput);
      console.log(`[suite] Completed ${model.id}`);
      completedCount += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      state.models[model.id] = {
        ...state.models[model.id],
        status: "failed",
        lastUpdatedAt: nowIso(),
        lastError: message
      };
      await saveSuiteState(statePath, state);

      console.error(`[suite] Failed ${model.id}: ${message}`);
      failedCount += 1;

      if (!continueOnError) {
        throw error;
      }
    }
  }

  await refreshStaticData(outputRoot, staticOutput);

  console.log(`[suite] Done. completed=${completedCount} failed=${failedCount} skipped=${skippedCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
