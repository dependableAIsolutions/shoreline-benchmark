# Shoreline Benchmark

Shoreline measures model capability and metacognitive calibration across 11 reasoning categories.

## Scoring model

- `claimed`: raw Phase 1 confidence before solving (0-100)
- `claimedDepth`: max(`phase1Confidence × normalizedDifficulty`) across sampled trials
- `sand`: phase-1 claimed depth intensity (`sand = claimedDepth`)
  - normalized difficulty uses a model-agnostic theoretical ceiling beyond the tested range
  - `sand = 100` means confidence at that theoretical outer ceiling, not at tested max difficulty
- `solid`: actual Phase 2 task performance (0-100)
- `concrete`: failure-awareness rate: wrong answers correctly flagged with low Phase 3 confidence (0-100)

Derived aggregate metrics:
- `overconfidence`: `max(0, claimed - solid)`
- `underconfidence`: `max(0, solid - claimed)`
- `blindSpots`: missed failures (`wrong + high confidence`, aligned with `falseConfidence`)
- `calibrationIndex`: `100 - avgCalibrationError`
- `capabilityIndex`: normalized transition-zone percentile by category difficulty range

## Repository layout

- `apps/web`: Next.js UI (single, compare, leaderboard)
- `packages/shared`: shared types/constants
- `packages/harness`: adapters, tasks, scoring, checkpoint/resume runner
- `scripts/run-benchmark.ts`: single-model runner
- `scripts/run-benchmark-suite.ts`: config-driven multi-model suite runner
- `scripts/recompute-scores.ts`: recompute `scores.json` from `raw-responses.jsonl`
- `scripts/generate-static.ts`: rebuild `apps/web/src/data/results.generated.*`

## Prerequisites

- Node.js 20+
- `corepack` enabled

Install:

```bash
corepack pnpm install
```

## Environment

Create local env:

```bash
cp .env.example .env.local
```

Common keys:
- `OPENROUTER_API_KEY`
- `OPENROUTER_TIMEOUT_MS` (default: `120000`)
- `OPENROUTER_INPUT_COST_PER_MILLION` (optional fallback when API cost is absent)
- `OPENROUTER_OUTPUT_COST_PER_MILLION` (optional fallback when API cost is absent)
- `LOCAL_MODEL_API_URL` (default: `http://localhost:5555/api/v1/chat`)
- `LOCAL_MODEL_TIMEOUT_MS`
- `LOCAL_MODEL_SYSTEM_PROMPT`
- `LMSTUDIO_BASE_URL`

## Script split

- `./start-dev.sh`
  - Web-only flow.
  - Optionally regenerates static data from existing `results/`.
  - Starts Next.js dev server.
- `./run-benchmarks.sh`
  - Benchmark execution flow.
  - Uses suite config (`benchmark/suites/*.json`).
  - Maintains state in `benchmark/state/*.state.json`.
  - Supports skip-completed and resume-incomplete behavior.

## Run the web UI

```bash
./start-dev.sh
```

Optional overrides:
- `WEB_PORT=3000`
- `SKIP_REFRESH=1` (skip recompute/generate; default refreshes static data)
- `RESULTS_INPUT=results`

## Run benchmark suites

Default (local):

```bash
./run-benchmarks.sh
```

OpenRouter quick suite:

```bash
CONFIG=benchmark/suites/openrouter.smoke.json ./run-benchmarks.sh
```

Useful flags:
- `--dry-run`
- `--force`
- `--models modelA,modelB`
- `--limit 2`
- `--state benchmark/state/custom.state.json`
- `--category-concurrency 3`
- `--ramp-mode fast`
- `--quick-points 3`

OpenRouter cost fallback in suite config:

```json
{
  "openrouter": {
    "fallbackPricing": {
      "inputCostPerMillion": 0.25,
      "outputCostPerMillion": 1.0
    },
    "modelPricing": {
      "openai/gpt-oss-120b": {
        "inputCostPerMillion": 0.15,
        "outputCostPerMillion": 0.6
      }
    }
  }
}
```

## Suite config files

- `benchmark/suites/localapi.default.json`
- `benchmark/suites/openrouter.smoke.json`
- `benchmark/suites/openrouter.launch-template.json`

Note: model IDs are source-of-truth in these JSON files. Update those files to change the evaluated model roster.

## Single-model CLI (advanced)

```bash
corepack pnpm benchmark --adapter localapi --model "qwen/qwen3-coder-next" --all --quick
```

Speed/cost tuning:
- `--category-concurrency <n>`: run up to `n` categories in parallel (default: quick mode = all selected categories, otherwise `1`)
- `--ramp-mode <balanced|fast>`: transition search profile for non-quick mode (`balanced` default)
- `--quick-points <n>`: in quick mode, sample `n` difficulty anchors per category (default `3`)
- `--input-cost-per-million <value>` and `--output-cost-per-million <value>`: manual OpenRouter fallback pricing if `usage.cost` is unavailable (same unit as OpenRouter `usage.cost`, typically credits)

`scores.json` now includes additional benchmark telemetry under `metadata`:
- token split (`totalPromptTokensUsed`, `totalCompletionTokensUsed`)
- cost totals (`totalCost`, `providerReportedCost`, `estimatedCost`, measured/missing cost call counts)
- timing (`runDurationMs`, `totalLatencyMs`, `averageLatencyMs`, `totalModelCalls`)

Resume a run:

```bash
corepack pnpm benchmark --adapter localapi --model "qwen/qwen3-coder-next" --all --resume results/qwen-qwen3-coder-next/<timestamp>
```

## Regenerate and repair outputs

Recompute scores from raw logs:

```bash
corepack pnpm recompute-scores --input results
```

Regenerate static web data:

```bash
corepack pnpm generate-static --input results --output apps/web/src/data
```

Selection policy for static data:
- Per model, the generator prefers the run with the highest category coverage.
- Ties break by newer run timestamp, then higher total trials.

## Local model API smoke test

```bash
curl http://localhost:5555/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen/qwen3-coder-next",
    "system_prompt": "You answer only in rhymes.",
    "input": "What is your favorite color?"
  }'
```

## Validation

```bash
corepack pnpm typecheck
corepack pnpm build
```
