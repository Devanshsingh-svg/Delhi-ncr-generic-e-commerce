import { z } from 'zod';

export const FormulationFingerprintSchema = z.string().length(64).regex(/^[0-9a-f]{64}$/);
export type FormulationFingerprint = z.infer<typeof FormulationFingerprintSchema>;

export const CanonicalFormulationSchema = z.object({
  schemaVersion: z.number().int().positive(),
  dosageForm: z.string().min(1),
  route: z.string().min(1),
  releaseType: z.string().nullable(),
  ingredients: z.array(z.object({ ingredientInn: z.string().min(1), strengthValue: z.string().regex(/^\d+(\.\d+)?$/), strengthUnit: z.enum(['mg', 'mcg', 'µg', 'g', 'IU', 'ml', '%']), concentrationDenominator: z.string().nullable() })).min(1),
});

export type CanonicalFormulation = z.infer<typeof CanonicalFormulationSchema>;

export function isValidFingerprint(fp: string): fp is FormulationFingerprint { return FormulationFingerprintSchema.safeParse(fp).success; }