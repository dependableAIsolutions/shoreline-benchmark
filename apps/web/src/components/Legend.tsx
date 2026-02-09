import { Tooltip, metricTooltips } from "./Tooltip";

export function Legend() {
  return (
    <div className="mb-5 flex flex-wrap gap-6 rounded-xl border border-white/10 bg-white/[0.015] px-4 py-3">
      <Tooltip content={metricTooltips.concrete}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-7 rounded border-2 border-[#64788C] bg-[rgba(85,100,115,0.6)]" />
          <div>
            <span className="font-mono text-[11px] font-semibold text-[#8A9CAA]">Concrete</span>
            <span className="ml-2 text-[11px] text-[#6f6457]">Phase 3 failure-aware depth.</span>
          </div>
        </div>
      </Tooltip>
      <Tooltip content={metricTooltips.solid}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-7 rounded border-2 border-[#3C9646] bg-[rgba(55,140,65,0.35)]" />
          <div>
            <span className="font-mono text-[11px] font-semibold text-[#3DA84A]">Solid</span>
            <span className="ml-2 text-[11px] text-[#6f6457]">Phase 2 verified depth (difficulty-weighted).</span>
          </div>
        </div>
      </Tooltip>
      <Tooltip content={metricTooltips.sand}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-7 rounded border-2 border-dashed border-[#F59E0B] bg-[rgba(245,158,11,0.25)]" />
          <div>
            <span className="font-mono text-[11px] font-semibold text-[#F59E0B]">Sand</span>
            <span className="ml-2 text-[11px] text-[#6f6457]">Phase 1 claim depth (confidence × difficulty).</span>
          </div>
        </div>
      </Tooltip>
    </div>
  );
}
