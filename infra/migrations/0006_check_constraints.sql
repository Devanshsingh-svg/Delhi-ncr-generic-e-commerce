-- 0006_check_constraints.sql
-- InventoryBatch quantity invariant: availableQty >= 0 AND reservedQty >= 0

ALTER TABLE IF EXISTS inventory_batches
    ADD CONSTRAINT chk_inventory_batch_quantity_nonnegative
    CHECK (available_qty >= 0 AND reserved_qty >= 0);

ALTER TABLE IF EXISTS inventory_batches
    ADD CONSTRAINT chk_inventory_batch_reserved_not_exceed_available
    CHECK (reserved_qty <= available_qty);
