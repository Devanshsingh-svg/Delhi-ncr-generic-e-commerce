/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';

import {
  InventoryReservationPort,
  InventoryBatchRecord,
  StockReservationCreateInput,
} from '@gq/domain';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaInventoryRepository implements InventoryReservationPort {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async findEligibleBatches(params: {
    darkStoreId: string;
    formulationId: string;
    minExpiry: Date;
  }): Promise<InventoryBatchRecord[]> {
    const db = this.prisma as unknown as { inventoryBatch: any };
    const batches = await db.inventoryBatch.findMany({
      where: {
        darkStoreId: params.darkStoreId,
        formulationId: params.formulationId,
        expiryDate: { gte: params.minExpiry },
        availableQty: { gt: 0 },
      },
      orderBy: { expiryDate: 'asc' },
    });

    return batches.map((b: any) => ({
      id: b.id,
      availableQty: b.availableQty,
      reservedQty: b.reservedQty,
      expiryDate: b.expiryDate,
      // qualityReleaseStatus is not tracked by the sealed Phase 2 schema
      qualityReleaseStatus: 'RELEASED',
      darkStoreId: b.darkStoreId,
      formulationId: b.formulationId,
    }));
  }

  async reserveBatches(allocations: { batchId: string; quantity: number }[]): Promise<void> {
    const db = this.prisma as unknown as { inventoryBatch: any };
    for (const allocation of allocations) {
      await db.inventoryBatch.update({
        where: { id: allocation.batchId },
        data: {
          reservedQty: { increment: allocation.quantity },
          availableQty: { decrement: allocation.quantity },
        },
      });
    }
  }

  async createStockReservations(reservations: StockReservationCreateInput[]): Promise<void> {
    const db = this.prisma as unknown as { stockReservation: any };
    // orderId and reservedAt have no columns in the sealed Phase 2 schema;
    // the order linkage lands with the Phase 5 reservation migration.
    await db.stockReservation.createMany({
      data: reservations.map(r => ({
        inventoryBatchId: r.inventoryBatchId,
        formulationId: r.formulationId,
        quantity: r.quantity,
        status: r.status,
        expiresAt: r.expiresAt,
      })),
    });
  }

  async acquireAdvisoryLock(key: bigint): Promise<void> {
    const db = this.prisma as unknown as { $executeRaw: any };
    await db.$executeRaw`SELECT pg_advisory_xact_lock(${key})`;
  }
}