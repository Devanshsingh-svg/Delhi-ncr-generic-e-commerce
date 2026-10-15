import { UserRepository, UserRecord, UserRecordWithSecrets, RefreshTokenRecord } from './user-repository.port';

export class AuthPersistenceNotConfiguredError extends Error { constructor() { super('Auth persistence not configured. UserRepository not implemented. See Phase 2 for Prisma implementation.'); this.name = 'AuthPersistenceNotConfiguredError'; } }

export class NotConfiguredUserRepository extends UserRepository {
  private fail(): never { throw new AuthPersistenceNotConfiguredError(); }
  async findByEmailOrPhone(): Promise<UserRecordWithSecrets | null> { return this.fail(); }
  async findById(): Promise<UserRecord | null> { return this.fail(); }
  async create(): Promise<UserRecord> { return this.fail(); }
  async updateMfa(): Promise<void> { return this.fail(); }
  async enableMfa(): Promise<void> { return this.fail(); }
  async findRefreshToken(): Promise<RefreshTokenRecord | null> { return this.fail(); }
  async storeRefreshToken(): Promise<void> { return this.fail(); }
  async revokeRefreshToken(): Promise<void> { return this.fail(); }
  async revokeAllUserRefreshTokens(): Promise<void> { return this.fail(); }
  async getMfaSecret(): Promise<string | null> { return this.fail(); }
}