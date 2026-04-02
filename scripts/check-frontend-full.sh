#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "[check-frontend-full] Starting frontend validation..."
cd "$PROJECT_ROOT"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "[check-frontend-full] pnpm is not installed"
  exit 1
fi

echo "[check-frontend-full] Installing dependencies..."
pnpm install --frozen-lockfile

echo "[check-frontend-full] Running validation..."
pnpm turbo run typecheck --filter=client-app --filter=admin --filter=backoffice

echo "[check-frontend-full] Frontend validation passed"