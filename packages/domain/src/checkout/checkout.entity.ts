export interface InitiateCheckoutInput {
  customerId: string;
  cartId: string;
  darkStoreId: string;
  paymentMethod: string;
  idempotencyKey: string;
}

export interface InitiateCheckoutResult {
  orderId: string;
  orderNumber: string;
  paymentIntentId: string;
  reservations: {
    batchId: string;
    quantity: number;
    expiryDate: Date;
  }[];
}

export interface PaymentIntent {
  id: string;
  amount: string;
  currency: string;
  status: 'REQUIRES_PAYMENT_METHOD' | 'REQUIRES_CONFIRMATION' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  paymentMethod: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreatePaymentIntentInput {
  amount: string;
  currency: string;
  paymentMethod: string;
  metadata: Record<string, unknown>;
  idempotencyKey: string;
}

export enum CheckoutStatus {
  PENDING = 'PENDING',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}