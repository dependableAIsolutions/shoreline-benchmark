"use client";

import { categoryLabels } from "../data/results";
import { catmullRom, getSmoothedPoints, polarToXY } from "../lib/splines";
import { CATEGORY_ORDER, type CategoryKey, type ModelResult } from "../lib/types";

interface IslandProps {
  model: ModelResult;
  size?: number;
  showLabels?: boolean;
  hoveredCategory: CategoryKey | null;
  onHoverCategory?: (category: CategoryKey | null) => void;
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

  const sandVals = CATEGORY_ORDER.map((key) => model.categories[key]?.sand ?? 0);
  const solidVals = CATEGORY_ORDER.map((key) => model.categories[key]?.solid ?? 0);
  const concreteVals = CATEGORY_ORDER.map((key) => model.categories[key]?.concrete ?? 0);

  const sandPath = catmullRom(getSmoothedPoints(cx, cy, sandVals, maxR));
  const solidPath = catmullRom(getSmoothedPoints(cx, cy, solidVals, maxR));
  const concretePath = catmullRom(getSmoothedPoints(cx, cy, concreteVals, maxR));

  const uid = model.modelId.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ maxWidth: size }}>
      <defs>
        <radialGradient id={`ocean-${uid}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#0E1B3D" />
          <stop offset="60%" stopColor="#0A1230" />
          <stop offset="100%" stopColor="#070D1F" />
        </radialGradient>

        <pattern id={`sandTex-${uid}`} patternUnits="userSpaceOnUse" width="8" height="8">
          <rect width="8" height="8" fill="rgba(196,181,130,0.14)" />
          <circle cx="2" cy="2" r="0.7" fill="rgba(210,195,145,0.22)" />
          <circle cx="6" cy="5" r="0.5" fill="rgba(210,195,145,0.18)" />
          <circle cx="4" cy="7" r="0.4" fill="rgba(195,180,130,0.15)" />
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

      <path d={sandPath} fill={`url(#sandTex-${uid})`} stroke="rgba(196,181,130,0.4)" strokeWidth={1.5} strokeDasharray="6 4" />
      <path d={sandPath} fill="rgba(196,181,130,0.08)" />

      <path d={solidPath} fill={`url(#solidGrad-${uid})`} stroke="rgba(60,150,70,0.6)" strokeWidth={2} />
      <path d={concretePath} fill={`url(#concreteGrad-${uid})`} stroke="rgba(100,120,140,0.7)" strokeWidth={2.5} />

      {[0.6, 0.75, 0.9].map((scale) => {
        const path = catmullRom(getSmoothedPoints(cx, cy, concreteVals.map((value) => value * scale), maxR));
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

      {showLabels &&
        CATEGORY_ORDER.map((category, index) => {
          const angle = index * step;
          const outerVal = Math.max(sandVals[index], 20);
          const labelR = (outerVal / 100) * maxR + 28;
          const pos = polarToXY(cx, cy, angle, labelR);
          const rad = ((angle - 90) * Math.PI) / 180;
          const anchor = Math.abs(Math.cos(rad)) < 0.25 ? "middle" : Math.cos(rad) > 0 ? "start" : "end";
          const isHovered = hoveredCategory === category;

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
              <text
                x={pos.x}
                y={pos.y}
                textAnchor={anchor}
                dominantBaseline="central"
                fontSize={9}
                fontFamily="'JetBrains Mono', monospace"
                fill={isHovered ? "#E8E0D4" : "#3D3630"}
                fontWeight={isHovered ? 600 : 400}
              >
                {categoryLabels[category as CategoryKey]}
              </text>

              {isHovered && (
                <>
                  <circle cx={sandDot.x} cy={sandDot.y} r={3} fill="rgba(196,181,130,0.8)" stroke="#C4B582" strokeWidth={1} />
                  <circle cx={solidDot.x} cy={solidDot.y} r={3} fill="rgba(60,150,70,0.8)" stroke="#3C9646" strokeWidth={1} />
                  <circle cx={concreteDot.x} cy={concreteDot.y} r={3.5} fill="rgba(100,120,140,0.8)" stroke="#64788C" strokeWidth={1} />

                  <g>
                    <rect
                      x={cx - 84}
                      y={cy - 42}
                      width={168}
                      height={84}
                      rx={8}
                      fill="rgba(8,12,26,0.94)"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                    />
                    <text
                      x={cx}
                      y={cy - 24}
                      textAnchor="middle"
                      fontSize={11}
                      fontFamily="'JetBrains Mono', monospace"
                      fill="#E8E0D4"
                      fontWeight={700}
                    >
                      {categoryLabels[category as CategoryKey]}
                    </text>
                    <text x={cx - 62} y={cy - 6} fontSize={10} fontFamily="'JetBrains Mono', monospace" fill="#C4B582">
                      Sand: {sandVals[index].toFixed(1)}
                    </text>
                    <text x={cx - 62} y={cy + 10} fontSize={10} fontFamily="'JetBrains Mono', monospace" fill="#3DA84A">
                      Solid: {solidVals[index].toFixed(1)}
                    </text>
                    <text x={cx - 62} y={cy + 26} fontSize={10} fontFamily="'JetBrains Mono', monospace" fill="#8A9CAA">
                      Concrete: {concreteVals[index].toFixed(1)}
                    </text>
                  </g>
                </>
              )}
            </g>
          );
        })}
    </svg>
  );
}
