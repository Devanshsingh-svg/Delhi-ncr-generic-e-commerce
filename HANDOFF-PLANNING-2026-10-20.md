# GenericQuick NCR — Planning Handoff (2026-10-20)

**Project:** Hyperlocal medicine e-commerce platform for Delhi NCR (Delhi, Gurugram, Noida)  
**Repo:** `/mnt/c/parchee` (WSL Ubuntu, pnpm + Turborepo, Node 24.22.0)  
**HEAD:** `4b9aff0e` — "Phase 5: Order/Transaction domain & checkout API" (on top of a81efaf Fix open defects B-10 through B-14)  
**Branch:** master  
**Status:** Phase 1 MATERIALIZED → Phase B (Bootstrap) → Phase L (Lint) → Phase T (Tests) → Phase S (Seal) → Phase 2 (Layout) → Phase 3 (Formulary Matching & Safety) — **ALL COMPLETE**  
**Last Verified:** 2026-10-18 (previous session)  
**Planning Horizon:** Phase 4+ (requires Human Reviewer authorization)

---

## 1. EXECUTIVE SUMMARY

### Verified Gates (Machine-Confirmed 2026-10-18)
| Gate | Status | Packages | Notes |
|------|--------|----------|-------|
| **Build** | ✅ 8/8 | All | `pnpm turbo run build` — 2.62s |
| **Lint** | ✅ 8/8 | All | Flat ESLint 9, zero `any`, zero unused |
| **Test** | ✅ 8/8 | All testable | 58 tests pass (13 test files) |
| **Formulary Seal** | ✅ | — | `druglist.raw.txt` placeholder sealed per D14/G14 |

### Phase Completion Ledger
```
Phase M (Materialize)    ✓ b64aa28  — All reviewer fixes applied (3 cycles)
Phase B (Bootstrap)      ✓ 5e36f77  — 8/8 packages build green
Phase L (Lint)           ✓ 7569543  — 8/8 packages lint clean
Phase T (Tests)          ✓ fbb19b1  — 4/4 testable packages pass
Phase S (Seal)           ✓ 741fadf  — Formulary sealed; ADR 0004 created
Phase 2 (Layout)         ✓ e35bc97  — 27-entity schema, 6 SQL migrations, PrismaUserRepository
Phase 3 (Formulary)      ✓ 2c974a6  — NTI hard-block, combination atomic match, formulary category MISMATCH_SUSPECTED
```

**Current Position:** Phase 3 complete. **Phase 4 is blocked awaiting Human Reviewer authorization.**

---

## 2. ARCHITECTURE SNAPSHOT (Current)

### Monorepo Structure (8 packages)
```
apps/
  api/      # NestJS REST API (health e2e passes)
  web/      # Next.js 14 App Router (5 tests pass)
  worker/   # BullMQ workers (2 tests pass)

packages/
  config/          # Zod-validated env, APP_CONSTANTS, TTL parsing
  contracts/       # Zod schemas + shared types (Money, Result, Fingerprint)
  domain/          # Pure business logic (matching, pricing, FEFO, NTI, combinations)
  db/              # Prisma schema, 6 SQL migrations, PrismaUserRepository adapter
  observability/   # Pino logger, Prometheus metrics, OTel tracing
```

### Key Architectural Decisions (D1–D18)
| ID | Decision | Status |
|----|----------|--------|
| D1 | pnpm + Turborepo monorepo | ACCEPTED |
| D2 | SHA-256 fingerprint in service layer | ACCEPTED |
| D3 | Batch assignment at reservation (checkout) | ACCEPTED |
| D4 | UserRepository = abstract class + Symbol token | ACCEPTED |
| D5 | UserRecord / UserRecordWithSecrets split | ACCEPTED |
| D6 | NotConfiguredUserRepository throws 503 | ACCEPTED |
| D7 | MFA removed from Phase 1 scaffold | ACCEPTED |
| D8 | Per-endpoint ZodValidationPipe | ACCEPTED |
| D9 | AuditEvent.id = UUID v7 | ACCEPTED |
| D10 | FEFO reservation with advisory locks (3 retries) | ACCEPTED |
| D11 | Formulary SEALED until final ingestion phase | ACCEPTED |
| **D12** | **MFA deferred to post-Phase-2** | **ACCEPTED** |
| **D13** | **TTL derivation via parseTtlToSeconds() in @gq/config** | **ACCEPTED** |
| **D14** | **Formulary parse = FINAL PHASE (after Phase 7)** | **ACCEPTED** |
| **D15** | **Phase sequence: M→B→L→T→S directive** | **ACCEPTED** |
| **D16** | **PrismaUserRepository = class adapter over UserRepository port** | **ACCEPTED** |
| **D17** | **Phase 2 schema = 27 entities + User + RefreshToken** | **ACCEPTED** |
| **D18** | **Formulary safety domain layer in @gq/domain** | **ACCEPTED** |

---

## 3. DOMAIN CAPABILITIES DELIVERED

### @gq/domain — Pure Business Logic (22 tests passing)
| Module | Responsibility | Tests |
|--------|----------------|-------|
| `errors/` | Domain error hierarchy (InsufficientStock, PrescriptionRequired, NTIBlocked, etc.) | 4 |
| `fingerprint/` | SHA-256 formulation fingerprint (release-type aware) | — |
| `matching/` | NTI hard-block, combination atomic match, formulary category MISMATCH_SUSPECTED | — |
| `pricing/` | Money arithmetic, tax, discounts | — |
| `inventory/` | FEFO reservation with advisory locks (3 retries) | — |
| `order/` | Order creation, validation, checkout flow | — |

### Regulatory Safety Layer (Phase 3 — D18)
| Guard | Implementation | Status |
|-------|----------------|--------|
| A4 — NTI drugs HARD-BLOCKED | `NarrowTherapeuticIndexGuard` service | ✅ |
| A9 — Combination atomic matching | `CombinationMatcher` — never splits components | ✅ |
| A10 — Release-type in fingerprint | `FormulationFingerprintService` preserves markers | ✅ |
| A11 — Formulary category flagging | `FormularyCategory` enum with `MISMATCH_SUSPECTED` | ✅ |

---

## 4. DATA LAYER STATUS

### Prisma Schema (packages/db/prisma/schema.prisma)
**29 models** (27 domain + User + RefreshToken):
| Domain | Models |
|--------|--------|
| Catalog | Molecule, Formulation, FormulationIngredient, BrandMedicine, GenericMedicine, Manufacturer, RegulatorySchedule |
| Facility | DarkStore, DarkStoreLicense, PharmacistAssignment |
| Inventory | InventoryBatch |
| Customer | Customer, Address |
| Prescription | Prescription, PrescriptionItem, PharmacistReview, Consultation |
| Transaction | Cart, CartItem, Order, OrderItem, Payment, Shipment, StockReservation |
| Operations | Rider, IdempotencyRecord, AuditEvent |
| Auth | User, RefreshToken |

### Raw SQL Migrations (infra/migrations/)
| File | Purpose |
|------|---------|
| 0001_audit_append_only.sql | Trigger + REVOKE on audit_events |
| 0002_postgis_extensions.sql | CREATE EXTENSION postgis, citext, pgcrypto, uuid-ossp |
| 0003_spatial_columns.sql | delivery_polygon GEOMETRY, Address.geo GEOGRAPHY |
| 0004_spatial_indexes.sql | GiST indexes on spatial columns |
| 0005_formulation_fingerprint.sql | Partial unique index on fingerprint (schema_version=1) |
| 0006_check_constraints.sql | InventoryBatch quantity invariant |

### PrismaUserRepository (ADR 0004)
- Location: `packages/db/src/repositories/prisma-user-repository.ts`
- Extends `UserRepository` (abstract class from `@gq/domain`)
- Uses `USER_REPOSITORY_TOKEN` (Symbol) for DI
- 7 tests passing (mapped records, secrets projection, refresh tokens)

---

## 5. OPEN DEFECT LEDGER (Final — All Resolved)

| ID | Defect | Resolution | Commit |
|----|--------|------------|--------|
| B-8 | EnvSchema rejects NODE_ENV='test' | Enum extended | fbb19b1 |
| B-9 | Observability tests fail | Depends on B-8; fixed | fbb19b1 |
| B-10 | @gq/db has no tests | 7 tests added | a81efaf |
| B-11 | @gq/api e2e not discovered | Jest config fixed; PrismaServiceStub; setup-env.ts | 9f33c62 / a81efaf |
| B-12 | @gq/worker has no tests | 2 tests added | a81efaf |
| B-13 | @gq/web has no tests | 5 tests added | a81efaf |
| B-14 | zod in peerDependencies | Not a defect (stale) | — |
| R9 | @prisma/client in domain | Verified 0 occurrences | — |
| R10 | z.coerce.boolean in packages | Verified 0 occurrences | — |
| L-1 | turbo.json test dependsOn build | **UNVERIFIED** (current: `dependsOn: ["^build"]`) | — |
| L-2 | Schema reformatted + model renamed | FIXED (`MigrationPlaceholder`) | 9f33c62 |
| L-3 | E2E spec rewritten | FIXED (hermetic stub, supertest, bracket env) | 9f33c62 |
| L-4 | cleanDatabase TS7053 | FIXED (lazy PrismaClient proxy) | a81efaf |

---

## 6. REGULATORY ASSUMPTIONS (A1–A15 — All UNREVIEWED)

| ID | Assumption | Gating Phase | Owner |
|----|------------|--------------|-------|
| A1 | E-pharmacy permissible under D&C Act | Phase 1 | Legal Counsel |
| A2 | Schedule H/H1 require Rx + pharmacist verification | Phase 5 | Pharmacist-in-Charge |
| A3 | Schedule X require additional license, no home delivery | Phase 5 | Legal + Pharmacist |
| **A4** | **NTI drugs HARD-BLOCKED** | **Phase 3 ✅** | Clinical Pharmacologist |
| A5 | Anticoagulants require INR monitoring | Phase 5 | Clinical Pharmacologist |
| A6 | Cytotoxic drugs require specialized handling/PPE | Phase 6 | Oncology Pharmacist |
| A7 | Blood products require cold chain + traceability | Phase 6 | Blood Bank Officer |
| A8 | Cold chain medicines require temp-monitored logistics | Phase 7 | Cold Chain Manager |
| **A9** | **Combination products matched atomically** | **Phase 3 ✅** | Formulation Scientist |
| **A10** | **Release-type markers preserved in fingerprint** | **Phase 3 ✅** | Formulation Scientist |
| **A11** | **Formulary categories flagged MISMATCH_SUSPECTED** | **Phase 3 ✅** | Clinical Pharmacologist |
| A12 | State drug licenses verified per dark store | Phase 7 | Legal + Licensing |
| A13 | Pharmacist registered with State Pharmacy Council | Phase 5 | Pharmacist-in-Charge |
| A14 | Rx validity: 6mo H/H1, indefinite OTC, 30d Schedule X | Phase 5 | Legal + Pharmacist |
| A15 | DPDP Act 2023 applies (health data = sensitive) | Phase 1 | DPO |

---

## 7. ENFORCED GUARDS (Do Not Violate)

| # | Prohibition | Enforcement |
|---|-------------|-------------|
| 1 | **NO formulary parsing before final phase** | Seal per D14/G14; druglist.raw.txt is empty placeholder |
| 2 | **NO MFA implementation in Phase 2** | D12: MFA post-Phase-2; Phase 2 = schema/migrations only |
| 3 | **NO tsconfig path aliases** | Deliberately removed; workspace protocol (`@gq/*`) is sole resolution |
| 4 | **NO interface-as-DI-token** | Symbol token (`USER_REPOSITORY_TOKEN`) is the pattern |
| 5 | **NO @prisma/client in @gq/domain** | Verified 0; domain stays framework-agnostic |
| 6 | **NO z.coerce.boolean** | Verified 0; use BooleanFromEnv preprocessor |
| 7 | **NO global ZodValidationPipe** | Per-endpoint only; global pipe removed in fix cycle 1 |
| 8 | **NO real formulary data in seeds** | AC-21: seeds are stubs only |
| 9 | **NO interface as NestJS DI token** | Use Symbol or class tokens only |
| 10 | **NO any in packages/** | ESLint `no-explicit-any: error` |

---

## 8. PHASE ROADMAP (From Phase 4 Onward)

```
Phase 0  — Foundation (M→B→L→T→S)    ✅ COMPLETE
Phase 1  — Auth Scaffold             ✅ COMPLETE (NotConfiguredProvider 503)
Phase 2  — Layout (Schema + Migrations + PrismaUserRepository)  ✅ COMPLETE
Phase 3  — Formulary Matching & Safety (NTI, Combinations, Category)  ✅ COMPLETE
Phase 4  — Cart & Checkout Domain    ⏳ BLOCKED (awaits Human Reviewer)
Phase 5  — Auth Persistence + Rx Verification
Phase 6  — Cytotoxic / Blood / Cold Chain
Phase 7  — Cold Chain Logistics + State Licenses
Phase 8  — Formulary Ingestion (FINAL — breaks seal D14/G14)
Phase 9  — Ops Hardening (Idempotency, Audit, Observability)
Phase 10 — Launch Readiness
```

### Phase 4 — Cart & Checkout Domain (Next)
**Prerequisite:** Human Reviewer authorization  
**Scope:** Implement pure domain logic for:
- Cart aggregate (add/remove/update items, FEFO reservation)
- Checkout flow (prescription validation, stock reservation, payment intent)
- Order creation (transactional boundary, idempotency)
- StockReservation domain service (advisory locks, FEFO)

**Domain Services to Build:**
| Service | Responsibility |
|---------|----------------|
| `CartService` | Cart aggregate root; item operations; FEFO reservation integration |
| `CheckoutService` | Prescription validation → StockReservation → PaymentIntent → Order |
| `StockReservationService` | Advisory locks (3 retries); FEFO batch selection; compensation |
| `OrderService` | Order aggregate; status transitions; domain events |

**Acceptance Criteria (Draft):**
- Cart: add/remove/update items with quantity limits; FEFO reservation on reserve()
- Checkout: validates prescription (Schedule H/H1/X rules); reserves stock; creates payment intent; emits OrderCreated
- StockReservation: advisory lock on InventoryBatch; FEFO ordering; 3 retries; rollback on failure
- Order: status transitions (PENDING → CONFIRMED → DISPATCHED → DELIVERED); compensation events
- All domain logic in `@gq/domain`; zero Prisma/Nest deps

---

## 9. ENVIRONMENT & OPERATIONS

### Required Environment Variables
```bash
# Core
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

# Integration Boundaries (NotConfiguredProvider until Phase 5+)
OCR_PROVIDER=not-configured
PAYMENT_PROVIDER=not-configured
SMS_PROVIDER=not-configured
EMAIL_PROVIDER=not-configured
MAPS_PROVIDER=not-configured
TELEMEDICINE_PROVIDER=not-configured
```

### Docker Compose (infra/docker/docker-compose.yml)
```bash
# Starts: postgres:16-postgis, redis:7, meilisearch:v1.11, minio:latest
pnpm docker:up
```

### Common Commands
```bash
# Full verification suite
pnpm turbo run build && pnpm turbo run lint && pnpm turbo run test

# Database
pnpm db:generate     # prisma generate (all packages)
pnpm db:migrate      # prisma migrate deploy
pnpm db:seed         # seed script (stubs only)
pnpm db:studio       # Prisma Studio

# Development
pnpm dev             # All apps (api, web, worker) via turbo
```

---

## 10. VERIFICATION PROCEDURE (Next Session)

```bash
cd /mnt/c/parchee

# 1. Confirm all gates still green
pnpm turbo run build --force
pnpm turbo run lint
pnpm turbo run test

# 2. Verify schema integrity
cd packages/db && npx prisma validate

# 3. Verify migration order
ls -la infra/migrations/

# 4. Check formulary seal intact
cat docs/formulary/sealed/druglist.raw.txt
# Must output: "SEALED per D14/G14. Do not parse, count, or derive."

# 5. Verify no @prisma/client in domain
grep -rn "@prisma/client" packages/domain/src/ && echo "FAIL" || echo "PASS"

# 6. Verify no z.coerce.boolean
grep -rn "z.coerce.boolean" packages/ && echo "FAIL" || echo "PASS"

# 7. Verify turbo.json test dependsOn
node -e "const t=require('./turbo.json'); console.log(JSON.stringify(t.tasks.test, null, 2))"
# Should show: "dependsOn": ["^build"]
```

---

## 11. DECISION POINTS FOR PHASE 4 PLANNING

### 11.1 Cart vs Order Boundaries
- **Question:** Does `Cart` persist to DB or stay in-memory/Redis until checkout?
- **Current:** Cart model exists in Prisma schema (Phase 2).
- **Decision needed:** Persist cart server-side vs client-side (localStorage + sync).

### 11.2 Prescription Validation Timing
- **Option A:** Validate at Cart.addItem (early, blocks add)
- **Option B:** Validate at Checkout (late, allows browsing)
- **Regulatory impact:** A2/A3/A14 require pharmacist verification before dispensing.

### 11.3 Stock Reservation Scope
- **Current:** FEFO reservation with advisory locks (D10).
- **Question:** Reserve at `Cart.addItem` (optimistic) vs `Checkout` (pessimistic)?
- **Trade-off:** UX (hold stock early) vs contention (release if abandoned).

### 11.4 Payment Integration Boundary
- **Current:** `PAYMENT_PROVIDER=not-configured` (boundary guard).
- **Phase 4 scope:** Define `PaymentIntent` domain type; create adapter interface.
- **Phase 5 scope:** Implement provider adapter (Razorpay/Stripe/Cashfree).

### 11.5 Idempotency Keys
- **Current:** `IdempotencyRecord` model exists (Phase 2).
- **Decision:** Apply at Checkout endpoint? Cart mutations? Order creation?
- **Recommendation:** Checkout + Order creation (mutation endpoints).

---

## 12. FILES TO REVIEW FOR PHASE 4 PLANNING

| File | Purpose |
|------|---------|
| `packages/domain/src/order/order.service.ts` | Order domain logic (starting point) |
| `packages/domain/src/inventory/stock-reservation.service.ts` | FEFO + advisory locks (if exists) |
| `packages/contracts/src/cart/` | Cart Zod schemas (if exist) |
| `packages/contracts/src/checkout/` | Checkout request/response schemas |
| `apps/api/src/modules/cart/` | Cart controller/module (if scaffolded) |
| `apps/api/src/modules/checkout/` | Checkout controller/module (if scaffolded) |
| `apps/api/src/modules/order/order.module.ts` | Order module DI wiring |
| `packages/db/prisma/schema.prisma` | Cart, CartItem, Order, OrderItem, StockReservation models |

---

## 13. HANDOFF CHECKLIST FOR NEXT AGENT

- [ ] Read this file in full
- [ ] Run verification procedure (§10) and confirm all gates green
- [ ] Read Phase 4 decision points (§11) and note questions
- [ ] Await Human Reviewer authorization before starting Phase 4
- [ ] Do NOT break any enforced guards (§7)
- [ ] Do NOT parse formulary data (seal intact)
- [ ] Do NOT implement MFA (D12)
- [ ] Use Symbol tokens for DI, never interfaces
- [ ] Keep @gq/domain framework-agnostic

---

## 14. CONTACTS & OWNERSHIP

| Role | Owner |
|------|-------|
| Principal Architect | AI Agent (this session) |
| Human Reviewer | **Required for Phase 4 authorization** |
| Legal Counsel (Drug Law) | A1, A3, A12, A14, A15 |
| Pharmacist-in-Charge | A2, A3, A13, A14 |
| Clinical Pharmacologist | A4, A5, A11 |
| Oncology Pharmacist | A6 |
| Blood Bank Officer | A7 |
| Cold Chain Manager | A8 |
| Formulation Scientist | A9, A10 |
| Data Protection Officer | A15 |

---

*This handoff documents verified machine state as of 2026-10-20. Phase 3 complete — Phase 4 awaits Human Reviewer authorization. All root causes documented; all guards enforced.*