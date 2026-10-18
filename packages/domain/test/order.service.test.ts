import { describe, it, expect, vi } from 'vitest';
import { OrderService } from '../src/order/order.service';
import {
  OrderNotFoundError,
  OrderAlreadyConfirmedError,
  OrderAlreadyCancelledError,
  PrescriptionInvalidForOrderError,
  PaymentRequiredError,
} from '../src/order/order.errors';
import { OrderStatus } from '../src/order/order.entity';

const makeMockOrderPort = () => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByCustomer: vi.fn(),
  confirm: vi.fn(),
  cancel: vi.fn(),
  updateStatus: vi.fn(),
});

const makeMockPrescriptionService = () => ({
  validateForDispense: vi.fn(),
});

const makeMockInventoryPort = () => ({
  acquireAdvisoryLock: vi.fn(),
  findEligibleBatches: vi.fn(),
  reserveBatches: vi.fn(),
  createStockReservations: vi.fn(),
});

describe('OrderService', () => {
  describe('createOrder', () => {
    it('creates order through port', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      const created = { id: 'o1', customerId: 'c1', items: [] };
      orderPort.create.mockResolvedValue(created);
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      const result = await service.createOrder({
        customerId: 'c1',
        items: [{ formulationId: 'f1', quantity: 2 }],
        prescriptionId: null,
      });
      expect(orderPort.create).toHaveBeenCalledWith({
        customerId: 'c1',
        items: [{ formulationId: 'f1', quantity: 2 }],
        prescriptionId: null,
      });
      expect(result).toEqual(created);
    });
  });

  describe('checkout', () => {
    it('throws when prescription is invalid', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      prescriptionService.validateForDispense.mockResolvedValue({ valid: false, reason: 'expired' });
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      await expect(service.checkout({
        customerId: 'c1',
        items: [{ formulationId: 'f1', quantity: 1 }],
        prescriptionId: 'p1',
        darkStoreId: 'ds1',
        paymentMethod: 'upi',
      })).rejects.toBeInstanceOf(PrescriptionInvalidForOrderError);
    });

    it('creates order and reserves stock for each item', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      const created = { id: 'o1', customerId: 'c1', items: [] };
      orderPort.create.mockResolvedValue(created);
      prescriptionService.validateForDispense.mockResolvedValue({ valid: true, reason: null });
      inventoryPort.acquireAdvisoryLock.mockResolvedValue(undefined);
      inventoryPort.findEligibleBatches.mockResolvedValue([
        { id: 'b1', availableQty: 10, reservedQty: 0, expiryDate: new Date('2027-01-01'), qualityReleaseStatus: 'RELEASED', darkStoreId: 'ds1', formulationId: 'f1' },
      ]);
      inventoryPort.reserveBatches.mockResolvedValue(undefined);
      inventoryPort.createStockReservations.mockResolvedValue(undefined);
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      const result = await service.checkout({
        customerId: 'c1',
        items: [{ formulationId: 'f1', quantity: 2 }],
        prescriptionId: 'p1',
        darkStoreId: 'ds1',
        paymentMethod: 'upi',
      });
      expect(orderPort.create).toHaveBeenCalledWith({
        customerId: 'c1',
        items: [{ formulationId: 'f1', quantity: 2 }],
        prescriptionId: 'p1',
      });
      expect(result.order.id).toBe('o1');
      expect(result.reservations.length).toBeGreaterThan(0);
    });

    it('skips prescription validation when no prescription provided', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      const created = { id: 'o1', customerId: 'c1', items: [] };
      orderPort.create.mockResolvedValue(created);
      inventoryPort.acquireAdvisoryLock.mockResolvedValue(undefined);
      inventoryPort.findEligibleBatches.mockResolvedValue([
        { id: 'b1', availableQty: 10, reservedQty: 0, expiryDate: new Date('2027-01-01'), qualityReleaseStatus: 'RELEASED', darkStoreId: 'ds1', formulationId: 'f1' },
      ]);
      inventoryPort.reserveBatches.mockResolvedValue(undefined);
      inventoryPort.createStockReservations.mockResolvedValue(undefined);
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      const result = await service.checkout({
        customerId: 'c1',
        items: [{ formulationId: 'f1', quantity: 2 }],
        darkStoreId: 'ds1',
        paymentMethod: 'upi',
      });
      expect(prescriptionService.validateForDispense).not.toHaveBeenCalled();
      expect(result.order.id).toBe('o1');
    });
  });

  describe('confirmOrder', () => {
    it('throws OrderNotFoundError when missing', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      orderPort.findById.mockResolvedValue(null);
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      await expect(service.confirmOrder({ orderId: 'missing', paymentId: 'pay1' })).rejects.toBeInstanceOf(OrderNotFoundError);
    });

    it('throws OrderAlreadyConfirmedError when already confirmed', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      orderPort.findById.mockResolvedValue({ id: 'o1', status: OrderStatus.CONFIRMED });
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      await expect(service.confirmOrder({ orderId: 'o1', paymentId: 'pay1' })).rejects.toBeInstanceOf(OrderAlreadyConfirmedError);
    });

    it('throws PaymentRequiredError when no paymentId', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      orderPort.findById.mockResolvedValue({ id: 'o1', status: OrderStatus.PENDING });
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      await expect(service.confirmOrder({ orderId: 'o1', paymentId: '' })).rejects.toBeInstanceOf(PaymentRequiredError);
    });

    it('confirms order through port', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      const confirmed = { id: 'o1', status: OrderStatus.CONFIRMED };
      orderPort.findById.mockResolvedValue({ id: 'o1', status: OrderStatus.PENDING });
      orderPort.confirm.mockResolvedValue(confirmed);
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      const result = await service.confirmOrder({ orderId: 'o1', paymentId: 'pay1' });
      expect(orderPort.confirm).toHaveBeenCalledWith({ orderId: 'o1', paymentId: 'pay1' });
      expect(result).toEqual(confirmed);
    });
  });

  describe('cancelOrder', () => {
    it('throws OrderNotFoundError when missing', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      orderPort.findById.mockResolvedValue(null);
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      await expect(service.cancelOrder('missing')).rejects.toBeInstanceOf(OrderNotFoundError);
    });

    it('throws OrderAlreadyCancelledError when already cancelled', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      orderPort.findById.mockResolvedValue({ id: 'o1', status: OrderStatus.CANCELLED });
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      await expect(service.cancelOrder('o1')).rejects.toBeInstanceOf(OrderAlreadyCancelledError);
    });

    it('throws OrderAlreadyConfirmedError when confirmed', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      orderPort.findById.mockResolvedValue({ id: 'o1', status: OrderStatus.CONFIRMED });
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      await expect(service.cancelOrder('o1')).rejects.toBeInstanceOf(OrderAlreadyConfirmedError);
    });

    it('cancels order through port', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      orderPort.findById.mockResolvedValue({ id: 'o1', status: OrderStatus.PENDING });
      orderPort.cancel.mockResolvedValue(undefined);
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      await service.cancelOrder('o1');
      expect(orderPort.cancel).toHaveBeenCalledWith('o1');
    });
  });

  describe('getOrder', () => {
    it('returns null when not found', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      orderPort.findById.mockResolvedValue(null);
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      const result = await service.getOrder('missing');
      expect(result).toBeNull();
    });

    it('returns order when found', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      const order = { id: 'o1', customerId: 'c1' };
      orderPort.findById.mockResolvedValue(order);
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      const result = await service.getOrder('o1');
      expect(result).toEqual(order);
    });
  });

  describe('getCustomerOrders', () => {
    it('returns customer orders through port', async () => {
      const orderPort = makeMockOrderPort();
      const prescriptionService = makeMockPrescriptionService();
      const inventoryPort = makeMockInventoryPort();
      const orders = [{ id: 'o1', customerId: 'c1' }, { id: 'o2', customerId: 'c1' }];
      orderPort.findByCustomer.mockResolvedValue(orders);
      const service = new OrderService(orderPort as any, prescriptionService as any, inventoryPort as any);
      const result = await service.getCustomerOrders('c1');
      expect(orderPort.findByCustomer).toHaveBeenCalledWith('c1');
      expect(result).toEqual(orders);
    });
  });
});
