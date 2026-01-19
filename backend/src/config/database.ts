import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

// Singleton instance of Prisma Client
let prisma: PrismaClient;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query' as never, (e: { query: string; duration: number }) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Duration: ${e.duration}ms`);
      });
    }
  }

  return prisma;
};

export const disconnectPrisma = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  }
};

// For testing purposes
export const resetPrismaClient = (): void => {
  prisma = undefined as unknown as PrismaClient;
};

export { prisma };
