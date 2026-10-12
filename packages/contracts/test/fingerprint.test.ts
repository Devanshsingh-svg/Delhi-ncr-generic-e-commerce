import { describe, it, expect } from 'vitest';
import { isValidFingerprint, CanonicalFormulationSchema } from '../src/domain/fingerprint';

describe('FormulationFingerprint', () => {
  it('accepts 64-char hex', () => expect(isValidFingerprint('a'.repeat(64))).toBe(true));
  it('rejects non-hex', () => expect(isValidFingerprint('g'.repeat(64))).toBe(false));
  it('rejects wrong length', () => { expect(isValidFingerprint('a'.repeat(63))).toBe(false); expect(isValidFingerprint('a'.repeat(65))).toBe(false); });
  it('validates CanonicalFormulationSchema', () => { const v = { schemaVersion: 1, dosageForm: 'TABLET', route: 'ORAL', releaseType: 'SR', ingredients: [{ ingredientInn: 'paracetamol', strengthValue: '500', strengthUnit: 'mg', concentrationDenominator: null }] }; expect(CanonicalFormulationSchema.safeParse(v).success).toBe(true); });
});