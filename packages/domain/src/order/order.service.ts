import {
  Order,
  CreateOrderInput,
  ConfirmOrderInput,
  OrderStatus,
} from './order.entity';
import {
  OrderNotFoundError,
  OrderAlreadyConfirmedError,
  OrderAlreadyCancelledError,
  InsufficientStockForOrderError,
  PrescriptionRequiredError,
  PrescriptionInvalidForOrderError,
  PaymentRequiredError,
} from './order.errors';
import { OrderPersistencePort } from './order.port';
import { PrescriptionService } from '../prescription/prescription.service';
import { reserveStock } from '../inventory/reservation.service';
import { InventoryReservationPort } from '../ports/inventory-reservation.port';

export interface CheckoutInput {
  customerId: string;
  items: {
    formulationId: string;
    quantity: number;
  }[];
  prescriptionId?: string;
  darkStoreId: string;
  paymentMethod: string;
}

export interface CheckoutResult {
  order: Order;
  reservations: { batchId: string; quantity: number; expiryDate: Date }[];
}

export class OrderService {
  private readonly orderPort: OrderPersistencePort;
  private readonly prescriptionService: PrescriptionService;
  private readonly inventoryPort: InventoryReservationPort;

  constructor(
    orderPort: OrderPersistencePort,
    prescriptionService: PrescriptionService,
    inventoryPort: InventoryReservationPort,
  ) {
    this.orderPort = orderPort;
    this.prescriptionService = prescriptionService;
    this.inventoryPort = inventoryPort;
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    return this.orderPort.create(input);
  }

  async checkout(input: CheckoutInput): Promise<CheckoutResult> {
    if (input.prescriptionId) {
      const validation = await this.prescriptionService.validateForDispense(input.prescriptionId);
      if (!validation.valid) {
        throw new PrescriptionInvalidForOrderError(input.prescriptionId, validation.reason ?? 'invalid');
      }
    }

    const order = await this.orderPort.create({
      customerId: input.customerId,
      items: input.items,
      prescriptionId: input.prescriptionId ?? null,
    });

    const allReservations: { batchId: string; quantity: number; expiryDate: Date }[] = [];

    for (const item of input.items) {
      const reservations = await reserveStock(this.inventoryPort, {
        orderId: order.id,
        darkStoreId: input.darkStoreId,
        formulationId: item.formulationId,
        quantity: item.quantity,
        minShelfLifeDays: 30,
      });
      allReservations.push(...reservations);
    }

    return { order, reservations: allReservations };
  }

  async confirmOrder(input: ConfirmOrderInput): Promise<Order> {
    const order = await this.orderPort.findById(input.orderId);
    if (!order) {
      throw new OrderNotFoundError(input.orderId);
    }

    if (order.status === OrderStatus.CONFIRMED) {
      throw new OrderAlreadyConfirmedError(input.orderId);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new OrderAlreadyCancelledError(input.orderId);
    }

    if (!input.paymentId) {
      throw new PaymentRequiredError(input.orderId);
    }

    return this.orderPort.confirm(input);
  }

  async cancelOrder(orderId: string): Promise<void> {
    const order = await this.orderPort.findById(orderId);
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new OrderAlreadyCancelledError(orderId);
    }

    if (order.status === OrderStatus.CONFIRMED) {
      throw new OrderAlreadyConfirmedError(orderId);
    }

    await this.orderPort.cancel(orderId);
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.orderPort.findById(orderId);
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return this.orderPort.findByCustomer(customerId);
  }
}
