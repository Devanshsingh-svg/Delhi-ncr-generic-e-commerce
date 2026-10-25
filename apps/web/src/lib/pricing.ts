import type { CatalogItem } from './demo';

/**
 * Client-side pricing comparison. Recomputed from the two prices actually
 * displayed so the savings claim can never contradict the numbers on screen
 * (the API's savingsPct is used as a cross-check only).
 */
export interface PricingComparison {
  genericPrice: number | null;
  alternativePrice: number | null;
  savingsAmount: number | null;
  savingsPercent: number | null;
  estimated: boolean;
}

export function getPricingComparison(item: CatalogItem): PricingComparison {
  const genericPrice =
    typeof item.mrp === 'number' && Number.isFinite(item.mrp) && item.mrp >= 0 ? item.mrp : null;

  const alternativePrice =
    typeof item.altMrp === 'number' && Number.isFinite(item.altMrp) && item.altMrp > 0
      ? item.altMrp
      : null;

  const comparable = genericPrice !== null && alternativePrice !== null && alternativePrice > genericPrice;

  const savingsAmount = comparable ? Number((alternativePrice - genericPrice).toFixed(2)) : null;

  const savingsPercent = comparable
    ? Math.round(((alternativePrice - genericPrice) / alternativePrice) * 100)
    : null;

  return {
    genericPrice,
    alternativePrice,
    savingsAmount,
    savingsPercent,
    estimated: item.altEstimated,
  };
}

/** ₹ formatting with the Indian digit-grouping convention (₹1,234.5). */
export function formatINR(amount: number | null): string {
  if (amount === null || !Number.isFinite(amount)) {
    return 'Price unavailable';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}
