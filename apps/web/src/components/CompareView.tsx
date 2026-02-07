import type { ModelResult } from "../lib/types";

interface CompareViewProps {
  left: ModelResult;
  right: ModelResult;
}

export function CompareView({ left, right }: CompareViewProps) {
  const leftGap = left.aggregate.overconfidence + left.aggregate.blindSpots;
  const rightGap = right.aggregate.overconfidence + right.aggregate.blindSpots;
  const betterPerf = left.aggregate.avgSolid > right.aggregate.avgSolid ? left : right;
  const betterSelf = leftGap < rightGap ? left : right;
  const worseSelf = leftGap < rightGap ? right : left;

  return (
    <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.015] px-4 py-4">
      <div className="mb-2 font-mono text-[9px] tracking-[0.2em] text-[#4A4038]">COMPARATIVE INSIGHT</div>
      <p className="font-serif text-base leading-relaxed text-[#8A7E70]">
        {betterPerf.modelId === betterSelf.modelId ? (
          <>
            <strong className="text-[#E8E0D4]">{betterPerf.modelDisplayName}</strong> leads on raw performance and self-awareness,
            pairing higher solid ground with tighter calibration.
          </>
        ) : (
          <>
            <strong className="text-[#E8E0D4]">{betterPerf.modelDisplayName}</strong> has stronger raw capability, but{" "}
            <strong className="text-[#E8E0D4]">{betterSelf.modelDisplayName}</strong> tracks its own reliability better.
            <strong className="text-[#E8E0D4]"> {worseSelf.modelDisplayName}</strong> carries about {Math.abs(leftGap - rightGap).toFixed(1)}
            points of extra unverified capability.
          </>
        )}
      </p>
    </section>
  );
}
