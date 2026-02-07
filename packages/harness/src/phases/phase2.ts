export function buildPhase2Prompt(taskPrompt: string, compact = false): string {
  if (compact) {
    return [
      taskPrompt,
      "",
      "Do not explain. Output final answer only on one line exactly as: ANSWER: <value>"
    ].join("\n");
  }

  return [
    taskPrompt,
    "",
    "Show your work. Do not use external tools, calculators, or code execution.",
    "Provide your final answer clearly on its own line prefixed with 'ANSWER:'."
  ].join("\n");
}
