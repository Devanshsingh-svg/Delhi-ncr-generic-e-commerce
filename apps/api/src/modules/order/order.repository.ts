import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  OrderPersistencePort,
  CreateOrderInput,
  ConfirmOrderInput,
  Order,
} from '@gq/domain';

@Injectable()
export class PrismaOrderRepository implements OrderPersistencePort {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const db = this.prisma as unknown as { order: any };
    const order = await db.order.create({
      data: {
        customerId: input.customerId,
        orderNumber: `ORD-${Date.now()}`,
        status: 'PENDING',
        totalAmount: '0.00',
        prescriptionId: input.prescriptionId ?? null,
      },
    });
    return this.mapToDomain(order);
  }

  async findById(id: string): Promise<Order | null> {
    const db = this.prisma as unknown as { order: any };
    const order = await db.order.findUnique({ where: { id } });
    if (!order) return null;
    return this.mapToDomain(order);
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    const db = this.prisma as unknown as { order: any };
    const orders = await db.order.findMany({ where: { customerId } });
    return orders.map((o: any) => this.mapToDomain(o));
  }

  async confirm(input: ConfirmOrderInput): Promise<Order> {
    const db = this.prisma as unknown as { order: any };
    const order = await db.order.update({
      where: { id: input.orderId },
      data: { status: 'CONFIRMED' },
    });
    return this.mapToDomain(order);
  }

  async cancel(id: string): Promise<void> {
    const db = this.prisma as unknown as { order: any };
    await db.order.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  async updateStatus(id: string, status: Order['status']): Promise<void> {
    const db = this.prisma as unknown as { order: any };
    await db.order.update({ where: { id }, data: { status } });
  }

  private mapToDomain(o: any): Order {
    return {
      id: o.id,
      customerId: o.customerId,
      orderNumber: o.orderNumber,
      status: o.status,
      totalAmount: o.totalAmount,
      items: [],
      prescriptionId: o.prescriptionId,
      paymentId: o.paymentId,
      shipmentId: o.shipmentId,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }
}
