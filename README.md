# GenericQuick NCR

Hyperlocal, prescription-aware medicine e-commerce platform for Delhi NCR (Delhi, Gurugram, Noida).

## Stack
- **Frontend**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Lucide React
- **Backend**: NestJS 10, TypeScript, REST APIs
- **Database**: PostgreSQL 16 + PostGIS, Prisma ORM
- **Search**: Meilisearch (retrieval only)
- **Queue/Cache**: Redis 7 + BullMQ
- **Infra**: Docker Compose (dev), pnpm + Turborepo monorepo

## Monorepo Structure
```
apps/
  web/      # Next.js 14 customer-facing app
  api/      # NestJS REST API
  worker/   # BullMQ background workers
packages/
  contracts/      # Zod schemas + shared types (API contracts)
  domain/         # Pure business logic (matching, pricing, FEFO)
  db/             # Prisma schema, migrations, client
  config/         # Zod-validated env, constants
  observability/  # Pino logging, Prometheus metrics, OTel tracing
infra/docker/     # Docker Compose dev stack
docs/adr/         # Architecture Decision Records
docs/regulatory/  # Regulatory assumptions register
docs/formulary/   # Sealed formulary input
scripts/          # Dev setup scripts
```

## Quick Start
```bash
# Install dependencies
pnpm install

# Start infrastructure (requires Docker)
pnpm docker:up

# Generate Prisma client
pnpm db:generate

# Run development servers
pnpm dev
```

## Environment
Copy `.env.example` to `.env.local` and fill in secrets. Required:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - 32+ byte secret for JWT signing
- `SESSION_SECRET` - 32+ byte secret for sessions
- `MEILISEARCH_API_KEY` - Meilisearch master key
- `S3_*` - MinIO/S3 credentials for prescription storage

## Testing
```bash
pnpm turbo run test      # Unit + e2e tests
pnpm turbo run lint      # ESLint
pnpm turbo run build     # TypeScript build
```

## Regulatory
See `docs/regulatory/assumptions.md` for UNREVIEWED assumptions (A1–A15) requiring legal/clinical sign-off.

## Formulary
The hospital formulary (`druglist.pdf`) is SEALED per D14/G14. See `docs/formulary/sealed/README.md`.