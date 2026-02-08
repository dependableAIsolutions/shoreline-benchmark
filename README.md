# Shoreline Benchmark

Shoreline measures model capability and metacognitive calibration across 11 reasoning categories.

## Scoring model

- `claimed`: raw Phase 1 confidence before solving (0-100)
- `solid`: actual Phase 2 task performance (0-100)
- `concrete`: buildable subset of `solid` where the model both succeeds and recognizes success (0-100)
- `sand`: visualization envelope, defined as `max(claimed, solid, concrete)` to keep layer nesting stable

Derived aggregate metrics:
- `overconfidence`: `max(0, claimed - solid)`
- `underconfidence`: `max(0, solid - claimed)`
- `blindSpots`: `max(0, solid - concrete)`
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
- `REFRESH_STATIC=1` (default)
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

## Suite config files

- `benchmark/suites/localapi.default.json`
- `benchmark/suites/openrouter.smoke.json`
- `benchmark/suites/openrouter.launch-template.json`

Note: model IDs are source-of-truth in these JSON files. Update those files to change the evaluated model roster.

## Single-model CLI (advanced)

```bash
corepack pnpm benchmark --adapter localapi --model "qwen/qwen3-coder-next" --all --quick
```

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
