const EXPLICIT_PATTERNS: RegExp[] = [
  /confidence[:\s]+(\d{1,3})%?/i,
  /(\d{1,3})%\s*confident/i,
  /(\d{1,3})\s*percent\s*confident/i,
  /estimate[:\s]+(\d{1,3})%?/i,
  /I(?:'d| would)?\s*(?:say|estimate|put it at)\s*(?:around\s*)?(\d{1,3})%?/i
];

export function extractConfidence(text: string): number | null {
  for (const pattern of EXPLICIT_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = Number.parseInt(match[1], 10);
    if (value >= 0 && value <= 100) return value;
  }

  const percentMatches = [...text.matchAll(/(\d{1,3})%/g)];
  if (percentMatches.length === 1) {
    const value = Number.parseInt(percentMatches[0][1], 10);
    if (value >= 0 && value <= 100) return value;
  }

  const lower = text.toLowerCase();
  if (/very confident|highly confident|almost certain/.test(lower)) return 90;
  if (/fairly confident|reasonably confident|quite confident/.test(lower)) return 70;
  if (/somewhat confident|moderately confident/.test(lower)) return 50;
  if (/not very confident|uncertain|unsure/.test(lower)) return 30;
  if (/very uncertain|no confidence|likely wrong/.test(lower)) return 10;

  return null;
}
