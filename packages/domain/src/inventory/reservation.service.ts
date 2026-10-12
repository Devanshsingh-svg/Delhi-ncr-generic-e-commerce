import { InsufficientStockError, ReservationLockTimeoutError } from '../errors';
import { InventoryReservationPort, InventoryBatchRecord, StockReservationCreateInput } from '../ports/inventory-reservation.port';

// R8-3: Rewrite lock key cleanly using 64-bit integer from string hash
function advisoryLockKey(darkStoreId: string, formulationId: string): bigint {
  const combined = darkStoreId + ':' + formulationId;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  return (BigInt(hash & 0xffffffff) << 32n) | BigInt(Math.abs(hash) & 0xffffffff);
}

// R7-9: Check if error is a lock/serialization error worth retrying
function isLockError(e: unknown): boolean {
  if (e instanceof Error) {
    const msg = e.message.toLowerCase();
    return msg.includes('lock') || msg.includes('serialization') || msg.includes('deadlock') || msg.includes('could not serialize');
  }
  return false;
}

export class FefoReservationService {
  static async reserveStock(port: InventoryReservationPort, params: { orderId: string; darkStoreId: string; formulationId: string; quantity: number; minShelfLifeDays: number; }): Promise<Array<{ batchId: string; quantity: number; expiryDate: Date }>> {
    const lockKey = advisoryLockKey(params.darkStoreId, params.formulationId);
    const minExpiry = new Date(Date.now() + params.minShelfLifeDays * 86400000);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await port.acquireAdvisoryLock(lockKey);

        const batches = await port.findEligibleBatches({
          darkStoreId: params.darkStoreId,
          formulationId: params.formulationId,
          minExpiry,
        });

        let remaining = params.quantity;
        const allocations: Array<{ batchId: string; quantity: number; expiryDate: Date }> = [];

        for (const batch of batches) {
          if (remaining <= 0) break;
          const take = Math.min(batch.availableQty, remaining);
          allocations.push({ batchId: batch.id, quantity: take, expiryDate: batch.expiryDate });
          remaining -= take;
        }

        if (remaining > 0) {
          throw new InsufficientStockError(`Insufficient stock: need ${params.quantity}, available ${params.quantity - remaining}`);
        }

        await port.reserveBatches(allocations.map(a => ({ batchId: a.batchId, quantity: a.quantity })));

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
        await port.createStockReservations(allocations.map(a => ({
          orderId: params.orderId,
          inventoryBatchId: a.batchId,
          quantity: a.quantity,
          status: 'ACTIVE' as const,
          reservedAt: now,
          expiresAt,
        })));

        return allocations;
      } catch (e) {
        if (e instanceof InsufficientStockError) throw e;
        if (!isLockError(e)) throw e; // R7-9: propagate non-lock errors
        if (attempt === 3) throw new ReservationLockTimeoutError('Could not acquire reservation lock after 3 attempts');
        await new Promise(r => setTimeout(r, 50 * attempt));
      }
    }
    throw new ReservationLockTimeoutError('Unexpected exit from retry loop');
  }
}