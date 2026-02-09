import { randomInt } from "node:crypto";
import { type GeneratedTask, type TaskGenerator } from "./types";

function parseGrid(response: string): number[] {
  const digits = response.match(/[1-9]/g) ?? [];
  return digits.slice(0, 81).map((digit) => Number(digit));
}

function isSetValid(values: number[]): boolean {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.join("") === "123456789";
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateSolvedGrid(): number[][] {
  const base = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => ((r * 3 + Math.floor(r / 3) + c) % 9) + 1)
  );

  const digits = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const rowBands = shuffled([0, 1, 2]);
  const colBands = shuffled([0, 1, 2]);
  const rowOrder = rowBands.flatMap((band) => shuffled([0, 1, 2]).map((offset) => band * 3 + offset));
  const colOrder = colBands.flatMap((band) => shuffled([0, 1, 2]).map((offset) => band * 3 + offset));

  return Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => digits[base[rowOrder[r]][colOrder[c]] - 1])
  );
}

type CellConstraint = { row: number; col: number; value: number };

function generateConstraints(grid: number[][], difficulty: number): CellConstraint[] {
  const constraintCount = Math.max(2, Math.min(22, 2 + difficulty * 2));
  const indices = shuffled(Array.from({ length: 81 }, (_, idx) => idx)).slice(0, constraintCount);

  return indices
    .sort((a, b) => a - b)
    .map((idx) => {
      const row = Math.floor(idx / 9);
      const col = idx % 9;
      return {
        row: row + 1,
        col: col + 1,
        value: grid[row][col]
      };
    });
}

export const sudokuTask: TaskGenerator = {
  key: "sudoku",
  describeDifficulty(difficulty: number): string {
    const constraintCount = Math.max(2, Math.min(22, 2 + difficulty * 2));
    return `produce a solved 9x9 Sudoku grid while satisfying ${constraintCount} fixed-cell constraints`;
  },
  generate(difficulty: number): GeneratedTask {
    const solvedGrid = generateSolvedGrid();
    const constraints = generateConstraints(solvedGrid, difficulty);

    return {
      category: "sudoku",
      difficulty,
      prompt: [
        "Output a fully solved valid 9x9 Sudoku grid.",
        "Format as 9 lines with 9 digits each (1-9), no separators.",
        "Additionally, satisfy these fixed cells exactly:",
        ...constraints.map((item) => `R${item.row}C${item.col}=${item.value}`)
      ].join("\n"),
      correctAnswer: `valid solved 9x9 grid with ${constraints.length} fixed cells`,
      preview: `9x9 solved grid + ${constraints.length} fixed cells`,
      evaluate(response: string) {
        const digits = parseGrid(response);
        if (digits.length < 81) {
          return {
            extractedAnswer: `${digits.length}/81 digits`,
            isCorrect: false,
            partialScore: 0
          };
        }

        const grid: number[][] = [];
        for (let r = 0; r < 9; r += 1) {
          grid.push(digits.slice(r * 9, (r + 1) * 9));
        }

        let validRows = 0;
        let validCols = 0;
        let validBoxes = 0;

        for (let i = 0; i < 9; i += 1) {
          const row = grid[i];
          const col = grid.map((rowValues) => rowValues[i]);
          if (isSetValid(row)) validRows += 1;
          if (isSetValid(col)) validCols += 1;
        }

        for (let br = 0; br < 3; br += 1) {
          for (let bc = 0; bc < 3; bc += 1) {
            const values: number[] = [];
            for (let r = 0; r < 3; r += 1) {
              for (let c = 0; c < 3; c += 1) {
                values.push(grid[br * 3 + r][bc * 3 + c]);
              }
            }
            if (isSetValid(values)) validBoxes += 1;
          }
        }

        const fixedMatches = constraints.filter((item) => grid[item.row - 1][item.col - 1] === item.value).length;

        const structuralScore = (validRows + validCols + validBoxes) / 27;
        const fixedConstraintScore = fixedMatches / constraints.length;
        const partialScore = structuralScore * 0.75 + fixedConstraintScore * 0.25;

        return {
          extractedAnswer: `${validRows}/${validCols}/${validBoxes} fixed=${fixedMatches}/${constraints.length}`,
          isCorrect: structuralScore === 1 && fixedMatches === constraints.length,
          partialScore
        };
      }
    };
  }
};
