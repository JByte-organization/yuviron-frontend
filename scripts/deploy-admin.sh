#!/usr/bin/env bash
set -euo pipefail

cd /opt/yuviron-server/infra
docker compose -f compose.dev.yml up -d --build --force-recreate yuviron-dev-admin
