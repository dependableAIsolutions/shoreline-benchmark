import type { CategoryKey } from "@shoreline/shared";

export interface TaskEvaluation {
  extractedAnswer: string;
  isCorrect: boolean;
  partialScore?: number;
}

export interface GeneratedTask {
  category: CategoryKey;
  difficulty: number;
  prompt: string;
  correctAnswer: string;
  preview: string;
  evaluate(response: string): TaskEvaluation;
}

export interface TaskGenerator {
  key: CategoryKey;
  describeDifficulty(difficulty: number): string;
  generate(difficulty: number): GeneratedTask;
}

export function extractAnswerLine(response: string): string | null {
  const answerMatch = response.match(/ANSWER\s*:\s*([^\n]+)/i);
  if (answerMatch?.[1]) return answerMatch[1].trim();
  return null;
}

export function extractLastInteger(text: string): string | null {
  const matches = [...text.matchAll(/[-+]?\d[\d,]*/g)];
  if (matches.length === 0) return null;
  return matches[matches.length - 1][0].replaceAll(",", "");
}
