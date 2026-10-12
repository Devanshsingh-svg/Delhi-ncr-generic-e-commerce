import { z } from 'zod';

export const RegisterRequestSchema = z.object({ email: z.string().email().max(255), phone: z.string().regex(/^\+91\d{10}$/), password: z.string().min(8).max(128), fullName: z.string().min(1).max(100), dateOfBirth: z.string().date().optional() });
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({ identifier: z.string().min(1).max(255), password: z.string().min(1).max(128), rememberMe: z.boolean().default(false) });
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RefreshRequestSchema = z.object({ refreshToken: z.string().min(1) });
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

export const AuthResponseSchema = z.object({ accessToken: z.string(), refreshToken: z.string(), expiresIn: z.number().int().positive(), tokenType: z.literal('Bearer'), user: z.object({ id: z.string().uuid(), email: z.string().email(), phone: z.string(), fullName: z.string(), roles: z.array(z.string()), mfaEnabled: z.boolean() }) });
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const UserProfileSchema = z.object({ id: z.string().uuid(), email: z.string().email(), phone: z.string(), fullName: z.string(), dateOfBirth: z.string().date().nullable(), roles: z.array(z.string()), mfaEnabled: z.boolean(), createdAt: z.string().datetime(), updatedAt: z.string().datetime() });
export type UserProfile = z.infer<typeof UserProfileSchema>;