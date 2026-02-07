export interface Point {
  x: number;
  y: number;
}

export function polarToXY(cx: number, cy: number, angleDeg: number, radius: number): Point {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad)
  };
}

export function getSmoothedPoints(cx: number, cy: number, values: number[], maxRadius: number): Point[] {
  const n = values.length;
  const step = 360 / n;
  return values.map((value, index) => {
    const r = (Math.max(value, 2) / 100) * maxRadius;
    return polarToXY(cx, cy, index * step, r);
  });
}

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
