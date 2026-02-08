"use client";

import { formatMetric, severityColor } from "../lib/scoring";
import type { CategoryKey, ModelResult } from "../lib/types";
import { Island } from "./Island";
import { StatBlock } from "./StatBlock";
import { Tooltip, metricTooltips } from "./Tooltip";

interface IslandCardProps {
  model: ModelResult;
  hoveredCategory: CategoryKey | null;
  onHoverCategory: (category: CategoryKey | null) => void;
  compact?: boolean;
}

export function IslandCard({ model, hoveredCategory, onHoverCategory, compact = false }: IslandCardProps) {
  const stats = model.aggregate;
  const underconfidence = stats.underconfidence ?? Math.max(0, stats.avgSolid - (stats.avgClaimed ?? stats.avgSand));
  const totalGap = stats.totalGap ?? stats.overconfidence + underconfidence + stats.blindSpots;
  const capability = stats.avgCapability ?? 0;
  const discernment = stats.avgDiscernment ?? 0;
  const calibration = stats.calibrationIndex ?? Math.max(0, 100 - (stats.avgCalibrationError ?? 0));

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h2 className="mb-3 font-mono text-base font-bold text-[#E8E0D4]">{model.modelDisplayName}</h2>

      <Island
        model={model}
        size={compact ? 420 : 520}
        hoveredCategory={hoveredCategory}
        onHoverCategory={onHoverCategory}
      />

      <div className="mt-3 flex gap-3 rounded-xl bg-white/[0.02] px-3 py-3">
        <Tooltip content={metricTooltips.concrete} className="flex-1">
          <StatBlock label="CONCRETE" value={formatMetric(stats.avgConcrete)} color="#8A9CAA" sub="buildable" />
        </Tooltip>
        <Tooltip content={metricTooltips.solid} className="flex-1">
          <StatBlock label="SOLID" value={formatMetric(stats.avgSolid)} color="#3DA84A" sub="actual" />
        </Tooltip>
        <Tooltip content={metricTooltips.sand} className="flex-1">
          <StatBlock label="SAND" value={formatMetric(stats.avgSand)} color="#F59E0B" sub="outer envelope" />
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
            <div className="text-[9px] text-[#554a3e]">solid beyond concrete</div>
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
