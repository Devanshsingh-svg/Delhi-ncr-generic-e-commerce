export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  formulationId: string;
  quantity: number;
}

export interface Prescription {
  id: string;
  customerId: string;
  rxNumber: string;
  prescriber: string;
  issuedAt: Date;
  expiresAt: Date;
  status: 'ACTIVE' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  pharmacistId: string | null;
  reviewedAt: Date | null;
  items: PrescriptionItem[];
}

export interface CreatePrescriptionInput {
  customerId: string;
  prescriber: string;
  issuedAt: Date;
  expiresAt: Date;
  items: {
    formulationId: string;
    quantity: number;
  }[];
}

export interface VerifyPrescriptionInput {
  prescriptionId: string;
  pharmacistId: string;
  decision: 'VERIFIED' | 'REJECTED';
  notes: string | null;
}

export enum PrescriptionStatus {
  ACTIVE = 'ACTIVE',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}
