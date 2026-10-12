# ADR 0003: Batch Assignment at Reservation (Checkout), Not Cart
**Date:** 2026-10-12 **Status:** Accepted
## Context
CartItem PK included batch_id in Phase 0 draft, implying batch reservation at add-to-cart.
## Decision
CartItem PK = (cart_id, formulation_id). No batch_id. Batch assignment happens in StockReservation at checkout → reservation.
## Rationale
- Cart is intent, not commitment; inventory changes between add-to-cart and checkout
- FEFO requires current inventory snapshot at reservation time
- Allows cart persistence across sessions without locking inventory
- DPDP erasure: cart deletion doesn't touch inventory