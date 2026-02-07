# Benchmark Skill: Shoreline Runbook

## Purpose
This runbook defines the operational benchmark workflow for Shoreline:
- clear old outputs
- run local model benchmarks
- run remote SOTA model benchmarks
- regenerate web data
- render website for inspection

`start-dev.sh` is web-only.
`run-benchmarks.sh` is benchmark-only.

## Baseline Setup
1. Ensure `.env.local` exists and includes:
   - `OPENROUTER_API_KEY`
   - `LOCAL_MODEL_API_URL`
2. Install dependencies:
   - `corepack pnpm install`

## Clear Previous Results
From repo root:

```bash
find results -mindepth 1 ! -name .gitkeep -exec rm -rf {} +
find benchmark/state -mindepth 1 ! -name .gitkeep -delete
```

## Run Local Benchmark (All Categories)
Suite file:
- `benchmark/suites/localapi.default.json`

Current config:
- adapter: `localapi`
- categories: all 11 Shoreline categories
- quick mode: `true`
- trials per difficulty: `1`
- model: `qwen/qwen3-coder-next`

Command:

```bash
./run-benchmarks.sh --config benchmark/suites/localapi.default.json
```

## Run Remote Benchmark (SOTA-Only, All Categories)
Suite file:
- `benchmark/suites/openrouter.smoke.json`

Current config:
- adapter: `openrouter`
- categories: all 11 Shoreline categories
- quick mode: `true`
- trials per difficulty: `1`
- models:
  - `openai/gpt-5.2`
  - `anthropic/claude-sonnet-4.5`
  - `google/gemini-2.5-pro`

Command:

```bash
CONFIG=benchmark/suites/openrouter.smoke.json ./run-benchmarks.sh
```

## Resume / Recover Incomplete Runs
Resume behavior is automatic in suite mode:
- skips `completed` models when `skipCompleted=true`
- resumes models in `in_progress` or `failed` state when checkpoint exists

State files:
- `benchmark/state/localapi.default.state.json`
- `benchmark/state/openrouter.smoke.state.json`

Force rerun a completed model:

```bash
CONFIG=benchmark/suites/openrouter.smoke.json ./run-benchmarks.sh --force
```

Run a subset:

```bash
CONFIG=benchmark/suites/openrouter.smoke.json ./run-benchmarks.sh --models openai/gpt-5.2
```

## Render Website
Web-only script:

```bash
./start-dev.sh
```

Optional:

```bash
WEB_PORT=3000 REFRESH_STATIC=1 ./start-dev.sh
```

## Tested Models (Current)
Fresh all-category quick runs completed for:
- Local:
  - `qwen/qwen3-coder-next`
- Remote SOTA:
  - `openai/gpt-5.2`
  - `anthropic/claude-sonnet-4.5`
  - `google/gemini-2.5-pro`

All above runs produced valid `scores.json`, `raw-responses.jsonl`, and `checkpoint.json` with 11 populated category scores.

## Planned SOTA Remote Models (Next)
Defined in `benchmark/suites/openrouter.launch-template.json`:
- `openai/gpt-5.2-pro`
- `openai/o3-pro`
- `anthropic/claude-opus-4.6`
- `anthropic/claude-sonnet-4.5`
- `google/gemini-2.5-pro`
- `x-ai/grok-4`
- `meta-llama/llama-4-maverick`
- `deepseek/deepseek-r1`

Set `enabled: true` per model to include it in full launch runs.

## Excluded Dev Test Models
Do not use lightweight/dev smoke models for official SOTA remote reports:
- `openai/gpt-4o-mini`

## Validation Checklist
After running benchmarks:
1. `apps/web/src/data/results.generated.json` contains latest models.
2. Each tested model has 11 populated categories (`trialCount > 0`).
3. `./start-dev.sh` serves the UI and displays shoreline layers:
   - Sand (outer envelope of claimed vs observed)
   - Solid (task performance)
   - Concrete (self-evaluation alignment)
4. Compare and leaderboard views show the new models.
