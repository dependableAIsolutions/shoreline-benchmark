interface StatBlockProps {
  label: string;
  value: string;
  sub?: string;
  color: string;
}

export function StatBlock({ label, value, sub, color }: StatBlockProps) {
  return (
    <div>
      <div className="mb-1 font-mono text-[8px] tracking-[0.18em] text-[#4A4038]">{label}</div>
      <div className="font-mono text-[26px] font-bold leading-none" style={{ color }}>
        {value}
      </div>
      {sub ? <div className="mt-1 text-[10px] text-[#4A4038]">{sub}</div> : null}
    </div>
  );
}
