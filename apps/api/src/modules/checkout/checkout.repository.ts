/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';

import {
  CheckoutPersistencePort,
  CheckoutRecord,
  PaymentIntent,
  CreatePaymentIntentInput,
  CheckoutStatus,
} from '@gq/domain';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaCheckoutRepository implements CheckoutPersistencePort {
  private readonly prisma: PrismaService;
  private readonly checkouts = new Map<string, CheckoutRecord>();
  private readonly paymentIntents = new Map<string, PaymentIntent>();

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async create(input: {
    customerId: string;
    cartId: string;
    darkStoreId: string;
    paymentMethod: string;
    idempotencyKey: string;
  }): Promise<CheckoutRecord> {
    const db = this.prisma as unknown as { idempotencyRecord: any };

    await db.idempotencyRecord.create({
      data: {
        key: input.idempotencyKey,
        status: CheckoutStatus.PENDING,
      },
    });

    const record: CheckoutRecord = {
      id: input.idempotencyKey,
      customerId: input.customerId,
      cartId: input.cartId,
      darkStoreId: input.darkStoreId,
      paymentMethod: input.paymentMethod,
      idempotencyKey: input.idempotencyKey,
      status: CheckoutStatus.PENDING,
      orderId: null,
      paymentIntentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.checkouts.set(record.id, record);
    return record;
  }

  async findById(id: string): Promise<CheckoutRecord | null> {
    return this.checkouts.get(id) ?? null;
  }

  async findByIdempotencyKey(key: string): Promise<CheckoutRecord | null> {
    const db = this.prisma as unknown as { idempotencyRecord: any };
    const record = await db.idempotencyRecord.findUnique({
      where: { key },
    });

    if (!record) return null;

    return this.checkouts.get(key) ?? {
      id: key,
      customerId: '',
      cartId: '',
      darkStoreId: '',
      paymentMethod: '',
      idempotencyKey: key,
      status: record.status as CheckoutStatus,
      orderId: null,
      paymentIntentId: null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async updateStatus(id: string, status: CheckoutStatus): Promise<void> {
    const db = this.prisma as unknown as { idempotencyRecord: any };
    await db.idempotencyRecord.update({
      where: { key: id },
      data: { status },
    });

    const checkout = this.checkouts.get(id);
    if (checkout) {
      checkout.status = status;
      checkout.updatedAt = new Date();
    }
  }

  async complete(id: string, orderId: string, paymentIntentId: string): Promise<void> {
    const db = this.prisma as unknown as { idempotencyRecord: any };
    await db.idempotencyRecord.update({
      where: { key: id },
      data: { status: CheckoutStatus.COMPLETED },
    });

    const checkout = this.checkouts.get(id);
    if (checkout) {
      checkout.status = CheckoutStatus.COMPLETED;
      checkout.orderId = orderId;
      checkout.paymentIntentId = paymentIntentId;
      checkout.updatedAt = new Date();
    }
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      amount: input.amount,
      currency: input.currency,
      status: 'REQUIRES_PAYMENT_METHOD',
      paymentMethod: input.paymentMethod,
      metadata: input.metadata,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };

    this.paymentIntents.set(paymentIntent.id, paymentIntent);
    return paymentIntent;
  }

  async findPaymentIntent(id: string): Promise<PaymentIntent | null> {
    return this.paymentIntents.get(id) ?? null;
  }

  async updatePaymentIntentStatus(id: string, status: PaymentIntent['status']): Promise<void> {
    const pi = this.paymentIntents.get(id);
    if (pi) {
      pi.status = status;
    }
  }
}