import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ReservationService } from '../../../services/reservation.service.js';
import { ConflictError, QuotaExceededError, BadRequestError, NotFoundError } from '../../../utils/errors.js';

// Mock repositories
const mockReservationRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  cancel: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  hasOverlappingReservation: jest.fn(),
  countClientReservationsInWeek: jest.fn(),
  getClientReservationsInWeek: jest.fn(),
};

const mockSpaceRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  getSpaceWithPlaceId: jest.fn(),
};

describe('ReservationService', () => {
  let service: ReservationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReservationService(
      mockReservationRepo as any,
      mockSpaceRepo as any
    );
  });

  describe('createReservation', () => {
    const validReservationData = {
      spaceId: 'space-uuid-123',
      clientEmail: 'test@example.com',
      date: '2026-02-01',
      startTime: '09:00',
      endTime: '11:00',
    };

    it('should create a reservation successfully', async () => {
      const mockSpace = { id: 'space-uuid-123', placeId: 'place-uuid-456' };
      const mockCreatedReservation = {
        id: 'reservation-uuid-789',
        ...validReservationData,
        placeId: 'place-uuid-456',
        status: 'CONFIRMED',
        createdAt: new Date(),
        updatedAt: new Date(),
        space: { id: 'space-uuid-123', name: 'Meeting Room', capacity: 10 },
        place: { id: 'place-uuid-456', name: 'Tech Hub' },
      };

      mockSpaceRepo.getSpaceWithPlaceId.mockResolvedValue(mockSpace);
      mockReservationRepo.hasOverlappingReservation.mockResolvedValue(false);
      mockReservationRepo.countClientReservationsInWeek.mockResolvedValue(0);
      mockReservationRepo.create.mockResolvedValue(mockCreatedReservation);

      const result = await service.createReservation(validReservationData);

      expect(result).toBeDefined();
      expect(result.id).toBe('reservation-uuid-789');
      expect(result.status).toBe('CONFIRMED');
      expect(mockSpaceRepo.getSpaceWithPlaceId).toHaveBeenCalledWith('space-uuid-123');
      expect(mockReservationRepo.hasOverlappingReservation).toHaveBeenCalled();
      expect(mockReservationRepo.countClientReservationsInWeek).toHaveBeenCalled();
    });

    it('should throw BadRequestError when space does not exist', async () => {
      mockSpaceRepo.getSpaceWithPlaceId.mockResolvedValue(null);

      await expect(service.createReservation(validReservationData))
        .rejects
        .toThrow(BadRequestError);

      expect(mockReservationRepo.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when there is an overlapping reservation', async () => {
      const mockSpace = { id: 'space-uuid-123', placeId: 'place-uuid-456' };

      mockSpaceRepo.getSpaceWithPlaceId.mockResolvedValue(mockSpace);
      mockReservationRepo.hasOverlappingReservation.mockResolvedValue(true);

      await expect(service.createReservation(validReservationData))
        .rejects
        .toThrow(ConflictError);

      expect(mockReservationRepo.create).not.toHaveBeenCalled();
    });

    it('should throw QuotaExceededError when client exceeds weekly limit', async () => {
      const mockSpace = { id: 'space-uuid-123', placeId: 'place-uuid-456' };
      const existingReservations = [
        { id: '1', date: new Date(), startTime: new Date(), endTime: new Date() },
        { id: '2', date: new Date(), startTime: new Date(), endTime: new Date() },
        { id: '3', date: new Date(), startTime: new Date(), endTime: new Date() },
      ];

      mockSpaceRepo.getSpaceWithPlaceId.mockResolvedValue(mockSpace);
      mockReservationRepo.hasOverlappingReservation.mockResolvedValue(false);
      mockReservationRepo.countClientReservationsInWeek.mockResolvedValue(3);
      mockReservationRepo.getClientReservationsInWeek.mockResolvedValue(existingReservations);

      await expect(service.createReservation(validReservationData))
        .rejects
        .toThrow(QuotaExceededError);

      expect(mockReservationRepo.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when end time is before start time', async () => {
      const invalidData = {
        ...validReservationData,
        startTime: '14:00',
        endTime: '10:00', // End before start
      };

      const mockSpace = { id: 'space-uuid-123', placeId: 'place-uuid-456' };
      mockSpaceRepo.getSpaceWithPlaceId.mockResolvedValue(mockSpace);

      await expect(service.createReservation(invalidData))
        .rejects
        .toThrow(BadRequestError);
    });
  });

  describe('getReservationById', () => {
    it('should return a reservation when found', async () => {
      const mockReservation = {
        id: 'reservation-uuid-123',
        spaceId: 'space-uuid',
        placeId: 'place-uuid',
        clientEmail: 'test@example.com',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        status: 'CONFIRMED',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        space: { id: 'space-uuid', name: 'Room', capacity: 5 },
        place: { id: 'place-uuid', name: 'Place' },
      };

      mockReservationRepo.findById.mockResolvedValue(mockReservation);

      const result = await service.getReservationById('reservation-uuid-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('reservation-uuid-123');
    });

    it('should throw NotFoundError when reservation not found', async () => {
      mockReservationRepo.findById.mockResolvedValue(null);

      await expect(service.getReservationById('non-existent-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('cancelReservation', () => {
    it('should cancel a reservation successfully', async () => {
      const mockCancelledReservation = {
        id: 'reservation-uuid-123',
        status: 'CANCELLED',
        space: { id: 'space-uuid', name: 'Room', capacity: 5 },
        place: { id: 'place-uuid', name: 'Place' },
      };

      mockReservationRepo.exists.mockResolvedValue(true);
      mockReservationRepo.cancel.mockResolvedValue(mockCancelledReservation);

      const result = await service.cancelReservation('reservation-uuid-123');

      expect(result.status).toBe('CANCELLED');
      expect(mockReservationRepo.cancel).toHaveBeenCalledWith('reservation-uuid-123');
    });

    it('should throw NotFoundError when reservation does not exist', async () => {
      mockReservationRepo.exists.mockResolvedValue(false);

      await expect(service.cancelReservation('non-existent-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});
