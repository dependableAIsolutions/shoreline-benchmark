export function formatMetric(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}

export function severityColor(value: number): string {
  if (value <= 5) return "#4ADE80";
  if (value <= 12) return "#FBBF24";
  return "#F87171";
}
