# 3D Island Visualization

## Design Rationale

The 3D island view enhances the 2D visualization by adding a third dimension (height) to encode additional metrics. This makes certain patterns more obvious:

- **Cliffs**: Steep vertical transitions when capability exists without corresponding claims
- **Valleys**: Depressions where self-awareness lags behind capability
- **Peaks**: High points where capability AND self-awareness align

## Metric-to-Geometry Mapping

### Dimensions

| Dimension | Metric | Interpretation |
|-----------|--------|----------------|
| **Radial extent** (X-Z) | Layer value (sand/solid/concrete) | How far capability/claims extend |
| **Height** (Y) | Discernment (Phase 3 quality) | Self-awareness quality |
| **Color** | Base layer color + falseConfidence tint | Danger indicator |

### Layer Heights

```typescript
// Sand layer - low beach at sea level
sandHeight = 0.02 + (value / 100) × 0.15

// Solid layer - mid terrain influenced by discernment
solidHeight = 0.1 + (solid × 0.6 + discernment × 0.4) / 100 × 0.4

// Concrete layer - highest peaks
concreteHeight = 0.25 + (concrete / 100) × 0.55
```

The solid layer height is a weighted blend of capability (60%) and discernment (40%), creating height variation that reflects metacognitive quality.

### Color Encoding

```typescript
baseColor = layerColor           // #F59E0B (sand), #3DA84A (solid), #8A9CAA (concrete)
dangerColor = #F87171            // Warning red

if (falseConfidence > 30%) {
  displayColor = lerp(dangerColor, baseColor, 1 - falseConfidence)
}
```

Categories with high false confidence (model was wrong but confident) show red tinting.

## Visual Signatures

### 1. Capable Plateau
- **Metrics**: solid high, discernment high
- **Visual**: Wide, tall green terrain
- **Meaning**: Model succeeds AND knows when it succeeds/fails

### 2. Cliff Profile
- **Metrics**: solid high, sand low
- **Visual**: Wide base with steep edges, sand barely extending beyond solid
- **Meaning**: Underconfident - capable but doesn't claim its capability

### 3. Sandy Beach
- **Metrics**: sand high, solid low
- **Visual**: Extended low beach beyond the solid land mass
- **Meaning**: Overconfident - claims territory it can't actually hold

### 4. Blind Valley
- **Metrics**: solid high, concrete low, discernment low
- **Visual**: Wide but relatively flat terrain, possible red tinting
- **Meaning**: Capable but doesn't recognize its own success/failure

### 5. Humble Basin
- **Metrics**: all low, trueUncertainty high
- **Visual**: Small, low terrain with appropriate proportions
- **Meaning**: Limited capability but appropriately aware of limitations

## Implementation Details

### Determinism

All geometry is procedurally generated to ensure consistent rendering:

```typescript
function organicVariation(index: number, seed: number, amplitude = 0.05): number {
  const x = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;
  return ((x - Math.floor(x)) * 2 - 1) * amplitude;
}

function quantize(value: number): number {
  return Math.round(value * 10000) / 10000;
}
```

This prevents:
- Hydration mismatches between server and client
- Different renders on page refresh
- Random visual noise

### Performance Considerations

- Uses simple triangle geometry (not smooth curves) for performance
- Segments per category is limited (6) to keep vertex count low
- Vertex colors instead of multiple materials
- Single geometry buffer per layer

### Interactivity

- **Orbit controls**: Rotate, zoom, pan the 3D view
- **Category hover**: Highlights category wedge, shows detailed tooltip
- **Tooltip**: Shows sand/solid/concrete plus discernment and false confidence

## Usage

Toggle between 2D and 3D views using the buttons in the IslandCard header:

```
[Model Name]                    [2D] [3D]
```

The 3D view supports:
- Mouse drag to rotate
- Scroll to zoom
- Mouse over category labels to see details

## Technical Stack

- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Helper components (OrbitControls, Html)
- **three**: 3D rendering engine

## Future Enhancements

Potential improvements:

1. **Animated transitions**: Smooth morphing between different model states
2. **Category wedge highlighting**: More prominent selection state
3. **Contour lines**: Show threshold boundaries (50%, 80% confidence frontiers)
4. **Water effects**: Animated ocean around the island
5. **Minimap**: Small 2D overview showing current camera angle
