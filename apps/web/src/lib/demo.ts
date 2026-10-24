import { apiClient } from './api';

export const DEMO_CUSTOMER_ID = '00000000-0000-4000-8000-000000000001';
export const DEMO_DARK_STORE_ID = '00000000-0000-4000-8000-000000000201';
export const DEMO_DARK_STORE_NAME = 'Saket Demo Dark Store';

export interface CatalogItem {
  formulationId: string;
  brandName: string;
  moleculeInn: string;
  dosageForm: string;
  strength: string;
  releaseType: string;
  manufacturerName: string;
  regulatoryCode: string;
  regulatoryLabel: string;
  availableQty: number;
  isTopSeller: boolean;
  mrp: number | null;
  altBrandName: string | null;
  altMrp: number | null;
  altEstimated: boolean;
  savingsPct: number | null;
}

export interface CartItemView {
  id: string;
  cartId: string;
  formulationId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartView {
  id: string;
  customerId: string;
  items: CartItemView[];
  createdAt: string;
  updatedAt: string;
}

export interface CartTotalsView {
  itemCount: number;
  totalQuantity: number;
}

export interface ReservationView {
  batchId: string;
  quantity: number;
  expiryDate: string;
}

export interface CheckoutResultView {
  orderId: string;
  orderNumber: string;
  paymentIntentId: string;
  reservations: ReservationView[];
}

export function unwrap<T>(res: unknown): T {
  const outer = (res as { data?: unknown } | null)?.data ?? res;
  const inner = (outer as { data?: unknown } | null)?.data;
  if (
    inner !== null &&
    typeof inner === 'object' &&
    'success' in (inner as Record<string, unknown>) &&
    'data' in (inner as Record<string, unknown>)
  ) {
    return (inner as { data: T }).data;
  }
  return inner as T;
}

export async function fetchCatalog(): Promise<CatalogItem[]> {
  return unwrap<CatalogItem[]>(await apiClient.get('/catalog/items'));
}

export async function fetchCart(): Promise<CartView | null> {
  return unwrap<CartView | null>(await apiClient.get(`/cart/customer/${DEMO_CUSTOMER_ID}`));
}

export async function fetchTotals(): Promise<CartTotalsView> {
  return unwrap<CartTotalsView>(await apiClient.get(`/cart/customer/${DEMO_CUSTOMER_ID}/totals`));
}