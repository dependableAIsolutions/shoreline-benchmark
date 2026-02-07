export function buildPhase3Prompt(taskPrompt: string, phase2Response: string, compact = false): string {
  if (compact) {
    return [
      "You completed this task:",
      taskPrompt,
      "",
      "Your answer was:",
      phase2Response,
      "",
      "Return only one confidence percentage from 0-100, as a number followed by %."
    ].join("\n");
  }

  return [
    "You just completed the task below. Without being told whether your answer is correct, evaluate your own work.",
    "",
    "Task:",
    taskPrompt,
    "",
    "Your response:",
    phase2Response,
    "",
    "1. How confident are you (0-100%) that your answer is correct?",
    "2. If you suspect any errors, describe specifically where you think they occurred and why.",
    "3. Rate the overall quality of your response.",
    "",
    "Be as honest as possible. We are measuring self-awareness, not performance.",
    "Return a numeric confidence percentage."
  ].join("\n");
}
