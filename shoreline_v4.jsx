import { useState, useMemo } from "react";

const CATEGORIES = [
  { key: "mult", label: "Multiplication" },
  { key: "modexp", label: "Modular Exp." },
  { key: "bool", label: "Boolean Circuits" },
  { key: "matrix", label: "Matrix Det." },
  { key: "combo", label: "Combinatorics" },
  { key: "random", label: "Random Gen." },
  { key: "constrained", label: "Constrained Write" },
  { key: "sudoku", label: "Sudoku Gen." },
  { key: "distrib", label: "Distribution" },
  { key: "selfref", label: "Self-Referential" },
  { key: "counting", label: "Counting" },
];

const MODELS = {
  "Claude Opus 4.6": {
    sand:     { mult: 82, modexp: 70, bool: 88, matrix: 60, combo: 72, random: 55, constrained: 72, sudoku: 56, distrib: 55, selfref: 68, counting: 60 },
    solid:    { mult: 78, modexp: 62, bool: 85, matrix: 50, combo: 68, random: 40, constrained: 60, sudoku: 44, distrib: 47, selfref: 52, counting: 42 },
    concrete: { mult: 72, modexp: 54, bool: 80, matrix: 42, combo: 60, random: 30, constrained: 48, sudoku: 36, distrib: 38, selfref: 38, counting: 30 },
  },
  "GPT-4o": {
    sand:     { mult: 85, modexp: 75, bool: 88, matrix: 70, combo: 78, random: 65, constrained: 72, sudoku: 68, distrib: 62, selfref: 68, counting: 72 },
    solid:    { mult: 74, modexp: 58, bool: 80, matrix: 52, combo: 64, random: 43, constrained: 66, sudoku: 48, distrib: 44, selfref: 56, counting: 46 },
    concrete: { mult: 60, modexp: 42, bool: 68, matrix: 36, combo: 48, random: 28, constrained: 58, sudoku: 32, distrib: 30, selfref: 44, counting: 28 },
  },
  "Llama 3.1 405B": {
    sand:     { mult: 68, modexp: 50, bool: 75, matrix: 43, combo: 58, random: 40, constrained: 54, sudoku: 38, distrib: 44, selfref: 48, counting: 42 },
    solid:    { mult: 64, modexp: 46, bool: 72, matrix: 39, combo: 54, random: 36, constrained: 49, sudoku: 34, distrib: 39, selfref: 44, counting: 38 },
    concrete: { mult: 62, modexp: 44, bool: 70, matrix: 37, combo: 52, random: 34, constrained: 46, sudoku: 32, distrib: 37, selfref: 42, counting: 36 },
  },
};

const MODEL_NAMES = Object.keys(MODELS);

function polarToXY(cx, cy, angleDeg, radius) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function getSmoothedPoints(cx, cy, values, maxRadius) {
  const n = values.length;
  const step = 360 / n;
  return values.map((v, i) => {
    const r = (Math.max(v, 2) / 100) * maxRadius;
    return polarToXY(cx, cy, i * step, r);
  });
}

function catmullRom(points, tension = 0.65) {
  const n = points.length;
  if (n < 2) return "";
  const getP = (i) => points[((i % n) + n) % n];
  let path = "";
  for (let i = 0; i < n; i++) {
    const p0 = getP(i - 1);
    const p1 = getP(i);
    const p2 = getP(i + 1);
    const p3 = getP(i + 2);
    const cp1x = p1.x + (p2.x - p0.x) / (6 * tension);
    const cp1y = p1.y + (p2.y - p0.y) / (6 * tension);
    const cp2x = p2.x - (p3.x - p1.x) / (6 * tension);
    const cp2y = p2.y - (p3.y - p1.y) / (6 * tension);
    if (i === 0) path += `M ${p1.x},${p1.y} `;
    path += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y} `;
  }
  return path + "Z";
}

function Island({ name, data, size = 480, showLabels = true, hovered, onHoverCat }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 50;
  const n = CATEGORIES.length;
  const step = 360 / n;

  const sandVals = CATEGORIES.map(c => data.sand[c.key]);
  const solidVals = CATEGORIES.map(c => data.solid[c.key]);
  const concreteVals = CATEGORIES.map(c => data.concrete[c.key]);

  const sandPts = getSmoothedPoints(cx, cy, sandVals, maxR);
  const solidPts = getSmoothedPoints(cx, cy, solidVals, maxR);
  const concretePts = getSmoothedPoints(cx, cy, concreteVals, maxR);

  const sandPath = catmullRom(sandPts);
  const solidPath = catmullRom(solidPts);
  const concretePath = catmullRom(concretePts);

  const uid = name.replace(/[\s.]/g, '');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size }}>
      <defs>
        <radialGradient id={`ocean-${uid}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#0E1B3D" />
          <stop offset="60%" stopColor="#0A1230" />
          <stop offset="100%" stopColor="#070D1F" />
        </radialGradient>

        {/* Sand texture pattern */}
        <pattern id={`sandTex-${uid}`} patternUnits="userSpaceOnUse" width="8" height="8">
          <rect width="8" height="8" fill="rgba(196,181,130,0.14)" />
          <circle cx="2" cy="2" r="0.7" fill="rgba(210,195,145,0.22)" />
          <circle cx="6" cy="5" r="0.5" fill="rgba(210,195,145,0.18)" />
          <circle cx="4" cy="7" r="0.4" fill="rgba(195,180,130,0.15)" />
        </pattern>

        {/* Solid ground gradient */}
        <radialGradient id={`solidGrad-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(55,140,65,0.45)" />
          <stop offset="100%" stopColor="rgba(40,110,50,0.3)" />
        </radialGradient>

        {/* Concrete gradient */}
        <radialGradient id={`concreteGrad-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(85,100,115,0.65)" />
          <stop offset="100%" stopColor="rgba(65,80,95,0.5)" />
        </radialGradient>

        {/* Water caustics effect */}
        <filter id={`waterGlow-${uid}`}>
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`softEdge-${uid}`}>
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Deep ocean */}
      <circle cx={cx} cy={cy} r={maxR + 40} fill={`url(#ocean-${uid})`} />

      {/* Subtle ocean rings */}
      {[0.35, 0.55, 0.75, 0.95].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={maxR * r}
          fill="none" stroke="rgba(40,70,120,0.08)" strokeWidth={0.5} />
      ))}

      {/* Shallow water glow around sand */}
      <path d={sandPath}
        fill="none"
        stroke="rgba(60,130,160,0.15)"
        strokeWidth={16}
        filter={`url(#waterGlow-${uid})`}
      />

      {/* Sand layer - outermost, unstable shore */}
      <path d={sandPath}
        fill={`url(#sandTex-${uid})`}
        stroke="rgba(196,181,130,0.4)"
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
      {/* Sand inner fill for more visibility */}
      <path d={sandPath}
        fill="rgba(196,181,130,0.08)"
      />

      {/* Solid ground - verified performance, always green */}
      <path d={solidPath}
        fill={`url(#solidGrad-${uid})`}
        stroke="rgba(60,150,70,0.6)"
        strokeWidth={2}
      />

      {/* Concrete - buildable, innermost */}
      <path d={concretePath}
        fill={`url(#concreteGrad-${uid})`}
        stroke="rgba(100,120,140,0.7)"
        strokeWidth={2.5}
      />

      {/* Subtle elevation lines on concrete */}
      {[0.6, 0.75, 0.9].map((scale, i) => {
        const scaledVals = concreteVals.map(v => v * scale);
        const pts = getSmoothedPoints(cx, cy, scaledVals, maxR);
        const path = catmullRom(pts);
        return (
          <path key={i} d={path}
            fill="none"
            stroke="rgba(130,145,160,0.12)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Category axis lines (subtle) */}
      {CATEGORIES.map((cat, i) => {
        const angle = i * step;
        const outerR = Math.max(sandVals[i], solidVals[i], concreteVals[i]);
        const end = polarToXY(cx, cy, angle, (outerR / 100) * maxR + 6);
        return (
          <line key={cat.key}
            x1={cx} y1={cy} x2={end.x} y2={end.y}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Category labels */}
      {showLabels && CATEGORIES.map((cat, i) => {
        const angle = i * step;
        const outerVal = Math.max(sandVals[i], 20);
        const labelR = (outerVal / 100) * maxR + 28;
        const pos = polarToXY(cx, cy, angle, labelR);
        const rad = ((angle - 90) * Math.PI) / 180;
        const anchor = Math.abs(Math.cos(rad)) < 0.25 ? "middle" : Math.cos(rad) > 0 ? "start" : "end";
        const isHov = hovered === cat.key;

        const sandDot = polarToXY(cx, cy, angle, (sandVals[i] / 100) * maxR);
        const solidDot = polarToXY(cx, cy, angle, (solidVals[i] / 100) * maxR);
        const concreteDot = polarToXY(cx, cy, angle, (concreteVals[i] / 100) * maxR);

        return (
          <g key={cat.key}
            onMouseEnter={() => onHoverCat && onHoverCat(cat.key)}
            onMouseLeave={() => onHoverCat && onHoverCat(null)}
            style={{ cursor: "default" }}
          >
            <text x={pos.x} y={pos.y}
              textAnchor={anchor}
              dominantBaseline="central"
              fontSize={9}
              fontFamily="'JetBrains Mono', monospace"
              fill={isHov ? "#E8E0D4" : "#3D3630"}
              fontWeight={isHov ? 600 : 400}
              style={{ transition: "fill 0.15s" }}
            >
              {cat.label}
            </text>

            {/* Dots on each layer edge for this category */}
            {isHov && (
              <>
                <circle cx={sandDot.x} cy={sandDot.y} r={3} fill="rgba(196,181,130,0.8)" stroke="#C4B582" strokeWidth={1} />
                <circle cx={solidDot.x} cy={solidDot.y} r={3} fill="rgba(60,150,70,0.8)" stroke="#3C9646" strokeWidth={1} />
                <circle cx={concreteDot.x} cy={concreteDot.y} r={3.5} fill="rgba(100,120,140,0.8)" stroke="#64788C" strokeWidth={1} />

                {/* Tooltip */}
                <g>
                  <rect x={cx - 80} y={cy - 40} width={160} height={80} rx={8}
                    fill="rgba(8,12,26,0.94)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                  <text x={cx} y={cy - 24} textAnchor="middle" fontSize={11}
                    fontFamily="'JetBrains Mono', monospace" fill="#E8E0D4" fontWeight={700}>
                    {cat.label}
                  </text>
                  <text x={cx - 60} y={cy - 6} fontSize={10}
                    fontFamily="'JetBrains Mono', monospace" fill="#C4B582">
                    Sand: {sandVals[i]}
                  </text>
                  <text x={cx - 60} y={cy + 10} fontSize={10}
                    fontFamily="'JetBrains Mono', monospace" fill="#3DA84A">
                    Solid: {solidVals[i]}
                  </text>
                  <text x={cx - 60} y={cy + 26} fontSize={10}
                    fontFamily="'JetBrains Mono', monospace" fill="#8A9CAA">
                    Concrete: {concreteVals[i]}
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

function StatBlock({ label, value, sub, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 8, letterSpacing: 1.5, color: "#4A4038", marginBottom: 3,
      }}>{label}</div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 26, fontWeight: 700, color, lineHeight: 1,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#4A4038", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function ShorelineV4() {
  const [modelA, setModelA] = useState("Claude Opus 4.6");
  const [modelB, setModelB] = useState("GPT-4o");
  const [hoveredCat, setHoveredCat] = useState(null);
  const [mode, setMode] = useState("compare"); // "single" or "compare"

  const getStats = (name) => {
    const d = MODELS[name];
    const s = CATEGORIES.map(c => d.sand[c.key]);
    const g = CATEGORIES.map(c => d.solid[c.key]);
    const c = CATEGORIES.map(c => d.concrete[c.key]);
    const n = CATEGORIES.length;
    return {
      avgSand: s.reduce((a, b) => a + b, 0) / n,
      avgSolid: g.reduce((a, b) => a + b, 0) / n,
      avgConcrete: c.reduce((a, b) => a + b, 0) / n,
      overconf: (s.reduce((a, b) => a + b, 0) - g.reduce((a, b) => a + b, 0)) / n,
      blindSpots: (g.reduce((a, b) => a + b, 0) - c.reduce((a, b) => a + b, 0)) / n,
    };
  };

  const statsA = getStats(modelA);
  const statsB = getStats(modelB);

  return (
    <div style={{
      background: "#080C18",
      minHeight: "100vh",
      color: "#E8E0D4",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@400;500;600;700&family=Crimson+Text:wght@400;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, letterSpacing: 4, color: "#3D7A6E", marginBottom: 6,
          }}>METACOGNITIVE BENCHMARK</div>
          <h1 style={{
            fontFamily: "'Crimson Text', Georgia, serif",
            fontSize: 52, fontWeight: 700, margin: 0, letterSpacing: -1,
            background: "linear-gradient(135deg, #E8E0D4 0%, #A89880 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Shoreline</h1>
          <p style={{
            fontFamily: "'Crimson Text', serif",
            color: "#5A5044", margin: "4px 0 0", fontSize: 17, fontStyle: "italic",
          }}>
            Mapping where capability meets self-knowledge
          </p>
        </div>

        {/* Legend */}
        <div style={{
          display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap",
          padding: "14px 18px",
          background: "rgba(255,255,255,0.015)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 16, borderRadius: 4,
              background: "rgba(85,100,115,0.6)",
              border: "2px solid rgba(100,120,140,0.7)",
            }} />
            <div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: "#8A9CAA" }}>Concrete</span>
              <span style={{ fontSize: 11, color: "#4A4038", marginLeft: 6 }}>Buildable. Correct + self-aware.</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 16, borderRadius: 4,
              background: "rgba(55,140,65,0.35)",
              border: "2px solid rgba(60,150,70,0.6)",
            }} />
            <div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: "#3DA84A" }}>Solid</span>
              <span style={{ fontSize: 11, color: "#4A4038", marginLeft: 6 }}>Actual performance. Ground truth.</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 16, borderRadius: 4,
              background: "rgba(196,181,130,0.15)",
              border: "2px dashed rgba(196,181,130,0.4)",
            }} />
            <div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: "#C4B582" }}>Sand</span>
              <span style={{ fontSize: 11, color: "#4A4038", marginLeft: 6 }}>Claimed capability. Unverified.</span>
            </div>
          </div>
        </div>

        {/* Mode toggle + model selectors */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center",
        }}>
          <button onClick={() => setMode("single")} style={{
            padding: "7px 14px", borderRadius: 6,
            border: mode === "single" ? "2px solid #3D7A6E" : "2px solid rgba(255,255,255,0.06)",
            background: mode === "single" ? "rgba(61,122,110,0.1)" : "transparent",
            color: mode === "single" ? "#3D7A6E" : "#4A4038",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>Single</button>
          <button onClick={() => setMode("compare")} style={{
            padding: "7px 14px", borderRadius: 6,
            border: mode === "compare" ? "2px solid #3D7A6E" : "2px solid rgba(255,255,255,0.06)",
            background: mode === "compare" ? "rgba(61,122,110,0.1)" : "transparent",
            color: mode === "compare" ? "#3D7A6E" : "#4A4038",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>Compare</button>

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", margin: "0 8px" }} />

          {/* Model A selector */}
          <div style={{ display: "flex", gap: 4 }}>
            {MODEL_NAMES.map(name => (
              <button key={name} onClick={() => setModelA(name)} style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, cursor: "pointer",
                border: modelA === name ? "2px solid #E8E0D4" : "2px solid rgba(255,255,255,0.06)",
                background: modelA === name ? "rgba(232,224,212,0.08)" : "transparent",
                color: modelA === name ? "#E8E0D4" : "#3A3428",
              }}>{name}</button>
            ))}
          </div>

          {mode === "compare" && (
            <>
              <span style={{ color: "#3A3428", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>vs</span>
              <div style={{ display: "flex", gap: 4 }}>
                {MODEL_NAMES.filter(n => n !== modelA).map(name => (
                  <button key={name} onClick={() => setModelB(name)} style={{
                    padding: "6px 12px", borderRadius: 6, fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, cursor: "pointer",
                    border: modelB === name ? "2px solid #E8E0D4" : "2px solid rgba(255,255,255,0.06)",
                    background: modelB === name ? "rgba(232,224,212,0.08)" : "transparent",
                    color: modelB === name ? "#E8E0D4" : "#3A3428",
                  }}>{name}</button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Islands */}
        <div style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {/* Model A */}
          <div style={{
            flex: mode === "compare" ? "1 1 460px" : "1 1 600px",
            maxWidth: mode === "compare" ? 540 : 640,
            background: "rgba(255,255,255,0.015)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.05)",
            padding: 20,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 16, fontWeight: 700, color: "#E8E0D4", marginBottom: 12,
            }}>{modelA}</div>

            <Island
              name={modelA}
              data={MODELS[modelA]}
              size={mode === "compare" ? 420 : 520}
              hovered={hoveredCat}
              onHoverCat={setHoveredCat}
            />

            {/* Stats */}
            <div style={{
              display: "flex", gap: 12, marginTop: 12,
              padding: "12px 14px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: 10,
            }}>
              <StatBlock label="CONCRETE" value={statsA.avgConcrete.toFixed(1)} color="#8A9CAA" sub="buildable" />
              <StatBlock label="SOLID" value={statsA.avgSolid.toFixed(1)} color="#3DA84A" sub="actual" />
              <StatBlock label="SAND" value={statsA.avgSand.toFixed(1)} color="#C4B582" sub="claimed" />
            </div>
            <div style={{
              display: "flex", gap: 12, marginTop: 8,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: 10,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 1.5, color: "#4A4038" }}>OVERCONFIDENCE</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, lineHeight: 1.2,
                  color: statsA.overconf <= 5 ? "#4ADE80" : statsA.overconf <= 12 ? "#FBBF24" : "#F87171",
                }}>{statsA.overconf.toFixed(1)}</div>
                <div style={{ fontSize: 9, color: "#3A3428" }}>sand beyond solid</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 1.5, color: "#4A4038" }}>BLIND SPOTS</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, lineHeight: 1.2,
                  color: statsA.blindSpots <= 5 ? "#4ADE80" : statsA.blindSpots <= 12 ? "#FBBF24" : "#F87171",
                }}>{statsA.blindSpots.toFixed(1)}</div>
                <div style={{ fontSize: 9, color: "#3A3428" }}>solid beyond concrete</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 1.5, color: "#4A4038" }}>TOTAL GAP</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, lineHeight: 1.2,
                  color: (statsA.overconf + statsA.blindSpots) <= 10 ? "#4ADE80" : (statsA.overconf + statsA.blindSpots) <= 20 ? "#FBBF24" : "#F87171",
                }}>{(statsA.overconf + statsA.blindSpots).toFixed(1)}</div>
                <div style={{ fontSize: 9, color: "#3A3428" }}>sand to concrete</div>
              </div>
            </div>
          </div>

          {/* Model B (compare mode only) */}
          {mode === "compare" && (
            <div style={{
              flex: "1 1 460px",
              maxWidth: 540,
              background: "rgba(255,255,255,0.015)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.05)",
              padding: 20,
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16, fontWeight: 700, color: "#E8E0D4", marginBottom: 12,
              }}>{modelB}</div>

              <Island
                name={modelB}
                data={MODELS[modelB]}
                size={420}
                hovered={hoveredCat}
                onHoverCat={setHoveredCat}
              />

              {/* Stats */}
              <div style={{
                display: "flex", gap: 12, marginTop: 12,
                padding: "12px 14px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 10,
              }}>
                <StatBlock label="CONCRETE" value={statsB.avgConcrete.toFixed(1)} color="#8A9CAA" sub="buildable" />
                <StatBlock label="SOLID" value={statsB.avgSolid.toFixed(1)} color="#3DA84A" sub="actual" />
                <StatBlock label="SAND" value={statsB.avgSand.toFixed(1)} color="#C4B582" sub="claimed" />
              </div>
              <div style={{
                display: "flex", gap: 12, marginTop: 8,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 1.5, color: "#4A4038" }}>OVERCONFIDENCE</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, lineHeight: 1.2,
                    color: statsB.overconf <= 5 ? "#4ADE80" : statsB.overconf <= 12 ? "#FBBF24" : "#F87171",
                  }}>{statsB.overconf.toFixed(1)}</div>
                  <div style={{ fontSize: 9, color: "#3A3428" }}>sand beyond solid</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 1.5, color: "#4A4038" }}>BLIND SPOTS</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, lineHeight: 1.2,
                    color: statsB.blindSpots <= 5 ? "#4ADE80" : statsB.blindSpots <= 12 ? "#FBBF24" : "#F87171",
                  }}>{statsB.blindSpots.toFixed(1)}</div>
                  <div style={{ fontSize: 9, color: "#3A3428" }}>solid beyond concrete</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 1.5, color: "#4A4038" }}>TOTAL GAP</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, lineHeight: 1.2,
                    color: (statsB.overconf + statsB.blindSpots) <= 10 ? "#4ADE80" : (statsB.overconf + statsB.blindSpots) <= 20 ? "#FBBF24" : "#F87171",
                  }}>{(statsB.overconf + statsB.blindSpots).toFixed(1)}</div>
                  <div style={{ fontSize: 9, color: "#3A3428" }}>sand to concrete</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comparative insight (compare mode) */}
        {mode === "compare" && (
          <div style={{
            marginTop: 16,
            padding: "14px 18px",
            background: "rgba(255,255,255,0.015)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 2, color: "#4A4038", marginBottom: 8 }}>
              COMPARATIVE INSIGHT
            </div>
            <div style={{
              fontFamily: "'Crimson Text', serif",
              fontSize: 15, color: "#8A7E70", lineHeight: 1.6,
            }}>
              {(() => {
                const gapA = statsA.overconf + statsA.blindSpots;
                const gapB = statsB.overconf + statsB.blindSpots;
                const betterPerf = statsA.avgSolid > statsB.avgSolid ? modelA : modelB;
                const betterSelf = gapA < gapB ? modelA : modelB;
                const worseSelf = gapA < gapB ? modelB : modelA;

                if (betterPerf === betterSelf) {
                  return (<>
                    <strong style={{ color: "#E8E0D4" }}>{betterPerf}</strong> wins on both performance and self-knowledge.
                    It has more solid ground and a smaller gap between what it claims and what it can verify.
                  </>);
                }
                return (<>
                  <strong style={{ color: "#E8E0D4" }}>{betterPerf}</strong> has a bigger island (more raw capability),
                  but <strong style={{ color: "#E8E0D4" }}>{betterSelf}</strong> knows its coastline better.{" "}
                  <strong style={{ color: "#E8E0D4" }}>{worseSelf}</strong> has{" "}
                  {Math.abs(gapA - gapB).toFixed(1)} more points of unverified capability —
                  territory it claims but can't vouch for.
                  The question: do you want the model that can do more, or the one that knows what it can do?
                </>);
              })()}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 20, padding: "10px 0",
          borderTop: "1px solid rgba(255,255,255,0.03)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8, color: "#1E1A14", textAlign: "center", letterSpacing: 1,
        }}>
          SHORELINE v0.4 — Sand = Phase 1 prediction — Solid = Phase 2 performance — Concrete = Phase 3 verified self-evaluation — Mock data for illustration
        </div>
      </div>
    </div>
  );
}
