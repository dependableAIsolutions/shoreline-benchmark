export interface Point {
  x: number;
  y: number;
}

function quantize(value: number, precision = 3): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function polarToXY(cx: number, cy: number, angleDeg: number, radius: number): Point {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    // Quantize coordinates so server/browser floating-point differences don't trigger hydration mismatches.
    x: quantize(cx + radius * Math.cos(rad)),
    y: quantize(cy + radius * Math.sin(rad))
  };
}

export function getSmoothedPoints(cx: number, cy: number, values: number[], maxRadius: number): Point[] {
  const n = values.length;
  const step = 360 / n;
  return values.map((value, index) => {
    const r = (Math.max(0, Math.min(value, 100)) / 100) * maxRadius;
    return polarToXY(cx, cy, index * step, r);
  });
}

/**
 * Simple polygon path - no interpolation, guaranteed no overshoot.
 * Used as fallback for containment-critical rendering.
 */
export function polygonPath(points: Point[]): string {
  if (points.length < 2) return "";
  const [first, ...rest] = points;
  return `M ${first.x},${first.y} ${rest.map((p) => `L ${p.x},${p.y}`).join(" ")} Z`;
}

/**
 * Monotone-preserving radial spline path.
 * Uses quadratic Bezier curves with control points constrained to prevent overshoot.
 * Uses raw metric values (0-100) without artificial capping/expansion so geometry
 * directly reflects benchmark scores.
 *
 * @param _layerIndex - retained for API compatibility
 */
export function monotoneRadialPath(
  cx: number,
  cy: number,
  values: number[],
  maxRadius: number,
  _layerIndex = 0
): string {
  const n = values.length;
  if (n < 2) return "";

  const step = 360 / n;

  // Preserve raw scale: 0 maps to center, 100 maps to maxRadius.
  const radii = values.map((v) => (Math.max(0, Math.min(v, 100)) / 100) * maxRadius);

  const getRadius = (i: number) => radii[((i % n) + n) % n];
  const getPoint = (i: number, r: number) => polarToXY(cx, cy, i * step, r);

  let path = "";
  for (let i = 0; i < n; i++) {
    const r1 = getRadius(i);
    const r2 = getRadius(i + 1);
    const p1 = getPoint(i, r1);
    const p2 = getPoint(i + 1, r2);

    // Control point at midpoint angle, slightly smoothed but never expanded past neighbors.
    const midAngle = (i + 0.5) * step;
    const avgR = (r1 + r2) / 2;
    const maxR = Math.max(r1, r2);
    const controlR = Math.min(avgR * 1.02, maxR);
    const cp = polarToXY(cx, cy, midAngle, controlR);

    if (i === 0) path += `M ${p1.x},${p1.y} `;
    path += `Q ${cp.x},${cp.y} ${p2.x},${p2.y} `;
  }

  return `${path}Z`;
}

/**
 * @deprecated Use monotoneRadialPath for containment-preserving rendering.
 * Catmull-Rom splines can overshoot and cause visual layer crossings.
 */
export function catmullRom(points: Point[], tension = 0.65): string {
  const n = points.length;
  if (n < 2) return "";

  const getPoint = (index: number): Point => points[((index % n) + n) % n];

  let path = "";
  for (let i = 0; i < n; i += 1) {
    const p0 = getPoint(i - 1);
    const p1 = getPoint(i);
    const p2 = getPoint(i + 1);
    const p3 = getPoint(i + 2);

    const cp1x = p1.x + (p2.x - p0.x) / (6 * tension);
    const cp1y = p1.y + (p2.y - p0.y) / (6 * tension);
    const cp2x = p2.x - (p3.x - p1.x) / (6 * tension);
    const cp2y = p2.y - (p3.y - p1.y) / (6 * tension);

    if (i === 0) path += `M ${p1.x},${p1.y} `;
    path += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y} `;
  }

  return `${path}Z`;
}
