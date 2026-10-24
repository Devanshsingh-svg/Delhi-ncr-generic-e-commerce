import { z } from 'zod';

export const AddCartItemRequestSchema = z.object({
  formulationId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});
export type AddCartItemRequest = z.infer<typeof AddCartItemRequestSchema>;

export const UpdateCartItemRequestSchema = z.object({
  quantity: z.number().int().positive().max(99),
});
export type UpdateCartItemRequest = z.infer<typeof UpdateCartItemRequestSchema>;

export const CartItemResponseSchema = z.object({
  id: z.string().uuid(),
  cartId: z.string().uuid(),
  formulationId: z.string().uuid(),
  quantity: z.number().int().positive(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type CartItemResponse = z.infer<typeof CartItemResponseSchema>;

export const CartResponseSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  items: z.array(CartItemResponseSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type CartResponse = z.infer<typeof CartResponseSchema>;

export const CartTotalsResponseSchema = z.object({
  itemCount: z.number().int().nonnegative(),
  totalQuantity: z.number().int().nonnegative(),
});
export type CartTotalsResponse = z.infer<typeof CartTotalsResponseSchema>;