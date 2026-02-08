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

  it("claimedDepth=100 only when confidence=100% at maxDifficulty", () => {
    // Single trial: 100% confidence at max difficulty (50)
    const trials = [makeTrial(50, 100, true, 100)];
    const score = computeCategoryScore("mult", trials, 50);

    expect(score.claimedDepth).toBe(100);
    expect(score.sand).toBe(100);
  });

  it("claimedDepth < 100 when confidence=75% at maxDifficulty", () => {
    // 75% confidence at max difficulty should give claimedDepth=75
    const trials = [makeTrial(50, 75, false, 50)];
    const score = computeCategoryScore("mult", trials, 50);

    expect(score.claimedDepth).toBe(75);
    expect(score.sand).toBe(75);
  });

  it("claimedDepth=0 when high confidence only at minDifficulty", () => {
    // 100% confidence at min difficulty (normalized=0) should give claimedDepth=0
    const trials = [makeTrial(2, 100, true, 100)];
    const score = computeCategoryScore("mult", trials, 2);

    expect(score.claimedDepth).toBe(0);
    expect(score.sand).toBe(0);
  });

  it("claimedDepth=50 at mid-difficulty with 100% confidence", () => {
    // At difficulty=26 (normalized=0.5), 100% confidence gives claimedDepth=50
    const trials = [makeTrial(26, 100, true, 100)];
    const score = computeCategoryScore("mult", trials, 26);

    expect(score.claimedDepth).toBe(50);
    expect(score.sand).toBe(50);
  });

  it("claimedDepth reflects max product across mixed trials", () => {
    // Cliff profile: high confidence at low difficulty, low confidence at high difficulty
    const trials = [
      makeTrial(2, 100, true, 100),   // norm=0, contribution=0
      makeTrial(26, 50, true, 100),   // norm=0.5, contribution=25
      makeTrial(50, 0, false, 0)      // norm=1.0, contribution=0
    ];
    const score = computeCategoryScore("mult", trials, 26);

    // Max contribution is 0.5 * 0.5 = 0.25 → 25
    expect(score.claimedDepth).toBe(25);
    expect(score.sand).toBe(25);
  });

  it("sand is independent of solid/concrete (pure claims)", () => {
    // Even with 100% solid performance, sand should reflect only Phase 1 claims
    const trials = [
      makeTrial(2, 50, true, 100),   // low diff, medium confidence → low contribution
      makeTrial(26, 50, true, 100),  // mid diff, medium confidence → 25 contribution
      makeTrial(50, 50, true, 100)   // max diff, medium confidence → 50 contribution
    ];
    const score = computeCategoryScore("mult", trials, 26);

    // All trials correct → solid=100
    expect(score.solid).toBe(100);
    // But sand should be based on claimedDepth (50% confidence at max diff = 50)
    expect(score.claimedDepth).toBe(50);
    expect(score.sand).toBe(50);
  });

  it("claimedLoose tracks >=50% confidence frontier", () => {
    const trials = [
      makeTrial(2, 100, true, 100),  // norm=0, confidence=100% → qualifies
      makeTrial(26, 60, true, 100),  // norm=0.5, confidence=60% → qualifies
      makeTrial(50, 40, false, 20)   // norm=1.0, confidence=40% → doesn't qualify
    ];
    const score = computeCategoryScore("mult", trials, 26);

    // Max normalized difficulty where confidence >= 50% is 0.5
    expect(score.claimedLoose).toBe(50);
  });

  it("claimedThick tracks >=80% confidence frontier", () => {
    const trials = [
      makeTrial(2, 100, true, 100),  // norm=0, confidence=100% → qualifies
      makeTrial(26, 80, true, 100),  // norm=0.5, confidence=80% → qualifies
      makeTrial(50, 70, false, 20)   // norm=1.0, confidence=70% → doesn't qualify
    ];
    const score = computeCategoryScore("mult", trials, 26);

    // Max normalized difficulty where confidence >= 80% is 0.5
    expect(score.claimedThick).toBe(50);
  });

  it("handles full range with varying confidences", () => {
    const trials = [
      makeTrial(2, 90, true, 100),   // min: norm=0
      makeTrial(26, 70, true, 100),  // mid: norm=0.5
      makeTrial(50, 100, true, 100)  // max: norm=1.0, this wins
    ];
    const score = computeCategoryScore("mult", trials, 26);

    // Max is 1.0 * 1.0 = 1.0 → claimedDepth=100
    expect(score.claimedDepth).toBe(100);
    expect(score.sand).toBe(100);
    expect(score.claimedLoose).toBe(100); // 100% >= 50% at max diff
    expect(score.claimedThick).toBe(100); // 100% >= 80% at max diff
  });
});

describe("computeCategoryScore - Phase 3 metacognition metrics", () => {
  it("concrete requires both success and high Phase 3 confidence", () => {
    const trials = [
      makeTrial(26, 80, true, 80),   // correct + confident → counts
      makeTrial(26, 80, true, 50),   // correct + not confident → doesn't count
      makeTrial(26, 80, false, 80)   // wrong + confident → doesn't count
    ];
    const score = computeCategoryScore("mult", trials, 26);

    // Only 1 of 3 trials contributes to concrete
    expect(score.concrete).toBeCloseTo(33.33, 1);
    expect(score.solid).toBeCloseTo(66.67, 1);
  });

  it("discernment rewards correct self-assessment in both directions", () => {
    const trials = [
      makeTrial(26, 80, true, 80),   // correct + confident → TP
      makeTrial(26, 80, false, 20),  // wrong + uncertain → TN
      makeTrial(26, 80, false, 80)   // wrong + confident → FP (bad)
    ];
    const score = computeCategoryScore("mult", trials, 26);

    // 2 of 3 correct self-assessments
    expect(score.discernment).toBeCloseTo(66.67, 1);
  });

  it("falseConfidence tracks wrong answers with high Phase 3 confidence", () => {
    const trials = [
      makeTrial(26, 80, false, 80),  // wrong + confident → bad
      makeTrial(26, 80, false, 80),  // wrong + confident → bad
      makeTrial(26, 80, true, 80)    // correct + confident → fine
    ];
    const score = computeCategoryScore("mult", trials, 26);

    // 2 of 3 trials show false confidence
    expect(score.falseConfidence).toBeCloseTo(66.67, 1);
  });

  it("trueUncertainty tracks wrong answers with appropriate doubt", () => {
    const trials = [
      makeTrial(26, 80, false, 20),  // wrong + uncertain → good metacognition
      makeTrial(26, 80, false, 30),  // wrong + uncertain → good metacognition
      makeTrial(26, 80, true, 80)    // correct + confident → not counted
    ];
    const score = computeCategoryScore("mult", trials, 26);

    // 2 of 3 trials show true uncertainty
    expect(score.trueUncertainty).toBeCloseTo(66.67, 1);
  });
});
