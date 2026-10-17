import { DomainError } from '@gq/contracts';

export class NtiHardBlockError extends DomainError {
  constructor(public readonly moleculeInn: string, public readonly formulationId: string) {
    super(
      `NTI hard-block: molecule "${moleculeInn}" is narrow-therapeutic-index and cannot be dispensed`,
      'NTI_HARD_BLOCK',
      { moleculeInn, formulationId },
    );
  }
}
