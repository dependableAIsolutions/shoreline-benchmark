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
  const matches = [...response.matchAll(/ANSWER\s*:\s*([^\n]*)/gi)];
  if (matches.length === 0) return null;

  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const match = matches[i];
    const candidate = (match[1] ?? "").trim().replace(/^[*_`~\s-]+|[*_`~\s-]+$/g, "");
    if (candidate.length > 0 && /[a-z0-9]/i.test(candidate)) return candidate;

    // Handle cases like "Final Answer:" where the value appears on the next line.
    const after = response.slice((match.index ?? 0) + match[0].length);
    const nextLine = after
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0);
    const normalizedNext = (nextLine ?? "").replace(/^[*_`~\s-]+|[*_`~\s-]+$/g, "");
    if (normalizedNext.length > 0 && /[a-z0-9]/i.test(normalizedNext)) return normalizedNext;
  }

  return null;
}

export function extractLastInteger(text: string): string | null {
  const matches = [...text.matchAll(/[-+]?\d[\d,]*/g)];
  if (matches.length === 0) return null;
  return matches[matches.length - 1][0].replaceAll(",", "");
}
