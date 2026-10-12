import { z } from 'zod';

export const HealthResponseSchema = z.object({ status: z.enum(['ok', 'degraded', 'down']), timestamp: z.string().datetime(), version: z.string(), checks: z.array(z.object({ name: z.string(), status: z.enum(['ok', 'degraded', 'down']), latencyMs: z.number().int().nonnegative().optional(), details: z.record(z.unknown()).optional() })) });
export type HealthResponse = z.infer<typeof HealthResponseSchema>;