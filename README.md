# Shoreline Benchmark

Shoreline measures model capability and metacognitive calibration in three layers:
- Sand: predicted confidence before solving
- Solid: ground-truth task performance
- Concrete: self-evaluation aligned with correctness

## Monorepo layout

- `apps/web`: Next.js frontend island visualization and leaderboard
- `packages/shared`: canonical types and constants
- `packages/harness`: benchmark runner, adapters, task generators, scoring
- `scripts/run-benchmark.ts`: CLI entry point
- `scripts/generate-static.ts`: converts results to web static data

## Implemented benchmark categories

- `mult` (multi-digit multiplication)
- `modexp` (modular exponentiation)
- `bool` (boolean circuit evaluation)
- `matrix` (integer matrix determinants)
- `combo` (combinatorial counting)
- `random` (random sequence quality scoring)
- `constrained` (mechanical constrained-writing verification)
- `sudoku` (Sudoku validity checks)
- `distrib` (distribution-fit scoring)
- `selfref` (self-referential consistency)
- `counting` (counting in context)

## Prerequisites

- Node.js 22+
- pnpm via Corepack (`corepack pnpm`)

## Install

```bash
corepack pnpm install
```

## Run benchmark

Dry run (no API dependency):

```bash
corepack pnpm benchmark --dry-run --categories mult,bool --trials 2
```

LM Studio:

```bash
corepack pnpm benchmark --adapter lmstudio --model "llama-3.1-8b" --categories mult,bool,counting
```

Local API (`/api/v1/chat` protocol):

```bash
corepack pnpm benchmark --adapter localapi --model "qwen/qwen3-coder-next" --categories mult,bool,counting
```

OpenRouter:

```bash
OPENROUTER_API_KEY=... corepack pnpm benchmark --adapter openrouter --model "openai/gpt-4o" --categories mult,modexp,bool,counting
```

## Generate frontend data from results

```bash
corepack pnpm generate-static --input results --output apps/web/src/data
```

## Run web app

```bash
corepack pnpm --filter @shoreline/web dev
```

## One-command local test flow

```bash
./start-dev.sh
```

Environment overrides:
- `MODEL` (default `qwen/qwen3-coder-next`)
- `LOCAL_API_URL` (default `http://localhost:5555/api/v1/chat`)
- `CATEGORIES` (default `mult,bool,counting`)
- `TRIALS` (default `1`)
- `PROBE_TRIALS` (default `1`)
- `TIMEOUT_MS` (default `120000`)
- `QUICK_MODE=1` runs a fast single-difficulty benchmark (default `1`)
- `WEB_PORT` (default `3000`)
- `START_WEB=0` to run benchmark + data generation without starting the web server

## Build all packages

```bash
corepack pnpm build
```

## Firebase deploy (static)

```bash
corepack pnpm --filter @shoreline/web build
firebase deploy --only hosting
```
