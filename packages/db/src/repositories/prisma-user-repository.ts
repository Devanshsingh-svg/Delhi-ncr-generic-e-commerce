import { PrismaClient } from '@prisma/client';

import {
  UserRepository,
  UserRecord,
  UserRecordWithSecrets,
  CreateUserInput,
  RefreshTokenRecord,
  USER_REPOSITORY_TOKEN,
} from '@gq/domain';

export class PrismaUserRepository extends UserRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    super();
    this.prisma = prisma ?? new PrismaClient();
  }

  async findByEmailOrPhone(identifier: { email?: string; phone?: string }): Promise<UserRecordWithSecrets | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          identifier.email ? { email: identifier.email } : {},
          identifier.phone ? { phone: identifier.phone } : {},
        ].filter((condition) => Object.keys(condition).length > 0),
      },
    });
    if (!user) return null;
    return this.mapToRecordWithSecrets(user);
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.mapToRecord(user);
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        phone: input.phone,
        passwordHash: input.passwordHash,
        fullName: input.fullName,
        dateOfBirth: input.dateOfBirth,
        roles: input.roles,
      },
    });
    return this.mapToRecord(user);
  }

  async updateMfa(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret, mfaBackupCodes: backupCodes, mfaEnabled: true },
    });
  }

  async enableMfa(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshTokenRecord | null> {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored) return null;
    return this.mapToRefreshTokenRecord(stored);
  }

  async storeRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        userAgent,
        ipAddress,
        revoked: false,
      },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async getMfaSecret(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { mfaSecret: true },
    });
    return user?.mfaSecret ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma record mapped to domain type
  private mapToRecord(user: any): UserRecord {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      dateOfBirth: user.dateOfBirth,
      roles: user.roles,
      mfaEnabled: user.mfaEnabled,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma record mapped to domain type
  private mapToRecordWithSecrets(user: any): UserRecordWithSecrets {
    return {
      ...this.mapToRecord(user),
      passwordHash: user.passwordHash,
      mfaSecret: user.mfaSecret,
      mfaBackupCodes: user.mfaBackupCodes,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma record mapped to domain type
  private mapToRefreshTokenRecord(stored: any): RefreshTokenRecord {
    return {
      id: stored.id,
      userId: stored.userId,
      token: stored.token,
      expiresAt: stored.expiresAt,
      revoked: stored.revoked,
      userAgent: stored.userAgent,
      ipAddress: stored.ipAddress,
      createdAt: stored.createdAt,
    };
  }
}

export { USER_REPOSITORY_TOKEN };
