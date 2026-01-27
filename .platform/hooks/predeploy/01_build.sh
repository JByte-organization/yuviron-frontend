#!/bin/bash
set -e

cd /var/app/staging

# Устанавливаем зависимости (важно: с devDependencies, иначе build может не собраться)
npm ci

# Сборка Next (создаст .next/ и .next/standalone/)
npm run build
