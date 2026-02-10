import type { ModelResult } from "@shoreline/shared";

export const generatedResults: ModelResult[] = [
  {
    "modelId": "google/gemini-3-flash-preview",
    "modelDisplayName": "google/gemini-3-flash-preview",
    "timestamp": "2026-02-09T04:30:50.318Z",
    "categories": {
      "mult": {
        "category": "mult",
        "claimed": 24.636363636363637,
        "claimedDepth": 8.254499375772891,
        "claimedLoose": 8.254499375772891,
        "claimedThick": 8.254499375772891,
        "sand": 8.254499375772891,
        "solid": 11.020641596039253,
        "concrete": 11.020641596039253,
        "discernment": 95.45454545454545,
        "falseConfidence": 0,
        "trueUncertainty": 45.45454545454545,
        "failureAwareness": 45.45454545454545,
        "calibrationError": 29.909090909090907,
        "capability": 16.666666666666664,
        "sandFrontierDifficulty": 8,
        "solidFrontierDifficulty": 10,
        "concreteFrontierDifficulty": 50,
        "sampleDifficulties": [
          2,
          4,
          5,
          6,
          8,
          10,
          12,
          15,
          16,
          32,
          50
        ],
        "trialsByDifficulty": {
          "2": 2,
          "4": 2,
          "5": 2,
          "6": 2,
          "8": 2,
          "10": 2,
          "12": 2,
          "15": 2,
          "16": 2,
          "32": 2,
          "50": 2
        },
        "avgTrialsPerDifficulty": 2,
        "trialCount": 22,
        "difficultyRange": [
          2,
          50
        ],
        "transitionZone": 10
      },
      "modexp": {
        "category": "modexp",
        "claimed": 61.65,
        "claimedDepth": 19.73936250483372,
        "claimedLoose": 32.8989375080562,
        "claimedThick": 5.37400557604598,
        "sand": 19.73936250483372,
        "solid": 10.790107281462745,
        "concrete": 10.790107281462745,
        "discernment": 95,
        "falseConfidence": 5,
        "trueUncertainty": 55.00000000000001,
        "failureAwareness": 55.00000000000001,
        "calibrationError": 21.64999999999999,
        "capability": 16.666666666666664,
        "sandFrontierDifficulty": 32,
        "solidFrontierDifficulty": 14,
        "concreteFrontierDifficulty": 64,
        "sampleDifficulties": [
          4,
          8,
          9,
          12,
          14,
          16,
          19,
          32,
          48,
          64
        ],
        "trialsByDifficulty": {
          "4": 2,
          "8": 2,
          "9": 2,
          "12": 2,
          "14": 2,
          "16": 2,
          "19": 2,
          "32": 2,
          "48": 2,
          "64": 2
        },
        "avgTrialsPerDifficulty": 2,
        "trialCount": 20,
        "difficultyRange": [
          4,
          64
        ],
        "transitionZone": 14
      },
      "bool": {
        "category": "bool",
        "claimed": 62.388888888888886,
        "claimedDepth": 46.419957171278384,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 11.020641596039253,
        "sand": 46.419957171278384,
        "solid": 77.36659528546397,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 37.611111111111114,
        "capability": 100,
        "sandFrontierDifficulty": 50,
        "solidFrontierDifficulty": 50,
        "sampleDifficulties": [
          2,
          5,
          10,
          20,
          26,
          35,
          45,
          48,
          50
        ],
        "trialsByDifficulty": {
          "2": 2,
          "5": 2,
          "10": 2,
          "20": 2,
          "26": 2,
          "35": 2,
          "45": 2,
          "48": 2,
          "50": 2
        },
        "avgTrialsPerDifficulty": 2,
        "trialCount": 18,
        "difficultyRange": [
          2,
          50
        ],
        "transitionZone": 50
      },
      "matrix": {
        "category": "matrix",
        "claimed": 52.1875,
        "claimedDepth": 24.17246205333666,
        "claimedLoose": 24.17246205333666,
        "claimedThick": 24.17246205333666,
        "sand": 24.17246205333666,
        "solid": 24.17246205333666,
        "concrete": 24.17246205333666,
        "discernment": 87.5,
        "falseConfidence": 0,
        "trueUncertainty": 50,
        "failureAwareness": 50,
        "calibrationError": 8.437499999999998,
        "capability": 20,
        "sandFrontierDifficulty": 5,
        "solidFrontierDifficulty": 5,
        "concreteFrontierDifficulty": 12,
        "sampleDifficulties": [
          2,
          3,
          4,
          5,
          6,
          7,
          9,
          12
        ],
        "trialsByDifficulty": {
          "2": 2,
          "3": 2,
          "4": 2,
          "5": 2,
          "6": 2,
          "7": 2,
          "9": 2,
          "12": 2
        },
        "avgTrialsPerDifficulty": 2,
        "trialCount": 16,
        "difficultyRange": [
          2,
          12
        ],
        "transitionZone": 4
      },
      "combo": {
        "category": "combo",
        "claimed": 79,
        "claimedDepth": 54.15661669982478,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 51.33531497693483,
        "sand": 54.15661669982478,
        "solid": 55.57429191270674,
        "concrete": 0,
        "discernment": 83.33333333333334,
        "falseConfidence": 16.666666666666664,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 4.333333333333334,
        "capability": 42.10526315789473,
        "sandFrontierDifficulty": 20,
        "solidFrontierDifficulty": 15,
        "sampleDifficulties": [
          1,
          3,
          4,
          5,
          6,
          7,
          9,
          10,
          11,
          14,
          15,
          20
        ],
        "trialsByDifficulty": {
          "1": 2,
          "3": 2,
          "4": 2,
          "5": 2,
          "6": 2,
          "7": 2,
          "9": 2,
          "10": 2,
          "11": 2,
          "14": 2,
          "15": 2,
          "20": 2
        },
        "avgTrialsPerDifficulty": 2,
        "trialCount": 24,
        "difficultyRange": [
          1,
          20
        ],
        "transitionZone": 9
      },
      "random": {
        "category": "random",
        "claimed": 33.333333333333336,
        "claimedDepth": 77.36659528546397,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 77.36659528546397,
        "sand": 77.36659528546397,
        "solid": 27.80249357298385,
        "concrete": 27.80249357298385,
        "discernment": 55.55555555555556,
        "falseConfidence": 33.33333333333333,
        "trueUncertainty": 11.11111111111111,
        "failureAwareness": 11.11111111111111,
        "calibrationError": 25.024336499250833,
        "capability": 0,
        "sandFrontierDifficulty": 2000,
        "solidFrontierDifficulty": 1000,
        "concreteFrontierDifficulty": 2000,
        "sampleDifficulties": [
          20,
          22,
          25,
          50,
          100,
          250,
          500,
          1000,
          2000
        ],
        "trialsByDifficulty": {
          "20": 2,
          "22": 2,
          "25": 2,
          "50": 2,
          "100": 2,
          "250": 2,
          "500": 2,
          "1000": 2,
          "2000": 2
        },
        "avgTrialsPerDifficulty": 2,
        "trialCount": 18,
        "difficultyRange": [
          20,
          2000
        ],
        "transitionZone": 20
      },
      "constrained": {
        "category": "constrained",
        "claimed": 80.83333333333333,
        "claimedDepth": 58.02494646409798,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 19.37505428422474,
        "sand": 58.02494646409798,
        "solid": 25.788865095154655,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 56.13756613756613,
        "capability": 0,
        "sandFrontierDifficulty": 20,
        "solidFrontierDifficulty": 20,
        "sampleDifficulties": [
          1,
          3,
          6,
          10,
          15,
          20
        ],
        "trialsByDifficulty": {
          "1": 2,
          "3": 2,
          "6": 2,
          "10": 2,
          "15": 2,
          "20": 2
        },
        "avgTrialsPerDifficulty": 2,
        "trialCount": 12,
        "difficultyRange": [
          1,
          20
        ],
        "transitionZone": 1
      },
      "sudoku": {
        "category": "sudoku",
        "claimed": 86.64285714285714,
        "claimedDepth": 46.419957171278384,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 42.99593750686616,
        "sand": 46.419957171278384,
        "solid": 4.987991721720647,
        "concrete": 4.987991721720647,
        "discernment": 7.142857142857142,
        "falseConfidence": 85.71428571428571,
        "trueUncertainty": 7.142857142857142,
        "failureAwareness": 7.142857142857142,
        "calibrationError": 82.18791228612658,
        "capability": 0,
        "sandFrontierDifficulty": 10,
        "solidFrontierDifficulty": 8,
        "concreteFrontierDifficulty": 4,
        "sampleDifficulties": [
          1,
          2,
          3,
          4,
          6,
          8,
          10
        ],
        "trialsByDifficulty": {
          "1": 2,
          "2": 2,
          "3": 2,
          "4": 2,
          "6": 2,
          "8": 2,
          "10": 2
        },
        "avgTrialsPerDifficulty": 2,
        "trialCount": 14,
        "difficultyRange": [
          1,
          10
        ],
        "transitionZone": 1
      },
      "distrib": {
        "category": "distrib",
        "claimed": 30,
        "claimedDepth": 73.49826552119077,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 77.36659528546397,
        "sand": 73.49826552119077,
        "solid": 4.870105391488916,
        "concrete": 4.870105391488916,
        "discernment": 44.44444444444444,
        "falseConfidence": 50,
        "trueUncertainty": 33.33333333333333,
        "failureAwareness": 33.33333333333333,
        "calibrationError": 7.461752485917014,
        "capability": 0,
        "sandFrontierDifficulty": 1000,
        "solidFrontierDifficulty": 250,
        "concreteFrontierDifficulty": 1000,
        "sampleDifficulties": [
          10,
          12,
          15,
          25,
          50,
          100,
          250,
          500,
          1000
        ],
        "trialsByDifficulty": {
          "10": 2,
          "12": 2,
          "15": 2,
          "25": 2,
          "50": 2,
          "100": 2,
          "250": 2,
          "500": 2,
          "1000": 2
        },
        "avgTrialsPerDifficulty": 2,
        "trialCount": 18,
        "difficultyRange": [
          10,
          1000
        ],
        "transitionZone": 10
      },
      "selfref": {
        "category": "selfref",
        "claimed": 87.08333333333333,
        "claimedDepth": 58.02494646409798,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 55.57429191270674,
        "sand": 58.02494646409798,
        "solid": 8.596288365051553,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 64.79497354497353,
        "capability": 0,
        "sandFrontierDifficulty": 20,
        "solidFrontierDifficulty": 20,
        "sampleDifficulties": [
          1,
          3,
          6,
          10,
          15,
          20
        ],
        "trialsByDifficulty": {
          "1": 2,
          "3": 2,
          "6": 2,
          "10": 2,
          "15": 2,
          "20": 2
        },
        "avgTrialsPerDifficulty": 2,
        "trialCount": 12,
        "difficultyRange": [
          1,
          20
        ],
        "transitionZone": 1
      },
      "counting": {
        "category": "counting",
        "claimed": 82.11538461538461,
        "claimedDepth": 58.02494646409798,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 59.459966668502105,
        "sand": 58.02494646409798,
        "solid": 77.36659528546397,
        "concrete": 0,
        "discernment": 96.15384615384616,
        "falseConfidence": 3.8461538461538463,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 14.038461538461544,
        "capability": 69.23076923076923,
        "sandFrontierDifficulty": 400,
        "solidFrontierDifficulty": 400,
        "sampleDifficulties": [
          10,
          20,
          40,
          80,
          145,
          160,
          275,
          278,
          280,
          282,
          285,
          320,
          400
        ],
        "trialsByDifficulty": {
          "10": 2,
          "20": 2,
          "40": 2,
          "80": 2,
          "145": 2,
          "160": 2,
          "275": 2,
          "278": 2,
          "280": 2,
          "282": 2,
          "285": 2,
          "320": 2,
          "400": 2
        },
        "avgTrialsPerDifficulty": 2,
        "trialCount": 26,
        "difficultyRange": [
          10,
          400
        ],
        "transitionZone": 280
      }
    },
    "aggregate": {
      "avgClaimed": 61.80645402577222,
      "avgSand": 47.645686834115764,
      "avgSolid": 29.848767050988446,
      "avgConcrete": 7.603981965184733,
      "avgDiscernment": 60.416780189507456,
      "avgFalseConfidence": 35.86913086913087,
      "avgTrueUncertainty": 18.367440640167914,
      "avgCalibrationError": 31.962367076893724,
      "calibrationIndex": 68.03763292310627,
      "avgCapability": 24.06085142927248,
      "overconfidence": 22.74892927119095,
      "underconfidence": 4.952009488063627,
      "blindSpots": 35.86913086913087,
      "falseConfidence": 35.86913086913087,
      "totalGap": 63.57006962838545
    },
    "metadata": {
      "adapter": "openrouter",
      "temperature": 0.7,
      "totalTokensUsed": 603065,
      "totalPromptTokensUsed": 292777,
      "totalCompletionTokensUsed": 310288,
      "totalCost": 1.0772525000000008,
      "providerReportedCost": 1.0772525000000008,
      "estimatedCost": 0,
      "costMeasuredCalls": 600,
      "missingCostCalls": 0,
      "totalModelCalls": 600,
      "totalLatencyMs": 2817354,
      "averageLatencyMs": 4695.59,
      "runDurationMs": 1456768,
      "totalTrials": 200,
      "invalidTrials": 0
    }
  },
  {
    "modelId": "openai/gpt-oss-120b",
    "modelDisplayName": "openai/gpt-oss-120b",
    "timestamp": "2026-02-08T03:28:15.016Z",
    "categories": {
      "mult": {
        "category": "mult",
        "claimed": 99,
        "claimedDepth": 35.32597828021149,
        "claimedLoose": 35.68280634364797,
        "claimedThick": 35.68280634364797,
        "sand": 35.32597828021149,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 99,
        "capability": 50,
        "sandFrontierDifficulty": 26,
        "sampleDifficulties": [
          26
        ],
        "trialsByDifficulty": {
          "26": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          26,
          26
        ],
        "transitionZone": 26
      },
      "modexp": {
        "category": "modexp",
        "claimed": 97,
        "claimedDepth": 34.45576184435677,
        "claimedLoose": 35.52140396325441,
        "claimedThick": 35.52140396325441,
        "sand": 34.45576184435677,
        "solid": 0,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 97,
        "capability": 50,
        "sandFrontierDifficulty": 34,
        "concreteFrontierDifficulty": 34,
        "sampleDifficulties": [
          34
        ],
        "trialsByDifficulty": {
          "34": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          34,
          34
        ],
        "transitionZone": 34
      },
      "bool": {
        "category": "bool",
        "claimed": 0,
        "claimedDepth": 0,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 0,
        "solid": 35.68280634364797,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 100,
        "capability": 50,
        "solidFrontierDifficulty": 26,
        "sampleDifficulties": [
          26
        ],
        "trialsByDifficulty": {
          "26": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          26,
          26
        ],
        "transitionZone": 26
      },
      "matrix": {
        "category": "matrix",
        "claimed": 95,
        "claimedDepth": 36.6057610399442,
        "claimedLoose": 38.532380042046526,
        "claimedThick": 38.532380042046526,
        "sand": 36.6057610399442,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 95,
        "capability": 50,
        "sandFrontierDifficulty": 7,
        "sampleDifficulties": [
          7
        ],
        "trialsByDifficulty": {
          "7": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          7,
          7
        ],
        "transitionZone": 7
      },
      "combo": {
        "category": "combo",
        "claimed": 92,
        "claimedDepth": 35.78972861944567,
        "claimedLoose": 38.90187893418007,
        "claimedThick": 38.90187893418007,
        "sand": 35.78972861944567,
        "solid": 38.90187893418007,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 7.9999999999999964,
        "capability": 52.63157894736842,
        "sandFrontierDifficulty": 11,
        "solidFrontierDifficulty": 11,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "random": {
        "category": "random",
        "claimed": 98,
        "claimedDepth": 34.18590776292251,
        "claimedLoose": 34.883579349920936,
        "claimedThick": 34.883579349920936,
        "sand": 34.18590776292251,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 98,
        "capability": 50,
        "sandFrontierDifficulty": 1010,
        "sampleDifficulties": [
          1010
        ],
        "trialsByDifficulty": {
          "1010": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          1010,
          1010
        ],
        "transitionZone": 1010
      },
      "constrained": {
        "category": "constrained",
        "claimed": 92,
        "claimedDepth": 35.78972861944567,
        "claimedLoose": 38.90187893418007,
        "claimedThick": 38.90187893418007,
        "sand": 35.78972861944567,
        "solid": 23.34112736050804,
        "concrete": 23.34112736050804,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 32.00000000000001,
        "capability": 52.63157894736842,
        "sandFrontierDifficulty": 11,
        "solidFrontierDifficulty": 11,
        "concreteFrontierDifficulty": 11,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "sudoku": {
        "category": "sudoku",
        "claimed": 96,
        "claimedDepth": 41.27610000659151,
        "claimedLoose": 42.99593750686616,
        "claimedThick": 42.99593750686616,
        "sand": 41.27610000659151,
        "solid": 42.99593750686616,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 4.0000000000000036,
        "capability": 55.55555555555556,
        "sandFrontierDifficulty": 6,
        "solidFrontierDifficulty": 6,
        "sampleDifficulties": [
          6
        ],
        "trialsByDifficulty": {
          "6": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          6,
          6
        ],
        "transitionZone": 6
      },
      "distrib": {
        "category": "distrib",
        "claimed": 92,
        "claimedDepth": 32.11149591741985,
        "claimedLoose": 34.903799910238966,
        "claimedThick": 34.903799910238966,
        "sand": 32.11149591741985,
        "solid": 0,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 92,
        "capability": 50,
        "sandFrontierDifficulty": 505,
        "concreteFrontierDifficulty": 505,
        "sampleDifficulties": [
          505
        ],
        "trialsByDifficulty": {
          "505": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          505,
          505
        ],
        "transitionZone": 505
      },
      "selfref": {
        "category": "selfref",
        "claimed": 94,
        "claimedDepth": 36.567766198129256,
        "claimedLoose": 38.90187893418007,
        "claimedThick": 38.90187893418007,
        "sand": 36.567766198129256,
        "solid": 9.725469733545017,
        "concrete": 9.725469733545017,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 69,
        "capability": 52.63157894736842,
        "sandFrontierDifficulty": 11,
        "solidFrontierDifficulty": 11,
        "concreteFrontierDifficulty": 11,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "counting": {
        "category": "counting",
        "claimed": 10,
        "claimedDepth": 1.4652313947128708,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 1.4652313947128708,
        "solid": 0,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 10,
        "capability": 23.333333333333332,
        "sandFrontierDifficulty": 101,
        "concreteFrontierDifficulty": 101,
        "sampleDifficulties": [
          101
        ],
        "trialsByDifficulty": {
          "101": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          101,
          101
        ],
        "transitionZone": 101
      }
    },
    "aggregate": {
      "avgClaimed": 78.63636363636364,
      "avgSand": 29.415769062107255,
      "avgSolid": 13.695201807158844,
      "avgConcrete": 3.006054281277551,
      "avgDiscernment": 63.63636363636363,
      "avgFalseConfidence": 27.272727272727273,
      "avgTrueUncertainty": 45.45454545454545,
      "avgCalibrationError": 64,
      "calibrationIndex": 36,
      "avgCapability": 48.798511430090386,
      "overconfidence": 19.40373036028087,
      "underconfidence": 3.683163105332456,
      "blindSpots": 27.272727272727273,
      "falseConfidence": 27.272727272727273,
      "totalGap": 50.3596207383406
    },
    "metadata": {
      "adapter": "openrouter",
      "temperature": 0.7,
      "totalTokensUsed": 29650,
      "totalPromptTokensUsed": 0,
      "totalCompletionTokensUsed": 0,
      "costMeasuredCalls": 0,
      "missingCostCalls": 33,
      "totalModelCalls": 33,
      "totalLatencyMs": 239696,
      "averageLatencyMs": 7263.515151515152,
      "totalTrials": 11,
      "invalidTrials": 0
    }
  },
  {
    "modelId": "minimax/minimax-m2.1",
    "modelDisplayName": "minimax/minimax-m2.1",
    "timestamp": "2026-02-08T03:28:15.016Z",
    "categories": {
      "mult": {
        "category": "mult",
        "claimed": 99,
        "claimedDepth": 35.32597828021149,
        "claimedLoose": 35.68280634364797,
        "claimedThick": 35.68280634364797,
        "sand": 35.32597828021149,
        "solid": 0,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 99,
        "capability": 50,
        "sandFrontierDifficulty": 26,
        "concreteFrontierDifficulty": 26,
        "sampleDifficulties": [
          26
        ],
        "trialsByDifficulty": {
          "26": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          26,
          26
        ],
        "transitionZone": 26
      },
      "modexp": {
        "category": "modexp",
        "claimed": 100,
        "claimedDepth": 35.52140396325441,
        "claimedLoose": 35.52140396325441,
        "claimedThick": 35.52140396325441,
        "sand": 35.52140396325441,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 100,
        "capability": 50,
        "sandFrontierDifficulty": 34,
        "sampleDifficulties": [
          34
        ],
        "trialsByDifficulty": {
          "34": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          34,
          34
        ],
        "transitionZone": 34
      },
      "bool": {
        "category": "bool",
        "claimed": 0,
        "claimedDepth": 0,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 0,
        "solid": 35.68280634364797,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 100,
        "capability": 50,
        "solidFrontierDifficulty": 26,
        "sampleDifficulties": [
          26
        ],
        "trialsByDifficulty": {
          "26": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          26,
          26
        ],
        "transitionZone": 26
      },
      "matrix": {
        "category": "matrix",
        "claimed": 0,
        "claimedDepth": 0,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 0,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 0,
        "capability": 50,
        "sampleDifficulties": [
          7
        ],
        "trialsByDifficulty": {
          "7": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          7,
          7
        ],
        "transitionZone": 7
      },
      "combo": {
        "category": "combo",
        "claimed": 100,
        "claimedDepth": 38.90187893418007,
        "claimedLoose": 38.90187893418007,
        "claimedThick": 38.90187893418007,
        "sand": 38.90187893418007,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 100,
        "capability": 52.63157894736842,
        "sandFrontierDifficulty": 11,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "random": {
        "category": "random",
        "claimed": 95,
        "claimedDepth": 33.13940038242489,
        "claimedLoose": 34.883579349920936,
        "claimedThick": 34.883579349920936,
        "sand": 33.13940038242489,
        "solid": 0,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 95,
        "capability": 50,
        "sandFrontierDifficulty": 1010,
        "concreteFrontierDifficulty": 1010,
        "sampleDifficulties": [
          1010
        ],
        "trialsByDifficulty": {
          "1010": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          1010,
          1010
        ],
        "transitionZone": 1010
      },
      "constrained": {
        "category": "constrained",
        "claimed": 0,
        "claimedDepth": 0,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 0,
        "solid": 23.34112736050804,
        "concrete": 23.34112736050804,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 60,
        "capability": 52.63157894736842,
        "solidFrontierDifficulty": 11,
        "concreteFrontierDifficulty": 11,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "sudoku": {
        "category": "sudoku",
        "claimed": 97,
        "claimedDepth": 41.706059381660175,
        "claimedLoose": 42.99593750686616,
        "claimedThick": 42.99593750686616,
        "sand": 41.706059381660175,
        "solid": 28.66395833791077,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 30.333333333333336,
        "capability": 55.55555555555556,
        "sandFrontierDifficulty": 6,
        "solidFrontierDifficulty": 6,
        "sampleDifficulties": [
          6
        ],
        "trialsByDifficulty": {
          "6": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          6,
          6
        ],
        "transitionZone": 6
      },
      "distrib": {
        "category": "distrib",
        "claimed": 0,
        "claimedDepth": 0,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 0,
        "solid": 0,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 0,
        "capability": 50,
        "concreteFrontierDifficulty": 505,
        "sampleDifficulties": [
          505
        ],
        "trialsByDifficulty": {
          "505": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          505,
          505
        ],
        "transitionZone": 505
      },
      "selfref": {
        "category": "selfref",
        "claimed": 100,
        "claimedDepth": 38.90187893418007,
        "claimedLoose": 38.90187893418007,
        "claimedThick": 38.90187893418007,
        "sand": 38.90187893418007,
        "solid": 19.450939467090034,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 50,
        "capability": 52.63157894736842,
        "sandFrontierDifficulty": 11,
        "solidFrontierDifficulty": 11,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "counting": {
        "category": "counting",
        "claimed": 0,
        "claimedDepth": 0,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 0,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 0,
        "capability": 23.333333333333332,
        "sampleDifficulties": [
          101
        ],
        "trialsByDifficulty": {
          "101": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          101,
          101
        ],
        "transitionZone": 101
      }
    },
    "aggregate": {
      "avgClaimed": 53.72727272727273,
      "avgSand": 20.317872715991918,
      "avgSolid": 9.73989377355971,
      "avgConcrete": 2.1219206691370944,
      "avgDiscernment": 45.45454545454545,
      "avgFalseConfidence": 45.45454545454545,
      "avgTrueUncertainty": 36.36363636363637,
      "avgCalibrationError": 57.66666666666667,
      "calibrationIndex": 42.33333333333333,
      "avgCapability": 48.798511430090386,
      "overconfidence": 15.94379109735548,
      "underconfidence": 5.365812154923273,
      "blindSpots": 45.45454545454545,
      "falseConfidence": 45.45454545454545,
      "totalGap": 66.7641487068242
    },
    "metadata": {
      "adapter": "openrouter",
      "temperature": 0.7,
      "totalTokensUsed": 35439,
      "totalPromptTokensUsed": 0,
      "totalCompletionTokensUsed": 0,
      "costMeasuredCalls": 0,
      "missingCostCalls": 33,
      "totalModelCalls": 33,
      "totalLatencyMs": 639818,
      "averageLatencyMs": 19388.424242424244,
      "totalTrials": 11,
      "invalidTrials": 3
    }
  },
  {
    "modelId": "deepseek/deepseek-v3.2",
    "modelDisplayName": "deepseek/deepseek-v3.2",
    "timestamp": "2026-02-09T05:38:52.619Z",
    "categories": {
      "mult": {
        "category": "mult",
        "claimed": 67.5,
        "claimedDepth": 38.84300910521182,
        "claimedLoose": 45.69765777083744,
        "claimedThick": 45.69765777083744,
        "sand": 38.84300910521182,
        "solid": 4.337075506023829,
        "concrete": 0,
        "discernment": 50,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 17.500000000000004,
        "capability": 2.083333333333333,
        "sandFrontierDifficulty": 32,
        "solidFrontierDifficulty": 5,
        "sampleDifficulties": [
          2,
          3,
          4,
          5,
          8,
          16,
          32,
          50
        ],
        "trialsByDifficulty": {
          "2": 1,
          "3": 1,
          "4": 1,
          "5": 1,
          "8": 1,
          "16": 1,
          "32": 1,
          "50": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 8,
        "difficultyRange": [
          2,
          50
        ],
        "transitionZone": 3
      },
      "modexp": {
        "category": "modexp",
        "claimed": 96.22222222222223,
        "claimedDepth": 65.76160599264438,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 77.36659528546397,
        "sand": 65.76160599264438,
        "solid": 3.3712671192290995,
        "concrete": 0,
        "discernment": 22.22222222222222,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 74.00000000000001,
        "capability": 1.6666666666666667,
        "sandFrontierDifficulty": 64,
        "solidFrontierDifficulty": 7,
        "sampleDifficulties": [
          4,
          5,
          7,
          8,
          10,
          16,
          32,
          48,
          64
        ],
        "trialsByDifficulty": {
          "4": 1,
          "5": 1,
          "7": 1,
          "8": 1,
          "10": 1,
          "16": 1,
          "32": 1,
          "48": 1,
          "64": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 9,
        "difficultyRange": [
          4,
          64
        ],
        "transitionZone": 5
      },
      "bool": {
        "category": "bool",
        "claimed": 87.91666666666667,
        "claimedDepth": 65.76160599264438,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 77.36659528546397,
        "sand": 65.76160599264438,
        "solid": 77.36659528546397,
        "concrete": 0,
        "discernment": 58.333333333333336,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 29.58333333333334,
        "capability": 77.08333333333334,
        "sandFrontierDifficulty": 50,
        "solidFrontierDifficulty": 50,
        "sampleDifficulties": [
          2,
          5,
          10,
          20,
          21,
          34,
          35,
          37,
          39,
          41,
          44,
          50
        ],
        "trialsByDifficulty": {
          "2": 1,
          "5": 1,
          "10": 1,
          "20": 1,
          "21": 1,
          "34": 1,
          "35": 1,
          "37": 1,
          "39": 1,
          "41": 1,
          "44": 1,
          "50": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 12,
        "difficultyRange": [
          2,
          50
        ],
        "transitionZone": 39
      },
      "matrix": {
        "category": "matrix",
        "claimed": 92.375,
        "claimedDepth": 73.49826552119077,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 77.36659528546397,
        "sand": 73.49826552119077,
        "solid": 10.8927213040062,
        "concrete": 0,
        "discernment": 25,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 67.375,
        "capability": 20,
        "sandFrontierDifficulty": 12,
        "solidFrontierDifficulty": 3,
        "sampleDifficulties": [
          2,
          3,
          4,
          5,
          6,
          7,
          9,
          12
        ],
        "trialsByDifficulty": {
          "2": 1,
          "3": 1,
          "4": 1,
          "5": 1,
          "6": 1,
          "7": 1,
          "9": 1,
          "12": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 8,
        "difficultyRange": [
          2,
          12
        ],
        "transitionZone": 4
      },
      "combo": {
        "category": "combo",
        "claimed": 83.75,
        "claimedDepth": 65.76160599264438,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 77.36659528546397,
        "sand": 65.76160599264438,
        "solid": 23.132988185617602,
        "concrete": 0,
        "discernment": 50,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 33.75,
        "capability": 42.10526315789473,
        "sandFrontierDifficulty": 20,
        "solidFrontierDifficulty": 7,
        "sampleDifficulties": [
          1,
          3,
          4,
          5,
          6,
          7,
          9,
          10,
          11,
          14,
          15,
          20
        ],
        "trialsByDifficulty": {
          "1": 1,
          "3": 1,
          "4": 1,
          "5": 1,
          "6": 1,
          "7": 1,
          "9": 1,
          "10": 1,
          "11": 1,
          "14": 1,
          "15": 1,
          "20": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 12,
        "difficultyRange": [
          1,
          20
        ],
        "transitionZone": 9
      },
      "random": {
        "category": "random",
        "claimed": 1.1538461538461537,
        "claimedDepth": 3.868329764273199,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 3.868329764273199,
        "solid": 1.265710052862511,
        "concrete": 0,
        "discernment": 23.076923076923077,
        "falseConfidence": 38.46153846153847,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 43.968345223365546,
        "capability": 1.1363636363636365,
        "sandFrontierDifficulty": 2000,
        "solidFrontierDifficulty": 100,
        "sampleDifficulties": [
          20,
          31,
          38,
          41,
          43,
          45,
          48,
          50,
          100,
          250,
          500,
          1000,
          2000
        ],
        "trialsByDifficulty": {
          "20": 1,
          "31": 1,
          "38": 1,
          "41": 1,
          "43": 1,
          "45": 1,
          "48": 1,
          "50": 1,
          "100": 1,
          "250": 1,
          "500": 1,
          "1000": 1,
          "2000": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 13,
        "difficultyRange": [
          20,
          2000
        ],
        "transitionZone": 42.5
      },
      "constrained": {
        "category": "constrained",
        "claimed": 52.5,
        "claimedDepth": 33.34457514762404,
        "claimedLoose": 55.57429191270674,
        "claimedThick": 0,
        "sand": 33.34457514762404,
        "solid": 32.236081368943324,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 66.66666666666666,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 28.796296296296298,
        "capability": 0,
        "sandFrontierDifficulty": 15,
        "solidFrontierDifficulty": 20,
        "sampleDifficulties": [
          1,
          3,
          6,
          10,
          15,
          20
        ],
        "trialsByDifficulty": {
          "1": 1,
          "3": 1,
          "6": 1,
          "10": 1,
          "15": 1,
          "20": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 6,
        "difficultyRange": [
          1,
          20
        ],
        "transitionZone": 1
      },
      "sudoku": {
        "category": "sudoku",
        "claimed": 80,
        "claimedDepth": 58.02494646409798,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 26.97257908019835,
        "sand": 58.02494646409798,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 80,
        "capability": 0,
        "sandFrontierDifficulty": 10,
        "sampleDifficulties": [
          1,
          2,
          3,
          4,
          6,
          8,
          10
        ],
        "trialsByDifficulty": {
          "1": 1,
          "2": 1,
          "3": 1,
          "4": 1,
          "6": 1,
          "8": 1,
          "10": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 7,
        "difficultyRange": [
          1,
          10
        ],
        "transitionZone": 1
      },
      "distrib": {
        "category": "distrib",
        "claimed": 17.22222222222222,
        "claimedDepth": 11.604989292819596,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 11.604989292819596,
        "solid": 0.5293451641015707,
        "concrete": 0.5293451641015707,
        "discernment": 22.22222222222222,
        "falseConfidence": 0,
        "trueUncertainty": 22.22222222222222,
        "failureAwareness": 22.22222222222222,
        "calibrationError": 12.098765432098766,
        "capability": 0,
        "sandFrontierDifficulty": 1000,
        "solidFrontierDifficulty": 50,
        "concreteFrontierDifficulty": 500,
        "sampleDifficulties": [
          10,
          12,
          15,
          25,
          50,
          100,
          250,
          500,
          1000
        ],
        "trialsByDifficulty": {
          "10": 1,
          "12": 1,
          "15": 1,
          "25": 1,
          "50": 1,
          "100": 1,
          "250": 1,
          "500": 1,
          "1000": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 9,
        "difficultyRange": [
          10,
          1000
        ],
        "transitionZone": 10
      },
      "selfref": {
        "category": "selfref",
        "claimed": 61.666666666666664,
        "claimedDepth": 46.419957171278384,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 8.730888318383748,
        "sand": 46.419957171278384,
        "solid": 5.810556649304107,
        "concrete": 5.810556649304107,
        "discernment": 16.666666666666664,
        "falseConfidence": 16.666666666666664,
        "trueUncertainty": 16.666666666666664,
        "failureAwareness": 16.666666666666664,
        "calibrationError": 49.16666666666667,
        "capability": 0,
        "sandFrontierDifficulty": 20,
        "solidFrontierDifficulty": 10,
        "concreteFrontierDifficulty": 3,
        "sampleDifficulties": [
          1,
          3,
          6,
          10,
          15,
          20
        ],
        "trialsByDifficulty": {
          "1": 1,
          "3": 1,
          "6": 1,
          "10": 1,
          "15": 1,
          "20": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 6,
        "difficultyRange": [
          1,
          20
        ],
        "transitionZone": 1
      },
      "counting": {
        "category": "counting",
        "claimed": 90.38461538461539,
        "claimedDepth": 65.76160599264438,
        "claimedLoose": 77.36659528546397,
        "claimedThick": 77.36659528546397,
        "sand": 65.76160599264438,
        "solid": 34.965898785227765,
        "concrete": 0,
        "discernment": 69.23076923076923,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 21.153846153846157,
        "capability": 48.717948717948715,
        "sandFrontierDifficulty": 400,
        "solidFrontierDifficulty": 205,
        "sampleDifficulties": [
          10,
          20,
          40,
          80,
          105,
          160,
          195,
          198,
          200,
          202,
          205,
          320,
          400
        ],
        "trialsByDifficulty": {
          "10": 1,
          "20": 1,
          "40": 1,
          "80": 1,
          "105": 1,
          "160": 1,
          "195": 1,
          "198": 1,
          "200": 1,
          "202": 1,
          "205": 1,
          "320": 1,
          "400": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 13,
        "difficultyRange": [
          10,
          400
        ],
        "transitionZone": 200
      }
    },
    "aggregate": {
      "avgClaimed": 66.4264763014763,
      "avgSand": 48.05913603973394,
      "avgSolid": 17.628021765525457,
      "avgConcrete": 0.576354710309607,
      "avgDiscernment": 30.613830613830615,
      "avgFalseConfidence": 11.072261072261073,
      "avgTrueUncertainty": 3.535353535353535,
      "avgCalibrationError": 41.58111391869153,
      "calibrationIndex": 58.41888608130847,
      "avgCapability": 17.52662807686731,
      "overconfidence": 31.48611330082845,
      "underconfidence": 1.0549990266199634,
      "blindSpots": 11.072261072261073,
      "falseConfidence": 11.072261072261073,
      "totalGap": 43.61337339970948
    },
    "metadata": {
      "adapter": "openrouter",
      "temperature": 0.7,
      "totalTokensUsed": 106769,
      "totalPromptTokensUsed": 50069,
      "totalCompletionTokensUsed": 56700,
      "totalCost": 0.033884159000000004,
      "providerReportedCost": 0.033884159000000004,
      "estimatedCost": 0,
      "costMeasuredCalls": 254,
      "missingCostCalls": 55,
      "totalModelCalls": 309,
      "totalLatencyMs": 5109568,
      "averageLatencyMs": 16535.81877022654,
      "runDurationMs": 2546562,
      "totalTrials": 103,
      "invalidTrials": 54
    }
  },
  {
    "modelId": "moonshotai/kimi-k2.5",
    "modelDisplayName": "moonshotai/kimi-k2.5",
    "timestamp": "2026-02-08T04:42:44.963Z",
    "categories": {
      "mult": {
        "category": "mult",
        "claimed": 85,
        "claimedDepth": 30.330385392100773,
        "claimedLoose": 35.68280634364797,
        "claimedThick": 35.68280634364797,
        "sand": 30.330385392100773,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 85,
        "capability": 50,
        "sandFrontierDifficulty": 26,
        "sampleDifficulties": [
          26
        ],
        "trialsByDifficulty": {
          "26": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          26,
          26
        ],
        "transitionZone": 26
      },
      "modexp": {
        "category": "modexp",
        "claimed": 100,
        "claimedDepth": 35.52140396325441,
        "claimedLoose": 35.52140396325441,
        "claimedThick": 35.52140396325441,
        "sand": 35.52140396325441,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 100,
        "capability": 50,
        "sandFrontierDifficulty": 34,
        "sampleDifficulties": [
          34
        ],
        "trialsByDifficulty": {
          "34": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          34,
          34
        ],
        "transitionZone": 34
      },
      "bool": {
        "category": "bool",
        "claimed": 95,
        "claimedDepth": 33.89866602646557,
        "claimedLoose": 35.68280634364797,
        "claimedThick": 35.68280634364797,
        "sand": 33.89866602646557,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 95,
        "capability": 50,
        "sandFrontierDifficulty": 26,
        "sampleDifficulties": [
          26
        ],
        "trialsByDifficulty": {
          "26": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          26,
          26
        ],
        "transitionZone": 26
      },
      "matrix": {
        "category": "matrix",
        "claimed": 100,
        "claimedDepth": 38.532380042046526,
        "claimedLoose": 38.532380042046526,
        "claimedThick": 38.532380042046526,
        "sand": 38.532380042046526,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 100,
        "capability": 50,
        "sandFrontierDifficulty": 7,
        "sampleDifficulties": [
          7
        ],
        "trialsByDifficulty": {
          "7": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          7,
          7
        ],
        "transitionZone": 7
      },
      "combo": {
        "category": "combo",
        "claimed": 0,
        "claimedDepth": 0,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 0,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 0,
        "capability": 52.63157894736842,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "random": {
        "category": "random",
        "claimed": 100,
        "claimedDepth": 34.883579349920936,
        "claimedLoose": 34.883579349920936,
        "claimedThick": 34.883579349920936,
        "sand": 34.883579349920936,
        "solid": 0,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 100,
        "capability": 50,
        "sandFrontierDifficulty": 1010,
        "concreteFrontierDifficulty": 1010,
        "sampleDifficulties": [
          1010
        ],
        "trialsByDifficulty": {
          "1010": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          1010,
          1010
        ],
        "transitionZone": 1010
      },
      "constrained": {
        "category": "constrained",
        "claimed": 85,
        "claimedDepth": 33.06659709405306,
        "claimedLoose": 38.90187893418007,
        "claimedThick": 38.90187893418007,
        "sand": 33.06659709405306,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 85,
        "capability": 52.63157894736842,
        "sandFrontierDifficulty": 11,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "sudoku": {
        "category": "sudoku",
        "claimed": 0,
        "claimedDepth": 0,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 0,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 0,
        "capability": 55.55555555555556,
        "sampleDifficulties": [
          6
        ],
        "trialsByDifficulty": {
          "6": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          6,
          6
        ],
        "transitionZone": 6
      },
      "distrib": {
        "category": "distrib",
        "claimed": 95,
        "claimedDepth": 33.15860991472702,
        "claimedLoose": 34.903799910238966,
        "claimedThick": 34.903799910238966,
        "sand": 33.15860991472702,
        "solid": 0,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 95,
        "capability": 50,
        "sandFrontierDifficulty": 505,
        "concreteFrontierDifficulty": 505,
        "sampleDifficulties": [
          505
        ],
        "trialsByDifficulty": {
          "505": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          505,
          505
        ],
        "transitionZone": 505
      },
      "selfref": {
        "category": "selfref",
        "claimed": 0,
        "claimedDepth": 0,
        "claimedLoose": 0,
        "claimedThick": 0,
        "sand": 0,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 0,
        "capability": 52.63157894736842,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "counting": {
        "category": "counting",
        "claimed": 95,
        "claimedDepth": 13.919698249772269,
        "claimedLoose": 14.652313947128706,
        "claimedThick": 14.652313947128706,
        "sand": 13.919698249772269,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 95,
        "capability": 23.333333333333332,
        "sandFrontierDifficulty": 101,
        "sampleDifficulties": [
          101
        ],
        "trialsByDifficulty": {
          "101": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          101,
          101
        ],
        "transitionZone": 101
      }
    },
    "aggregate": {
      "avgClaimed": 68.63636363636364,
      "avgSand": 23.02830182112187,
      "avgSolid": 0,
      "avgConcrete": 0,
      "avgDiscernment": 18.181818181818183,
      "avgFalseConfidence": 9.090909090909092,
      "avgTrueUncertainty": 18.181818181818183,
      "avgCalibrationError": 68.63636363636364,
      "calibrationIndex": 31.36363636363636,
      "avgCapability": 48.798511430090386,
      "overconfidence": 23.02830182112187,
      "underconfidence": 0,
      "blindSpots": 9.090909090909092,
      "falseConfidence": 9.090909090909092,
      "totalGap": 32.119210912030965
    },
    "metadata": {
      "adapter": "openrouter",
      "temperature": 0.7,
      "totalTokensUsed": 60252,
      "totalPromptTokensUsed": 0,
      "totalCompletionTokensUsed": 0,
      "costMeasuredCalls": 0,
      "missingCostCalls": 33,
      "totalModelCalls": 33,
      "totalLatencyMs": 620806,
      "averageLatencyMs": 18812.303030303032,
      "totalTrials": 11,
      "invalidTrials": 9
    }
  },
  {
    "modelId": "x-ai/grok-4.1-fast",
    "modelDisplayName": "x-ai/grok-4.1-fast",
    "timestamp": "2026-02-08T03:28:15.016Z",
    "categories": {
      "mult": {
        "category": "mult",
        "claimed": 100,
        "claimedDepth": 35.68280634364797,
        "claimedLoose": 35.68280634364797,
        "claimedThick": 35.68280634364797,
        "sand": 35.68280634364797,
        "solid": 0,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 100,
        "capability": 50,
        "sandFrontierDifficulty": 26,
        "concreteFrontierDifficulty": 26,
        "sampleDifficulties": [
          26
        ],
        "trialsByDifficulty": {
          "26": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          26,
          26
        ],
        "transitionZone": 26
      },
      "modexp": {
        "category": "modexp",
        "claimed": 100,
        "claimedDepth": 35.52140396325441,
        "claimedLoose": 35.52140396325441,
        "claimedThick": 35.52140396325441,
        "sand": 35.52140396325441,
        "solid": 0,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 100,
        "capability": 50,
        "sandFrontierDifficulty": 34,
        "sampleDifficulties": [
          34
        ],
        "trialsByDifficulty": {
          "34": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          34,
          34
        ],
        "transitionZone": 34
      },
      "bool": {
        "category": "bool",
        "claimed": 100,
        "claimedDepth": 35.68280634364797,
        "claimedLoose": 35.68280634364797,
        "claimedThick": 35.68280634364797,
        "sand": 35.68280634364797,
        "solid": 35.68280634364797,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 0,
        "capability": 50,
        "sandFrontierDifficulty": 26,
        "solidFrontierDifficulty": 26,
        "sampleDifficulties": [
          26
        ],
        "trialsByDifficulty": {
          "26": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          26,
          26
        ],
        "transitionZone": 26
      },
      "matrix": {
        "category": "matrix",
        "claimed": 100,
        "claimedDepth": 38.532380042046526,
        "claimedLoose": 38.532380042046526,
        "claimedThick": 38.532380042046526,
        "sand": 38.532380042046526,
        "solid": 38.532380042046526,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 0,
        "capability": 50,
        "sandFrontierDifficulty": 7,
        "solidFrontierDifficulty": 7,
        "sampleDifficulties": [
          7
        ],
        "trialsByDifficulty": {
          "7": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          7,
          7
        ],
        "transitionZone": 7
      },
      "combo": {
        "category": "combo",
        "claimed": 100,
        "claimedDepth": 38.90187893418007,
        "claimedLoose": 38.90187893418007,
        "claimedThick": 38.90187893418007,
        "sand": 38.90187893418007,
        "solid": 38.90187893418007,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 0,
        "capability": 52.63157894736842,
        "sandFrontierDifficulty": 11,
        "solidFrontierDifficulty": 11,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "random": {
        "category": "random",
        "claimed": 100,
        "claimedDepth": 34.883579349920936,
        "claimedLoose": 34.883579349920936,
        "claimedThick": 34.883579349920936,
        "sand": 34.883579349920936,
        "solid": 15.139243183216507,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 56.60066006600661,
        "capability": 50,
        "sandFrontierDifficulty": 1010,
        "solidFrontierDifficulty": 1010,
        "sampleDifficulties": [
          1010
        ],
        "trialsByDifficulty": {
          "1010": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          1010,
          1010
        ],
        "transitionZone": 1010
      },
      "constrained": {
        "category": "constrained",
        "claimed": 85,
        "claimedDepth": 33.06659709405306,
        "claimedLoose": 38.90187893418007,
        "claimedThick": 38.90187893418007,
        "sand": 33.06659709405306,
        "solid": 15.560751573672027,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 44.99999999999999,
        "capability": 52.63157894736842,
        "sandFrontierDifficulty": 11,
        "solidFrontierDifficulty": 11,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "sudoku": {
        "category": "sudoku",
        "claimed": 100,
        "claimedDepth": 42.99593750686616,
        "claimedLoose": 42.99593750686616,
        "claimedThick": 42.99593750686616,
        "sand": 42.99593750686616,
        "solid": 42.99593750686616,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 0,
        "capability": 55.55555555555556,
        "sandFrontierDifficulty": 6,
        "solidFrontierDifficulty": 6,
        "sampleDifficulties": [
          6
        ],
        "trialsByDifficulty": {
          "6": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          6,
          6
        ],
        "transitionZone": 6
      },
      "distrib": {
        "category": "distrib",
        "claimed": 95,
        "claimedDepth": 33.15860991472702,
        "claimedLoose": 34.903799910238966,
        "claimedThick": 34.903799910238966,
        "sand": 33.15860991472702,
        "solid": 0,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 100,
        "failureAwareness": 100,
        "calibrationError": 95,
        "capability": 50,
        "sandFrontierDifficulty": 505,
        "concreteFrontierDifficulty": 505,
        "sampleDifficulties": [
          505
        ],
        "trialsByDifficulty": {
          "505": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          505,
          505
        ],
        "transitionZone": 505
      },
      "selfref": {
        "category": "selfref",
        "claimed": 75,
        "claimedDepth": 29.17640920063505,
        "claimedLoose": 38.90187893418007,
        "claimedThick": 0,
        "sand": 29.17640920063505,
        "solid": 19.450939467090034,
        "concrete": 0,
        "discernment": 0,
        "falseConfidence": 100,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 25,
        "capability": 52.63157894736842,
        "sandFrontierDifficulty": 11,
        "solidFrontierDifficulty": 11,
        "sampleDifficulties": [
          11
        ],
        "trialsByDifficulty": {
          "11": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          11,
          11
        ],
        "transitionZone": 11
      },
      "counting": {
        "category": "counting",
        "claimed": 100,
        "claimedDepth": 14.652313947128706,
        "claimedLoose": 14.652313947128706,
        "claimedThick": 14.652313947128706,
        "sand": 14.652313947128706,
        "solid": 14.652313947128706,
        "concrete": 0,
        "discernment": 100,
        "falseConfidence": 0,
        "trueUncertainty": 0,
        "failureAwareness": 0,
        "calibrationError": 0,
        "capability": 23.333333333333332,
        "sandFrontierDifficulty": 101,
        "solidFrontierDifficulty": 101,
        "sampleDifficulties": [
          101
        ],
        "trialsByDifficulty": {
          "101": 1
        },
        "avgTrialsPerDifficulty": 1,
        "trialCount": 1,
        "difficultyRange": [
          101,
          101
        ],
        "transitionZone": 101
      }
    },
    "aggregate": {
      "avgClaimed": 95.9090909090909,
      "avgSand": 33.841338421828,
      "avgSolid": 20.08329554525891,
      "avgConcrete": 0,
      "avgDiscernment": 63.63636363636363,
      "avgFalseConfidence": 27.272727272727273,
      "avgTrueUncertainty": 18.181818181818183,
      "avgCalibrationError": 38.32733273327333,
      "calibrationIndex": 61.67266726672667,
      "avgCapability": 48.798511430090386,
      "overconfidence": 13.75804287656908,
      "underconfidence": 0,
      "blindSpots": 27.272727272727273,
      "falseConfidence": 27.272727272727273,
      "totalGap": 41.03077014929635
    },
    "metadata": {
      "adapter": "openrouter",
      "temperature": 0.7,
      "totalTokensUsed": 221391,
      "totalPromptTokensUsed": 0,
      "totalCompletionTokensUsed": 0,
      "costMeasuredCalls": 0,
      "missingCostCalls": 33,
      "totalModelCalls": 33,
      "totalLatencyMs": 1128858,
      "averageLatencyMs": 34207.818181818184,
      "totalTrials": 11,
      "invalidTrials": 1
    }
  }
];
