"use client";

import { formatMetric, severityColor } from "../lib/scoring";
import type { CategoryKey, ModelResult } from "../lib/types";
import { Island } from "./Island";
import { StatBlock } from "./StatBlock";

interface IslandCardProps {
  model: ModelResult;
  hoveredCategory: CategoryKey | null;
  onHoverCategory: (category: CategoryKey | null) => void;
  compact?: boolean;
}

export function IslandCard({ model, hoveredCategory, onHoverCategory, compact = false }: IslandCardProps) {
  const stats = model.aggregate;
  const totalGap = stats.overconfidence + stats.blindSpots;

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
        <StatBlock label="CONCRETE" value={formatMetric(stats.avgConcrete)} color="#8A9CAA" sub="buildable" />
        <StatBlock label="SOLID" value={formatMetric(stats.avgSolid)} color="#3DA84A" sub="actual" />
        <StatBlock label="SAND" value={formatMetric(stats.avgSand)} color="#C4B582" sub="claimed" />
      </div>

      <div className="mt-2 flex gap-3 rounded-xl bg-white/[0.02] px-3 py-2">
        <div className="flex-1">
          <div className="font-mono text-[8px] tracking-[0.18em] text-[#4A4038]">OVERCONFIDENCE</div>
          <div className="font-mono text-xl font-bold" style={{ color: severityColor(stats.overconfidence) }}>
            {formatMetric(stats.overconfidence)}
          </div>
          <div className="text-[9px] text-[#554a3e]">sand beyond solid</div>
        </div>
        <div className="flex-1">
          <div className="font-mono text-[8px] tracking-[0.18em] text-[#4A4038]">BLIND SPOTS</div>
          <div className="font-mono text-xl font-bold" style={{ color: severityColor(stats.blindSpots) }}>
            {formatMetric(stats.blindSpots)}
          </div>
          <div className="text-[9px] text-[#554a3e]">solid beyond concrete</div>
        </div>
        <div className="flex-1">
          <div className="font-mono text-[8px] tracking-[0.18em] text-[#4A4038]">TOTAL GAP</div>
          <div className="font-mono text-xl font-bold" style={{ color: severityColor(totalGap) }}>
            {formatMetric(totalGap)}
          </div>
          <div className="text-[9px] text-[#554a3e]">sand to concrete</div>
        </div>
      </div>
    </section>
  );
}
