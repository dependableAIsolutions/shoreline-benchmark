import { describe, expect, it } from "vitest";
import { CATEGORY_DEFINITIONS } from "@shoreline/shared";

describe("category difficulty ramps", () => {
  it("define ordered anchor ladders spanning easy to ceiling", () => {
    for (const category of CATEGORY_DEFINITIONS) {
      const anchors = category.anchorDifficulties;

      expect(anchors, `${category.key} missing anchorDifficulties`).toBeDefined();
      expect(anchors && anchors.length, `${category.key} should have at least 5 anchors`).toBeGreaterThanOrEqual(5);
      expect(anchors?.[0], `${category.key} anchors should start at minDifficulty`).toBe(category.minDifficulty);
      expect(anchors?.[anchors.length - 1], `${category.key} anchors should end at maxDifficulty`).toBe(category.maxDifficulty);

      for (let i = 0; i < (anchors?.length ?? 0); i += 1) {
        const value = anchors?.[i] ?? 0;
        expect(value, `${category.key} anchor ${i} out of range`).toBeGreaterThanOrEqual(category.minDifficulty);
        expect(value, `${category.key} anchor ${i} out of range`).toBeLessThanOrEqual(category.maxDifficulty);
        if (i > 0) {
          expect(value, `${category.key} anchors must be strictly increasing`).toBeGreaterThan((anchors?.[i - 1] ?? 0));
        }
      }
    }
  });
});
