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

/** Quantize to prevent hydration mismatches */
function quantize(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Deterministic noise for subtle texture variation */
function noise(x: number, y: number, seed = 0): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 113.5) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

/** Smooth interpolation between category values */
function interpolateAtAngle(values: number[], angleDeg: number): number {
  const n = values.length;
  const step = 360 / n;
  const normalized = ((angleDeg % 360) + 360) % 360;
  const catIdx = Math.floor(normalized / step);
  const nextIdx = (catIdx + 1) % n;
  const t = (normalized - catIdx * step) / step;

  // Smooth step interpolation
  const smoothT = t * t * (3 - 2 * t);
  return values[catIdx] * (1 - smoothT) + values[nextIdx] * smoothT;
}

/** Simple animated ocean - no complex waves that cause artifacts */
function Ocean({ radius }: { radius: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (meshRef.current) {
      // Very subtle bobbing motion instead of complex waves
      meshRef.current.position.y = -0.03 + Math.sin(time.current * 0.5) * 0.005;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
      <circleGeometry args={[radius * 1.6, 64]} />
      <meshStandardMaterial
        color="#1a3a5c"
        transparent
        opacity={0.9}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

/** Ocean floor/depth gradient */
function OceanFloor({ radius }: { radius: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <circleGeometry args={[radius * 1.8, 64]} />
      <meshStandardMaterial color="#0a1628" />
    </mesh>
  );
}

/** Smooth Catmull-Rom interpolation for radial values */
function smoothInterpolateAtAngle(values: number[], angleDeg: number): number {
  const n = values.length;
  const step = 360 / n;
  const normalized = ((angleDeg % 360) + 360) % 360;
  const catIdx = Math.floor(normalized / step);
  const t = (normalized - catIdx * step) / step;

  // Get four points for Catmull-Rom
  const p0 = values[((catIdx - 1) % n + n) % n];
  const p1 = values[catIdx];
  const p2 = values[(catIdx + 1) % n];
  const p3 = values[(catIdx + 2) % n];

  // Catmull-Rom interpolation
  const t2 = t * t;
  const t3 = t2 * t;

  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
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
    const radialSegments = 128;
    const ringSegments = 48;

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

    for (let ring = 0; ring <= ringSegments; ring++) {
      const ringT = ring / ringSegments;
      const baseRadius = ringT * maxRadius;

      for (let seg = 0; seg <= radialSegments; seg++) {
        const angle = (seg / radialSegments) * 360;
        const rad = (angle - 90) * Math.PI / 180;

        // Get smoothly interpolated values at this angle
        const sandVal = Math.max(0, smoothInterpolateAtAngle(sandValues, angle)) / 100;
        const solidVal = Math.max(0, smoothInterpolateAtAngle(solidValues, angle)) / 100;
        const concreteVal = Math.max(0, smoothInterpolateAtAngle(concreteValues, angle)) / 100;

        // Calculate radii - these define the EXTENT of each layer
        const sandRadius = sandVal * maxRadius;
        const solidRadius = solidVal * maxRadius;
        const concreteRadius = concreteVal * maxRadius;

        // The island extends to the maximum of all layers
        const outerRadius = Math.max(sandRadius, solidRadius, concreteRadius);

        let height = WATER_HEIGHT;
        let color = new THREE.Color("#0a1628");

        if (baseRadius <= outerRadius && outerRadius > 0.01) {
          // We're on the island - determine which layer we're on based on 2D logic
          // In 2D: sand is outer ring, solid is middle ring, concrete is inner ring
          // Each layer extends from center outward to its radius

          const onConcrete = baseRadius <= concreteRadius && concreteRadius > 0.01;
          const onSolid = baseRadius <= solidRadius && solidRadius > 0.01;
          const onSand = baseRadius <= sandRadius;

          if (onConcrete) {
            // CONCRETE LAYER - raised plateau
            // Check distance from concrete edge for cliff effect
            const distFromEdge = concreteRadius - baseRadius;
            const edgeWidth = Math.min(0.12, concreteRadius * 0.3);

            if (distFromEdge < edgeWidth && concreteRadius > 0.05) {
              // Edge of concrete - show cliff/slope with grass underneath
              const edgeT = distFromEdge / edgeWidth;
              const smoothEdge = edgeT * edgeT * (3 - 2 * edgeT);

              // Slope from solid height up to concrete height
              height = SOLID_HEIGHT + (CONCRETE_HEIGHT - SOLID_HEIGHT) * smoothEdge;

              // Blend colors: grass at bottom of cliff, concrete at top
              const colorVar = noise(baseRadius * 8, angle * 0.08, 2) * 0.5 + 0.5;
              color = grassColor.clone().lerp(concreteColor, smoothEdge);
              color.lerp(earthColor, (1 - smoothEdge) * 0.3 * colorVar);
            } else {
              // Interior concrete plateau
              height = CONCRETE_HEIGHT;
              const textureNoise = noise(baseRadius * 5, angle * 0.05, 1) * 0.006;
              height += textureNoise;

              const colorVar = noise(baseRadius * 8, angle * 0.08, 2) * 0.5 + 0.5;
              color = concreteColor.clone().lerp(concreteDarkColor, colorVar * 0.2);
            }

          } else if (onSolid) {
            // SOLID/GRASS LAYER - the green terrain between concrete and sand
            // This shows between concrete edge and solid edge
            const innerBound = concreteRadius;
            const outerBound = solidRadius;
            const span = Math.max(outerBound - innerBound, 0.01);
            const t = (baseRadius - innerBound) / span;

            // Gentle slope from near-concrete height down toward sand level
            const startH = concreteRadius > 0.01 ? SOLID_HEIGHT : SOLID_HEIGHT + 0.05;
            const endH = SAND_HEIGHT + 0.04;
            const slopeT = t * t * (3 - 2 * t); // smoothstep
            height = startH * (1 - slopeT) + endH * slopeT;

            // Rolling hills variation
            const hillNoise = noise(baseRadius * 4, angle * 0.04, 3) * 0.02;
            height += hillNoise * (1 - t * 0.5);

            // Grass color with variation
            const colorVar = noise(baseRadius * 6, angle * 0.06, 4) * 0.5 + 0.5;
            color = grassColor.clone().lerp(grassDarkColor, colorVar * 0.35);

          } else if (onSand) {
            // SAND/BEACH LAYER - outer ring
            const innerBound = Math.max(solidRadius, concreteRadius);
            const span = Math.max(sandRadius - innerBound, 0.01);
            const t = (baseRadius - innerBound) / span;

            // Beach slopes gently to water
            const startH = innerBound > 0.01 ? SAND_HEIGHT + 0.03 : SAND_HEIGHT + 0.08;
            height = startH * (1 - t) + SAND_HEIGHT * t;

            // Slope into water at the very edge
            if (t > 0.85) {
              const waterT = (t - 0.85) / 0.15;
              height = height * (1 - waterT * waterT) + WATER_HEIGHT * (waterT * waterT);
            }

            // Sand color
            const colorVar = noise(baseRadius * 10, angle * 0.1, 5) * 0.5 + 0.5;
            color = sandColor.clone().lerp(sandDarkColor, colorVar * 0.25);
          }
        }

        const x = quantize(baseRadius * Math.cos(rad));
        const z = quantize(baseRadius * Math.sin(rad));
        const y = quantize(height);

        vertices.push(x, y, z);
        colors.push(color.r, color.g, color.b);
      }
    }

    // Build triangle indices
    const vertsPerRing = radialSegments + 1;
    for (let ring = 0; ring < ringSegments; ring++) {
      for (let seg = 0; seg < radialSegments; seg++) {
        const curr = ring * vertsPerRing + seg;
        const next = curr + vertsPerRing;

        indices.push(curr, next, curr + 1);
        indices.push(curr + 1, next, next + 1);
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
                isHovered ? "text-white font-bold scale-110" : "text-[#8899aa]"
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

  const hoveredIndex = hoveredCategory
    ? CATEGORY_ORDER.indexOf(hoveredCategory)
    : null;

  const handleHover = (index: number | null) => {
    onHoverCategory?.(index === null ? null : CATEGORY_ORDER[index]);
  };

  return (
    <>
      {/* Ocean floor */}
      <OceanFloor radius={maxRadius} />

      {/* Animated ocean water */}
      <Ocean radius={maxRadius} />

      {/* Island terrain */}
      <IslandTerrain
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} />
      <directionalLight position={[-4, 6, -4]} intensity={0.3} />
      <hemisphereLight color="#b0d0f0" groundColor="#2d4a3e" intensity={0.4} />
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
        style={{ background: "linear-gradient(180deg, #1a2a4a 0%, #0a1628 100%)" }}
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
