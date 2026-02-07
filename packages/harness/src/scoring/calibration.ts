import type { CategoryKey, CategoryScore, TrialResult } from "@shoreline/shared";
import { avg } from "../utils/math";

export function computeCategoryScore(
  category: CategoryKey,
  trials: TrialResult[],
  transitionZone: number
): CategoryScore {
  const sand = avg(trials.map((trial) => trial.phase1.confidence).filter((value): value is number => value !== null));

  const solid01 = avg(
    trials.map((trial) => {
      if (typeof trial.phase2.partialScore === "number") return trial.phase2.partialScore;
      return trial.phase2.isCorrect ? 1 : 0;
    })
  );

  const concrete01 = avg(
    trials.map((trial) => {
      const c = trial.phase3.confidence;
      if (c === null) return 0;
      if (trial.phase2.isCorrect && c >= 60) return 1;
      if (!trial.phase2.isCorrect && c < 40) return 1;
      return 0;
    })
  );

  const difficulties = trials.map((trial) => trial.difficulty);
  const minDifficulty = Math.min(...difficulties);
  const maxDifficulty = Math.max(...difficulties);

  return {
    category,
    sand,
    solid: solid01 * 100,
    concrete: concrete01 * 100,
    trialCount: trials.length,
    difficultyRange: [minDifficulty, maxDifficulty],
    transitionZone
  };
}

export function computeAggregateScores(scores: CategoryScore[]) {
  const avgSand = avg(scores.map((score) => score.sand));
  const avgSolid = avg(scores.map((score) => score.solid));
  const avgConcrete = avg(scores.map((score) => score.concrete));
  const overconfidence = avg(scores.map((score) => score.sand - score.solid));
  const blindSpots = avg(scores.map((score) => score.solid - score.concrete));

  return {
    avgSand,
    avgSolid,
    avgConcrete,
    overconfidence,
    blindSpots,
    totalGap: overconfidence + blindSpots
  };
}
