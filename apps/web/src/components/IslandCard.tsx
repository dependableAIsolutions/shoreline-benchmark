"use client";

import { useState } from "react";
import { categoryLabels } from "../data/results";
import { formatMetric, severityColor } from "../lib/scoring";
import { CATEGORY_ORDER, type CategoryKey, type ModelResult } from "../lib/types";
import { Island } from "./Island";
import { Island3D } from "./Island3D";
import { StatBlock } from "./StatBlock";
import { Tooltip, metricTooltips } from "./Tooltip";

type ViewMode = "2D" | "3D";

interface IslandCardProps {
  model: ModelResult;
  hoveredCategory: CategoryKey | null;
  onHoverCategory: (category: CategoryKey | null) => void;
  compact?: boolean;
}

export function IslandCard({ model, hoveredCategory, onHoverCategory, compact = false }: IslandCardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("2D");
  const stats = model.aggregate;
  const totalTrials = model.metadata.totalTrials;
  const invalidRate = totalTrials > 0 ? (model.metadata.invalidTrials / totalTrials) * 100 : 0;
  const isLowSampleRun = totalTrials <= Object.keys(model.categories).length;
  const underconfidence = stats.underconfidence ?? Math.max(0, stats.avgSolid - (stats.avgClaimed ?? stats.avgSand));
  const totalGap = stats.totalGap ?? stats.overconfidence + underconfidence + stats.blindSpots;
  const capability = stats.avgCapability ?? 0;
  const discernment = stats.avgDiscernment ?? 0;
  const calibration = stats.calibrationIndex ?? Math.max(0, 100 - (stats.avgCalibrationError ?? 0));
  const categoryRows = CATEGORY_ORDER.map((categoryKey) => ({
    key: categoryKey,
    label: categoryLabels[categoryKey],
    trials: model.categories[categoryKey]?.trialCount ?? 0,
    sand: model.categories[categoryKey]?.sand ?? 0,
    solid: model.categories[categoryKey]?.solid ?? 0,
    concrete: model.categories[categoryKey]?.concrete ?? 0
  }));

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-base font-bold text-[#E8E0D4]">{model.modelDisplayName}</h2>
        {/* View mode toggle */}
        <div className="flex rounded border border-white/10 font-mono text-[10px]">
          <button
            onClick={() => setViewMode("2D")}
            className={`px-2 py-0.5 transition-colors ${
              viewMode === "2D"
                ? "bg-white/10 text-[#E8E0D4]"
                : "text-[#6f6457] hover:text-[#E8E0D4]"
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setViewMode("3D")}
            className={`px-2 py-0.5 transition-colors ${
              viewMode === "3D"
                ? "bg-white/10 text-[#E8E0D4]"
                : "text-[#6f6457] hover:text-[#E8E0D4]"
            }`}
          >
            3D
          </button>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-2 font-mono text-[10px] text-[#6f6457]">
        <span className="rounded border border-white/10 px-2 py-0.5">{totalTrials} trials</span>
        {isLowSampleRun && <span className="rounded border border-[#F59E0B]/40 px-2 py-0.5 text-[#F59E0B]">quick run</span>}
        {model.metadata.invalidTrials > 0 && (
          <Tooltip content={metricTooltips.invalidConfidence} position="bottom" maxWidth={320}>
            <span className="rounded border border-[#F87171]/40 px-2 py-0.5 text-[#F87171]">
              {invalidRate.toFixed(1)}% invalid confidence
            </span>
          </Tooltip>
        )}
      </div>

      <details className="mb-3 rounded-lg border border-white/10 bg-black/10 px-3 py-2">
        <summary className="cursor-pointer font-mono text-[10px] tracking-[0.14em] text-[#8c7d6b]">
          HOW THIS ISLAND IS FORMED
        </summary>
        <div className="mt-2 space-y-2 text-[11px] text-[#9a8b79]">
          <p>
            Each spoke is one category. Layer depth is computed from all trials in that category after normalizing
            difficulty (0-100 scale).
          </p>
          <p>
            Sand = Phase 1 claimed depth. Solid = Phase 2 verified depth. Concrete = Phase 3 failure-aware depth
            (wrong + low confidence).
          </p>
          <p>
            Aggregate gap metrics: Overconfidence = max(0, Sand - Solid), Underconfidence = max(0, Solid - Sand), Blind
            Spots = wrong + confident.
          </p>
          <div className="overflow-x-auto rounded border border-white/5">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] font-mono text-[9px] tracking-[0.12em] text-[#6f6457]">
                  <th className="px-2 py-1 text-left">Category</th>
                  <th className="px-2 py-1 text-left">Trials</th>
                  <th className="px-2 py-1 text-left">Sand</th>
                  <th className="px-2 py-1 text-left">Solid</th>
                  <th className="px-2 py-1 text-left">Concrete</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((row) => (
                  <tr key={row.key} className="border-b border-white/5 text-[10px] text-[#8f8374]">
                    <td className="px-2 py-1">{row.label}</td>
                    <td className="px-2 py-1 font-mono">{row.trials}</td>
                    <td className="px-2 py-1 font-mono">{row.sand.toFixed(1)}</td>
                    <td className="px-2 py-1 font-mono">{row.solid.toFixed(1)}</td>
                    <td className="px-2 py-1 font-mono">{row.concrete.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      {viewMode === "2D" ? (
        <Island
          model={model}
          size={compact ? 420 : 520}
          hoveredCategory={hoveredCategory}
          onHoverCategory={onHoverCategory}
        />
      ) : (
        <Island3D
          model={model}
          size={compact ? 420 : 520}
          hoveredCategory={hoveredCategory}
          onHoverCategory={onHoverCategory}
        />
      )}

      <div className="mt-3 flex gap-3 rounded-xl bg-white/[0.02] px-3 py-3">
        <Tooltip content={metricTooltips.concrete} className="flex-1">
          <StatBlock label="CONCRETE" value={formatMetric(stats.avgConcrete)} color="#8A9CAA" sub="failure-aware depth" />
        </Tooltip>
        <Tooltip content={metricTooltips.solid} className="flex-1">
          <StatBlock label="SOLID" value={formatMetric(stats.avgSolid)} color="#3DA84A" sub="verified depth" />
        </Tooltip>
        <Tooltip content={metricTooltips.sand} className="flex-1">
          <StatBlock label="SAND" value={formatMetric(stats.avgSand)} color="#F59E0B" sub="claimed depth" />
        </Tooltip>
      </div>

      <div className="mt-2 flex gap-3 rounded-xl bg-white/[0.02] px-3 py-2">
        <Tooltip content={metricTooltips.overconfidence} position="bottom" className="flex-1">
          <div>
            <div className="font-mono text-[8px] tracking-[0.18em] text-[#4A4038]">OVERCONFIDENCE</div>
            <div className="font-mono text-xl font-bold" style={{ color: severityColor(stats.overconfidence) }}>
              {formatMetric(stats.overconfidence)}
            </div>
            <div className="text-[9px] text-[#554a3e]">claimed beyond solid</div>
          </div>
        </Tooltip>
        <Tooltip content={metricTooltips.underconfidence} position="bottom" className="flex-1">
          <div>
            <div className="font-mono text-[8px] tracking-[0.18em] text-[#4A4038]">UNDERCONFIDENCE</div>
            <div className="font-mono text-xl font-bold" style={{ color: severityColor(underconfidence) }}>
              {formatMetric(underconfidence)}
            </div>
            <div className="text-[9px] text-[#554a3e]">solid beyond claimed</div>
          </div>
        </Tooltip>
        <Tooltip content={metricTooltips.blindSpots} position="bottom" className="flex-1">
          <div>
            <div className="font-mono text-[8px] tracking-[0.18em] text-[#4A4038]">BLIND SPOTS</div>
            <div className="font-mono text-xl font-bold" style={{ color: severityColor(stats.blindSpots) }}>
              {formatMetric(stats.blindSpots)}
            </div>
            <div className="text-[9px] text-[#554a3e]">wrong but confident</div>
          </div>
        </Tooltip>
        <Tooltip content={metricTooltips.totalGap} position="bottom" className="flex-1">
          <div>
            <div className="font-mono text-[8px] tracking-[0.18em] text-[#4A4038]">TOTAL GAP</div>
            <div className="font-mono text-xl font-bold" style={{ color: severityColor(totalGap) }}>
              {formatMetric(totalGap)}
            </div>
            <div className="text-[9px] text-[#554a3e]">claim/perf misalignment + blind spots</div>
          </div>
        </Tooltip>
      </div>

      <div className="mt-2 flex gap-3 rounded-xl bg-white/[0.02] px-3 py-2">
        <Tooltip content={metricTooltips.capability} position="bottom" className="flex-1">
          <div>
            <div className="font-mono text-[8px] tracking-[0.18em] text-[#4A4038]">CAPABILITY IDX</div>
            <div className="font-mono text-xl font-bold text-[#7cc7ff]">{formatMetric(capability)}</div>
            <div className="text-[9px] text-[#554a3e]">normalized difficulty frontier</div>
          </div>
        </Tooltip>
        <Tooltip content={metricTooltips.discernment} position="bottom" className="flex-1">
          <div>
            <div className="font-mono text-[8px] tracking-[0.18em] text-[#4A4038]">DISCERNMENT</div>
            <div className="font-mono text-xl font-bold text-[#a78bfa]">{formatMetric(discernment)}</div>
            <div className="text-[9px] text-[#554a3e]">correctly detects success/failure</div>
          </div>
        </Tooltip>
        <Tooltip content={metricTooltips.calibration} position="bottom" className="flex-1">
          <div>
            <div className="font-mono text-[8px] tracking-[0.18em] text-[#4A4038]">CALIBRATION IDX</div>
            <div className="font-mono text-xl font-bold text-[#22d3ee]">{formatMetric(calibration)}</div>
            <div className="text-[9px] text-[#554a3e]">confidence vs realized accuracy</div>
          </div>
        </Tooltip>
      </div>
    </section>
  );
}
