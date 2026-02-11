"use client";

import { useEffect, useMemo, useState } from "react";
import { fullTrialsIndexByModel } from "../data/full-trials-index.generated";
import { categoryLabels } from "../data/results";
import { samplesByModel, type SampleResult } from "../data/samples.generated";
import { CATEGORY_ORDER, type CategoryKey } from "../lib/types";

interface ResultsViewerProps {
  modelId?: string;
}

type PatternKey = SampleResult["pattern"];
type ViewerPatternFilter = "all" | PatternKey;
type ModelScope = "all" | "selected";
type ViewerSample = SampleResult & {
  sampleId: string;
  modelId: string;
};
type FullTrialResult = SampleResult & {
  timestamp: string;
};

const patternColors: Record<string, { bg: string; text: string; border: string }> = {
  true_positive: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30" },
  true_negative: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  false_confidence: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
  blind_spot: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" }
};

const patternFilters: Array<{ key: ViewerPatternFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "true_positive", label: "True Positive" },
  { key: "true_negative", label: "True Negative" },
  { key: "false_confidence", label: "False Confidence" },
  { key: "blind_spot", label: "Blind Spot" }
];

const categoryGroups: Array<{ id: string; label: string; categories: CategoryKey[] }> = [
  {
    id: "math-and-logic",
    label: "Math & Logic",
    categories: ["mult", "modexp", "bool", "matrix", "combo"]
  },
  {
    id: "generation-and-self-assessment",
    label: "Generation & Self-Assessment",
    categories: ["random", "constrained", "sudoku", "distrib", "selfref", "counting"]
  }
];

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function formatModelLabel(modelId: string): string {
  const [provider, name] = modelId.split("/");
  return provider && name ? `${name} (${provider})` : modelId;
}

function hasKnownFullTrials(modelId: string): boolean {
  return Boolean(fullTrialsIndexByModel[modelId]);
}

function PhaseBlock({
  phase,
  label,
  color,
  data
}: {
  phase: 1 | 2 | 3;
  label: string;
  color: string;
  data: SampleResult["phase1"] | SampleResult["phase2"] | SampleResult["phase3"];
}) {
  const [expanded, setExpanded] = useState(phase === 2);

  const isPhase2 = "isCorrect" in data;
  const confidence = "confidence" in data ? data.confidence : null;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ backgroundColor: `${color}30`, color }}
          >
            {phase}
          </span>
          <span className="font-mono text-[11px] font-semibold" style={{ color }}>
            {label}
          </span>
          {confidence !== null && (
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-[#a09080]">
              {confidence}% confidence
            </span>
          )}
          {isPhase2 && (
            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                data.isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              {data.isCorrect ? "Correct" : "Incorrect"}
            </span>
          )}
          {isPhase2 && data.partialScore !== undefined && data.partialScore < 1 && data.partialScore > 0 && (
            <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 font-mono text-[10px] text-yellow-400">
              {Math.round(data.partialScore * 100)}% partial
            </span>
          )}
        </div>
        <span className="text-[#5d5144]">{expanded ? "-" : "+"}</span>
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-3 py-3 text-xs">
          <div className="mb-3">
            <div className="mb-1 font-mono text-[9px] tracking-[0.1em] text-[#5d5144]">PROMPT</div>
            <pre className="whitespace-pre-wrap rounded bg-black/30 p-2 font-mono text-[11px] leading-relaxed text-[#a09080]">
              {truncateText(data.prompt, 500)}
            </pre>
          </div>
          <div>
            <div className="mb-1 font-mono text-[9px] tracking-[0.1em] text-[#5d5144]">RESPONSE</div>
            <pre className="whitespace-pre-wrap rounded bg-black/30 p-2 font-mono text-[11px] leading-relaxed text-[#d8cfc2]">
              {truncateText(data.response, 400)}
            </pre>
          </div>
          {isPhase2 && (
            <div className="mt-2 space-y-1 font-mono text-[10px]">
              <div className="text-[#5d5144]">
                Extracted: <span className="text-[#8c8070]">{truncateText(data.extractedAnswer, 50)}</span>
              </div>
              <div className="text-[#5d5144]">
                Expected: <span className="text-[#8c8070]">{truncateText(data.correctAnswer, 50)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: ViewerSample }) {
  const [expanded, setExpanded] = useState(false);
  const colors = patternColors[result.pattern];

  return (
    <div className={`overflow-hidden rounded-xl border ${colors.border} ${colors.bg}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02]"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-[#8c8070]">
            {formatModelLabel(result.modelId)}
          </span>
          <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-[#5d5144]">
            difficulty {result.difficulty}
          </span>
          <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${colors.text}`}>
            {result.patternLabel}
          </span>
        </div>
        <span className="text-lg text-[#5d5144]">{expanded ? "-" : "+"}</span>
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-white/5 bg-black/20 px-4 py-3">
          <PhaseBlock phase={1} label="Prediction" color="#F59E0B" data={result.phase1} />
          <PhaseBlock phase={2} label="Execution" color="#3DA84A" data={result.phase2} />
          <PhaseBlock phase={3} label="Self-Evaluation" color="#8A9CAA" data={result.phase3} />
        </div>
      )}
    </div>
  );
}

export function ResultsViewer({ modelId }: ResultsViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [patternFilter, setPatternFilter] = useState<ViewerPatternFilter>("all");
  const [scope, setScope] = useState<ModelScope>("selected");
  const [collapsedCategories, setCollapsedCategories] = useState<Partial<Record<CategoryKey, boolean>>>(
    () =>
      Object.fromEntries(
        CATEGORY_ORDER.map((category) => [category, true])
      ) as Partial<Record<CategoryKey, boolean>>
  );
  const [fullTrialsByModel, setFullTrialsByModel] = useState<Record<string, FullTrialResult[]>>({});
  const [loadingByModel, setLoadingByModel] = useState<Record<string, boolean>>({});
  const [loadErrorByModel, setLoadErrorByModel] = useState<Record<string, string>>({});

  const availableModels = useMemo(
    () => [...new Set([...Object.keys(samplesByModel), ...Object.keys(fullTrialsIndexByModel)])],
    []
  );
  const selectedModelId =
    modelId && (samplesByModel[modelId] || hasKnownFullTrials(modelId)) ? modelId : undefined;
  const scopedModelIds = scope === "selected" && selectedModelId ? [selectedModelId] : availableModels;

  useEffect(() => {
    if (!isOpen) return;

    const modelsToLoad = scopedModelIds.filter((currentModelId) => {
      if (!hasKnownFullTrials(currentModelId)) return false;
      if (fullTrialsByModel[currentModelId]) return false;
      if (loadingByModel[currentModelId]) return false;
      if (loadErrorByModel[currentModelId]) return false;
      return true;
    });

    if (modelsToLoad.length === 0) return;

    for (const currentModelId of modelsToLoad) {
      const entry = fullTrialsIndexByModel[currentModelId];
      if (!entry) continue;

      setLoadingByModel((previous) => ({ ...previous, [currentModelId]: true }));

      fetch(entry.file)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Failed to load trials (${response.status})`);
          }
          return (await response.json()) as FullTrialResult[];
        })
        .then((data) => {
          setFullTrialsByModel((previous) => ({ ...previous, [currentModelId]: data }));
          setLoadErrorByModel((previous) => {
            const { [currentModelId]: _unused, ...rest } = previous;
            return rest;
          });
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Unknown error";
          setLoadErrorByModel((previous) => ({ ...previous, [currentModelId]: message }));
        })
        .finally(() => {
          setLoadingByModel((previous) => ({ ...previous, [currentModelId]: false }));
        });
    }
  }, [fullTrialsByModel, isOpen, loadErrorByModel, loadingByModel, scopedModelIds]);

  const scopedSamples = useMemo(
    () =>
      scopedModelIds.flatMap((currentModelId) =>
        (fullTrialsByModel[currentModelId] ?? samplesByModel[currentModelId] ?? []).map((sample, index) => ({
          ...sample,
          modelId: currentModelId,
          sampleId: `${currentModelId}-${sample.category}-${sample.pattern}-${sample.difficulty}-${index}-${"timestamp" in sample ? sample.timestamp : "sample"}`
        }))
      ),
    [fullTrialsByModel, scopedModelIds]
  );

  const expectedScopedTrialCount = useMemo(
    () =>
      scopedModelIds.reduce((sum, currentModelId) => {
        const indexEntry = fullTrialsIndexByModel[currentModelId];
        if (indexEntry) return sum + indexEntry.totalTrials;
        return sum + (samplesByModel[currentModelId]?.length ?? 0);
      }, 0),
    [scopedModelIds]
  );

  const modelsUsingFullTrials = useMemo(
    () => scopedModelIds.filter((currentModelId) => Boolean(fullTrialsByModel[currentModelId])),
    [fullTrialsByModel, scopedModelIds]
  );

  const modelsPendingFullTrials = useMemo(
    () =>
      scopedModelIds.filter(
        (currentModelId) =>
          hasKnownFullTrials(currentModelId) && !fullTrialsByModel[currentModelId] && !loadErrorByModel[currentModelId]
      ),
    [fullTrialsByModel, loadErrorByModel, scopedModelIds]
  );

  const modelsWithLoadErrors = useMemo(
    () => scopedModelIds.filter((currentModelId) => Boolean(loadErrorByModel[currentModelId])),
    [loadErrorByModel, scopedModelIds]
  );

  const patternCounts = useMemo(
    () =>
      scopedSamples.reduce((acc, sample) => {
        acc[sample.pattern] = (acc[sample.pattern] || 0) + 1;
        return acc;
      }, {} as Record<PatternKey, number>),
    [scopedSamples]
  );

  const filteredSamples = useMemo(
    () =>
      patternFilter === "all"
        ? scopedSamples
        : scopedSamples.filter((sample) => sample.pattern === patternFilter),
    [patternFilter, scopedSamples]
  );

  const groupedByCategory = useMemo(() => {
    const emptyGroups = CATEGORY_ORDER.reduce((acc, category) => {
      acc[category] = [];
      return acc;
    }, {} as Record<CategoryKey, ViewerSample[]>);

    for (const sample of filteredSamples) {
      emptyGroups[sample.category].push(sample);
    }

    for (const category of CATEGORY_ORDER) {
      emptyGroups[category].sort((left, right) => {
        if (left.modelId !== right.modelId) return left.modelId.localeCompare(right.modelId);
        if (left.difficulty !== right.difficulty) return left.difficulty - right.difficulty;
        return left.pattern.localeCompare(right.pattern);
      });
    }

    return emptyGroups;
  }, [filteredSamples]);

  const visibleCategories = CATEGORY_ORDER.filter((category) => groupedByCategory[category].length > 0);
  const visibleCategoryGroups = categoryGroups
    .map((group) => ({
      ...group,
      categories: group.categories.filter((category) => visibleCategories.includes(category))
    }))
    .filter((group) => group.categories.length > 0);

  const allCategoriesCollapsed =
    visibleCategories.length > 0 &&
    visibleCategories.every((category) => collapsedCategories[category] === true);

  if (scopedSamples.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left hover:bg-white/[0.03]"
      >
        <div>
          <h2 className="font-mono text-sm tracking-[0.1em] text-[#8c7d6b]">TRIAL RESULTS</h2>
          <p className="mt-0.5 text-xs text-[#5d5144]">
            {filteredSamples.length} / {scopedSamples.length} trial
            {scopedSamples.length !== 1 ? "s" : ""} shown • expected {expectedScopedTrialCount} trial
            {expectedScopedTrialCount !== 1 ? "s" : ""} • {scopedModelIds.length} model
            {scopedModelIds.length !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="text-xl text-[#5d5144]">{isOpen ? "-" : "+"}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3 px-1">
            <p className="max-w-3xl text-xs text-[#6d6050]">
              Each task goes through three phases: <span className="text-[#F59E0B]">Prediction</span> (confidence
              before attempting), <span className="text-[#3DA84A]">Execution</span> (actual performance), and{" "}
              <span className="text-[#8A9CAA]">Self-Evaluation</span> (confidence after completing). Use category
              navigation to compare all models within one task family.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded border border-white/10 bg-white/[0.02] p-1">
                <button
                  type="button"
                  onClick={() => setScope("all")}
                  className={`rounded px-2 py-1 font-mono text-[10px] ${
                    scope === "all" ? "bg-[#3D7A6E]/30 text-[#7ab8ad]" : "text-[#5d5144] hover:bg-white/10"
                  }`}
                >
                  All models
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedModelId) setScope("selected");
                  }}
                  disabled={!selectedModelId}
                  className={`ml-1 rounded px-2 py-1 font-mono text-[10px] ${
                    scope === "selected"
                      ? "bg-[#3D7A6E]/30 text-[#7ab8ad]"
                      : "text-[#5d5144] hover:bg-white/10"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Selected model
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {patternFilters.map(({ key, label }) => {
                  const count = key === "all" ? scopedSamples.length : (patternCounts[key] || 0);
                  if (key !== "all" && count === 0) return null;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPatternFilter(key)}
                      className={`rounded px-2 py-1 font-mono text-[10px] ${
                        patternFilter === key
                          ? "bg-[#3D7A6E]/30 text-[#7ab8ad]"
                          : "bg-white/5 text-[#5d5144] hover:bg-white/10"
                      }`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {modelsPendingFullTrials.length > 0 ? (
            <div className="rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-3 py-2 text-xs text-[#d9b06a]">
              Loading full trial logs for {modelsPendingFullTrials.length} model
              {modelsPendingFullTrials.length !== 1 ? "s" : ""}. Showing representative samples until loading completes.
            </div>
          ) : null}

          {modelsUsingFullTrials.length > 0 ? (
            <div className="rounded-lg border border-[#3DA84A]/30 bg-[#3DA84A]/10 px-3 py-2 text-xs text-[#8dcf95]">
              Full logs active for {modelsUsingFullTrials.length} model
              {modelsUsingFullTrials.length !== 1 ? "s" : ""}. Island metrics are computed from these full trials.
            </div>
          ) : null}

          {modelsWithLoadErrors.length > 0 ? (
            <div className="rounded-lg border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-xs text-[#e7a4a4]">
              Failed to load full trials for {modelsWithLoadErrors.length} model
              {modelsWithLoadErrors.length !== 1 ? "s" : ""}; using representative samples instead.
            </div>
          ) : null}

          {visibleCategories.length > 0 ? (
            <div className="rounded-lg border border-white/5 bg-white/[0.01] p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] tracking-[0.14em] text-[#5d5144]">CATEGORY NAVIGATION</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextCollapsedState = !allCategoriesCollapsed;
                    setCollapsedCategories(
                      Object.fromEntries(visibleCategories.map((category) => [category, nextCollapsedState])) as
                        Partial<Record<CategoryKey, boolean>>
                    );
                  }}
                  className="rounded bg-white/5 px-2 py-1 font-mono text-[10px] text-[#5d5144] hover:bg-white/10"
                >
                  {allCategoriesCollapsed ? "Expand all" : "Collapse all"}
                </button>
              </div>
              <div className="space-y-2">
                {visibleCategoryGroups.map((group) => (
                  <div key={group.id}>
                    <div className="mb-1 font-mono text-[10px] text-[#5d5144]">{group.label}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.categories.map((category) => (
                        <a
                          key={category}
                          href={`#sample-category-${category}`}
                          className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-[#8c8070] hover:border-[#3D7A6E]/40 hover:text-[#7ab8ad]"
                        >
                          {categoryLabels[category]} ({groupedByCategory[category].length})
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-2 rounded-lg border border-white/5 bg-white/[0.01] p-3">
            <div className="grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500/50" />
                <span className="text-[#8c8070]">True Positive: Correct + Confident</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500/50" />
                <span className="text-[#8c8070]">True Negative: Wrong + Doubted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500/50" />
                <span className="text-[#8c8070]">False Confidence: Wrong + Confident</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-yellow-500/50" />
                <span className="text-[#8c8070]">Blind Spot: Correct + Doubted</span>
              </div>
            </div>
          </div>

          {visibleCategories.length > 0 ? (
            visibleCategoryGroups.map((group) => (
              <div key={group.id} className="space-y-2">
                <h3 className="font-mono text-[11px] tracking-[0.16em] text-[#8c7d6b]">{group.label}</h3>
                {group.categories.map((category) => {
                  const samples = groupedByCategory[category];
                  const isCollapsed = collapsedCategories[category] === true;
                  const modelsInCategory = scopedModelIds.filter((currentModelId) =>
                    samples.some((sample) => sample.modelId === currentModelId)
                  );

                  return (
                    <section
                      id={`sample-category-${category}`}
                      key={category}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setCollapsedCategories((previous) => ({
                            ...previous,
                            [category]: !previous[category]
                          }))
                        }
                        className="flex w-full items-center justify-between rounded border border-white/5 bg-black/10 px-3 py-2 text-left hover:bg-black/20"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-mono text-xs tracking-[0.14em] text-[#8c7d6b]">{categoryLabels[category]}</h4>
                          <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-[#5d5144]">
                            {samples.length} trial{samples.length !== 1 ? "s" : ""}
                          </span>
                          <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-[#5d5144]">
                            {modelsInCategory.length} model{modelsInCategory.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <span className="text-[#5d5144]">{isCollapsed ? "+" : "-"}</span>
                      </button>

                      {!isCollapsed && (
                        <div className="mt-3 space-y-3">
                          {modelsInCategory.map((currentModelId) => {
                            const modelSamples = samples.filter((sample) => sample.modelId === currentModelId);
                            return (
                              <div
                                key={`${category}-${currentModelId}`}
                                className="rounded-lg border border-white/5 bg-black/15 p-3"
                              >
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <h5 className="font-mono text-[11px] text-[#8c8070]">{formatModelLabel(currentModelId)}</h5>
                                  <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-[#5d5144]">
                                    {modelSamples.length} trial{modelSamples.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {modelSamples.map((result) => (
                                    <ResultCard key={result.sampleId} result={result} />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-white/5 bg-white/[0.01] p-4 text-center text-sm text-[#5d5144]">
              No trials matching this filter
            </div>
          )}
        </div>
      )}
    </section>
  );
}
