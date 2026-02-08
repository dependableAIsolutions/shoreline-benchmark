import { describe, it, expect } from "vitest";
import { computeCategoryScore } from "./calibration";
import type { TrialResult } from "@shoreline/shared";

function makeTrial(difficulty: number, phase1Confidence: number, phase2Correct: boolean, phase3Confidence: number): TrialResult {
  return {
    category: "mult",
    difficulty,
    phase1: { prompt: "", response: "", confidence: phase1Confidence, tokensUsed: 0, latencyMs: 0 },
    phase2: { prompt: "", response: "", extractedAnswer: "", correctAnswer: "", isCorrect: phase2Correct, tokensUsed: 0, latencyMs: 0 },
    phase3: { prompt: "", response: "", confidence: phase3Confidence, tokensUsed: 0, latencyMs: 0 },
    timestamp: new Date().toISOString()
  };
}

describe("computeCategoryScore - Sand/ClaimedDepth semantics", () => {
  // mult category: minDifficulty=2, maxDifficulty=50
  const multMin = 2;
  const multMax = 50;
  const multSpan = multMax - multMin + 1;
  const multTheoreticalCeiling = multMin + multSpan * 2 - 1;

  it("does not reach 100 at tested max difficulty", () => {
    const trials = [makeTrial(multMax, 100, true, 100)];
    const score = computeCategoryScore("mult", trials, multMax);

    expect(score.claimedDepth).toBeGreaterThan(0);
    expect(score.claimedDepth).toBeLessThan(100);
    expect(score.sand).toBeLessThan(100);
  });

  it("reaches 100 only at the theoretical ceiling", () => {
    const trials = [makeTrial(multTheoreticalCeiling, 100, true, 100)];
    const score = computeCategoryScore("mult", trials, multMax);

    expect(score.claimedDepth).toBeCloseTo(100, 6);
    expect(score.sand).toBeCloseTo(100, 6);
  });

  it("difficulty contribution increases from min to mid to max", () => {
    const minScore = computeCategoryScore("mult", [makeTrial(multMin, 100, true, 100)], multMax);
    const midScore = computeCategoryScore("mult", [makeTrial(26, 100, true, 100)], multMax);
    const maxScore = computeCategoryScore("mult", [makeTrial(multMax, 100, true, 100)], multMax);

    expect(minScore.sand).toBeLessThan(midScore.sand);
    expect(midScore.sand).toBeLessThan(maxScore.sand);
  });

  it("claimedDepth reflects max(confidence × normalizedDifficulty) across mixed trials", () => {
    const trials = [
      makeTrial(multMin, 100, true, 100), // low diff, high confidence
      makeTrial(26, 50, true, 100),       // mid diff, medium confidence
      makeTrial(multMax, 0, false, 0)     // max diff, zero confidence
    ];
    const score = computeCategoryScore("mult", trials, multMax);
    const midOnly = computeCategoryScore("mult", [makeTrial(26, 50, true, 100)], multMax);

    expect(score.claimedDepth).toBeCloseTo(midOnly.claimedDepth ?? 0, 6);
    expect(score.sand).toBeCloseTo(midOnly.sand, 6);
  });

  it("sand is independent of Phase 2 correctness", () => {
    const trials = [
      makeTrial(multMin, 70, false, 20),
      makeTrial(26, 70, false, 20),
      makeTrial(multMax, 70, false, 20)
    ];
    const score = computeCategoryScore("mult", trials, multMax);
    expect(score.solid).toBe(0);
    expect(score.sand).toBeGreaterThan(0);
  });

  it("claimedLoose and claimedThick stay below 100 within tested range", () => {
    const score = computeCategoryScore(
      "mult",
      [makeTrial(multMax, 90, true, 100), makeTrial(multMax, 60, true, 100)],
      multMax
    );
    expect(score.claimedLoose).toBeLessThan(100);
    expect(score.claimedThick).toBeLessThan(100);
  });
});

describe("computeCategoryScore - Phase 3 metacognition metrics", () => {
  it("concrete counts wrong answers with low post-answer confidence", () => {
    const trials = [
      makeTrial(26, 80, true, 80),   // correct + confident -> no concrete credit
      makeTrial(26, 80, false, 20),  // wrong + uncertain -> concrete credit
      makeTrial(26, 80, false, 80)   // wrong + confident -> no concrete credit
    ];
    const score = computeCategoryScore("mult", trials, 26);

    // 1 of 3 trials contributes
    expect(score.concrete).toBeCloseTo(33.33, 1);
    expect(score.trueUncertainty).toBeCloseTo(score.concrete, 6);
  });

  it("concrete is zero when failures are confident", () => {
    const trials = [
      makeTrial(26, 80, false, 80),
      makeTrial(26, 80, false, 70),
      makeTrial(26, 80, true, 80)
    ];
    const score = computeCategoryScore("mult", trials, 26);

    expect(score.concrete).toBe(0);
    expect(score.falseConfidence).toBeCloseTo(66.67, 1);
  });

  it("discernment still rewards both true positives and true negatives", () => {
    const trials = [
      makeTrial(26, 80, true, 80),   // TP
      makeTrial(26, 80, false, 20),  // TN
      makeTrial(26, 80, false, 80)   // FP
    ];
    const score = computeCategoryScore("mult", trials, 26);

    expect(score.discernment).toBeCloseTo(66.67, 1);
    expect(score.falseConfidence).toBeCloseTo(33.33, 1);
    expect(score.trueUncertainty).toBeCloseTo(33.33, 1);
  });
});
