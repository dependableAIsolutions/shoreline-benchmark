#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

CONFIG="${CONFIG:-benchmark/suites/localapi.default.json}"
STATE="${STATE:-}"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if ! command -v corepack >/dev/null 2>&1; then
  echo "[shoreline] corepack is required but not found" >&2
  exit 1
fi

printf "[shoreline] Running benchmark suite\n"
printf "[shoreline] Config: %s\n" "$CONFIG"

corepack pnpm install

HAS_CONFIG_ARG=0
HAS_STATE_ARG=0
for arg in "$@"; do
  case "$arg" in
    --config|--config=*)
      HAS_CONFIG_ARG=1
      ;;
    --state|--state=*)
      HAS_STATE_ARG=1
      ;;
  esac
done

CMD=(corepack pnpm benchmark:suite)
if [[ "$HAS_CONFIG_ARG" == "0" ]]; then
  CMD+=(--config "$CONFIG")
fi
if [[ -n "$STATE" && "$HAS_STATE_ARG" == "0" ]]; then
  CMD+=(--state "$STATE")
fi
CMD+=("$@")

exec "${CMD[@]}"
