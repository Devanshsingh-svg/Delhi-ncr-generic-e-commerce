import { DomainError } from '@gq/contracts';

export class CytotoxicDrugNotFoundError extends DomainError {
  constructor(formulationId: string) {
    super(`Cytotoxic drug not found: ${formulationId}`, 'CYTOTOXIC_DRUG_NOT_FOUND', { formulationId });
    this.name = 'CytotoxicDrugNotFoundError';
  }
}

export class CytotoxicHandlingValidationError extends DomainError {
  constructor(formulationId: string, field: string, reason: string) {
    super(`Cytotoxic handling validation failed for ${formulationId}: ${field} - ${reason}`, 'CYTOTOXIC_HANDLING_VALIDATION_ERROR', { formulationId, field, reason });
    this.name = 'CytotoxicHandlingValidationError';
  }
}

export class CytotoxicStorageConflictError extends DomainError {
  constructor(formulationId: string, conflictType: string) {
    super(`Cytotoxic storage conflict for ${formulationId}: ${conflictType}`, 'CYTOTOXIC_STORAGE_CONFLICT', { formulationId, conflictType });
    this.name = 'CytotoxicStorageConflictError';
  }
}
