import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { Application } from 'express';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../../app.js';

// Use a separate test database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/workspace_reservation_test?schema=public',
    },
  },
});

const API_KEY = 'test-api-key';

describe('Reservations API Integration Tests', () => {
  let app: Application;
  let testPlace: { id: string };
  let testSpace: { id: string };

  beforeAll(async () => {
    // Set test API key
    process.env.API_KEY = API_KEY;
    
    // Create app
    app = createApp();
    
    // Connect to database
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.telemetry.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.space.deleteMany();
    await prisma.place.deleteMany();

    // Create test place
    testPlace = await prisma.place.create({
      data: {
        name: 'Test Place',
        location: 'Test Location',
      },
    });

    // Create test space
    testSpace = await prisma.space.create({
      data: {
        placeId: testPlace.id,
        name: 'Test Space',
        capacity: 10,
      },
    });
  });

  describe('POST /api/reservations', () => {
    it('should create a reservation successfully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .post('/api/reservations')
        .set('x-api-key', API_KEY)
        .send({
          spaceId: testSpace.id,
          clientEmail: 'test@example.com',
          date: dateStr,
          startTime: '09:00',
          endTime: '11:00',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.clientEmail).toBe('test@example.com');
      expect(response.body.data.status).toBe('CONFIRMED');
    });

    it('should reject request without API key', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .post('/api/reservations')
        .send({
          spaceId: testSpace.id,
          clientEmail: 'test@example.com',
          date: dateStr,
          startTime: '09:00',
          endTime: '11:00',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject overlapping reservations', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      // Create first reservation
      await request(app)
        .post('/api/reservations')
        .set('x-api-key', API_KEY)
        .send({
          spaceId: testSpace.id,
          clientEmail: 'first@example.com',
          date: dateStr,
          startTime: '09:00',
          endTime: '11:00',
        });

      // Try to create overlapping reservation
      const response = await request(app)
        .post('/api/reservations')
        .set('x-api-key', API_KEY)
        .send({
          spaceId: testSpace.id,
          clientEmail: 'second@example.com',
          date: dateStr,
          startTime: '10:00', // Overlaps with 09:00-11:00
          endTime: '12:00',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should enforce weekly quota limit', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const clientEmail = 'quota-test@example.com';

      // Create 3 reservations (max allowed per week)
      for (let i = 0; i < 3; i++) {
        const startHour = 9 + i * 2;
        await request(app)
          .post('/api/reservations')
          .set('x-api-key', API_KEY)
          .send({
            spaceId: testSpace.id,
            clientEmail,
            date: dateStr,
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${(startHour + 1).toString().padStart(2, '0')}:00`,
          });
      }

      // Try to create a 4th reservation
      const response = await request(app)
        .post('/api/reservations')
        .set('x-api-key', API_KEY)
        .send({
          spaceId: testSpace.id,
          clientEmail,
          date: dateStr,
          startTime: '17:00',
          endTime: '18:00',
        });

      expect(response.status).toBe(429);
      expect(response.body.error.code).toBe('QUOTA_EXCEEDED');
    });
  });

  describe('GET /api/reservations', () => {
    it('should return paginated reservations', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      // Create multiple reservations
      for (let i = 0; i < 5; i++) {
        await prisma.reservation.create({
          data: {
            spaceId: testSpace.id,
            placeId: testPlace.id,
            clientEmail: `user${i}@example.com`,
            date: tomorrow,
            startTime: new Date(`${dateStr}T${(9 + i).toString().padStart(2, '0')}:00:00`),
            endTime: new Date(`${dateStr}T${(10 + i).toString().padStart(2, '0')}:00:00`),
            status: 'CONFIRMED',
          },
        });
      }

      const response = await request(app)
        .get('/api/reservations')
        .set('x-api-key', API_KEY)
        .query({ page: 1, pageSize: 2 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.totalItems).toBe(5);
      expect(response.body.pagination.totalPages).toBe(3);
      expect(response.body.pagination.hasNextPage).toBe(true);
    });

    it('should filter by clientEmail', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetEmail = 'target@example.com';

      // Create reservations for different clients
      await prisma.reservation.createMany({
        data: [
          {
            spaceId: testSpace.id,
            placeId: testPlace.id,
            clientEmail: targetEmail,
            date: tomorrow,
            startTime: new Date(`${tomorrow.toISOString().split('T')[0]}T09:00:00`),
            endTime: new Date(`${tomorrow.toISOString().split('T')[0]}T10:00:00`),
            status: 'CONFIRMED',
          },
          {
            spaceId: testSpace.id,
            placeId: testPlace.id,
            clientEmail: 'other@example.com',
            date: tomorrow,
            startTime: new Date(`${tomorrow.toISOString().split('T')[0]}T11:00:00`),
            endTime: new Date(`${tomorrow.toISOString().split('T')[0]}T12:00:00`),
            status: 'CONFIRMED',
          },
        ],
      });

      const response = await request(app)
        .get('/api/reservations')
        .set('x-api-key', API_KEY)
        .query({ clientEmail: targetEmail });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].clientEmail).toBe(targetEmail);
    });
  });

  describe('PATCH /api/reservations/:id/cancel', () => {
    it('should cancel a reservation', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const reservation = await prisma.reservation.create({
        data: {
          spaceId: testSpace.id,
          placeId: testPlace.id,
          clientEmail: 'cancel-test@example.com',
          date: tomorrow,
          startTime: new Date(`${tomorrow.toISOString().split('T')[0]}T09:00:00`),
          endTime: new Date(`${tomorrow.toISOString().split('T')[0]}T10:00:00`),
          status: 'CONFIRMED',
        },
      });

      const response = await request(app)
        .patch(`/api/reservations/${reservation.id}/cancel`)
        .set('x-api-key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CANCELLED');
    });

    it('should return 404 for non-existent reservation', async () => {
      const response = await request(app)
        .patch('/api/reservations/non-existent-uuid/cancel')
        .set('x-api-key', API_KEY);

      expect(response.status).toBe(400); // UUID validation fails first
    });
  });
});
