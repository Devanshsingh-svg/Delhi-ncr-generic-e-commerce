import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const isDev = process.env['NODE_ENV'] === 'development';

let _prisma: PrismaClient | undefined;
export function getPrismaClient(): PrismaClient {
  if (!_prisma) {
    _prisma = globalForPrisma.prisma ?? new PrismaClient({ log: isDev ? ['query', 'error', 'warn'] : ['error'] });
    if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = _prisma;
  }
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrismaClient() as unknown as Record<string | symbol, unknown>)[prop];
  }
});