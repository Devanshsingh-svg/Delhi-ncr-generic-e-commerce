import { PaymentIntent, CreatePaymentIntentInput, CheckoutStatus } from './checkout.entity';

export const CHECKOUT_REPOSITORY_TOKEN = Symbol('CHECKOUT_REPOSITORY');

export interface CheckoutRecord {
  id: string;
  customerId: string;
  cartId: string;
  darkStoreId: string;
  paymentMethod: string;
  idempotencyKey: string;
  status: CheckoutStatus;
  orderId: string | null;
  paymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class CheckoutPersistencePort {
  abstract create(input: {
    customerId: string;
    cartId: string;
    darkStoreId: string;
    paymentMethod: string;
    idempotencyKey: string;
  }): Promise<CheckoutRecord>;
  abstract findById(id: string): Promise<CheckoutRecord | null>;
  abstract findByIdempotencyKey(key: string): Promise<CheckoutRecord | null>;
  abstract updateStatus(id: string, status: CheckoutStatus): Promise<void>;
  abstract complete(id: string, orderId: string, paymentIntentId: string): Promise<void>;
  abstract createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent>;
  abstract findPaymentIntent(id: string): Promise<PaymentIntent | null>;
  abstract updatePaymentIntentStatus(id: string, status: PaymentIntent['status']): Promise<void>;
}