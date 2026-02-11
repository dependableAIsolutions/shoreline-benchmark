#!/usr/bin/env bash

# Deploy script for Shoreline to Firebase Hosting.
# Builds the static Next.js site and deploys hosting.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PROJECT_ID="${FIREBASE_PROJECT:-shoreline-714c6}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting Firebase deployment for project: ${PROJECT_ID}${NC}"

if command -v firebase >/dev/null 2>&1; then
  FIREBASE_CMD=(firebase)
else
  echo -e "${BLUE}firebase CLI not found globally; using pnpm dlx firebase-tools.${NC}"
  FIREBASE_CMD=(corepack pnpm dlx firebase-tools)
fi

echo -e "${BLUE}Checking Firebase CLI availability...${NC}"
"${FIREBASE_CMD[@]}" --version >/dev/null

echo -e "${BLUE}Building web app...${NC}"
corepack pnpm --filter @shoreline/web build

if [[ ! -f "apps/web/out/index.html" ]]; then
  echo -e "${RED}Build output missing: apps/web/out/index.html${NC}"
  exit 1
fi

echo -e "${BLUE}Deploying to Firebase Hosting...${NC}"
"${FIREBASE_CMD[@]}" deploy --only hosting --project "$PROJECT_ID"

echo -e "${GREEN}Deployment complete.${NC}"
echo -e "${GREEN}Live URL: https://${PROJECT_ID}.web.app${NC}"
