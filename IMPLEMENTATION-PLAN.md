# GenericQuick NCR — Implementation Plan

## Repository Audit Summary

| Check | Status | Details |
|-------|--------|---------|
| **Build** | ✅ PASS | `next build` — 4 static pages generated |
| **Lint** | ✅ PASS | ESLint 9 flat config — 0 errors |
| **Tests** | ✅ PASS | Vitest — 5/5 tests pass (api-client) |
| **TypeScript** | ✅ PASS | Included in build |

### Current Architecture
- **Pages**: `/` (Home), `/cart`, `/checkout`
- **Components**: `SiteHeader`, `Providers`
- **State**: TanStack Query v5 (server), React `useState` (local)
- **API**: Axios client with interceptors (correlation ID, error normalization)
- **Demo Mode**: Hardcoded `DEMO_CUSTOMER_ID`, `DEMO_DARK_STORE_ID`
- **Contracts**: `@gq/contracts` workspace package (Zod schemas)

---

## Identified Gaps (from Master Prompt Requirements)

### 1. Homepage (`/`) — High Priority
| Missing | Required by Prompt |
|---------|-------------------|
| Compact hero with value proposition | ✅ |
| Prominent medicine search field | ✅ |
| Category/browsing shortcuts | ✅ |
| Skeleton loaders (not text) | ✅ |
| Trust/service information section | ✅ |
| Improved product cards | ✅ |

### 2. Search & Filtering — High Priority
| Missing | Required by Prompt |
|---------|-------------------|
| Search by name/brand/molecule | ✅ |
| Regulatory filters (Rx/OTC) | ✅ |
| Dosage form filters | ✅ |
| Clear filters action | ✅ |
| Empty results handling | ✅ |
| Debounced input | ✅ |
| Client-side filtering (API has no server search) | ✅ |

### 3. Cart (`/cart`) — Medium Priority
| Missing | Required by Prompt |
|---------|-------------------|
| Optimistic quantity updates | ✅ |
| Toast notifications | ✅ |
| Better empty state | ✅ |
| Subtotal display (backend provides totals) | ✅ |

### 4. Checkout (`/checkout`) — Medium Priority
| Missing | Required by Prompt |
|---------|-------------------|
| Loading overlay (prevent double-submit) | ✅ |
| Better error recovery | ✅ |
| Delivery address selection (if backend supports) | ⚠️ Check API |
| Improved success state | ✅ |

### 5. SiteHeader — High Priority
| Missing | Required by Prompt |
|---------|-------------------|
| Search entry point | ✅ |
| Mobile responsive navigation (hamburger menu) | ✅ |
| Delivery location display | ✅ |
| Better cart badge animation | ✅ |

### 6. Global UX/Visual — High Priority
| Missing | Required by Prompt |
|---------|-------------------|
| Skeleton placeholders (all async screens) | ✅ |
| Toast notification system | ✅ |
| Framer Motion animations | ✅ |
| Visible focus states (`focus-visible`) | ✅ |
| Dark mode support | ✅ |
| `prefers-reduced-motion` respect | ✅ |
| Consistent typography scale | ✅ |
| Touch-friendly controls | ✅ |

### 7. Additional Pages — Assess First
| Page | Backend Support | Action |
|------|-----------------|--------|
| `/orders` (history) | Check API | Implement if supported |
| Prescription upload | Check API | Implement if supported |
| Account/address | Check API | Placeholder if not |

---

## Implementation Phases

### Phase 1: Design Foundation (Week 1)
**Goal**: Establish reusable design system primitives

**Tasks:**
1. Create `src/styles/tokens.ts` — design tokens (colors, spacing, radii, shadows, typography)
2. Create `src/components/ui/` primitives:
   - `Button.tsx` — variants, sizes, loading state, focus-visible
   - `Input.tsx` — search input, form inputs
   - `Badge.tsx` — regulatory (Rx/OTC), stock status
   - `Card.tsx` — product card wrapper
   - `Skeleton.tsx` — shimmer placeholders (card, list, text)
   - `Toast.tsx` / `Toaster.tsx` — notification system
   - `Modal.tsx` / `Drawer.tsx` — mobile nav, confirmations
3. Update `tailwind.config.ts` with full token system
4. Add Framer Motion dependency (verify approval)
5. Add `dark:` mode support to Tailwind config

**Files to Create:**
- `src/styles/tokens.ts`
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Skeleton.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/Toaster.tsx`
- `src/components/ui/Modal.tsx`
- `src/hooks/useToast.ts`
- `src/hooks/useReducedMotion.ts`

**Files to Modify:**
- `tailwind.config.ts`
- `src/app/globals.css`
- `src/app/providers.tsx` (add Toaster)

---

### Phase 2: Homepage & Catalog (Week 1-2)
**Goal**: Premium medicine shopping experience

**Tasks:**
1. Create `ProductCard` component with skeleton variant
2. Create `SearchBar` component with debounce
3. Create `FilterPanel` component (regulatory, dosage form)
4. Create `CategoryGrid` for browsing shortcuts
5. Create `TrustSection` component
6. Refactor `page.tsx` to use new components
7. Implement client-side search/filter over fetched catalog
8. Add skeleton loading states
9. Add empty search results state

**Files to Create:**
- `src/components/ProductCard.tsx`
- `src/components/SearchBar.tsx`
- `src/components/FilterPanel.tsx`
- `src/components/CategoryGrid.tsx`
- `src/components/TrustSection.tsx`
- `src/hooks/useDebounce.ts`
- `src/hooks/useCatalogFilters.ts`

**Files to Modify:**
- `src/app/page.tsx`

---

### Phase 3: Cart & Checkout Polish (Week 2)
**Goal**: Smooth, trustworthy transaction flow

**Tasks:**
1. Add optimistic updates to cart mutations with rollback
2. Integrate toast notifications for cart actions
3. Add loading overlay to checkout submit
4. Prevent duplicate submissions (disable + flag)
5. Improve error states with retry actions
6. Verify checkout idempotency preserved
7. Add delivery address step (if API supports)

**Files to Modify:**
- `src/app/cart/page.tsx`
- `src/app/checkout/page.tsx`
- `src/lib/demo.ts` (add address types if needed)

---

### Phase 4: SiteHeader & Navigation (Week 2)
**Goal**: Professional, accessible header

**Tasks:**
1. Add search entry point (link to homepage with focus)
2. Add mobile hamburger menu with drawer
3. Add delivery location display
4. Animate cart badge count changes
5. Add focus-visible styles
6. Ensure sticky header doesn't obscure content

**Files to Modify:**
- `src/components/SiteHeader.tsx`
- Create `src/components/MobileNavDrawer.tsx`

---

### Phase 5: Accessibility & Responsive Polish (Week 2-3)
**Goal**: Production-ready accessibility and responsiveness

**Tasks:**
1. Audit all interactive elements for `aria-label`
2. Verify heading hierarchy (h1→h2→h3)
3. Add skip link in layout
4. Test at 360px, 390px, 768px, 1024px, 1440px
5. Fix horizontal overflow
6. Verify color contrast ratios
7. Test keyboard navigation
8. Respect `prefers-reduced-motion`
9. Test dark mode

**Files to Modify:**
- `src/app/layout.tsx` (skip link)
- `src/app/globals.css` (focus-visible, reduced-motion)
- All page/components (accessibility attributes)

---

### Phase 6: Testing & Validation (Week 3)
**Goal**: All checks pass, no regressions

**Tasks:**
1. Run TypeScript check (`pnpm --filter @gq/web run build`)
2. Run lint (`pnpm --filter @gq/web run lint`)
3. Run tests (`pnpm --filter @gq/web run test`)
4. Run production build
5. Add component tests for new UI primitives
6. Fix any regressions

---

## Dependencies to Add (Require Approval)

| Package | Purpose | Version |
|---------|---------|---------|
| `framer-motion` | Animations, transitions | ^11.0.0 |
| `sonner` or `react-hot-toast` | Toast notifications | ^1.0.0 / ^2.4.0 |

**Note**: Check if `sonner` or `react-hot-toast` aligns with project preferences. Both are lightweight.

---

## API Contract Verification Needed

Before implementing address/prescription features, verify backend supports:

```bash
# Check if these endpoints exist in API contracts
GET  /customers/{id}/addresses
POST /customers/{id}/addresses
GET  /orders/customer/{id}
POST /prescriptions/upload
GET  /prescriptions/customer/{id}
```

If not in contracts, create placeholder pages only.

---

## File Structure After Implementation

```
apps/web/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Home — refactored
│   ├── providers.tsx         # + Toaster
│   ├── globals.css           # + design tokens, dark mode
│   ├── cart/page.tsx         # + optimistic updates, toasts
│   ├── checkout/page.tsx     # + loading overlay, address
│   └── orders/page.tsx       # NEW — if API supports
├── components/
│   ├── SiteHeader.tsx        # + search, mobile nav, location
│   ├── MobileNavDrawer.tsx   # NEW
│   ├── ProductCard.tsx       # NEW
│   ├── SearchBar.tsx         # NEW
│   FilterPanel.tsx         # NEW
│   ├── CategoryGrid.tsx      # NEW
│   ├── TrustSection.tsx      # NEW
│   └── ui/                   # NEW — design primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── Skeleton.tsx
│       ├── Toast.tsx
│       ├── Toaster.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useDebounce.ts        # NEW
│   ├── useCatalogFilters.ts  # NEW
│   ├── useToast.ts           # NEW
│   └── useReducedMotion.ts   # NEW
├── lib/
│   ├── api.ts                # unchanged
│   └── demo.ts               # + address types if needed
├── styles/
│   └── tokens.ts             # NEW
└── test/
    └── api-client.test.ts    # existing
```

---

## Acceptance Criteria Checklist

- [ ] Homepage: hero, search, categories, catalog, trust section
- [ ] Search: works, debounced, filters (regulatory, dosage), clear, empty state
- [ ] Product cards: skeleton, Rx/OTC badge, stock, add-to-cart
- [ ] Cart: optimistic qty, toasts, remove, clear, subtotal, checkout link
- [ ] Checkout: loading overlay, no double-submit, error recovery, success
- [ ] Header: search link, mobile drawer, location, animated badge
- [ ] Skeletons: all async screens (home, cart, checkout)
- [ ] Toasts: add/remove/cart, checkout success/error
- [ ] Animations: Framer Motion page enter, stagger, press, badge
- [ ] Focus-visible: all interactive elements
- [ ] Dark mode: toggle, persists, system preference
- [ ] Reduced motion: respected
- [ ] Mobile: 360px, 390px, 768px, 1024px, 1440px tested
- [ ] Build: passes
- [ ] Lint: passes
- [ ] Tests: pass (including new component tests)
- [ ] No console errors
- [ ] Existing functionality intact

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| New deps break build | Add one at a time, run build after each |
| Optimistic updates cause bugs | Implement with full rollback, test offline |
| API doesn't support address/prescription | Create placeholders only, don't fake functionality |
| Dark mode breaks existing styles | Use `dark:` variants only, test both modes |
| Framer Motion adds bundle size | Use `lazy` imports, tree-shake |
| Mobile nav accessibility | Test with screen reader, keyboard |

---

## Next Steps

1. **Get approval** for `framer-motion` and toast library
2. **Start Phase 1** — create design tokens and UI primitives
3. **Run build/lint/test** after each phase to catch regressions early