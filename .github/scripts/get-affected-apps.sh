#!/usr/bin/env bash
set -Eeuo pipefail

BASE_REF="${1:-${BASE_SHA:-}}"

if [ -z "${BASE_REF}" ] || [ "${BASE_REF}" = "0000000000000000000000000000000000000000" ]; then
  BASE_REF="HEAD~1"
fi

echo "[affected] BASE_REF=${BASE_REF}" >&2
echo "[affected] HEAD=$(git rev-parse HEAD)" >&2

if ! git cat-file -e "${BASE_REF}^{commit}" 2>/dev/null; then
  echo "[affected] Base ref '${BASE_REF}' is not available locally" >&2
  git log --oneline -n 10 >&2 || true
  exit 1
fi

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

pnpm turbo run build --dry=json --filter="...[${BASE_REF}]" > "$TMP_FILE"

node - "$TMP_FILE" <<'EOF'
const fs = require('fs');

const filePath = process.argv[2];
const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);

const appNames = new Set(['admin', 'backoffice', 'client-app']);
const affectedApps = new Set();

for (const task of data.tasks || []) {
  const pkg = task.package || (task.taskId ? task.taskId.split('#')[0] : '');
  if (appNames.has(pkg)) {
    affectedApps.add(pkg);
  }
}

process.stdout.write(JSON.stringify([...affectedApps]));
EOF