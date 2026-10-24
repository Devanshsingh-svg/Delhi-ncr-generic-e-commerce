export class CheckoutNotFoundError extends Error {
  constructor(checkoutId: string) {
    super(`Checkout not found: ${checkoutId}`);
    this.name = 'CheckoutNotFoundError';
  }
}

export class CartNotReadyForCheckoutError extends Error {
  constructor(cartId: string, reason: string) {
    super(`Cart not ready for checkout: ${cartId} - ${reason}`);
    this.name = 'CartNotReadyForCheckoutError';
  }
}

export class PaymentIntentCreationError extends Error {
  constructor(reason: string) {
    super(`Payment intent creation failed: ${reason}`);
    this.name = 'PaymentIntentCreationError';
  }
}

export class IdempotencyKeyConflictError extends Error {
  constructor(key: string) {
    super(`Idempotency key already used: ${key}`);
    this.name = 'IdempotencyKeyConflictError';
  }
}

export class StockReservationFailedError extends Error {
  constructor(formulationId: string, reason: string) {
    super(`Stock reservation failed for ${formulationId}: ${reason}`);
    this.name = 'StockReservationFailedError';
  }
}

export class PrescriptionValidationFailedError extends Error {
  constructor(prescriptionId: string, reason: string) {
    super(`Prescription validation failed: ${prescriptionId} - ${reason}`);
    this.name = 'PrescriptionValidationFailedError';
  }
}

export class CheckoutAlreadyCompletedError extends Error {
  constructor(checkoutId: string) {
    super(`Checkout already completed: ${checkoutId}`);
    this.name = 'CheckoutAlreadyCompletedError';
  }
}