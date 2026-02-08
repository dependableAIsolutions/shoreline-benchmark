import { clamp } from "../utils/math";

export interface TransitionSearchConfig {
  minDifficulty: number;
  maxDifficulty: number;
  probeTrials: number;
  rampMode?: "balanced" | "fast";
}

export interface TransitionSearchResult {
  boundary: number;
  probeHistory: Array<{ difficulty: number; accuracy: number }>;
  sampleDifficulties: number[];
  ceilingReached: boolean; // True if model aced max difficulty
}

/**
 * Generate Fibonacci-like sequence for aggressive difficulty scaling.
 * Sequence: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...
 */
function fibonacciScale(steps: number): number[] {
  const seq = [1, 2];
  while (seq.length < steps) {
    seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
  }
  return seq;
}

/**
 * Find transition zone using exponential probing then Fibonacci refinement.
 *
 * Phase 1: Exponential probing - quickly find where model starts failing
 *   - Start at minDifficulty, double until failure or max reached
 *
 * Phase 2: Fibonacci binary search - narrow down the exact boundary
 *   - Use Fibonacci steps for faster convergence
 *
 * Phase 3: Sample around boundary using Fibonacci spacing
 *   - Sample at boundary ±fib(n) for meaningful calibration range
 */
export async function findTransitionZone(
  config: TransitionSearchConfig,
  measureAccuracy: (difficulty: number, probeTrials: number) => Promise<number>
): Promise<TransitionSearchResult> {
  const rampMode = config.rampMode ?? "balanced";
  const history: Array<{ difficulty: number; accuracy: number }> = [];
  const range = config.maxDifficulty - config.minDifficulty;

  // Phase 1: Exponential probing to quickly find failure zone
  // Start with small steps, double each time: 1, 2, 4, 8, 16...
  let difficulty = config.minDifficulty;
  let step = Math.max(1, Math.floor(range / (rampMode === "fast" ? 16 : 32)));
  let lastPassingDifficulty = config.minDifficulty;
  let firstFailingDifficulty = config.maxDifficulty;
  let foundFailure = false;

  // Exponential probing
  while (difficulty <= config.maxDifficulty && !foundFailure) {
    const accuracy = await measureAccuracy(difficulty, config.probeTrials);
    history.push({ difficulty, accuracy });

    if (accuracy > 0.7) {
      lastPassingDifficulty = difficulty;
      // Exponential increase: double the step each time
      step = Math.min(step * 2, Math.floor(range / (rampMode === "fast" ? 2 : 4)));
      difficulty = Math.min(difficulty + step, config.maxDifficulty);
    } else {
      firstFailingDifficulty = difficulty;
      foundFailure = true;
    }
  }

  // Check if we hit the ceiling (model aced max difficulty)
  const ceilingReached = !foundFailure && lastPassingDifficulty >= config.maxDifficulty - 1;

  // Phase 2: Fibonacci binary search to narrow down
  if (foundFailure && firstFailingDifficulty - lastPassingDifficulty > 2) {
    if (rampMode === "fast") {
      const mid = Math.round((lastPassingDifficulty + firstFailingDifficulty) / 2);
      const accuracy = await measureAccuracy(mid, config.probeTrials);
      history.push({ difficulty: mid, accuracy });
      if (accuracy > 0.7) {
        lastPassingDifficulty = mid;
      } else {
        firstFailingDifficulty = mid;
      }
    } else {
      let low = lastPassingDifficulty;
      let high = firstFailingDifficulty;
      const fibSteps = fibonacciScale(10);
      let fibIdx = fibSteps.length - 1;

      // Find appropriate Fibonacci step size
      while (fibIdx > 0 && fibSteps[fibIdx] > (high - low) / 2) {
        fibIdx--;
      }

      while (high - low > 2 && fibIdx >= 0) {
        const fibStep = fibSteps[fibIdx];
        const mid = Math.round(low + fibStep);

        if (mid >= high) {
          fibIdx--;
          continue;
        }

        const accuracy = await measureAccuracy(mid, config.probeTrials);
        history.push({ difficulty: mid, accuracy });

        if (accuracy > 0.7) {
          low = mid;
        } else {
          high = mid;
        }

        fibIdx = Math.max(0, fibIdx - 1);
      }

      lastPassingDifficulty = low;
      firstFailingDifficulty = high;
    }
  }

  const boundary = (lastPassingDifficulty + firstFailingDifficulty) / 2;

  // Phase 3: Generate Fibonacci-spaced sample difficulties around boundary
  // This gives us good coverage of the transition zone
  const fibSamples = rampMode === "fast" ? [2, 5] : [1, 2, 3, 5, 8];
  const rawSamples: number[] = [Math.round(boundary)];

  for (const fib of fibSamples) {
    rawSamples.push(Math.round(boundary - fib));
    rawSamples.push(Math.round(boundary + fib));
  }

  // Also add some samples at regular intervals in the passing zone
  // to measure calibration where model is confident
  const passingZoneRatios = rampMode === "fast" ? [0.5] : [0.25, 0.5, 0.75];
  const passingZoneSamples = passingZoneRatios.map((ratio) =>
    Math.round(config.minDifficulty + (boundary - config.minDifficulty) * ratio)
  );
  rawSamples.push(...passingZoneSamples);

  const sampleDifficulties = [...new Set(
    rawSamples
      .map((v) => Math.round(clamp(v, config.minDifficulty, config.maxDifficulty)))
      .filter((v) => v >= config.minDifficulty)
  )].sort((a, b) => a - b);

  return {
    boundary,
    probeHistory: history,
    sampleDifficulties,
    ceilingReached
  };
}
