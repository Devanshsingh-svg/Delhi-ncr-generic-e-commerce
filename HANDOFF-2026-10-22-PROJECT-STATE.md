# GenericQuick NCR — Comprehensive Project Handoff (2026-10-22)

**Project:** Hyperlocal, prescription-aware medicine e-commerce platform for Delhi NCR (Delhi, Gurugram, Noida)
**Repo:** `/mnt/c/parchee` (WSL Ubuntu, pnpm 9 + Turborepo, Node 24.22.0, TypeScript 5.9.2)
**Branch:** `master` — HEAD `0cf5d6a4d6a6d44e8e905bff21c822784cd52375` (2026-10-20 20:03)
**Status:** Domain + API + frontend buildout functionally complete through cart/checkout. **~57 uncommitted paths** (the entire Cart & Checkout vertical + frontend design system). All gates green (re-verified this session).
**Last full verification:** 2026-10-22, this session — `pnpm turbo run build lint test` → **24/24 tasks, exit 0**

---

## 1. EXECUTIVE SUMMARY — WHERE WE ACTUALLY ARE

1. **All 8 packages build, lint, and test green** — verified this session in a single turbo run (24/24 tasks, 8m17s). 136 test cases pass (135 unit + 1 API e2e; 2 API e2e skipped by design).
2. **The committed history ends at Phase 5 (Order/Transaction domain)**. Everything since — the **Cart & Checkout domain+API vertical** (tracked as "Phase 4 Cart & Checkout" in the ulw evidence, G001) and the **entire frontend buildout** — sits **uncommitted in the working tree** (32 modified files, ~893 insertions; 25+ untracked paths incl. 4 new API modules, 2 new domain modules, 3 new contracts, 18 frontend files).
3. **End-to-end demo flow is wired**: web catalog → cart (optimistic updates, toasts) → checkout (FEFO reservation, idempotency, confirm) → order success screen. API persists everything through Prisma adapters over Symbol-token ports.
4. **The formulary is still SEALED** (per D14/G14). No real catalog data has been ingested; `db:seed` script is missing; the DB has no seeded data path. The 524KB `Delhi_DarkStore_Dispatchable_Core.csv/xlsx` at repo root is the dispatchable-catalog dataset awaiting the final ingestion phase.
5. **Worker is config-only** (BullMQ queue names/job options, 2 tests, zero processors). **Meilisearch is env-config only** — not used anywhere in code.
6. **Auth is DB-backed** (`PrismaUserRepository` wired via `USER_REPOSITORY_TOKEN`), but no auth guards protect cart/checkout/catalog endpoints — demo mode with hardcoded `DEMO_CUSTOMER_ID`/`DEMO_DARK_STORE_ID` on the frontend.
7. **All regulatory assumptions A1–A15 remain UNREVIEWED** (legal/clinical sign-off outstanding).

### The single most important next action

**Commit the working tree.** ~3 days of verified work (Oct 21–22) exists only as uncommitted changes. Everything else in §12 builds on that.

---

## 2. VERIFIED MACHINE STATE (re-verified 2026-10-22, this session)

| Gate | Command | Result |
|------|---------|--------|
| Build | `pnpm --filter @gq/web run build` (and full turbo) | ✅ Next.js 14.2.35, 4 routes, exit 0 |
| Lint | `pnpm --filter @gq/web run lint` (and full turbo) | ✅ exit 0 (only a benign `MODULE_TYPELESS_PACKAGE_JSON` warning) |
| Test | `pnpm turbo run build lint test` | ✅ **24/24 tasks successful**, exit 0 |
| Formulary seal | `cat docs/formulary/sealed/druglist.raw.txt` | ✅ Intact — "SEALED per D14/G14. Do not parse, count, or derive." |
| Guard: no `@prisma/client` in domain | `grep -rn '@prisma/client' packages/domain/src/` | ✅ CLEAN |
| Guard: no `z.coerce.boolean` | `grep -rn 'z.coerce.boolean' packages/ --include='*.ts'` | ✅ CLEAN |
| Guard: no string DI tokens | `grep -rn "provide: '" apps/api/src/` | ✅ CLEAN (all Symbol tokens) |

### 2.1 Test inventory (exact, counted this session)

| Package | Test files | Test cases | Status |
|---------|-----------|------------|--------|
| `@gq/config` | 1 (`env.test.ts`) | 6 | ✅ |
| `@gq/contracts` | 3 (fingerprint, money, result) | 13 | ✅ |
| `@gq/db` | 1 (`prisma-user-repository.test.ts`) | 7 | ✅ |
| `@gq/domain` | 10 | **99** | ✅ (cart 20, checkout 11, order 15, prescription 12, cytotoxic svc 13 + entity 6, errors 7, combination 5, formulary-category 5, nti-guard 5) |
| `@gq/observability` | 1 (`logger.test.ts`) | 3 | ✅ |
| `@gq/web` | 1 (`api-client.test.ts`) | 5 | ✅ |
| `@gq/worker` | 1 (`queue.config.spec.ts`) | 2 | ✅ |
| `@gq/api` (e2e) | 1 (`health.e2e-spec.ts`) | 1 passed, **2 skipped** | ✅ (skips require live DB / Phase 2 auth) |
| **Total** | 19 files | **136** | ✅ |

The API e2e boots the **full AppModule** (all 10 modules incl. new Cart/Checkout/Inventory) — its pass proves Nest DI resolves every Symbol-token provider at bootstrap.

---

## 3. GIT STATE — UNCOMMITTED WORK INVENTORY (critical)

### 3.1 HEAD and branch
- `master` @ `0cf5d6a` "fix(api,db): resolve prisma strict types, clear api lint errors, pass all e2e and turbo build/lint/test gates" (Oct 20 20:03)
- No stashes.

### 3.2 Modified files (32 files, ~893 insertions / 50 deletions)

| Area | Files |
|------|-------|
| API wiring | `app.module.ts` (imports 4 new modules), `http-exception.filter.ts`, auth controller + jwt-refresh strategy, cytotoxic controller/module, order controller/module/repository, prescription controller/module |
| Web | `next.config.js`, `package.json` (adds framer-motion, sonner), `globals.css` (dark-mode vars, focus-visible, reduced-motion, skip-link), `layout.tsx` (skip link), `page.tsx` (full hero/search/filters/catalog rewrite), `providers.tsx` (Toaster + theme), `lib/api.ts`, `tailwind.config.ts`, `tsconfig.json` |
| Contracts | new `cart/catalog/checkout.contract.ts` (untracked), modified `order/prescription.contract.ts`, `index.ts` |
| Domain | `cytotoxic.port.ts`, `index.ts` (exports cart/checkout), `inventory/reservation.service.ts`, `order/order.port.ts`, `ports/inventory-reservation.port.ts`, `prescription.port.ts` |
| Tooling | `eslint.config.js`, root `package.json`, `pnpm-lock.yaml` |

### 3.3 Untracked files (entire new modules)

| Area | Paths |
|------|-------|
| API modules (new) | `apps/api/src/modules/cart/` (controller, module, repository, index), `catalog/` (controller, module), `checkout/` (controller, module, repository), `inventory/` (module, repository, index) |
| Domain modules (new) | `packages/domain/src/cart/` (entity, errors, port, service, index), `checkout/` (entity, errors, port, service, index) |
| Domain tests (new) | `test/cart.service.test.ts` (20), `test/checkout.service.test.ts` (11) |
| Contracts (new) | `packages/contracts/src/api/cart.contract.ts`, `catalog.contract.ts`, `checkout.contract.ts` |
| Web (new) | `app/cart/page.tsx`, `app/checkout/page.tsx`, `components/` (SiteHeader, ProductCard, FilterPanel, CategoryGrid, TrustSection, ui/Button, Input, Badge, Card, Skeleton, Modal, Toast), `hooks/` (useCatalogFilters, useDebounce, useReducedMotion, useToast), `lib/demo.ts`, `styles/tokens.ts`, `types/env.d.ts` |
| Docs | `HANDOFF-FRONTEND.md`, `HANDOFF-PLANNING-2026-10-20.md`, `IMPLEMENTATION-PLAN.md` |
| Evidence | `.omo/evidence/ulw/.../G001-task-complete-phase-4-cart-checkout/` (self-review, gates, guards, data-diff — 2 attempts a0/a1) |
| **Junk (delete before commit)** | `eslint` and `There` (zero-byte accidental files, Oct 20), `parchee/` (**accidental recursive copy of the whole repo incl. node_modules**), `.senpi/` |

### 3.4 Suggested commit slicing (recommendation)
1. `feat(domain,contracts): cart & checkout domain — entities, ports, services, idempotency, PaymentIntent boundary; 31 tests` (domain + contracts + domain tests)
2. `feat(api): cart, catalog, checkout, inventory modules — Prisma adapters over Symbol ports; full AppModule wiring` (apps/api + app.module)
3. `feat(web): design system + homepage/catalog/cart/checkout buildout` (apps/web)
4. `chore: handoff docs, evidence; remove stray artifacts` (docs, .omo/evidence; delete `eslint`, `There`, `parchee/`)

---

## 4. PHASE LEDGER & TIMELINE

### 4.1 ⚠️ Phase-numbering discrepancy (read this before planning)
Two numbering schemes coexist in the repo's history:
- **Planning docs** (`HANDOFF-PLANNING-2026-10-20.md` §8, ulw goal G001): "Phase 4 = Cart & Checkout", "Phase 5 = Auth Persistence + Rx Verification", 6/7/8/9/10 as below.
- **Commit messages**: `a4b0836 "Phase 4: Prescription domain & API layer"`, `4b9aff0 "Phase 5: Order/Transaction domain & checkout API"`.

Both are "done" for their own scopes. **The roadmap below uses the planning-doc numbering** — map carefully when reading git log.

### 4.2 Committed history (verified `git log`)

| Commit | Date | Content |
|--------|------|---------|
| `b64aa28` | Oct 12 22:27 | Phase M: materialize Phase 1 codebase, reviewer fixes applied |
| `5e36f77` | Oct 12 23:37 | Phase B: 8/8 packages bootstrap build |
| `7569543` | Oct 15 21:12 | Phase L: ESLint 9 flat config, zero any/unused |
| `fbb19b1` | Oct 15 21:29 | Phase T: tests — config/contracts/domain/observability pass; NODE_ENV='test' |
| `2bdfb3a` | Oct 17 08:21 | Phase L reconciliation — TS 5.9.2 pinned, import plugin, HANDOFF verbatim blocks |
| `bb788c6` | Oct 17 11:47 | Phase S: ADR 0004 PrismaUserRepository |
| `741fadf` | Oct 17 11:49 | Phase S: seal complete, D14/D15/D16 accepted |
| `e35bc97` | Oct 17 18:59 | Phase 2 Layout: schema.prisma 27 entities, 6 SQL migrations, PrismaUserRepository, auth wired |
| `21b7dce` | Oct 17 19:01 | Phase 2 reconciliation (D12/D13/D17) |
| `2c974a6` | Oct 17 19:41 | Phase 3 Formulary safety: NTI hard-block, combination atomic match, MISMATCH_SUSPECTED |
| `5c7e7ac` | Oct 17 19:41 | Phase 3 reconciliation (D18) |
| `a81efaf` | Oct 17 21:46 | Defects B-10..B-14: tests for db/worker/web, api e2e discovery, zod peerDeps |
| `a4b0836` | Oct 17 22:37 | **"Phase 4": Prescription domain & API layer** |
| `4b9aff0` | Oct 18 12:29 | **"Phase 5": Order/Transaction domain & checkout API** |
| `9f33c62` | Oct 18 19:58 | api jest e2e discovery fixes; ledger B-10..B-14 + L-1..L-4 reconciled |
| `0cf5d6a` | Oct 20 20:03 | prisma strict types, api lint clean, all gates green |

### 4.3 Uncommitted (Oct 21–22) — the current frontier

**A. Cart & Checkout vertical** (planning-"Phase 4", ulw goal G001):
- Domain: `CartService` (20 tests), `CheckoutService` (11 tests) — idempotency-key guards, cart ownership/emptiness checks, per-item FEFO reservation, PaymentIntent port boundary, checkout status machine, confirm flow.
- Contracts: `cart.contract.ts`, `catalog.contract.ts`, `checkout.contract.ts`; Date-type fixes in order/prescription contracts.
- API: `CartModule` (7 endpoints), `CatalogModule` (DB-backed list), `CheckoutModule` (initiate/confirm/status), `InventoryModule` (`INVENTORY_RESERVATION_PORT_TOKEN` → `PrismaInventoryRepository`, FEFO `findEligibleBatches` + advisory-lock reserve per D10).
- Self-review verdict: **PASS (self-review, HIGH confidence)** — external reviewers were unavailable (disconnected providers, documented in `.omo/evidence/.../a1/self-review.md`). Gates: build 8/8, lint 8/8, test 13/13 in one run; all 5 guard greps clean.

**B. Frontend buildout** (`IMPLEMENTATION-PLAN.md` phases 1–4 + most of 5):
- Design tokens (`styles/tokens.ts`), 7 UI primitives, 5 feature components, 4 hooks — see §8.

### 4.4 Roadmap position (planning-doc numbering)

```
Phase 0/1  M→B→L→T→S + Auth scaffold       ✅ committed
Phase 2   Layout (schema/migrations)       ✅ committed
Phase 3   Formulary matching & safety      ✅ committed
Phase 4   Cart & Checkout domain+API       ✅ implemented — UNCOMMITTED
          Frontend buildout (parallel)    ✅ implemented — UNCOMMITTED
Phase 5   Auth persistence + Rx verification   ⬜ NEXT (partially started: PrismaUserRepository wired, /auth endpoints exist, no guards on commerce endpoints)
Phase 6   Cytotoxic / Blood products / Cold-chain handling   ⬜ (cytotoxic domain+API committed; blood/cold-chain not started)
Phase 7   Cold-chain logistics + state licence verification   ⬜
Phase 8   Formulary ingestion (BREAKS SEAL D14/G14)          ⬜ (CSV dataset waiting at repo root)
Phase 9   Ops hardening (idempotency records, audit, observability)   ⬜ partial (IdempotencyRecord in use at checkout)
Phase 10  Launch readiness                ⬜
```

---

## 5. ARCHITECTURE SNAPSHOT

### 5.1 Monorepo (8 packages)

```
apps/
  api/      NestJS 10 REST API — :4000, prefix /api/v1, 10 modules, 31 endpoints
  web/      Next.js 14 App Router — :3000, 3 pages + _not-found, all 'use client'
  worker/   BullMQ — queue config ONLY (names + defaultJobOptions, 2 tests). NO processors.

packages/
  config/         Zod EnvSchema (NODE_ENV incl 'test'), APP_CONSTANTS, parseTtlToSeconds (D13)
  contracts/      Zod API contracts (8 files: auth, cart, catalog, checkout, cytotoxic, health, order, prescription) + domain types (Money, Result, Fingerprint)
  domain/         PURE business logic, framework-agnostic, 41 source files, 99 tests
  db/             Prisma client (lazy proxy), schema.prisma (30 models), PrismaUserRepository
  observability/  Pino logger (redaction), Prometheus metrics, OTel tracing
```

Dependency rule enforced: **zero `@prisma/client` imports in `@gq/domain`**; API talks to domain ports via **Symbol tokens** (`CART_REPOSITORY_TOKEN`, `CHECKOUT_REPOSITORY_TOKEN`, `ORDER_REPOSITORY_TOKEN`, `PRESCRIPTION_REPOSITORY_TOKEN`, `INVENTORY_RESERVATION_PORT_TOKEN`, `USER_REPOSITORY_TOKEN`, …), implemented by `Prisma*Repository` adapters in the API layer (ADR 0004 pattern).

### 5.2 Runtime data flow

```
Next.js web (:3000) --axios apiClient--> NestJS api (:4000/api/v1)
   │ X-Correlation-ID interceptor; { data: { data: T } } unwrap
   ▼
NestJS controller --ZodValidationPipe (per-endpoint)--> domain Service
   ▼                                              (Cart/Checkout/Order/Prescription/Cytotoxic)
PersistencePort (Symbol token) --> Prisma*Repository --> PrismaClient --> PostgreSQL 16 + PostGIS
InventoryReservationPort --> PrismaInventoryRepository (FEFO + advisory locks, 3 retries, D10)
```

- `main.ts`: global prefix `api/v1`, global `HttpExceptionFilter` + `TransformInterceptor`, CORS allows `http://localhost:3000` in dev, port `process.env.PORT ?? 4000`.
- No global ZodValidationPipe (prohibition #7) — pipes are per-endpoint.
- Worker: not in this flow yet — no processors exist.

### 5.3 API surface (complete, from controller decorators)

| Module | Endpoints |
|--------|-----------|
| `auth` | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| `health` | `GET /health` |
| `catalog` | `GET /catalog/items` — DB join Formulation→Molecule→BrandMedicine→Manufacturer→RegulatorySchedule→InventoryBatch (expiry-gated, qty summed) |
| `cart` | `GET /cart/customer/:customerId`, `POST …/items`, `PATCH …/items/:itemId`, `DELETE …/items/:itemId`, `DELETE /cart/customer/:customerId`, `GET …/totals`, `POST …/checkout` (lightweight "cart ready" pre-flight, not the real checkout) |
| `checkout` | `POST /checkout` (initiate: idempotency-key, reserves FEFO stock, creates PaymentIntent), `POST /checkout/confirm` (paymentIntentId → order created, cart cleared), `GET /checkout/:id/status` |
| `orders` | `POST /orders`, `POST /orders/checkout`, `POST /orders/:id/confirm`, `POST /orders/:id/cancel`, `GET /orders/:id`, `GET /orders/customer/:customerId` |
| `prescriptions` | `POST /prescriptions`, `GET /prescriptions/:id/validate`, `POST /prescriptions/:id/verify` |
| `cytotoxic` | `POST /cytotoxic`, `GET /cytotoxic/formulation/:formulationId`, `POST /cytotoxic/validate`, `POST /cytotoxic/:id/handling`, `GET /cytotoxic/:id/verify` |

**Note:** commerce endpoints (catalog/cart/checkout/orders) have **no auth guard** — consistent demo mode; auth enforcement is Phase 5 work.

### 5.4 Domain layer (`@gq/domain`, 99 tests)

| Module | Responsibility |
|--------|----------------|
| `cart/` | Cart aggregate: get/create-per-customer, add/update/remove items, totals, checkout pre-flight. Quantity limits, per-customer singleton. |
| `checkout/` | InitiateCheckout (idempotency-key replay/conflict guards, ownership+emptiness validation, per-item FEFO reserve via InventoryReservationPort, PaymentIntent creation, status machine), ConfirmPayment → Order creation, GetStatus. Errors: CheckoutNotFound, CartNotReady, IdempotencyKeyConflict, StockReservationFailed, CheckoutAlreadyCompleted. |
| `order/` | Order aggregate, status transitions, confirm/cancel, 15 tests |
| `prescription/` | Prescription aggregate + validation/verify, 12 tests |
| `cytotoxic/` | Cytotoxic drug entity + handling/PPE rules (A6 groundwork), 19 tests |
| `inventory/` | ReservationService — FEFO ordering, advisory locks, 3 retries (D10) |
| `matching/` | NtiGuardService (A4 hard-block), CombinationMatcherService (A9 atomic), FormulationFingerprintService (A10 release-type), FormularyCategoryService (A11 MISMATCH_SUSPECTED) |
| `errors/` | InsufficientStock, PrescriptionRequired, NTIBlocked, CombinationSplit, FormulationCollision, ReservationLockTimeout, FormularyCategoryMismatch |
| `ports/` | UserRepository port + NotConfiguredUserRepository (503), FormulationPersistence, InventoryReservation ports |

### 5.5 Data layer

- **`packages/db/prisma/schema.prisma` — 30 models**: User, RefreshToken, Molecule, Formulation, FormulationIngredient, BrandMedicine, GenericMedicine, Manufacturer, RegulatorySchedule, DarkStore, DarkStoreLicense, PharmacistAssignment, InventoryBatch, Customer, Address, Prescription, PrescriptionItem, PharmacistReview, Consultation, Cart, CartItem, Order, OrderItem, Payment, Shipment, StockReservation, Rider, IdempotencyRecord, AuditEvent, CytotoxicDrug.
- **Raw SQL migrations** (`infra/migrations/`): 0001 audit append-only trigger, 0002 PostGIS/citext/pgcrypto/uuid-ossp extensions, 0003 spatial columns (delivery_polygon GEOMETRY, Address.geo GEOGRAPHY), 0004 GiST indexes, 0005 partial unique fingerprint index (schema_version=1), 0006 InventoryBatch quantity check constraint.
- `packages/db/src/client.ts` — lazy PrismaClient proxy (avoids TS7053).
- **L-1 RESOLVED**: `turbo.json` `test`/`test:ci` now have `dependsOn: ["^build"]` (verified this session).
- **⚠️ `db:seed` is a dangling script**: `packages/db/package.json` runs `ts-node prisma/seed.ts`, but **no `seed.ts` exists**. Seeds must remain stubs only (AC-21, no real formulary data).

---

## 6. FRONTEND STATE (`apps/web`)

### 6.1 What exists (all verified in build + code read this session)

**Pages** (`src/app/`, all `'use client'`):
- `/` — hero (value prop + dark-store dispatch note), debounced search (250ms) over name/brand/molecule, filter panel (regulatory all/H/OTC + dosage form with live counts), CategoryGrid shortcuts, catalog grid (1→4 cols responsive), skeleton loading (8 cards), error state with retry, empty state with clear-filters action, result count when filtered, TrustSection.
- `/cart` — optimistic quantity update/remove/clear **with rollback** (`onMutate` snapshot + `onError` restore), toasts on success/error, skeleton list, empty state, out-of-stock badge, Rx/OTC badges, line-item/unit totals, checkout CTA.
- `/checkout` — payment method radios (UPI/card/COD), place-order with `crypto.randomUUID()` idempotency key, initiate→confirm sequence, success screen (order number, payment intent, **FEFO reserved batches with expiry**), double-submit protection (`isPending` disable), inline error + retry, "no real provider charged" boundary note.

**Components** (`src/components/`): `SiteHeader` (sticky, live cart badge via 15s `refetchInterval` totals query, Framer-Motion badge animation, search overlay, location popover, mobile Drawer nav), `ProductCard`, `FilterPanel`, `CategoryGrid`, `TrustSection`, `ui/` (Button, Input, Badge, Card, Skeleton ×4 variants, Modal+Drawer, Toast system built on `sonner`).

**Hooks** (`src/hooks/`): `useCatalogFilters`, `useDebounce`, `useReducedMotion`, `useToast`.

**Foundation**: `styles/tokens.ts` (colors/spacing/radii/shadows/typography/transitions/z-index), `globals.css` (CSS-var dark palette, `:focus-visible` ring, `prefers-reduced-motion` kill-switch, skip-link utility, scrollbar-hide), Tailwind dark mode via `class` strategy, `providers.tsx` (QueryClient staleTime 60s/retry 1, Toaster, theme from `localStorage` → system preference).

**API layer** (`src/lib/`): `api.ts` (axios, baseURL env `NEXT_PUBLIC_API_URL` → `http://localhost:4000/api/v1`, 15s timeout, correlation-ID interceptor, error normalization), `demo.ts` (hardcoded `DEMO_CUSTOMER_ID`/`DEMO_DARK_STORE_ID`/`DEMO_DARK_STORE_NAME='Saket Demo Dark Store'`, view interfaces, `unwrap` for nested envelope).

### 6.2 Frontend gaps (from `IMPLEMENTATION-PLAN.md` acceptance checklist — still open)

| Gap | Notes |
|-----|-------|
| `/orders` page | **API endpoint exists** (`GET /orders/customer/:customerId`) — page not built |
| Prescription upload flow | API exists (`POST /prescriptions`) — no UI |
| Delivery address step at checkout | API model exists (Address) — no endpoint, no UI |
| Manual dark-mode toggle | Dark mode is system/auto only; nothing writes `localStorage.theme` |
| Component tests for UI primitives | Only `api-client.test.ts` (5 tests) exists |
| Pagination/infinite scroll for catalog | Loads all items |
| Error boundaries | None — an unhandled render error blanks the page |
| RSC migration | All pages `'use client'` (documented debt) |
| Orders/account pages per plan §7 | Assessed: backend partially supports |

### 6.3 Stale doc warning
`HANDOFF-FRONTEND.md` (Oct 21) documents the pre-polish state ("no toasts, no search, no dark mode, no optimistic updates") — **all of those have since been implemented**. Treat it as history, not current state.

---

## 7. REGULATORY, GUARDS, DECISIONS

### 7.1 Enforced prohibitions (all re-verified clean this session)

1. NO formulary parsing before final phase — seal intact ✅
2. NO MFA implementation (D12) ✅
3. NO tsconfig path aliases — workspace protocol only ✅
4. NO interface-as-DI-token — Symbol tokens only ✅
5. NO `@prisma/client` in `@gq/domain` ✅
6. NO `z.coerce.boolean` ✅
7. NO global ZodValidationPipe — per-endpoint only ✅
8. NO real formulary data in seeds (AC-21) — moot until a seed exists
9. `any` only at Prisma adapter boundaries with `eslint-disable` header (ADR-0004 pattern) ✅

### 7.2 Decision log D1–D18 (all ACCEPTED; key ones)

D1 pnpm+Turborepo · D2 SHA-256 fingerprint · D3 batch assignment at reservation · D4–D6 UserRepository abstract+Symbol+503 · D7/D12 MFA deferred · D8 per-endpoint Zod pipes · D10 **FEFO + advisory locks (3 retries)** · D11/D14 **formulary sealed; parse = final phase (after Phase 7)** · D13 TTL parsing in config · D15 M→B→L→T→S · D16 PrismaUserRepository class adapter (ADR 0004) · D17 27+2 entities · D18 formulary safety in domain.

### 7.3 Assumptions A1–A15 — **ALL UNREVIEWED**
Owners: Legal Counsel (A1,A3,A12,A14,A15), Pharmacist-in-Charge (A2,A3,A13,A14), Clinical Pharmacologist (A4 ✅implemented,A5,A11), Oncology Pharmacist (A6), Blood Bank Officer (A7), Cold Chain Manager (A8), Formulation Scientist (A9,A10). A4/A9/A10/A11 are implemented in domain code but their clinical sign-off is still pending.

### 7.4 ADRs
0001 monorepo structure · 0002 SHA-256 fingerprint · 0003 cart item batch assignment · 0004 PrismaUserRepository class adapter.

---

## 8. OPEN DEFECTS, GAPS, TECH DEBT (prioritized for planning)

### 8.1 Immediate (blocking / hygiene)

| # | Item | Detail |
|---|------|--------|
| 1 | **Uncommitted work** | 57 paths, ~3 days of verified work; commit per §3.4 slicing |
| 2 | **Stray artifacts** | `eslint` + `There` (empty files), `parchee/` recursive repo copy (incl. node_modules) — delete, do not commit |
| 3 | **`db:seed` dangling** | Script points to nonexistent `prisma/seed.ts`; no data path exists; catalog page is empty without data. Fix in Phase 8 prep or with stub seeds (AC-21) |
| 4 | **No runtime verification of the full stack** | Gates prove compile/test/e2e-boot, but nobody has run docker:up + migrate + api + web and clicked the flow this session. Do it before demoing |

### 8.2 Architecture debts (from G001 self-review + this session)

| # | Item |
|---|------|
| 5 | Concurrent first-add for same customer can race `create()` → Prisma P2002 → 500 (single-customer edge) |
| 6 | Mid-checkout stock failure: reservations expire via TTL (`expiresAt`) — **no synchronous compensation** (Phase-next improvement per D10 note) |
| 7 | CheckoutRecord working state is **in-memory**; `IdempotencyRecord` DB row is the durable truth — restart semantics hold only for tested paths |
| 8 | Commerce endpoints carry **no auth guard** (demo mode); `DEMO_*` IDs hardcoded in web |
| 9 | Worker has **zero processors** — queue names/options only; nothing consumes BullMQ queues |
| 10 | Meilisearch: env vars + README only; **no code** (search is client-side filtering over `GET /catalog/items`) |
| 11 | `MODULE_TYPELESS_PACKAGE_JSON` warning — add `"type": "module"` to root package.json or rename `eslint.config.js` |
| 12 | turbo warning: `no output files found for task @gq/web#test` — adjust `outputs` key |
| 13 | API e2e suite is slow (single health spec ~272s — full AppModule boot); consider slim app or tagged suites |
| 14 | No error boundaries in web; no component tests for new UI primitives |
| 15 | `POST /cart/customer/:id/checkout` vs `POST /checkout` overlap — the former is only a pre-flight; document or drop to avoid confusion |

### 8.3 Feature gaps for the product to be "real"

| # | Item | Depends on |
|---|------|-----------|
| 16 | `/orders` history page (API ready) | frontend only |
| 17 | Prescription upload UI + storage (S3/MinIO configured in env; `FEATURE_PRESCRIPTION_OCR=true`) | OCR provider (Phase 5+) |
| 18 | Address selection at checkout | new API endpoints (model exists) |
| 19 | Payment provider adapter (Razorpay/Cashfree — env keys exist, `PAYMENT_PROVIDER=not-configured`) | Phase 5+ |
| 20 | Cold-chain / blood-product handling | Phase 6/7 |
| 21 | Formulary ingestion pipeline (CSV at root is the source) | Phase 8 — breaks seal; needs frozen schema + regulatory review + tested parser |
| 22 | Auth guards + session flow replacing DEMO_* IDs | Phase 5 |

---

## 9. ENVIRONMENT & OPERATIONS

### 9.1 Docker (infra/docker/docker-compose.yml)
`pnpm docker:up` → postgres:16-postgis, redis:7, meilisearch:v1.11, minio. `pnpm docker:down` (with `-v`).

### 9.2 Key env (`.env.example` is complete — 100+ vars)
Core: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`/`SESSION_SECRET` (32+ bytes), Meilisearch, S3/MinIO. All integration providers default `not-configured` (OCR/PAYMENT/SMS/EMAIL/MAPS/TELEMEDICINE/GEOCODING/WHATSAPP) — NotConfiguredProvider boundary until their phases. Feature flags: `FEATURE_PRESCRIPTION_OCR=true`, `FEATURE_COLD_CHAIN=true`, `FEATURE_SCHEDULE_X=true`, `FEATURE_NTI_BLOCK=true`. Business constants: `MAX_CART_ITEMS=50`, `DEFAULT_RESERVATION_EXPIRY_MINUTES=30`, etc.

### 9.3 Commands
```bash
pnpm dev                      # turbo dev (api :4000, web :3000, worker)
pnpm turbo run build lint test   # the three gates
pnpm db:generate / db:migrate / db:seed (BROKEN — no seed.ts) / db:studio
```

---

## 10. VERIFICATION PROCEDURE (for the next session)

```bash
cd /mnt/c/parchee
pnpm turbo run build lint test     # expect 24/24, exit 0
cat docs/formulary/sealed/druglist.raw.txt   # seal intact
grep -rn '@prisma/client' packages/domain/src/   # expect no matches
grep -rn "provide: '" apps/api/src/              # expect no matches
pnpm --filter @gq/api test          # e2e boots full AppModule (all Symbol providers resolve)
# Optional full-stack smoke (never done end-to-end this session):
# pnpm docker:up && pnpm db:migrate && pnpm --filter @gq/api run start:dev &
# pnpm --filter @gq/web dev  → browse localhost:3000, exercise catalog→cart→checkout
```

---

## 11. WHAT THE NEXT PHASE (5) SHOULD TARGET

Per the planning roadmap + current debts, in order:

1. **Commit the tree** (§3.4), delete junk files, then re-run gates.
2. **Runtime smoke test** the docker+migrate+api+web flow; fix what surfaces (likely: no seed data → empty catalog; that's expected until Phase 8, stub-seed it for demos).
3. **Phase 5 proper — Auth persistence + Rx verification**:
   - JWT access (15m) + refresh (7d) flows over `PrismaUserRepository` (already wired); add auth guards to commerce endpoints; replace `DEMO_*` IDs with real customer context on the web side.
   - Prescription verification workflow (pharmacist review states per A2/A13/A14): wire `PharmacistReview` model + `/prescriptions/:id/verify` to real persistence + S3 upload for Rx files.
   - Decide + implement: INR monitoring requirement for anticoagulants (A5).
4. **Hardening from §8.2**: cart-create race (P2002), synchronous reservation compensation or documented TTL acceptance, CheckoutRecord durability, worker processors (first real consumer: reservation-expiry sweeper would pair naturally with the TTL design).
5. **Frontend follow-ups**: `/orders` page, prescription upload UI, address step, dark-mode toggle, component tests.

---

## 12. OWNERSHIP

| Role | Owner |
|------|-------|
| Principal Architect | AI Agent sessions (this thread) |
| Human Reviewer | Required to authorize each phase; external review of the uncommitted vertical is still outstanding (self-review PASS only — reviewer providers were down on Oct 21) |
| Legal Counsel (A1/A3/A12/A14/A15), Pharmacist-in-Charge (A2/A3/A13/A14), Clinical Pharmacologist (A4/A5/A11), Oncology Pharmacist (A6), Blood Bank Officer (A7), Cold Chain Manager (A8), Formulation Scientist (A9/A10), DPO (A15) | All UNREVIEWED — sign-offs pending |

---

*Every gate result and guard grep in this file was re-verified on 2026-10-22 in this session. File-count/test-count claims are counted from the live tree. Historical claims (pre-Oct-22) are sourced from HANDOFF.md, HANDOFF-PLANNING-2026-10-20.md, HANDOFF-FRONTEND.md, and `.omo/evidence/ulw/.../G001-task-complete-phase-4-cart-checkout/` and are labeled as such.*
