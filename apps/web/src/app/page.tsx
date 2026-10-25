'use client';

import { useQuery } from '@tanstack/react-query';
import { Bike, Search, X, Filter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { CategoryGrid } from '@/components/CategoryGrid';
import { FilterPanel } from '@/components/FilterPanel';
import { ProductCard } from '@/components/ProductCard';
import { SeasonalSurgeBanner, surgeTypeForMonth } from '@/components/SeasonalSurgeBanner';
import { TrustSection } from '@/components/TrustSection';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useCatalogFilters, CatalogFilters } from '@/hooks/useCatalogFilters';
import { useDebounce } from '@/hooks/useDebounce';

import { apiClient } from '../lib/api';
import { CatalogItem, DEMO_DARK_STORE_NAME, unwrap } from '../lib/demo';

export default function HomePage() {
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 250);
  const [filters, setFilters] = useState<Omit<CatalogFilters, 'search'>>({
    regulatory: 'all',
    dosageForm: '',
  });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Category tiles navigate with ?form=<token>; apply it once on mount
  // (read from window.location so the page keeps prerendering statically —
  // useSearchParams would force the whole page into a client-side Suspense bailout).
  useEffect(() => {
    const form = new URLSearchParams(window.location.search).get('form') ?? '';
    setFilters((prev) => (form && prev.dosageForm !== form ? { ...prev, dosageForm: form } : prev));
  }, []);

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['catalog'],
    queryFn: async () => unwrap<CatalogItem[]>(await apiClient.get('/catalog/items')),
  });

  const searching = search.trim().length > 0;
  // Default view: top sellers only. Searching looks across the full catalog.
  const baseItems = useMemo(
    () => (items && !searching ? items.filter((item) => item.isTopSeller) : items),
    [items, searching],
  );
  const filteredItems = useCatalogFilters(baseItems, { ...filters, search });

  const hasActiveFilters = filters.regulatory !== 'all' || filters.dosageForm !== '';
  const filterCount = (filters.regulatory !== 'all' ? 1 : 0) + (filters.dosageForm !== '' ? 1 : 0);

  const handleRegulatoryChange = (value: 'all' | 'H' | 'OTC') => {
    setFilters((prev) => ({ ...prev, regulatory: value }));
  };

  const handleDosageFormChange = (value: string) => {
    setFilters((prev) => ({ ...prev, dosageForm: value }));
  };

  const handleClearFilters = () => {
    setFilters({ regulatory: 'all', dosageForm: '' });
    setSearchInput('');
  };

  const surgeType = useMemo(() => surgeTypeForMonth(), []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <section className="relative isolate overflow-hidden rounded-2xl border border-delhi-marigold/20 bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-8 dark:border-delhi-marigold/15 dark:from-[#241b12] dark:via-[#2b1c14] dark:to-[#1f1712]">
        {/* Jali lattice wash */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #FAF7F2 0 1px, transparent 1px 10px), repeating-linear-gradient(-45deg, #FAF7F2 0 1px, transparent 1px 10px)',
          }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-delhi-paper md:text-3xl">
              Medicines delivered in <span className="text-delhi-brick dark:text-delhi-marigold">under 60 minutes</span>
            </h1>
            <p className="font-display mt-1 text-base font-semibold text-delhi-brick dark:text-delhi-marigold/90" lang="hi">
              दवाइयाँ, समझदारी से — 60 मिनट में आपके दरवाज़े
            </p>
            <p className="mt-2 max-w-xl text-neutral-600 dark:text-neutral-400">
              Order prescription &amp; OTC medicines from licensed pharmacies across Delhi, Gurugram &amp; Noida.
              Real-time stock. Licensed pharmacists. No minimum order.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 text-3xl shadow-sm dark:bg-delhi-elevated/80" aria-hidden="true">
              💊
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-delhi-green/30 bg-delhi-green/10 px-3 py-2 text-sm font-semibold text-delhi-green">
              <Bike className="h-4 w-4" aria-hidden="true" />
              Green CNG delivery · under 60 min
            </span>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Dispatching from <span className="font-semibold text-delhi-brick dark:text-delhi-marigold">{DEMO_DARK_STORE_NAME}</span>
            </span>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <SeasonalSurgeBanner type={surgeType} />
      </section>

      <section className="mt-8" aria-label="Search and filters">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search medicines, brands, or molecules..."
            className="w-full pl-12 pr-12 py-3 text-base bg-white dark:bg-neutral-800 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-neutral-400"
            aria-label="Search medicines"
            autoComplete="off"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFilterPanelOpen((prev) => !prev)}
          className="mt-3 flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-expanded={filterPanelOpen}
          aria-controls="catalog-filters"
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filters
          {filterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-bold text-white">
              {filterCount}
            </span>
          )}
        </button>

        <FilterPanel
          isOpen={filterPanelOpen}
          onClose={() => setFilterPanelOpen(false)}
          filters={filters}
          onRegulatoryChange={handleRegulatoryChange}
          onDosageFormChange={handleDosageFormChange}
          onClear={handleClearFilters}
          items={items}
          hasActiveFilters={hasActiveFilters}
        />
      </section>

      <section className="mt-8">
        <CategoryGrid />
      </section>

      <section className="mt-8" aria-labelledby="catalog-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="catalog-heading" className="font-display text-xl font-bold text-neutral-900 dark:text-delhi-paper">
            {searching ? 'Search results' : 'Top sellers'}
          </h2>
          {(hasActiveFilters || search) && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {filteredItems.length} of {baseItems?.length ?? 0} results
            </span>
          )}
        </div>
        {!searching && !isLoading && !error && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-2 mb-4">
            Showing the most-demanded medicines in Delhi NCR. Use search to find all {items?.length ?? 0} medicines.
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-6 text-center">
            <p className="text-red-600 dark:text-red-400">Failed to load catalog: {(error as Error).message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-medium text-primary-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-12 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <span className="text-3xl" aria-hidden="true">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
              {search ? 'No medicines found' : 'No medicines available'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-md mx-auto">
              {search
                ? `No results for "${search}". Try adjusting your search or filters.`
                : 'The catalog is currently empty. Please check back later.'}
            </p>
            {(search || hasActiveFilters) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm font-medium text-primary-600 hover:underline"
              >
                Clear search and filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <ProductCard key={item.formulationId} item={item} />
            ))}
          </div>
        )}
      </section>

      <TrustSection />
    </div>
  );
}