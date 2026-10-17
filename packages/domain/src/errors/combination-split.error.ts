import { DomainError } from '@gq/contracts';

export class CombinationSplitError extends DomainError {
  constructor(public readonly formulationId: string, public readonly ingredientCount: number) {
    super(
      `Combination product cannot be split: formulation "${formulationId}" has ${ingredientCount} ingredients and must be matched atomically`,
      'COMBINATION_SPLIT_BLOCKED',
      { formulationId, ingredientCount },
    );
  }
}
