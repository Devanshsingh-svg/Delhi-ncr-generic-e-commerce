import { describe, it, expect } from 'vitest';
import { checkFormularyCategory, recordFormularyCategoryAsGiven } from '../src/matching/formulary-category.service';
import { FormularyCategoryMismatchError } from '../src/errors';

describe('Formulary Category Service', () => {
  it('returns OK when categories match', () => {
    const result = checkFormularyCategory('Analgesic', 'Analgesic', 'form-1');
    expect(result.mismatch).toBe(false);
    expect(result.flag).toBe('OK');
    expect(result.recordedCategory).toBe('Analgesic');
    expect(result.expectedCategory).toBe('Analgesic');
  });

  it('flags MISMATCH_SUSPECTED when categories differ', () => {
    expect(() => checkFormularyCategory('Analgesic', 'Antibiotic', 'form-1')).toThrow(FormularyCategoryMismatchError);
  });

  it('is case-insensitive and trims whitespace', () => {
    const result = checkFormularyCategory('  Analgesic  ', 'analgesic', 'form-1');
    expect(result.mismatch).toBe(false);
    expect(result.flag).toBe('OK');
  });

  it('recordFormularyCategoryAsGiven records category as-is', () => {
    const result = recordFormularyCategoryAsGiven('Analgesic / Pain Relief', 'form-1');
    expect(result.category).toBe('Analgesic / Pain Relief');
    expect(result.formulationId).toBe('form-1');
  });

  it('FormularyCategoryMismatchError has correct code and context', () => {
    const e = new FormularyCategoryMismatchError('form-1', 'Analgesic', 'Antibiotic');
    expect(e.code).toBe('MISMATCH_SUSPECTED');
    expect(e.context).toEqual({ formulationId: 'form-1', recordedCategory: 'Analgesic', expectedCategory: 'Antibiotic' });
    expect(e.formulationId).toBe('form-1');
    expect(e.recordedCategory).toBe('Analgesic');
    expect(e.expectedCategory).toBe('Antibiotic');
  });
});
