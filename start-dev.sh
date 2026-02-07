#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

MODEL="${MODEL:-qwen/qwen3-coder-next}"
LOCAL_API_URL="${LOCAL_API_URL:-http://localhost:5555/api/v1/chat}"
SYSTEM_PROMPT="${SYSTEM_PROMPT:-You are a precise benchmarking assistant. Follow all instructions and put final answers on ANSWER: lines when asked.}"
CATEGORIES="${CATEGORIES:-mult,bool,counting}"
TRIALS="${TRIALS:-1}"
PROBE_TRIALS="${PROBE_TRIALS:-1}"
TIMEOUT_MS="${TIMEOUT_MS:-120000}"
QUICK_MODE="${QUICK_MODE:-1}"
WEB_PORT="${WEB_PORT:-3000}"
START_WEB="${START_WEB:-1}"

printf "[shoreline] Root: %s\n" "$ROOT_DIR"
printf "[shoreline] Model: %s\n" "$MODEL"
printf "[shoreline] Local API: %s\n" "$LOCAL_API_URL"
printf "[shoreline] Categories: %s\n" "$CATEGORIES"
printf "[shoreline] Request timeout: %sms\n" "$TIMEOUT_MS"
printf "[shoreline] Quick mode: %s\n" "$QUICK_MODE"

if ! command -v corepack >/dev/null 2>&1; then
  echo "[shoreline] corepack is required but not found" >&2
  exit 1
fi

printf "[shoreline] Checking local model API...\n"
curl -sS "$LOCAL_API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"$MODEL\",\"system_prompt\":\"You answer only in rhymes.\",\"input\":\"What is your favorite color?\"}" \
  >/tmp/shoreline-localapi-check.json
printf "[shoreline] Local model API responded.\n"

printf "[shoreline] Installing dependencies...\n"
corepack pnpm install

printf "[shoreline] Running benchmark...\n"
QUICK_FLAG=""
if [[ "$QUICK_MODE" == "1" ]]; then
  QUICK_FLAG="--quick"
fi

LOCAL_MODEL_API_URL="$LOCAL_API_URL" LOCAL_MODEL_SYSTEM_PROMPT="$SYSTEM_PROMPT" \
  corepack pnpm benchmark \
  --adapter localapi \
  --model "$MODEL" \
  --categories "$CATEGORIES" \
  --trials "$TRIALS" \
  --probe-trials "$PROBE_TRIALS" \
  --timeout-ms "$TIMEOUT_MS" \
  $QUICK_FLAG

printf "[shoreline] Generating static web data...\n"
corepack pnpm generate-static --input results --output apps/web/src/data

LATEST_RESULT_DIR="$(ls -td results/*/* 2>/dev/null | head -n 1 || true)"
if [[ -n "$LATEST_RESULT_DIR" ]]; then
  printf "[shoreline] Latest results: %s\n" "$LATEST_RESULT_DIR"
fi

if [[ "$START_WEB" == "1" ]]; then
  printf "[shoreline] Starting web UI on http://localhost:%s\n" "$WEB_PORT"
  exec corepack pnpm --filter @shoreline/web dev -- --port "$WEB_PORT"
else
  printf "[shoreline] START_WEB=0, skipping web server startup.\n"
fi
