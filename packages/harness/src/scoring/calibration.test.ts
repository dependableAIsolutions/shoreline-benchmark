import { describe, expect, it } from "vitest";
import type { TrialResult } from "@shoreline/shared";
import { computeCategoryScore } from "./calibration";

function makeTrial(difficulty: number, phase1Confidence: number, phase2Correct: boolean, phase3Confidence: number): TrialResult {
  return {
    category: "mult",
    difficulty,
    phase1: { prompt: "", response: "", confidence: phase1Confidence, tokensUsed: 0, latencyMs: 0 },
    phase2: {
      prompt: "",
      response: "",
      extractedAnswer: "",
      correctAnswer: "",
      isCorrect: phase2Correct,
      tokensUsed: 0,
      latencyMs: 0
    },
    phase3: { prompt: "", response: "", confidence: phase3Confidence, tokensUsed: 0, latencyMs: 0 },
    timestamp: new Date().toISOString()
  };
}

describe("computeCategoryScore - shared depth axis", () => {
  const multMin = 2;
  const multMax = 50;
  const multSpan = multMax - multMin + 1;
  const multTheoreticalCeiling = multMin + multSpan * 2 - 1;

  it("sand does not reach 100 at tested max difficulty", () => {
    const score = computeCategoryScore("mult", [makeTrial(multMax, 100, true, 100)], multMax);
    expect(score.sand).toBeLessThan(100);
  });

  it("sand reaches 100 only at theoretical ceiling with full confidence", () => {
    const score = computeCategoryScore("mult", [makeTrial(multTheoreticalCeiling, 100, true, 100)], multMax);
    expect(score.sand).toBeCloseTo(100, 6);
  });

  it("solid is depth-weighted by difficulty", () => {
    const easy = computeCategoryScore("mult", [makeTrial(multMin, 10, true, 80)], multMax);
    const hard = computeCategoryScore("mult", [makeTrial(multMax, 10, true, 80)], multMax);
    expect(easy.solid).toBeLessThan(hard.solid);
  });

  it("solid stays zero when all attempts fail", () => {
    const score = computeCategoryScore(
      "mult",
      [makeTrial(multMin, 100, false, 10), makeTrial(26, 100, false, 10), makeTrial(multMax, 100, false, 10)],
      multMax
    );
    expect(score.solid).toBe(0);
    expect(score.sand).toBeGreaterThan(0);
  });

  it("concrete is metacognitive depth (knows right or wrong) and difficulty-weighted", () => {
    const low = computeCategoryScore("mult", [makeTrial(multMin, 50, true, 90)], multMax);
    const high = computeCategoryScore("mult", [makeTrial(multMax, 50, true, 90)], multMax);
    expect(low.concrete).toBeLessThan(high.concrete);
  });
});

describe("computeCategoryScore - metacognition rates", () => {
  it("discernment rewards correct self-evaluation in both directions", () => {
    const score = computeCategoryScore(
      "mult",
      [
        makeTrial(26, 80, true, 80), // true positive
        makeTrial(26, 80, false, 20), // true negative
        makeTrial(26, 80, false, 80) // false positive
      ],
      26
    );
    expect(score.discernment).toBeCloseTo(66.67, 1);
    expect(score.falseConfidence).toBeCloseTo(33.33, 1);
    expect(score.trueUncertainty).toBeCloseTo(33.33, 1);
    expect(score.failureAwareness).toBeCloseTo(33.33, 1);
  });
});
