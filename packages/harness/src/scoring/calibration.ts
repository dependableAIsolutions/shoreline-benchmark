import {
  CATEGORY_DEFINITIONS,
  SAND_DIFFICULTY_EXPONENT,
  SAND_DIFFICULTY_HEADROOM_MULTIPLIER,
  type CategoryKey,
  type CategoryScore,
  type TrialResult
} from "@shoreline/shared";
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

  const solidRaw01 = avg(
    trials.map((trial) => {
      if (typeof trial.phase2.partialScore === "number") return trial.phase2.partialScore;
      return trial.phase2.isCorrect ? 1 : 0;
    })
  );

  // Failure-awareness rate (wrong answers where the model correctly self-doubts).
  const failureAware01 = avg(
    trials.map((trial) => {
      const c = trial.phase3.confidence;
      if (c === null) return 0;
      return !trial.phase2.isCorrect && c < 40 ? 1 : 0;
    })
  );

  // Discernment stays as the unweighted metacognitive correctness rate.
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

  const normalizeDifficulty = (difficulty: number): number => {
    if (!categoryDef || categoryDef.maxDifficulty <= categoryDef.minDifficulty) return 0;

    // Model-agnostic theoretical ceiling:
    // tested max maps below 1.0 so sand=100 is outside normal benchmark range.
    const span = categoryDef.maxDifficulty - categoryDef.minDifficulty + 1;
    const theoreticalSpan = span * SAND_DIFFICULTY_HEADROOM_MULTIPLIER;
    const linear = clamp((difficulty - categoryDef.minDifficulty + 1) / theoreticalSpan, 0, 1);

    // Exponential difficulty ramp: higher levels consume disproportionate territory.
    return clamp(linear ** SAND_DIFFICULTY_EXPONENT, 0, 1);
  };

  const phase1Depth = trials.map((trial) => {
    const confidence01 = clamp((trial.phase1.confidence ?? 0) / 100, 0, 1);
    return {
      confidence01,
      normalizedDifficulty: normalizeDifficulty(trial.difficulty)
    };
  });

  const solidDepth01 = Math.max(
    0,
    ...trials.map((trial) => {
      const normalizedDifficulty = normalizeDifficulty(trial.difficulty);
      const performance01 =
        typeof trial.phase2.partialScore === "number"
          ? clamp(trial.phase2.partialScore, 0, 1)
          : trial.phase2.isCorrect
            ? 1
            : 0;
      return performance01 * normalizedDifficulty;
    })
  );
  const solidFrontierDifficulty =
    solidDepth01 > 0
      ? trials.reduce(
          (best, trial) => {
            const normalizedDifficulty = normalizeDifficulty(trial.difficulty);
            const performance01 =
              typeof trial.phase2.partialScore === "number"
                ? clamp(trial.phase2.partialScore, 0, 1)
                : trial.phase2.isCorrect
                  ? 1
                  : 0;
            const depth = performance01 * normalizedDifficulty;
            return depth > best.depth ? { depth, difficulty: trial.difficulty } : best;
          },
          { depth: 0, difficulty: trials[0]?.difficulty ?? 0 }
        ).difficulty
      : undefined;

  const concreteFailureDepth01 = Math.max(
    0,
    ...trials.map((trial) => {
      const c = trial.phase3.confidence;
      const normalizedDifficulty = normalizeDifficulty(trial.difficulty);
      if (c === null) return 0;
      const correctlyAdmittedFailure = !trial.phase2.isCorrect && c < 40;
      return (correctlyAdmittedFailure ? 1 : 0) * normalizedDifficulty;
    })
  );
  const concreteFrontierDifficulty =
    concreteFailureDepth01 > 0
      ? trials.reduce(
          (best, trial) => {
            const c = trial.phase3.confidence;
            const normalizedDifficulty = normalizeDifficulty(trial.difficulty);
            if (c === null) return best;
            const admitted = !trial.phase2.isCorrect && c < 40 ? 1 : 0;
            const depth = admitted * normalizedDifficulty;
            return depth > best.depth ? { depth, difficulty: trial.difficulty } : best;
          },
          { depth: 0, difficulty: trials[0]?.difficulty ?? 0 }
        ).difficulty
      : undefined;

  const claimedLoose01 = phase1Depth.reduce(
    (currentMax, point) => (point.confidence01 >= 0.5 ? Math.max(currentMax, point.normalizedDifficulty) : currentMax),
    0
  );
  const claimedThick01 = phase1Depth.reduce(
    (currentMax, point) => (point.confidence01 >= 0.8 ? Math.max(currentMax, point.normalizedDifficulty) : currentMax),
    0
  );
  // claimedDepth = max(confidence × normalizedDifficulty) across all trials
  // This product formula ensures:
  //   - claimedDepth=100 ONLY when confidence=100% at normalizedDifficulty=1.0 (max difficulty)
  //   - High confidence at low difficulty yields low claimedDepth (e.g., 100% × 0.5 = 50)
  //   - Low confidence at high difficulty yields low claimedDepth (e.g., 50% × 1.0 = 50)
  //   - This captures both "how confident" and "at what difficulty level"
  const claimedDepth01 = Math.max(
    0,
    ...phase1Depth.map((point) => point.confidence01 * point.normalizedDifficulty)
  );
  const sandFrontierDifficulty =
    claimedDepth01 > 0
      ? trials.reduce(
          (best, trial) => {
            const confidence01 = clamp((trial.phase1.confidence ?? 0) / 100, 0, 1);
            const depth = confidence01 * normalizeDifficulty(trial.difficulty);
            return depth > best.depth ? { depth, difficulty: trial.difficulty } : best;
          },
          { depth: 0, difficulty: trials[0]?.difficulty ?? 0 }
        ).difficulty
      : undefined;

  // Sand represents Phase 1 claimed territory intensity (0-100).
  // Sand=100 means: model expressed 100% confidence at the theoretical category ceiling.
  const sand = claimedDepth01 * 100;
  const solid = solidDepth01 * 100;
  // Concrete should be a subset of verified depth, never larger than solid.
  const concrete = Math.min(concreteFailureDepth01, solidDepth01) * 100;

  const predicted01 = claimed / 100;
  const calibrationError = Math.abs(predicted01 - solidRaw01) * 100;

  const capability =
    categoryDef && categoryDef.maxDifficulty > categoryDef.minDifficulty
      ? ((transitionZone - categoryDef.minDifficulty) / (categoryDef.maxDifficulty - categoryDef.minDifficulty)) * 100
      : 0;

  const difficulties = trials.map((trial) => trial.difficulty);
  const trialsByDifficulty = difficulties.reduce<Record<string, number>>((acc, difficulty) => {
    const key = String(difficulty);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const sampleDifficulties = Object.keys(trialsByDifficulty)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const avgTrialsPerDifficulty = sampleDifficulties.length > 0 ? trials.length / sampleDifficulties.length : 0;
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
    failureAwareness: failureAware01 * 100,
    calibrationError,
    capability: Math.max(0, Math.min(100, capability)),
    sandFrontierDifficulty,
    solidFrontierDifficulty,
    concreteFrontierDifficulty,
    sampleDifficulties,
    trialsByDifficulty,
    avgTrialsPerDifficulty,
    trialCount: trials.length,
    difficultyRange: [minDifficulty, maxDifficulty],
    transitionZone
  };
}

export function computeAggregateScores(scores: CategoryScore[]) {
  const avgClaimed = avg(scores.map((score) => score.claimed ?? 0));
  const avgSand = avg(scores.map((score) => score.sand));
  const avgSolid = avg(scores.map((score) => score.solid));
  const avgConcrete = avg(scores.map((score) => score.concrete));
  const avgDiscernment = avg(scores.map((score) => score.discernment ?? 0));
  const avgCalibrationError = avg(scores.map((score) => score.calibrationError ?? 0));
  const avgCapability = avg(scores.map((score) => score.capability ?? 0));
  // Depth misalignment: claimed depth (sand) vs verified depth (solid)
  const overconfidence = avg(scores.map((score) => Math.max(0, score.sand - score.solid)));
  const underconfidence = avg(scores.map((score) => Math.max(0, score.solid - score.sand)));
  // Phase 3 missed failures: wrong answers where model remained confident.
  const blindSpots = avg(scores.map((score) => score.falseConfidence ?? Math.max(0, score.solid - score.concrete)));
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
