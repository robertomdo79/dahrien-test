import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.API_KEY = 'test-api-key';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/workspace_reservation_test?schema=public';

// Mock Prisma Client for unit tests
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $on: jest.fn(),
      place: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      space: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      reservation: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      telemetry: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
    })),
  };
});

// Global test timeout
jest.setTimeout(10000);

// Clean up after tests
afterAll(() => {
  jest.clearAllMocks();
});
