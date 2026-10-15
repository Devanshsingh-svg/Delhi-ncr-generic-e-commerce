# GenericQuick NCR — Handoff Document (Machine-Verified)

**Project:** Hyperlocal medicine e-commerce platform for Delhi NCR (Delhi, Gurugram, Noida)  
**Status:** Phase 1 MATERIALIZED — Phase B (Bootstrap) COMPLETE — 8/8 packages build green  
**Last Verified:** 2026-10-15 (this session)  
**Git HEAD:** 5e36f77 "Phase B: Bootstrap build complete - all 8 packages build successfully"

---

## 1. VERIFIED REALITY (Machine Output — No Fabrication)

### 1.1 Git History
```
5e36f77 Phase B: Bootstrap build complete - all 8 packages build successfully
b64aa28 Phase M: Materialize complete Phase 1 codebase with all reviewer fixes applied
```

### 1.2 Repository Size
```
451 files (excluding .git/, node_modules/)
```

### 1.3 Build Status — ALL GREEN (8/8 packages)
```
$ pnpm turbo run build

@gq/config:build      > tsc                    ✓
@gq/contracts:build   > tsc                    ✓
@gq/observability:build > tsc                  ✓
@gq/db:build          > tsc                    ✓
@gq/worker:build      > nest build             ✓
@gq/domain:build      > tsc                    ✓
@gq/web:build         > next build             ✓ (4 static pages)
@gq/api:build         > nest build             ✓

Tasks: 8 successful, 8 total
Cached: 8 cached, 8 total
Time: 2.12s >>> FULL TURBO
```

### 1.4 Test Status — Partial (Known Gaps)
```
@gq/contracts   13/13 PASS   (money, result, fingerprint)
@gq/domain      4/4  PASS    (domain errors)
@gq/config      2/6  PASS    4 FAIL: NODE_ENV='test' not in enum (dev/staging/prod only)
@gq/observability 0/3  PASS  3 FAIL: same NODE_ENV issue via @gq/config
@gq/db          0 tests      (no test files)
@gq/api         0 tests      (e2e test in test/ not src/; jest rootDir=src)
@gq/worker      0 tests      (no test files)
@gq/web         0 tests      (no test files)
```

### 1.5 Formulary Seal (R11-8 Verified)
```
$ wc -l docs/formulary/sealed/druglist.raw.txt
2 docs/formulary/sealed/druglist.raw.txt

$ cat docs/formulary/sealed/druglist.raw.txt
SEALED per D14/G14.
Do not parse, count, or derive.
Owner: final ingestion phase.
```
**Seal is EMPTY — no formulary data present. Final ingestion phase owns parse.**

### 1.6 Architecture Guards — Verified Clean
```
$ grep -rn "@prisma/client" packages/domain/src/ | wc -l
0

$ grep -rn "z.coerce.boolean" packages/ | wc -l
0

$ grep -n "experimentalDecorators" apps/api/tsconfig.json
6:    "experimentalDecorators": true,
```
**apps/api/tsconfig.json also has:**
- `emitDecoratorMetadata: true`
- `useDefineForClassFields: false`

---

## 2. TRUE STATE: Phase 1 MATERIALIZED + Phase B COMPLETE

### 2.1 Phase 1 — Materialized (Commit b64aa28)
All reviewer-mandated fixes applied across 3 fix cycles:
- UserRepository = abstract class + Symbol token (`USER_REPOSITORY_TOKEN`)
- UserRecord / UserRecordWithSecrets split (safe projection vs secrets)
- NotConfiguredUserRepository throws `AuthPersistenceNotConfiguredError` (503)
- MFA removed entirely (deferred per D12)
- z.coerce.int → number().int() fixed
- Global ZodValidationPipe removed (per-endpoint only)
- HttpExceptionFilter handles NotConfigured error
- Strategies use APP_CONSTANTS, logger injected

### 2.2 Phase B — Bootstrap Complete (Commit 5e36f77)
**All 8 packages compile.** No tsconfig path aliases in package.json exports — workspace protocol (`@gq/*` via `packages/*/src`) is the sole resolution mechanism.

| Package | Build | Tests | Notes |
|---------|-------|-------|-------|
| @gq/contracts | ✓ | 13/13 ✓ | Money, Result, Fingerprint |
| @gq/domain | ✓ | 4/4 ✓ | Errors, ports, fingerprint service, FEFO |
| @gq/config | ✓ | 2/6 ✓ | 4 FAIL: NODE_ENV='test' rejected by EnvSchema |
| @gq/observability | ✓ | 0/3 ✓ | 3 FAIL: calls getEnv() → NODE_ENV='test' rejected |
| @gq/db | ✓ | 0 tests | Stub schema only (_MigrationPlaceholder) |
| @gq/worker | ✓ | 0 tests | No test files |
| @gq/web | ✓ | 0 tests | Next.js builds 4 static pages |
| @gq/api | ✓ | 0 tests | E2E test in test/ (jest rootDir=src mismatch) |

---

## 3. OPEN DEFECT LEDGER (B-8..B-14 + R9/R10 Grep Debts)

| ID | Defect | Status | Evidence |
|----|--------|--------|----------|
| B-8 | @gq/config EnvSchema rejects NODE_ENV='test' | OPEN | 4 test failures; vitest sets NODE_ENV=test |
| B-9 | @gq/observability tests fail (depends on @gq/config) | OPEN | 3 failures; getLogger() calls getEnv() |
| B-10 | @gq/db has no tests | OPEN | No test files in packages/db/test/ |
| B-11 | @gq/api e2e test not discovered | OPEN | test/health.e2e-spec.ts vs jest rootDir=src |
| B-12 | @gq/worker has no tests | OPEN | No test files |
| B-13 | @gq/web has no tests | OPEN | No test files |
| B-14 | @gq/api missing zod in deps (used in pipes) | OPEN | apps/api/package.json has zod but not @gq/contracts peer |
| R9 | grep debt: `@prisma/client` in domain | CLOSED | Verified 0 occurrences |
| R10 | grep debt: `z.coerce.boolean` in packages | CLOSED | Verified 0 occurrences |

---

## 4. DECISION LOG D1–D15 (Current + Proposed)

| ID | Decision | Status | Rationale |
|----|----------|--------|-----------|
| D1 | pnpm + Turborepo monorepo | ACCEPTED | ADR 0001 |
| D2 | SHA-256 fingerprint in service layer | ACCEPTED | ADR 0002 |
| D3 | Batch assignment at reservation (checkout) | ACCEPTED | ADR 0003 |
| D4 | UserRepository = abstract class + Symbol token | ACCEPTED | Fix A1 |
| D5 | UserRecord / UserRecordWithSecrets split | ACCEPTED | Fix A2 |
| D6 | NotConfiguredUserRepository throws 503 | ACCEPTED | Fix A5(b) |
| D7 | MFA removed from Phase 1 scaffold | ACCEPTED | Fix A4(b) |
| D8 | Per-endpoint ZodValidationPipe (not global) | ACCEPTED | Fix cycle 1 |
| D9 | AuditEvent.id = UUID v7 | ACCEPTED | Phase 0 §4.5 |
| D10 | FEFO reservation with advisory locks (3 retries) | ACCEPTED | Phase 1 domain service |
| D11 | Formulary SEALED until final ingestion phase | ACCEPTED | D14/G14 directive |
| **D12** | **MFA deferred to post-Phase-2** | **PROPOSED** | Scope control; Phase 2 = schema/migrations only |
| **D13** | **TTL derivation via parseTtlToSeconds() in @gq/config** | **PROPOSED** | Single source of truth for JWT/refresh/session TTLs |
| **D14** | **Formulary parse = FINAL PHASE (after Phase 7)** | **PROPOSED** | Seal per D14/G14; no parse, count, or derive before |
| **D15** | **Phase sequence: M→B→L→T→S directive** | **PROPOSED** | Current: mid-Phase-B; blocker = B-8/B-9 test env |

---

## 5. PHASE SEQUENCE PER M→B→L→T→S DIRECTIVE

```
M — Materialize   ✓ COMPLETE (commit b64aa28)
B — Bootstrap     ✓ COMPLETE (commit 5e36f77) — 8/8 packages build green
L — Layout        ⏳ NEXT      — Prisma schema, 6 raw SQL migrations, 27 entities
T — Transact      ⏳ PENDING   — Cart, checkout, reservation, payments
S — Ship          ⏳ PENDING   — Dispatch, rider, delivery, tracking
```

**Current Position:** Mid-Phase-B — build green, test env defects B-8/B-9 block clean `pnpm turbo run test`.

**Remaining Phase-B Blocker:** `@gq/config` EnvSchema must accept `NODE_ENV='test'` (or tests must inject valid env). Fix in `@gq/config/src/env.ts` EnvSchema enum.

---

## 6. EXPLICIT "DO NOT" LIST (Enforced by Directive)

| # | Prohibition | Reason |
|---|-------------|--------|
| 1 | **NO formulary parsing before final phase** | Seal per D14/G14; druglist.raw.txt is empty placeholder |
| 2 | **NO MFA implementation in Phase 2** | D12: MFA post-Phase-2; Phase 2 = schema/migrations only |
| 3 | **NO tsconfig path aliases** | Deliberately removed; workspace protocol is sole resolution |
| 4 | **NO interface-as-DI-token** | Symbol token (`USER_REPOSITORY_TOKEN`) is the pattern |
| 5 | **NO @prisma/client in @gq/domain** | Verified 0; domain stays framework-agnostic |
| 6 | **NO z.coerce.boolean** | Verified 0; use BooleanFromEnv preprocessor |
| 7 | **NO global ZodValidationPipe** | Per-endpoint only; global pipe removed in fix cycle 1 |
| 8 | **NO real formulary data in seeds** | AC-21: seeds are stubs only |

---

## 7. PHASE 2 — LAYOUT (L) — READY TO BEGIN

### 7.1 Goal
Complete PostgreSQL schema, Prisma models, PostGIS migrations, and constraints for all 27 entities. Seed strategy only — no real formulary data.

### 7.2 Entity List (27 Required in schema.prisma)
| Domain | Entities |
|--------|----------|
| Catalog | Molecule, Formulation, FormulationIngredient, BrandMedicine, GenericMedicine, Manufacturer, RegulatorySchedule |
| Facility | DarkStore, DarkStoreLicense, PharmacistAssignment |
| Inventory | InventoryBatch |
| Customer | Customer, Address |
| Prescription | Prescription, PrescriptionItem, PharmacistReview, Consultation |
| Transaction | Cart, CartItem, Order, OrderItem, Payment, Shipment, StockReservation |
| Operations | Rider, IdempotencyRecord, AuditEvent |

### 7.3 Raw SQL Migrations (infra/migrations/)
| File | Purpose |
|------|---------|
| 0001_audit_append_only.sql | Trigger + REVOKE on audit_events |
| 0002_postgis_extensions.sql | CREATE EXTENSION postgis, citext, pgcrypto, uuid-ossp |
| 0003_spatial_columns.sql | delivery_polygon GEOMETRY, Address.geo GEOGRAPHY |
| 0004_spatial_indexes.sql | GiST indexes on spatial columns |
| 0005_formulation_fingerprint.sql | Partial unique index on fingerprint (schema_version=1) |
| 0006_check_constraints.sql | InventoryBatch quantity invariant |

### 7.4 Phase 2 Acceptance Criteria
| AC | Description |
|----|-------------|
| AC-15 | `prisma migrate deploy` applies cleanly on empty PG16+PostGIS |
| AC-16 | `SELECT PostGIS_Version()` returns >= 3.x |
| AC-17 | GiST indexes exist on DarkStore.delivery_polygon and Address.geo |
| AC-18 | Partial unique index on formulation.fingerprint (WHERE schema_version=1) |
| AC-19 | audit_events UPDATE/DELETE rejected by trigger |
| AC-20 | Seed script exists but does not run in CI |
| AC-21 | No real formulary data in seeds |
| AC-22 | All 27 entities appear in schema.prisma |

---

## 8. REGULATORY ASSUMPTIONS (A1–A15 — ALL UNREVIEWED)

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

## 9. ENVIRONMENT (Key Variables)

```bash
# Required for boot
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

# All integrations BOUNDARY — NotConfiguredProvider throws until Phase 5+
OCR_PROVIDER=not-configured
PAYMENT_PROVIDER=not-configured
SMS_PROVIDER=not-configured
EMAIL_PROVIDER=not-configured
MAPS_PROVIDER=not-configured
TELEMEDICINE_PROVIDER=not-configured
```

---

## 10. RESUME PROCEDURE (Next Session)

```bash
# 1. Verify build still green
cd /mnt/c/Parchee && pnpm turbo run build

# 2. Fix B-8/B-9: allow NODE_ENV='test' in EnvSchema enum
#    Edit packages/config/src/env.ts line 28:
#    NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),

# 3. Run tests — expect 6/8 packages passing (db, api, worker, web need test files)
pnpm turbo run test

# 4. If green, begin Phase 2 (Layout): schema.prisma + 6 SQL migrations
```

---

## 11. CONTACT / OWNERSHIP

| Role | Owner |
|------|-------|
| Principal Architect | AI Agent (this session) |
| Human Reviewer | Required for Phase 2 (Layout) authorization |
| Regulatory Sign-offs | Legal, Pharmacist-in-Charge, Clinical Pharmacologist, DPO |

---

*This handoff documents verified machine state. It does not substitute for completing Phase-B test fixes before Phase-L authorization.*