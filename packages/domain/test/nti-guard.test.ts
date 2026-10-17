import { describe, it, expect } from 'vitest';
import { checkNtiHardBlock, isNtiMolecule } from '../src/matching/nti-guard.service';
import { NtiHardBlockError } from '../src/errors';

describe('NTI Guard Service', () => {
  it('allows non-NTI molecules', () => {
    const result = checkNtiHardBlock(['paracetamol', 'ibuprofen'], 'form-1');
    expect(result.blocked).toBe(false);
    expect(result.blockedMolecules).toEqual([]);
  });

  it('blocks NTI molecules', () => {
    expect(() => checkNtiHardBlock(['warfarin', 'paracetamol'], 'form-1')).toThrow(NtiHardBlockError);
    expect(() => checkNtiHardBlock(['paracetamol', 'WARFARIN'], 'form-1')).toThrow(NtiHardBlockError);
  });

  it('blocks all NTI list molecules', () => {
    const ntiInns = ['warfarin', 'phenytoin', 'lithium', 'carbamazepine', 'digoxin'];
    for (const inn of ntiInns) {
      expect(() => checkNtiHardBlock([inn], 'form-1')).toThrow(NtiHardBlockError);
    }
  });

  it('isNtiMolecule returns true for NTI inns', () => {
    expect(isNtiMolecule('warfarin')).toBe(true);
    expect(isNtiMolecule('WARFARIN')).toBe(true);
    expect(isNtiMolecule('paracetamol')).toBe(false);
  });

  it('NtiHardBlockError has correct code and context', () => {
    const e = new NtiHardBlockError('warfarin', 'form-123');
    expect(e.code).toBe('NTI_HARD_BLOCK');
    expect(e.context).toEqual({ moleculeInn: 'warfarin', formulationId: 'form-123' });
    expect(e.moleculeInn).toBe('warfarin');
    expect(e.formulationId).toBe('form-123');
  });
});
