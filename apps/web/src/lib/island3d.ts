/**
 * 3D Island Geometry Mapping Module
 *
 * Maps benchmark metrics to 3D terrain semantics:
 *
 * LAYERS (radial extent + height):
 * - Sand (outer beach): claimedDepth - Phase 1 confidence × normalized difficulty
 *   Sand=100 means 100% confidence at the theoretical difficulty ceiling
 * - Solid (middle land): Phase 2 verified depth (performance × normalized difficulty)
 * - Concrete (inner foundation): Phase 3 failure-aware depth (wrong + low-confidence × normalized difficulty)
 *
 * TERRAIN PROFILES:
 * - Cliff: solid >> sand (underconfident-but-capable)
 *   Model succeeds at tasks but didn't claim confidence → steep inland cliffs
 * - Beach: sand >> solid (overconfident)
 *   Model claimed confidence but failed → wide sandy beaches
 * - Plateau: claimedThick defines high-confidence plateau extent
 * - Shelf: claimedLoose defines moderate-confidence shelf extent
 *
 * HEIGHT ENCODING:
 * - Concrete core: tallest (mountain peak)
 * - Solid ring: mid-height plateau
 * - Sand ring: sea-level beach, with height variation for thick/loose bands
 *
 * DETERMINISM:
 * All geometry is procedurally generated from seed values to ensure
 * consistent rendering across server/client (no hydration mismatches).
 */

import type { CategoryScore } from "./types";

/** Quantize values to prevent floating-point hydration mismatches */
function quantize(value: number, precision = 4): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

/** Deterministic pseudo-random based on seed - same output every time */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/** Deterministic organic variation for natural coastline */
function organicVariation(index: number, layerSeed: number, amplitude = 0.05): number {
  return (seededRandom(index * 127.1 + layerSeed * 311.7) * 2 - 1) * amplitude;
}

export interface IslandVertex {
  x: number;
  y: number;
  z: number; // height
  u: number; // texture coordinate
  v: number;
}

export interface IslandLayer {
  vertices: IslandVertex[];
  indices: number[];
  color: string;
  opacity: number;
}

export interface Island3DGeometry {
  sand: IslandLayer;
  solid: IslandLayer;
  concrete: IslandLayer;
  cliffRegions: CliffRegion[];
  beachRegions: BeachRegion[];
}

export interface CliffRegion {
  categoryIndex: number;
  height: number; // cliff height (solid - sand normalized)
  angle: number;
}

export interface BeachRegion {
  categoryIndex: number;
  width: number; // beach width (sand - solid normalized)
  angle: number;
}

export interface CategoryMetrics {
  sand: number;
  solid: number;
  concrete: number;
  claimedLoose?: number;
  claimedThick?: number;
  claimedDepth?: number;
}

/**
 * Convert polar coordinates to cartesian with height
 */
function polarToXYZ(
  angleDeg: number,
  radius: number,
  height: number
): { x: number; y: number; z: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: quantize(radius * Math.cos(rad)),
    y: quantize(height),
    z: quantize(radius * Math.sin(rad))
  };
}

/**
 * Generate ring geometry for a layer at given radius and height profile
 */
function generateRingGeometry(
  categoryMetrics: CategoryMetrics[],
  radiusExtractor: (m: CategoryMetrics) => number,
  heightExtractor: (m: CategoryMetrics) => number,
  layerSeed: number,
  maxRadius: number,
  segments = 32
): { vertices: IslandVertex[]; indices: number[] } {
  const n = categoryMetrics.length;
  const vertices: IslandVertex[] = [];
  const indices: number[] = [];

  // Generate vertices for each category wedge
  for (let catIdx = 0; catIdx < n; catIdx++) {
    const metrics = categoryMetrics[catIdx];
    const startAngle = catIdx * (360 / n);
    const endAngle = (catIdx + 1) * (360 / n);
    const segmentsPerCategory = Math.ceil(segments / n);

    const baseRadius = (radiusExtractor(metrics) / 100) * maxRadius;
    const height = heightExtractor(metrics);

    // Center vertex for this wedge
    const centerIdx = vertices.length;
    vertices.push({
      x: 0,
      y: quantize(height * 0.2), // slightly raised center
      z: 0,
      u: 0.5,
      v: 0.5
    });

    // Outer edge vertices
    for (let seg = 0; seg <= segmentsPerCategory; seg++) {
      const t = seg / segmentsPerCategory;
      const angle = startAngle + t * (endAngle - startAngle);

      // Add organic variation to radius for natural coastline
      const variation = organicVariation(catIdx * segmentsPerCategory + seg, layerSeed, 0.03);
      const variedRadius = baseRadius * (1 + variation);

      const pos = polarToXYZ(angle, variedRadius, height);
      vertices.push({
        x: pos.x,
        y: pos.y,
        z: pos.z,
        u: quantize(0.5 + 0.5 * Math.cos((angle * Math.PI) / 180)),
        v: quantize(0.5 + 0.5 * Math.sin((angle * Math.PI) / 180))
      });

      // Create triangles from center to edge
      if (seg > 0) {
        indices.push(
          centerIdx,
          centerIdx + seg,
          centerIdx + seg + 1
        );
      }
    }
  }

  return { vertices, indices };
}

/**
 * Calculate cliff regions where solid >> sand (underconfidence)
 */
function findCliffRegions(categoryMetrics: CategoryMetrics[]): CliffRegion[] {
  return categoryMetrics
    .map((m, idx) => {
      const gap = m.solid - m.sand;
      if (gap > 10) {
        return {
          categoryIndex: idx,
          height: quantize(gap / 100),
          angle: idx * (360 / categoryMetrics.length)
        };
      }
      return null;
    })
    .filter((r): r is CliffRegion => r !== null);
}

/**
 * Calculate beach regions where sand >> solid (overconfidence)
 */
function findBeachRegions(categoryMetrics: CategoryMetrics[]): BeachRegion[] {
  return categoryMetrics
    .map((m, idx) => {
      const gap = m.sand - m.solid;
      if (gap > 10) {
        return {
          categoryIndex: idx,
          width: quantize(gap / 100),
          angle: idx * (360 / categoryMetrics.length)
        };
      }
      return null;
    })
    .filter((r): r is BeachRegion => r !== null);
}

/**
 * Main function: generate complete 3D island geometry from category scores
 */
export function generateIsland3DGeometry(
  categoryScores: CategoryScore[],
  maxRadius = 2
): Island3DGeometry {
  const metrics: CategoryMetrics[] = categoryScores.map((s) => ({
    sand: s.sand,
    solid: s.solid,
    concrete: s.concrete,
    claimedLoose: s.claimedLoose,
    claimedThick: s.claimedThick,
    claimedDepth: s.claimedDepth
  }));

  // Sand layer: outer beach at sea level, slight height for thick/loose bands
  const sandGeom = generateRingGeometry(
    metrics,
    (m) => Math.max(m.sand, m.solid, m.concrete), // envelope for display
    (m) => {
      // Height bands: thick (high) > loose (medium) > base (low)
      const thick = (m.claimedThick ?? 0) / 100;
      const loose = (m.claimedLoose ?? 0) / 100;
      return quantize(thick * 0.15 + loose * 0.1 + 0.05);
    },
    2, // layerSeed for sand
    maxRadius
  );

  // Solid layer: middle plateau, higher elevation
  const solidGeom = generateRingGeometry(
    metrics,
    (m) => m.solid,
    (m) => quantize(0.3 + (m.solid / 100) * 0.3),
    1, // layerSeed for solid
    maxRadius
  );

  // Concrete layer: inner core, highest point
  const concreteGeom = generateRingGeometry(
    metrics,
    (m) => m.concrete,
    (m) => quantize(0.5 + (m.concrete / 100) * 0.4),
    0, // layerSeed for concrete
    maxRadius
  );

  return {
    sand: {
      ...sandGeom,
      color: "#F59E0B",
      opacity: 0.85
    },
    solid: {
      ...solidGeom,
      color: "#3DA84A",
      opacity: 0.9
    },
    concrete: {
      ...concreteGeom,
      color: "#8A9CAA",
      opacity: 0.95
    },
    cliffRegions: findCliffRegions(metrics),
    beachRegions: findBeachRegions(metrics)
  };
}

/**
 * Get terrain profile description for a category
 */
export function getTerrainProfile(score: CategoryScore): string {
  const sandSolidGap = score.sand - score.solid;
  const solidConcreteGap = score.solid - score.concrete;

  if (sandSolidGap > 20) {
    return "overconfident-beach";
  } else if (sandSolidGap < -20) {
    return "underconfident-cliff";
  } else if (solidConcreteGap > 20) {
    return "blind-spot-valley";
  } else if (score.solid > 80 && score.concrete > 70) {
    return "capable-plateau";
  }
  return "mixed-terrain";
}

/**
 * Height map values for terrain visualization
 */
export interface HeightMapPoint {
  angle: number;
  sandHeight: number;
  solidHeight: number;
  concreteHeight: number;
  cliffFactor: number; // 0-1, how steep the cliff
  beachFactor: number; // 0-1, how wide the beach
}

export function generateHeightMap(
  categoryScores: CategoryScore[],
  pointsPerCategory = 8
): HeightMapPoint[] {
  const points: HeightMapPoint[] = [];
  const n = categoryScores.length;
  const step = 360 / n;

  for (let catIdx = 0; catIdx < n; catIdx++) {
    const score = categoryScores[catIdx];
    const startAngle = catIdx * step;

    for (let i = 0; i < pointsPerCategory; i++) {
      const t = i / pointsPerCategory;
      const angle = startAngle + t * step;

      // Interpolate to next category for smooth transitions
      const nextScore = categoryScores[(catIdx + 1) % n];
      const blend = t < 0.5 ? 0 : (t - 0.5) * 2;

      const sandVal = score.sand * (1 - blend) + nextScore.sand * blend;
      const solidVal = score.solid * (1 - blend) + nextScore.solid * blend;
      const concreteVal = score.concrete * (1 - blend) + nextScore.concrete * blend;

      const cliffFactor = Math.max(0, solidVal - sandVal) / 100;
      const beachFactor = Math.max(0, sandVal - solidVal) / 100;

      points.push({
        angle: quantize(angle),
        sandHeight: quantize(sandVal / 100 * 0.3),
        solidHeight: quantize(solidVal / 100 * 0.6),
        concreteHeight: quantize(concreteVal / 100 * 0.9),
        cliffFactor: quantize(cliffFactor),
        beachFactor: quantize(beachFactor)
      });
    }
  }

  return points;
}
