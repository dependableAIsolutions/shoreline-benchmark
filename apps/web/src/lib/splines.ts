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
 * Smooth radial spline path using cubic Bezier curves with Catmull-Rom-derived control points.
 * Creates smooth, flowing curves while preserving the overall shape defined by the data points.
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

  // Generate smooth control points using Catmull-Rom tangents
  const tension = 0.35; // Lower = smoother curves, higher = tighter to data points
  const controlPoints: Array<{ cp1: Point; cp2: Point }> = [];

  for (let i = 0; i < n; i++) {
    const r0 = getRadius(i - 1);
    const r1 = getRadius(i);
    const r2 = getRadius(i + 1);
    const r3 = getRadius(i + 2);

    const p0 = getPoint(i - 1, r0);
    const p1 = getPoint(i, r1);
    const p2 = getPoint(i + 1, r2);
    const p3 = getPoint(i + 2, r3);

    // Calculate control points using Catmull-Rom tangents
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    controlPoints.push({
      cp1: { x: quantize(cp1x), y: quantize(cp1y) },
      cp2: { x: quantize(cp2x), y: quantize(cp2y) }
    });
  }

  // Build path with cubic Bezier curves
  let path = "";
  for (let i = 0; i < n; i++) {
    const p1 = getPoint(i, getRadius(i));
    const p2 = getPoint(i + 1, getRadius(i + 1));
    const { cp1, cp2 } = controlPoints[i];

    if (i === 0) path += `M ${p1.x},${p1.y} `;
    path += `C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${p2.x},${p2.y} `;
  }

  return `${path}Z`;
}
