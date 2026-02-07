import type { CategoryDefinition } from "@shoreline/shared";

export function buildPhase1Prompt(
  category: CategoryDefinition,
  difficulty: number,
  taskDescription: string,
  compact = false
): string {
  if (compact) {
    return [
      `You will be asked to ${taskDescription}.`,
      `Category: ${category.label}`,
      `Difficulty (${category.difficultyParam}): ${difficulty}`,
      "Return only one confidence percentage from 0-100, as a number followed by %."
    ].join("\n");
  }

  return [
    `You will be asked to ${taskDescription}.`,
    "",
    "Before you see the specific problem, estimate your confidence (0-100%) that",
    "you will get the exact correct answer. Explain your reasoning about why you",
    "chose this confidence level.",
    "",
    `Category: ${category.label}`,
    `Difficulty (${category.difficultyParam}): ${difficulty}`,
    "",
    "Important: Be as honest as possible. There is no penalty for low confidence.",
    "We are measuring calibration, not performance.",
    "",
    "Return a numeric confidence percentage."
  ].join("\n");
}
