"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CompareView } from "../components/CompareView";
import { IslandCard } from "../components/IslandCard";
import { Legend } from "../components/Legend";
import { ResultsViewer } from "../components/ResultsViewer";
import { modelResults } from "../data/results";
import type { CategoryKey } from "../lib/types";

type Mode = "single" | "compare" | "leaderboard";

function byConcreteDesc() {
  return [...modelResults].sort((a, b) => b.aggregate.avgConcrete - a.aggregate.avgConcrete);
}

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("compare");
  const [hovered, setHovered] = useState<CategoryKey | null>(null);
  const [modelAId, setModelAId] = useState(modelResults[0]?.modelId ?? "");
  const [modelBId, setModelBId] = useState(modelResults[1]?.modelId ?? modelResults[0]?.modelId ?? "");

  const modelA = useMemo(
    () => modelResults.find((result) => result.modelId === modelAId) ?? modelResults[0],
    [modelAId]
  );
  const modelB = useMemo(
    () => modelResults.find((result) => result.modelId === modelBId) ?? modelResults[1] ?? modelResults[0],
    [modelBId]
  );

  const ranked = useMemo(() => byConcreteDesc(), []);

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
          <h2 className="mb-3 font-mono text-sm tracking-[0.16em] text-[#8c7d6b]">LEADERBOARD (by Concrete)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left font-mono text-[11px] tracking-[0.14em] text-[#5d5144]">
                  <th className="px-2 py-2">Rank</th>
                  <th className="px-2 py-2">Model</th>
                  <th className="px-2 py-2">Concrete</th>
                  <th className="px-2 py-2">Solid</th>
                  <th className="px-2 py-2">Sand</th>
                  <th className="px-2 py-2">Total Gap</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((result, index) => (
                  <tr key={result.modelId} className="border-b border-white/5 text-[#d8cfc2]">
                    <td className="px-2 py-2 font-mono">#{index + 1}</td>
                    <td className="px-2 py-2 font-semibold">{result.modelDisplayName}</td>
                    <td className="px-2 py-2">{result.aggregate.avgConcrete.toFixed(1)}</td>
                    <td className="px-2 py-2">{result.aggregate.avgSolid.toFixed(1)}</td>
                    <td className="px-2 py-2">{result.aggregate.avgSand.toFixed(1)}</td>
                    <td className="px-2 py-2">{result.aggregate.totalGap.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <ResultsViewer modelId={modelA?.modelId} />

      <footer className="mt-6 border-t border-white/10 pt-3 text-center font-mono text-[9px] tracking-[0.08em] text-[#5d5144]">
        SHORELINE v1 FOUNDATION • Sand = Phase 1 claimed depth • Solid = Phase 2 verified depth • Concrete = Phase 3 failure-aware depth
      </footer>
    </main>
  );
}
