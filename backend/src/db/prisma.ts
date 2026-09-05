import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient instance — shared across all modules.
// Prevents multiple connections in development when hot-reloading.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
