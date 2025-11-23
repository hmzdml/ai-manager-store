#!/usr/bin/env bash
set -e

echo "[devcontainer] Backend kurulumu..."
cd backend
npm install
npx prisma generate || true
npx prisma migrate dev --name init || true

echo "[devcontainer] Frontend kurulumu..."
cd ../frontend
npm install

echo "[devcontainer] Kurulum tamam. Çalıştırma:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Portlar: 4000 (API), 5173 (Frontend) – Codespaces Port panelinden 'Open in Browser' tıkla."
