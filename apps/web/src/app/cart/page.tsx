'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Minus, Plus, Trash2, RotateCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CartItemSkeleton } from '@/components/ui/Skeleton';
import { showToast } from '@/components/ui/Toast';

import { apiClient } from '../../lib/api';
import {
  CatalogItem,
  CartView,
  DEMO_CUSTOMER_ID,
  fetchCart,
  fetchCatalog,
  unwrap,
} from '../../lib/demo';

export default function CartPage() {
  const queryClient = useQueryClient();

  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart', 'items'],
    queryFn: fetchCart,
  });
  const { data: catalog } = useQuery({ queryKey: ['catalog'], queryFn: fetchCatalog });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const nameOf = (formulationId: string): CatalogItem | undefined =>
    (catalog ?? []).find((c) => c.formulationId === formulationId);

  const items = cart?.items ?? [];
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  const updateQty = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      unwrap(await apiClient.patch(`/cart/customer/${DEMO_CUSTOMER_ID}/items/${itemId}`, { quantity })),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart', 'items'] });
      const previousCart = queryClient.getQueryData<CartView>(['cart', 'items']);

      queryClient.setQueryData<CartView>(['cart', 'items'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        };
      });

      return { previousCart };
    },
    onError: (err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', 'items'], context.previousCart);
      }
      showToast.error({ title: 'Could not update quantity', description: (err as Error).message });
    },
    onSuccess: () => {
      showToast.success({ title: 'Quantity updated' });
    },
    onSettled: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) =>
      unwrap(await apiClient.delete(`/cart/customer/${DEMO_CUSTOMER_ID}/items/${itemId}`)),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart', 'items'] });
      const previousCart = queryClient.getQueryData<CartView>(['cart', 'items']);

      queryClient.setQueryData<CartView>(['cart', 'items'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.id !== itemId),
        };
      });

      return { previousCart };
    },
    onError: (err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', 'items'], context.previousCart);
      }
      showToast.error({ title: 'Could not remove item', description: (err as Error).message });
    },
    onSuccess: () => {
      showToast.success({ title: 'Item removed from cart' });
    },
    onSettled: invalidate,
  });

  const clearCart = useMutation({
    mutationFn: async () => unwrap(await apiClient.delete(`/cart/customer/${DEMO_CUSTOMER_ID}`)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['cart', 'items'] });
      const previousCart = queryClient.getQueryData<CartView>(['cart', 'items']);
      queryClient.setQueryData<CartView>(['cart', 'items'], (old) => old ? { ...old, items: [] } : old);
      return { previousCart };
    },
    onError: (err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', 'items'], context.previousCart);
      }
      showToast.error({ title: 'Could not clear cart', description: (err as Error).message });
    },
    onSuccess: () => {
      showToast.success({ title: 'Cart cleared' });
    },
    onSettled: invalidate,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Your cart</h1>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => clearCart.mutate()} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />} disabled={clearCart.isPending}>
            Clear cart
          </Button>
        )}
      </div>

      {isLoading ? (
        <ul className="mt-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </ul>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-6 text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load cart: {(error as Error).message}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <span className="text-3xl" aria-hidden="true">🛒</span>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">Your cart is empty</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">Looks like you haven't added any medicines yet.</p>
          <Link href="/">
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
              Browse the store
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-700 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
            {items.map((item) => {
              const info = nameOf(item.formulationId);
              const isOutOfStock = info?.availableQty === 0;

              return (
                <li key={item.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-50 truncate">
                        {info?.brandName ?? 'Medicine'}
                      </p>
                      {info?.regulatoryCode === 'H' ? (
                        <Badge variant="prescription" size="sm">Rx</Badge>
                      ) : (
                        <Badge variant="otc" size="sm">OTC</Badge>
                      )}
                      {isOutOfStock && (
                        <Badge variant="error" size="sm">Out of stock</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {info ? `${info.strength} · ${info.moleculeInn}` : item.formulationId.slice(0, 8)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Decrease quantity"
                      disabled={item.quantity <= 1 || updateQty.isPending}
                      onClick={() => updateQty.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </Button>

                    <span className="w-10 text-center font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">
                      {item.quantity}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Increase quantity"
                      disabled={item.quantity >= 99 || updateQty.isPending || isOutOfStock}
                      onClick={() => updateQty.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove item"
                      disabled={removeItem.isPending}
                      onClick={() => removeItem.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-neutral-400 hover:text-red-600" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">{items.length}</span> line items ·{' '}
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">{totalQuantity}</span> units
            </p>

            <Link href="/checkout">
              <Button
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                className="w-full sm:w-auto"
                disabled={items.length === 0}
              >
                Proceed to checkout
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}