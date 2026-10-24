'use client';

import { useMemo } from 'react';

import { CatalogItem } from '../lib/demo';

export interface CatalogFilters {
  search: string;
  regulatory: 'all' | 'H' | 'OTC';
  dosageForm: string;
}

export function useCatalogFilters(
  items: CatalogItem[] | undefined,
  filters: CatalogFilters
): CatalogItem[] {
  return useMemo(() => {
    if (!items) return [];

    let filtered = items;

    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.brandName.toLowerCase().includes(searchLower) ||
          item.moleculeInn.toLowerCase().includes(searchLower) ||
          item.manufacturerName.toLowerCase().includes(searchLower)
      );
    }

    if (filters.regulatory !== 'all') {
      filtered = filtered.filter((item) => item.regulatoryCode === filters.regulatory);
    }

    if (filters.dosageForm) {
      filtered = filtered.filter((item) => item.dosageForm === filters.dosageForm);
    }

    return filtered;
  }, [items, filters.search, filters.regulatory, filters.dosageForm]);
}

export function useUniqueDosageForms(items: CatalogItem[] | undefined): string[] {
  return useMemo(() => {
    if (!items) return [];
    const forms = new Set(items.map((item) => item.dosageForm));
    return Array.from(forms).sort();
  }, [items]);
}