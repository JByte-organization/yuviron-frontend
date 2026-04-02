#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "[check-frontend] Starting frontend validation..."
cd "$PROJECT_ROOT"

if ! command -v corepack >/dev/null 2>&1; then
  echo "[check-frontend] corepack is not installed"
  exit 1
fi

corepack enable
corepack prepare pnpm@9.0.0 --activate

pnpm turbo run lint typecheck --filter=client-app --filter=admin --filter=backoffice

echo "[check-frontend] Frontend validation passed"