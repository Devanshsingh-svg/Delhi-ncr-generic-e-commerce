import { Cart, CartItem, CreateCartInput, AddCartItemInput, UpdateCartItemInput, RemoveCartItemInput } from './cart.entity';

export const CART_REPOSITORY_TOKEN = Symbol('CART_REPOSITORY');

export abstract class CartPersistencePort {
  abstract create(input: CreateCartInput): Promise<Cart>;
  abstract findById(id: string): Promise<Cart | null>;
  abstract findByCustomer(customerId: string): Promise<Cart | null>;
  abstract addItem(input: AddCartItemInput): Promise<CartItem>;
  abstract updateItem(input: UpdateCartItemInput): Promise<CartItem>;
  abstract removeItem(input: RemoveCartItemInput): Promise<void>;
  abstract clear(cartId: string): Promise<void>;
  abstract markCheckedOut(cartId: string): Promise<void>;
}