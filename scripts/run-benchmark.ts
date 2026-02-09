import path from "node:path";
import { mkdir } from "node:fs/promises";
import { CATEGORY_ORDER, type CategoryKey } from "@shoreline/shared";
import {
  IMPLEMENTED_CATEGORIES,
  LocalApiAdapter,
  LMStudioAdapter,
  MockAdapter,
  OpenRouterAdapter,
  runBenchmark,
  type ModelAdapter
} from "@shoreline/harness";

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

function nowStamp(): string {
  return new Date().toISOString().replace(/:/g, "-");
}

function sanitizeModel(model: string): string {
  return model.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (typeof value !== "string" || value.trim().length === 0) return undefined;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return parsed;
}

function formatMs(ms: number | undefined): string {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return "n/a";
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function main(): Promise<void> {
  const adapterName = parseArg("adapter") as "openrouter" | "lmstudio" | "localapi" | undefined;
  const model = parseArg("model");
  const all = hasFlag("all");
  const dryRun = hasFlag("dry-run");
  const quick = hasFlag("quick");
  const resumeDir = parseArg("resume");

  const trialsPerDifficulty = Number.parseInt(parseArg("trials") ?? "20", 10);
  const temperature = Number.parseFloat(parseArg("temperature") ?? "0.7");
  const timeoutMsArg = parseArg("timeout-ms");
  const callTimeoutMsArg = parseArg("call-timeout-ms");
  const maxRetriesArg = parseArg("max-retries");
  const retryBaseDelayMsArg = parseArg("retry-base-delay-ms");
  const inputCostPerMillionArg = parseArg("input-cost-per-million");
  const outputCostPerMillionArg = parseArg("output-cost-per-million");
  const quickPointsArg = parseArg("quick-points");
  const categoryConcurrencyArg = parseArg("category-concurrency");
  const rampModeArg = parseArg("ramp-mode") ?? parseArg("ramp");
  const rampMode: "balanced" | "fast" = rampModeArg === "fast" ? "fast" : "balanced";

  if (!dryRun && (!adapterName || !model)) {
    console.error("Missing required flags. Use --adapter <openrouter|lmstudio|localapi> and --model <id>.");
    process.exit(1);
  }

  const categoryArg = parseArg("categories");
  const requestedCategories = categoryArg
    ? (categoryArg.split(",").map((key) => key.trim()) as CategoryKey[])
    : all
      ? CATEGORY_ORDER
      : IMPLEMENTED_CATEGORIES;

  const categories = requestedCategories.filter((key): key is CategoryKey => CATEGORY_ORDER.includes(key));
  if (categories.length === 0) {
    console.error(`No valid categories selected. Valid keys: ${CATEGORY_ORDER.join(", ")}`);
    process.exit(1);
  }

  if (categories.some((key) => !IMPLEMENTED_CATEGORIES.includes(key))) {
    const unavailable = categories.filter((key) => !IMPLEMENTED_CATEGORIES.includes(key));
    console.error(
      `Categories not implemented yet: ${unavailable.join(", ")}. Implemented now: ${IMPLEMENTED_CATEGORIES.join(", ")}`
    );
    process.exit(1);
  }

  const quickPoints = Math.max(1, Number.parseInt(quickPointsArg ?? (quick ? "3" : "1"), 10));
  const categoryConcurrency = Math.max(
    1,
    Number.parseInt(categoryConcurrencyArg ?? (quick ? String(categories.length) : "1"), 10)
  );

  let adapter: ModelAdapter;
  let finalAdapterName: "openrouter" | "lmstudio" | "localapi" = "localapi";
  let finalModel = model ?? "mock/model";

  if (dryRun) {
    adapter = new MockAdapter(finalModel);
    finalAdapterName = "localapi";
  } else if (adapterName === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is required for --adapter openrouter");
      process.exit(1);
    }
    const inputCostPerMillion = parseOptionalNumber(
      inputCostPerMillionArg ?? process.env.OPENROUTER_INPUT_COST_PER_MILLION
    );
    const outputCostPerMillion = parseOptionalNumber(
      outputCostPerMillionArg ?? process.env.OPENROUTER_OUTPUT_COST_PER_MILLION
    );
    const hasManualPricing = typeof inputCostPerMillion === "number" || typeof outputCostPerMillion === "number";

    adapter = new OpenRouterAdapter({
      apiKey,
      model: finalModel,
      temperature,
      timeoutMs: Number.parseInt(timeoutMsArg ?? process.env.OPENROUTER_TIMEOUT_MS ?? "120000", 10),
      maxRetries: Number.parseInt(maxRetriesArg ?? process.env.OPENROUTER_MAX_RETRIES ?? "4", 10),
      retryBaseDelayMs: Number.parseInt(
        retryBaseDelayMsArg ?? process.env.OPENROUTER_RETRY_BASE_DELAY_MS ?? "1500",
        10
      ),
      pricing: hasManualPricing
        ? {
            inputCostPerMillion,
            outputCostPerMillion
          }
        : undefined
    });
    finalAdapterName = "openrouter";
  } else if (adapterName === "lmstudio") {
    adapter = new LMStudioAdapter({
      baseUrl: process.env.LMSTUDIO_BASE_URL ?? "http://localhost:1234/v1",
      model: finalModel,
      temperature
    });
    finalAdapterName = "lmstudio";
  } else if (adapterName === "localapi") {
    adapter = new LocalApiAdapter({
      apiUrl: parseArg("local-api-url") ?? process.env.LOCAL_MODEL_API_URL ?? "http://localhost:5555/api/v1/chat",
      model: finalModel,
      timeoutMs: Number.parseInt(timeoutMsArg ?? process.env.LOCAL_MODEL_TIMEOUT_MS ?? "45000", 10),
      defaultSystemPrompt:
        parseArg("system-prompt") ??
        process.env.LOCAL_MODEL_SYSTEM_PROMPT ??
        "You are participating in a benchmark. Follow instructions exactly and provide direct final answers."
    });
    finalAdapterName = "localapi";
  } else {
    console.error("--adapter must be openrouter, lmstudio, or localapi");
    process.exit(1);
  }

  const outputDir =
    resumeDir ?? parseArg("output") ?? path.join(process.cwd(), "results", sanitizeModel(finalModel), nowStamp());
  const resume = typeof resumeDir === "string" && resumeDir.length > 0;

  if (!resume) {
    await mkdir(outputDir, { recursive: true });
  }

  console.log(`Running Shoreline benchmark for ${finalModel}`);
  console.log(`Adapter: ${dryRun ? "mock (dry-run)" : finalAdapterName}`);
  console.log(`Categories: ${categories.join(", ")}`);
  console.log(`Trials/difficulty: ${trialsPerDifficulty}`);
  console.log(`Quick mode: ${quick ? "on" : "off"}`);
  if (quick) console.log(`Quick points/category: ${quickPoints}`);
  console.log(`Category concurrency: ${categoryConcurrency}`);
  console.log(`Ramp mode: ${rampMode}`);
  if (callTimeoutMsArg) console.log(`Per-call timeout: ${callTimeoutMsArg}ms`);
  if (adapterName === "openrouter") {
    const retries = Number.parseInt(maxRetriesArg ?? process.env.OPENROUTER_MAX_RETRIES ?? "4", 10);
    const baseDelay = Number.parseInt(
      retryBaseDelayMsArg ?? process.env.OPENROUTER_RETRY_BASE_DELAY_MS ?? "1500",
      10
    );
    const inputPrice = parseOptionalNumber(inputCostPerMillionArg ?? process.env.OPENROUTER_INPUT_COST_PER_MILLION);
    const outputPrice = parseOptionalNumber(outputCostPerMillionArg ?? process.env.OPENROUTER_OUTPUT_COST_PER_MILLION);
    console.log(`OpenRouter retries: ${retries} (base delay ${baseDelay}ms)`);
    if (typeof inputPrice === "number" || typeof outputPrice === "number") {
      console.log(
        `OpenRouter manual fallback pricing (cost/1M tokens): input=${inputPrice ?? "n/a"} output=${outputPrice ?? "n/a"}`
      );
    } else {
      console.log("OpenRouter cost source: provider-reported only (no manual fallback pricing configured)");
    }
  }
  console.log(`Resume mode: ${resume ? "on" : "off"}`);
  console.log(`Output: ${outputDir}`);

  const result = await runBenchmark({
    adapter,
    categories,
    trialsPerDifficulty,
    outputDir,
    adapterName: finalAdapterName,
    temperature,
    probeTrials: Math.min(5, Math.max(1, Number.parseInt(parseArg("probe-trials") ?? "3", 10))),
    quickMode: quick,
    quickPoints,
    categoryConcurrency,
    rampMode,
    resume,
    callTimeoutMs: callTimeoutMsArg ? Number.parseInt(callTimeoutMsArg, 10) : undefined
  });

  console.log("Benchmark complete.");
  console.log(
    `Aggregate concrete=${result.aggregate.avgConcrete.toFixed(2)} solid=${result.aggregate.avgSolid.toFixed(2)} sand=${result.aggregate.avgSand.toFixed(2)} totalGap=${result.aggregate.totalGap.toFixed(2)}`
  );
  const metadata = result.metadata;
  console.log(
    `Usage tokens total=${metadata.totalTokensUsed} prompt=${metadata.totalPromptTokensUsed ?? 0} completion=${metadata.totalCompletionTokensUsed ?? 0}`
  );
  console.log(
    `Timing run=${formatMs(metadata.runDurationMs)} totalLatency=${formatMs(metadata.totalLatencyMs)} avgCall=${formatMs(metadata.averageLatencyMs)} calls=${metadata.totalModelCalls ?? 0}`
  );
  if (typeof metadata.totalCost === "number") {
    console.log(
      `Cost total=${metadata.totalCost.toFixed(6)} provider=${(metadata.providerReportedCost ?? 0).toFixed(6)} estimated=${(metadata.estimatedCost ?? 0).toFixed(6)} measuredCalls=${metadata.costMeasuredCalls ?? 0} missingCalls=${metadata.missingCostCalls ?? 0}`
    );
  } else {
    console.log(`Cost unavailable (missing calls=${metadata.missingCostCalls ?? metadata.totalModelCalls ?? 0})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
