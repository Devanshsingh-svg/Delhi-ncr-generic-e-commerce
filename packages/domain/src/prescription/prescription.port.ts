import { Prescription, CreatePrescriptionInput, VerifyPrescriptionInput } from './prescription.entity';

export const PRESCRIPTION_REPOSITORY_TOKEN = Symbol('PRESCRIPTION_REPOSITORY');

export abstract class PrescriptionPersistencePort {
  abstract create(input: CreatePrescriptionInput): Promise<Prescription>;
  abstract findById(id: string): Promise<Prescription | null>;
  abstract findByCustomer(customerId: string): Promise<Prescription[]>;
  abstract verify(input: VerifyPrescriptionInput): Promise<Prescription>;
  abstract updateStatus(id: string, status: Prescription['status']): Promise<void>;
}
