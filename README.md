# Shoreline Benchmark

Shoreline measures model capability and metacognitive calibration in three layers:
- Sand: predicted confidence before solving
- Solid: ground-truth task performance
- Concrete: self-evaluation aligned with correctness

## Monorepo

- `apps/web`: Next.js frontend (single view, compare view, leaderboard)
- `packages/shared`: canonical Shoreline types/constants
- `packages/harness`: adapters, tasks, scoring, adaptive runner, checkpoint resume
- `scripts/run-benchmark.ts`: single-model benchmark CLI
- `scripts/run-benchmark-suite.ts`: config-driven multi-model orchestrator with state tracking

## Install

```bash
corepack pnpm install
```

## Environment

Create local env file:

```bash
cp .env.example .env.local
```

`.env.local` is gitignored and loaded automatically by helper scripts.

## Script split

- `./start-dev.sh`
  - Web-only script.
  - Optionally regenerates static data from existing `results/`.
  - Starts Next dev server so you can inspect visualization.

- `./run-benchmarks.sh`
  - Benchmark execution script.
  - Uses suite config (`benchmark/suites/*.json`).
  - Tracks progress/state in `benchmark/state/*.state.json`.
  - Skips completed models and resumes incomplete/failed models when checkpoints exist.

## Website (render results only)

```bash
./start-dev.sh
```

Optional env overrides:
- `WEB_PORT=3000`
- `REFRESH_STATIC=1` (default)
- `RESULTS_INPUT=results`

## Benchmark suite runs

Default local suite:

```bash
./run-benchmarks.sh
```

Run a specific suite:

```bash
CONFIG=benchmark/suites/openrouter.smoke.json ./run-benchmarks.sh
```

Useful flags passed through to suite runner:
- `--dry-run`
- `--force`
- `--models modelA,modelB`
- `--limit 2`
- `--state benchmark/state/custom.state.json`

## Suite configs and state

- Config examples:
  - `benchmark/suites/localapi.default.json`
  - `benchmark/suites/openrouter.smoke.json`
  - `benchmark/suites/openrouter.launch-template.json`
- Runtime state:
  - `benchmark/state/<suite>.state.json` (gitignored)

State tracks for each model:
- status (`in_progress`, `completed`, `failed`)
- attempts
- active run directory
- timestamps and error info

## Single-model CLI (advanced)

```bash
corepack pnpm benchmark --adapter localapi --model "qwen/qwen3-coder-next" --categories mult,bool,counting --quick
```

Resume an interrupted run directory:

```bash
corepack pnpm benchmark --adapter localapi --model "qwen/qwen3-coder-next" --categories mult,bool,counting --resume results/qwen-qwen3-coder-next/<timestamp>
```

## Static data generation

```bash
corepack pnpm generate-static --input results --output apps/web/src/data
```

## Build and checks

```bash
corepack pnpm typecheck
corepack pnpm build
```
