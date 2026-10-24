import { Order, CreateOrderInput, ConfirmOrderInput } from './order.entity';

export const ORDER_REPOSITORY_TOKEN = Symbol('ORDER_REPOSITORY');

export abstract class OrderPersistencePort {
  abstract create(input: CreateOrderInput): Promise<Order>;
  abstract findById(id: string): Promise<Order | null>;
  abstract findByCustomer(customerId: string): Promise<Order[]>;
  abstract confirm(input: ConfirmOrderInput): Promise<Order>;
  abstract cancel(id: string): Promise<void>;
  abstract updateStatus(id: string, status: Order['status']): Promise<void>;
}
