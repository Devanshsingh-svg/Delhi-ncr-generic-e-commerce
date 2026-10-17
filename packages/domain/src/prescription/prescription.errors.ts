import { DomainError } from '@gq/contracts';

export class PrescriptionNotFoundError extends DomainError {
  constructor(prescriptionId: string) {
    super(`Prescription not found: ${prescriptionId}`, 'PRESCRIPTION_NOT_FOUND', { prescriptionId });
    this.name = 'PrescriptionNotFoundError';
  }
}

export class PrescriptionExpiredError extends DomainError {
  constructor(prescriptionId: string, validUntil: Date) {
    super(`Prescription expired: ${prescriptionId} (valid until ${validUntil.toISOString()})`, 'PRESCRIPTION_EXPIRED', { prescriptionId, validUntil });
    this.name = 'PrescriptionExpiredError';
  }
}

export class PrescriptionInvalidError extends DomainError {
  constructor(prescriptionId: string, reason: string) {
    super(`Invalid prescription: ${prescriptionId} - ${reason}`, 'PRESCRIPTION_INVALID', { prescriptionId, reason });
    this.name = 'PrescriptionInvalidError';
  }
}

export class PrescriptionAlreadyVerifiedError extends DomainError {
  constructor(prescriptionId: string) {
    super(`Prescription already verified: ${prescriptionId}`, 'PRESCRIPTION_ALREADY_VERIFIED', { prescriptionId });
    this.name = 'PrescriptionAlreadyVerifiedError';
  }
}

export class PrescriptionAlreadyRejectedError extends DomainError {
  constructor(prescriptionId: string) {
    super(`Prescription already rejected: ${prescriptionId}`, 'PRESCRIPTION_ALREADY_REJECTED', { prescriptionId });
    this.name = 'PrescriptionAlreadyRejectedError';
  }
}

export class PharmacistNotAuthorizedError extends DomainError {
  constructor(pharmacistId: string) {
    super(`Pharmacist not authorized: ${pharmacistId}`, 'PHARMACIST_NOT_AUTHORIZED', { pharmacistId });
    this.name = 'PharmacistNotAuthorizedError';
  }
}
