#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

WEB_PORT="${WEB_PORT:-3000}"
REFRESH_STATIC="${REFRESH_STATIC:-1}"
RESULTS_INPUT="${RESULTS_INPUT:-results}"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

printf "[shoreline] Starting web-only dev flow\n"
printf "[shoreline] Root: %s\n" "$ROOT_DIR"
printf "[shoreline] Refresh static data: %s\n" "$REFRESH_STATIC"

if ! command -v corepack >/dev/null 2>&1; then
  echo "[shoreline] corepack is required but not found" >&2
  exit 1
fi

corepack pnpm install

if [[ "$REFRESH_STATIC" == "1" ]]; then
  printf "[shoreline] Refreshing static data from %s\n" "$RESULTS_INPUT"
  corepack pnpm generate-static --input "$RESULTS_INPUT" --output apps/web/src/data
fi

SELECTED_PORT="$WEB_PORT"
if command -v lsof >/dev/null 2>&1; then
  while lsof -n -iTCP:"$SELECTED_PORT" -sTCP:LISTEN >/dev/null 2>&1; do
    SELECTED_PORT="$((SELECTED_PORT + 1))"
  done
fi
if [[ "$SELECTED_PORT" != "$WEB_PORT" ]]; then
  printf "[shoreline] Port %s in use, switching to %s\n" "$WEB_PORT" "$SELECTED_PORT"
fi

printf "[shoreline] Web UI: http://localhost:%s\n" "$SELECTED_PORT"
exec corepack pnpm --filter @shoreline/web dev --port "$SELECTED_PORT"
