#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BRANCH="${BRANCH:-main}"

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD=(docker-compose)
else
    echo "Docker Compose tidak ditemukan." >&2
    exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
    echo "openssl dibutuhkan untuk generate APP_KEY di host." >&2
    exit 1
fi

cd "${APP_DIR}"

if [ -d .git ]; then
    git fetch origin
    git checkout "${BRANCH}"
    git pull --ff-only origin "${BRANCH}"
fi

if [ ! -f .env ]; then
    cp .env.docker.example .env
    echo "File .env baru dibuat dari contoh. Isi dulu nilainya lalu jalankan ulang script ini." >&2
    exit 1
fi

if ! grep -Eq '^APP_KEY=base64:' .env; then
    generated_key="base64:$(openssl rand -base64 32 | tr -d '\n')"

    if grep -q '^APP_KEY=' .env; then
        sed -i "s#^APP_KEY=.*#APP_KEY=${generated_key}#" .env
    else
        printf '\nAPP_KEY=%s\n' "${generated_key}" >> .env
    fi

    echo "APP_KEY production berhasil dibuat di file .env host."
fi

"${COMPOSE_CMD[@]}" up -d --build
"${COMPOSE_CMD[@]}" exec -T web php artisan migrate --force
"${COMPOSE_CMD[@]}" exec -T web sh -lc 'php artisan storage:link || true'
"${COMPOSE_CMD[@]}" exec -T web php artisan optimize:clear
"${COMPOSE_CMD[@]}" exec -T web php artisan optimize
"${COMPOSE_CMD[@]}" ps

echo "Deploy selesai. Cek log jika perlu: ${COMPOSE_CMD[*]} logs -f --tail=200 web reverb queue scheduler"