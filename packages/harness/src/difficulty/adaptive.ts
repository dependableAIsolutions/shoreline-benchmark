import { clamp } from "../utils/math";

export interface TransitionSearchConfig {
  minDifficulty: number;
  maxDifficulty: number;
  probeTrials: number;
}

export interface TransitionSearchResult {
  boundary: number;
  probeHistory: Array<{ difficulty: number; accuracy: number }>;
  sampleDifficulties: number[];
}

export async function findTransitionZone(
  config: TransitionSearchConfig,
  measureAccuracy: (difficulty: number, probeTrials: number) => Promise<number>
): Promise<TransitionSearchResult> {
  let low = config.minDifficulty;
  let high = config.maxDifficulty;
  const history: Array<{ difficulty: number; accuracy: number }> = [];

  while (high - low > 2) {
    const mid = Math.round((low + high) / 2);
    const accuracy = await measureAccuracy(mid, config.probeTrials);
    history.push({ difficulty: mid, accuracy });

    if (accuracy > 0.8) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const boundary = (low + high) / 2;
  const raw = [boundary - 2, boundary - 1, boundary, boundary + 1, boundary + 2]
    .map((value) => Math.round(clamp(value, config.minDifficulty, config.maxDifficulty)));

  const sampleDifficulties = [...new Set(raw)].sort((a, b) => a - b);

  return {
    boundary,
    probeHistory: history,
    sampleDifficulties
  };
}
