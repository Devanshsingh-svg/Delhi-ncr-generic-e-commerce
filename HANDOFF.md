# GenericQuick NCR — Handoff Document

**Project:** Hyperlocal medicine e-commerce platform for Delhi NCR
**Status:** Phase 1 complete (with fixes), ready for Phase 2 authorization
**Last Updated:** 2026-10-12
**Phases Completed:** Phase 0 (planning), Phase 1 (foundation scaffold + auth)

---

## 1. PROJECT OVERVIEW

### 1.1 Mission
Build a production-oriented, hyperlocal medicine e-commerce platform serving Delhi, Gurugram, and Noida with:
- Prescription-aware medicine discovery
- Brand-to-generic formulation comparison
- Licensed pharmacist verification workflows
- Real-time inventory and batch traceability
- Geospatial delivery-zone selection
- Fast warehouse picking and dispatch
- Transparent pricing and savings calculations
- Secure customer accounts, payments, and order management

### 1.2 Tech Stack (Mandatory)
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 App Router, React 18, TypeScript strict, Tailwind CSS, Lucide React |
| Backend | NestJS 10, TypeScript, REST APIs with OpenAPI |
| Database | PostgreSQL 16 + PostGIS, Prisma ORM |
| Search | Meilisearch (typo-tolerant retrieval only) |
| Queue/Cache | Redis 7 + BullMQ |
| Infra | Docker Compose (dev), separate dev/staging/prod configs |

### 1.3 Architecture
- **pnpm + Turborepo monorepo**
- 3 apps: `web` (Next.js), `api` (NestJS), `worker` (BullMQ)
- 5 shared packages: `contracts`, `domain`, `db`, `config`, `observability`
- Module boundaries per Directive §4 (19 modules)
- No circular dependencies; audit is write-only sink; admin is read-only

---

## 2. PHASE 0 — FOUNDATION PLANNING (COMPLETE)

### 2.1 Key Deliverables
- **Repository tree** with justification for every top-level directory
- **Module dependency map** (19 modules, directed edges, cycle prevention rules, JSON adjacency list)
- **ER design** (27 entities with PK, UK, CHECK, FK, cardinality)
- **Regulatory assumptions register** (A1–A15, all UNREVIEWED, with owner roles)
- **Environment variables & integrations** (.env.example + integration table)
- **Foundation acceptance tests** (F-01 through F-20)

### 2.2 Critical Decisions
| Decision | Reference |
|----------|-----------|
| Fingerprint computed in service layer (not DB trigger) | ADR 0002 |
| Batch assignment at reservation (checkout), not cart | ADR 0003 |
| AuditEvent.id = UUID v7 (not BIGSERIAL) | Phase 0 §4.5 |
| UserRepository = abstract class + Symbol token | Phase 1 fix A1 |
| UserRecord split: safe projection vs with-secrets | Phase 1 fix A2 |
| MFA deferred to Phase 2 | Phase 1 fix A4(b) |

### 2.3 Formulary Parse
**NOT PARSED** — PDF inaccessible in sandbox (no poppler-utils, pip, root). Parse is Phase 3 deliverable per Directive §F.

---

## 3. PHASE 1 — REPO, CONFIG, AUTH, SHARED TYPES (COMPLETE)

### 3.1 Files Created (70+ files)

#### Root Configuration
```
pnpm-workspace.yaml, turbo.json, package.json, tsconfig.base.json, .env.example, .gitignore, README.md
```

#### Apps
**apps/api** (NestJS)
- `src/main.ts` — bootstrap, global pipes/filters/interceptors, CORS
- `src/app.module.ts` — imports ConfigModule, PrismaModule, AuthModule, HealthModule
- `src/prisma/prisma.service.ts` — PrismaClient with connect/disconnect/cleanDatabase
- `src/prisma/prisma.module.ts` — Global PrismaModule
- `src/common/` — guards (JwtAuthGuard, RolesGuard), decorators (CurrentUser, Roles), filters (HttpExceptionFilter), interceptors (TransformInterceptor), pipes (ZodValidationPipe)
- `src/modules/auth/` — complete auth scaffold (controller, service, strategies, DTOs, module)
- `src/modules/health/` — health controller with postgres/redis checks
- `test/health.e2e-spec.ts` — health e2e tests

**apps/web** (Next.js 14)
- `src/app/layout.tsx`, `page.tsx`, `providers.tsx`, `globals.css`
- `src/lib/api.ts` — axios client with correlationId interceptor
- `next.config.js`, `tailwind.config.ts`, `tsconfig.json`

**apps/worker** (BullMQ)
- `src/main.ts`, `worker.module.ts`, `queues/queue.config.ts`

#### Packages
**packages/contracts** — Zod schemas + shared types
- `src/domain/money.ts` — Decimal-safe Money type + arithmetic
- `src/domain/fingerprint.ts` — FormulationFingerprint, CanonicalFormulation
- `src/domain/result.ts` — Result<T,E> + DomainError
- `src/api/auth.contract.ts` — Register/Login/Refresh/MFA schemas
- `src/api/health.contract.ts` — HealthResponse schema

**packages/domain** — Pure business logic (no framework deps)
- `src/errors/` — DomainError, FormulationFingerprintCollisionError, InsufficientStockError, ReservationLockTimeoutError
- `src/ports/user-repository.port.ts` — UserRepository abstract class + UserRecord/UserRecordWithSecrets + Symbol token
- `src/ports/not-configured-user-repository.ts` — NotConfiguredUserRepository (throws AuthPersistenceNotConfiguredError)
- `src/inventory/reservation.service.ts` — FEFO reservation with advisory locks (no SKIP LOCKED)
- `src/matching/fingerprint.service.ts` — Fingerprint computation (service-layer)

**packages/db** — Prisma
- `prisma/schema.prisma` — STUB only (`_MigrationPlaceholder` model)
- `src/client.ts` — PrismaClient singleton

**packages/config** — Zod-validated env + constants
- `src/env.ts` — EnvSchema with all variables, getEnv() with caching
- `src/constants.ts` — APP_CONSTANTS (roles, statuses, NTI drugs, release types, cookie names)

**packages/observability** — Pino + Prometheus + OTel
- `src/logger.ts` — getLogger() with redaction
- `src/metrics.ts` — HTTP, DB, queue, reservation metrics
- `src/tracing.ts` — OpenTelemetry NodeTracerProvider

#### Infrastructure
```
infra/docker/docker-compose.yml (postgres:16+postgis, redis:7, meilisearch, minio)
infra/docker/postgres/Dockerfile + init-scripts/01-init-extensions.sql
infra/docker/redis/Dockerfile
infra/docker/meilisearch/Dockerfile
infra/docker/minio/Dockerfile
```

#### Documentation
```
docs/adr/0001-monorepo-structure.md
docs/adr/0002-fingerprint-sha256.md
docs/adr/0003-cart-item-batch-assignment.md
docs/regulatory/assumptions.md (A1–A15)
```

#### Scripts
```
scripts/dev-setup.sh
```

### 3.2 Authentication Implementation (Scaffolded)

**Architecture:**
- `UserRepository` abstract class with Symbol token `USER_REPOSITORY_TOKEN`
- `NotConfiguredUserRepository` implementation throws `AuthPersistenceNotConfiguredError`
- `AuthService` uses repository interface (no Prisma calls)
- JWT access (15m) + rotating refresh tokens (7d, HttpOnly, Secure, SameSite=Lax)
- Strategies: `JwtStrategy`, `JwtRefreshStrategy` (both inject UserRepository via Symbol)
- Endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`
- **MFA removed entirely** (deferred to Phase 2)

**Security:**
- bcrypt cost 12
- Structured logs with correlationId, redaction of secrets
- HttpExceptionFilter handles `AuthPersistenceNotConfiguredError` → 503
- No rate limiting yet (Phase 2)
- No CSRF protection yet (Phase 2)

### 3.3 Health Check
- `GET /api/v1/health` returns `{ status, timestamp, version, checks[] }`
- Postgres: `SELECT 1` (reports 'ok' even on empty schema)
- Redis: reports 'degraded' (not wired yet)

### 3.4 Key Corrections Applied (3 fix cycles)
| Cycle | Fixes |
|-------|-------|
| 1 | z.coerce.int→number().int(), global ZodValidationPipe removed, NotFoundException import, Swagger decorators removed, A5(b) auth scaffold with NotConfiguredUserRepository, health controller, A7(b) UserEntity deleted |
| 2 | UserRepository as abstract class + Symbol token, UserRecord/UserRecordWithSecrets split, HttpExceptionFilter merged (static randomUUID import), ForbiddenException used in initMfa/verifyMfa, ValidationPipe import removed, cookie constants fixed, findByEmailOrPhone accepts both, health test fixed |
| 3 | Strategies use APP_CONSTANTS, Request import added, issueTokens uses UserRecord, MFA removed completely, domain index.ts re-exports ports, placeholder test → it.skip, ForbiddenException import removed, logger used in JwtStrategy |

---

## 4. CURRENT STATE

### 4.1 What Works (Design Complete)
- [x] Monorepo structure with workspace protocol
- [x] TypeScript strict config with path aliases
- [x] Zod-validated environment configuration
- [x] Shared domain types (Money, Fingerprint, Result)
- [x] Observability primitives (Pino, Prometheus, OTel)
- [x] Docker Compose dev stack (4 services)
- [x] Auth scaffold with abstract repository pattern
- [x] Health endpoint with graceful degradation
- [x] All 8 critical defects fixed
- [x] Test files written (unit + e2e)

### 4.2 What Doesn't Work (Sandbox Limitations)
| Feature | Status | Reason |
|---------|--------|--------|
| `pnpm install` | NOT RUN | pnpm not installed, no root for corepack |
| `turbo run build` | NOT RUN | Depends on pnpm install |
| `prisma generate` | NOT RUN | No pnpm |
| Unit tests | NOT RUN | No vitest/jest runtime |
| E2E tests | NOT RUN | No NestJS test environment |
| Docker services | NOT RUN | No Docker daemon |
| API boot | NOT RUN | No compiled output |

### 4.3 Known Defects (Unverified)
| Defect | Risk | Verification Needed |
|--------|------|---------------------|
| `@gq/domain` exports may not resolve `@gq/domain` → ports | Build fails | `pnpm turbo run build` |
| TypeScript path aliases in package tsconfigs | Import errors | Each package needs `extends: "../../tsconfig.base.json"` |
| Workspace protocol symlinks | Module resolution | `pnpm install` creates them |

### 4.4 Files Requiring Verification on Real Environment
```
packages/domain/tsconfig.json          (must extend base, set baseUrl)
packages/contracts/tsconfig.json
packages/config/tsconfig.json
packages/observability/tsconfig.json
packages/db/tsconfig.json
apps/api/tsconfig.json
apps/web/tsconfig.json
apps/worker/tsconfig.json
```

---

## 5. PHASE 2 — READY TO BEGIN

### 5.1 Goal
Complete PostgreSQL schema, Prisma models, PostGIS migrations, and constraints for all 27 entities. Seed strategy only — no real formulary data.

### 5.2 Entity List (All Required in schema.prisma)
```
Catalog:          Molecule, Formulation, FormulationIngredient, BrandMedicine,
                  GenericMedicine, Manufacturer, RegulatorySchedule
Facility:         DarkStore, DarkStoreLicense, PharmacistAssignment
Inventory:        InventoryBatch
Customer:         Customer, Address
Prescription:     Prescription, PrescriptionItem, PharmacistReview, Consultation
Transaction:      Cart, CartItem, Order, OrderItem, Payment, Shipment, StockReservation
Operations:       Rider, IdempotencyRecord, AuditEvent
```

### 5.3 Raw SQL Migrations (infra/migrations/)
| File | Purpose |
|------|---------|
| 0001_audit_append_only.sql | Trigger + REVOKE on audit_events |
| 0002_postgis_extensions.sql | CREATE EXTENSION postgis, citext, pgcrypto |
| 0003_spatial_columns.sql | delivery_polygon GEOMETRY, Address.geo GEOGRAPHY |
| 0004_spatial_indexes.sql | GiST indexes on spatial columns |
| 0005_formulation_fingerprint.sql | Partial unique index on fingerprint (schema_version=1) |
| 0006_check_constraints.sql | InventoryBatch quantity invariant |

### 5.4 Migration Ordering
```
scripts/migrate-all.sh:
  1. Apply infra/migrations/*.sql in numeric order
  2. Apply Prisma migrations (packages/db/prisma/migrations/)
```

### 5.5 Phase 2 Acceptance Criteria (Must Verify)
| AC | Description |
|----|-------------|
| AC-15 | `prisma migrate deploy` applies cleanly on empty PG16+PostGIS |
| AC-16 | `SELECT PostGIS_Version()` returns >= 3.x |
| AC-17 | GiST indexes exist on DarkStore.delivery_polygon and Address.geo |
| AC-18 | Partial unique index on formulation.fingerprint exists |
| AC-19 | audit_events UPDATE/DELETE rejected by trigger |
| AC-20 | Seed script exists but does not run in CI |
| AC-21 | No real formulary data in seeds |
| AC-22 | All 27 entities appear in schema.prisma |

---

## 6. REGULATORY ASSUMPTIONS (ALL UNREVIEWED)

| ID | Assumption | Owner | Gating |
|----|------------|-------|--------|
| A1 | E-pharmacy permissible under D&C Act + draft rules | Legal Counsel | Phase 1 |
| A2 | Schedule H/H1 require Rx + pharmacist verification | Pharmacist-in-Charge | Phase 5 |
| A3 | Schedule X require additional license, no home delivery | Legal + Pharmacist | Phase 5 |
| A4 | NTI drugs (warfarin, phenytoin, lithium, carbamazepine, digoxin) HARD-BLOCKED | Clinical Pharmacologist | Phase 3 |
| A5 | Anticoagulants require INR monitoring for refills | Clinical Pharmacologist | Phase 5 |
| A6 | Cytotoxic drugs require specialized handling/PPE | Oncology Pharmacist | Phase 6 |
| A7 | Blood products require cold chain + donor traceability | Blood Bank Officer | Phase 6 |
| A8 | Cold chain medicines require temp-monitored logistics | Cold Chain Manager | Phase 7 |
| A9 | Combination products matched atomically, never split | Formulation Scientist | Phase 3 |
| A10 | Release-type markers preserved in fingerprint | Formulation Scientist | Phase 3 |
| A11 | Formulary categories recorded as-given, flagged MISMATCH_SUSPECTED | Clinical Pharmacologist | Phase 3 |
| A12 | State drug licenses verified per dark store | Legal + Licensing | Phase 7 |
| A13 | Pharmacist registered with State Pharmacy Council | Pharmacist-in-Charge | Phase 5 |
| A14 | Rx validity: 6mo H/H1, indefinite OTC, 30d Schedule X | Legal + Pharmacist | Phase 5 |
| A15 | DPDP Act 2023 applies (health data = sensitive) | Data Protection Officer | Phase 1 |

---

## 7. ENVIRONMENT VARIABLES (KEY ONES)

```bash
# Required for Phase 1 boot
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/genericquick
REDIS_URL=redis://localhost:6379
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=dev-master-key
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_PRESCRIPTIONS=gq-prescriptions
S3_BUCKET_CERTIFICATES=gq-certificates
JWT_SECRET=<32+ bytes>
SESSION_SECRET=<32+ bytes>
```

**All integrations are BOUNDARY** — NotConfiguredProvider throws until Phase 5+.

---

## 8. HOW TO RESUME (FOR NEXT SESSION)

### 8.1 Immediate Steps
```bash
# 1. Install pnpm (if not available)
corepack enable && corepack prepare pnpm@9.0.0 --activate

# 2. Install dependencies
cd /mnt/c/Parchee && pnpm install

# 3. Start Docker services
pnpm docker:up

# 4. Generate Prisma client
pnpm db:generate

# 5. Run build to verify all packages compile
pnpm turbo run build

# 6. Run tests
pnpm turbo run test

# 7. If build passes, begin Phase 2
```

### 8.2 If Build Fails
Most likely error: `Cannot find module '@gq/domain'`
**Fix:** Ensure each package's `tsconfig.json` extends root:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" }
}
```

---

## 9. DECISION LOG (ADRs)

| ADR | Title | Status |
|-----|-------|--------|
| 0001 | Monorepo structure with pnpm + Turborepo | Accepted |
| 0002 | SHA-256 Formulation Fingerprint in Service Layer | Accepted |
| 0003 | Batch Assignment at Reservation (Checkout), Not Cart | Accepted |

---

## 10. NEXT ACTIONS

1. **Reviewer decision:** Authorize Phase 2 or request fixes first
2. **If authorized:** Execute Phase 2 per §A–§O structure
3. **Phase 2 deliverables:** schema.prisma, 6 raw SQL migrations, seed stub, test files
4. **Phase 3:** Formulary parse (druglist.pdf) → ontology ingest → DrugMatchingService

---

## 11. CONTACT / OWNERSHIP

**Principal Architect:** AI Agent (this session)
**Human Reviewer:** Required for Phase 2 authorization
**Regulatory Reviewers Needed:** Legal Counsel, Pharmacist-in-Charge, Clinical Pharmacologist, DPO

---

*End of Handoff Document*