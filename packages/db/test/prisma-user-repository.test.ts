import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaUserRepository } from '../src/repositories/prisma-user-repository';
import { USER_REPOSITORY_TOKEN } from '../src/repositories/prisma-user-repository';

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  })),
}));

const makeMockPrisma = () => ({
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  refreshToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
});

describe('PrismaUserRepository', () => {
  let repo: PrismaUserRepository;
  let prisma: ReturnType<typeof makeMockPrisma>;

  beforeEach(() => {
    prisma = makeMockPrisma();
    repo = new PrismaUserRepository(prisma as any);
  });

  it('USER_REPOSITORY_TOKEN is a Symbol', () => {
    expect(typeof USER_REPOSITORY_TOKEN).toBe('symbol');
  });

  describe('findById', () => {
    it('returns null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const result = await repo.findById('unknown-id');
      expect(result).toBeNull();
    });

    it('returns mapped UserRecord when found', async () => {
      const now = new Date();
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        phone: '+919999999999',
        passwordHash: 'hash',
        fullName: 'A B',
        dateOfBirth: null,
        roles: ['customer'],
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      const result = await repo.findById('user-1');
      expect(result).toEqual({
        id: 'user-1',
        email: 'a@b.com',
        phone: '+919999999999',
        fullName: 'A B',
        dateOfBirth: null,
        roles: ['customer'],
        mfaEnabled: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('mfaSecret');
    });
  });

  describe('findByEmailOrPhone', () => {
    it('returns null when no user matches', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const result = await repo.findByEmailOrPhone({ email: 'no@match.com' });
      expect(result).toBeNull();
    });

    it('returns UserRecordWithSecrets including passwordHash', async () => {
      const now = new Date();
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        phone: '+919999999999',
        passwordHash: 'secret-hash',
        fullName: 'A B',
        dateOfBirth: null,
        roles: ['customer'],
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      const result = await repo.findByEmailOrPhone({ email: 'a@b.com' });
      expect(result).not.toBeNull();
      expect(result?.passwordHash).toBe('secret-hash');
      expect(result?.id).toBe('user-1');
    });
  });

  describe('create', () => {
    it('maps CreateUserInput to Prisma create data and returns UserRecord', async () => {
      const now = new Date();
      prisma.user.create.mockResolvedValue({
        id: 'new-user',
        email: 'new@b.com',
        phone: '+918888888888',
        passwordHash: 'hash',
        fullName: 'New User',
        dateOfBirth: null,
        roles: ['customer'],
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      const result = await repo.create({
        email: 'new@b.com',
        phone: '+918888888888',
        passwordHash: 'hash',
        fullName: 'New User',
        dateOfBirth: null,
        roles: ['customer'],
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@b.com',
          phone: '+918888888888',
          passwordHash: 'hash',
          fullName: 'New User',
          dateOfBirth: null,
          roles: ['customer'],
        },
      });
      expect(result.id).toBe('new-user');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- verifying secrets are not leaked in projection
      expect((result as any).passwordHash).toBeUndefined();
    });
  });

  describe('findRefreshToken', () => {
    it('returns null when token not found', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);
      const result = await repo.findRefreshToken('unknown-token');
      expect(result).toBeNull();
    });
  });
});
