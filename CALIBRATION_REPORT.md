# Shoreline Calibration Report
**Date:** 2026-02-10
**Models Analyzed:** Gemini 3 Flash Preview, DeepSeek V3.2

## Executive Summary

This calibration effort addressed the primary concern that island geometry was compressed and uninformative. The root cause was overly aggressive difficulty normalization constants that mapped all scores into a narrow 0-40 range.

**Key Change:** Adjusted normalization constants to expand the effective score range from ~0-40 to ~0-80.

---

## 1. Normalization Analysis

### Previous Constants (Problem)
```typescript
SAND_DIFFICULTY_HEADROOM_MULTIPLIER = 2
SAND_DIFFICULTY_EXPONENT = 1.35
```

**Issue:** At max tested difficulty, the normalized value was only ~0.38:
- `linear = (maxDiff - minDiff + 1) / (span × 2) = 0.5`
- `normalized = 0.5^1.35 ≈ 0.38`

This meant even perfect performance at max difficulty yielded only ~38% of the visual range.

### New Constants (Fix)
```typescript
SAND_DIFFICULTY_HEADROOM_MULTIPLIER = 1.25
SAND_DIFFICULTY_EXPONENT = 1.15
```

**Result:** At max tested difficulty, normalized value is now ~0.77:
- `linear = (maxDiff - minDiff + 1) / (span × 1.25) = 0.8`
- `normalized = 0.8^1.15 ≈ 0.77`

This preserves ~23% headroom for theoretical super-human performance while making the tested range visually meaningful.

---

## 2. Before/After Comparison

### Gemini 3 Flash Preview

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| avgSand | 23.71 | 47.65 | +23.94 (+101%) |
| avgSolid | 14.26 | 29.85 | +15.59 (+109%) |
| avgConcrete | 3.13 | 7.60 | +4.47 (+143%) |
| avgDiscernment | 60.42 | 60.42 | (unchanged) |
| totalGap | 50.16 | 63.57 | +13.41 |

**Per-Category Highlights (Before → After):**
| Category | Sand | Solid | Concrete |
|----------|------|-------|----------|
| bool | 23.5 → 46.4 | 39.2 → 77.4 | 0 → 0 |
| counting | 29.4 → 58.0 | 39.2 → 77.4 | 0 → 0 |
| combo | 27.5 → 54.2 | 26.6 → 55.6 | 0 → 0 |
| random | 39.2 → 77.4 | 12.2 → 27.8 | 12.2 → 27.8 |
| matrix | 10.0 → 24.2 | 10.0 → 24.2 | 10.0 → 24.2 |
| sudoku | 23.5 → 46.4 | 2.4 → 5.0 | 2.4 → 5.0 |

### DeepSeek V3.2

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| avgSand | 24.13 | 48.06 | +23.93 (+99%) |
| avgSolid | 8.17 | 17.63 | +9.46 (+116%) |
| avgConcrete | 0.25 | 0.58 | +0.33 (+132%) |
| avgDiscernment | 30.61 | 30.61 | (unchanged) |
| totalGap | 28.17 | 43.61 | +15.44 |

---

## 3. Layer Semantics (Confirmed)

### Sand (Phase 1: Pre-task Confidence)
- **Formula:** `max(confidence × normalizedDifficulty)` across trials
- **Interpretation:** How confidently the model claims capability at each difficulty level
- **sand=100:** Model expressed 100% confidence at theoretical max difficulty (unreachable in practice)

### Solid (Phase 2: Verified Performance)
- **Formula:** `max(performance × normalizedDifficulty)` across trials
- **Interpretation:** Actual verified task completion depth
- **solid=100:** Perfect performance at theoretical max difficulty

### Concrete (Phase 3: Failure Awareness)
- **Formula:** `min(failureAwarenessDepth, solidDepth) × 100`
- **Interpretation:** How well the model recognizes its own failures (wrong + low confidence)
- **concrete=0:** Either no failures occurred, or failures occurred but model remained confident
- **Correctly capped by solid:** Can't be aware of failures that didn't happen

---

## 4. Transition Search Analysis

The adaptive difficulty search (`adaptive.ts`) is working correctly:

1. **Exponential probing** quickly finds the failure zone
2. **Fibonacci refinement** narrows the boundary
3. **Sample selection** covers both passing and transition zones

**Observed Behavior:**
- Gemini: Transitions range from difficulty 4 (matrix) to 280 (counting)
- DeepSeek: Often transitions at minimum difficulty (fragile across categories)

**No changes needed** - the algorithm correctly identifies boundaries and samples meaningfully around them.

---

## 5. Category-Specific Findings

### Categories Working Well
- **Multiplication (mult):** Clean difficulty scaling, reasonable transitions
- **Boolean Circuits (bool):** Both models perform well, transitions at high difficulty
- **Counting in Context:** Good difficulty gradient, meaningful transitions
- **Combinatorics (combo):** Reasonable scaling

### Categories with Inherent Difficulty
- **Sudoku:** Both models fail almost completely (solid ≈ 0-5)
  - Root cause: Generating valid sudoku grids is binary-hard, constraint count doesn't help
  - Recommendation: Accept as a challenging category that differentiates capable models

- **Constrained Writing:** Very hard due to letter banning (e, a, i at higher levels)
  - This is by design - tests precise constraint following

- **Self-Referential:** Requires accurate self-counting, inherently hard
  - Models struggle with meta-cognition about their own output

- **Distribution Matching:** Statistical evaluation may be too strict
  - Consider relaxing thresholds if all models fail consistently

---

## 6. Code Changes Made

### File: `packages/shared/src/constants.ts`
```diff
-export const SAND_DIFFICULTY_HEADROOM_MULTIPLIER = 2;
-export const SAND_DIFFICULTY_EXPONENT = 1.35;
+export const SAND_DIFFICULTY_HEADROOM_MULTIPLIER = 1.25;
+export const SAND_DIFFICULTY_EXPONENT = 1.15;
```

### File: `packages/harness/src/scoring/calibration.ts`
- Added detailed documentation explaining the normalization formula with examples

---

## 7. Benchmark Profile Recommendations

### Cheap Iteration Profile (Development/Testing)
```bash
corepack pnpm benchmark \
  --adapter openrouter \
  --model "google/gemini-3-flash-preview" \
  --all \
  --trials 1 \
  --probe-trials 1 \
  --ramp-mode fast \
  --category-concurrency 4 \
  --timeout-ms 45000 \
  --call-timeout-ms 45000 \
  --max-retries 1
```
- **Cost:** ~$0.03-0.05 per model
- **Duration:** ~20-40 minutes
- **Use case:** Quick validation of changes, testing new models

### Final Quality Profile (Publication)
```bash
corepack pnpm benchmark \
  --adapter openrouter \
  --model "MODEL_ID" \
  --all \
  --trials 3 \
  --probe-trials 3 \
  --ramp-mode balanced \
  --category-concurrency 2 \
  --timeout-ms 120000 \
  --call-timeout-ms 120000 \
  --max-retries 3
```
- **Cost:** ~$0.50-2.00 per model (depends on model pricing)
- **Duration:** ~60-90 minutes
- **Use case:** Final benchmark runs for publication

---

## 8. Validation Status

- **Tests:** All 20 tests passing
- **Typecheck:** Clean, no errors
- **Static Data:** Regenerated for all 6 models in `apps/web/src/data/`

---

## 9. Remaining Considerations

1. **Concrete visibility:** With the expanded range, concrete layers are now more visible but still often 0 when models don't fail or don't recognize failures. This is semantically correct behavior.

2. **Category comparability:** Categories now use consistent normalization. Different inherent difficulty levels are reflected in where models transition, not in the normalization itself.

3. **DeepSeek invalid trials (54/103):** This is a model behavior issue (timeouts/empty responses), not a calibration issue. The benchmark correctly records these as failures.

---

## Conclusion

The normalization adjustment successfully addresses the compressed island geometry issue. Islands now span a meaningful visual range (0-80 instead of 0-40), making model differences more apparent while preserving semantic correctness of all three layers.
