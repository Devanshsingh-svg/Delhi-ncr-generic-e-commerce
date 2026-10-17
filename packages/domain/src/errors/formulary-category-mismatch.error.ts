import { DomainError } from '@gq/contracts';

export class FormularyCategoryMismatchError extends DomainError {
  constructor(public readonly formulationId: string, public readonly recordedCategory: string, public readonly expectedCategory: string) {
    super(
      `Formulary category mismatch: formulation "${formulationId}" recorded as "${recordedCategory}" but expected "${expectedCategory}"`,
      'MISMATCH_SUSPECTED',
      { formulationId, recordedCategory, expectedCategory },
    );
  }
}
