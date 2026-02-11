import { Tooltip, metricTooltips } from "./Tooltip";

export function Legend() {
  return (
    <div className="mb-5 grid gap-3 rounded-xl border border-white/10 bg-white/[0.015] px-3 py-3 sm:flex sm:flex-wrap sm:gap-6 sm:px-4">
      <Tooltip content={metricTooltips.concrete}>
        <div className="flex items-start gap-2">
          <div className="h-4 w-7 rounded border-2 border-[#64788C] bg-[rgba(85,100,115,0.6)]" />
          <div className="leading-relaxed">
            <span className="font-mono text-[11px] font-semibold text-[#8A9CAA]">Concrete</span>
            <span className="ml-2 text-[12px] text-[#6f6457] sm:text-[11px]">How well it catches its own mistakes.</span>
          </div>
        </div>
      </Tooltip>
      <Tooltip content={metricTooltips.solid}>
        <div className="flex items-start gap-2">
          <div className="h-4 w-7 rounded border-2 border-[#3C9646] bg-[rgba(55,140,65,0.35)]" />
          <div className="leading-relaxed">
            <span className="font-mono text-[11px] font-semibold text-[#3DA84A]">Solid</span>
            <span className="ml-2 text-[12px] text-[#6f6457] sm:text-[11px]">What it actually gets right.</span>
          </div>
        </div>
      </Tooltip>
      <Tooltip content={metricTooltips.sand}>
        <div className="flex items-start gap-2">
          <div className="h-4 w-7 rounded border-2 border-dashed border-[#F59E0B] bg-[rgba(245,158,11,0.25)]" />
          <div className="leading-relaxed">
            <span className="font-mono text-[11px] font-semibold text-[#F59E0B]">Sand</span>
            <span className="ml-2 text-[12px] text-[#6f6457] sm:text-[11px]">What it thinks it can do.</span>
          </div>
        </div>
      </Tooltip>
    </div>
  );
}
