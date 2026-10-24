import { z } from 'zod';

export const CatalogItemResponseSchema = z.object({
  formulationId: z.string().uuid(),
  brandName: z.string().min(1),
  moleculeInn: z.string().min(1),
  dosageForm: z.string().min(1),
  strength: z.string().min(1),
  releaseType: z.string().min(1),
  manufacturerName: z.string().min(1),
  regulatoryCode: z.string().min(1),
  regulatoryLabel: z.string().min(1),
  availableQty: z.number().int().nonnegative(),
  isTopSeller: z.boolean(),
  mrp: z.number().nullable(),
  altBrandName: z.string().nullable(),
  altMrp: z.number().nullable(),
  altEstimated: z.boolean(),
  savingsPct: z.number().nullable(),
});
export type CatalogItemResponse = z.infer<typeof CatalogItemResponseSchema>;

export const CatalogItemsResponseSchema = z.array(CatalogItemResponseSchema);
export type CatalogItemsResponse = z.infer<typeof CatalogItemsResponseSchema>;