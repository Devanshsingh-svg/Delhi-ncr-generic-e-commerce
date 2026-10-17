import { Prescription, CreatePrescriptionInput, VerifyPrescriptionInput } from './prescription.entity';

export abstract class PrescriptionPersistencePort {
  abstract create(input: CreatePrescriptionInput): Promise<Prescription>;
  abstract findById(id: string): Promise<Prescription | null>;
  abstract findByCustomer(customerId: string): Promise<Prescription[]>;
  abstract verify(input: VerifyPrescriptionInput): Promise<Prescription>;
  abstract updateStatus(id: string, status: Prescription['status']): Promise<void>;
}
