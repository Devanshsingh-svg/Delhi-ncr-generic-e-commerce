export class CartNotFoundError extends Error {
  constructor(cartId: string) {
    super(`Cart not found: ${cartId}`);
    this.name = 'CartNotFoundError';
  }
}

export class CartItemNotFoundError extends Error {
  constructor(itemId: string, cartId: string) {
    super(`Cart item not found: ${itemId} in cart ${cartId}`);
    this.name = 'CartItemNotFoundError';
  }
}

export class InvalidCartItemQuantityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCartItemQuantityError';
  }
}

export class CartOwnershipError extends Error {
  constructor(cartId: string, customerId: string) {
    super(`Cart ${cartId} does not belong to customer ${customerId}`);
    this.name = 'CartOwnershipError';
  }
}