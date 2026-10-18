import { z } from 'zod';

export const OrderItemInputSchema = z.object({
  formulationId: z.string().uuid(),
  quantity: z.number().int().positive(),
});
export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;

export const CreateOrderRequestSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(OrderItemInputSchema).min(1),
  prescriptionId: z.string().uuid().optional(),
});
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

export const CheckoutRequestSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(OrderItemInputSchema).min(1),
  prescriptionId: z.string().uuid().optional(),
  darkStoreId: z.string().uuid(),
  paymentMethod: z.string().min(1).max(50),
});
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const ConfirmOrderRequestSchema = z.object({
  orderId: z.string().uuid(),
  paymentId: z.string().uuid(),
});
export type ConfirmOrderRequest = z.infer<typeof ConfirmOrderRequestSchema>;

export const OrderResponseSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  orderNumber: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
  totalAmount: z.string(),
  prescriptionId: z.string().uuid().nullable(),
  paymentId: z.string().uuid().nullable(),
  shipmentId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type OrderResponse = z.infer<typeof OrderResponseSchema>;

export const CheckoutResponseSchema = z.object({
  order: OrderResponseSchema,
  reservations: z.array(
    z.object({
      batchId: z.string().uuid(),
      quantity: z.number().int().positive(),
      expiryDate: z.string().datetime(),
    }),
  ),
});
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
