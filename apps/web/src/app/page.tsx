"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CompareView } from "../components/CompareView";
import { IslandCard } from "../components/IslandCard";
import { Legend } from "../components/Legend";
import { ResultsViewer } from "../components/ResultsViewer";
import { Tooltip, metricTooltips } from "../components/Tooltip";
import { modelResults } from "../data/results";
import type { CategoryKey } from "../lib/types";

type Mode = "single" | "compare" | "leaderboard";

function leaderboardScore(result: (typeof modelResults)[number]): number {
  // Rank by verified capability first, while still rewarding failure-awareness.
  return result.aggregate.avgSolid * 0.75 + result.aggregate.avgConcrete * 0.25;
}

function byLeaderboardScoreDesc() {
  return [...modelResults].sort((left, right) => {
    const delta = leaderboardScore(right) - leaderboardScore(left);
    if (Math.abs(delta) > 1e-6) return delta;

    const solidDelta = right.aggregate.avgSolid - left.aggregate.avgSolid;
    if (Math.abs(solidDelta) > 1e-6) return solidDelta;

    const concreteDelta = right.aggregate.avgConcrete - left.aggregate.avgConcrete;
    if (Math.abs(concreteDelta) > 1e-6) return concreteDelta;

    return left.aggregate.totalGap - right.aggregate.totalGap;
  });
}

function hasNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatInteger(value: number | undefined): string {
  return hasNumber(value) ? Math.round(value).toLocaleString() : "—";
}

function formatDuration(ms: number | undefined): string {
  if (!hasNumber(ms)) return "—";
  if (ms < 1_000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1_000).toFixed(1)}s`;
  if (ms < 3_600_000) return `${(ms / 60_000).toFixed(1)}m`;
  return `${(ms / 3_600_000).toFixed(1)}h`;
}

function formatCostDisplay(result: (typeof modelResults)[number]): string {
  const metadata = result.metadata;
  if (hasNumber(metadata.totalCost)) return metadata.totalCost.toFixed(4);

  const provider = hasNumber(metadata.providerReportedCost) ? metadata.providerReportedCost : 0;
  const estimated = hasNumber(metadata.estimatedCost) ? metadata.estimatedCost : 0;
  const combined = provider + estimated;
  if (combined > 0) return combined.toFixed(4);

  const missingCalls = hasNumber(metadata.missingCostCalls) ? metadata.missingCostCalls : 0;
  if (missingCalls > 0) return `n/a (${missingCalls} missing)`;
  return "—";
}

function formatTokenBreakdown(result: (typeof modelResults)[number]): string {
  const metadata = result.metadata;
  const total = hasNumber(metadata.totalTokensUsed) ? metadata.totalTokensUsed : undefined;
  const prompt = hasNumber(metadata.totalPromptTokensUsed) ? metadata.totalPromptTokensUsed : undefined;
  const completion = hasNumber(metadata.totalCompletionTokensUsed) ? metadata.totalCompletionTokensUsed : undefined;

  if (!hasNumber(total)) return "—";
  if (hasNumber(prompt) && hasNumber(completion) && (prompt > 0 || completion > 0)) {
    return `${formatInteger(total)} (${formatInteger(prompt)}/${formatInteger(completion)})`;
  }
  return formatInteger(total);
}

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("compare");
  const [hovered, setHovered] = useState<CategoryKey | null>(null);
  const [modelAId, setModelAId] = useState(modelResults[0]?.modelId ?? "");
  const [modelBId, setModelBId] = useState(modelResults[1]?.modelId ?? modelResults[0]?.modelId ?? "");
  const [showTelemetry, setShowTelemetry] = useState(false);

  const modelA = useMemo(
    () => modelResults.find((result) => result.modelId === modelAId) ?? modelResults[0],
    [modelAId]
  );
  const modelB = useMemo(
    () => modelResults.find((result) => result.modelId === modelBId) ?? modelResults[1] ?? modelResults[0],
    [modelBId]
  );

  const ranked = useMemo(() => byLeaderboardScoreDesc(), []);

  return (
    <main className="mx-auto max-w-[1120px] px-5 py-8 text-[#E8E0D4]">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="mb-1 font-mono text-[10px] tracking-[0.45em] text-[#3D7A6E]">METACOGNITIVE BENCHMARK</div>
          <Link
            href="/about"
            className="font-mono text-[10px] tracking-[0.14em] text-[#5d5144] hover:text-[#7ab8ad]"
          >
            How it works &rarr;
          </Link>
        </div>
        <h1 className="shoreline-title font-serif text-5xl font-bold tracking-tight text-[#E8E0D4]">
          Shoreline
        </h1>
        <p className="mt-1 font-serif text-lg italic text-[#817363]">Mapping where capability meets self-knowledge</p>
      </header>

      <Legend />

      <section className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(["single", "compare", "leaderboard"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMode(tab)}
              className={`rounded-md border px-3 py-1.5 font-mono text-[11px] font-semibold ${
                mode === tab
                  ? "border-[#3D7A6E] bg-[#3D7A6E]/20 text-[#7ab8ad]"
                  : "border-white/10 text-[#5d5144] hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {mode !== "leaderboard" && (
          <>
            <div className="h-5 w-px bg-white/10" />
            <label className="font-mono text-[10px] tracking-[0.14em] text-[#5d5144]" htmlFor="model-a">
              MODEL A
            </label>
            <select
              id="model-a"
              value={modelA?.modelId}
              onChange={(event) => setModelAId(event.target.value)}
              className="rounded-md border border-white/15 bg-[#0e172e] px-2 py-1 text-sm text-[#dfd6c9]"
            >
              {modelResults.map((result) => (
                <option key={result.modelId} value={result.modelId}>
                  {result.modelDisplayName}
                </option>
              ))}
            </select>

            {mode === "compare" && (
              <>
                <label className="ml-2 font-mono text-[10px] tracking-[0.14em] text-[#5d5144]" htmlFor="model-b">
                  MODEL B
                </label>
                <select
                  id="model-b"
                  value={modelB?.modelId}
                  onChange={(event) => setModelBId(event.target.value)}
                  className="rounded-md border border-white/15 bg-[#0e172e] px-2 py-1 text-sm text-[#dfd6c9]"
                >
                  {modelResults
                    .filter((result) => result.modelId !== modelA?.modelId)
                    .map((result) => (
                      <option key={result.modelId} value={result.modelId}>
                        {result.modelDisplayName}
                      </option>
                    ))}
                </select>
              </>
            )}
          </>
        )}
      </section>

      {mode === "single" && modelA ? (
        <IslandCard model={modelA} hoveredCategory={hovered} onHoverCategory={setHovered} />
      ) : null}

      {mode === "compare" && modelA && modelB ? (
        <>
          <section className="grid gap-5 lg:grid-cols-2">
            <IslandCard model={modelA} hoveredCategory={hovered} onHoverCategory={setHovered} compact />
            <IslandCard model={modelB} hoveredCategory={hovered} onHoverCategory={setHovered} compact />
          </section>
          <CompareView left={modelA} right={modelB} />
        </>
      ) : null}

      {mode === "leaderboard" ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-mono text-sm tracking-[0.16em] text-[#8c7d6b]">LEADERBOARD</h2>
            <button
              type="button"
              onClick={() => setShowTelemetry((value) => !value)}
              className={`rounded-md border px-3 py-1.5 font-mono text-[11px] font-semibold ${
                showTelemetry
                  ? "border-[#3D7A6E] bg-[#3D7A6E]/20 text-[#7ab8ad]"
                  : "border-white/10 text-[#5d5144] hover:bg-white/5"
              }`}
            >
              {showTelemetry ? "Hide" : "Show"} telemetry
            </button>
          </div>
          {showTelemetry ? (
            <p className="mb-3 text-xs text-[#6d6050]">
              Runtime telemetry is pulled from each run&apos;s metadata. Cost values use provider-reported totals when available,
              otherwise estimated totals or a missing-cost indicator.
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left font-mono text-[11px] tracking-[0.14em] text-[#5d5144]">
                  <th className="px-2 py-2">Rank</th>
                  <th className="px-2 py-2">Model</th>
                  <th className="px-2 py-2">
                    <Tooltip content={metricTooltips.leaderboardScore} position="bottom" maxWidth={300}>
                      <span className="inline-flex items-center underline decoration-dotted underline-offset-2">Score</span>
                    </Tooltip>
                  </th>
                  <th className="px-2 py-2">Concrete</th>
                  <th className="px-2 py-2">Solid</th>
                  <th className="px-2 py-2">Sand</th>
                  <th className="px-2 py-2">Total Gap</th>
                  {showTelemetry ? (
                    <>
                      <th className="px-2 py-2">Tokens (P/C)</th>
                      <th className="px-2 py-2">Cost</th>
                      <th className="px-2 py-2">Runtime</th>
                      <th className="px-2 py-2">Avg Latency</th>
                      <th className="px-2 py-2">Calls</th>
                      <th className="px-2 py-2">Trials</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {ranked.map((result, index) => (
                  <tr key={result.modelId} className="border-b border-white/5 text-[#d8cfc2]">
                    <td className="px-2 py-2 font-mono">#{index + 1}</td>
                    <td className="px-2 py-2 font-semibold">{result.modelDisplayName}</td>
                    <td className="px-2 py-2 font-semibold text-[#7ab8ad]">{leaderboardScore(result).toFixed(1)}</td>
                    <td className="px-2 py-2">{result.aggregate.avgConcrete.toFixed(1)}</td>
                    <td className="px-2 py-2">{result.aggregate.avgSolid.toFixed(1)}</td>
                    <td className="px-2 py-2">{result.aggregate.avgSand.toFixed(1)}</td>
                    <td className="px-2 py-2">{result.aggregate.totalGap.toFixed(1)}</td>
                    {showTelemetry ? (
                      <>
                        <td className="px-2 py-2 font-mono text-[11px]">{formatTokenBreakdown(result)}</td>
                        <td className="px-2 py-2 font-mono text-[11px]">{formatCostDisplay(result)}</td>
                        <td className="px-2 py-2 font-mono text-[11px]">{formatDuration(result.metadata.runDurationMs)}</td>
                        <td className="px-2 py-2 font-mono text-[11px]">{formatDuration(result.metadata.averageLatencyMs)}</td>
                        <td className="px-2 py-2 font-mono text-[11px]">{formatInteger(result.metadata.totalModelCalls)}</td>
                        <td className="px-2 py-2 font-mono text-[11px]">{formatInteger(result.metadata.totalTrials)}</td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <ResultsViewer modelId={modelA?.modelId} />

    </main>
  );
}
