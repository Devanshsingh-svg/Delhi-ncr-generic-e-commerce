'use client';

import { memo, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { MedicineArt } from '@/components/MedicineArt';

import { apiClient } from '../lib/api';
import { CatalogItem, DEMO_CUSTOMER_ID, unwrap } from '../lib/demo';
import { formatINR, getPricingComparison } from '../lib/pricing';

interface ProductCardProps {
  item: CatalogItem;
  isAdding?: boolean;
  onAdd?: () => void;
}

function regulatoryBadge(code: string): { label: string; className: string } | null {
  if (code === 'OTC') return { label: 'OTC', className: 'border-delhi-green/40 bg-delhi-green/10 text-delhi-green' };
  if (code === 'H') return { label: 'Rx · Schedule H', className: 'border-delhi-marigold/40 bg-delhi-marigold/10 text-delhi-marigold' };
  if (code === 'H1') return { label: 'Rx · Schedule H1', className: 'border-delhi-marigold/40 bg-delhi-marigold/10 text-delhi-marigold' };
  if (code === 'X') return { label: 'Rx · Schedule X', className: 'border-red-500/40 bg-red-500/10 text-red-400' };
  if (code === 'H-CYTO') return { label: 'Rx · Cytotoxic', className: 'border-red-500/40 bg-red-500/10 text-red-400' };
  return { label: code, className: 'border-neutral-500/40 bg-neutral-500/10 text-neutral-300' };
}

function ProductCardComponent({ item, isAdding, onAdd }: ProductCardProps) {
  const queryClient = useQueryClient();

  const addToCart = useMutation({
    mutationFn: async (formulationId: string) =>
      unwrap(await apiClient.post(`/cart/customer/${DEMO_CUSTOMER_ID}/items`, { formulationId, quantity: 1 })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showToast.success({ title: 'Added to cart', description: `${item.brandName} added to your cart` });
      onAdd?.();
    },
    onError: (error) => {
      showToast.error({ title: 'Could not add to cart', description: (error as Error).message });
    },
  });

  const pricing = useMemo(() => getPricingComparison(item), [item]);
  const hasSavings = pricing.savingsPercent !== null && pricing.savingsPercent > 0;
  const isOutOfStock = item.availableQty === 0;
  const isPrescriptionRegulated = item.regulatoryCode !== 'OTC';
  const reg = regulatoryBadge(item.regulatoryCode);

  return (
    <Card variant="bordered" padding="md" className="flex h-full flex-col group hover:border-delhi-brick/60 dark:hover:border-delhi-brick/60">
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl transition-transform duration-200 group-hover:scale-[1.02]">
        <MedicineArt item={item} />
        {/* Jali-inspired lattice base */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-8 opacity-[0.12] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #FAF7F2 0 1px, transparent 1px 9px), repeating-linear-gradient(-45deg, #FAF7F2 0 1px, transparent 1px 9px)',
          }}
          aria-hidden="true"
        />
        {reg && (
          <span
            className={`absolute left-2 top-2 rounded-full border px-2.5 py-1 text-[10.5px] font-bold backdrop-blur-sm ${reg.className}`}
            title={item.regulatoryLabel}
          >
            {reg.label}
          </span>
        )}
        {item.isTopSeller && (
          <span className="absolute right-2 top-2 rounded-full border border-white/10 bg-black/35 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-delhi-paper backdrop-blur-sm">
            Popular
          </span>
        )}
        {isOutOfStock && (
          <Badge variant="error" size="sm" className="absolute bottom-2 left-2">
            Out of stock
          </Badge>
        )}
      </div>

      <div className="flex-1 space-y-1.5">
        <h3 className="line-clamp-2 font-display text-base font-semibold text-neutral-900 dark:text-delhi-paper">
          {item.brandName}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {item.strength} &middot; {item.dosageForm.toLowerCase()}
        </p>
        <p className="text-sm italic text-neutral-500 dark:text-neutral-400 line-clamp-1">{item.moleculeInn}</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">by {item.manufacturerName}</p>

        {pricing.genericPrice !== null && (
          <div className="mt-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-delhi-night p-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xl font-bold text-neutral-900 dark:text-delhi-paper">
                {formatINR(pricing.genericPrice)}
              </span>
              {hasSavings && pricing.alternativePrice !== null && (
                <span className="text-sm text-neutral-400 dark:text-neutral-500 line-through">
                  {formatINR(pricing.alternativePrice)}
                </span>
              )}
            </div>
            {hasSavings && (
              <div className="mt-2 flex items-start gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-delhi-green" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  <span className="font-bold text-delhi-green">
                    Save {formatINR(pricing.savingsAmount)} ({pricing.savingsPercent}%)
                  </span>{' '}
                  vs {item.altBrandName ?? 'branded equivalent'}
                  {pricing.estimated ? ' (est.)' : ''}
                </p>
              </div>
            )}
            {!hasSavings && pricing.alternativePrice !== null && (
              <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                No savings claim available for these prices.
              </p>
            )}
            {pricing.alternativePrice === null && (
              <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">Branded comparison unavailable.</p>
            )}
          </div>
        )}

        {isPrescriptionRegulated && (
          <p className="pt-1 text-[11px] leading-relaxed text-amber-700 dark:text-amber-300/90">
            Prescription requirements apply.
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {isOutOfStock ? (
          <Badge variant="error" size="sm">Out of stock</Badge>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-delhi-green">
            <span className="h-1.5 w-1.5 rounded-full bg-delhi-green" aria-hidden="true" />
            Available now
          </span>
        )}

        <Button
          size="sm"
          leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
          disabled={isOutOfStock || isAdding || addToCart.isPending}
          onClick={() => addToCart.mutate(item.formulationId)}
          aria-label={isOutOfStock ? 'Out of stock' : `Add ${item.brandName} to cart`}
        >
          Add
        </Button>
      </div>
    </Card>
  );
}

export const ProductCard = memo(ProductCardComponent);
