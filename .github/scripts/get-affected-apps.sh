#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-HEAD^1}"

if ! git rev-parse "$BASE_REF" >/dev/null 2>&1; then
  BASE_REF="HEAD"
fi

RESULT=$(pnpm turbo run build --dry=json --filter="...[${BASE_REF}]")
echo "$RESULT" > turbo-dry-run.json

node <<'EOF'
const fs = require('fs');

const raw = fs.readFileSync('turbo-dry-run.json', 'utf8');
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
