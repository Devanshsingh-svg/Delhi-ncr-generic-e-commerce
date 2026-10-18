import { DomainError } from '@gq/contracts';

export class OrderNotFoundError extends DomainError {
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`, 'ORDER_NOT_FOUND', { orderId });
    this.name = 'OrderNotFoundError';
  }
}

export class OrderAlreadyConfirmedError extends DomainError {
  constructor(orderId: string) {
    super(`Order already confirmed: ${orderId}`, 'ORDER_ALREADY_CONFIRMED', { orderId });
    this.name = 'OrderAlreadyConfirmedError';
  }
}

export class OrderAlreadyCancelledError extends DomainError {
  constructor(orderId: string) {
    super(`Order already cancelled: ${orderId}`, 'ORDER_ALREADY_CANCELLED', { orderId });
    this.name = 'OrderAlreadyCancelledError';
  }
}

export class InsufficientStockForOrderError extends DomainError {
  constructor(orderId: string, formulationId: string, requested: number, available: number) {
    super(`Insufficient stock for order ${orderId}, formulation ${formulationId}: requested ${requested}, available ${available}`, 'INSUFFICIENT_STOCK_FOR_ORDER', { orderId, formulationId, requested, available });
    this.name = 'InsufficientStockForOrderError';
  }
}

export class PrescriptionRequiredError extends DomainError {
  constructor(formulationId: string) {
    super(`Prescription required for formulation ${formulationId}`, 'PRESCRIPTION_REQUIRED', { formulationId });
    this.name = 'PrescriptionRequiredError';
  }
}

export class PrescriptionInvalidForOrderError extends DomainError {
  constructor(prescriptionId: string, reason: string) {
    super(`Prescription invalid for order: ${prescriptionId} - ${reason}`, 'PRESCRIPTION_INVALID_FOR_ORDER', { prescriptionId, reason });
    this.name = 'PrescriptionInvalidForOrderError';
  }
}

export class PaymentRequiredError extends DomainError {
  constructor(orderId: string) {
    super(`Payment required for order ${orderId}`, 'PAYMENT_REQUIRED', { orderId });
    this.name = 'PaymentRequiredError';
  }
}
