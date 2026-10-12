#!/usr/bin/env bash
set -euo pipefail
echo "🔧 Setting up GenericQuick NCR development environment..."
echo "📦 Installing dependencies..." && pnpm install
echo "🐳 Starting Docker services..." && docker-compose -f infra/docker/docker-compose.yml up -d
echo "⏳ Waiting for Postgres..." && until docker exec gq-postgres pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
echo "🔧 Generating Prisma client..." && pnpm db:generate
echo "✅ Development environment ready!"
echo ""; echo "Next steps:"; echo "  pnpm dev          # Start all apps (API on :4000, Web on :3000)"; echo "  pnpm db:studio    # Open Prisma Studio"; echo "  pnpm test         # Run tests"