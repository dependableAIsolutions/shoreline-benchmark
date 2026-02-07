import { type GeneratedTask, type TaskGenerator } from "./types";

function parseGrid(response: string): number[] {
  const digits = response.match(/[1-9]/g) ?? [];
  return digits.slice(0, 81).map((digit) => Number(digit));
}

function isSetValid(values: number[]): boolean {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.join("") === "123456789";
}

export const sudokuTask: TaskGenerator = {
  key: "sudoku",
  describeDifficulty(difficulty: number): string {
    return `produce a valid completed 9x9 Sudoku grid under strict formatting (difficulty ${difficulty})`;
  },
  generate(difficulty: number): GeneratedTask {
    return {
      category: "sudoku",
      difficulty,
      prompt: [
        "Output a fully solved valid 9x9 Sudoku grid.",
        "Format as 9 lines with 9 digits each (1-9), no separators."
      ].join("\n"),
      correctAnswer: "any valid solved 9x9 Sudoku grid",
      preview: "9x9 solved Sudoku",
      evaluate(response: string) {
        const digits = parseGrid(response);
        if (digits.length < 81) {
          return { extractedAnswer: `${digits.length}/81 digits`, isCorrect: false, partialScore: 0 };
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

        const partialScore = (validRows + validCols + validBoxes) / 27;

        return {
          extractedAnswer: `${validRows}/${validCols}/${validBoxes}`,
          isCorrect: partialScore === 1,
          partialScore
        };
      }
    };
  }
};
