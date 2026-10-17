import { z } from 'zod';

export const PrescriptionItemInputSchema = z.object({
  formulationId: z.string().uuid(),
  quantity: z.number().int().positive(),
});
export type PrescriptionItemInput = z.infer<typeof PrescriptionItemInputSchema>;

export const CreatePrescriptionRequestSchema = z.object({
  customerId: z.string().uuid(),
  prescriber: z.string().min(1).max(255),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  items: z.array(PrescriptionItemInputSchema).min(1),
});
export type CreatePrescriptionRequest = z.infer<typeof CreatePrescriptionRequestSchema>;

export const VerifyPrescriptionRequestSchema = z.object({
  pharmacistId: z.string().uuid(),
  decision: z.enum(['VERIFIED', 'REJECTED']),
  notes: z.string().max(1000).nullable(),
});
export type VerifyPrescriptionRequest = z.infer<typeof VerifyPrescriptionRequestSchema>;

export const PrescriptionResponseSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  rxNumber: z.string(),
  prescriber: z.string(),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  status: z.enum(['ACTIVE', 'VERIFIED', 'REJECTED', 'EXPIRED']),
  pharmacistId: z.string().uuid().nullable(),
  reviewedAt: z.string().datetime().nullable(),
});
export type PrescriptionResponse = z.infer<typeof PrescriptionResponseSchema>;

export const PrescriptionValidationResponseSchema = z.object({
  prescriptionId: z.string().uuid(),
  valid: z.boolean(),
  reason: z.string().nullable(),
});
export type PrescriptionValidationResponse = z.infer<typeof PrescriptionValidationResponseSchema>;
