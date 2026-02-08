# Metacognitive Layer Separation: Phase 2 vs Phase 3

## Problem Statement

Phase 3 (post-hoc self-evaluation) currently overlaps too much with Phase 2 (actual performance) in the visualization. The "concrete" metric combines both phases into a single scalar, which:
1. Obscures whether poor concrete scores are due to capability failures or self-awareness failures
2. Makes it hard to identify models that are "capable but unaware" vs "incapable but aware"

## Proposed Separation

### Conceptual Model

**Phase 2 = Capability**: Can the model solve the task?
- Metric: `solid` - pure task performance (0-100)
- Visualization: Radial extent of the island (how far the land goes)

**Phase 3 = Self-Awareness**: Does the model know if it solved correctly?
- Key insight: Self-awareness has TWO components:
  1. **Recognition of success**: When correct, does it express confidence?
  2. **Recognition of failure**: When wrong, does it express doubt?

### New Metrics Structure

| Metric | Formula | Meaning |
|--------|---------|---------|
| `solid` | avg(phase2.isCorrect) | Raw capability |
| `concrete` | avg(phase2.isCorrect AND phase3.confidence >= 60%) | Capability + awareness of success |
| `discernment` | avg(correct+confident OR wrong+uncertain) | Overall self-awareness accuracy |
| `falseConfidence` | avg(wrong AND phase3.confidence >= 60%) | Dangerous blind spot |
| `trueUncertainty` | avg(wrong AND phase3.confidence < 40%) | Healthy doubt |

### 3D Visualization Mapping

The current 2D view conflates radial extent with layer stacking. The 3D view enables independent dimensions:

| Dimension | Metric | Interpretation |
|-----------|--------|----------------|
| **Radial extent** (X-Z plane) | solid | How far the model's actual capability reaches |
| **Outer coastline** | sand (claimedDepth) | Claimed territory based on Phase 1 confidence |
| **Height** (Y axis) | discernment | How self-aware the model is about its performance |
| **Color intensity** | falseConfidence | Red tinting for dangerous overconfidence |

### Terrain Profiles

This encoding creates distinct visual signatures:

1. **Capable Plateau** (solid high, discernment high)
   - Wide, tall terrain
   - Model succeeds AND knows it

2. **Cliff Profile** (solid high, sand low)
   - Wide but steep edges
   - Underconfident-but-capable

3. **Sandy Beach** (sand high, solid low)
   - Extensive but low coastline
   - Overconfident claims beyond capability

4. **Blind Valley** (solid high, concrete low, discernment low)
   - Wide but with height variation
   - Capable but doesn't recognize its own success/failure

5. **Humble Basin** (solid low, trueUncertainty high)
   - Small but appropriately low terrain
   - Incapable but appropriately aware of limitations

## Implementation

### Phase 3 Independence

To make Phase 3 truly independent, we track:

```typescript
interface MetacognitiveMetrics {
  // Phase 2 - pure capability
  solid: number;

  // Phase 3 - self-awareness (independent of Phase 2 outcome)
  successRecognition: number;  // When correct: avg(confidence >= 60%)
  failureRecognition: number;  // When wrong: avg(confidence < 40%)

  // Combined metrics
  discernment: number;         // Weighted average of both recognitions
  falseConfidence: number;     // Wrong + confident (dangerous)
  trueUncertainty: number;     // Wrong + uncertain (healthy)
}
```

### 3D Geometry Mapping

```typescript
// In the 3D island view:

// Radial extent = capability (solid)
const radius = (solid / 100) * maxRadius;

// Height = discernment (self-awareness quality)
const height = baseHeight + (discernment / 100) * heightScale;

// Color = falseConfidence indicator
const colorTint = falseConfidence > 30 ? warningRed : normalColor;
```

### Display in Stats Panel

The stats panel should separate these concepts:

**Capability Block:**
- Solid: "Actual performance"
- Concrete: "Verified capability (success + self-recognition)"

**Self-Awareness Block:**
- Discernment: "Correctly identifies outcomes"
- False Confidence: "Wrong but confident" (danger indicator)
- True Uncertainty: "Wrong but appropriately uncertain"

## Benefits

1. **Clarity**: Clear separation between "can it do the task?" and "does it know what it knows?"
2. **Actionable Insights**: Identifies specific failure modes (capability vs awareness)
3. **Visual Distinctiveness**: 3D terrain profiles make different model behaviors obvious
4. **Safety Awareness**: False confidence is now a separate, visible dimension

## Migration Path

1. Keep existing metrics for backward compatibility
2. Add new `successRecognition` and `failureRecognition` to CategoryScore
3. Update 3D visualization to use height for discernment
4. Add color tinting for falseConfidence in both 2D and 3D views
