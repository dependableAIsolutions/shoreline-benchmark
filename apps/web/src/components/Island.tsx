"use client";

import { categoryLabels } from "../data/results";
import { monotoneRadialPath, polarToXY } from "../lib/splines";
import { CATEGORY_ORDER, type CategoryKey, type ModelResult } from "../lib/types";

interface IslandProps {
  model: ModelResult;
  size?: number;
  showLabels?: boolean;
  hoveredCategory: CategoryKey | null;
  onHoverCategory?: (category: CategoryKey | null) => void;
}

function wedgePath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToXY(cx, cy, startAngle, radius);
  const end = polarToXY(cx, cy, endAngle, radius);
  const delta = ((endAngle - startAngle + 360) % 360) || 360;
  const largeArc = delta > 180 ? 1 : 0;
  return `M ${cx},${cy} L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArc} 1 ${end.x},${end.y} Z`;
}

export function Island({
  model,
  size = 480,
  showLabels = true,
  hoveredCategory,
  onHoverCategory
}: IslandProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 50;
  const step = 360 / CATEGORY_ORDER.length;

  const rawSandVals = CATEGORY_ORDER.map((key) => model.categories[key]?.sand ?? 0);
  const rawSolidVals = CATEGORY_ORDER.map((key) => model.categories[key]?.solid ?? 0);
  const rawConcreteVals = CATEGORY_ORDER.map((key) => model.categories[key]?.concrete ?? 0);
  const sandVals = rawSandVals;
  const solidVals = rawSolidVals;
  const concreteVals = rawConcreteVals;

  // Use monotone-preserving splines without rescaling so rendered radii stay faithful
  // to raw score values (0..100).
  const sandPath = monotoneRadialPath(cx, cy, sandVals, maxR, 2);
  const solidPath = monotoneRadialPath(cx, cy, solidVals, maxR, 1);
  const concretePath = monotoneRadialPath(cx, cy, concreteVals, maxR, 0);

  const uid = model.modelId.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto block w-full"
      style={{ maxWidth: size }}
      onMouseLeave={() => onHoverCategory?.(null)}
    >
      <defs>
        <radialGradient id={`ocean-${uid}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#0E1B3D" />
          <stop offset="60%" stopColor="#0A1230" />
          <stop offset="100%" stopColor="#070D1F" />
        </radialGradient>

        <pattern id={`sandTex-${uid}`} patternUnits="userSpaceOnUse" width="8" height="8">
          <rect width="8" height="8" fill="rgba(245,158,11,0.20)" />
          <circle cx="2" cy="2" r="0.7" fill="rgba(251,191,36,0.30)" />
          <circle cx="6" cy="5" r="0.5" fill="rgba(251,191,36,0.24)" />
          <circle cx="4" cy="7" r="0.4" fill="rgba(234,88,12,0.22)" />
        </pattern>

        <radialGradient id={`solidGrad-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(55,140,65,0.45)" />
          <stop offset="100%" stopColor="rgba(40,110,50,0.3)" />
        </radialGradient>

        <radialGradient id={`concreteGrad-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(85,100,115,0.65)" />
          <stop offset="100%" stopColor="rgba(65,80,95,0.5)" />
        </radialGradient>

        <filter id={`waterGlow-${uid}`}>
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r={maxR + 40} fill={`url(#ocean-${uid})`} />

      {[0.35, 0.55, 0.75, 0.95].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={maxR * r} fill="none" stroke="rgba(40,70,120,0.08)" strokeWidth={0.5} />
      ))}

      <path
        d={sandPath}
        fill="none"
        stroke="rgba(60,130,160,0.15)"
        strokeWidth={16}
        filter={`url(#waterGlow-${uid})`}
      />

      <path d={sandPath} fill={`url(#sandTex-${uid})`} stroke="rgba(245,158,11,0.65)" strokeWidth={1.5} strokeDasharray="6 4" />
      <path d={sandPath} fill="rgba(245,158,11,0.12)" />

      <path d={solidPath} fill={`url(#solidGrad-${uid})`} stroke="rgba(60,150,70,0.6)" strokeWidth={2} />
      <path d={concretePath} fill={`url(#concreteGrad-${uid})`} stroke="rgba(100,120,140,0.7)" strokeWidth={2.5} />

      {[0.6, 0.75, 0.9].map((scale, idx) => {
        const scaledVals = concreteVals.map((value) => value * scale);
        const path = monotoneRadialPath(cx, cy, scaledVals, maxR, idx + 3);
        return <path key={scale} d={path} fill="none" stroke="rgba(130,145,160,0.12)" strokeWidth={0.5} />;
      })}

      {CATEGORY_ORDER.map((category, index) => {
        const angle = index * step;
        const outerR = Math.max(sandVals[index], solidVals[index], concreteVals[index]);
        const end = polarToXY(cx, cy, angle, (outerR / 100) * maxR + 6);
        return (
          <line key={category} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
        );
      })}

      {CATEGORY_ORDER.map((category, index) => {
        const angle = index * step;
        const start = angle - step / 2;
        const end = angle + step / 2;
        return (
          <path
            key={`hit-${category}`}
            d={wedgePath(cx, cy, maxR + 20, start, end)}
            fill="transparent"
            onMouseEnter={() => onHoverCategory?.(category)}
            onMouseMove={() => onHoverCategory?.(category)}
          />
        );
      })}

      {showLabels &&
        CATEGORY_ORDER.map((category, index) => {
          const angle = index * step;
          const outerVal = Math.max(sandVals[index], 20);
          const labelR = (outerVal / 100) * maxR + 28;
          const pos = polarToXY(cx, cy, angle, labelR);
          const rad = ((angle - 90) * Math.PI) / 180;
          const anchor = Math.abs(Math.cos(rad)) < 0.25 ? "middle" : Math.cos(rad) > 0 ? "start" : "end";
          const isHovered = hoveredCategory === category;
          const cardRows = [
            { label: "Sand", value: rawSandVals[index], color: "#F59E0B" },
            { label: "Solid", value: rawSolidVals[index], color: "#3DA84A" },
            { label: "Concrete", value: rawConcreteVals[index], color: "#8A9CAA" }
          ] as const;

          const sandDot = polarToXY(cx, cy, angle, (sandVals[index] / 100) * maxR);
          const solidDot = polarToXY(cx, cy, angle, (solidVals[index] / 100) * maxR);
          const concreteDot = polarToXY(cx, cy, angle, (concreteVals[index] / 100) * maxR);

          return (
            <g
              key={category}
              onMouseEnter={() => onHoverCategory?.(category)}
              onMouseLeave={() => onHoverCategory?.(null)}
              style={{ cursor: "default" }}
            >
              {/* Hide outer label when tooltip is open to avoid overlap */}
              {!isHovered && (
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor={anchor}
                  dominantBaseline="central"
                  fontSize={9}
                  fontFamily="'JetBrains Mono', monospace"
                  fill="#3D3630"
                  fontWeight={400}
                >
                  {categoryLabels[category as CategoryKey]}
                </text>
              )}

              {isHovered && (
                <g pointerEvents="none">
                  <circle cx={sandDot.x} cy={sandDot.y} r={3} fill="rgba(245,158,11,0.9)" stroke="#F59E0B" strokeWidth={1} />
                  <circle cx={solidDot.x} cy={solidDot.y} r={3} fill="rgba(60,150,70,0.8)" stroke="#3C9646" strokeWidth={1} />
                  <circle cx={concreteDot.x} cy={concreteDot.y} r={3.5} fill="rgba(100,120,140,0.8)" stroke="#64788C" strokeWidth={1} />

                  <g>
                    <rect
                      x={cx - 82}
                      y={cy - 44}
                      width={164}
                      height={88}
                      rx={8}
                      fill="rgba(8,12,26,0.96)"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth={1}
                    />
                    <text
                      x={cx}
                      y={cy - 26}
                      textAnchor="middle"
                      fontSize={10}
                      fontFamily="'JetBrains Mono', monospace"
                      fill="#E8E0D4"
                      fontWeight={700}
                    >
                      {categoryLabels[category as CategoryKey]}
                    </text>
                    {cardRows.map((row, rowIndex) => (
                      <g key={row.label}>
                        <text
                          x={cx - 62}
                          y={cy - 8 + rowIndex * 14}
                          fontSize={9}
                          fontFamily="'JetBrains Mono', monospace"
                          fill={row.color}
                        >
                          {row.label}
                        </text>
                        <text
                          x={cx + 62}
                          y={cy - 8 + rowIndex * 14}
                          textAnchor="end"
                          fontSize={9}
                          fontFamily="'JetBrains Mono', monospace"
                          fill={row.color}
                        >
                          {row.value.toFixed(1)}
                        </text>
                      </g>
                    ))}
                  </g>
                </g>
              )}
            </g>
          );
        })}
    </svg>
  );
}
