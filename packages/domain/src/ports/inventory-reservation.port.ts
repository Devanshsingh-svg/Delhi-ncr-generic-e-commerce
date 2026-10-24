export interface InventoryBatchRecord {
  id: string;
  availableQty: number;
  reservedQty: number;
  expiryDate: Date;
  qualityReleaseStatus: string;
  darkStoreId: string;
  formulationId: string;
}

export interface StockReservationCreateInput {
  orderId: string;
  inventoryBatchId: string;
  formulationId: string;
  quantity: number;
  status: 'ACTIVE';
  reservedAt: Date;
  expiresAt: Date;
}

export const INVENTORY_RESERVATION_PORT_TOKEN = Symbol('INVENTORY_RESERVATION_PORT');

export abstract class InventoryReservationPort {
  abstract findEligibleBatches(params: {
    darkStoreId: string;
    formulationId: string;
    minExpiry: Date;
  }): Promise<InventoryBatchRecord[]>;
  abstract reserveBatches(allocations: { batchId: string; quantity: number }[]): Promise<void>;
  abstract createStockReservations(reservations: StockReservationCreateInput[]): Promise<void>;
  abstract acquireAdvisoryLock(key: bigint): Promise<void>;
}