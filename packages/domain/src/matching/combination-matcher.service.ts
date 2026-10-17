import { CombinationSplitError } from '../errors';

// R9-1: Combination products must be matched atomically, never split.
// A formulation with multiple active ingredients is a combination product
// and must be reserved/dispensed as a single unit.
export interface CombinationMatchResult {
  isCombination: boolean;
  ingredientCount: number;
  matchedAtomically: boolean;
}

export function matchCombinationAtomically(
  ingredientCount: number,
  formulationId: string,
  allowSplit = false,
): CombinationMatchResult {
  const isCombination = ingredientCount > 1;

  if (isCombination && !allowSplit) {
    throw new CombinationSplitError(formulationId, ingredientCount);
  }

  return {
    isCombination,
    ingredientCount,
    matchedAtomically: !isCombination || !allowSplit,
  };
}

export function validateCombinationNotSplit(
  ingredientCount: number,
  formulationId: string,
): void {
  if (ingredientCount > 1) {
    throw new CombinationSplitError(formulationId, ingredientCount);
  }
}
