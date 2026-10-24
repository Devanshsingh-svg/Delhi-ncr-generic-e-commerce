'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus } from 'lucide-react';


import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';

import { apiClient } from '../lib/api';
import { CatalogItem , DEMO_CUSTOMER_ID, unwrap } from '../lib/demo';

interface ProductCardProps {
  item: CatalogItem;
  isAdding?: boolean;
  onAdd?: () => void;
}

export function ProductCard({ item, isAdding, onAdd }: ProductCardProps) {
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

  const isOutOfStock = item.availableQty === 0;

  return (
    <Card variant="bordered" padding="md" className="flex flex-col h-full group">
      <div className="aspect-square w-full rounded-xl bg-neutral-50 dark:bg-neutral-800 mb-3 overflow-hidden relative transition-transform duration-200 group-hover:scale-[1.02]">
        <div className="flex items-center justify-center h-full p-4">
          <Package className="h-16 w-16 text-neutral-300 dark:text-neutral-600" aria-hidden="true" />
        </div>
        <Badge variant={item.regulatoryCode === 'H' ? 'prescription' : 'otc'} size="sm" className="absolute top-2 left-2">
          {item.regulatoryCode === 'H' ? 'Rx · Schedule H' : 'OTC'}
        </Badge>
        {isOutOfStock && (
          <Badge variant="error" size="sm" className="absolute top-2 right-2">
            Out of stock
          </Badge>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 line-clamp-1">{item.brandName}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {item.strength} &middot; {item.dosageForm.toLowerCase()}
        </p>
        <p className="text-sm italic text-neutral-500 dark:text-neutral-400 line-clamp-1">{item.moleculeInn}</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">by {item.manufacturerName}</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge
          variant={isOutOfStock ? 'error' : 'success'}
          size="sm"
          dot={!isOutOfStock}
          className="flex items-center gap-1 text-xs"
        >
          {isOutOfStock ? 'Out of stock' : `${item.availableQty} in stock`}
        </Badge>

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