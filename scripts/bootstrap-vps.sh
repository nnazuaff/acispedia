#!/usr/bin/env bash

set -euo pipefail

SCRIPT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_APP_DIR="/opt/acispedia"

if [ -d "${SCRIPT_ROOT}/.git" ]; then
    APP_DIR="${APP_DIR:-${SCRIPT_ROOT}}"
else
    APP_DIR="${APP_DIR:-${DEFAULT_APP_DIR}}"
fi

REPO_URL="${REPO_URL:-https://github.com/nnazuaff/acispedia.git}"

if [ "$(id -u)" -ne 0 ]; then
    echo "Jalankan script ini dengan sudo atau sebagai root." >&2
    exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y ca-certificates curl git openssl

if ! command -v docker >/dev/null 2>&1; then
    apt-get install -y docker.io || true
fi

if ! docker compose version >/dev/null 2>&1; then
    apt-get install -y docker-compose-plugin || true
fi

systemctl enable --now docker

mkdir -p "${APP_DIR}"

if [ ! -d "${APP_DIR}/.git" ]; then
    git clone "${REPO_URL}" "${APP_DIR}"
else
    git -C "${APP_DIR}" fetch origin
    git -C "${APP_DIR}" pull --ff-only origin main
fi

if [ ! -f "${APP_DIR}/.env" ]; then
    cp "${APP_DIR}/.env.docker.example" "${APP_DIR}/.env"
fi

if [ -n "${SUDO_USER:-}" ] && id "${SUDO_USER}" >/dev/null 2>&1; then
    usermod -aG docker "${SUDO_USER}" || true
    chown -R "${SUDO_USER}:${SUDO_USER}" "${APP_DIR}"
fi

cat <<EOF
Bootstrap selesai.

Langkah berikutnya:
1. Edit ${APP_DIR}/.env sesuai domain dan kredensial production.
2. Jalankan: cd ${APP_DIR} && bash scripts/deploy-on-vps.sh

Kalau kamu baru menambahkan user ke group docker, logout lalu login SSH lagi sebelum deploy.
EOF