# Shoreline Scoring Formulas

## Overview

Shoreline uses a three-phase benchmark to evaluate LLM capabilities and self-awareness:

- **Phase 1**: Pre-task confidence prediction
- **Phase 2**: Actual task execution
- **Phase 3**: Post-task self-evaluation

## Key Metrics

### Sand (Claimed Territory)

**Formula**: `sand = claimedDepth = max(confidence × normalizedDifficulty)`

**Semantic**: Sand represents the Phase 1 claimed territory intensity.

- `sand = 100` means: model expressed 100% confidence at the category's maximum difficulty
- `sand = 50` could mean: 100% confidence at mid-difficulty, OR 50% confidence at max difficulty
- `sand = 0` means: all Phase 1 confidence was at minimum difficulty (claims don't extend into hard problems)

**Why this formula?**
The product `confidence × normalizedDifficulty` ensures that Sand only reaches 100 when the model demonstrates BOTH:
1. Complete confidence (100%)
2. At the hardest difficulty level (normalized = 1.0)

This prevents inflated Sand scores from either:
- High confidence at easy problems only
- Low confidence at hard problems

### Difficulty Normalization

```typescript
normalizedDifficulty = (difficulty - minDifficulty) / (maxDifficulty - minDifficulty)
```

Each category has its own difficulty range (e.g., multiplication: 2-50 digits). Normalization maps any difficulty to 0-1 for cross-category comparison.

### Claimed Frontiers (claimedLoose, claimedThick)

- `claimedLoose`: Maximum normalized difficulty where confidence >= 50%
- `claimedThick`: Maximum normalized difficulty where confidence >= 80%

These show how "thick" the confidence band is - high values mean sustained confidence into harder territory.

### Solid (Actual Capability)

**Formula**: `solid = avg(phase2.isCorrect ? 1 : 0) × 100`

Simple binary correctness averaged across trials. Represents pure task performance.

### Concrete (Verified Capability)

**Formula**: `concrete = avg((phase2.isCorrect AND phase3.confidence >= 60%) ? 1 : 0) × 100`

Represents capability that the model is aware of - it succeeded AND recognized its success.

### Discernment (Self-Awareness Accuracy)

**Formula**:
```typescript
discernment = avg(
  (correct AND phase3.confidence >= 60%) ? 1 :  // True positive
  (wrong AND phase3.confidence < 40%) ? 1 :      // True negative
  0                                               // Missed either direction
) × 100
```

Measures how well the model knows what it knows across both success and failure cases.

### False Confidence (Dangerous Blind Spot)

**Formula**: `falseConfidence = avg((wrong AND phase3.confidence >= 60%) ? 1 : 0) × 100`

The dangerous case: model failed but expressed high confidence. Lower is better.

### True Uncertainty (Healthy Doubt)

**Formula**: `trueUncertainty = avg((wrong AND phase3.confidence < 40%) ? 1 : 0) × 100`

The healthy case: model failed but appropriately expressed doubt. Higher is better.

### Calibration Error

**Formula**: `calibrationError = |avgPhase1Confidence - avgPhase2Score| × 100`

Measures Phase 1 prediction accuracy against Phase 2 outcomes.

## Display Normalization

For visualization, layers are normalized to ensure proper nesting:

```typescript
function normalizeLayersForDisplay(sand, solid, concrete) {
  sandN = max(sand, solid, concrete);      // Outer envelope
  solidN = max(min(solid, sandN), min(concrete, sandN));
  concreteN = min(concrete, solidN);       // Inner core
  return { sand: sandN, solid: solidN, concrete: concreteN };
}
```

This ensures:
- Sand (outer boundary) always encompasses solid and concrete
- Solid always encompasses concrete
- Visual layer nesting is preserved even when raw scores don't nest

## Terrain Profiles

The relationship between metrics creates distinct visual signatures:

| Profile | Condition | Meaning |
|---------|-----------|---------|
| Cliff | solid >> sand | Underconfident-but-capable |
| Beach | sand >> solid | Overconfident (claims beyond capability) |
| Plateau | solid ≈ sand, both high | Well-calibrated capable |
| Valley | solid >> concrete | Capable but unaware of success |
| Basin | all low, trueUncertainty high | Incapable but appropriately aware |

## Boundary Case Examples

### Case 1: Low Difficulty + High Confidence
- difficulty = 2 (min for mult category)
- confidence = 100%
- normalizedDifficulty = 0
- claimedDepth contribution = 100% × 0 = 0

Result: **Sand = 0** (confidence doesn't extend into hard territory)

### Case 2: Max Difficulty + Partial Confidence
- difficulty = 50 (max for mult category)
- confidence = 75%
- normalizedDifficulty = 1.0
- claimedDepth contribution = 75% × 1.0 = 0.75

Result: **Sand = 75** (proportional to confidence at max difficulty)

### Case 3: Max Difficulty + Full Confidence
- difficulty = 50 (max for mult category)
- confidence = 100%
- normalizedDifficulty = 1.0
- claimedDepth contribution = 100% × 1.0 = 1.0

Result: **Sand = 100** (only possible with full confidence at max difficulty)

### Case 4: Mixed Confidence Across Difficulties
```
Trial 1: difficulty=2 (norm=0), confidence=100% → 0
Trial 2: difficulty=26 (norm=0.5), confidence=80% → 40
Trial 3: difficulty=50 (norm=1.0), confidence=30% → 30
```
claimedDepth = max(0, 40, 30) = 40

Result: **Sand = 40** (peak contribution was at mid-difficulty)

## Formula History

### Before (v0.1)
```typescript
sand = max(claimedDepth, solid, concrete)
```
Issue: Sand could reach 100 just because solid/concrete were 100, even with low claimed confidence.

### After (v0.2 - Current)
```typescript
sand = claimedDepth = max(confidence × normalizedDifficulty) × 100
```
Fix: Sand now purely represents Phase 1 claimed territory. Display normalization handles envelope semantics separately.
