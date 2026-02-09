import { randomInt } from "node:crypto";
import { extractAnswerLine, extractLastInteger, type GeneratedTask, type TaskGenerator } from "./types";

type BoolOp = "NAND" | "NOR" | "XOR";

function applyOp(op: BoolOp, a: number, b: number): number {
  if (op === "NAND") return a & b ? 0 : 1;
  if (op === "NOR") return a | b ? 0 : 1;
  return a ^ b;
}

const OPS: BoolOp[] = ["NAND", "NOR", "XOR"];

export const booleanTask: TaskGenerator = {
  key: "bool",
  describeDifficulty(difficulty: number): string {
    return `evaluate a boolean circuit with ${difficulty} sequential gates`;
  },
  generate(difficulty: number): GeneratedTask {
    const variableNames = ["A", "B", "C", "D", "E", "F"];
    const values = new Map<string, number>();
    for (const name of variableNames) {
      values.set(name, randomInt(0, 2));
    }

    const gateCount = Math.max(2, difficulty);
    const steps: string[] = [];
    let result = values.get(variableNames[0]) ?? 0;
    steps.push("R0 = A");

    for (let i = 0; i < gateCount; i += 1) {
      const op = OPS[randomInt(0, OPS.length)];
      const rightVar = variableNames[randomInt(1, variableNames.length)];
      const rightVal = values.get(rightVar) ?? 0;
      steps.push(`R${i + 1} = ${op}(R${i}, ${rightVar})`);
      result = applyOp(op, result, rightVal);
    }

    const assignment = variableNames.map((name) => `${name}=${values.get(name) ?? 0}`).join(", ");

    return {
      category: "bool",
      difficulty,
      prompt: [
        "Evaluate the boolean expression exactly.",
        "Use definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.",
        `Inputs: ${assignment}`,
        "Compute the circuit in order:",
        ...steps,
        `Output only the final value R${gateCount} as 0 or 1.`
      ].join("\n"),
      correctAnswer: String(result),
      preview: steps.slice(0, 5).join(" | "),
      evaluate(response: string) {
        const answerText = extractAnswerLine(response) ?? response;
        const extracted = extractLastInteger(answerText) ?? "";
        const normalized = extracted === "0" || extracted === "1" ? extracted : "";

        return {
          extractedAnswer: normalized,
          isCorrect: normalized === String(result)
        };
      }
    };
  }
};
