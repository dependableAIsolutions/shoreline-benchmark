import type { CategoryKey } from "@shoreline/shared";
import { booleanTask } from "./boolean";
import { combinatoricsTask } from "./combinatorics";
import { constrainedTask } from "./constrained";
import { countingTask } from "./counting";
import { distributionTask } from "./distribution";
import { matrixTask } from "./matrix";
import { modularExpTask } from "./modular-exp";
import { multiplicationTask } from "./multiplication";
import { randomSequenceTask } from "./random-seq";
import { selfReferentialTask } from "./self-referential";
import { sudokuTask } from "./sudoku";
import type { TaskGenerator } from "./types";

export const TASK_GENERATORS: Partial<Record<CategoryKey, TaskGenerator>> = {
  mult: multiplicationTask,
  modexp: modularExpTask,
  bool: booleanTask,
  matrix: matrixTask,
  combo: combinatoricsTask,
  random: randomSequenceTask,
  constrained: constrainedTask,
  sudoku: sudokuTask,
  distrib: distributionTask,
  selfref: selfReferentialTask,
  counting: countingTask
};

export const IMPLEMENTED_CATEGORIES = Object.keys(TASK_GENERATORS) as CategoryKey[];

export * from "./types";
