import { CATEGORY_ORDER, type CategoryKey, type ModelResult } from "./types";

export function orderedCategoryScores(model: ModelResult) {
  return CATEGORY_ORDER.map((key) => model.categories[key]);
}

export function layerValuesByCategory(model: ModelResult): {
  categories: CategoryKey[];
  sand: number[];
  solid: number[];
  concrete: number[];
} {
  const categories = CATEGORY_ORDER;
  return {
    categories,
    sand: categories.map((key) => model.categories[key]?.sand ?? 0),
    solid: categories.map((key) => model.categories[key]?.solid ?? 0),
    concrete: categories.map((key) => model.categories[key]?.concrete ?? 0)
  };
}

export function formatMetric(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}

export function severityColor(value: number): string {
  if (value <= 5) return "#4ADE80";
  if (value <= 12) return "#FBBF24";
  return "#F87171";
}
