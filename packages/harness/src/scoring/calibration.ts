import { CATEGORY_DEFINITIONS, type CategoryKey, type CategoryScore, type TrialResult } from "@shoreline/shared";
import { avg, clamp } from "../utils/math";

export function computeCategoryScore(
  category: CategoryKey,
  trials: TrialResult[],
  transitionZone: number
): CategoryScore {
  const phase1Confidences = trials
    .map((trial) => trial.phase1.confidence)
    .filter((value): value is number => value !== null);
  const claimed = avg(phase1Confidences);
  const categoryDef = CATEGORY_DEFINITIONS.find((item) => item.key === category);

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

  // False confidence: wrong answers where model expressed high confidence (>=60%) in Phase 3.
  // This is the dangerous case - model doesn't know what it doesn't know.
  const falseConfidence01 = avg(
    trials.map((trial) => {
      const c = trial.phase3.confidence;
      if (c === null) return 0;
      // Wrong answer but confident about it
      if (!trial.phase2.isCorrect && c >= 60) return 1;
      return 0;
    })
  );

  // True uncertainty: wrong answers where model correctly expressed low confidence (<40%).
  // This is good metacognition - model knows when it might have failed.
  const trueUncertainty01 = avg(
    trials.map((trial) => {
      const c = trial.phase3.confidence;
      if (c === null) return 0;
      // Wrong answer and appropriately uncertain
      if (!trial.phase2.isCorrect && c < 40) return 1;
      return 0;
    })
  );

  const solid = solid01 * 100;
  const concrete = concrete01 * 100;
  const normalizeDifficulty = (difficulty: number): number => {
    if (!categoryDef || categoryDef.maxDifficulty <= categoryDef.minDifficulty) return 0;
    return clamp((difficulty - categoryDef.minDifficulty) / (categoryDef.maxDifficulty - categoryDef.minDifficulty), 0, 1);
  };

  const phase1Depth = trials.map((trial) => {
    const confidence01 = clamp((trial.phase1.confidence ?? 0) / 100, 0, 1);
    return {
      confidence01,
      normalizedDifficulty: normalizeDifficulty(trial.difficulty)
    };
  });

  const claimedLoose01 = phase1Depth.reduce(
    (currentMax, point) => (point.confidence01 >= 0.5 ? Math.max(currentMax, point.normalizedDifficulty) : currentMax),
    0
  );
  const claimedThick01 = phase1Depth.reduce(
    (currentMax, point) => (point.confidence01 >= 0.8 ? Math.max(currentMax, point.normalizedDifficulty) : currentMax),
    0
  );
  const claimedDepth01 = Math.max(
    claimedLoose01,
    avg(phase1Depth.map((point) => point.confidence01 * point.normalizedDifficulty))
  );
  const sand = Math.max(claimedDepth01 * 100, solid, concrete);

  const predicted01 = claimed / 100;
  const calibrationError = Math.abs(predicted01 - solid01) * 100;

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
    claimedDepth: claimedDepth01 * 100,
    claimedLoose: claimedLoose01 * 100,
    claimedThick: claimedThick01 * 100,
    sand,
    solid,
    concrete,
    discernment: discernment01 * 100,
    falseConfidence: falseConfidence01 * 100,
    trueUncertainty: trueUncertainty01 * 100,
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
  // Phase 1 miscalibration: prediction vs actual
  const overconfidence = avg(scores.map((score) => Math.max(0, (score.claimed ?? score.sand) - score.solid)));
  const underconfidence = avg(scores.map((score) => Math.max(0, score.solid - (score.claimed ?? score.sand))));
  // Phase 3 miscalibration: self-assessment accuracy
  const blindSpots = avg(scores.map((score) => Math.max(0, score.solid - score.concrete)));
  // Phase 3 false confidence: wrong answers where model was confident
  const avgFalseConfidence = avg(scores.map((score) => score.falseConfidence ?? 0));
  // Phase 3 true uncertainty: wrong answers where model correctly doubted itself
  const avgTrueUncertainty = avg(scores.map((score) => score.trueUncertainty ?? 0));

  return {
    avgClaimed,
    avgSand,
    avgSolid,
    avgConcrete,
    avgDiscernment,
    avgFalseConfidence,
    avgTrueUncertainty,
    avgCalibrationError,
    calibrationIndex: Math.max(0, 100 - avgCalibrationError),
    avgCapability,
    overconfidence,
    underconfidence,
    blindSpots,
    falseConfidence: avgFalseConfidence,
    totalGap: overconfidence + underconfidence + blindSpots
  };
}
