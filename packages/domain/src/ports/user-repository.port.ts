export interface UserRecord { id: string; email: string; phone: string; fullName: string; dateOfBirth: Date | null; roles: string[]; mfaEnabled: boolean; isActive: boolean; createdAt: Date; updatedAt: Date; }
export interface UserRecordWithSecrets extends UserRecord { passwordHash: string; mfaSecret: string | null; mfaBackupCodes: string[]; }
export interface CreateUserInput { email: string; phone: string; passwordHash: string; fullName: string; dateOfBirth: Date | null; roles: string[]; }
export interface RefreshTokenRecord { id: string; userId: string; token: string; expiresAt: Date; revoked: boolean; userAgent: string | null; ipAddress: string | null; createdAt: Date; }

export abstract class UserRepository {
  abstract findByEmailOrPhone(identifier: { email?: string; phone?: string }): Promise<UserRecordWithSecrets | null>;
  abstract findById(id: string): Promise<UserRecord | null>;
  abstract create(input: CreateUserInput): Promise<UserRecord>;
  abstract updateMfa(userId: string, secret: string, backupCodes: string[]): Promise<void>;
  abstract enableMfa(userId: string): Promise<void>;
  abstract findRefreshToken(token: string): Promise<RefreshTokenRecord | null>;
  abstract storeRefreshToken(userId: string, token: string, expiresAt: Date, userAgent?: string, ipAddress?: string): Promise<void>;
  abstract revokeRefreshToken(token: string): Promise<void>;
  abstract revokeAllUserRefreshTokens(userId: string): Promise<void>;
  abstract getMfaSecret(userId: string): Promise<string | null>;
}

export const USER_REPOSITORY_TOKEN = Symbol('USER_REPOSITORY');