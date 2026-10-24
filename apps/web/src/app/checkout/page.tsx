'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckoutSkeleton } from '@/components/ui/Skeleton';
import { showToast } from '@/components/ui/Toast';

import { apiClient } from '../../lib/api';
import {
  CartView,
  CheckoutResultView,
  DEMO_CUSTOMER_ID,
  DEMO_DARK_STORE_ID,
  ReservationView,
  fetchCart,
  unwrap,
} from '../../lib/demo';

const PAYMENT_METHODS: readonly { readonly id: 'upi' | 'card' | 'cod'; readonly label: string; readonly hint: string }[] = [
  { id: 'upi', label: 'UPI', hint: 'Pay by any UPI app (Google Pay, PhonePe, Paytm)' },
  { id: 'card', label: 'Card', hint: 'Credit or debit card' },
  { id: 'cod', label: 'Cash on delivery', hint: 'Pay the rider on delivery' },
];

export default function CheckoutPage() {
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [result, setResult] = useState<
    { orderNumber: string; orderId: string; paymentIntentId: string; reservations: ReservationView[] } | null
  >(null);

  const { data: cart, isLoading } = useQuery({ queryKey: ['cart', 'items'], queryFn: fetchCart });
  const items = cart?.items ?? [];
  const cartId = (cart as CartView | null | undefined)?.id;

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!cartId) throw new Error('Cart not found');
      const idempotencyKey = crypto.randomUUID();
      const initiate = unwrap<CheckoutResultView>(
        await apiClient.post('/checkout', {
          customerId: DEMO_CUSTOMER_ID,
          cartId,
          darkStoreId: DEMO_DARK_STORE_ID,
          paymentMethod,
          idempotencyKey,
        })
      );
      const confirm = unwrap<CheckoutResultView>(
        await apiClient.post('/checkout/confirm', {
          checkoutId: idempotencyKey,
          paymentIntentId: initiate.paymentIntentId,
        })
      );
      return { initiate, confirm };
    },
    onSuccess: ({ initiate, confirm }) => {
      setResult({
        orderNumber: confirm.orderNumber || initiate.orderNumber,
        orderId: confirm.orderId || initiate.orderId,
        paymentIntentId: confirm.paymentIntentId,
        reservations: initiate.reservations,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showToast.success({ title: 'Order placed successfully', description: `Order ${confirm.orderNumber || initiate.orderNumber} confirmed` });
    },
    onError: (error) => {
      showToast.error({ title: 'Checkout failed', description: (error as Error).message });
    },
  });

  if (result) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Card variant="bordered" padding="lg" className="border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Order placed — checkout completed</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Payment confirmed · stock reserved · cart cleared</p>
            </div>
          </div>

          <dl className="mt-6 space-y-3">
            <div className="flex justify-between gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">Order number</dt>
              <dd className="font-mono font-semibold text-neutral-900 dark:text-neutral-50">{result.orderNumber}</dd>
            </div>
            <div className="flex justify-between gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">Order ID</dt>
              <dd className="font-mono text-neutral-700 dark:text-neutral-300">{result.orderId}</dd>
            </div>
            <div className="flex justify-between gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">Payment intent</dt>
              <dd className="font-mono text-neutral-700 dark:text-neutral-300">{result.paymentIntentId}</dd>
            </div>
            <div className="flex justify-between gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">Payment method</dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-50 capitalize">{paymentMethod}</dd>
            </div>
          </dl>

          <div>
            <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-3">
              Reserved batches (FEFO — earliest expiry first)
            </h2>
            <Card variant="bordered" padding="none">
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {result.reservations.map((r) => (
                  <li key={r.batchId} className="flex items-center justify-between p-3 text-sm">
                    <span className="font-mono text-neutral-700 dark:text-neutral-300">batch …{r.batchId.slice(-6)}</span>
                    <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
                      <span>qty {r.quantity}</span>
                      <span>expires {new Date(r.expiryDate).toISOString().slice(0, 10)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Link href="/" className="mt-6 inline-flex">
            <Button size="lg" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
              Back to the store
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Checkout</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {items.length} line items · {items.reduce((s, i) => s + i.quantity, 0)} units will be reserved from the
          dark store's FEFO batches.
        </p>
      </div>

      {isLoading ? (
        <CheckoutSkeleton />
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-12 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">Nothing to check out — your cart is empty.</p>
          <Link href="/" className="mt-3 inline-block">
            <Button variant="primary">Browse the store</Button>
          </Link>
        </div>
      ) : (
        <>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Payment method</legend>
            <div className="mt-3 grid gap-3" role="radiogroup" aria-label="Select payment method">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={
                    paymentMethod === m.id
                      ? 'flex cursor-pointer items-center justify-between rounded-xl border border-primary-500 bg-primary-50 dark:bg-primary-900/20 p-4 transition-colors'
                      : 'flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 transition-colors hover:border-neutral-300 dark:hover:border-neutral-600'
                  }
                >
                  <div className="flex flex-col">
                    <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-50">{m.label}</span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{m.hint}</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="h-5 w-5 accent-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500"
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <Button
            size="lg"
            fullWidth
            className="mt-6"
            disabled={placeOrder.isPending || !cartId}
            onClick={() => placeOrder.mutate()}
          >
            {placeOrder.isPending ? 'Reserving stock…' : 'Place order'}
          </Button>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Demo payment boundary — no real provider is charged
          </p>

          {placeOrder.isError && (
            <div
              className="mt-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4"
              role="alert"
            >
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <p className="text-sm">Checkout failed: {(placeOrder.error as Error).message}</p>
              </div>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => placeOrder.mutate()}>
                Try again
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}