import { z } from 'zod';

export const InitiateCheckoutRequestSchema = z.object({
  customerId: z.string().uuid(),
  cartId: z.string().uuid(),
  darkStoreId: z.string().uuid(),
  paymentMethod: z.string().min(1).max(50),
  idempotencyKey: z.string().uuid(),
});
export type InitiateCheckoutRequest = z.infer<typeof InitiateCheckoutRequestSchema>;

export const ConfirmPaymentRequestSchema = z.object({
  checkoutId: z.string().uuid(),
  paymentIntentId: z.string().min(1),
});
export type ConfirmPaymentRequest = z.infer<typeof ConfirmPaymentRequestSchema>;

export const PaymentIntentResponseSchema = z.object({
  id: z.string().min(1),
  amount: z.string(),
  currency: z.string(),
  status: z.enum(['REQUIRES_PAYMENT_METHOD', 'REQUIRES_CONFIRMATION', 'SUCCEEDED', 'FAILED', 'CANCELED']),
  paymentMethod: z.string(),
  metadata: z.record(z.unknown()),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
});
export type PaymentIntentResponse = z.infer<typeof PaymentIntentResponseSchema>;

export const ReservationResponseSchema = z.object({
  batchId: z.string().uuid(),
  quantity: z.number().int().positive(),
  expiryDate: z.coerce.date(),
});
export type ReservationResponse = z.infer<typeof ReservationResponseSchema>;

export const InitiateCheckoutResponseSchema = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  paymentIntentId: z.string().min(1),
  reservations: z.array(ReservationResponseSchema),
});
export type InitiateCheckoutResponse = z.infer<typeof InitiateCheckoutResponseSchema>;

export const CheckoutStatusResponseSchema = z.object({
  status: z.enum(['PENDING', 'PAYMENT_REQUIRED', 'PAYMENT_CONFIRMED', 'COMPLETED', 'FAILED', 'CANCELLED']),
});
export type CheckoutStatusResponse = z.infer<typeof CheckoutStatusResponseSchema>;