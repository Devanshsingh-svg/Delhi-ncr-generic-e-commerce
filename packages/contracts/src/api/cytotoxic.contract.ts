import { z } from 'zod';

export const CytotoxicHandlingSchema = z.object({
  ppeRequired: z.boolean(),
  segregatedStorage: z.boolean(),
  pregnantWomanHandling: z.boolean(),
});
export type CytotoxicHandlingInput = z.infer<typeof CytotoxicHandlingSchema>;

export const CreateCytotoxicDrugRequestSchema = z.object({
  formulationId: z.string().uuid(),
  cytotoxicHandling: CytotoxicHandlingSchema,
  specialStorageRequired: z.boolean(),
  handlingRestrictions: z.array(z.string().min(1).max(100)),
});
export type CreateCytotoxicDrugRequest = z.infer<typeof CreateCytotoxicDrugRequestSchema>;

export const UpdateCytotoxicHandlingRequestSchema = z.object({
  cytotoxicHandling: CytotoxicHandlingSchema,
});
export type UpdateCytotoxicHandlingRequest = z.infer<typeof UpdateCytotoxicHandlingRequestSchema>;

export const CytotoxicDrugResponseSchema = z.object({
  id: z.string().uuid(),
  formulationId: z.string().uuid(),
  cytotoxicHandling: CytotoxicHandlingSchema,
  specialStorageRequired: z.boolean(),
  handlingRestrictions: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CytotoxicDrugResponse = z.infer<typeof CytotoxicDrugResponseSchema>;

export const CytotoxicHandlingValidationResponseSchema = z.object({
  formulationId: z.string().uuid(),
  valid: z.boolean(),
  handlingLevel: z.enum(['STANDARD', 'ELEVATED', 'MAXIMUM']),
  restrictions: z.array(z.string()),
});
export type CytotoxicHandlingValidationResponse = z.infer<typeof CytotoxicHandlingValidationResponseSchema>;
