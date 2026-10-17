import { describe, it, expect } from 'vitest';
import { matchCombinationAtomically, validateCombinationNotSplit } from '../src/matching/combination-matcher.service';
import { CombinationSplitError } from '../src/errors';

describe('Combination Matcher Service', () => {
  it('allows single-ingredient formulations', () => {
    const result = matchCombinationAtomically(1, 'form-1');
    expect(result.isCombination).toBe(false);
    expect(result.ingredientCount).toBe(1);
    expect(result.matchedAtomically).toBe(true);
  });

  it('blocks multi-ingredient formulations without allowSplit', () => {
    expect(() => matchCombinationAtomically(2, 'form-combo')).toThrow(CombinationSplitError);
    expect(() => matchCombinationAtomically(5, 'form-combo')).toThrow(CombinationSplitError);
  });

  it('allows multi-ingredient with allowSplit=true', () => {
    const result = matchCombinationAtomically(3, 'form-combo', true);
    expect(result.isCombination).toBe(true);
    expect(result.ingredientCount).toBe(3);
    expect(result.matchedAtomically).toBe(false);
  });

  it('validateCombinationNotSplit throws for combinations', () => {
    expect(() => validateCombinationNotSplit(2, 'form-combo')).toThrow(CombinationSplitError);
    expect(() => validateCombinationNotSplit(1, 'form-single')).not.toThrow();
  });

  it('CombinationSplitError has correct code and context', () => {
    const e = new CombinationSplitError('form-combo', 3);
    expect(e.code).toBe('COMBINATION_SPLIT_BLOCKED');
    expect(e.context).toEqual({ formulationId: 'form-combo', ingredientCount: 3 });
    expect(e.formulationId).toBe('form-combo');
    expect(e.ingredientCount).toBe(3);
  });
});
