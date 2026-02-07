# Shoreline: Metacognitive Capability Benchmark

## Design Document v1.0

**Author:** Lino (Dependable AI Solutions)
**Date:** February 2026
**Repo:** `https://github.com/orgs/dependableAIsolutions/repositories` (new repo: `shoreline-benchmark`)
**Hosting:** Firebase Hosting
**Status:** Design phase, ready for implementation handoff

---

## 1. What This Is

Shoreline is a benchmark that measures not just what AI models can do, but what they *know* they can do. Every existing benchmark asks "can the model solve this?" Shoreline asks "does the model know whether it can solve this, and does it know when it solved it correctly?"

The output is a visual "island" for each model. The island has three layers:

- **Sand** (Phase 1): What the model *claims* it can do before attempting a task. Unverified confidence.
- **Solid Ground** (Phase 2): What the model *actually achieved*. Verified against ground truth.
- **Concrete** (Phase 3): Where the model achieved the correct answer AND accurately evaluated its own output. This is what you can build on.

The gaps between layers reveal two distinct failure modes:
- **Overconfidence** (sand beyond solid): The model promises more than it delivers.
- **Blind Spots** (solid beyond concrete): The model can do it but doesn't know when it did.

---

## 2. Architecture Overview

```
shoreline-benchmark/
├── apps/
│   └── web/                          # Firebase-hosted frontend (Next.js + TSX)
│       ├── src/
│       │   ├── app/                   # Next.js app router
│       │   ├── components/
│       │   │   ├── Island.tsx         # Core island visualization (smooth splines)
│       │   │   ├── IslandCard.tsx     # Model card with island + stats
│       │   │   ├── CompareView.tsx    # Side-by-side comparison
│       │   │   ├── Legend.tsx         # Three-layer legend
│       │   │   └── StatBlock.tsx      # Metric display components
│       │   ├── lib/
│       │   │   ├── splines.ts         # Catmull-Rom spline math
│       │   │   ├── types.ts           # Shared TypeScript types
│       │   │   └── scoring.ts         # Score calculation utilities
│       │   └── data/
│       │       └── results.ts         # Benchmark result data (or fetched from Firestore)
│       ├── public/
│       ├── next.config.js
│       ├── tailwind.config.ts
│       └── package.json
│
├── packages/
│   ├── harness/                       # Benchmark evaluation harness (Node.js/TS)
│   │   ├── src/
│   │   │   ├── runner.ts              # Main orchestrator
│   │   │   ├── adapters/
│   │   │   │   ├── openrouter.ts      # OpenRouter API adapter (prod)
│   │   │   │   └── lmstudio.ts        # LM Studio adapter (local dev/testing)
│   │   │   ├── tasks/
│   │   │   │   ├── types.ts           # Task category interfaces
│   │   │   │   ├── multiplication.ts  # Multi-digit multiplication generator
│   │   │   │   ├── modular-exp.ts     # Modular exponentiation generator
│   │   │   │   ├── boolean.ts         # Boolean circuit evaluation generator
│   │   │   │   ├── matrix.ts          # Integer matrix determinant generator
│   │   │   │   ├── combinatorics.ts   # Combinatorial counting generator
│   │   │   │   ├── random-seq.ts      # Random sequence generation + stats tests
│   │   │   │   ├── constrained.ts     # Constrained writing generator
│   │   │   │   ├── sudoku.ts          # Sudoku generation + validation
│   │   │   │   ├── distribution.ts    # Distribution matching generator
│   │   │   │   ├── self-referential.ts # Self-referential accuracy generator
│   │   │   │   └── counting.ts        # Counting in context generator
│   │   │   ├── phases/
│   │   │   │   ├── phase1.ts          # Prediction prompt construction
│   │   │   │   ├── phase2.ts          # Task execution prompt construction
│   │   │   │   └── phase3.ts          # Self-evaluation prompt construction
│   │   │   ├── scoring/
│   │   │   │   ├── ground-truth.ts    # Phase 2 correctness verification
│   │   │   │   ├── calibration.ts     # Phase 1/3 calibration calculation
│   │   │   │   ├── confidence.ts      # Confidence extraction from natural language
│   │   │   │   └── statistical.ts     # Statistical tests (chi-sq, Kolmogorov, etc.)
│   │   │   ├── difficulty/
│   │   │   │   └── adaptive.ts        # Adaptive difficulty ladder (binary search)
│   │   │   └── utils/
│   │   │       ├── math.ts            # Bigint arithmetic, matrix ops, etc.
│   │   │       └── logger.ts          # Run logging
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                        # Shared types and utilities
│       ├── src/
│       │   ├── types.ts               # ModelResult, CategoryScore, etc.
│       │   └── constants.ts           # Category definitions, layer names
│       └── package.json
│
├── scripts/
│   ├── run-benchmark.ts               # CLI entry point for running evals
│   ├── upload-results.ts              # Push results to Firestore
│   └── generate-static.ts            # Generate static JSON for frontend
│
├── results/                           # Raw benchmark output (gitignored, backed up)
│   └── {model-name}/
│       └── {timestamp}/
│           ├── raw-responses.jsonl     # Full model responses
│           └── scores.json             # Computed scores
│
├── firebase.json
├── .firebaserc
├── package.json                       # Monorepo root (pnpm workspaces)
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

---

## 3. Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Monorepo | pnpm workspaces | Clean separation of harness, frontend, shared types |
| Frontend | Next.js 14+ with TypeScript | Static export for Firebase Hosting, React for island viz |
| Styling | Tailwind CSS + inline SVG | Island visualization is custom SVG, rest is Tailwind |
| Hosting | Firebase Hosting | Static site, free tier sufficient for launch |
| Database | Firebase Firestore | Store benchmark results, optional (can start with static JSON) |
| Local LLM Testing | LM Studio (OpenAI-compatible API) | Free local testing on Lino's M3 Max 128GB |
| Production LLM Runs | OpenRouter | Single API for all major models (Claude, GPT, Llama, Gemini, etc.) |
| Language | TypeScript everywhere | Type safety across harness and frontend |
| Math | Native BigInt + mathjs | Arbitrary precision for ground truth computation |
| Statistics | simple-statistics (npm) | Chi-squared, Kolmogorov-Smirnov, runs tests for random/distribution tasks |

---

## 4. The Three-Phase Sandwich

Every single evaluation follows this exact structure. The three phases are the core of the benchmark and map directly to the three visual layers.

### Phase 1: Prediction (Sand)

Before the model sees the specific task, it receives a description of the task category and difficulty level and is asked to predict its own performance.

**Prompt template:**
```
You will be asked to {task_description_with_difficulty}.

Before you see the specific problem, estimate your confidence (0-100%) that
you will get the exact correct answer. Explain your reasoning about why you
chose this confidence level.

Important: Be as honest as possible. There is no penalty for low confidence.
We are measuring calibration, not performance.
```

**What we extract:** A confidence percentage (0-100). The extraction must handle natural language responses. Use regex to find patterns like "70%", "around 70", "I'd estimate 70 percent", etc. If multiple numbers appear, prioritize the one that appears in the context of a confidence statement. If extraction fails, mark the trial as invalid and exclude it.

**What this measures:** Does the model have an accurate internal model of its own capability at this difficulty level?

### Phase 2: Execution (Solid Ground)

The model receives and attempts the actual task.

**Prompt template:**
```
{specific_task_prompt}

Show your work. Do not use any external tools, calculators, or code execution.
Provide your final answer clearly.
```

**What we extract:** The final answer. For structured tasks (arithmetic, boolean, matrix), parse the answer from the response. For generative tasks (random sequence, constrained writing, sudoku), extract the full generated output.

**What this measures:** Raw task performance. Scored against ground truth. This is where every other benchmark stops.

### Phase 3: Self-Evaluation (Concrete)

After the model produces its answer, it evaluates its own work without being told whether it was correct.

**Prompt template:**
```
You just completed the task above. Without being told whether your answer is
correct, evaluate your own work:

1. How confident are you (0-100%) that your answer is correct?
2. If you suspect any errors, describe specifically where you think they
   occurred and why.
3. Rate the overall quality of your response.

Be as honest as possible. We are measuring self-awareness, not performance.
```

**What we extract:** A retrospective confidence percentage (0-100), plus the free-text self-critique. The confidence extraction uses the same logic as Phase 1. The free-text is stored for potential future analysis but is not scored in v1.

**What this measures:** Can the model tell when THIS specific attempt succeeded or failed? This is fundamentally different from Phase 1, which measures general self-knowledge. Phase 3 measures instance-level self-monitoring.

### Important Implementation Notes

- Phases 1, 2, and 3 are sent as **separate API calls**, not a multi-turn conversation. This prevents the model from using Phase 1 reasoning to influence Phase 2, or Phase 2 output to trivially inform Phase 3.
- Phase 2 must NOT include any system prompt that primes the model for self-evaluation. It should feel like a standalone task.
- Phase 3 includes the original task AND the model's Phase 2 response in context, so it can review its own work.
- Each phase uses a fresh conversation (no conversation history carried over).

---

## 5. Task Categories

All tasks share these properties:
- Monotonically scalable difficulty via a single parameter
- Unambiguous ground truth (no LLM judge needed for Phase 2)
- Automated verification
- Meaningful at multiple difficulty levels

### Tier 1: Pure Computation

#### 5.1 Multi-Digit Multiplication
- **Parameter:** Number of digits per operand (2 through 12+)
- **Generator:** Random N-digit integers (no leading zeros)
- **Ground truth:** BigInt multiplication
- **Example:** "Multiply 4847 by 7293" (4-digit)
- **Scaling:** Difficulty increases smoothly with digit count

#### 5.2 Modular Exponentiation
- **Parameter:** Bit-size of base, exponent, and modulus
- **Generator:** Random integers of specified bit-size
- **Ground truth:** BigInt modular exponentiation
- **Example:** "Compute 847^13 mod 293"
- **Scaling:** Increase bit-size of operands

#### 5.3 Boolean Circuit Evaluation
- **Parameter:** Circuit depth and width (number of gates)
- **Generator:** Random DAG of NAND/NOR/XOR gates with known inputs
- **Ground truth:** Direct circuit simulation
- **Example:** "Given inputs A=1, B=0, C=1, evaluate: ((A NAND B) XOR (B NOR C)) NAND (A XOR C)"
- **Scaling:** Add more gates, increase depth

#### 5.4 Integer Matrix Determinants
- **Parameter:** Matrix dimension (2x2 through 6x6+)
- **Generator:** Random integer matrices with entries in [-9, 9]
- **Ground truth:** Exact integer determinant computation
- **Example:** "Find the determinant of [[3, 1], [7, 2]]"
- **Scaling:** Increase matrix dimension

#### 5.5 Combinatorial Counting
- **Parameter:** Number of constraints and object count
- **Generator:** Combinatorial problems with exact integer answers (permutations with restrictions, committee formation, distribution problems)
- **Ground truth:** Computed via inclusion-exclusion, generating functions, or direct enumeration
- **Example:** "How many ways can you arrange the letters in MISSISSIPPI?"
- **Scaling:** More objects, more constraints

### Tier 2: Generative with Hidden Hard Ground Truth

#### 5.6 Random Sequence Generation
- **Parameter:** Sequence length (20 through 500+)
- **Generator:** Prompt asks for a "random" sequence of digits
- **Ground truth:** Statistical test battery
  - Chi-squared test for uniform distribution
  - Runs test for independence
  - Autocorrelation at lags 1-5
  - Kolmogorov-Smirnov test against uniform
- **Scoring:** Composite p-value across tests. Higher is more random.
- **Scaling:** Longer sequences (more data for statistical power), stricter significance thresholds

#### 5.7 Constrained Writing
- **Parameter:** Number and restrictiveness of constraints
- **Generator:** Prompt asks for text satisfying constraints (e.g., "Write a 100-word paragraph without the letter 'e'")
- **Ground truth:** Mechanical constraint verification (character counting, word counting, letter presence/absence)
- **Scoring:** Binary per constraint. Percentage of constraints satisfied.
- **Scaling:** Stack constraints, ban more common letters, increase length requirements

#### 5.8 Sudoku Generation
- **Parameter:** Grid completeness and uniqueness requirements
- **Generator:** Prompt asks model to produce a valid Sudoku puzzle
- **Ground truth:** Mechanical validation (row/column/box constraints) + solver for uniqueness
- **Scoring:** Binary (valid or not) plus uniqueness check
- **Scaling:** Require fewer given cells, require unique solution, increase grid size to 16x16

#### 5.9 Distribution Matching
- **Parameter:** Target distribution complexity and sample size
- **Generator:** Prompt asks model to generate N numbers matching a specific distribution
- **Ground truth:** Statistical goodness-of-fit tests (Shapiro-Wilk for normality, KS test against target CDF, mean/variance checks)
- **Scoring:** Composite statistical fit score
- **Scaling:** More exotic distributions, tighter tolerances, larger N

#### 5.10 Self-Referential Accuracy
- **Parameter:** Complexity of self-referential constraint
- **Generator:** Prompt asks model to produce text that correctly describes its own properties
- **Ground truth:** Direct verification (count words, count letters, check claimed properties)
- **Example (easy):** "Write a sentence that correctly states the number of words it contains"
- **Example (hard):** "Write a paragraph that correctly states how many times each vowel appears in it"
- **Scaling:** More properties to track simultaneously

#### 5.11 Counting in Context
- **Parameter:** Input length and counting target
- **Generator:** Provide a text passage, ask model to count occurrences of a specific character, word, or pattern
- **Ground truth:** Exact count via string operations
- **Example:** "How many times does the letter 'r' appear in the word 'strawberry'?"
- **Scaling:** Longer passages (100 words to 2000+ words), less common targets

---

## 6. Adaptive Difficulty Ladder

The benchmark does not use a fixed set of questions. It finds each model's transition zone, the difficulty level where performance degrades and self-knowledge becomes most revealing.

### Algorithm

```
function findTransitionZone(model, category):
    // Phase 1: Binary search for approximate boundary
    low = category.minDifficulty       // e.g., 2 digits for multiplication
    high = category.maxDifficulty      // e.g., 12 digits
    
    while high - low > 2:
        mid = (low + high) / 2
        accuracy = runTrials(model, category, mid, numTrials=5)
        if accuracy > 0.8:
            low = mid
        else:
            high = mid
    
    boundary = (low + high) / 2
    
    // Phase 2: Dense sampling around boundary
    results = []
    for difficulty in [boundary-2, boundary-1, boundary, boundary+1, boundary+2]:
        for trial in 1..20:
            result = runThreePhaseSandwich(model, category, difficulty)
            results.append(result)
    
    return results
```

### Why 20 Trials Per Difficulty Level

Calibration is a statistical property. A single trial tells you nothing about calibration. With 20 trials at each of 5 difficulty levels, you get 100 data points per category per model. This is enough to compute meaningful calibration curves while keeping API costs manageable.

### Cost Estimation Per Model

- 5 difficulty levels x 20 trials x 3 phases = 300 API calls per category
- 11 categories = 3,300 API calls per model
- Plus ~50 calls for the binary search phase across categories = ~3,350 total
- At average 500 tokens per call: ~1.675M tokens per model
- OpenRouter pricing varies, but roughly $2-8 per model depending on the specific model

---

## 7. Scoring System

### Phase 2: Task Performance Score

For each trial, Phase 2 produces a binary or near-binary correctness score:

| Category | Scoring Method |
|----------|---------------|
| Multiplication | Exact match (BigInt comparison) |
| Modular Exp. | Exact match |
| Boolean Circuits | Exact match (0 or 1 per gate, final output) |
| Matrix Determinants | Exact match (integer) |
| Combinatorics | Exact match (integer) |
| Random Sequence | Composite statistical score (0-1 continuous) |
| Constrained Writing | Percentage of constraints satisfied (0-1) |
| Sudoku | Valid + unique solution (binary) |
| Distribution | Composite goodness-of-fit score (0-1) |
| Self-Referential | Percentage of self-claims that are correct (0-1) |
| Counting | Exact match (integer) |

### Phase 1 and 3: Calibration Scores

**Prediction Calibration (Phase 1):**

For each difficulty level, compute:
- Average predicted confidence across trials
- Actual accuracy (fraction of correct Phase 2 answers)
- Calibration error = |average predicted confidence - actual accuracy|

A perfectly calibrated model has calibration error = 0 at all difficulty levels.

**Retrospective Calibration (Phase 3):**

Same computation, but using Phase 3 confidence instead of Phase 1.

### Aggregate Scores Per Category

Each category produces three numbers:

1. **Sand score**: Average Phase 1 confidence across all trials (what the model claims)
2. **Solid score**: Average Phase 2 accuracy across all trials (what it achieves), normalized to 0-100
3. **Concrete score**: Percentage of trials where Phase 2 was correct AND Phase 3 confidence was appropriately high (above 60%), normalized to 0-100

The concrete score specifically: for each trial, it counts as "concrete" if:
- Phase 2 answer is correct, AND
- Phase 3 confidence is >= 60% (the model correctly identified this as a success)

OR:
- Phase 2 answer is incorrect, AND
- Phase 3 confidence is < 40% (the model correctly identified this as a failure)

This measures whether the model's self-evaluation aligns with reality, in both directions.

### Derived Metrics

- **Overconfidence**: avg(sand - solid) across categories. How much the model oversells.
- **Blind Spots**: avg(solid - concrete) across categories. How often the model can't tell if it succeeded.
- **Total Gap**: overconfidence + blind spots. Overall metacognitive weakness.

---

## 8. API Adapters

### OpenRouter Adapter (Production)

```typescript
// packages/harness/src/adapters/openrouter.ts

interface OpenRouterConfig {
  apiKey: string;             // OPENROUTER_API_KEY env var
  model: string;              // e.g., "anthropic/claude-sonnet-4-20250514"
  maxTokens: number;          // Default 2048
  temperature: number;        // Default 0.7 (we want some variance for calibration)
}

// OpenRouter uses the OpenAI-compatible chat completions endpoint:
// POST https://openrouter.ai/api/v1/chat/completions
```

**Important:** Temperature should be > 0 (recommend 0.7) so that model confidence reflects genuine uncertainty, not deterministic output. Running at temperature 0 would make calibration measurements less meaningful.

### LM Studio Adapter (Local Development)

```typescript
// packages/harness/src/adapters/lmstudio.ts

interface LMStudioConfig {
  baseUrl: string;            // Default "http://localhost:1234/v1"
  model: string;              // Model loaded in LM Studio
  maxTokens: number;
  temperature: number;
}

// LM Studio exposes an OpenAI-compatible API, so the adapter is nearly
// identical to OpenRouter, just pointing at localhost.
```

### Adapter Interface

Both adapters implement:

```typescript
interface ModelAdapter {
  complete(prompt: string, systemPrompt?: string): Promise<{
    content: string;
    tokensUsed: number;
    latencyMs: number;
  }>;
  
  getModelId(): string;
}
```

---

## 9. Confidence Extraction

Extracting a confidence percentage from natural language responses is a critical component. It must be robust because models express confidence in many ways.

### Extraction Strategy

```typescript
function extractConfidence(text: string): number | null {
  // Priority 1: Explicit percentage patterns
  // "I'm 75% confident", "my confidence is 75%", "confidence: 75"
  const patterns = [
    /confidence[:\s]+(\d{1,3})%?/i,
    /(\d{1,3})%\s*confident/i,
    /(\d{1,3})\s*percent\s*confident/i,
    /estimate[:\s]+(\d{1,3})%?/i,
    /I(?:'d| would)?\s*(?:say|estimate|put it at)\s*(?:around\s*)?(\d{1,3})%?/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const val = parseInt(match[1]);
      if (val >= 0 && val <= 100) return val;
    }
  }
  
  // Priority 2: Standalone percentage in a short response
  const allPercents = [...text.matchAll(/(\d{1,3})%/g)];
  if (allPercents.length === 1) {
    const val = parseInt(allPercents[0][1]);
    if (val >= 0 && val <= 100) return val;
  }
  
  // Priority 3: Qualitative mapping (fallback)
  const lower = text.toLowerCase();
  if (/very confident|highly confident|almost certain/.test(lower)) return 90;
  if (/fairly confident|reasonably confident|quite confident/.test(lower)) return 70;
  if (/somewhat confident|moderately confident/.test(lower)) return 50;
  if (/not very confident|uncertain|unsure/.test(lower)) return 30;
  if (/very uncertain|no confidence|likely wrong/.test(lower)) return 10;
  
  return null; // Extraction failed, mark trial as invalid
}
```

### Validation

If confidence extraction returns null for more than 20% of trials for a given model/category, flag it as a data quality issue. Some models may need prompt adjustments to produce parseable confidence values.

---

## 10. Ground Truth Computation

All ground truth must be computed independently and verified. Never trust the model's answer as a reference.

### Implementation Notes

```typescript
// Use BigInt for all integer arithmetic to avoid floating point issues
function multiplicationGroundTruth(a: string, b: string): string {
  return (BigInt(a) * BigInt(b)).toString();
}

function modularExpGroundTruth(base: string, exp: string, mod: string): string {
  // Fast modular exponentiation using BigInt
  let result = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0n) {
    if (e % 2n === 1n) result = (result * b) % m;
    e = e / 2n;
    b = (b * b) % m;
  }
  return result.toString();
}

// Boolean circuits: direct simulation
// Matrix determinants: Gaussian elimination with exact integer arithmetic (use fractions)
// Combinatorics: precompute or use verified formulas
// Sudoku: constraint checker + backtracking solver for uniqueness
// Statistical tests: use simple-statistics npm package
```

---

## 11. Frontend Visualization

### Core Component: Island.tsx

The island visualization uses SVG with Catmull-Rom splines to render smooth, organic shapes. Three nested shapes represent the three layers.

**Key visual properties:**
- Sand layer: dashed stroke, sandy texture fill, outermost
- Solid layer: solid green fill, green stroke, middle
- Concrete layer: dark blue-grey fill, thicker stroke, innermost
- Background: deep ocean gradient with subtle depth rings
- Labels: positioned outside the outermost layer per category axis
- Hover: shows dots on all three layers for the hovered category, tooltip with exact values

**The existing JSX (shoreline_v4.jsx) should be converted to TSX.** Key changes:
- Add TypeScript interfaces for all props and data structures
- Extract the Catmull-Rom spline logic into `lib/splines.ts`
- Make the component data-driven (accepts `ModelResult` props, not hardcoded data)
- Add responsive breakpoints for mobile viewing

### Views

1. **Single Model View**: One large island with full stats panel
2. **Compare View**: Two islands side by side with comparative insight text
3. **Leaderboard View**: All models in a table ranked by concrete score, with mini sparkline islands

### Data Flow

For v1, results are stored as static JSON files generated by `scripts/generate-static.ts` and bundled with the Next.js static export. No runtime API calls needed.

For v2 (optional), results are stored in Firestore and fetched at build time or on-demand.

---

## 12. Data Models

```typescript
// packages/shared/src/types.ts

interface CategoryDefinition {
  key: string;                     // e.g., "mult"
  label: string;                   // e.g., "Multiplication"
  tier: 1 | 2;                     // Pure computation vs generative
  difficultyParam: string;         // e.g., "digitCount"
  minDifficulty: number;
  maxDifficulty: number;
}

interface TrialResult {
  category: string;
  difficulty: number;
  phase1: {
    prompt: string;
    response: string;
    confidence: number | null;     // Extracted confidence (0-100)
    tokensUsed: number;
    latencyMs: number;
  };
  phase2: {
    prompt: string;
    response: string;
    extractedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    partialScore?: number;          // For continuous-scored tasks (0-1)
    tokensUsed: number;
    latencyMs: number;
  };
  phase3: {
    prompt: string;
    response: string;
    confidence: number | null;
    tokensUsed: number;
    latencyMs: number;
  };
  timestamp: string;
}

interface CategoryScore {
  category: string;
  sand: number;                     // Average Phase 1 confidence (0-100)
  solid: number;                    // Average Phase 2 accuracy (0-100)
  concrete: number;                 // Phase 2 correct + Phase 3 accurate (0-100)
  trialCount: number;
  difficultyRange: [number, number]; // Min/max difficulty tested
  transitionZone: number;           // Estimated difficulty where performance = ~50%
}

interface ModelResult {
  modelId: string;                  // OpenRouter model string or local model name
  modelDisplayName: string;         // Human-readable name
  timestamp: string;
  categories: Record<string, CategoryScore>;
  aggregate: {
    avgSand: number;
    avgSolid: number;
    avgConcrete: number;
    overconfidence: number;         // avg(sand - solid)
    blindSpots: number;             // avg(solid - concrete)
    totalGap: number;               // overconfidence + blindSpots
  };
  metadata: {
    adapter: "openrouter" | "lmstudio";
    temperature: number;
    totalTokensUsed: number;
    totalCost?: number;             // OpenRouter cost if available
    totalTrials: number;
    invalidTrials: number;          // Trials where confidence extraction failed
  };
}
```

---

## 13. CLI and Scripts

### Running the Benchmark

```bash
# Local testing with LM Studio
pnpm run benchmark --adapter lmstudio --model "llama-3.1-8b" --categories mult,bool

# Production run via OpenRouter  
pnpm run benchmark --adapter openrouter --model "anthropic/claude-sonnet-4-20250514" --all

# Run specific categories only
pnpm run benchmark --adapter openrouter --model "openai/gpt-4o" --categories mult,modexp,bool,random

# Resume interrupted run
pnpm run benchmark --resume results/claude-sonnet/2026-02-06T12:00:00/
```

### CLI Options

| Flag | Description | Default |
|------|-------------|---------|
| `--adapter` | `openrouter` or `lmstudio` | Required |
| `--model` | Model identifier | Required |
| `--categories` | Comma-separated category keys | All |
| `--all` | Run all categories | false |
| `--trials` | Trials per difficulty level | 20 |
| `--temperature` | Sampling temperature | 0.7 |
| `--output` | Output directory | `results/{model}/{timestamp}/` |
| `--resume` | Resume from existing output dir | none |
| `--dry-run` | Print prompts without calling API | false |

### Uploading Results

```bash
# Generate static JSON for the frontend
pnpm run generate-static --input results/ --output apps/web/src/data/

# Or upload to Firestore (v2)
pnpm run upload --input results/claude-sonnet/2026-02-06T12:00:00/
```

---

## 14. Environment Configuration

```bash
# .env.local (never committed)

# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# LM Studio (defaults)
LMSTUDIO_BASE_URL=http://localhost:1234/v1

# Firebase (for Firestore upload, optional in v1)
FIREBASE_PROJECT_ID=shoreline-benchmark
FIREBASE_SERVICE_ACCOUNT_KEY=./firebase-sa-key.json
```

---

## 15. Firebase Setup

### Hosting

```json
// firebase.json
{
  "hosting": {
    "source": "apps/web",
    "frameworksBackend": {
      "region": "us-west1"
    },
    "ignore": ["firebase.json", "**/node_modules/**"]
  }
}
```

For v1, use `next export` to generate a fully static site. No server-side rendering needed. Deploy with:

```bash
cd apps/web && pnpm build
firebase deploy --only hosting
```

### Firestore (v2, optional)

```
Collection: models/
  Document: {modelId}
    - displayName: string
    - timestamp: string
    - aggregate: { avgSand, avgSolid, avgConcrete, ... }
    
  Subcollection: categories/
    Document: {categoryKey}
      - sand: number
      - solid: number
      - concrete: number
      - trialCount: number
      ...
```

---

## 16. Implementation Priority

### Phase A: Foundation (Week 1)

1. Create the GitHub repo at `dependableAIsolutions/shoreline-benchmark`
2. Set up pnpm monorepo with three packages (harness, web, shared)
3. Implement shared types
4. Implement OpenRouter and LM Studio adapters
5. Implement confidence extraction utility
6. Implement one task category end-to-end: multiplication (simplest)
7. Implement the three-phase sandwich runner for that one category
8. Implement ground truth verification for multiplication
9. Run a single local test with LM Studio to validate the full pipeline

### Phase B: Task Categories (Week 2)

1. Implement all Tier 1 generators and ground truth verifiers
2. Implement all Tier 2 generators and statistical test scorers
3. Implement adaptive difficulty ladder
4. Implement scoring aggregation (sand/solid/concrete computation)
5. Run full local benchmark on one small model to validate everything

### Phase C: Frontend (Week 3)

1. Convert shoreline_v4.jsx to TSX component library
2. Build the three views (single, compare, leaderboard)
3. Wire up static data loading
4. Deploy to Firebase Hosting
5. Polish mobile responsiveness

### Phase D: Production Runs (Week 4)

1. Run benchmark on target models via OpenRouter:
   - Claude Opus 4.6, Claude Sonnet 4.5
   - GPT-4o, GPT-o3
   - Llama 3.1 405B, Llama 3.3 70B
   - Gemini 2.0 Flash, Gemini 2.5 Pro
   - DeepSeek V3, DeepSeek R1
   - Qwen 2.5 72B
2. Generate static data, rebuild frontend, deploy
3. Write launch blog post / README

---

## 17. Open Questions and Decisions Needed

1. **Model list**: Which specific models should be in the launch set? The list above is a starting suggestion. Prioritize models with the most public interest.

2. **Trial count vs. cost**: 20 trials per difficulty level is statistically sound but expensive for large models. Could reduce to 10 for initial runs and increase later. Need to validate that 10 trials gives stable calibration estimates.

3. **Prompt sensitivity**: Models may be sensitive to exact prompt wording. Should we test prompt variations and report variance? This would multiply costs but increase rigor.

4. **Thinking/reasoning models**: Models like o3 and R1 that use chain-of-thought or extended thinking may behave differently. Their visible reasoning traces could make confidence extraction easier or harder. Might need adapter-specific prompt modifications.

5. **Caching and reproducibility**: Should we set a fixed seed where supported? This improves reproducibility but reduces variance, which is needed for calibration measurement. Recommendation: no fixed seed, but log all parameters for reproducibility of the experimental setup.

6. **Answer extraction for Phase 2**: Some models bury their final answer in verbose explanations. May need model-specific answer extraction patterns, or a standard instruction like "State your final answer on its own line prefixed with ANSWER:".

7. **Domain for the site**: `shoreline.benchmark` or `shoreline-bench.web.app` (Firebase default) or something under `dependableai.solutions`?

---

## 18. Key Design Principles

- **No LLM judges.** Every Phase 2 score is mechanically verifiable. No model evaluates another model. This eliminates the biggest source of noise and bias in modern benchmarks.
- **The difficulty finds you.** Adaptive difficulty means we always measure at the interesting boundary, not on tasks that are trivially easy or impossibly hard.
- **Three layers, three stories.** Sand, solid, concrete are not just scores. They are a narrative about what the model claims, what it delivers, and what it can vouch for. The visualization must communicate this instantly.
- **Reproducible and cheap.** Anyone should be able to re-run this benchmark on their own models. The harness is open source. Local testing via LM Studio costs nothing.
- **TypeScript everywhere.** One language, one type system, from the evaluation harness through the visualization frontend.

---

## 19. Reference: JSX to Convert

The file `shoreline_v4.jsx` contains the current island visualization prototype with:
- Catmull-Rom spline rendering for smooth organic shapes
- Three-layer sand/solid/concrete visualization
- Side-by-side comparison mode
- Interactive hover tooltips
- Stats panels with overconfidence/blind spots metrics
- Responsive layout

This should be converted to a TSX component library, broken into the components listed in the architecture section, and made data-driven via props conforming to the `ModelResult` type.

---

*End of design document. This document, combined with the shoreline_v4.jsx prototype, provides everything needed to begin implementation.*