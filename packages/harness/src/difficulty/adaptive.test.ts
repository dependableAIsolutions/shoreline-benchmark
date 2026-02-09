import { describe, expect, it } from "vitest";
import { findTransitionZone } from "./adaptive";

describe("findTransitionZone", () => {
  it("stops probing when max difficulty keeps passing", async () => {
    let probeCalls = 0;
    const result = await findTransitionZone(
      {
        minDifficulty: 2,
        maxDifficulty: 50,
        probeTrials: 1,
        rampMode: "fast"
      },
      async () => {
        probeCalls += 1;
        return 1;
      }
    );

    expect(probeCalls).toBeLessThan(12);
    expect(result.boundary).toBe(50);
    expect(result.ceilingReached).toBe(true);
  });
});
