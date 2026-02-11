"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { categoryLabels } from "../data/results";
import { CATEGORY_ORDER, type CategoryKey, type ModelResult } from "../lib/types";

interface Island3DProps {
  model: ModelResult;
  size?: number;
  hoveredCategory: CategoryKey | null;
  onHoverCategory?: (category: CategoryKey | null) => void;
}

interface CategoryMetrics {
  sand: number;
  solid: number;
  concrete: number;
}

interface SmoothLayerProfile {
  radii: number[];
  stepDeg: number;
}

/** Quantize to prevent hydration mismatches */
function quantize(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Deterministic noise for subtle texture variation */
function noise(x: number, y: number, seed = 0): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 113.5) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

function createWaterTexture(seed = 0, size = 256): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const imageData = context.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      const waveA = Math.sin((nx + seed * 0.11) * Math.PI * 14);
      const waveB = Math.cos((ny + seed * 0.07) * Math.PI * 16);
      const waveC = Math.sin((nx + ny + seed * 0.05) * Math.PI * 10);
      const grain = noise(nx * 16, ny * 16, seed) * 0.28;
      const value = Math.max(0, Math.min(255, Math.round((waveA * 0.35 + waveB * 0.35 + waveC * 0.2 + grain + 1) * 127.5)));

      const index = (y * size + x) * 4;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.needsUpdate = true;
  return texture;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(edge1 - edge0, 1e-6)));
  return t * t * (3 - 2 * t);
}

/** Water surface with shoreline-aware coloring and animated normal map */
function Ocean({
  shorelineProfile,
  radius
}: {
  shorelineProfile: SmoothLayerProfile;
  radius: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);
  const waveTextureA = useMemo(() => createWaterTexture(3), []);
  const geometry = useMemo(() => {
    const waterExtent = radius * 5.2;
    const gridSegments = 240;
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const coastColor = new THREE.Color("#cffcff");
    const lagoonColor = new THREE.Color("#79e6f8");
    const shelfColor = new THREE.Color("#2da7d8");
    const deepColor = new THREE.Color("#0e5a94");
    const abyssColor = new THREE.Color("#073762");

    for (let zi = 0; zi <= gridSegments; zi++) {
      const zT = zi / gridSegments;
      const z = (zT - 0.5) * waterExtent * 2;

      for (let xi = 0; xi <= gridSegments; xi++) {
        const xT = xi / gridSegments;
        const x = (xT - 0.5) * waterExtent * 2;

        const radialDistance = Math.sqrt(x * x + z * z);
        const angle = normalize360((Math.atan2(z, x) * 180) / Math.PI + 90);
        const shorelineRadius = sampleLayerRadius(shorelineProfile, angle);
        const distanceFromShore = Math.max(0, radialDistance - shorelineRadius);

        const lagoonT = smoothstep(0, radius * 0.58, distanceFromShore);
        const shelfT = smoothstep(radius * 0.34, radius * 2.45, distanceFromShore);
        const deepT = smoothstep(radius * 1.9, radius * 5.0, distanceFromShore);

        const reefPatch = (noise(x * 0.7, z * 0.7, 21) + 1) * 0.5;
        const shallowPatchBoost = (1 - deepT) * 0.2 * reefPatch;
        const deepPatch = deepT * 0.15 * reefPatch;

        const color = coastColor.clone()
          .lerp(lagoonColor, lagoonT)
          .lerp(shelfColor, shelfT)
          .lerp(deepColor, deepT * 0.88)
          .lerp(abyssColor, deepT * 0.45)
          .lerp(new THREE.Color("#ebffff"), shallowPatchBoost)
          .lerp(new THREE.Color("#0a3157"), deepPatch);

        // Feather far edges so the water does not read as a hard disc.
        const edgeFade = smoothstep(radius * 4.0, radius * 5.2, radialDistance);
        color.lerp(abyssColor, edgeFade * 0.34);

        vertices.push(quantize(x), quantize(-0.03), quantize(z));
        colors.push(color.r, color.g, color.b);
      }
    }

    const vertsPerRow = gridSegments + 1;
    for (let zi = 0; zi < gridSegments; zi++) {
      for (let xi = 0; xi < gridSegments; xi++) {
        const curr = zi * vertsPerRow + xi;
        const next = curr + vertsPerRow;

        indices.push(curr, next, curr + 1);
        indices.push(curr + 1, next, next + 1);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [radius, shorelineProfile]);

  useEffect(() => {
    return () => {
      waveTextureA?.dispose();
    };
  }, [waveTextureA]);

  useFrame((_, delta) => {
    time.current += delta;
    if (meshRef.current) {
      // Very subtle bobbing motion instead of complex waves
      meshRef.current.position.y = -0.03 + Math.sin(time.current * 0.5) * 0.003;
    }
    if (waveTextureA) {
      waveTextureA.offset.x = (waveTextureA.offset.x + delta * 0.015) % 1;
      waveTextureA.offset.y = (waveTextureA.offset.y + delta * 0.009) % 1;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.84}
        roughness={0.2}
        metalness={0.17}
        emissive="#0d4a78"
        emissiveIntensity={0.08}
        bumpMap={waveTextureA ?? undefined}
        bumpScale={0.038}
      />
    </mesh>
  );
}

/** Ocean floor with shoreline-aware depth coloring */
function OceanFloor({
  shorelineProfile,
  radius
}: {
  shorelineProfile: SmoothLayerProfile;
  radius: number;
}) {
  const geometry = useMemo(() => {
    const floorExtent = radius * 5.0;
    const gridSegments = 220;
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const sandbedColor = new THREE.Color("#f3f0dc");
    const shoalColor = new THREE.Color("#a9efe8");
    const lagoonColor = new THREE.Color("#69d7df");
    const shelfColor = new THREE.Color("#2e79b3");
    const deepColor = new THREE.Color("#12385f");

    for (let zi = 0; zi <= gridSegments; zi++) {
      const zT = zi / gridSegments;
      const z = (zT - 0.5) * floorExtent * 2;

      for (let xi = 0; xi <= gridSegments; xi++) {
        const xT = xi / gridSegments;
        const x = (xT - 0.5) * floorExtent * 2;

        const radialDistance = Math.sqrt(x * x + z * z);
        const angle = normalize360((Math.atan2(z, x) * 180) / Math.PI + 90);
        const shorelineRadius = sampleLayerRadius(shorelineProfile, angle);
        const distanceFromShore = Math.max(0, radialDistance - shorelineRadius);

        const shoalT = smoothstep(0, radius * 0.38, distanceFromShore);
        const lagoonT = smoothstep(radius * 0.2, radius * 1.25, distanceFromShore);
        const deepT = smoothstep(radius * 1.1, radius * 4.0, distanceFromShore);
        const patch = (noise(x * 0.5, z * 0.5, 42) + 1) * 0.5;
        const patchStrength = (1 - deepT) * 0.16 * patch;

        const color = sandbedColor.clone()
          .lerp(shoalColor, shoalT)
          .lerp(lagoonColor, lagoonT)
          .lerp(shelfColor, deepT * 0.75)
          .lerp(deepColor, deepT * 0.92)
          .lerp(new THREE.Color("#ffffff"), patchStrength * 0.2)
          .lerp(new THREE.Color("#0f2e50"), deepT * patch * 0.14);

        const baseDepth = -0.095 - smoothstep(0, radius * 3.8, distanceFromShore) * 0.42;
        const duneNoise = noise(x * 0.65, z * 0.65, 9) * 0.018 * (1 - deepT * 0.85);
        const seabedDepth = baseDepth + duneNoise;

        vertices.push(quantize(x), quantize(seabedDepth), quantize(z));
        colors.push(color.r, color.g, color.b);
      }
    }

    const vertsPerRow = gridSegments + 1;
    for (let zi = 0; zi < gridSegments; zi++) {
      for (let xi = 0; xi < gridSegments; xi++) {
        const curr = zi * vertsPerRow + xi;
        const next = curr + vertsPerRow;

        indices.push(curr, next, curr + 1);
        indices.push(curr + 1, next, next + 1);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [radius, shorelineProfile]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        roughness={0.9}
        metalness={0.02}
      />
    </mesh>
  );
}

function angleToRad(angleDeg: number): number {
  return ((angleDeg - 90) * Math.PI) / 180;
}

function normalize360(angleDeg: number): number {
  return ((angleDeg % 360) + 360) % 360;
}

function smoothCircular(values: number[], passes: number): number[] {
  let result = [...values];
  for (let pass = 0; pass < passes; pass++) {
    result = result.map((value, index) => {
      const prev = result[(index - 1 + result.length) % result.length];
      const next = result[(index + 1) % result.length];
      return value * 0.65 + prev * 0.175 + next * 0.175;
    });
  }
  return result;
}

function buildSmoothLayerProfile(values: number[], maxRadius: number, resolution = 720): SmoothLayerProfile {
  const n = values.length;
  const categoryStep = 360 / n;
  const stepDeg = 360 / resolution;

  const anchorPoints = values.map((value, index) => {
    const clamped = Math.max(0, Math.min(value, 100));
    const radius = (clamped / 100) * maxRadius;
    const rad = angleToRad(index * categoryStep);
    return new THREE.Vector3(Math.cos(rad) * radius, 0, Math.sin(rad) * radius);
  });

  const curve = new THREE.CatmullRomCurve3(anchorPoints, true, "catmullrom", 0.35);
  const densePoints = curve.getPoints(resolution * 3);

  const sumBuckets = new Array<number>(resolution).fill(0);
  const countBuckets = new Array<number>(resolution).fill(0);

  for (const point of densePoints) {
    const radius = Math.sqrt(point.x * point.x + point.z * point.z);
    const angle = normalize360((Math.atan2(point.z, point.x) * 180) / Math.PI + 90);
    const bucket = Math.floor(angle / stepDeg) % resolution;
    sumBuckets[bucket] += radius;
    countBuckets[bucket] += 1;
  }

  const rawRadii = sumBuckets.map((sum, index) => {
    if (countBuckets[index] > 0) {
      return Math.min(maxRadius, Math.max(0, sum / countBuckets[index]));
    }
    return 0;
  });

  // Fill sparse buckets from neighbors then smooth to remove tiny angular jitter.
  for (let index = 0; index < rawRadii.length; index++) {
    if (rawRadii[index] !== 0) continue;
    const prev = rawRadii[(index - 1 + rawRadii.length) % rawRadii.length];
    const next = rawRadii[(index + 1) % rawRadii.length];
    rawRadii[index] = (prev + next) * 0.5;
  }

  const radii = smoothCircular(rawRadii, 2).map((radius) => Math.min(maxRadius, Math.max(0, radius)));
  return { radii, stepDeg };
}

function sampleLayerRadius(profile: SmoothLayerProfile, angleDeg: number): number {
  const normalized = normalize360(angleDeg);
  const indexFloat = normalized / profile.stepDeg;
  const indexA = Math.floor(indexFloat) % profile.radii.length;
  const indexB = (indexA + 1) % profile.radii.length;
  const t = indexFloat - Math.floor(indexFloat);
  return profile.radii[indexA] * (1 - t) + profile.radii[indexB] * t;
}

function makeLayerLineGeometry(profile: SmoothLayerProfile, y: number): THREE.BufferGeometry {
  const points = profile.radii.map((radius, index) => {
    const angle = index * profile.stepDeg;
    const rad = angleToRad(angle);
    return new THREE.Vector3(
      quantize(Math.cos(rad) * radius),
      quantize(y),
      quantize(Math.sin(rad) * radius)
    );
  });

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return geometry;
}

/** Main island terrain mesh - layered like 2D visualization */
function IslandTerrain({
  categoryMetrics,
  maxRadius
}: {
  categoryMetrics: CategoryMetrics[];
  maxRadius: number;
}) {
  // Extract layer values for interpolation
  const sandValues = categoryMetrics.map(m => m.sand);
  const solidValues = categoryMetrics.map(m => m.solid);
  const concreteValues = categoryMetrics.map(m => m.concrete);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const radialSegments = 320;
    const ringSegments = 108;

    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];

    // Colors - matching 2D visualization
    const sandColor = new THREE.Color("#d4a574");
    const sandDarkColor = new THREE.Color("#c49564");
    const grassColor = new THREE.Color("#3da84a"); // Match 2D solid green
    const grassDarkColor = new THREE.Color("#2d8838");
    const concreteColor = new THREE.Color("#8A9CAA"); // Match 2D concrete
    const concreteDarkColor = new THREE.Color("#6a7a8a");
    const earthColor = new THREE.Color("#5a4534");

    // Height constants - layered structure
    const CONCRETE_HEIGHT = 0.35;   // Concrete plateau (top layer)
    const SOLID_HEIGHT = 0.18;      // Solid/grass terrain (middle layer)
    const SAND_HEIGHT = 0.03;       // Sand beach (bottom layer)
    const WATER_HEIGHT = -0.02;

    const sandProfile = buildSmoothLayerProfile(sandValues, maxRadius, radialSegments);
    const solidProfile = buildSmoothLayerProfile(solidValues, maxRadius, radialSegments);
    const concreteProfile = buildSmoothLayerProfile(concreteValues, maxRadius, radialSegments);

    for (let ring = 0; ring <= ringSegments; ring++) {
      const ringT = ring / ringSegments;

      for (let seg = 0; seg <= radialSegments; seg++) {
        const angle = (seg / radialSegments) * 360;
        const rad = (angle - 90) * Math.PI / 180;

        // Calculate radii - these define the EXTENT of each layer
        const sandRadius = sampleLayerRadius(sandProfile, angle);
        const solidRadius = sampleLayerRadius(solidProfile, angle);
        const concreteRadius = sampleLayerRadius(concreteProfile, angle);

        // The island extends to the maximum of all layers
        const outerRadius = Math.max(sandRadius, solidRadius, concreteRadius);
        const radialDistance = ringT * outerRadius;

        let height = SAND_HEIGHT;
        let color = sandColor.clone();

        // All generated vertices are island vertices by construction.
        // Determine visual layer with the same radius-based rules as the 2D profile.
        const onConcrete = radialDistance <= concreteRadius && concreteRadius > 0.01;
        const onSolid = radialDistance <= solidRadius && solidRadius > 0.01;
        const onSand = radialDistance <= sandRadius;

        if (onConcrete) {
          // CONCRETE LAYER - raised plateau
          const distFromEdge = concreteRadius - radialDistance;
          const edgeWidth = Math.min(0.12, concreteRadius * 0.3);

          if (distFromEdge < edgeWidth && concreteRadius > 0.05) {
            const edgeT = distFromEdge / edgeWidth;
            const smoothEdge = edgeT * edgeT * (3 - 2 * edgeT);

            height = SOLID_HEIGHT + (CONCRETE_HEIGHT - SOLID_HEIGHT) * smoothEdge;

            const colorVar = noise(radialDistance * 8, angle * 0.08, 2) * 0.5 + 0.5;
            color = grassColor.clone().lerp(concreteColor, smoothEdge);
            color.lerp(earthColor, (1 - smoothEdge) * 0.3 * colorVar);
          } else {
            height = CONCRETE_HEIGHT;
            const textureNoise = noise(radialDistance * 5, angle * 0.05, 1) * 0.006;
            height += textureNoise;

            const colorVar = noise(radialDistance * 8, angle * 0.08, 2) * 0.5 + 0.5;
            color = concreteColor.clone().lerp(concreteDarkColor, colorVar * 0.2);
          }
        } else if (onSolid) {
          // SOLID/GRASS LAYER - the green terrain between concrete and sand
          const innerBound = concreteRadius;
          const outerBound = solidRadius;
          const span = Math.max(outerBound - innerBound, 0.01);
          const t = (radialDistance - innerBound) / span;

          const startH = concreteRadius > 0.01 ? SOLID_HEIGHT : SOLID_HEIGHT + 0.05;
          const endH = SAND_HEIGHT + 0.04;
          const slopeT = t * t * (3 - 2 * t);
          height = startH * (1 - slopeT) + endH * slopeT;

          const hillNoise = noise(radialDistance * 4, angle * 0.04, 3) * 0.02;
          height += hillNoise * (1 - t * 0.5);

          const colorVar = noise(radialDistance * 6, angle * 0.06, 4) * 0.5 + 0.5;
          color = grassColor.clone().lerp(grassDarkColor, colorVar * 0.35);
        } else if (onSand) {
          // SAND/BEACH LAYER - outer ring
          const innerBound = Math.max(solidRadius, concreteRadius);
          const span = Math.max(sandRadius - innerBound, 0.01);
          const t = (radialDistance - innerBound) / span;

          const startH = innerBound > 0.01 ? SAND_HEIGHT + 0.03 : SAND_HEIGHT + 0.08;
          height = startH * (1 - t) + SAND_HEIGHT * t;

          if (t > 0.85) {
            const waterT = (t - 0.85) / 0.15;
            height = height * (1 - waterT * waterT) + WATER_HEIGHT * (waterT * waterT);
          }

          const colorVar = noise(radialDistance * 10, angle * 0.1, 5) * 0.5 + 0.5;
          color = sandColor.clone().lerp(sandDarkColor, colorVar * 0.25);
        }

        // If there is no meaningful sand apron under the outer edge, synthesize one
        // by tapering the final band down to water. This closes visible edge gaps
        // without introducing skirt/wall geometry.
        const sandApronWidth = sandRadius - Math.max(solidRadius, concreteRadius);
        if (sandApronWidth < 0.025 && outerRadius > 0.01) {
          const syntheticBand = Math.max(outerRadius * 0.14, 0.065);
          const syntheticStart = Math.max(0, outerRadius - syntheticBand);
          const edgeT = smoothstep(syntheticStart, outerRadius, radialDistance);
          const edgeBlend = edgeT * edgeT;

          height = height * (1 - edgeBlend) + WATER_HEIGHT * edgeBlend;
          color.lerp(sandDarkColor, edgeT * 0.28);
        }

        const x = quantize(radialDistance * Math.cos(rad));
        const z = quantize(radialDistance * Math.sin(rad));
        const y = quantize(height);

        vertices.push(x, y, z);
        colors.push(color.r, color.g, color.b);
      }
    }

    const vertsPerRing = radialSegments + 1;
    // Build triangle indices directly - no mask clipping.
    for (let ring = 0; ring < ringSegments; ring++) {
      for (let seg = 0; seg < radialSegments; seg++) {
        const curr = ring * vertsPerRing + seg;
        const next = curr + vertsPerRing;
        const a = curr;
        const b = next;
        const c = curr + 1;
        const d = next + 1;

        indices.push(a, b, c);
        indices.push(c, b, d);
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, [sandValues, solidValues, concreteValues, maxRadius]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        side={THREE.DoubleSide}
        roughness={0.75}
        metalness={0.02}
      />
    </mesh>
  );
}

function LayerContours({
  categoryMetrics,
  maxRadius
}: {
  categoryMetrics: CategoryMetrics[];
  maxRadius: number;
}) {
  const sandValues = categoryMetrics.map((metric) => metric.sand);
  const solidValues = categoryMetrics.map((metric) => metric.solid);
  const concreteValues = categoryMetrics.map((metric) => metric.concrete);

  const sandLine = useMemo(
    () => makeLayerLineGeometry(buildSmoothLayerProfile(sandValues, maxRadius, 256), 0.048),
    [maxRadius, sandValues]
  );
  const solidLine = useMemo(
    () => makeLayerLineGeometry(buildSmoothLayerProfile(solidValues, maxRadius, 256), 0.2),
    [maxRadius, solidValues]
  );
  const concreteLine = useMemo(
    () => makeLayerLineGeometry(buildSmoothLayerProfile(concreteValues, maxRadius, 256), 0.37),
    [concreteValues, maxRadius]
  );

  return (
    <group>
      <lineLoop geometry={sandLine}>
        <lineBasicMaterial color="#f4b34d" transparent opacity={0.72} />
      </lineLoop>
      <lineLoop geometry={solidLine}>
        <lineBasicMaterial color="#56be64" transparent opacity={0.62} />
      </lineLoop>
      <lineLoop geometry={concreteLine}>
        <lineBasicMaterial color="#a1b2c0" transparent opacity={0.72} />
      </lineLoop>
    </group>
  );
}

/** Category labels around the island */
function CategoryLabels({
  categoryMetrics,
  maxRadius,
  hoveredIndex,
  onHover
}: {
  categoryMetrics: CategoryMetrics[];
  maxRadius: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}) {
  const n = categoryMetrics.length;

  return (
    <group>
      {CATEGORY_ORDER.map((category, idx) => {
        const metrics = categoryMetrics[idx];
        const angle = idx * (360 / n);
        const rad = (angle - 90) * Math.PI / 180;

        const outerVal = Math.max(metrics.sand, metrics.solid, metrics.concrete, 25);
        const labelRadius = (outerVal / 100) * maxRadius + 0.45;

        const x = labelRadius * Math.cos(rad);
        const z = labelRadius * Math.sin(rad);

        const isHovered = hoveredIndex === idx;

        return (
          <Html
            key={category}
            position={[x, 0.1, z]}
            center
            style={{ pointerEvents: "auto" }}
            onPointerEnter={() => onHover(idx)}
            onPointerLeave={() => onHover(null)}
          >
            <div
              className={`font-mono text-[9px] whitespace-nowrap cursor-default select-none transition-all ${
                isHovered ? "text-[#071732] font-bold scale-110" : "text-[#0a2244]"
              }`}
            >
              {categoryLabels[category]}
            </div>
          </Html>
        );
      })}
    </group>
  );
}

/** Tooltip for hovered category */
function MetricsTooltip({
  category,
  metrics
}: {
  category: CategoryKey;
  metrics: CategoryMetrics;
}) {
  return (
    <Html position={[0, 0.7, 0]} center>
      <div className="bg-[rgba(10,20,40,0.95)] border border-[#2a4a6a] rounded-lg px-4 py-3 font-mono shadow-xl min-w-[160px]">
        <div className="text-xs font-bold text-white mb-2 border-b border-[#2a4a6a] pb-1">
          {categoryLabels[category]}
        </div>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d4a574]" />
              <span className="text-[#d4a574]">Sand</span>
            </span>
            <span className="text-[#d4a574] font-medium">{metrics.sand.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4a7c4e]" />
              <span className="text-[#4a7c4e]">Solid</span>
            </span>
            <span className="text-[#4a7c4e] font-medium">{metrics.solid.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8899aa]" />
              <span className="text-[#8899aa]">Concrete</span>
            </span>
            <span className="text-[#8899aa] font-medium">{metrics.concrete.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Html>
  );
}

/** Main scene */
function IslandScene({
  model,
  hoveredCategory,
  onHoverCategory
}: {
  model: ModelResult;
  hoveredCategory: CategoryKey | null;
  onHoverCategory?: (category: CategoryKey | null) => void;
}) {
  const maxRadius = 2;

  const categoryMetrics = useMemo((): CategoryMetrics[] => {
    return CATEGORY_ORDER.map((key) => {
      const score = model.categories[key];
      return {
        sand: score?.sand ?? 0,
        solid: score?.solid ?? 0,
        concrete: score?.concrete ?? 0
      };
    });
  }, [model]);

  const shorelineProfile = useMemo(
    () =>
      buildSmoothLayerProfile(
        categoryMetrics.map((metric) => Math.max(metric.sand, metric.solid, metric.concrete)),
        maxRadius,
        360
      ),
    [categoryMetrics, maxRadius]
  );

  const hoveredIndex = hoveredCategory
    ? CATEGORY_ORDER.indexOf(hoveredCategory)
    : null;

  const handleHover = (index: number | null) => {
    onHoverCategory?.(index === null ? null : CATEGORY_ORDER[index]);
  };

  return (
    <>
      {/* Ocean floor */}
      <OceanFloor shorelineProfile={shorelineProfile} radius={maxRadius} />

      {/* Animated ocean water */}
      <Ocean shorelineProfile={shorelineProfile} radius={maxRadius} />

      {/* Island terrain */}
      <IslandTerrain
        categoryMetrics={categoryMetrics}
        maxRadius={maxRadius}
      />

      {/* Layer contours to match 2D silhouette readability */}
      <LayerContours
        categoryMetrics={categoryMetrics}
        maxRadius={maxRadius}
      />

      {/* Category labels */}
      <CategoryLabels
        categoryMetrics={categoryMetrics}
        maxRadius={maxRadius}
        hoveredIndex={hoveredIndex}
        onHover={handleHover}
      />

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <MetricsTooltip
          category={CATEGORY_ORDER[hoveredIndex]}
          metrics={categoryMetrics[hoveredIndex]}
        />
      )}

      {/* Lighting */}
      <ambientLight intensity={0.42} />
      <directionalLight position={[5.6, 6.2, -2.2]} intensity={1.06} color="#ffd7ab" />
      <directionalLight position={[-4.6, 3.8, 4.1]} intensity={0.46} color="#93cdf8" />
      <hemisphereLight color="#93cbf2" groundColor="#1a3550" intensity={0.56} />
      <pointLight position={[0, 0.75, 0]} color="#65b9f2" intensity={0.26} distance={7.4} />
    </>
  );
}

export function Island3D({
  model,
  size = 480,
  hoveredCategory,
  onHoverCategory
}: Island3DProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ width: "100%", maxWidth: size, height: size }}
        className="mx-auto flex items-center justify-center rounded-lg bg-[#0a1628]"
      >
        <span className="text-[#4a6a8a] font-mono text-sm">Loading 3D view...</span>
      </div>
    );
  }

  return (
    <div
      style={{ width: "100%", maxWidth: size, height: size }}
      className="mx-auto overflow-hidden rounded-lg"
      onMouseLeave={() => onHoverCategory?.(null)}
    >
      <Canvas
        camera={{
          position: [2.5, 2.8, 2.5],
          fov: 45,
          near: 0.1,
          far: 100
        }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#051328" }}
      >
        <IslandScene
          model={model}
          hoveredCategory={hoveredCategory}
          onHoverCategory={onHoverCategory}
        />
        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={7}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2.3}
          enableDamping
          dampingFactor={0.05}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}
