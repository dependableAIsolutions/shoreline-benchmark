import { CATEGORY_DEFINITIONS, type CategoryKey, type CategoryScore, type TrialResult } from "@shoreline/shared";
import { avg } from "../utils/math";

export function computeCategoryScore(
  category: CategoryKey,
  trials: TrialResult[],
  transitionZone: number
): CategoryScore {
  const phase1Confidences = trials
    .map((trial) => trial.phase1.confidence)
    .filter((value): value is number => value !== null);
  const claimed = avg(phase1Confidences);

  const solid01 = avg(
    trials.map((trial) => {
      if (typeof trial.phase2.partialScore === "number") return trial.phase2.partialScore;
      return trial.phase2.isCorrect ? 1 : 0;
    })
  );

  // Concrete is intentionally a strict subset of achieved capability:
  // a trial contributes only when the model both succeeds and recognizes success.
  const concrete01 = avg(
    trials.map((trial) => {
      const c = trial.phase3.confidence;
      if (c === null) return 0;
      const phase2Score =
        typeof trial.phase2.partialScore === "number" ? trial.phase2.partialScore : trial.phase2.isCorrect ? 1 : 0;
      return c >= 60 ? phase2Score : 0;
    })
  );

  // Discernment captures both true positives and true negatives (legacy "concrete" behavior).
  const discernment01 = avg(
    trials.map((trial) => {
      const c = trial.phase3.confidence;
      if (c === null) return 0;
      if (trial.phase2.isCorrect && c >= 60) return 1;
      if (!trial.phase2.isCorrect && c < 40) return 1;
      return 0;
    })
  );

  const solid = solid01 * 100;
  const concrete = concrete01 * 100;
  const sand = Math.max(claimed, solid, concrete);

  const predicted01 = claimed / 100;
  const calibrationError = Math.abs(predicted01 - solid01) * 100;

  const categoryDef = CATEGORY_DEFINITIONS.find((item) => item.key === category);
  const capability =
    categoryDef && categoryDef.maxDifficulty > categoryDef.minDifficulty
      ? ((transitionZone - categoryDef.minDifficulty) / (categoryDef.maxDifficulty - categoryDef.minDifficulty)) * 100
      : 0;

  const difficulties = trials.map((trial) => trial.difficulty);
  const minDifficulty = Math.min(...difficulties);
  const maxDifficulty = Math.max(...difficulties);

  return {
    category,
    claimed,
    sand,
    solid,
    concrete,
    discernment: discernment01 * 100,
    calibrationError,
    capability: Math.max(0, Math.min(100, capability)),
    trialCount: trials.length,
    difficultyRange: [minDifficulty, maxDifficulty],
    transitionZone
  };
}

export function computeAggregateScores(scores: CategoryScore[]) {
  const avgClaimed = avg(scores.map((score) => score.claimed ?? score.sand));
  const avgSand = avg(scores.map((score) => score.sand));
  const avgSolid = avg(scores.map((score) => score.solid));
  const avgConcrete = avg(scores.map((score) => score.concrete));
  const avgDiscernment = avg(scores.map((score) => score.discernment ?? 0));
  const avgCalibrationError = avg(scores.map((score) => score.calibrationError ?? 0));
  const avgCapability = avg(scores.map((score) => score.capability ?? 0));
  const overconfidence = avg(scores.map((score) => Math.max(0, (score.claimed ?? score.sand) - score.solid)));
  const underconfidence = avg(scores.map((score) => Math.max(0, score.solid - (score.claimed ?? score.sand))));
  const blindSpots = avg(scores.map((score) => Math.max(0, score.solid - score.concrete)));

  return {
    avgClaimed,
    avgSand,
    avgSolid,
    avgConcrete,
    avgDiscernment,
    avgCalibrationError,
    calibrationIndex: Math.max(0, 100 - avgCalibrationError),
    avgCapability,
    overconfidence,
    underconfidence,
    blindSpots,
    totalGap: overconfidence + underconfidence + blindSpots
  };
}
