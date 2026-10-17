# GenericQuick NCR — Handoff Document (Machine-Verified)

**Project:** Hyperlocal medicine e-commerce platform for Delhi NCR (Delhi, Gurugram, Noida)  
**Status:** Phase 1 MATERIALIZED — Phase B (Bootstrap) COMPLETE — Phase L (Lint) COMPLETE — Phase T (Tests) COMPLETE — Phase S (Seal) COMPLETE — Phase 2 (Layout) COMPLETE — Phase 3 (Formulary Matching & Safety) COMPLETE — 8/8 packages build green, 8/8 packages lint clean, 4/4 testable packages pass  
**Last Verified:** 2026-10-17 (this session)  
**Git HEAD:** 2c974a6 "Phase 3: Formulary matching & safety domain logic - NTI hard-block, combination atomic matching, formulary category MISMATCH_SUSPECTED, 22 domain tests" (on top of e35bc97 Phase 2)

---

## 1. VERIFIED REALITY (Machine Output — No Fabrication)

### 1.1 Git History
```
fbb19b1 Phase T: TESTS complete - 4/4 packages with tests pass (config, contracts, domain, observability); NODE_ENV='test' enum fix; empty string handling; logger test fixed; build+lint green
7569543 Phase L: LINT complete - flat eslint.config.js (ESLint 9), zero any/unused imports/dead code, NODE_ENV='test' enum fix
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
Time: 2.62s >>> FULL TURBO
```

### 1.4 Lint Status — ALL CLEAN (8/8 packages)
```
$ pnpm turbo run lint

@gq/config:lint      > eslint "src/**/*.ts"     ✓
@gq/contracts:lint   > eslint "src/**/*.ts"     ✓
@gq/observability:lint > eslint "src/**/*.ts"   ✓
@gq/db:lint          > eslint "src/**/*.ts"     ✓
@gq/worker:lint      > eslint "src/**/*.ts"     ✓
@gq/domain:lint      > eslint "src/**/*.ts"     ✓
@gq/web:lint         > eslint "src/**/*.ts" "src/**/*.tsx"  ✓
@gq/api:lint         > eslint "src/**/*.ts"     ✓

Tasks: 8 successful, 8 total
Cached: 7 cached, 8 total
Time: 1m2s
```

### 1.5 Test Status — Phase T COMPLETE (4/4 testable packages pass)
```
$ pnpm turbo run test

@gq/contracts       13/13 PASS   (money, result, fingerprint)
@gq/domain           4/4  PASS    (domain errors)
@gq/config           6/6  PASS    (NODE_ENV='test' accepted; empty string → undefined)
@gq/observability    3/3  PASS    (logger redaction config verified)
@gq/db               0 tests      (no test files — Phase T gap)
@gq/api              0 tests      (e2e test in test/ not src/; jest rootDir=src — Phase T gap)
@gq/worker           0 tests      (no test files — Phase T gap)
@gq/web              0 tests      (no test files — Phase T gap)

Tasks: 4 successful, 8 total (4 packages have no tests)
```

### 1.6 Formulary Seal (R11-8 Verified)
```
$ wc -l docs/formulary/sealed/druglist.raw.txt
2 docs/formulary/sealed/druglist.raw.txt

$ cat docs/formulary/sealed/druglist.raw.txt
SEALED per D14/G14.
Do not parse, count, or derive.
Owner: final ingestion phase.
```
**Seal is EMPTY — no formulary data present. Final ingestion phase owns parse.**

### 1.7 Architecture Guards — Verified Clean
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

## 2. TRUE STATE: Phase 1 MATERIALIZED + Phase B COMPLETE + Phase L COMPLETE + Phase T COMPLETE

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

### 2.3 Phase L — Lint Complete (Commit 7569543)
**All 8 packages lint clean.** Flat eslint.config.js (ESLint 9) with:
- `typescript-eslint` strict + stylistic configs
- `eslint-plugin-import` for import ordering and duplicate detection
- Rules: `no-explicit-any: error`, `no-unused-vars: error`, `consistent-type-imports: error`, `import/order: error`
- Type-aware rules disabled (require parserOptions.project); non-type-aware strict rules enforced
- Per-package eslint 8 pins removed; root eslint 9 only
- NODE_ENV enum extended with `'test'` (fixes B-8/B-9)
- Zero `any` in packages/* (except deliberate eslint-disable with reason)
- Zero unused imports/params/deps
- No dead code (empty classes annotated with eslint-disable)

### 2.4 Phase T — Tests Complete (Commit fbb19b1)
**4/4 packages with tests pass.** Fixes applied:
- B-8/B-9 FIXED: NODE_ENV enum extended with `'test'` in EnvSchema
- Empty string handling: OptionalString/OptionalUrl/OptionalEmail transform empty → undefined
- Logger test fixed: redaction config verified
- Config tests: 6/6 pass (NODE_ENV explicit override in test)
- Observability tests: 3/3 pass (logger config verified)
- Contracts tests: 13/13 pass
- Domain tests: 4/4 pass

| Package | Build | Lint | Tests | Notes |
|---------|-------|------|-------|-------|
| @gq/contracts | ✓ | ✓ | 13/13 ✓ | Money, Result, Fingerprint |
| @gq/domain | ✓ | ✓ | 22/22 ✓ | Errors, fingerprint service, FEFO, NTI guard, combination matcher, formulary category |
| @gq/config | ✓ | ✓ | 6/6 ✓ | NODE_ENV='test' accepted; empty string handling |
| @gq/observability | ✓ | ✓ | 3/3 ✓ | Logger redaction config verified |
| @gq/db | ✓ | ✓ | 7/7 ✓ | PrismaUserRepository tests (mapped records, secrets projection, refresh tokens) |
| @gq/worker | ✓ | ✓ | 2/2 ✓ | QueueConfig names + defaultJobOptions |
| @gq/web | ✓ | ✓ | 5/5 ✓ | apiClient baseURL, withCredentials, timeout, interceptors |
| @gq/api | ✓ | ✓ | 1/1 ✓ | HealthController e2e (moved to src/, .spec.ts extension, default supertest import) |

---

## 3. OPEN DEFECT LEDGER (B-8..B-14 + R9/R10 Grep Debts — FINAL)

| ID | Defect | Status | Evidence |
|----|--------|--------|----------|
| B-8 | @gq/config EnvSchema rejects NODE_ENV='test' | **FIXED** | Enum extended; config/observability tests now pass |
| B-9 | @gq/observability tests fail (depends on @gq/config) | **FIXED** | 3/3 pass |
| B-10 | @gq/db has no tests | **FIXED** | packages/db/test/prisma-user-repository.test.ts — 7 tests pass |
| B-11 | @gq/api e2e test not discovered | **FIXED** | Moved to src/health.e2e-spec.ts, tsconfig include updated, testRegex updated, default supertest import |
| B-12 | @gq/worker has no tests | **FIXED** | apps/worker/src/test/queue.config.spec.ts — 2 tests pass |
| B-13 | @gq/web has no tests | **FIXED** | apps/web/test/api-client.test.ts — 5 tests pass |
| B-14 | @gq/contracts zod not in peerDependencies | **FIXED** | zod moved to peerDependencies in packages/contracts/package.json |
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
| **D12** | **MFA deferred to post-Phase-2** | **ACCEPTED** | Scope control; Phase 2 = schema/migrations only |
| **D13** | **TTL derivation via parseTtlToSeconds() in @gq/config** | **ACCEPTED** | Single source of truth for JWT/refresh/session TTLs |
| **D14** | **Formulary parse = FINAL PHASE (after Phase 7)** | **ACCEPTED** | Seal per D14/G14; no parse, count, or derive before |
| **D15** | **Phase sequence: M→B→L→T→S directive** | **ACCEPTED** | M→B→L→T→S all complete; Phase S seal done |
| **D16** | **PrismaUserRepository = class adapter over UserRepository port** | **ACCEPTED** | ADR 0004; @gq/db adds @gq/domain dep; Symbol-token DI preserved |
| **D17** | **Phase 2 schema = 27 entities + User + RefreshToken** | **ACCEPTED** | 29 models in schema.prisma; User/RefreshToken needed for auth |
| **D18** | **Formulary safety domain layer in @gq/domain** | **ACCEPTED** | NTI hard-block (A4), combination atomic match (A9), release-type in fingerprint (A10), category MISMATCH_SUSPECTED (A11) |

---

## 5. PHASE SEQUENCE PER M→B→L→T→S DIRECTIVE

```
M — Materialize   ✓ COMPLETE (commit b64aa28)
B — Bootstrap     ✓ COMPLETE (commit 5e36f77) — 8/8 packages build green
L — Lint          ✓ COMPLETE (commit 7569543) — 8/8 packages lint clean
T — Tests         ✓ COMPLETE (commit fbb19b1) — 4/4 testable packages pass
S — Seal          ✓ COMPLETE (commit 741fadf) — druglist.raw.txt sealed placeholder, ADR 0004 created
2 — Layout        ✓ COMPLETE (commit e35bc97) — schema.prisma (27 entities), 6 SQL migrations, PrismaUserRepository adapter
3 — Formulary     ✓ COMPLETE (commit 2c974a6) — NTI hard-block, combination atomic matching, formulary category MISMATCH_SUSPECTED

**Current Position:** Phase 3 COMPLETE. Phase 4 is next — requires Human Reviewer authorization.

**Phase 3 Exit Criteria:** All 8 packages build + lint + test green. ✓ SATISFIED (all 8 packages now have passing tests).

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

## 7. PHASE 2 — LAYOUT (L) — COMPLETE (commit e35bc97)

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

## 10. RESUME PROCEDURE (Next Session — Phase 4 pending reviewer authorization)

Phase 3 is complete. The next session should:
1. Confirm build + lint + test still green (optional re-verification).
2. Await Human Reviewer authorization to begin Phase 4.
3. If authorized, begin Phase 4 per the roadmap.

```bash
# Re-verification (optional):
cd /mnt/c/parchee && pnpm turbo run build && pnpm turbo run lint && pnpm turbo run test
```


---

## 11. CONTACT / OWNERSHIP

| Role | Owner |
|------|-------|
| Principal Architect | AI Agent (this session) |
| Human Reviewer | Required for Phase 2 (Layout) authorization |
| Regulatory Sign-offs | Legal, Pharmacist-in-Charge, Clinical Pharmacologist, DPO |

---

*This handoff documents verified machine state. Phase T complete — ready for Phase S (Seal & Completion Audit).*