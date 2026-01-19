import { PrismaClient } from '@prisma/client';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.API_KEY = 'test-api-key';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/workspace_reservation_test?schema=public';

const prisma = new PrismaClient();

// Setup before all integration tests
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data in correct order (respecting foreign keys)
  await prisma.telemetry.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.space.deleteMany();
  await prisma.place.deleteMany();
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
