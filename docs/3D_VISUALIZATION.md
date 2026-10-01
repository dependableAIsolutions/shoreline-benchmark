# 3D Island Visualization

## Design Rationale

The 3D view gives each category's three island metrics a spatial profile. The
distance from the center shows how far each metric reaches, so differences
between claimed ability, verified performance, and noticed failures are easy to
compare around the island. Fixed layer elevations and terrain textures give
those profiles a readable landscape; elevation itself is not a score.

The view complements the 2D island. It is a visual aid for comparing category
profiles, while the labels and tooltip provide the exact values.

## Metric-to-Geometry Mapping

| Visual dimension | What it encodes | How to read it |
|------------------|-----------------|----------------|
| **Angle** (X-Z) | Category | Each category occupies one spoke around the island. |
| **Radial extent** (X-Z) | Sand, solid, and concrete scores | Each score is scaled from 0–100 to the 0–2 unit radius. |
| **Height** (Y) | Fixed layer and shoreline shape | Elevation distinguishes terrain layers; it does not encode discernment or another score. |
| **Color and texture** | Terrain layer and procedural variation | Tan is sand, green is solid, and gray-blue is concrete. False confidence does not tint the terrain red. |

The layer meanings match the metrics shown elsewhere in the app:

- **Sand** is claimed depth: what the model says it can do before trying.
- **Solid** is verified depth: what the model solves correctly.
- **Concrete** is failure-aware depth: how well it notices its own mistakes.

For each layer, the component takes that metric's value for every category and
builds a smoothed radial profile. The category values determine how far the
layer extends, not its height. The three profiles are combined into one terrain
mesh. Where they overlap, concrete is drawn as the raised interior, solid as
the middle terrain, and sand as the outer beach. Local slopes, shoreline
transitions, and small deterministic noise soften the boundaries.

### Layer Shape

The main terrain mesh uses fixed elevation cues: sand begins near 0.03 units,
solid terrain transitions around 0.18 units, and concrete plateaus around 0.35
units. The mesh adds slopes at layer edges, shoreline tapering, and subtle
height variation for texture. These values shape the illustration; they are
not formulas derived from the scores.

### Color and Texture

Vertex colors are selected from the terrain layer and varied by deterministic
noise. Sand uses tan, solid uses green, and concrete uses gray-blue. Concrete
edges blend with the underlying green terrain, and the shoreline darkens toward
the edge. The water and ocean floor use separate shoreline-aware blue palettes.
No color channel represents discernment or false confidence.

## Visual Signatures

Read the horizontal reach of the layers to compare metrics:

1. **Claimed reach beyond verified reach**: sand extends past solid. This
   suggests claimed ability exceeds demonstrated performance in that category.
2. **Verified reach beyond claimed reach**: solid extends past sand. This
   suggests demonstrated performance exceeds what the model claims.
3. **Failure-aware interior**: concrete occupies part of the solid region.
   Concrete is computed from solid and mistake-awareness, so it shows the
   portion associated with recognized mistakes.
4. **Similar profiles**: layers with similar reach overlap, making their
   boundaries harder to distinguish. Use the category tooltip for their exact
   values.

These are visual comparisons, not extra metrics. Aggregate overconfidence,
underconfidence, and blind-spot values are calculated separately and are not
encoded as terrain height or color.

## Implementation Details

### Geometry and Stability

`IslandTerrain` creates one indexed `BufferGeometry` with vertex colors. It
uses 320 angular segments and 108 concentric ring segments. Each layer profile
is interpolated between category values with a closed Catmull–Rom curve, then
filled and smoothed to reduce angular jitter. The terrain uses seeded
deterministic noise, and generated coordinates are quantized for stable
rendering.

The island also draws contour lines for the three layers. A shoreline profile
drives the surrounding ocean floor and water colors. Water texture offsets and
the ocean surface move subtly while the terrain profile remains stable.

### Performance

- Keep the terrain as a single indexed mesh with vertex colors.
- The terrain's current resolution is 320 angular by 108 radial segments.
- The ocean floor and water are separate grid meshes, each with its own
  resolution and shoreline coloring.

## Interactivity and Usage

Use the **2D** and **3D** buttons in an island card header to switch views. The
3D view slowly auto-rotates. Drag to orbit and scroll to zoom; panning is
disabled. Hover a category label to emphasize the label and show that
category's sand, solid, and concrete values in the tooltip. Hovering the
terrain itself does not select a category.

The card uses a 960 × 540 view in its regular layout and a 360 × 360 view in
compact layout. `Island3D` also accepts optional width and height props for
other callers.

## Technical Stack

- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Orbit controls and HTML labels/tooltips
- **three**: Geometry, materials, and rendering engine

## Possible Future Enhancements

1. Animated transitions between model profiles
2. A more prominent category selection state
3. Contour lines for additional metric thresholds
4. More varied water effects
5. A minimap showing the current camera angle
