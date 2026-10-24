import { describe, it, expect, vi } from 'vitest';
import { CheckoutService } from '../src/checkout/checkout.service';
import { CheckoutStatus } from '../src/checkout/checkout.entity';
import {
  IdempotencyKeyConflictError,
  CheckoutAlreadyCompletedError,
  CartNotReadyForCheckoutError,
  StockReservationFailedError,
  CheckoutNotFoundError,
} from '../src/checkout/checkout.errors';
import { CartService } from '../src/cart/cart.service';
import { OrderService } from '../src/order/order.service';
import { Cart } from '../src/cart/cart.entity';
import { InsufficientStockError } from '../src/errors';

const now = new Date('2026-01-01T00:00:00Z');

const makeCartItem = (formulationId: string, quantity: number) => ({
  id: `item-${formulationId}`,
  cartId: 'cart-1',
  formulationId,
  quantity,
  createdAt: now,
  updatedAt: now,
});

const makeCart = (items: Cart['items'] = [], customerId = 'c1'): Cart => ({
  id: 'cart-1',
  customerId,
  items,
  createdAt: now,
  updatedAt: now,
});

const makeCheckoutRecord = (status: CheckoutStatus) => ({
  id: 'key-1',
  customerId: 'c1',
  cartId: 'cart-1',
  darkStoreId: 'ds1',
  paymentMethod: 'upi',
  idempotencyKey: 'key-1',
  status,
  orderId: null,
  paymentIntentId: null,
  createdAt: now,
  updatedAt: now,
});

const makePaymentIntent = () => ({
  id: 'pi_1',
  amount: '100.00',
  currency: 'INR',
  status: 'REQUIRES_PAYMENT_METHOD' as const,
  paymentMethod: 'upi',
  metadata: {},
  createdAt: now,
  expiresAt: now,
});

const makeHarness = () => {
  const checkoutPort = {
    create: vi.fn(),
    findById: vi.fn(),
    findByIdempotencyKey: vi.fn(),
    updateStatus: vi.fn(),
    complete: vi.fn(),
    createPaymentIntent: vi.fn(),
    findPaymentIntent: vi.fn(),
    updatePaymentIntentStatus: vi.fn(),
  };
  const cartPort = {
    create: vi.fn(),
    findById: vi.fn(),
    findByCustomer: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    markCheckedOut: vi.fn(),
  };
  const orderPort = {
    create: vi.fn(),
    findById: vi.fn(),
    findByCustomer: vi.fn(),
    confirm: vi.fn(),
    cancel: vi.fn(),
    updateStatus: vi.fn(),
  };
  const inventoryPort = {
    acquireAdvisoryLock: vi.fn(),
    findEligibleBatches: vi.fn(),
    reserveBatches: vi.fn(),
    createStockReservations: vi.fn(),
  };
  const prescriptionService = { validateForDispense: vi.fn() };
  const cartService = new CartService(cartPort as any);
  const orderService = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
  const service = new CheckoutService(
    checkoutPort as any,
    cartService,
    prescriptionService as any,
    orderService,
    inventoryPort as any,
  );
  return { service, checkoutPort, cartPort, orderPort, inventoryPort };
};

const input = {
  customerId: 'c1',
  cartId: 'cart-1',
  darkStoreId: 'ds1',
  paymentMethod: 'upi',
  idempotencyKey: 'key-1',
};

describe('CheckoutService', () => {
  describe('initiateCheckout', () => {
    it('throws IdempotencyKeyConflictError when the key is already in flight', async () => {
      const { service, checkoutPort } = makeHarness();
      checkoutPort.findByIdempotencyKey.mockResolvedValue(makeCheckoutRecord(CheckoutStatus.PENDING));
      await expect(service.initiateCheckout(input)).rejects.toBeInstanceOf(IdempotencyKeyConflictError);
    });

    it('throws CheckoutAlreadyCompletedError when the key already completed', async () => {
      const { service, checkoutPort } = makeHarness();
      checkoutPort.findByIdempotencyKey.mockResolvedValue(makeCheckoutRecord(CheckoutStatus.COMPLETED));
      await expect(service.initiateCheckout(input)).rejects.toBeInstanceOf(CheckoutAlreadyCompletedError);
    });

    it('throws when the cart does not exist', async () => {
      const { service, checkoutPort, cartPort } = makeHarness();
      checkoutPort.findByIdempotencyKey.mockResolvedValue(null);
      cartPort.findById.mockResolvedValue(null);
      await expect(service.initiateCheckout(input)).rejects.toBeInstanceOf(CartNotReadyForCheckoutError);
    });

    it('throws on cart ownership mismatch', async () => {
      const { service, checkoutPort, cartPort } = makeHarness();
      checkoutPort.findByIdempotencyKey.mockResolvedValue(null);
      cartPort.findById.mockResolvedValue(makeCart([], 'someone-else'));
      await expect(service.initiateCheckout(input)).rejects.toBeInstanceOf(CartNotReadyForCheckoutError);
    });

    it('throws when the cart is empty', async () => {
      const { service, checkoutPort, cartPort } = makeHarness();
      checkoutPort.findByIdempotencyKey.mockResolvedValue(null);
      cartPort.findById.mockResolvedValue(makeCart([]));
      await expect(service.initiateCheckout(input)).rejects.toBeInstanceOf(CartNotReadyForCheckoutError);
    });

    it('reserves stock per item, creates a payment intent, and confirms the checkout', async () => {
      const { service, checkoutPort, cartPort, inventoryPort } = makeHarness();
      checkoutPort.findByIdempotencyKey.mockResolvedValue(null);
      cartPort.findById.mockResolvedValue(makeCart([makeCartItem('f1', 2)]));
      checkoutPort.create.mockResolvedValue(makeCheckoutRecord(CheckoutStatus.PENDING));
      inventoryPort.acquireAdvisoryLock.mockResolvedValue(undefined);
      inventoryPort.findEligibleBatches.mockResolvedValue([
        { id: 'b1', availableQty: 10, reservedQty: 0, expiryDate: new Date('2027-01-01'), qualityReleaseStatus: 'RELEASED', darkStoreId: 'ds1', formulationId: 'f1' },
      ]);
      inventoryPort.reserveBatches.mockResolvedValue(undefined);
      inventoryPort.createStockReservations.mockResolvedValue(undefined);
      checkoutPort.createPaymentIntent.mockResolvedValue(makePaymentIntent());

      const result = await service.initiateCheckout(input);

      expect(inventoryPort.findEligibleBatches).toHaveBeenCalledTimes(1);
      expect(inventoryPort.createStockReservations).toHaveBeenCalledWith([
        expect.objectContaining({ orderId: 'key-1', inventoryBatchId: 'b1', formulationId: 'f1', quantity: 2 }),
      ]);
      expect(result.paymentIntentId).toBe('pi_1');
      expect(result.reservations).toEqual([{ batchId: 'b1', quantity: 2, expiryDate: new Date('2027-01-01') }]);
      expect(checkoutPort.updateStatus).toHaveBeenCalledWith('key-1', CheckoutStatus.PAYMENT_CONFIRMED);
    });

    it('wraps stock failures in StockReservationFailedError and marks the checkout FAILED', async () => {
      const { service, checkoutPort, cartPort, inventoryPort } = makeHarness();
      checkoutPort.findByIdempotencyKey.mockResolvedValue(null);
      cartPort.findById.mockResolvedValue(makeCart([makeCartItem('f1', 2)]));
      checkoutPort.create.mockResolvedValue(makeCheckoutRecord(CheckoutStatus.PENDING));
      inventoryPort.acquireAdvisoryLock.mockRejectedValue(new InsufficientStockError('no stock'));

      await expect(service.initiateCheckout(input)).rejects.toBeInstanceOf(StockReservationFailedError);
      expect(checkoutPort.updateStatus).toHaveBeenCalledWith('key-1', CheckoutStatus.FAILED);
    });
  });

  describe('confirmPayment', () => {
    it('creates the order, completes the checkout, and clears the cart', async () => {
      const { service, checkoutPort, cartPort, orderPort } = makeHarness();
      checkoutPort.findById.mockResolvedValue(makeCheckoutRecord(CheckoutStatus.PAYMENT_CONFIRMED));
      cartPort.findById.mockResolvedValue(makeCart([makeCartItem('f1', 2)]));
      orderPort.create.mockResolvedValue({ id: 'o1', orderNumber: 'ORD-1' });

      const result = await service.confirmPayment('key-1', 'pi_1');

      expect(checkoutPort.complete).toHaveBeenCalledWith('key-1', 'o1', 'pi_1');
      expect(cartPort.markCheckedOut).toHaveBeenCalledWith('cart-1');
      expect(result.orderId).toBe('o1');
      expect(result.orderNumber).toBe('ORD-1');
      expect(result.paymentIntentId).toBe('pi_1');
    });

    it('throws when the checkout is not in PAYMENT_CONFIRMED state', async () => {
      const { service, checkoutPort } = makeHarness();
      checkoutPort.findById.mockResolvedValue(makeCheckoutRecord(CheckoutStatus.PENDING));
      await expect(service.confirmPayment('key-1', 'pi_1')).rejects.toBeInstanceOf(CheckoutNotFoundError);
    });
  });

  describe('getCheckoutStatus', () => {
    it('returns the checkout status', async () => {
      const { service, checkoutPort } = makeHarness();
      checkoutPort.findById.mockResolvedValue(makeCheckoutRecord(CheckoutStatus.PAYMENT_CONFIRMED));
      await expect(service.getCheckoutStatus('key-1')).resolves.toBe(CheckoutStatus.PAYMENT_CONFIRMED);
    });

    it('throws when the checkout is missing', async () => {
      const { service, checkoutPort } = makeHarness();
      checkoutPort.findById.mockResolvedValue(null);
      await expect(service.getCheckoutStatus('missing')).rejects.toBeInstanceOf(CheckoutNotFoundError);
    });
  });
});