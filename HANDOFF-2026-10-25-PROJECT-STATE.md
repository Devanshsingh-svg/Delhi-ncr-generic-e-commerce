# GenericQuick NCR — Comprehensive Project Handoff (2026-10-25)

**Project:** Hyperlocal, prescription-aware medicine e-commerce for Delhi NCR
**Repo:** `C:\Parchee` (WSL path `/mnt/c/parchee`) — pnpm 9 + Turborepo, Node 22 (nvm, WSL), TypeScript 5.9.2
**GitHub:** `origin` → https://github.com/Devanshsingh-svg/Delhi-ncr-generic-e-commerce.git (branch `master`, fully pushed)
**Scope of this handoff:** everything that changed on **2026-10-24 → 2026-10-25** (two working sessions). Supersedes HANDOFF-2026-10-22 for machine state; that file's product context (phases, regulatory assumptions A1–A15, formulary seal history) still applies where not repeated here.

---

## 1. EXECUTIVE SUMMARY

1. **The catalog is now real.** 2,457 medicines from `Delhi_Combined_Generic_Master.xlsx` were ingested into a live PostgreSQL database; 1,810 `ACTIVE_DISPATCHABLE` rows became **1,731 formulations / 1,287 molecules / 1,810 inventory batches** at the demo dark store. The storefront lists real medicines with prices, savings, and generated artwork.
2. **First migrations in repo history exist now** (`20261024184123_init`, `20261024190227_catalog_pricing_top_sellers`) plus a repeatable seed (`packages/db/prisma/seed.ts`).
3. **Catalog features landed:** top-sellers-by-default (303 surge-flagged items), branded-alternative pricing with "Save N%" chips, full-catalog search, deterministic per-medicine SVG artwork, category `?form=` deep links that actually work.
4. **Six commits pushed:** `403f10b` (cart/checkout vertical + frontend), `3135992` (Tailwind fix), `74b5cf1` (ingestion + migrations), `523559a` (pricing/top-sellers), `a1a4bf4` (card dark mode), `8787542` (medicine artwork).
5. **Three real product bugs were found and fixed by finally *viewing* the frontend:** Tailwind was never compiled (missing `postcss.config.js` — the design system silently never applied in ANY build), category tiles linked to `?form=` that nothing read, and `Card` had no dark-mode variants.
6. **Delhi aesthetic direction proposed, not yet implemented** — 3 design variants in an interactive mockup (see §8). Decision pending from owner.
7. Still open from earlier handoffs: **no auth guards** on cart/checkout/catalog (demo mode), regulatory review A1–A15 outstanding, worker has no processors, API e2e tests still skip 2 DB-dependent cases (they can NOW run — a live DB exists).

---

## 2. MACHINE & RUNTIME STATE (critical — read before touching anything)

### 2.1 The WSL/Windows split

The repo is developed **entirely in WSL Ubuntu**. `node_modules` is Linux-installed; its symlinks are invisible to Windows Node (`existsSync('node_modules/typescript/lib/tsc.js') === false`). Consequences:

- **Windows-side `pnpm`/`turbo`/`tsc`/`eslint` all fail** ("Cannot find module", "'turbo' is not recognized"). A Windows IDE will show phantom "Cannot find module" errors project-wide.
- Use **VS Code "WSL" remote** for editing, or run everything through `wsl.exe -e bash -ic '<cmd>'` (**interactive** shell — `pnpm` comes from nvm which loads only in `.bashrc`; `bash -lc` has no pnpm and turbo dies with "Unable to find package manager binary").
- Reliable gate command: `wsl.exe -e bash -ic 'cd /mnt/c/Parchee && pnpm exec turbo run build'` → 8/8 tasks verified 2026-10-24.
- Do **not** reinstall node_modules from Windows — it breaks the WSL side (and vice versa). Pick one environment.

### 2.2 Database — embedded PostgreSQL, NOT Docker

- **Docker is not installed** on Windows or WSL. Instead, PostgreSQL runs from **zonky embedded binaries** (`~/gq-pg/node_modules/@embedded-postgres/linux-x64/native/bin/`), as the WSL user `dev`, no root required (WSL sudo needs a password).
- Data dir: `~/gq-pgdata` (ext4 — initdb refuses `/mnt/c`). Log: `~/gq-pg.log`. Port 5432, user `postgres`, password = the one inside `apps/api/.env` `DATABASE_URL`. Database: `genericquick`.
- **Start it:** `wsl.exe -e bash -ic '~/gq-pg/node_modules/@embedded-postgres/linux-x64/native/bin/pg_ctl -D ~/gq-pgdata -l ~/gq-pg.log start'`
- **Status:** `…/pg_ctl -D ~/gq-pgdata status`
- It daemonizes and survives across WSL sessions. Redis: **not installed and not needed** — nothing in the API uses it (health controller reports it "not wired yet" by design). No package.json changes were made for the embedded binaries; they live in `~/gq-pg` (outside the repo).

### 2.3 Starting the API (env vars are mandatory)

`apps/api/.env` is NOT auto-loaded. Export everything, with placeholders for unwired services (Meili/S3 unused in code; secrets must be ≥32 chars or env validation fails at boot):

```bash
wsl.exe -e bash -ic 'cd /mnt/c/Parchee/apps/api && set -a && . ./.env && set +a && \
  export MEILISEARCH_URL="http://127.0.0.1:7700" MEILISEARCH_API_KEY="local-dev" \
  S3_ENDPOINT="http://127.0.0.1:9000" S3_ACCESS_KEY="local-dev" S3_SECRET_KEY="local-dev" \
  S3_BUCKET_PRESCRIPTIONS="prescriptions" S3_BUCKET_CERTIFICATES="certificates" \
  JWT_SECRET="local-dev-only-secret-0123456789abcdef" \
  SESSION_SECRET="local-dev-only-session-secret-0123456789abcdef" \
  NODE_ENV=development && node dist/main.js'
```

- Boot takes **2–7 minutes** over the slow `/mnt/c` (9p) filesystem — do not panic before ~4 min.
- Web: `cd apps/web && ./node_modules/.bin/next start` after a successful `next build` (server boot itself took up to ~7 min under IO contention).

### 2.4 Shell/process gotchas learned the hard way

- Long-running WSL servers survive via the harness's background-task mechanism (plain `wsl.exe -e bash -lc '<server>'`); `nohup`/`setsid` detachment from a foreground `wsl.exe` **dies silently with empty logs**.
- **`pkill -f` self-match trap:** if the pattern's literal text appears anywhere in the same compound command (e.g. `pkill -f "next-serve[r]"; … node dist/main.js` — the `dist/main.js` part isn't the problem, but `node dist/main.js` + a pattern like `dist/mai[n]` in one command kills the shell itself, exit 15, empty output). Kill and restart in **separate** calls.
- Next.js builds over 9p: 4–40+ min depending on FS cache warmth. `staticPageGenerationTimeout: 600` is now set in `apps/web/next.config.js` (default 60s SIGTERMs page-data workers mid-build).

---

## 3. DATA INGESTION (the new backbone)

| Item | Value |
|---|---|
| Source file | `Delhi_Combined_Generic_Master.xlsx` (owner-provided; 2,457 rows × 25 cols; sources: PMBI/Jan Aushadhi, Zeelab, Tata 1mg) |
| In-repo data | `packages/db/prisma/data/combined_generic_master.ndjson` (committed) |
| Seed script | `packages/db/prisma/seed.ts` |
| Run it | `wsl.exe -e bash -ic 'export $(grep -E "^DATABASE_URL=" /mnt/c/Parchee/apps/api/.env \| head -1 \| tr -d "\r"); cd /mnt/c/Parchee/packages/db && npx -y tsx prisma/seed.ts'` |
| Result | 1,810 `ACTIVE_DISPATCHABLE` ingested (647 blocked/oncology/zero-MRP skipped per `Retail_Status`) → 1,731 formulations, 1,287 molecules, 1,810 brands+batches, 3 manufacturers, 3 schedules (H, H1, OTC) |

**Semantics baked into the seed:**
- **Clean re-ingest:** wipes catalog tables (FK-safe order) first — the NDJSON is the source of truth. Re-running is safe and complete.
- **Parsing:** dosage form (canonical lowercase: `tablet/capsule/syrup/injection/drops/cream/…`; suspensions→syrup, infusions→injection), route, strength, releaseType (IR/SR/DR/CR), INN from composition or description (case-insensitive form matching; IP/USP/BP and dosage strings stripped).
- **Fingerprint:** domain-compatible — sha256 hex of canonical JSON `{schemaVersion, dosageForm, route, releaseType, ingredients:[…]}` (matches `packages/domain/src/matching/fingerprint.service.ts`).
- **Pricing:** primary MRP/unit-price from `Cheapest_Source` (fallback PMBI). Alternative brand: a *real* second source (Zeelab/Tata 1mg, 16 items) → else curated famous brand (`FAMOUS_BRANDS` map: Dolo 650, Asthalin, Amlopres, Amaryl…) → else unnamed; estimated alternatives are `mrp × 3` (Jan Aushadhi benchmark) and flagged `altEstimated=true`.
- **Top sellers:** `Delhi_Surge_Profile ∈ {Chronic_Refill, Monsoon_Vector, Smog_Surge}` → `isTopSeller` (303 items).
- **Demo facility seeded with the frontend's hardcoded IDs:** customer `…0001`, dark store `…0201` ("Saket Demo Dark Store", license `DS-LIC-0001`) + address + license — cart/checkout work end-to-end.
- NTI flag set for known narrow-therapeutic-index molecules (warfarin, digoxin, …).

---

## 4. COMMITS THIS SESSION (all pushed to GitHub)

| Hash | Content |
|---|---|
| `403f10b` | Cart & Checkout vertical + frontend buildout + design system (90 files, +7,982); eslint.config.js→.mjs; removed stray empty files; gitignored `.omo/`, `.senpi/` |
| `3135992` | **fix:** added missing `postcss.config.js` — Tailwind directives had never compiled in any build |
| `74b5cf1` | Ingestion: first migrations + seed + data + `?form=` param fix |
| `523559a` | Top sellers / pricing / branded-alternative feature (schema+migration, seed, contract, API, web) + `staticPageGenerationTimeout` |
| `a1a4bf4` | Card dark-mode variants |
| `8787542` | Deterministic medicine artwork (MedicineArt) |

GitHub repo was created this session and the **full history** pushed. Remote: single `master`, tracking `origin/master`. Working tree clean except files created after last commit.

---

## 5. VERIFIED GATES (2026-10-24 baseline, re-checkable)

- `pnpm exec turbo run build` → **8/8 tasks** (interactive WSL shell)
- ESLint clean in all 8 workspaces (run **without** `--fix` — workspace lint scripts mutate files)
- Tests: 136 (vitest 133 + jest worker 2 + api e2e 1 passed / 2 skipped-by-design) — **the 2 skipped e2e cases can now run: a live DB exists. Un-skipping is a recommended next step.**
- Benign noise: module-casing warning (`/mnt/c/Parchee` vs `/mnt/c/parchee`, DrvFs artifact); ENOENT for `.next/server/pages/_app.js.nft.json` inside cached web build logs.

---

## 6. BUGS FOUND & FIXED THIS SESSION (audit trail)

1. `node_modules` unusable from Windows (Linux symlinks + `@turbo/linux-64`) — documented, WSL-first workflow adopted.
2. Stale `apps/web/.next` → `File '.next/types/app/cart/page.ts' not found` — fix: delete `.next` and rebuild (recurring whenever routes change).
3. **`postcss.config.js` never existed** → `@tailwind` directives shipped raw; entire design system dead in every build. Fixed + verified (CSS went 2.5 KB raw → 29 KB compiled).
4. Turbo "6 of 8 tasks" red herring — daemon is deprecated and unused by `turbo run` in 2.11.7; the real cause was a hand-rolled pnpm shim. Never shim pnpm for turbo.
5. `?form=syrup` category links went nowhere (homepage never read the param) — fixed with `useSearchParams` + Suspense + `useEffect`.
6. `Card` had no `dark:` variants → white-on-white titles in dark theme.
7. Next build workers SIGTERMed at the 60s `staticPageGenerationTimeout` — raised to 600s.

---

## 7. HONEST LIMITATIONS (do not present these as real data)

- Stock quantity is synthetic (`availableQty: 400` per batch); the dataset has no inventory.
- "Manufacturer" is the cheapest *source* (mostly "PMBI (Jan Aushadhi)") — the dataset has no actual manufacturer names.
- Savings %: 16 items have real two-source prices; the rest are the labeled ×3 estimate. `altEstimated` is exposed in the contract and shown as "(est.)" in the UI.
- No prices in cart/checkout displays yet (catalog only); `OrderItem.unitPrice` exists in schema but isn't wired to BrandMedicine pricing.
- ProductCard page renders 303 inline SVGs — consider pagination/lazy rendering if scrolling feels heavy.
- Hero heading has a white-on-light-green contrast issue (design polish pending — will be moot if the Delhi redesign lands).

---

## 8. DELHI AESTHETIC — DECISION PENDING

Interactive mockup with 3 variants (Dilli Nights / Mughal Morning / Chemist Board) saved at:
`C:\Users\HP\.zcode\v2\visualizations\28d0677a9a746da6272f9bfa037ecab84fdb654d838915bb06a6b6a33f7b1118\delhi-aesthetic-storefront.html`
(variant 1 has a live accent picker + toran toggle). Proposal: palette swap in `tailwind.config.ts`/`tokens.ts`, Baloo 2 + Mukta fonts with bilingual headlines, toran strip + jali pattern + cusped-arch category tiles, Green-CNG delivery chip, seasonal surge banner driven by `Delhi_Surge_Profile`. **Owner has not yet picked a direction.**

---

## 9. NEXT STEPS (priority order)

1. **Un-skip the 2 DB-dependent API e2e tests** — the DB now exists; run migrations + seed first.
2. **Auth guards** on cart/checkout/order endpoints (still demo mode with hardcoded IDs — unchanged from previous handoff, still the biggest real risk).
3. **Delhi redesign** — pick a variant from §8 and implement (frontend handoff has the file map).
4. **Cart/checkout price display** — wire BrandMedicine pricing into OrderItem/cart totals.
5. Real branded MRP ingestion when a source is available (`pickAlternative` in seed.ts consumes it automatically).
6. Wire Redis/BullMQ worker processors or drop the dependency from env validation.
7. Regulatory review A1–A15 (unreviewed since the project started; schedule gating for Schedule H/H1/X is now visible in the data).
8. Hygiene: husky+lint-staged are declared but unwired; `apps/api` has dead `prisma:*` scripts; archive superseded HANDOFF files into `docs/`.

---

## 10. QUICK REFERENCE — current running state at handoff time

| Service | How it's running | Where |
|---|---|---|
| PostgreSQL | embedded binaries, daemonized in WSL | 127.0.0.1:5432 (inside WSL), `~/gq-pgdata` |
| API (`@gq/api`) | background task: `node dist/main.js` with env exports | http://localhost:4000 (health: `/api/v1/health`) |
| Web (`@gq/web`) | background task: `next start` | http://localhost:3000 |
| Catalog API | `GET /api/v1/catalog/items` | 1,731 items with pricing fields |

These are session-bound background processes. After any machine/session restart: start Postgres (§2.2), start API (§2.3), start web (`next start` — only after a successful `next build`).
