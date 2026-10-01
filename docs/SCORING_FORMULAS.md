# Shoreline Scoring Formulas

## Overview

Shoreline uses three phases to evaluate task performance and self-awareness:

- **Phase 1**: Pre-task confidence prediction
- **Phase 2**: Task execution
- **Phase 3**: Post-task self-evaluation

Category scores use trials that are not marked invalid and have non-null Phase 1 and Phase 3 confidence. For Phase 2 performance, a numeric `partialScore` is clamped to 0–1 and used when present; otherwise, correctness is binary (`isCorrect` gives 1, incorrect gives 0). The formulas below use this performance value where applicable.

## Difficulty Normalization

Difficulty is normalized separately within each category. Let `minDifficulty` and `maxDifficulty` be the category bounds, `span = maxDifficulty - minDifficulty + 1`, headroom be `1.25`, and the exponent be `1.15`:

```typescript
linear = clamp(
  (difficulty - minDifficulty + 1) / (span * 1.25),
  0,
  1
)
normalizedDifficulty = clamp(linear ** 1.15, 0, 1)
```

This reserves headroom above the tested difficulty range and gives more visual weight to higher difficulties. For multiplication, whose tested range is 2–50, difficulty 50 normalizes to about 0.774, not 1.0. The theoretical ceiling is the point where the normalized value reaches 1.

## Key Metrics

### Sand (Claimed Territory)

**Formula**: `sand = 100 × max((phase1.confidence / 100) × normalizedDifficulty)`

Sand is the deepest Phase 1 claim across scored trials. It combines confidence with the normalized difficulty of the task. A high confidence claim at an easier difficulty, or a low confidence claim at a harder difficulty, contributes less than a strong claim at a theoretical ceiling.

- `claimedLoose`: greatest normalized difficulty among trials with Phase 1 confidence at least 50%, scaled to 0–100.
- `claimedThick`: greatest normalized difficulty among trials with Phase 1 confidence at least 80%, scaled to 0–100.

If no trial meets a threshold, that frontier is 0.

### Solid (Verified Depth)

**Formula**: `solid = 100 × max(performance01 × normalizedDifficulty)`

Solid measures the strongest difficulty-weighted Phase 2 performance on any scored trial. It is a depth frontier, not average correctness. Partial scores count proportionally when available; otherwise, correct trials contribute 1 and incorrect trials contribute 0.

### Concrete (Failure-Aware Verified Depth)

For each scored trial, `mistake01 = max(0, 1 - performance01)`. A mistake is counted as admitted when Phase 3 confidence is below 40%.

```typescript
failureAwareness = totalMistakeMass > 0
  ? caughtMistakeMass / totalMistakeMass
  : 1
concrete = solid × failureAwareness
```

Mistakes are weighted by their magnitude (`mistake01`). If there are no mistakes, failure awareness is 1. Concrete is the failure-aware share of Solid: it is high when performance reaches difficult tasks and the model recognizes its mistakes.

### Discernment (Self-Awareness Accuracy)

**Formula**:

```typescript
discernment = 100 × avg(
  (correct AND phase3.confidence >= 60%) ? 1 :
  (wrong AND phase3.confidence < 40%) ? 1 :
  0
)
```

This measures how often the model is confident after correct answers and uncertain after incorrect answers.

### False Confidence (Dangerous Blind Spot)

**Formula**: `falseConfidence = 100 × avg((wrong AND phase3.confidence >= 60%) ? 1 : 0)`

This is the share of scored trials that were wrong while the model remained confident. Lower is better.

### True Uncertainty (Healthy Doubt)

**Formula**: `trueUncertainty = 100 × avg((wrong AND phase3.confidence < 40%) ? 1 : 0)`

This is the share of scored trials that were wrong and appropriately uncertain. Higher is better.

### Calibration Error

**Formula**: `calibrationError = 100 × |avg(phase1.confidence / 100) - avg(performance01)|`

This compares average Phase 1 confidence with average Phase 2 performance. The Phase 2 average uses partial scores when available and binary correctness otherwise; it is not the difficulty-weighted Solid score. Lower is better.

## Display Layers

The 3D island uses the scores as layer radii. Sand extends to the largest score to form the outer envelope; Solid and Concrete use their computed values directly:

```typescript
sandRadius = max(sand, solid, concrete)
solidRadius = solid
concreteRadius = concrete
```

The visual height also uses the claimed frontiers: Sand height is based on `claimedThick` and `claimedLoose`, Solid height on Solid, and Concrete height on Concrete. These display choices do not change the returned scores.

## Terrain Profiles

The relationship between metrics creates distinct visual signatures:

| Profile | Condition | Meaning |
|---------|-----------|---------|
| Cliff | solid >> sand | Capable but underclaims its ability |
| Beach | sand >> solid | Claims more depth than it demonstrates |
| Plateau | solid ≈ sand, both high | High demonstrated depth with similarly high claims |
| Valley | solid >> concrete | Capable but often misses its mistakes |
| Basin | all low, trueUncertainty high | Low performance with appropriate doubt |

## Boundary Case Examples

For the multiplication category (difficulty 2–50), normalized difficulty is about 0.009 at difficulty 2, 0.357 at difficulty 26, and 0.774 at difficulty 50.

### Case 1: Minimum Difficulty + Full Confidence

- Difficulty = 2; confidence = 100%
- Sand contribution = `100% × 0.009` ≈ **0.9**

The category minimum has a small nonzero normalized value because normalization uses `difficulty - minDifficulty + 1`.

### Case 2: Maximum Tested Difficulty + Partial Confidence

- Difficulty = 50; confidence = 75%
- Sand contribution = `75% × 77.4` ≈ **58.0**

The maximum tested difficulty remains below the theoretical ceiling.

### Case 3: Maximum Tested Difficulty + Full Confidence

- Difficulty = 50; confidence = 100%
- Sand contribution = `100% × 77.4` ≈ **77.4**

Scores reach 100 only at full confidence and normalized difficulty 1.0.

### Case 4: Mixed Confidence Across Difficulties

```text
Trial 1: difficulty=2,  confidence=100% → 0.9
Trial 2: difficulty=26, confidence=80%  → 28.5
Trial 3: difficulty=50, confidence=30%  → 23.2
```

Sand is the maximum contribution, about **28.5**, from the middle difficulty trial.
