import {
  Prescription,
  CreatePrescriptionInput,
  VerifyPrescriptionInput,
  PrescriptionStatus,
} from './prescription.entity';
import {
  PrescriptionExpiredError,
  PrescriptionInvalidError,
  PrescriptionAlreadyVerifiedError,
  PrescriptionAlreadyRejectedError,
  PharmacistNotAuthorizedError,
  PrescriptionNotFoundError,
} from './prescription.errors';
import { PrescriptionPersistencePort } from './prescription.port';

export interface PrescriptionValidationResult {
  valid: boolean;
  reason: string | null;
}

export class PrescriptionService {
  private readonly port: PrescriptionPersistencePort;

  constructor(port: PrescriptionPersistencePort) {
    this.port = port;
  }

  async validateForDispense(prescriptionId: string): Promise<PrescriptionValidationResult> {
    const prescription = await this.port.findById(prescriptionId);
    if (!prescription) {
      return { valid: false, reason: 'Prescription not found' };
    }

    if (prescription.status === PrescriptionStatus.REJECTED) {
      return { valid: false, reason: 'Prescription rejected' };
    }

    if (prescription.status === PrescriptionStatus.EXPIRED) {
      return { valid: false, reason: 'Prescription expired' };
    }

    if (prescription.status === PrescriptionStatus.ACTIVE) {
      if (prescription.expiresAt && new Date() > prescription.expiresAt) {
        return { valid: false, reason: 'Prescription past validity window' };
      }
      return { valid: true, reason: null };
    }

    if (prescription.status === PrescriptionStatus.VERIFIED) {
      if (prescription.expiresAt && new Date() > prescription.expiresAt) {
        return { valid: false, reason: 'Prescription past validity window' };
      }
      return { valid: true, reason: null };
    }

    return { valid: false, reason: 'Unknown prescription status' };
  }

  async create(input: CreatePrescriptionInput): Promise<Prescription> {
    if (input.expiresAt <= input.issuedAt) {
      throw new PrescriptionInvalidError('', 'Expiry must be after issue date');
    }

    return this.port.create(input);
  }

  async verify(input: VerifyPrescriptionInput): Promise<Prescription> {
    const prescription = await this.port.findById(input.prescriptionId);
    if (!prescription) {
      throw new PrescriptionNotFoundError(input.prescriptionId);
    }

    if (prescription.status === PrescriptionStatus.VERIFIED) {
      throw new PrescriptionAlreadyVerifiedError(input.prescriptionId);
    }

    if (prescription.status === PrescriptionStatus.REJECTED) {
      throw new PrescriptionAlreadyRejectedError(input.prescriptionId);
    }

    if (prescription.status === PrescriptionStatus.EXPIRED) {
      throw new PrescriptionExpiredError(input.prescriptionId, prescription.expiresAt);
    }

    if (!input.pharmacistId) {
      throw new PharmacistNotAuthorizedError(input.pharmacistId);
    }

    return this.port.verify({
      prescriptionId: input.prescriptionId,
      pharmacistId: input.pharmacistId,
      decision: input.decision,
      notes: input.notes,
    });
  }
}
