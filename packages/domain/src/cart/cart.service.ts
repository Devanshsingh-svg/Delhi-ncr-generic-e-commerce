import { Cart, CartItem, AddCartItemInput, UpdateCartItemInput, RemoveCartItemInput } from './cart.entity';
import {
  CartNotFoundError,
  CartItemNotFoundError,
  InvalidCartItemQuantityError,
  CartOwnershipError,
} from './cart.errors';
import { CartPersistencePort } from './cart.port';

const MAX_ITEM_QUANTITY = 99;
const MAX_CART_ITEMS = 50;

export class CartService {
  private readonly port: CartPersistencePort;

  constructor(port: CartPersistencePort) {
    this.port = port;
  }

  async getOrCreateCart(customerId: string): Promise<Cart> {
    let cart = await this.port.findByCustomer(customerId);
    if (!cart) {
      cart = await this.port.create({ customerId });
    }
    return cart;
  }

  async getCart(cartId: string): Promise<Cart | null> {
    return this.port.findById(cartId);
  }

  async getCustomerCart(customerId: string): Promise<Cart | null> {
    return this.port.findByCustomer(customerId);
  }

  async addItem(input: AddCartItemInput): Promise<CartItem> {
    const cart = await this.port.findById(input.cartId);
    if (!cart) {
      throw new CartNotFoundError(input.cartId);
    }

    if (input.quantity <= 0) {
      throw new InvalidCartItemQuantityError('Quantity must be positive');
    }

    if (input.quantity > MAX_ITEM_QUANTITY) {
      throw new InvalidCartItemQuantityError(`Quantity exceeds maximum of ${MAX_ITEM_QUANTITY}`);
    }

    const existingItem = cart.items.find(item => item.formulationId === input.formulationId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + input.quantity;
      if (newQuantity > MAX_ITEM_QUANTITY) {
        throw new InvalidCartItemQuantityError(`Total quantity for this item exceeds maximum of ${MAX_ITEM_QUANTITY}`);
      }
      return this.port.updateItem({
        cartId: input.cartId,
        itemId: existingItem.id,
        quantity: newQuantity,
      });
    }

    if (cart.items.length >= MAX_CART_ITEMS) {
      throw new InvalidCartItemQuantityError(`Cart cannot exceed ${MAX_CART_ITEMS} items`);
    }

    return this.port.addItem(input);
  }

  async updateItem(input: UpdateCartItemInput): Promise<CartItem> {
    const cart = await this.port.findById(input.cartId);
    if (!cart) {
      throw new CartNotFoundError(input.cartId);
    }

    const item = cart.items.find(i => i.id === input.itemId);
    if (!item) {
      throw new CartItemNotFoundError(input.itemId, input.cartId);
    }

    if (input.quantity <= 0) {
      throw new InvalidCartItemQuantityError('Quantity must be positive');
    }

    if (input.quantity > MAX_ITEM_QUANTITY) {
      throw new InvalidCartItemQuantityError(`Quantity exceeds maximum of ${MAX_ITEM_QUANTITY}`);
    }

    return this.port.updateItem(input);
  }

  async removeItem(input: RemoveCartItemInput): Promise<void> {
    const cart = await this.port.findById(input.cartId);
    if (!cart) {
      throw new CartNotFoundError(input.cartId);
    }

    const item = cart.items.find(i => i.id === input.itemId);
    if (!item) {
      throw new CartItemNotFoundError(input.itemId, input.cartId);
    }

    return this.port.removeItem(input);
  }

  async clearCart(cartId: string): Promise<void> {
    const cart = await this.port.findById(cartId);
    if (!cart) {
      throw new CartNotFoundError(cartId);
    }

    return this.port.clear(cartId);
  }

  async checkout(cartId: string): Promise<void> {
    const cart = await this.port.findById(cartId);
    if (!cart) {
      throw new CartNotFoundError(cartId);
    }

    if (cart.items.length === 0) {
      throw new InvalidCartItemQuantityError('Cannot checkout empty cart');
    }

    return this.port.markCheckedOut(cartId);
  }

  async verifyOwnership(cartId: string, customerId: string): Promise<void> {
    const cart = await this.port.findById(cartId);
    if (!cart) {
      throw new CartNotFoundError(cartId);
    }

    if (cart.customerId !== customerId) {
      throw new CartOwnershipError(cartId, customerId);
    }
  }

  getCartTotals(cart: Cart): { itemCount: number; totalQuantity: number } {
    const itemCount = cart.items.length;
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return { itemCount, totalQuantity };
  }
}