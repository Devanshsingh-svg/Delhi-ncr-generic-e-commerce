import { describe, it, expect } from 'vitest';
import { DomainError, FormulationFingerprintCollisionError, InsufficientStockError, ReservationLockTimeoutError, NtiHardBlockError, CombinationSplitError, FormularyCategoryMismatchError } from '../src/errors';

describe('Domain Errors', () => {
  it('DomainError has code/context', () => { const e = new DomainError('msg', 'CODE', { foo: 'bar' }); expect(e.code).toBe('CODE'); expect(e.context).toEqual({ foo: 'bar' }); });
  it('FormulationFingerprintCollisionError has existingFormulationId', () => { const e = new FormulationFingerprintCollisionError('collision', 'uuid-123'); expect(e.code).toBe('FORMULATION_FINGERPRINT_COLLISION'); expect(e.existingFormulationId).toBe('uuid-123'); });
  it('InsufficientStockError has context', () => { const e = new InsufficientStockError('not enough', { needed: 10, available: 5, formulationId: 'f1', darkStoreId: 'd1' }); expect(e.code).toBe('INSUFFICIENT_STOCK'); });
  it('ReservationLockTimeoutError', () => { const e = new ReservationLockTimeoutError('timeout'); expect(e.code).toBe('RESERVATION_LOCK_TIMEOUT'); });
  it('NtiHardBlockError', () => { const e = new NtiHardBlockError('warfarin', 'form-1'); expect(e.code).toBe('NTI_HARD_BLOCK'); expect(e.moleculeInn).toBe('warfarin'); expect(e.formulationId).toBe('form-1'); });
  it('CombinationSplitError', () => { const e = new CombinationSplitError('form-1', 3); expect(e.code).toBe('COMBINATION_SPLIT_BLOCKED'); expect(e.formulationId).toBe('form-1'); expect(e.ingredientCount).toBe(3); });
  it('FormularyCategoryMismatchError', () => { const e = new FormularyCategoryMismatchError('form-1', 'Analgesic', 'Antibiotic'); expect(e.code).toBe('MISMATCH_SUSPECTED'); expect(e.formulationId).toBe('form-1'); expect(e.recordedCategory).toBe('Analgesic'); expect(e.expectedCategory).toBe('Antibiotic'); });
});