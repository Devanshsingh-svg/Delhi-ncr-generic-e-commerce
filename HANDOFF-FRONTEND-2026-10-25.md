# GenericQuick NCR — Frontend Handoff (2026-10-25)

**App:** `apps/web` — Next.js 14.2.35, App Router, React 18, TypeScript, Tailwind 3.4, TanStack Query 5, axios, framer-motion, sonner, lucide-react
**Routes:** `/` (catalog: top sellers + search), `/cart`, `/checkout` — all static-prerendered, data fetched client-side
**Companion doc:** `HANDOFF-2026-10-25-PROJECT-STATE.md` (machine state, DB, ingestion, commits). This file is frontend-only.
**Status:** all work pushed through commit `8787542`. Working tree should be clean.

---

## 1. WHAT CHANGED THIS SESSION (frontend)

| Change | Files | Notes |
|---|---|---|
| **Tailwind actually compiles now** | `postcss.config.js` (NEW) | It never existed — `@tailwind` directives shipped raw to the browser and the design system was dead in every build since the project started. If styles ever look unstyled again, check this file first. |
| Category deep links work | `src/app/page.tsx` | Category tiles link `?form=syrup` etc.; the homepage previously never read the param. Now: `useSearchParams` + `Suspense` wrapper (required by Next 14 for static prerender) + `useEffect` syncing `formParam` → `filters.dosageForm`. |
| Top sellers by default | `src/app/page.tsx` | Default grid filters to `isTopSeller` items (303 of 1,731). Heading says "Top sellers" with a hint line; heading becomes "Search results" while searching. |
| **Search spans the full catalog** | `src/app/page.tsx` | `baseItems = searching ? items : items.filter(isTopSeller)` — the search box looks across all 1,731 medicines (brand/molecule/manufacturer), filters still apply on top. |
| Price + branded alternative on cards | `src/components/ProductCard.tsx` | Generic MRP bold + brand MRP struck-through beside it + green chip "Save N% vs \<brand\> (est.) · MRP ₹X". Fields come from the API: `mrp`, `altBrandName`, `altMrp`, `altEstimated`, `savingsPct`. |
| Deterministic medicine artwork | `src/components/MedicineArt.tsx` (NEW) | Inline SVG per card. Glyph follows `dosageForm` (tablet/capsule/syrup/injection/drops/cream/inhaler/flask); palette hue = hash of `moleculeInn + dosageForm` — same medicine always renders the same image, zero stored assets, covers all 1,731 items. |
| Dark-mode cards fixed | `src/components/ui/Card.tsx` | Variants now include `dark:bg-neutral-900 dark:border-neutral-700`; before, cards were white with `dark:text-neutral-50` titles (white-on-white). |
| Slow-FS build fix | `next.config.js` | `staticPageGenerationTimeout: 600` — page-data collection over `/mnt/c` (WSL 9p) exceeded the 60s default and SIGTERMed build workers. **Do not remove while building over `/mnt/c`.** |
| ESLint config rename | `eslint.config.mjs` (root) | Was `.js` — silences `MODULE_TYPELESS_PACKAGE_JSON`. Flat config, non-type-aware, root-only. |

---

## 2. ARCHITECTURE & DATA FLOW

```
page.tsx (HomePageContent, 'use client')
  useQuery(['catalog']) → apiClient.get('/catalog/items')        ← full 1,731-item list
  baseItems   = searching ? items : items.filter(isTopSeller)
  useCatalogFilters(baseItems, { search, regulatory, dosageForm })
      → search: brandName/moleculeInn/manufacturerName includes()
      → regulatory: item.regulatoryCode === 'H' | 'OTC'
      → dosageForm: exact string match (tokens: tablet, capsule, syrup,
        injection, drops, cream, ointment, gel, lotion, inhaler, spray,
        sachet, powder, solution, suppository, other)
  <ProductCard item> → MedicineArt + Badge(Rx/OTC) + price/save chip + addToCart mutation
```

- **API client:** `src/lib/api.ts` — axios instance, `baseURL = NEXT_PUBLIC_API_URL ?? http://localhost:4000/api/v1`, correlation-ID interceptor, `unwrap()` helper in `src/lib/demo.ts` unwraps the `{success, data}` envelope.
- **Query keys in use:** `['catalog']`, `['cart']` (+ totals). Cart mutations invalidate `['cart']`.
- **Demo identity (hardcoded, no auth):** `DEMO_CUSTOMER_ID = 00000000-0000-4000-8000-000000000001`, `DEMO_DARK_STORE_ID/NAME` in `src/lib/demo.ts` — these match rows seeded in the DB; do not change one side without the other.
- **Contract source of truth:** `packages/contracts/src/api/catalog.contract.ts` (`CatalogItemResponseSchema`) — zod parses every item server-side; the web `CatalogItem` interface in `src/lib/demo.ts` mirrors it manually (keep them in sync).

### CatalogItem shape (as of this handoff)

```
formulationId, brandName, moleculeInn, dosageForm, strength, releaseType,
manufacturerName, regulatoryCode, regulatoryLabel, availableQty,
isTopSeller, mrp (nullable), altBrandName (nullable), altMrp (nullable),
altEstimated, savingsPct (nullable)
```

---

## 3. DESIGN SYSTEM STATE

- **Tokens:** `src/styles/tokens.ts` + `tailwind.config.ts` — primary = green scale (emerald-ish), `darkMode: 'class'`, content globs `./src/**/*.{js,ts,jsx,tsx,mdx}`.
- **UI kit:** `src/components/ui/` — Badge (prescription/otc/error/success variants), Button, Card (default/bordered/elevated), Input, Modal, Skeleton (ProductCardSkeleton), Toast (+ `useToast` hook, sonner-based).
- **Feature components:** CategoryGrid (6 category tiles, `?form=` links), FilterPanel, ProductCard, SiteHeader, TrustSection.
- **Hooks:** `useCatalogFilters` + `useUniqueDosageForms`, `useDebounce` (250ms), `useReducedMotion`.
- **Fonts:** system stack today. The Delhi proposal (below) would introduce Baloo 2 + Mukta via `next/font` in `src/app/layout.tsx`.

---

## 4. DELHI AESTHETIC — PROPOSED, AWAITING DECISION

Interactive mockup with 3 complete variants (owner can flip between them):
`C:\Users\HP\.zcode\v2\visualizations\28d0677a9a746da6272f9bfa037ecab84fdb654d838915bb06a6b6a33f7b1118\delhi-aesthetic-storefront.html`
(gitignored location — copy into `docs/design/` if it should live in the repo)

1. **Dilli Nights** — dark, warm near-black; terracotta accent (owner-tunable via picker in the mockup); marigold savings; toran (marigold-garland) strip on hero; jali lattice pattern; skyline line-art (India Gate/Qutub/dome); bilingual headline "दवाइयाँ — 60 मिनट में आपके दरवाज़े".
2. **Mughal Morning** — warm paper background, deep red + blue-pottery indigo, light theme.
3. **Chemist Board** — street chemist signboard: white board, thick borders, red/green, hard shadows.

Implementation map when a direction is chosen:
- `tailwind.config.ts` + `src/styles/tokens.ts` — palette (terracotta/marigold/indigo scales; marigold already semantically matches the Save chips)
- `src/app/layout.tsx` — `next/font` Baloo 2 (display, Devanagari) + Mukta (body, Devanagari)
- `page.tsx` — bilingual headline, surge banner (drive from `Delhi_Surge_Profile` via API — needs a small API addition), Green-CNG delivery chip replacing the 🚚 emoji
- `CategoryGrid.tsx` — cusped-arch tile tops (rounded arch + finial dot)
- New: `Toran.tsx`, `Jali.tsx` (decorative SVG, aria-hidden)
- ProductCard/Card — restyle per variant (Chemist Board = thick borders + hard shadows)

---

## 5. BUILD / RUN / VERIFY (WSL — see project handoff §2 for why)

```bash
# build (4–40+ min over /mnt/c; staticPageGenerationTimeout now 600s)
wsl.exe -e bash -ic 'cd /mnt/c/Parchee/apps/web && ./node_modules/.bin/next build'
# serve
wsl.exe -e bash -ic 'cd /mnt/c/Parchee/apps/web && ./node_modules/.bin/next start'
# lint WITHOUT --fix (the package script mutates files)
wsl.exe -e bash -ic 'cd /mnt/c/Parchee/apps/web && ../../node_modules/.bin/eslint "src/**/*.ts" "src/**/*.tsx"'
# unit tests
wsl.exe -e bash -ic 'cd /mnt/c/Parchee/apps/web && ./node_modules/.bin/vitest run'
```

Kill a running server from a **separate** call: `pkill -f "next-serve[r]"` (never combine kill+start in one command — self-match kills the shell, exit 15, empty logs).

---

## 6. KNOWN ISSUES / TODO (frontend)

1. **Hero contrast** — white heading text on the light-green hero card (page.tsx hero gradient + `text-neutral-900` mix). Will be redesigned by the Delhi work; fix immediately if the redesign slips.
2. **Grid weight** — 303 inline-SVG cards render at once; if scrolling feels heavy, paginate or virtualize (react-virtual) and/or lazy-mount MedicineArt below the fold.
3. **Category coverage** — tile links filter one token (`?form=cream` misses `ointment`/`gel` items; `?form=drops` misses none since all drops merge). Either merge forms in the seed (`ointment/gel → cream`) or make CategoryGrid filter on a form *group*.
4. **Cart/checkout** — no images and no prices on cart lines yet; `MedicineArt` is reusable there (it takes a `CatalogItem`-shaped object — cart lines only have `formulationId`; either join catalog data or extend the cart API response).
5. **Error/empty states** — catalog error shows "Failed to load catalog" with retry; empty search shows the 🔍 panel. No skeleton for the top-seller hint line.
6. **`useUniqueDosageForms`** — the FilterPanel dropdown derives from loaded items; with top-sellers default, the dropdown lists fewer forms until a search loads the full catalog. Decide desired behavior.
7. **No pagination** — API returns everything in one response (~800 KB JSON). Fine for demo; add `?limit/cursor` before production.
8. Older `HANDOFF-FRONTEND.md` was removed from the working tree on 2026-10-25 (recoverable via `git show 403f10b:HANDOFF-FRONTEND.md`).
