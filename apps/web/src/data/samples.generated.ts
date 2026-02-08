import type { CategoryKey } from "@shoreline/shared";

export interface SampleResult {
  category: CategoryKey;
  difficulty: number;
  phase1: { prompt: string; response: string; confidence: number | null };
  phase2: { prompt: string; response: string; extractedAnswer: string; correctAnswer: string; isCorrect: boolean; partialScore?: number };
  phase3: { prompt: string; response: string; confidence: number | null };
  pattern: "true_positive" | "true_negative" | "false_confidence" | "blind_spot";
  patternLabel: string;
}

export const samplesByModel: Record<string, SampleResult[]> = {
  "x-ai/grok-4.1-fast": [
    {
      "category": "mult",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to multiply two 26-digit integers.\nCategory: Multiplication\nDifficulty (digitCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Multiply 45044977448248953404284578 by 10525125296260101583022117.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 474305069923406047114425013586943954095040626878401470726011626",
        "extractedAnswer": "474305069923406047114425013586943954095040626878401470726011626",
        "correctAnswer": "474104031610030860322446039815255667822729536011626",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nMultiply 45044977448248953404284578 by 10525125296260101583022117.\n\nYour answer was:\nANSWER: 474305069923406047114425013586943954095040626878401470726011626\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "0%",
        "confidence": 0
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    },
    {
      "category": "modexp",
      "difficulty": 34,
      "phase1": {
        "prompt": "You will be asked to compute modular exponentiation with ~34-bit integers.\nCategory: Modular Exponentiation\nDifficulty (bitSize): 34\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Compute (8613061757 ^ 922499) mod 14994819949.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 6104531444",
        "extractedAnswer": "6104531444",
        "correctAnswer": "3673843033",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nCompute (8613061757 ^ 922499) mod 14994819949.\n\nYour answer was:\nANSWER: 6104531444\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "bool",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to evaluate a boolean circuit with 26 sequential gates.\nCategory: Boolean Circuits\nDifficulty (gateCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Evaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=1, B=0, C=0, D=0, E=0, F=1\nExpression: ((((((((((((((((((((((((((A NAND B) NAND F) XOR F) NOR E) XOR F) NAND C) NOR E) XOR C) XOR D) NAND F) NAND C) XOR E) NOR B) XOR D) NOR B) NAND C) NOR E) XOR D) XOR C) XOR C) NAND B) NAND D) NOR F) XOR D) NOR C) NOR D)\nOutput only 0 or 1.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 0",
        "extractedAnswer": "0",
        "correctAnswer": "0",
        "isCorrect": true
      },
      "phase3": {
        "prompt": "You completed this task:\nEvaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=1, B=0, C=0, D=0, E=0, F=1\nExpression: ((((((((((((((((((((((((((A NAND B) NAND F) XOR F) NOR E) XOR F) NAND C) NOR E) XOR C) XOR D) NAND F) NAND C) XOR E) NOR B) XOR D) NOR B) NAND C) NOR E) XOR D) XOR C) XOR C) NAND B) NAND D) NOR F) XOR D) NOR C) NOR D)\nOutput only 0 or 1.\n\nYour answer was:\nANSWER: 0\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "true_positive",
      "patternLabel": "Correct + Confident (True Positive)"
    },
    {
      "category": "matrix",
      "difficulty": 7,
      "phase1": {
        "prompt": "You will be asked to compute exact determinant of a 7x7 integer matrix.\nCategory: Matrix Determinants\nDifficulty (matrixSize): 7\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Find the determinant of the matrix: [[-4,6,9,-7,-8,-2],[-9,-3,4,-4,5,1],[2,-1,2,-6,-3,-1],[3,9,3,-2,1,-8],[-7,0,3,-5,-3,-8],[-4,5,3,-8,9,-1]].\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 364493",
        "extractedAnswer": "364493",
        "correctAnswer": "364493",
        "isCorrect": true
      },
      "phase3": {
        "prompt": "You completed this task:\nFind the determinant of the matrix: [[-4,6,9,-7,-8,-2],[-9,-3,4,-4,5,1],[2,-1,2,-6,-3,-1],[3,9,3,-2,1,-8],[-7,0,3,-5,-3,-8],[-4,5,3,-8,9,-1]].\n\nYour answer was:\nANSWER: 364493\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "true_positive",
      "patternLabel": "Correct + Confident (True Positive)"
    },
    {
      "category": "combo",
      "difficulty": 11,
      "phase1": {
        "prompt": "You will be asked to count distinct permutations of a multiset string with complexity 11.\nCategory: Combinatorics\nDifficulty (constraintCount): 11\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "How many distinct permutations can be formed from the letters of \"DACFFDEBBBBDDF\"?\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 25225200",
        "extractedAnswer": "25225200",
        "correctAnswer": "25225200",
        "isCorrect": true
      },
      "phase3": {
        "prompt": "You completed this task:\nHow many distinct permutations can be formed from the letters of \"DACFFDEBBBBDDF\"?\n\nYour answer was:\nANSWER: 25225200\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "true_positive",
      "patternLabel": "Correct + Confident (True Positive)"
    },
    {
      "category": "random",
      "difficulty": 1010,
      "phase1": {
        "prompt": "You will be asked to generate a random sequence of 1010 digits.\nCategory: Random Sequence\nDifficulty (sequenceLength): 1010\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Generate exactly 1010 random digits (0-9) with no separators.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 748293105628374650927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364",
        "extractedAnswer": "74829310562837465092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092736485092",
        "correctAnswer": "statistical(random-1010)",
        "isCorrect": false,
        "partialScore": 0.4339933993399339
      },
      "phase3": {
        "prompt": "You completed this task:\nGenerate exactly 1010 random digits (0-9) with no separators.\n\nYour answer was:\nANSWER: 748293105628374650927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364850927364\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "",
        "confidence": null
      },
      "pattern": "blind_spot",
      "patternLabel": "Correct + Doubted (Blind Spot)"
    },
    {
      "category": "constrained",
      "difficulty": 11,
      "phase1": {
        "prompt": "You will be asked to write text satisfying 4 strict constraints.\nCategory: Constrained Writing\nDifficulty (constraintDepth): 11\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "85%",
        "confidence": 85
      },
      "phase2": {
        "prompt": "Write one paragraph that satisfies all constraints:\nUse exactly 74 words.\nDo not use the letter \"e\".\nDo not use the letter \"a\".\nDo not use the letter \"i\".\nInclude the exact word \"Gulf\" at least once.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: Gulf glows. Sun drops low. Clouds form. Gusts blow strong. Sky grows dusky. Moon pops out. Frogs grunt loud. Dogs howl. Boys romp. Toys bob. Logs bob. Hogs roll. Bog floods. Bus honks. Trucks chug by pub. Folks gulp grog. Storm looms. Gusts blow. Clouds bunch. Downpours gush. Brooks flood gulf. Gulf churns. Gusts howl. Booms sound. Huts flood. Folks run to knolls. Dogs yowl. Storm stops. Sun pops out. Sky glows. Gulf smooths.",
        "extractedAnswer": "2/5",
        "correctAnswer": "{\"wordCount\":74,\"banned\":[\"e\",\"a\",\"i\"],\"requiredWord\":\"Gulf\"}",
        "isCorrect": false,
        "partialScore": 0.4
      },
      "phase3": {
        "prompt": "You completed this task:\nWrite one paragraph that satisfies all constraints:\nUse exactly 74 words.\nDo not use the letter \"e\".\nDo not use the letter \"a\".\nDo not use the letter \"i\".\nInclude the exact word \"Gulf\" at least once.\n\nYour answer was:\nANSWER: Gulf glows. Sun drops low. Clouds form. Gusts blow strong. Sky grows dusky. Moon pops out. Frogs grunt loud. Dogs howl. Boys romp. Toys bob. Logs bob. Hogs roll. Bog floods. Bus honks. Trucks chug by pub. Folks gulp grog. Storm looms. Gusts blow. Clouds bunch. Downpours gush. Brooks flood gulf. Gulf churns. Gusts howl. Booms sound. Huts flood. Folks run to knolls. Dogs yowl. Storm stops. Sun pops out. Sky glows. Gulf smooths.\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "distrib",
      "difficulty": 505,
      "phase1": {
        "prompt": "You will be asked to generate 505 values approximating a normal distribution N(0,1).\nCategory: Distribution Matching\nDifficulty (sampleSize): 505\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "95%",
        "confidence": 95
      },
      "phase2": {
        "prompt": "Generate 505 real numbers sampled from a normal distribution N(0, 1). One number per line.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "-0.456782\n0.123457\n-1.234567\n0.987654\n-0.765432\n1.234567\n-0.987654\n0.456789\n-0.123456\n1.567890\n-0.234567\n0.890123\n-1.678901\n0.345678\n-0.567890\n1.234567\n-0.890123\n0.678901\n-1.012345\n0.456789\n-0.234567\n1.789012\n-0.567890\n0.123456\n-1.345678\n0.901234\n-0.678901\n1.456789\n-0.234567\n0",
        "extractedAnswer": "30/505 values",
        "correctAnswer": "distribution-fit(n=505)",
        "isCorrect": false,
        "partialScore": 0
      },
      "phase3": {
        "prompt": "You completed this task:\nGenerate 505 real numbers sampled from a normal distribution N(0, 1). One number per line.\n\nYour answer was:\n-0.456782\n0.123457\n-1.234567\n0.987654\n-0.765432\n1.234567\n-0.987654\n0.456789\n-0.123456\n1.567890\n-0.234567\n0.890123\n-1.678901\n0.345678\n-0.567890\n1.234567\n-0.890123\n0.678901\n-1.012345\n0.456789\n-0.234567\n1.789012\n-0.567890\n0.123456\n-1.345678\n0.901234\n-0.678901\n1.456789\n-0.234567\n0\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "0%",
        "confidence": 0
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    },
    {
      "category": "selfref",
      "difficulty": 11,
      "phase1": {
        "prompt": "You will be asked to produce a self-referential sentence with at least 17 words and correct self-claim.\nCategory: Self Referential\nDifficulty (propertyCount): 11\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "75%",
        "confidence": 75
      },
      "phase2": {
        "prompt": "Write one sentence that correctly states how many words it contains.\nIt must contain at least 17 words.\nInclude a phrase like 'contains X words' or 'has X words'.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: This particular sentence here contains a total of twenty words, which is more than enough to satisfy the minimum requirement.",
        "extractedAnswer": "words=21,claim=none",
        "correctAnswer": "self-consistent sentence with >=17 words",
        "isCorrect": false,
        "partialScore": 0.5
      },
      "phase3": {
        "prompt": "You completed this task:\nWrite one sentence that correctly states how many words it contains.\nIt must contain at least 17 words.\nInclude a phrase like 'contains X words' or 'has X words'.\n\nYour answer was:\nANSWER: This particular sentence here contains a total of twenty words, which is more than enough to satisfy the minimum requirement.\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    }
  ],
  "google/gemini-3-flash-preview": [
    {
      "category": "mult",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to multiply two 26-digit integers.\nCategory: Multiplication\nDifficulty (digitCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "0%",
        "confidence": 0
      },
      "phase2": {
        "prompt": "Multiply 44074637553942353696206147 by 25702614131599889460855398.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 1132833355593881476906232537750730722307842247551706",
        "extractedAnswer": "1132833355593881476906232537750730722307842247551706",
        "correctAnswer": "1132833402039101925431139751215576548039537965731506",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nMultiply 44074637553942353696206147 by 25702614131599889460855398.\n\nYour answer was:\nANSWER: 1132833355593881476906232537750730722307842247551706\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "modexp",
      "difficulty": 34,
      "phase1": {
        "prompt": "You will be asked to compute modular exponentiation with ~34-bit integers.\nCategory: Modular Exponentiation\nDifficulty (bitSize): 34\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "85%",
        "confidence": 85
      },
      "phase2": {
        "prompt": "Compute (16600554019 ^ 919564) mod 12388554119.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 1",
        "extractedAnswer": "1",
        "correctAnswer": "1591033519",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nCompute (16600554019 ^ 919564) mod 12388554119.\n\nYour answer was:\nANSWER: 1\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "bool",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to evaluate a boolean circuit with 26 sequential gates.\nCategory: Boolean Circuits\nDifficulty (gateCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "85%",
        "confidence": 85
      },
      "phase2": {
        "prompt": "Evaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=1, B=0, C=0, D=1, E=1, F=1\nExpression: ((((((((((((((((((((((((((A XOR E) XOR F) NAND C) NOR E) XOR C) NOR F) XOR B) XOR C) NAND B) NOR E) NOR D) NOR F) NAND C) XOR B) XOR B) NAND C) XOR E) NOR F) NOR C) XOR F) XOR F) NAND C) NOR D) XOR D) XOR C) NOR F)\nOutput only 0 or 1.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 1",
        "extractedAnswer": "1",
        "correctAnswer": "0",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nEvaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=1, B=0, C=0, D=1, E=1, F=1\nExpression: ((((((((((((((((((((((((((A XOR E) XOR F) NAND C) NOR E) XOR C) NOR F) XOR B) XOR C) NAND B) NOR E) NOR D) NOR F) NAND C) XOR B) XOR B) NAND C) XOR E) NOR F) NOR C) XOR F) XOR F) NAND C) NOR D) XOR D) XOR C) NOR F)\nOutput only 0 or 1.\n\nYour answer was:\nANSWER: 1\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "sudoku",
      "difficulty": 6,
      "phase1": {
        "prompt": "You will be asked to produce a valid completed 9x9 Sudoku grid under strict formatting (difficulty 6).\nCategory: Sudoku Generation\nDifficulty (gridComplexity): 6\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Output a fully solved valid 9x9 Sudoku grid.\nFormat as 9 lines with 9 digits each (1-9), no separators.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 534678912672195348198342567859761423426853791713924856961537284287419635345286179",
        "extractedAnswer": "9/9/9",
        "correctAnswer": "any valid solved 9x9 Sudoku grid",
        "isCorrect": true,
        "partialScore": 1
      },
      "phase3": {
        "prompt": "You completed this task:\nOutput a fully solved valid 9x9 Sudoku grid.\nFormat as 9 lines with 9 digits each (1-9), no separators.\n\nYour answer was:\nANSWER: 534678912672195348198342567859761423426853791713924856961537284287419635345286179\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "true_positive",
      "patternLabel": "Correct + Confident (True Positive)"
    },
    {
      "category": "distrib",
      "difficulty": 505,
      "phase1": {
        "prompt": "You will be asked to generate 505 values approximating a normal distribution N(0,1).\nCategory: Distribution Matching\nDifficulty (sampleSize): 505\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "98%",
        "confidence": 98
      },
      "phase2": {
        "prompt": "Generate 505 real numbers sampled from a normal distribution N(0, 1). One number per line.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "I cannot generate 505 individual numbers in a single line while maintaining the required \"ANSWER: <value>\" format effectively, but here is the requested sample of 505 values from $N(0, 1)$ formatted one per line.\n\nANSWER: \n-1.353\n0.821\n-0.452\n1.104\n-0.128\n0.654\n-1.892\n0.342\n-0.771\n1.423\n-0.556\n0.012\n0.987\n-1.214\n0.445\n-0.678\n2.103\n-0.334\n0.889\n-1.121\n0.567\n-0.043\n1.332\n-0.876\n0.221\n-1.454\n0.789\n-0.232\n1.005\n-0.665\n0.432\n-1.987\n0.112\n-0.543\n1.675\n-0.901\n0.345\n-1.112\n0.776\n-0.443\n1.234\n-0.887\n0.009\n-1.334\n0.554\n-0.212\n1.898\n-0.765\n0.123\n-1.554\n0.667\n-0.345\n1.443\n-0.998\n0.211\n-1.223\n0.876\n-0.554\n1.112\n-0.675\n0.334\n-1.887\n0.098\n-0.443\n1.554\n-0.776\n0.456\n-1.009\n0.887\n-0.332\n1.345\n-0.998\n0.112\n-1.443\n0.776\n-0.221\n1.009\n-0.554\n0.443\n-1.776\n0.223\n-0.665\n1.887\n-0.998\n0.334\n-1.221\n0.887\n-0.443\n1.112\n-0.776\n0.554\n-1.998\n0.001\n-0.332\n1.443\n-0.887\n0.556\n-1.112\n0.778\n-0.223\n1.334\n-0.998\n0.111\n-1.554\n0.667\n-0.443\n1.221\n-0.776\n0.334\n-1.887\n0.221\n-0.554\n1.667\n-0.887\n0.443\n-1.112\n0.998\n-0.334\n1.443\n-0.776\n0.221\n-1.334\n0.887\n-0.554\n1.112\n-0.667\n0.443\n-1.998\n0.112\n-0.443\n1.776\n-0.887\n0.334\n-1.009\n0.776\n-0.221\n1.554\n-0.998\n0.443\n-1.443\n0.887\n-0.334\n1.221\n-0.667\n0.554\n-1.887\n0.002\n-0.554\n1.334\n-0.776\n0.443\n-1.112\n0.998\n-0.221\n1.667\n-0.887\n0.334\n-1.554\n0.776\n-0.443\n1.009\n-0.667\n0.554\n-1.998\n0.112\n-0.334\n1.443\n-0.776\n0.443\n-1.221\n0.887\n-0.554\n1.334\n-0.998\n0.221\n-1.667\n0.776\n-0.334\n1.112\n-0.887\n0.443\n-1.443\n0.998\n-0.554\n1.221\n-0.776\n0.334\n-1.887\n0.112\n-0.443\n1.554\n-0.998\n0.443\n-1.112\n0.887\n-0.221\n1.334\n-0.776\n0.554\n-1.667\n0.998\n-0.334\n1.221\n-0.887\n0.443\n-1.998\n0.221\n-0.554\n1.443\n-0.776\n0.334\n-1.112\n0.887\n-0.443\n1.554\n-0.998\n0.112\n-1.334\n0.776\n-0.554\n1.221\n-0.667\n0.443\n-1.887\n0.334\n-0.443\n1.667\n-0.776\n0.554\n-1.112\n0.998\n-0.221\n1.443\n-0.887\n0.334\n-1.554\n0.776\n-0.443\n1.112\n-0.998\n0.221\n-1.443\n0.887\n-0.554\n1.334\n-0.776\n0.443\n-1.998\n0.112\n-0.334\n1.554\n-0.887\n0.443\n-1.221\n0.776\n-0.554\n1.667\n-0.998\n0.334\n-1.443\n0.887\n-0.221\n1.112\n-0.776\n0.554\n-1.887\n0.112\n-0.443\n1.334\n-0.998\n0.443\n-1.554\n0.776\n-0.334\n1.221\n-0.887\n0.554\n-1.998\n0.221\n-0.554\n1.443\n-0.776\n0.334\n-1.112\n0.998\n-0.443\n1.667\n-0.887\n0.112\n-1.334\n0.776\n-0.554\n1.221\n-0.667\n0.443\n-1.887\n0.334\n-0.443\n1.554\n-0.776\n0.554\n-1.112\n0.998\n-0.221\n1.443\n-0.88",
        "extractedAnswer": "310/505 values",
        "correctAnswer": "distribution-fit(n=505)",
        "isCorrect": false,
        "partialScore": 0
      },
      "phase3": {
        "prompt": "You completed this task:\nGenerate 505 real numbers sampled from a normal distribution N(0, 1). One number per line.\n\nYour answer was:\nI cannot generate 505 individual numbers in a single line while maintaining the required \"ANSWER: <value>\" format effectively, but here is the requested sample of 505 values from $N(0, 1)$ formatted one per line.\n\nANSWER: \n-1.353\n0.821\n-0.452\n1.104\n-0.128\n0.654\n-1.892\n0.342\n-0.771\n1.423\n-0.556\n0.012\n0.987\n-1.214\n0.445\n-0.678\n2.103\n-0.334\n0.889\n-1.121\n0.567\n-0.043\n1.332\n-0.876\n0.221\n-1.454\n0.789\n-0.232\n1.005\n-0.665\n0.432\n-1.987\n0.112\n-0.543\n1.675\n-0.901\n0.345\n-1.112\n0.776\n-0.443\n1.234\n-0.887\n0.009\n-1.334\n0.554\n-0.212\n1.898\n-0.765\n0.123\n-1.554\n0.667\n-0.345\n1.443\n-0.998\n0.211\n-1.223\n0.876\n-0.554\n1.112\n-0.675\n0.334\n-1.887\n0.098\n-0.443\n1.554\n-0.776\n0.456\n-1.009\n0.887\n-0.332\n1.345\n-0.998\n0.112\n-1.443\n0.776\n-0.221\n1.009\n-0.554\n0.443\n-1.776\n0.223\n-0.665\n1.887\n-0.998\n0.334\n-1.221\n0.887\n-0.443\n1.112\n-0.776\n0.554\n-1.998\n0.001\n-0.332\n1.443\n-0.887\n0.556\n-1.112\n0.778\n-0.223\n1.334\n-0.998\n0.111\n-1.554\n0.667\n-0.443\n1.221\n-0.776\n0.334\n-1.887\n0.221\n-0.554\n1.667\n-0.887\n0.443\n-1.112\n0.998\n-0.334\n1.443\n-0.776\n0.221\n-1.334\n0.887\n-0.554\n1.112\n-0.667\n0.443\n-1.998\n0.112\n-0.443\n1.776\n-0.887\n0.334\n-1.009\n0.776\n-0.221\n1.554\n-0.998\n0.443\n-1.443\n0.887\n-0.334\n1.221\n-0.667\n0.554\n-1.887\n0.002\n-0.554\n1.334\n-0.776\n0.443\n-1.112\n0.998\n-0.221\n1.667\n-0.887\n0.334\n-1.554\n0.776\n-0.443\n1.009\n-0.667\n0.554\n-1.998\n0.112\n-0.334\n1.443\n-0.776\n0.443\n-1.221\n0.887\n-0.554\n1.334\n-0.998\n0.221\n-1.667\n0.776\n-0.334\n1.112\n-0.887\n0.443\n-1.443\n0.998\n-0.554\n1.221\n-0.776\n0.334\n-1.887\n0.112\n-0.443\n1.554\n-0.998\n0.443\n-1.112\n0.887\n-0.221\n1.334\n-0.776\n0.554\n-1.667\n0.998\n-0.334\n1.221\n-0.887\n0.443\n-1.998\n0.221\n-0.554\n1.443\n-0.776\n0.334\n-1.112\n0.887\n-0.443\n1.554\n-0.998\n0.112\n-1.334\n0.776\n-0.554\n1.221\n-0.667\n0.443\n-1.887\n0.334\n-0.443\n1.667\n-0.776\n0.554\n-1.112\n0.998\n-0.221\n1.443\n-0.887\n0.334\n-1.554\n0.776\n-0.443\n1.112\n-0.998\n0.221\n-1.443\n0.887\n-0.554\n1.334\n-0.776\n0.443\n-1.998\n0.112\n-0.334\n1.554\n-0.887\n0.443\n-1.221\n0.776\n-0.554\n1.667\n-0.998\n0.334\n-1.443\n0.887\n-0.221\n1.112\n-0.776\n0.554\n-1.887\n0.112\n-0.443\n1.334\n-0.998\n0.443\n-1.554\n0.776\n-0.334\n1.221\n-0.887\n0.554\n-1.998\n0.221\n-0.554\n1.443\n-0.776\n0.334\n-1.112\n0.998\n-0.443\n1.667\n-0.887\n0.112\n-1.334\n0.776\n-0.554\n1.221\n-0.667\n0.443\n-1.887\n0.334\n-0.443\n1.554\n-0.776\n0.554\n-1.112\n0.998\n-0.221\n1.443\n-0.88\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "10%",
        "confidence": 10
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    },
    {
      "category": "counting",
      "difficulty": 101,
      "phase1": {
        "prompt": "You will be asked to count target token occurrences in a passage of about 808 words.\nCategory: Counting In Context\nDifficulty (inputLength): 101\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Count exactly how many times the target word appears in the passage.\nTarget word: anchor\nPassage:\ntide signal tide shoreline response calibration drift vector shoreline island shoreline shoreline response vector bridge anchor anchor anchor truth calibration calibration anchor drift anchor bridge anchor truth vector bridge truth calibration truth signal tide drift vector response bridge drift truth signal calibration bridge bridge response vector drift calibration tide shoreline response response anchor response shoreline island response truth calibration bridge anchor model vector drift anchor bridge model signal drift signal anchor drift shoreline model bridge calibration tide signal bridge calibration calibration signal bridge model bridge calibration anchor truth anchor vector tide model shoreline signal response bridge bridge vector tide response vector drift tide drift drift drift signal anchor anchor bridge bridge model anchor model response signal calibration island signal truth calibration signal calibration anchor anchor calibration signal shoreline tide bridge calibration model anchor calibration vector signal calibration island anchor tide bridge bridge calibration shoreline drift shoreline signal tide response response drift island bridge bridge shoreline model signal tide signal island bridge bridge signal model shoreline drift anchor calibration model drift anchor model response signal bridge calibration calibration model model bridge tide anchor island vector island bridge bridge island calibration tide anchor tide vector vector anchor anchor anchor anchor model truth response tide anchor model response calibration drift truth calibration signal shoreline tide anchor signal drift signal truth signal truth calibration model bridge shoreline drift anchor drift drift vector shoreline vector bridge drift tide shoreline vector drift response anchor anchor calibration anchor response tide response bridge model calibration calibration island response shoreline island bridge shoreline island shoreline shoreline truth truth vector drift tide tide calibration truth island response tide tide response bridge bridge signal vector anchor shoreline response signal signal signal signal anchor island vector shoreline response anchor bridge bridge bridge vector vector truth drift calibration signal response calibration model truth vector island vector anchor tide bridge calibration tide anchor tide model drift bridge bridge truth response truth shoreline anchor model drift response bridge model tide tide truth tide island calibration island bridge drift drift truth drift signal shoreline calibration vector truth drift island bridge vector truth anchor truth calibration island anchor model shoreline calibration response tide shoreline shoreline truth model drift response island model model bridge model calibration drift bridge calibration island model signal vector vector signal model bridge vector tide vector bridge response island signal bridge anchor island shoreline drift signal vector tide drift anchor shoreline response drift bridge response calibration calibration shoreline truth vector island signal calibration signal signal anchor response shoreline bridge signal bridge shoreline vector tide vector truth truth response tide vector truth drift drift truth vector drift response bridge signal truth bridge calibration tide vector tide vector anchor model tide truth drift response island drift vector island shoreline island model tide tide anchor shoreline shoreline drift truth bridge vector response bridge island tide model anchor calibration shoreline vector drift vector tide calibration truth signal model island anchor calibration model tide model response island shoreline shoreline anchor truth island island drift tide shoreline signal vector shoreline drift model truth model signal vector island tide calibration tide tide vector response model truth model island model signal calibration signal bridge drift truth tide island bridge signal shoreline calibration anchor response calibration bridge anchor calibration model drift signal response response anchor model anchor calibration island anchor calibration response signal anchor response bridge tide bridge tide bridge model truth shoreline calibration drift vector model shoreline drift model truth bridge shoreline response vector bridge truth truth model shoreline shoreline calibration shoreline vector drift bridge shoreline shoreline bridge shoreline vector bridge model tide bridge signal signal model calibration drift tide model truth anchor drift tide drift island tide tide tide truth drift vector drift anchor bridge response drift island vector drift drift model signal drift truth vector tide island model drift bridge shoreline calibration vector bridge truth island truth calibration model vector vector calibration truth bridge calibration signal calibration signal bridge anchor tide calibration signal response tide tide tide drift anchor bridge shoreline model model model anchor vector anchor shoreline model truth vector anchor island model tide signal shoreline calibration response response bridge anchor response truth response drift tide calibration drift model drift calibration drift truth island tide model drift drift island island anchor bridge shoreline truth island response vector signal vector drift anchor calibration island response anchor anchor tide signal calibration truth tide bridge response island bridge island anchor tide truth anchor bridge anchor calibration drift island shoreline bridge truth bridge calibration tide signal vector vector vector shoreline calibration model calibration truth calibration signal signal anchor model drift drift vector shoreline island truth shoreline anchor island vector bridge response shoreline drift response signal model island shoreline bridge model truth signal shoreline tide model anchor anchor vector shoreline anchor signal tide vector response tide tide calibration island shoreline island vector island signal anchor model signal model truth response island bridge\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 76",
        "extractedAnswer": "76",
        "correctAnswer": "76",
        "isCorrect": true
      },
      "phase3": {
        "prompt": "You completed this task:\nCount exactly how many times the target word appears in the passage.\nTarget word: anchor\nPassage:\ntide signal tide shoreline response calibration drift vector shoreline island shoreline shoreline response vector bridge anchor anchor anchor truth calibration calibration anchor drift anchor bridge anchor truth vector bridge truth calibration truth signal tide drift vector response bridge drift truth signal calibration bridge bridge response vector drift calibration tide shoreline response response anchor response shoreline island response truth calibration bridge anchor model vector drift anchor bridge model signal drift signal anchor drift shoreline model bridge calibration tide signal bridge calibration calibration signal bridge model bridge calibration anchor truth anchor vector tide model shoreline signal response bridge bridge vector tide response vector drift tide drift drift drift signal anchor anchor bridge bridge model anchor model response signal calibration island signal truth calibration signal calibration anchor anchor calibration signal shoreline tide bridge calibration model anchor calibration vector signal calibration island anchor tide bridge bridge calibration shoreline drift shoreline signal tide response response drift island bridge bridge shoreline model signal tide signal island bridge bridge signal model shoreline drift anchor calibration model drift anchor model response signal bridge calibration calibration model model bridge tide anchor island vector island bridge bridge island calibration tide anchor tide vector vector anchor anchor anchor anchor model truth response tide anchor model response calibration drift truth calibration signal shoreline tide anchor signal drift signal truth signal truth calibration model bridge shoreline drift anchor drift drift vector shoreline vector bridge drift tide shoreline vector drift response anchor anchor calibration anchor response tide response bridge model calibration calibration island response shoreline island bridge shoreline island shoreline shoreline truth truth vector drift tide tide calibration truth island response tide tide response bridge bridge signal vector anchor shoreline response signal signal signal signal anchor island vector shoreline response anchor bridge bridge bridge vector vector truth drift calibration signal response calibration model truth vector island vector anchor tide bridge calibration tide anchor tide model drift bridge bridge truth response truth shoreline anchor model drift response bridge model tide tide truth tide island calibration island bridge drift drift truth drift signal shoreline calibration vector truth drift island bridge vector truth anchor truth calibration island anchor model shoreline calibration response tide shoreline shoreline truth model drift response island model model bridge model calibration drift bridge calibration island model signal vector vector signal model bridge vector tide vector bridge response island signal bridge anchor island shoreline drift signal vector tide drift anchor shoreline response drift bridge response calibration calibration shoreline truth vector island signal calibration signal signal anchor response shoreline bridge signal bridge shoreline vector tide vector truth truth response tide vector truth drift drift truth vector drift response bridge signal truth bridge calibration tide vector tide vector anchor model tide truth drift response island drift vector island shoreline island model tide tide anchor shoreline shoreline drift truth bridge vector response bridge island tide model anchor calibration shoreline vector drift vector tide calibration truth signal model island anchor calibration model tide model response island shoreline shoreline anchor truth island island drift tide shoreline signal vector shoreline drift model truth model signal vector island tide calibration tide tide vector response model truth model island model signal calibration signal bridge drift truth tide island bridge signal shoreline calibration anchor response calibration bridge anchor calibration model drift signal response response anchor model anchor calibration island anchor calibration response signal anchor response bridge tide bridge tide bridge model truth shoreline calibration drift vector model shoreline drift model truth bridge shoreline response vector bridge truth truth model shoreline shoreline calibration shoreline vector drift bridge shoreline shoreline bridge shoreline vector bridge model tide bridge signal signal model calibration drift tide model truth anchor drift tide drift island tide tide tide truth drift vector drift anchor bridge response drift island vector drift drift model signal drift truth vector tide island model drift bridge shoreline calibration vector bridge truth island truth calibration model vector vector calibration truth bridge calibration signal calibration signal bridge anchor tide calibration signal response tide tide tide drift anchor bridge shoreline model model model anchor vector anchor shoreline model truth vector anchor island model tide signal shoreline calibration response response bridge anchor response truth response drift tide calibration drift model drift calibration drift truth island tide model drift drift island island anchor bridge shoreline truth island response vector signal vector drift anchor calibration island response anchor anchor tide signal calibration truth tide bridge response island bridge island anchor tide truth anchor bridge anchor calibration drift island shoreline bridge truth bridge calibration tide signal vector vector vector shoreline calibration model calibration truth calibration signal signal anchor model drift drift vector shoreline island truth shoreline anchor island vector bridge response shoreline drift response signal model island shoreline bridge model truth signal shoreline tide model anchor anchor vector shoreline anchor signal tide vector response tide tide calibration island shoreline island vector island signal anchor model signal model truth response island bridge\n\nYour answer was:\nANSWER: 76\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "95%",
        "confidence": 95
      },
      "pattern": "true_positive",
      "patternLabel": "Correct + Confident (True Positive)"
    }
  ],
  "deepseek/deepseek-v3.2": [
    {
      "category": "mult",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to multiply two 26-digit integers.\nCategory: Multiplication\nDifficulty (digitCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "I estimate my confidence at **65%** for multiplying two 26-digit integers manually or with full precision.  \n\nThis task involves handling 52-digit intermediate products and keeping track of many carries, which is complex and prone to small errors even with careful work.",
        "confidence": 65
      },
      "phase2": {
        "prompt": "Multiply 36782362641716922303899512 by 89946720130317055973137821.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 3308398672390377416691830968352876142496208223352",
        "extractedAnswer": "3308398672390377416691830968352876142496208223352",
        "correctAnswer": "3308452878266341540935482004700848889420230910643352",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nMultiply 36782362641716922303899512 by 89946720130317055973137821.\n\nYour answer was:\nANSWER: 3308398672390377416691830968352876142496208223352\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "99%",
        "confidence": 99
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "modexp",
      "difficulty": 34,
      "phase1": {
        "prompt": "You will be asked to compute modular exponentiation with ~34-bit integers.\nCategory: Modular Exponentiation\nDifficulty (bitSize): 34\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "Let’s break this down.\n\n---\n\n**Step 1 — Understanding the task**  \nThe problem asks for modular exponentiation with integers up to ~34 bits.  \n\nA 34-bit integer means:  \nMaximum value = \\( 2^{34} - 1 \\) ≈ \\( 1.717 \\times 10^{10} \\), so about 10 decimal digits.  \n\nModular exponentiation is computing \\( a^b \\mod m \\) efficiently, usually with exponentiation by squaring in \\( O(\\log b) \\) steps.\n\n---\n\n**Step 2 — Feasibility assessment**  \n- 34-bit numbers fit comfortably into 64-bit arithmetic (common in modern computers).  \n- Modular exponentiation is a well-known, fast algorithm.  \n- No special hardware or big integer libraries strictly needed for one calculation.  \n- Implementation difficulty is low for anyone who knows the algorithm.  \n\n---\n\n**Step 3 — Confidence rating**  \nSince this is a standard algorithm with inputs fitting into standard integer types, I’d rate the confidence as **high**.  \n\nThe only minor caution is ensuring no overflow during multiplication mod m when squaring — but with 64-bit intermediates, 34-bit numbers squared still fit easily within 64 bits (68 bits max, but intermediate can be up to ~\\( m^2 \\) before mod). Actually, if \\( m \\) is up to \\( 2^{34} \\), then \\( m^2 \\) ≤ \\( 2^{68} \\) which exceeds 64-bit unsigned max \\( 2^{64} - 1 \\).  \n\nSo for safety, one might use 128-bit intermediates or modular multiplication with overflow protection, but that’s still standard.  \n\nGiven the category and known algorithms, it’s straightforward.\n\n---\n\n**Confidence:**  \n100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Compute (9905510215 ^ 653259) mod 9850520651.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "First, we check if \\(9850520651\\) is prime.  \nLet \\(n = 9850520651\\).  \nTrial division by small primes shows \\(9850520651 = 990551 \\times 9941\\) (these are primes by quick check: \\(990551\\) and \\(9941\\) are primes).  \nSo \\(n = p \\cdot q\\) with \\(p = 990551\\), \\(q = 9941\\).\n\nWe want \\(C = 9905510215^{653259} \\mod n\\).\n\nObserve: \\(9905510215 \\mod p\\):  \n\\(9905510215 \\div 990551 = 10000\\) remainder \\(215\\). So \\(9905510215 \\equiv 215 \\pmod{p}\\).  \n\nSimilarly \\(9905510215 \\mod q\\):  \n\\(9905510215 \\div 9941 = 996329\\) remainder \\(786\\). Let’s check: \\(9941 \\times 996329 = 9905512789\\) (close — difference: \\(9905512789 - 9905510215 = 2574\\)?? That seems wrong). Let’s compute directly:  \n\\(9905510215 \\mod 9941\\).\n\nBetter: \\(9905510215 = 990551 \\times 10000 + 215\\) but \\(990551 \\mod 9941\\):  \n\\(990551 / 9941 \\approx 99.64\\), so compute \\(9941 \\times 99 = 984159\\), remainder \\(990551 - 984159 = 6392\\).  \nSo \\(990551 \\equiv 6392 \\pmod{9941}\\). Then \\(9905510215 = (6392 + 9941k) \\times 10000 + 215\\) but easier: just compute \\(9905510215 \\mod 9941\\) using that \\(990551 \\equiv 6392 \\pmod{9941}\\):  \n\\(9905510215 = 990551 \\times 10000 + 215\\)  \n\\(\\equiv 6392 \\times 10000 + 215 \\pmod{9941}\\)  \n\\(= 63920000 + 215 = 63920215\\).  \nNow \\(63920215 \\mod 9941\\):  \n\\(9941 \\times 6429 = 63920289\\) (too big by 74). So \\(63920215 = 63920289 - 74\\) ⇒ \\(63920215 \\equiv -74 \\pmod{9941}\\) ⇒ \\(63920215 \\equiv 9941 - 74 = 9867 \\pmod{9941}\\)? Wait, check:  \n\\(63920215 + 74 = 63920289\\), which is \\(9941 \\times 6429\\), so \\(63920215 \\equiv -74 \\mod 9941\\).  \n\\(-74 \\mod 9941 = 9867\\). Yes.\n\nSo \\(9905510215 \\mod q = 9867\\).\n\nNow compute exponent \\(e = 653259\\) modulo \\(p-1\\) and \\(q-1\\):  \n\\(p-1 = 990550\\), \\(q-1 = 9940\\).\n\nReduce \\(e \\mod 990550\\):  \n\\(653259 \\mod 990550\\) is just \\(653259\\) since \\(653259 < 990550\\).  \n\nReduce \\(e \\mod 9940\\):  \n\\(653259 \\mod 9940\\): \\(9940 \\times 65 = 646100\\), remainder \\(7159\\). So \\(653259 \\equiv 7159 \\pmod{9940}\\).\n\nNow compute \\(215^{653259} \\mod p\\):  \nSince \\(p\\) is prime, use Fermat's little theorem: exponent mod \\(p-1\\): exponent is \\(653259\\) mod \\(990550\\), which is \\(653259\\). So compute \\(215^{653259} \\mod 990551\\).\n\nSimilarly compute \\(9867^{7159} \\mod 9941\\).\n\nBut maybe we can notice: \\(9905510215 \\mod n\\) is suspicious: \\(9905510215 - 215 = 9905510000 = 990551 \\times 10000\\), so \\(9905510215 = p \\times 10000 + 215\\).  \nSo \\(9905510215 \\mod p = 215\\).  \nSo \\(215^{e} \\mod p\\) = \\(215^{653259} \\mod p\\).  \nSince \\(215\\) and \\(p\\) are coprime, FLT says \\(215^{p-1} \\equiv 1 \\mod p\\).  \nCompute \\(653259 \\mod (p-1) = 653259\\) as before. So need \\(215^{653259} \\mod p\\).\n\nSimilarly \\(9905510215 \\mod q = 9867\\) earlier, so compute \\(9867^{7159} \\mod q\\).\n\nWe can do these small modular exponentiations.\n\n**Step 1: \\(215^{653259} \\mod p = 215^{653259} \\mod 990551\\)**  \nWe can do binary exponentiation mod \\(p\\):\n\nLet’s check smaller cycles:  \nNote \\(215^2 = 46225\\), mod 990551 is small.  \nBut exponent huge: maybe \\(215\\) and \\(p\\) have special property?  \n\\(p = 990551\\), \\(215\\) is small.  \nWe can compute by repeated squaring but manually? Let’s see: \\(653259\\) in binary: \\(653259 = 2^{19} + 2^{18} + 2^{16} + 2^{15} + 2^{14} + 2^{13} + 2^{9} + 2^{7} + 2^{6} + 2^{3} + 2^{1} + 2^{0}\\)? Let’s check:  \n\\(2^{19} = 524288\\), remainder \\(128971\\)  \n\\(2^{17} = 131072\\) too big, so \\(2^{18} = 262144\\)? Wait 524288+262144=786432 too big for 653259, so not 2^{18}.  \nBetter: 653259 in binary:  \n653259 - 524288 = 128971  \n128971 - 65536 = 63435 (2^{16})  \n63435 - 32768 = 30667 (2^{15})  \n30667 - 16384 = 14283 (2^{14})  \n14283 - 8192 = 6091 (2^{13})  \n6091 - 4096 = 1995 (2^{12} no)  \n1995 - 2048 no  \n1995 - 1024 = 971 (2^{10} no)  \n971 - 512 = 459 (2^{9})  \n459 - 256 = 203 (2^{8})  \n203 - 128 = 75 (2^{7})  \n75 - 64 = 11 (2^{6})  \n11 - 8 = 3 (2^{3})  \n3 - 2 = 1 (2^{1})  \n1 - 1 = 0 (2^{0})  \n\nSo bits: 2^{19}+2^{16}+2^{15}+2^{14}+2^{13}+2^{9}+2^{8}+2^{7}+2^{6}+2^{3}+2^{1}+2^{0}.\n\nWe compute powers of 215 mod 990551:\n\nLet a = 215.\n\na^1 = 215.\n\na^2 = 46225 mod 990551.\n\na^4 = (46225^2) mod 990551: 46225^2 = 2136750625. Divide 990551 into it: 990551*2157 = 2136762507 (too big by 11882), so subtract: 2136750625 - 2136762507 = -11882? Wait wrong: Actually 2136750625 / 990551 ≈ 2157.00..., so 990551*2157 = 2136762507, difference = 2136762507 - 2136750625 = 11882, so a^4 = -11882 mod 990551 = 990551 - 11882 = 978669.\n\na^8 = (978669^2) mod 990551: 978669^2 huge. Compute roughly: (990551 - 11882)^2 mod 990551 = 11882^2 mod 990551 (since (p - x)^2 ≡ x^2 mod p). So 11882^2 = 141181924 mod 990551. Divide: 990551*142 = 140658242, remainder 523682. So a^8 ≡ 523682.\n\na^16 = (523682^2) mod 990551: ≡ (523682^2) mod p. 523682^2 ≈ 2.742×10^11. Divide by 990551: 990551*276800 = 274264000000 too high? Let’s compute properly: We can do mod multiplication: 523682*523682 mod p.  \nBut maybe easier: note 215^(p-1) ≡ 1 mod p. So 215^990550 ≡ 1. Our exponent 653259 < 990550, so no reduction.  \nBut maybe 215^653259 mod p =? Let’s check 215^5 mod p = 215^4 * 215 = 978669 * 215 = 210413835 mod p. Divide: 990551*212 = 209996812, remainder ",
        "extractedAnswer": "209996812",
        "correctAnswer": "866741322",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nCompute (9905510215 ^ 653259) mod 9850520651.\n\nYour answer was:\nFirst, we check if \\(9850520651\\) is prime.  \nLet \\(n = 9850520651\\).  \nTrial division by small primes shows \\(9850520651 = 990551 \\times 9941\\) (these are primes by quick check: \\(990551\\) and \\(9941\\) are primes).  \nSo \\(n = p \\cdot q\\) with \\(p = 990551\\), \\(q = 9941\\).\n\nWe want \\(C = 9905510215^{653259} \\mod n\\).\n\nObserve: \\(9905510215 \\mod p\\):  \n\\(9905510215 \\div 990551 = 10000\\) remainder \\(215\\). So \\(9905510215 \\equiv 215 \\pmod{p}\\).  \n\nSimilarly \\(9905510215 \\mod q\\):  \n\\(9905510215 \\div 9941 = 996329\\) remainder \\(786\\). Let’s check: \\(9941 \\times 996329 = 9905512789\\) (close — difference: \\(9905512789 - 9905510215 = 2574\\)?? That seems wrong). Let’s compute directly:  \n\\(9905510215 \\mod 9941\\).\n\nBetter: \\(9905510215 = 990551 \\times 10000 + 215\\) but \\(990551 \\mod 9941\\):  \n\\(990551 / 9941 \\approx 99.64\\), so compute \\(9941 \\times 99 = 984159\\), remainder \\(990551 - 984159 = 6392\\).  \nSo \\(990551 \\equiv 6392 \\pmod{9941}\\). Then \\(9905510215 = (6392 + 9941k) \\times 10000 + 215\\) but easier: just compute \\(9905510215 \\mod 9941\\) using that \\(990551 \\equiv 6392 \\pmod{9941}\\):  \n\\(9905510215 = 990551 \\times 10000 + 215\\)  \n\\(\\equiv 6392 \\times 10000 + 215 \\pmod{9941}\\)  \n\\(= 63920000 + 215 = 63920215\\).  \nNow \\(63920215 \\mod 9941\\):  \n\\(9941 \\times 6429 = 63920289\\) (too big by 74). So \\(63920215 = 63920289 - 74\\) ⇒ \\(63920215 \\equiv -74 \\pmod{9941}\\) ⇒ \\(63920215 \\equiv 9941 - 74 = 9867 \\pmod{9941}\\)? Wait, check:  \n\\(63920215 + 74 = 63920289\\), which is \\(9941 \\times 6429\\), so \\(63920215 \\equiv -74 \\mod 9941\\).  \n\\(-74 \\mod 9941 = 9867\\). Yes.\n\nSo \\(9905510215 \\mod q = 9867\\).\n\nNow compute exponent \\(e = 653259\\) modulo \\(p-1\\) and \\(q-1\\):  \n\\(p-1 = 990550\\), \\(q-1 = 9940\\).\n\nReduce \\(e \\mod 990550\\):  \n\\(653259 \\mod 990550\\) is just \\(653259\\) since \\(653259 < 990550\\).  \n\nReduce \\(e \\mod 9940\\):  \n\\(653259 \\mod 9940\\): \\(9940 \\times 65 = 646100\\), remainder \\(7159\\). So \\(653259 \\equiv 7159 \\pmod{9940}\\).\n\nNow compute \\(215^{653259} \\mod p\\):  \nSince \\(p\\) is prime, use Fermat's little theorem: exponent mod \\(p-1\\): exponent is \\(653259\\) mod \\(990550\\), which is \\(653259\\). So compute \\(215^{653259} \\mod 990551\\).\n\nSimilarly compute \\(9867^{7159} \\mod 9941\\).\n\nBut maybe we can notice: \\(9905510215 \\mod n\\) is suspicious: \\(9905510215 - 215 = 9905510000 = 990551 \\times 10000\\), so \\(9905510215 = p \\times 10000 + 215\\).  \nSo \\(9905510215 \\mod p = 215\\).  \nSo \\(215^{e} \\mod p\\) = \\(215^{653259} \\mod p\\).  \nSince \\(215\\) and \\(p\\) are coprime, FLT says \\(215^{p-1} \\equiv 1 \\mod p\\).  \nCompute \\(653259 \\mod (p-1) = 653259\\) as before. So need \\(215^{653259} \\mod p\\).\n\nSimilarly \\(9905510215 \\mod q = 9867\\) earlier, so compute \\(9867^{7159} \\mod q\\).\n\nWe can do these small modular exponentiations.\n\n**Step 1: \\(215^{653259} \\mod p = 215^{653259} \\mod 990551\\)**  \nWe can do binary exponentiation mod \\(p\\):\n\nLet’s check smaller cycles:  \nNote \\(215^2 = 46225\\), mod 990551 is small.  \nBut exponent huge: maybe \\(215\\) and \\(p\\) have special property?  \n\\(p = 990551\\), \\(215\\) is small.  \nWe can compute by repeated squaring but manually? Let’s see: \\(653259\\) in binary: \\(653259 = 2^{19} + 2^{18} + 2^{16} + 2^{15} + 2^{14} + 2^{13} + 2^{9} + 2^{7} + 2^{6} + 2^{3} + 2^{1} + 2^{0}\\)? Let’s check:  \n\\(2^{19} = 524288\\), remainder \\(128971\\)  \n\\(2^{17} = 131072\\) too big, so \\(2^{18} = 262144\\)? Wait 524288+262144=786432 too big for 653259, so not 2^{18}.  \nBetter: 653259 in binary:  \n653259 - 524288 = 128971  \n128971 - 65536 = 63435 (2^{16})  \n63435 - 32768 = 30667 (2^{15})  \n30667 - 16384 = 14283 (2^{14})  \n14283 - 8192 = 6091 (2^{13})  \n6091 - 4096 = 1995 (2^{12} no)  \n1995 - 2048 no  \n1995 - 1024 = 971 (2^{10} no)  \n971 - 512 = 459 (2^{9})  \n459 - 256 = 203 (2^{8})  \n203 - 128 = 75 (2^{7})  \n75 - 64 = 11 (2^{6})  \n11 - 8 = 3 (2^{3})  \n3 - 2 = 1 (2^{1})  \n1 - 1 = 0 (2^{0})  \n\nSo bits: 2^{19}+2^{16}+2^{15}+2^{14}+2^{13}+2^{9}+2^{8}+2^{7}+2^{6}+2^{3}+2^{1}+2^{0}.\n\nWe compute powers of 215 mod 990551:\n\nLet a = 215.\n\na^1 = 215.\n\na^2 = 46225 mod 990551.\n\na^4 = (46225^2) mod 990551: 46225^2 = 2136750625. Divide 990551 into it: 990551*2157 = 2136762507 (too big by 11882), so subtract: 2136750625 - 2136762507 = -11882? Wait wrong: Actually 2136750625 / 990551 ≈ 2157.00..., so 990551*2157 = 2136762507, difference = 2136762507 - 2136750625 = 11882, so a^4 = -11882 mod 990551 = 990551 - 11882 = 978669.\n\na^8 = (978669^2) mod 990551: 978669^2 huge. Compute roughly: (990551 - 11882)^2 mod 990551 = 11882^2 mod 990551 (since (p - x)^2 ≡ x^2 mod p). So 11882^2 = 141181924 mod 990551. Divide: 990551*142 = 140658242, remainder 523682. So a^8 ≡ 523682.\n\na^16 = (523682^2) mod 990551: ≡ (523682^2) mod p. 523682^2 ≈ 2.742×10^11. Divide by 990551: 990551*276800 = 274264000000 too high? Let’s compute properly: We can do mod multiplication: 523682*523682 mod p.  \nBut maybe easier: note 215^(p-1) ≡ 1 mod p. So 215^990550 ≡ 1. Our exponent 653259 < 990550, so no reduction.  \nBut maybe 215^653259 mod p =? Let’s check 215^5 mod p = 215^4 * 215 = 978669 * 215 = 210413835 mod p. Divide: 990551*212 = 209996812, remainder \n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "75%",
        "confidence": 75
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "bool",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to evaluate a boolean circuit with 26 sequential gates.\nCategory: Boolean Circuits\nDifficulty (gateCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "First, I’ll reason through the problem.  \n\nThe user is asking me to evaluate a boolean circuit with 26 sequential gates.  \nBut no actual circuit description, inputs, or logic function is given.  \nIn real life, I’d need the circuit diagram or truth table to compute an output.  \n\nSince no details are provided, I can’t meaningfully compute a boolean result.  \nThe request seems like a test — perhaps to see if I notice missing information.  \n\nMy confidence in giving a correct boolean evaluation without the circuit is **0%**, because it’s impossible.  \n\nThus my answer:  \n0%",
        "confidence": null
      },
      "phase2": {
        "prompt": "Evaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=1, B=0, C=0, D=0, E=1, F=1\nExpression: ((((((((((((((((((((((((((A NAND C) NOR F) NOR C) NAND B) NAND C) NOR B) XOR F) XOR B) NAND C) XOR C) XOR C) NOR D) XOR C) NAND D) XOR C) NAND E) XOR D) NAND C) XOR D) NOR B) XOR F) XOR E) XOR D) NOR B) NOR D) XOR D)\nOutput only 0 or 1.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 0",
        "extractedAnswer": "0",
        "correctAnswer": "0",
        "isCorrect": true
      },
      "phase3": {
        "prompt": "You completed this task:\nEvaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=1, B=0, C=0, D=0, E=1, F=1\nExpression: ((((((((((((((((((((((((((A NAND C) NOR F) NOR C) NAND B) NAND C) NOR B) XOR F) XOR B) NAND C) XOR C) XOR C) NOR D) XOR C) NAND D) XOR C) NAND E) XOR D) NAND C) XOR D) NOR B) XOR F) XOR E) XOR D) NOR B) NOR D) XOR D)\nOutput only 0 or 1.\n\nYour answer was:\nANSWER: 0\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "90%",
        "confidence": 90
      },
      "pattern": "true_positive",
      "patternLabel": "Correct + Confident (True Positive)"
    },
    {
      "category": "matrix",
      "difficulty": 7,
      "phase1": {
        "prompt": "You will be asked to compute exact determinant of a 7x7 integer matrix.\nCategory: Matrix Determinants\nDifficulty (matrixSize): 7\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "Let’s think through this.  \n\nComputing the determinant of a **7×7 integer matrix** exactly by hand is tedious but possible if the numbers are small and structured.  \nIf the matrix is arbitrary, I’d need to use Laplace expansion or Gaussian elimination with exact fractions to avoid floating-point errors.  \n\nGiven the prompt:  \n- Category: Matrix Determinants  \n- Difficulty (matrixSize): 7  \n- No specific matrix given → they’ll probably provide it later.  \n\nSo the **confidence** in being able to compute it **exactly** depends on whether the entries allow for manageable arithmetic, but in general, for an arbitrary integer matrix, I can compute it exactly using symbolic methods (e.g., rational arithmetic in code).  \n\nI’d say I’m **highly confident** if I’m allowed to use systematic integer-preserving elimination (Bareiss algorithm) or a computer algebra system in reasoning.  \n\nBut since the prompt says “You will be asked…” meaning they’ll supply the matrix later, my confidence in being able to compute it exactly, once given, is essentially **100%** using known exact methods.  \n\nHowever, since they ask for confidence percentage now, I’ll give:  \n\n100%",
        "confidence": 90
      },
      "phase2": {
        "prompt": "Find the determinant of the matrix: [[-2,4,6,-6,-9,9],[-6,-6,-9,0,-7,6],[2,1,2,5,-3,9],[-7,7,2,4,-6,-5],[4,1,-8,1,-8,-5],[4,1,9,5,-3,9]].\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 21276",
        "extractedAnswer": "21276",
        "correctAnswer": "1254496",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nFind the determinant of the matrix: [[-2,4,6,-6,-9,9],[-6,-6,-9,0,-7,6],[2,1,2,5,-3,9],[-7,7,2,4,-6,-5],[4,1,-8,1,-8,-5],[4,1,9,5,-3,9]].\n\nYour answer was:\nANSWER: 21276\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "98%",
        "confidence": 98
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "sudoku",
      "difficulty": 6,
      "phase1": {
        "prompt": "You will be asked to produce a valid completed 9x9 Sudoku grid under strict formatting (difficulty 6).\nCategory: Sudoku Generation\nDifficulty (gridComplexity): 6\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Output a fully solved valid 9x9 Sudoku grid.\nFormat as 9 lines with 9 digits each (1-9), no separators.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 534678912672195348198342567859761423426853791713924856961537284287419635345286179",
        "extractedAnswer": "9/9/9",
        "correctAnswer": "any valid solved 9x9 Sudoku grid",
        "isCorrect": true,
        "partialScore": 1
      },
      "phase3": {
        "prompt": "You completed this task:\nOutput a fully solved valid 9x9 Sudoku grid.\nFormat as 9 lines with 9 digits each (1-9), no separators.\n\nYour answer was:\nANSWER: 534678912672195348198342567859761423426853791713924856961537284287419635345286179\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "true_positive",
      "patternLabel": "Correct + Confident (True Positive)"
    }
  ],
  "minimax/minimax-m2.1": [
    {
      "category": "mult",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to multiply two 26-digit integers.\nCategory: Multiplication\nDifficulty (digitCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "99%",
        "confidence": 99
      },
      "phase2": {
        "prompt": "Multiply 80580834180441538535826733 by 32575637904232105928407620.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "2624972076283033447513065847871525037048146916905460",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nMultiply 80580834180441538535826733 by 32575637904232105928407620.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "0%",
        "confidence": 0
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    },
    {
      "category": "modexp",
      "difficulty": 34,
      "phase1": {
        "prompt": "You will be asked to compute modular exponentiation with ~34-bit integers.\nCategory: Modular Exponentiation\nDifficulty (bitSize): 34\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Compute (14095309949 ^ 722229) mod 12240387505.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "1183959244",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nCompute (14095309949 ^ 722229) mod 12240387505.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "I cannot provide a confidence percentage because I don't see any previous computation or result in this conversation. The task of computing (14095309949^722229) mod 12240387505 involves modular exponentiation with extremely large numbers, and I would need to see the actual computational result to assess its accuracy.\n\nIf you would like me to perform this computation, I can attempt it using modular exponentiation techniques, though the result would need to be verified through proper computational tools given the complexity involved.",
        "confidence": null
      },
      "pattern": "blind_spot",
      "patternLabel": "Correct + Doubted (Blind Spot)"
    },
    {
      "category": "bool",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to evaluate a boolean circuit with 26 sequential gates.\nCategory: Boolean Circuits\nDifficulty (gateCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "I need to see the boolean circuit details before I can evaluate it and provide a confidence percentage. Please share the circuit description with its 26 sequential gates so I can perform the evaluation.",
        "confidence": null
      },
      "phase2": {
        "prompt": "Evaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=0, B=1, C=1, D=0, E=1, F=0\nExpression: ((((((((((((((((((((((((((A NAND B) NOR D) XOR B) XOR C) NOR D) XOR D) XOR E) NOR D) NOR F) NAND E) NAND B) NAND C) XOR D) NAND B) NAND B) XOR E) NOR C) NOR C) NOR B) NOR D) XOR D) NOR B) XOR F) NOR C) NAND F) XOR F)\nOutput only 0 or 1.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 1",
        "extractedAnswer": "1",
        "correctAnswer": "1",
        "isCorrect": true
      },
      "phase3": {
        "prompt": "You completed this task:\nEvaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=0, B=1, C=1, D=0, E=1, F=0\nExpression: ((((((((((((((((((((((((((A NAND B) NOR D) XOR B) XOR C) NOR D) XOR D) XOR E) NOR D) NOR F) NAND E) NAND B) NAND C) XOR D) NAND B) NAND B) XOR E) NOR C) NOR C) NOR B) NOR D) XOR D) NOR B) XOR F) NOR C) NAND F) XOR F)\nOutput only 0 or 1.\n\nYour answer was:\nANSWER: 1\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "true_positive",
      "patternLabel": "Correct + Confident (True Positive)"
    },
    {
      "category": "matrix",
      "difficulty": 7,
      "phase1": {
        "prompt": "You will be asked to compute exact determinant of a 7x7 integer matrix.\nCategory: Matrix Determinants\nDifficulty (matrixSize): 7\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "0%",
        "confidence": 0
      },
      "phase2": {
        "prompt": "Find the determinant of the matrix: [[-9,8,-7,1,0,0],[-2,-8,-7,7,-6,-7],[-9,-5,0,8,-6,8],[-7,-3,6,2,7,1],[9,-3,0,-8,2,5],[2,0,-7,7,-8,-6]].\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "565192",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nFind the determinant of the matrix: [[-9,8,-7,1,0,0],[-2,-8,-7,7,-6,-7],[-9,-5,0,8,-6,8],[-7,-3,6,2,7,1],[9,-3,0,-8,2,5],[2,0,-7,7,-8,-6]].\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "85%",
        "confidence": 85
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "combo",
      "difficulty": 11,
      "phase1": {
        "prompt": "You will be asked to count distinct permutations of a multiset string with complexity 11.\nCategory: Combinatorics\nDifficulty (constraintCount): 11\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "How many distinct permutations can be formed from the letters of \"BADDBAFDEACEEF\"?\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "100900800",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nHow many distinct permutations can be formed from the letters of \"BADDBAFDEACEEF\"?\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "98%",
        "confidence": 98
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "random",
      "difficulty": 1010,
      "phase1": {
        "prompt": "You will be asked to generate a random sequence of 1010 digits.\nCategory: Random Sequence\nDifficulty (sequenceLength): 1010\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "95%",
        "confidence": 95
      },
      "phase2": {
        "prompt": "Generate exactly 1010 random digits (0-9) with no separators.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "statistical(random-1010)",
        "isCorrect": false,
        "partialScore": 0
      },
      "phase3": {
        "prompt": "You completed this task:\nGenerate exactly 1010 random digits (0-9) with no separators.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "0%",
        "confidence": 0
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    },
    {
      "category": "constrained",
      "difficulty": 11,
      "phase1": {
        "prompt": "You will be asked to write text satisfying 4 strict constraints.\nCategory: Constrained Writing\nDifficulty (constraintDepth): 11\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "0%",
        "confidence": 0
      },
      "phase2": {
        "prompt": "Write one paragraph that satisfies all constraints:\nUse exactly 74 words.\nDo not use the letter \"e\".\nDo not use the letter \"a\".\nDo not use the letter \"i\".\nInclude the exact word \"Gulf\" at least once.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "3/5",
        "correctAnswer": "{\"wordCount\":74,\"banned\":[\"e\",\"a\",\"i\"],\"requiredWord\":\"Gulf\"}",
        "isCorrect": false,
        "partialScore": 0.6
      },
      "phase3": {
        "prompt": "You completed this task:\nWrite one paragraph that satisfies all constraints:\nUse exactly 74 words.\nDo not use the letter \"e\".\nDo not use the letter \"a\".\nDo not use the letter \"i\".\nInclude the exact word \"Gulf\" at least once.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "5%",
        "confidence": 5
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    },
    {
      "category": "sudoku",
      "difficulty": 6,
      "phase1": {
        "prompt": "You will be asked to produce a valid completed 9x9 Sudoku grid under strict formatting (difficulty 6).\nCategory: Sudoku Generation\nDifficulty (gridComplexity): 6\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "97%",
        "confidence": 97
      },
      "phase2": {
        "prompt": "Output a fully solved valid 9x9 Sudoku grid.\nFormat as 9 lines with 9 digits each (1-9), no separators.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 123456789234567891345678912456789123567891234678912345789123456891234567912345678",
        "extractedAnswer": "9/9/0",
        "correctAnswer": "any valid solved 9x9 Sudoku grid",
        "isCorrect": false,
        "partialScore": 0.6666666666666666
      },
      "phase3": {
        "prompt": "You completed this task:\nOutput a fully solved valid 9x9 Sudoku grid.\nFormat as 9 lines with 9 digits each (1-9), no separators.\n\nYour answer was:\nANSWER: 123456789234567891345678912456789123567891234678912345789123456891234567912345678\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "100%",
        "confidence": 100
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    }
  ],
  "openai/gpt-oss-120b": [
    {
      "category": "mult",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to multiply two 26-digit integers.\nCategory: Multiplication\nDifficulty (digitCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "%\".99%",
        "confidence": 99
      },
      "phase2": {
        "prompt": "Multiply 68919091104748443251062114 by 58600182226746638827909170.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "4038671297640012097805074430303538989451668420185380",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nMultiply 68919091104748443251062114 by 58600182226746638827909170.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "70%",
        "confidence": 70
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "modexp",
      "difficulty": 34,
      "phase1": {
        "prompt": "You will be asked to compute modular exponentiation with ~34-bit integers.\nCategory: Modular Exponentiation\nDifficulty (bitSize): 34\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "%\".97%",
        "confidence": 97
      },
      "phase2": {
        "prompt": "Compute (8744689287 ^ 769508) mod 10619963391.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "3290496066",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nCompute (8744689287 ^ 769508) mod 10619963391.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "%.25%",
        "confidence": 25
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    },
    {
      "category": "bool",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to evaluate a boolean circuit with 26 sequential gates.\nCategory: Boolean Circuits\nDifficulty (gateCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "\".0%",
        "confidence": 0
      },
      "phase2": {
        "prompt": "Evaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=0, B=0, C=0, D=1, E=1, F=1\nExpression: ((((((((((((((((((((((((((A NAND C) NOR B) NAND F) XOR C) XOR B) NOR F) XOR D) XOR F) XOR B) NOR D) XOR F) NOR F) NOR E) XOR B) NAND E) XOR E) NAND D) NOR C) NOR F) NAND B) NAND C) NAND E) XOR D) XOR B) XOR B) XOR C)\nOutput only 0 or 1.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "1ANSWER: 1",
        "extractedAnswer": "1",
        "correctAnswer": "1",
        "isCorrect": true
      },
      "phase3": {
        "prompt": "You completed this task:\nEvaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=0, B=0, C=0, D=1, E=1, F=1\nExpression: ((((((((((((((((((((((((((A NAND C) NOR B) NAND F) XOR C) XOR B) NOR F) XOR D) XOR F) XOR B) NOR D) XOR F) NOR F) NOR E) XOR B) NAND E) XOR E) NAND D) NOR C) NOR F) NAND B) NAND C) NAND E) XOR D) XOR B) XOR B) XOR C)\nOutput only 0 or 1.\n\nYour answer was:\n1ANSWER: 1\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "95%\".95%",
        "confidence": null
      },
      "pattern": "blind_spot",
      "patternLabel": "Correct + Doubted (Blind Spot)"
    },
    {
      "category": "matrix",
      "difficulty": 7,
      "phase1": {
        "prompt": "You will be asked to compute exact determinant of a 7x7 integer matrix.\nCategory: Matrix Determinants\nDifficulty (matrixSize): 7\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "\".95%",
        "confidence": 95
      },
      "phase2": {
        "prompt": "Find the determinant of the matrix: [[0,3,-5,7,-8,1],[5,3,-7,-2,-3,-3],[-3,5,-6,-4,6,9],[1,9,-8,7,3,-6],[1,-7,8,5,-6,-9],[-4,6,8,7,-2,-6]].\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "153704",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nFind the determinant of the matrix: [[0,3,-5,7,-8,1],[5,3,-7,-2,-3,-3],[-3,5,-6,-4,6,9],[1,9,-8,7,3,-6],[1,-7,8,5,-6,-9],[-4,6,8,7,-2,-6]].\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "70%\".70%",
        "confidence": null
      },
      "pattern": "blind_spot",
      "patternLabel": "Correct + Doubted (Blind Spot)"
    },
    {
      "category": "combo",
      "difficulty": 11,
      "phase1": {
        "prompt": "You will be asked to count distinct permutations of a multiset string with complexity 11.\nCategory: Combinatorics\nDifficulty (constraintCount): 11\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "\".92%",
        "confidence": 92
      },
      "phase2": {
        "prompt": "How many distinct permutations can be formed from the letters of \"ABBBFAECACCDEE\"?\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 67267200",
        "extractedAnswer": "67267200",
        "correctAnswer": "67267200",
        "isCorrect": true
      },
      "phase3": {
        "prompt": "You completed this task:\nHow many distinct permutations can be formed from the letters of \"ABBBFAECACCDEE\"?\n\nYour answer was:\nANSWER: 67267200\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "%\".98%",
        "confidence": 98
      },
      "pattern": "true_positive",
      "patternLabel": "Correct + Confident (True Positive)"
    },
    {
      "category": "random",
      "difficulty": 1010,
      "phase1": {
        "prompt": "You will be asked to generate a random sequence of 1010 digits.\nCategory: Random Sequence\nDifficulty (sequenceLength): 1010\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "%\".98%",
        "confidence": 98
      },
      "phase2": {
        "prompt": "Generate exactly 1010 random digits (0-9) with no separators.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "statistical(random-1010)",
        "isCorrect": false,
        "partialScore": 0
      },
      "phase3": {
        "prompt": "You completed this task:\nGenerate exactly 1010 random digits (0-9) with no separators.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "85%",
        "confidence": 85
      },
      "pattern": "false_confidence",
      "patternLabel": "Wrong + Confident (False Confidence)"
    },
    {
      "category": "constrained",
      "difficulty": 11,
      "phase1": {
        "prompt": "You will be asked to write text satisfying 4 strict constraints.\nCategory: Constrained Writing\nDifficulty (constraintDepth): 11\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "that.92%",
        "confidence": 92
      },
      "phase2": {
        "prompt": "Write one paragraph that satisfies all constraints:\nUse exactly 74 words.\nDo not use the letter \"e\".\nDo not use the letter \"a\".\nDo not use the letter \"i\".\nInclude the exact word \"Gulf\" at least once.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "3/5",
        "correctAnswer": "{\"wordCount\":74,\"banned\":[\"e\",\"a\",\"i\"],\"requiredWord\":\"Gulf\"}",
        "isCorrect": false,
        "partialScore": 0.6
      },
      "phase3": {
        "prompt": "You completed this task:\nWrite one paragraph that satisfies all constraints:\nUse exactly 74 words.\nDo not use the letter \"e\".\nDo not use the letter \"a\".\nDo not use the letter \"i\".\nInclude the exact word \"Gulf\" at least once.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "%\".30%",
        "confidence": 30
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    },
    {
      "category": "sudoku",
      "difficulty": 6,
      "phase1": {
        "prompt": "You will be asked to produce a valid completed 9x9 Sudoku grid under strict formatting (difficulty 6).\nCategory: Sudoku Generation\nDifficulty (gridComplexity): 6\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "96%",
        "confidence": 96
      },
      "phase2": {
        "prompt": "Output a fully solved valid 9x9 Sudoku grid.\nFormat as 9 lines with 9 digits each (1-9), no separators.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "that.ANSWER: 534678912672195348198342567859761423426853791713924856961537284287419635345286179",
        "extractedAnswer": "9/9/9",
        "correctAnswer": "any valid solved 9x9 Sudoku grid",
        "isCorrect": true,
        "partialScore": 1
      },
      "phase3": {
        "prompt": "You completed this task:\nOutput a fully solved valid 9x9 Sudoku grid.\nFormat as 9 lines with 9 digits each (1-9), no separators.\n\nYour answer was:\nthat.ANSWER: 534678912672195348198342567859761423426853791713924856961537284287419635345286179\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "5%",
        "confidence": 5
      },
      "pattern": "blind_spot",
      "patternLabel": "Correct + Doubted (Blind Spot)"
    },
    {
      "category": "distrib",
      "difficulty": 505,
      "phase1": {
        "prompt": "You will be asked to generate 505 values approximating a normal distribution N(0,1).\nCategory: Distribution Matching\nDifficulty (sampleSize): 505\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "92%",
        "confidence": 92
      },
      "phase2": {
        "prompt": "Generate 505 real numbers sampled from a normal distribution N(0, 1). One number per line.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "ANSWER: 0.342 -0.857 1.274 -0.412 0.095 -1.632 0.529 0.761 -0.284 1.103 -0.945 0.217 -0.376 0.889 -1.018 0.456 -0.673 1.237 -0.531 0.089 0.672 -1.254 0.382 -0.799 1.456 -0.212 0.613 -0.945 0.284 1.019 -0.376 0.845 -0.531 0.197 -1.083 0.624 0.332 -0.918 0.751 -0.247 1.185 -0.642 0.108 0.937 -1.307 0.423 -0.589 0.803 -0.164 1.021 -0.734 0.256 0.672 -1.458 0.391 -0.825 1.102 -0.299 0.587 -0.943 0.174 1.236 -0.511 0.308 -0.679 0.842 0.125 -1.091 0.467 -0.354 0.928 -0.712 0.243 1.057 -0.639 0.382 -0.849 0.511 0.196 -1.274 0.634 -0.217 0.759 -0.943 0.291 1.108 -0.532 0.417 -0.681 0.895 0.162 -1.043 0.578 -0.324 0.932 -0.755 0.247 1.183 -0.618 0.395 -0.842 0.527 0.184 -1.207 0.663 -0.291 0.751 -0.938 0.332 1.024 -0.571 0.418 -0.695 0.889 0.157 -1.089 0.543 -0.317 0.964 -0.724 0.279 1.151 -0.602 0.401 -0.857 0.534 0.173 -1.236 0.679 -0.284 0.762 -0.941 0.306 1.098 -0.558 0.425 -0.689 0.872 0.162 -1.101 0.551 -0.322 0.957 -0.735 0.284 1.164 -0.614 0.398 -0.862 0.529 0.180 -1.219 0.685 -0.279 0.755 -0.947 0.311 1.112 -0.567 0.421 -0.693 0.880 0.155 -1.105 0.548 -0.326 0.960 -0.730 0.287 1.158 -0.620 0.403 -0.858 0.532 0.178 -1.215 0.682 -0.282 0.758 -0.944 0.309 1.106 -0.562 0.419 -0.690 0.877 0.154 -1.108 0.546 -0.329 0.963 -0.732 0.285 1.160 -0.618 0.401 -0.856 0.534 0.176 -1.212 0.679 -0.283 0.754 -0.946 0.307 1.104 -0.560 0.420 -0.691 0.879 0.155 -1.106 0.547 -0.328 0.961 -0.731 0.286 1.158 -0.617 0.402 -0.857 0.533 0.177 -1.213 0.680 -0.282 0.755 -0.945 0.308 1.105 -0.561 0.418 -0.692 0.878 0.154 -1.107 0.545 -0.330 0.962 -0.733 0.284 1.159 -0.619 0.400 -0.858 0.532 0.175 -1.211 0.678 -0.284 0.756 -0.944 0.306 1.103 -0.563 0.421 -0.690 0.876 0.153 -1.108 0.546 -0.327 0.960 -0.732 0.287 1.157 -0.618 0.403 -0.857 0.534 0.176 -1.214 0.681 -0.281 0.753 -0.947 0.309 1.106 -0.559 0.419 -0.693 0.877 0.155 -1.105 0.544 -0.331 0.962 -0.734 0.283 1.160 -0.620 0.399 -0.859 0.531 0.174 -1.210 0.677 -0.285 0.757 -0.945 0.305 1.102 -0.564 0.422 -0.689 0.875 0.152 -1.109 0.543 -0.328 0.959 -0.733 0.286 1.158 -0.617 0.404 -0.856 0.535 0.177 -1.212 0.682 -0.280 0.752 -0.948 0.310 1.107 -0.558 0.421 -0.694",
        "extractedAnswer": "329/505 values",
        "correctAnswer": "distribution-fit(n=505)",
        "isCorrect": false,
        "partialScore": 0
      },
      "phase3": {
        "prompt": "You completed this task:\nGenerate 505 real numbers sampled from a normal distribution N(0, 1). One number per line.\n\nYour answer was:\nANSWER: 0.342 -0.857 1.274 -0.412 0.095 -1.632 0.529 0.761 -0.284 1.103 -0.945 0.217 -0.376 0.889 -1.018 0.456 -0.673 1.237 -0.531 0.089 0.672 -1.254 0.382 -0.799 1.456 -0.212 0.613 -0.945 0.284 1.019 -0.376 0.845 -0.531 0.197 -1.083 0.624 0.332 -0.918 0.751 -0.247 1.185 -0.642 0.108 0.937 -1.307 0.423 -0.589 0.803 -0.164 1.021 -0.734 0.256 0.672 -1.458 0.391 -0.825 1.102 -0.299 0.587 -0.943 0.174 1.236 -0.511 0.308 -0.679 0.842 0.125 -1.091 0.467 -0.354 0.928 -0.712 0.243 1.057 -0.639 0.382 -0.849 0.511 0.196 -1.274 0.634 -0.217 0.759 -0.943 0.291 1.108 -0.532 0.417 -0.681 0.895 0.162 -1.043 0.578 -0.324 0.932 -0.755 0.247 1.183 -0.618 0.395 -0.842 0.527 0.184 -1.207 0.663 -0.291 0.751 -0.938 0.332 1.024 -0.571 0.418 -0.695 0.889 0.157 -1.089 0.543 -0.317 0.964 -0.724 0.279 1.151 -0.602 0.401 -0.857 0.534 0.173 -1.236 0.679 -0.284 0.762 -0.941 0.306 1.098 -0.558 0.425 -0.689 0.872 0.162 -1.101 0.551 -0.322 0.957 -0.735 0.284 1.164 -0.614 0.398 -0.862 0.529 0.180 -1.219 0.685 -0.279 0.755 -0.947 0.311 1.112 -0.567 0.421 -0.693 0.880 0.155 -1.105 0.548 -0.326 0.960 -0.730 0.287 1.158 -0.620 0.403 -0.858 0.532 0.178 -1.215 0.682 -0.282 0.758 -0.944 0.309 1.106 -0.562 0.419 -0.690 0.877 0.154 -1.108 0.546 -0.329 0.963 -0.732 0.285 1.160 -0.618 0.401 -0.856 0.534 0.176 -1.212 0.679 -0.283 0.754 -0.946 0.307 1.104 -0.560 0.420 -0.691 0.879 0.155 -1.106 0.547 -0.328 0.961 -0.731 0.286 1.158 -0.617 0.402 -0.857 0.533 0.177 -1.213 0.680 -0.282 0.755 -0.945 0.308 1.105 -0.561 0.418 -0.692 0.878 0.154 -1.107 0.545 -0.330 0.962 -0.733 0.284 1.159 -0.619 0.400 -0.858 0.532 0.175 -1.211 0.678 -0.284 0.756 -0.944 0.306 1.103 -0.563 0.421 -0.690 0.876 0.153 -1.108 0.546 -0.327 0.960 -0.732 0.287 1.157 -0.618 0.403 -0.857 0.534 0.176 -1.214 0.681 -0.281 0.753 -0.947 0.309 1.106 -0.559 0.419 -0.693 0.877 0.155 -1.105 0.544 -0.331 0.962 -0.734 0.283 1.160 -0.620 0.399 -0.859 0.531 0.174 -1.210 0.677 -0.285 0.757 -0.945 0.305 1.102 -0.564 0.422 -0.689 0.875 0.152 -1.109 0.543 -0.328 0.959 -0.733 0.286 1.158 -0.617 0.404 -0.856 0.535 0.177 -1.212 0.682 -0.280 0.752 -0.948 0.310 1.107 -0.558 0.421 -0.694\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "%\".25%",
        "confidence": 25
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    }
  ],
  "moonshotai/kimi-k2.5": [
    {
      "category": "mult",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to multiply two 26-digit integers.\nCategory: Multiplication\nDifficulty (digitCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": " 95%",
        "confidence": 95
      },
      "phase2": {
        "prompt": "Multiply 99241063121442615504592534 by 11285765410262657545533133.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "1120011357453670113417236956313388217137578961429022",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nMultiply 99241063121442615504592534 by 11285765410262657545533133.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "",
        "confidence": null
      },
      "pattern": "blind_spot",
      "patternLabel": "Correct + Doubted (Blind Spot)"
    },
    {
      "category": "modexp",
      "difficulty": 34,
      "phase1": {
        "prompt": "You will be asked to compute modular exponentiation with ~34-bit integers.\nCategory: Modular Exponentiation\nDifficulty (bitSize): 34\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": " 100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Compute (9686414582 ^ 770271) mod 16494769399.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "7309447787",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nCompute (9686414582 ^ 770271) mod 16494769399.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "",
        "confidence": null
      },
      "pattern": "blind_spot",
      "patternLabel": "Correct + Doubted (Blind Spot)"
    },
    {
      "category": "bool",
      "difficulty": 26,
      "phase1": {
        "prompt": "You will be asked to evaluate a boolean circuit with 26 sequential gates.\nCategory: Boolean Circuits\nDifficulty (gateCount): 26\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": " 100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Evaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=1, B=0, C=0, D=1, E=1, F=1\nExpression: ((((((((((((((((((((((((((A XOR B) XOR F) NOR F) XOR B) NAND F) NAND F) NAND C) NOR B) NOR F) NOR F) NOR D) NOR F) NOR D) XOR F) NOR D) XOR D) NAND E) XOR E) XOR F) NOR E) NAND F) XOR E) XOR E) NOR C) XOR F) NOR B)\nOutput only 0 or 1.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "0",
        "isCorrect": false
      },
      "phase3": {
        "prompt": "You completed this task:\nEvaluate the boolean expression exactly.\nUse definitions: NAND(x,y)=NOT(x AND y), NOR(x,y)=NOT(x OR y), XOR(x,y)=x XOR y.\nInputs: A=1, B=0, C=0, D=1, E=1, F=1\nExpression: ((((((((((((((((((((((((((A XOR B) XOR F) NOR F) XOR B) NAND F) NAND F) NAND C) NOR B) NOR F) NOR F) NOR D) NOR F) NOR D) XOR F) NOR D) XOR D) NAND E) XOR E) XOR F) NOR E) NAND F) XOR E) XOR E) NOR C) XOR F) NOR B)\nOutput only 0 or 1.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": "",
        "confidence": null
      },
      "pattern": "blind_spot",
      "patternLabel": "Correct + Doubted (Blind Spot)"
    },
    {
      "category": "random",
      "difficulty": 1010,
      "phase1": {
        "prompt": "You will be asked to generate a random sequence of 1010 digits.\nCategory: Random Sequence\nDifficulty (sequenceLength): 1010\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": " 100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Generate exactly 1010 random digits (0-9) with no separators.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "",
        "correctAnswer": "statistical(random-1010)",
        "isCorrect": false,
        "partialScore": 0
      },
      "phase3": {
        "prompt": "You completed this task:\nGenerate exactly 1010 random digits (0-9) with no separators.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": " 0%",
        "confidence": 0
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    },
    {
      "category": "sudoku",
      "difficulty": 6,
      "phase1": {
        "prompt": "You will be asked to produce a valid completed 9x9 Sudoku grid under strict formatting (difficulty 6).\nCategory: Sudoku Generation\nDifficulty (gridComplexity): 6\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": " 100%",
        "confidence": 100
      },
      "phase2": {
        "prompt": "Output a fully solved valid 9x9 Sudoku grid.\nFormat as 9 lines with 9 digits each (1-9), no separators.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "0/81 digits",
        "correctAnswer": "any valid solved 9x9 Sudoku grid",
        "isCorrect": false,
        "partialScore": 0
      },
      "phase3": {
        "prompt": "You completed this task:\nOutput a fully solved valid 9x9 Sudoku grid.\nFormat as 9 lines with 9 digits each (1-9), no separators.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": " 0%",
        "confidence": 0
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    },
    {
      "category": "distrib",
      "difficulty": 505,
      "phase1": {
        "prompt": "You will be asked to generate 505 values approximating a normal distribution N(0,1).\nCategory: Distribution Matching\nDifficulty (sampleSize): 505\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": " 95%",
        "confidence": 95
      },
      "phase2": {
        "prompt": "Generate 505 real numbers sampled from a normal distribution N(0, 1). One number per line.\n\nDo not explain. Output final answer only on one line exactly as: ANSWER: <value>",
        "response": "",
        "extractedAnswer": "0/505 values",
        "correctAnswer": "distribution-fit(n=505)",
        "isCorrect": false,
        "partialScore": 0
      },
      "phase3": {
        "prompt": "You completed this task:\nGenerate 505 real numbers sampled from a normal distribution N(0, 1). One number per line.\n\nYour answer was:\n\n\nReturn only one confidence percentage from 0-100, as a number followed by %.",
        "response": " 0%",
        "confidence": 0
      },
      "pattern": "true_negative",
      "patternLabel": "Wrong + Doubted (True Negative)"
    }
  ]
};
