import { FormularyCategoryMismatchError } from '../errors';

// R11-1: Formulary categories are recorded as-given from the source
// document. When the recorded category does not match the expected
// clinical category, the formulation is flagged MISMATCH_SUSPECTED
// for pharmacist review.
//
// A11: Formulary categories recorded as-given, flagged MISMATCH_SUSPECTED.
export interface FormularyCategoryCheckResult {
  recordedCategory: string;
  expectedCategory: string;
  mismatch: boolean;
  flag: 'OK' | 'MISMATCH_SUSPECTED';
}

export function checkFormularyCategory(
  recordedCategory: string,
  expectedCategory: string,
  formulationId: string,
): FormularyCategoryCheckResult {
  const mismatch = recordedCategory.trim().toLowerCase() !== expectedCategory.trim().toLowerCase();
  const flag: 'OK' | 'MISMATCH_SUSPECTED' = mismatch ? 'MISMATCH_SUSPECTED' : 'OK';

  const result: FormularyCategoryCheckResult = {
    recordedCategory: recordedCategory.trim(),
    expectedCategory: expectedCategory.trim(),
    mismatch,
    flag,
  };

  if (mismatch) {
    throw new FormularyCategoryMismatchError(
      formulationId,
      result.recordedCategory,
      result.expectedCategory,
    );
  }

  return result;
}

export function recordFormularyCategoryAsGiven(
  category: string,
  formulationId: string,
): { category: string; formulationId: string } {
  // Categories are recorded exactly as given in the source document,
  // without normalization or validation against a reference list.
  return { category, formulationId };
}
