const EXPLICIT_PATTERNS: RegExp[] = [
  /confidence[:\s]+(\d{1,3})%?/i,
  /confidence[^0-9]{0,24}(\d{1,3})\s*%/i,
  /(\d{1,3})%\s*confident/i,
  /(\d{1,3})\s*percent\s*confident/i,
  /estimate[:\s]+(\d{1,3})%?/i,
  /I(?:'d| would)?\s*(?:say|estimate|put it at)\s*(?:around\s*)?(\d{1,3})%?/i
];

function withinRange(value: number): boolean {
  return value >= 0 && value <= 100;
}

function pickBestPercentCandidate(text: string): number | null {
  const matches = [...text.matchAll(/(\d{1,3})\s*%/g)];
  if (matches.length === 0) return null;

  const scored = matches
    .map((match) => {
      const raw = Number.parseInt(match[1], 10);
      if (!withinRange(raw)) return null;

      const idx = match.index ?? 0;
      const before = text.slice(Math.max(0, idx - 48), idx).toLowerCase();
      const after = text.slice(idx, Math.min(text.length, idx + 48)).toLowerCase();
      let score = 0;

      if (/confidence|confident/.test(before) || /confidence|confident/.test(after)) score += 4;
      if (/estimate|estimated|estimating|about|around|roughly|approximately|chance/.test(before)) score += 2;
      if (/rather than|instead of|vs|versus|not|no\b/.test(before)) score -= 2;

      return { raw, idx, score };
    })
    .filter((item): item is { raw: number; idx: number; score: number } => item !== null)
    .sort((a, b) => (b.score === a.score ? a.idx - b.idx : b.score - a.score));

  if (scored.length === 0) return null;
  if (scored[0].score > 0) return scored[0].raw;
  if (scored.length === 1) return scored[0].raw;
  return scored[0].raw;
}

export function extractConfidence(text: string): number | null {
  for (const pattern of EXPLICIT_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = Number.parseInt(match[1], 10);
    if (withinRange(value)) return value;
  }

  const picked = pickBestPercentCandidate(text);
  if (picked !== null) return picked;

  const lower = text.toLowerCase();
  if (/very confident|highly confident|almost certain/.test(lower)) return 90;
  if (/fairly confident|reasonably confident|quite confident/.test(lower)) return 70;
  if (/somewhat confident|moderately confident/.test(lower)) return 50;
  if (/not very confident|uncertain|unsure/.test(lower)) return 30;
  if (/very uncertain|no confidence|likely wrong/.test(lower)) return 10;

  return null;
}
