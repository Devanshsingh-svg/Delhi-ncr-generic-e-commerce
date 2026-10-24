# GenericQuick NCR — Frontend Handoff Document

**Project:** Hyperlocal medicine e-commerce for Delhi NCR (Delhi, Gurugram, Noida)
**Repo:** `/mnt/c/parchee/apps/web` (Next.js 14 App Router, TypeScript, Tailwind CSS)
**Stack:** React 18, @tanstack/react-query v5, Axios, Lucide React, Zod
**Package Manager:** pnpm (workspace protocol `@gq/*`)

---

## 1. CURRENT ARCHITECTURE & COMPONENTS

### 1.1 Page Structure (App Router)

```
apps/web/src/app/
├── layout.tsx          # Root layout: Providers + SiteHeader
├── page.tsx            # Home — Catalog grid with Add to Cart
├── providers.tsx       # TanStack Query ClientProvider
├── globals.css         # Tailwind imports + CSS custom properties
├── cart/
│   └── page.tsx        # Cart — quantity controls, remove, clear, checkout link
└── checkout/
    └── page.tsx        # Checkout — payment method select, place order, success state
```

### 1.2 Component Inventory

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `SiteHeader` | `src/components/SiteHeader.tsx` | Sticky header with logo, nav links, cart badge (live count via query) |
| `Providers` | `src/app/providers.tsx` | QueryClientProvider with sensible defaults (staleTime: 60s, retry: 1) |

### 1.3 Data Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Components │────▶│  @tanstack/react- │────▶│   apiClient     │
│  (pages)    │     │  query (hooks)    │     │   (axios)       │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │  API Gateway    │
                                            │  (localhost:4000│
                                            │   /api/v1)      │
                                            └─────────────────┘
```

- **Server Components**: None currently — all pages are `'use client'`
- **Data Fetching**: TanStack Query (`useQuery`, `useMutation`) with `queryKey` invalidation
- **API Layer**: Axios instance with interceptors (correlation ID, error normalization)
- **Demo Mode**: Hardcoded `DEMO_CUSTOMER_ID`, `DEMO_DARK_STORE_ID` in `src/lib/demo.ts`

---

## 2. API INTEGRATION PATTERNS

### 2.1 Axios Client (`src/lib/api.ts`)

```typescript
// Base config
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
export const apiClient = create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15_000,
});

// Request interceptor: adds X-Correlation-ID
apiClient.interceptors.request.use(config => {
  config.headers['X-Correlation-ID'] = crypto.randomUUID();
  return config;
});

// Response interceptor: unwraps { data: { data: T } } → T, normalizes errors
apiClient.interceptors.response.use(
  response => response.data,
  error => Promise.reject(new Error(error.response?.data?.message || error.message))
);
```

### 2.2 Demo Helpers (`src/lib/demo.ts`)

```typescript
// Hardcoded demo identifiers
export const DEMO_CUSTOMER_ID = '00000000-0000-4000-8000-000000000001';
export const DEMO_DARK_STORE_ID = '00000000-0000-4000-8000-000000000201';
export const DEMO_DARK_STORE_NAME = 'Saket Demo Dark Store';

// Types mirror API contracts
export interface CatalogItem { ... }
export interface CartView { ... }
export interface CartTotalsView { ... }
export interface ReservationView { ... }
export interface CheckoutResultView { ... }

// Response unwrapper: handles nested { data: { data: T } } from API
export function unwrap<T>(res: unknown): T { ... }

// Query functions
export async function fetchCatalog(): Promise<CatalogItem[]> { ... }
export async function fetchCart(): Promise<CartView | null> { ... }
export async function fetchTotals(): Promise<CartTotalsView> { ... }
```

### 2.3 Mutation Patterns (from pages)

```typescript
// Add to cart (Home page)
const addToCart = useMutation({
  mutationFn: (formulationId: string) =>
    unwrap(await apiClient.post(`/cart/customer/${DEMO_CUSTOMER_ID}/items`, {
      formulationId,
      quantity: 1,
    })),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
});

// Update quantity (Cart page)
const updateQty = useMutation({
  mutationFn: ({ itemId, quantity }) =>
    unwrap(await apiClient.patch(`/cart/customer/${DEMO_CUSTOMER_ID}/items/${itemId}`, { quantity })),
  onSuccess: invalidate,
});

// Place order (Checkout page)
const placeOrder = useMutation({
  mutationFn: async () => {
    const idempotencyKey = crypto.randomUUID();
    const initiate = unwrap(await apiClient.post('/checkout', {
      customerId: DEMO_CUSTOMER_ID,
      cartId,
      darkStoreId: DEMO_DARK_STORE_ID,
      paymentMethod,
      idempotencyKey,
    }));
    const confirm = unwrap(await apiClient.post('/checkout/confirm', {
      checkoutId: idempotencyKey,
      paymentIntentId: initiate.paymentIntentId,
    }));
    return { initiate, confirm };
  },
  onSuccess: ({ initiate, confirm }) => {
    setResult({ ... }); // Shows success UI
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  },
});
```

### 2.4 API Endpoints Used

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/catalog/items` | List all formulations with stock |
| `GET` | `/cart/customer/:id` | Get cart with items |
| `GET` | `/cart/customer/:id/totals` | Get item count for header badge |
| `POST` | `/cart/customer/:id/items` | Add item to cart |
| `PATCH` | `/cart/customer/:id/items/:itemId` | Update item quantity |
| `DELETE` | `/cart/customer/:id/items/:itemId` | Remove item |
| `DELETE` | `/cart/customer/:id` | Clear cart |
| `POST` | `/checkout` | Initiate checkout (reserves stock) |
| `POST` | `/checkout/confirm` | Confirm payment, create order |

---

## 3. STYLING SYSTEM & DESIGN TOKENS

### 3.1 Tailwind Config (`tailwind.config.ts`)

```typescript
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',  // Primary brand — buttons, active states
          700: '#15803d',  // Hover
        }
      }
    }
  },
  plugins: [],
};
```

### 3.2 CSS Custom Properties (`globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 17, 24, 39;       /* gray-900 */
  --background-start-rgb: 249, 250, 251;  /* gray-50 */
  --background-end-rgb: 255, 255, 255;    /* white */
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(to bottom, transparent, rgb(var(--background-end-rgb))) rgb(var(--background-start-rgb));
}
```

### 3.3 Visual Language (Current)

| Element | Style |
|---------|-------|
| **Background** | `bg-gray-50` page, `bg-white` cards |
| **Primary Actions** | `bg-primary-600` / `hover:bg-primary-700` / `text-white` |
| **Secondary Text** | `text-gray-500` / `text-gray-600` |
| **Headings** | `text-gray-900` `font-bold` |
| **Borders** | `border-gray-200` (cards), `border-gray-300` (inputs) |
| **Radius** | `rounded-xl` (cards), `rounded-lg` (buttons), `rounded-md` (icon buttons) |
| **Shadows** | None currently — flat design |
| **Spacing** | `p-4`/`p-5` cards, `gap-4` grids, `mt-6` section gaps |
| **Typography** | System font stack (`antialiased`), `text-sm` base, `text-xl` headings |
| **Icons** | Lucide React, `h-4 w-4` / `h-5 w-5`, `aria-hidden` |

### 3.4 Regulatory Badges (Domain-Specific)

```tsx
// Schedule H (Rx)
<span className="whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
  Rx · Schedule H
</span>

// OTC
<span className="whitespace-nowrap rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
  OTC
</span>
```

### 3.5 Stock Status Indicator

```tsx
<span className="flex items-center gap-1 text-xs text-gray-500">
  <Package className="h-3.5 w-3.5" aria-hidden />
  {item.availableQty > 0 ? `${item.availableQty} in stock` : 'Out of stock'}
</span>
```

---

## 4. STATE MANAGEMENT & DATA FETCHING

### 4.1 TanStack Query Configuration

```typescript
// providers.tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,    // 1 minute — data considered fresh
      retry: 1,             // Single retry on failure
    },
    mutations: {
      retry: 0,             // No retry on mutations
    },
  },
});
```

### 4.2 Query Keys Convention

| Resource | Query Key | Invalidation Trigger |
|----------|-----------|---------------------|
| Catalog | `['catalog']` | — (static-ish) |
| Cart Items | `['cart', 'items']` | Any cart mutation |
| Cart Totals | `['cart', 'totals']` | Any cart mutation (refetchInterval: 15s) |

### 4.3 Client-Side State

| Page | State | Type |
|------|-------|------|
| Checkout | `paymentMethod` | `useState<'upi' \| 'card' \| 'cod'>` |
| Checkout | `result` (success) | `useState<CheckoutSuccess \| null>` |
| All | Loading/Error | Derived from `useQuery`/`useMutation` |

### 4.4 Optimistic Updates

**Not implemented yet** — all mutations invalidate and refetch. Opportunities:
- Cart quantity: optimistic increment/decrement with rollback on error
- Add to cart: immediate UI feedback before server response

---

## 5. TESTING SETUP & PATTERNS

### 5.1 Test Configuration

```json
// package.json
"test": "vitest run",
"test:watch": "vitest",
"test:ci": "vitest run --reporter=default --reporter=junit"
```

```typescript
// vitest.config.ts (implied — check repo root)
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'jsdom' } });
```

### 5.2 Existing Tests (`apps/web/test/api-client.test.ts`)

```typescript
// Tests axios client configuration
import { apiClient } from '../src/lib/api';

describe('apiClient', () => {
  it('has correct baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://localhost:4000/api/v1');
  });
  it('has withCredentials enabled', () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });
  it('has 15s timeout', () => {
    expect(apiClient.defaults.timeout).toBe(15000);
  });
  it('adds X-Correlation-ID on request', () => { ... });
  it('normalizes error responses', () => { ... });
});
```

### 5.3 Test Patterns to Follow

- **Unit**: Pure functions (`unwrap`, type guards) — test in isolation
- **Integration**: API client interceptors — mock axios
- **Component**: React Testing Library — test user interactions, not implementation
- **Mock MSW**: Use Mock Service Worker for API mocking (not yet configured)

---

## 6. MISSING / INCOMPLETE FEATURES (Prioritized)

### 6.1 High Impact — UX Polish

| Feature | Description | Effort |
|---------|-------------|--------|
| **Skeleton Loaders** | Replace "Loading…" text with shimmer placeholders for catalog grid, cart list | Low |
| **Optimistic Cart Updates** | Immediate quantity change, rollback on error | Medium |
| **Toast Notifications** | Success/error toasts for add/remove/checkout (no raw alert text) | Medium |
| **Empty States** | Illustrated empty cart, no results, error states with retry | Low |
| **Loading Overlay** | Full-screen spinner for checkout mutation (prevents double-submit) | Low |

### 6.2 High Impact — Functionality

| Feature | Description | Effort |
|---------|-------------|--------|
| **Search & Filter** | Search by brand/molecule, filter by regulatory (Rx/OTC), dosage form | Medium |
| **Pagination/Infinite Scroll** | Catalog currently loads all — paginate or virtualize | Medium |
| **Prescription Upload** | Rx items require prescription — upload flow, status tracking | High |
| **Address Management** | Delivery address selection/entry at checkout | Medium |
| **Order History** | `/orders` page with past orders, reorder button | Medium |

### 6.3 Visual Polish — "Functional Smooth"

| Area | Current | Target |
|------|---------|--------|
| **Transitions** | Basic `transition` on buttons | Framer Motion page transitions, stagger children |
| **Micro-interactions** | None | Button press scale, cart badge bounce, quantity counter animate |
| **Focus States** | Default browser | Visible `focus-visible:ring-2 focus-visible:ring-primary-500` |
| **Dark Mode** | None | `dark:` variants, system preference + toggle |
| **Motion Reduction** | None | Respect `prefers-reduced-motion` |
| **Typography Scale** | Ad-hoc | Consistent scale (display, h1-h3, body, caption) |

---

## 7. PROMPT GENERATION GUIDANCE

### 7.1 For New Feature Implementation

```markdown
## Prompt Template: New Page/Feature

**Context**: GenericQuick NCR — hyperlocal medicine e-commerce (Delhi NCR)
**Stack**: Next.js 14 App Router, React 18, TypeScript, Tailwind, TanStack Query v5, Axios
**Current State**: [Reference specific file/component]

**Task**: Implement [feature name] — [user-facing description]

**Requirements**:
- [ ] Use existing patterns: `useQuery`/`useMutation` from `@tanstack/react-query`
- [ ] API calls via `apiClient` from `../lib/api` (adds correlation ID, unwraps responses)
- [ ] Types from `../lib/demo.ts` or `@gq/contracts` (workspace package)
- [ ] Styling: Tailwind with `primary-600`/`primary-700` for actions, `gray-50`/`white` surfaces
- [ ] Accessibility: semantic HTML, `aria-*` on icon-only buttons, `focus-visible` rings
- [ ] Loading: skeleton placeholders (not text), disabled states on mutations
- [ ] Errors: inline error message, retry action where applicable
- [ ] Tests: vitest + React Testing Library for component; unit for helpers

**Files to Touch**:
- `src/app/[feature]/page.tsx` (new)
- `src/components/[FeatureComponent].tsx` (if reusable)
- `src/lib/demo.ts` (if new types needed)

**Do Not**:
- Add new dependencies without approval
- Use `any` — use `unknown` + type guards
- Create global state — prefer query cache + local state
- Hardcode API URLs — use `apiClient` + env var
```

### 7.2 For Visual Polish / "Make It Smooth"

```markdown
## Prompt Template: Visual Polish Pass

**Context**: Same as above
**Goal**: Make the [page/component] feel "functional smooth" — polished, responsive, trustworthy

**Specific Improvements**:
1. **Motion**: Add Framer Motion (install if needed)
   - Page enter: `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}`
   - Stagger children: `<motion.ul variants={{ staggerChildren: 0.05 }}>`
   - Button press: `whileTap={{ scale: 0.98 }}`
   - Cart badge: `animate={{ scale: [1, 1.2, 1] }}` on count change

2. **Skeletons**: Replace loading text with shimmer
   - Catalog card skeleton: gray rectangles matching content layout
   - Cart item skeleton: same structure as real item

3. **Feedback**: Install `sonner` or `react-hot-toast`
   - Success: "Added to cart" (auto-dismiss 2s)
   - Error: "Could not add — tap to retry" (persistent)

4. **Focus/Accessibility**:
   - All interactive: `focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`
   - Skip link in layout
   - Proper heading hierarchy (h1 → h2 → h3)

5. **Dark Mode** (optional but recommended):
   - Add `dark:` variants to all colors
   - Toggle in header (persist to localStorage)
   - Respect `prefers-color-scheme`

**Files**: Modify existing page/component files only — no new deps without approval
```

### 7.3 For Refactoring / Architecture

```markdown
## Prompt Template: Refactor Data Fetching

**Context**: Same as above
**Pain Point**: [e.g., "Too many queryClient.invalidateQueries calls", "No optimistic updates"]

**Task**: Refactor [specific pattern] to [improved pattern]

**Approach**:
- Use `queryClient.setQueryData` for optimistic updates
- Create custom hooks in `src/hooks/` (e.g., `useCart`, `useCatalog`)
- Centralize query keys in `src/lib/query-keys.ts`
- Add `onMutate`/`onError`/`onSettled` for rollback

**Example — Optimistic Cart Quantity**:
```typescript
const updateQty = useMutation({
  mutationFn: ({ itemId, quantity }) => apiClient.patch(...),
  onMutate: async ({ itemId, quantity }) => {
    await queryClient.cancelQueries({ queryKey: ['cart', 'items'] });
    const previous = queryClient.getQueryData(['cart', 'items']);
    queryClient.setQueryData(['cart', 'items'], old => 
      old.map(item => item.id === itemId ? { ...item, quantity } : item)
    );
    return { previous };
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['cart', 'items'], context.previous);
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
});
```
```

---

## 8. DEVELOPMENT WORKFLOW

### 8.1 Commands

```bash
# From repo root (/mnt/c/parchee)
pnpm --filter @gq/web dev          # Start dev server (localhost:3000)
pnpm --filter @gq/web build        # Production build
pnpm --filter @gq/web lint         # ESLint (flat config, ESLint 9)
pnpm --filter @gq/web test         # Vitest unit/integration
pnpm --filter @gq/web test:watch   # Watch mode

# Full monorepo gates (run before commit)
pnpm turbo run build --force
pnpm turbo run lint
pnpm turbo run test
```

### 8.2 Environment Variables

```bash
# .env.local (create in apps/web/)
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 8.3 TypeScript Config Notes

- `tsconfig.json` extends `tsconfig.base.json` from root
- Path aliases: `@/*` → `./src/*` (via base config)
- Strict mode enabled
- `next` types via `next-env.d.ts`

---

## 9. KNOWN ISSUES & TECH DEBT

| Issue | Location | Severity | Notes |
|-------|----------|----------|-------|
| All pages `'use client'` | `src/app/**/page.tsx` | Medium | No RSC benefits; consider server components for catalog |
| No optimistic updates | Cart, Checkout | Medium | Perceived latency on mutations |
| No toast system | All mutations | Medium | Raw inline error text only |
| No search/filter | Home page | High | Core e-commerce feature missing |
| Hardcoded demo IDs | `src/lib/demo.ts` | Low | Will be replaced by auth context |
| No dark mode | Tailwind config | Low | Easy add — extend config |
| No error boundaries | Layout | Medium | Unhandled errors crash page |
| No analytics/events | — | Low | Add posthog/ga later |

---

## 10. QUICK START FOR NEW DEVELOPER

```bash
# 1. Clone & install
cd /mnt/c/parchee
pnpm install

# 2. Start API (separate terminal)
pnpm --filter @gq/api run start:dev  # localhost:4000

# 3. Start Web
pnpm --filter @gq/web dev            # localhost:3000

# 4. Verify
# - Home: catalog loads, "Add" works
# - Header: cart badge updates
# - Cart: quantity +/-/remove, "Clear cart", "Proceed to checkout"
# - Checkout: select payment, "Place order" → success screen
```

---

## 11. CONTACTS & OWNERSHIP

| Area | Owner |
|------|-------|
| Frontend Architecture | [Your Name] |
| API Contracts | `@gq/contracts` package owner |
| Backend API | `@gq/api` team |
| Domain Logic | `@gq/domain` team |
| Design System | [Design System Owner] |

---

## 12. VERSION HISTORY

| Date | Version | Changes |
|------|---------|---------|
| 2026-10-21 | 1.0 | Initial handoff — current state documented |

---

*This handoff is a living document. Update it when architecture, patterns, or conventions change.*