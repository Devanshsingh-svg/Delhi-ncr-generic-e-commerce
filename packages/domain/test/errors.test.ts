import { describe, it, expect } from 'vitest';
import { DomainError, FormulationFingerprintCollisionError, InsufficientStockError, ReservationLockTimeoutError } from '../src/errors';

describe('Domain Errors', () => {
  it('DomainError has code/context', () => { const e = new DomainError('msg', 'CODE', { foo: 'bar' }); expect(e.code).toBe('CODE'); expect(e.context).toEqual({ foo: 'bar' }); });
  it('FormulationFingerprintCollisionError has existingFormulationId', () => { const e = new FormulationFingerprintCollisionError('collision', 'uuid-123'); expect(e.code).toBe('FORMULATION_FINGERPRINT_COLLISION'); expect(e.existingFormulationId).toBe('uuid-123'); });
  it('InsufficientStockError has context', () => { const e = new InsufficientStockError('not enough', { needed: 10, available: 5, formulationId: 'f1', darkStoreId: 'd1' }); expect(e.code).toBe('INSUFFICIENT_STOCK'); });
  it('ReservationLockTimeoutError', () => { const e = new ReservationLockTimeoutError('timeout'); expect(e.code).toBe('RESERVATION_LOCK_TIMEOUT'); });
});