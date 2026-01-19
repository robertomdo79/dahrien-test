import { PrismaClient, Reservation, ReservationStatus } from '@prisma/client';
import { getPrismaClient } from '../config/database.js';
import { 
  CreateReservationDto, 
  UpdateReservationDto, 
  PaginationParams,
  ReservationFilters 
} from '../types/index.js';

export interface ReservationWithRelations extends Reservation {
  space: {
    id: string;
    name: string;
    capacity: number;
  };
  place: {
    id: string;
    name: string;
  };
}

export class ReservationRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || getPrismaClient();
  }

  /**
   * Find all reservations with pagination and filters
   */
  async findAll(
    pagination: PaginationParams,
    filters?: ReservationFilters
  ): Promise<{ data: ReservationWithRelations[]; total: number }> {
    const where = {
      ...(filters?.spaceId && { spaceId: filters.spaceId }),
      ...(filters?.placeId && { placeId: filters.placeId }),
      ...(filters?.clientEmail && { clientEmail: filters.clientEmail }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            date: {
              ...(filters?.dateFrom && { gte: filters.dateFrom }),
              ...(filters?.dateTo && { lte: filters.dateTo }),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        include: {
          space: {
            select: {
              id: true,
              name: true,
              capacity: true,
            },
          },
          place: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Find reservation by ID
   */
  async findById(id: string): Promise<ReservationWithRelations | null> {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Create a new reservation
   */
  async create(
    data: CreateReservationDto & { placeId: string; date: Date; startTime: Date; endTime: Date }
  ): Promise<ReservationWithRelations> {
    return this.prisma.reservation.create({
      data: {
        spaceId: data.spaceId,
        placeId: data.placeId,
        clientEmail: data.clientEmail,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        status: 'CONFIRMED',
      },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Update a reservation
   */
  async update(
    id: string,
    data: Partial<{
      date: Date;
      startTime: Date;
      endTime: Date;
      notes: string;
      status: ReservationStatus;
    }>
  ): Promise<ReservationWithRelations> {
    return this.prisma.reservation.update({
      where: { id },
      data,
      include: {
        space: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Cancel a reservation (soft delete)
   */
  async cancel(id: string): Promise<ReservationWithRelations> {
    return this.prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete a reservation (hard delete)
   */
  async delete(id: string): Promise<Reservation> {
    return this.prisma.reservation.delete({
      where: { id },
    });
  }

  /**
   * Check for overlapping reservations
   * Returns true if there's a conflict
   */
  async hasOverlappingReservation(
    spaceId: string,
    date: Date,
    startTime: Date,
    endTime: Date,
    excludeReservationId?: string
  ): Promise<boolean> {
    const overlapping = await this.prisma.reservation.findFirst({
      where: {
        spaceId,
        date,
        status: { in: ['PENDING', 'CONFIRMED'] },
        ...(excludeReservationId && { id: { not: excludeReservationId } }),
        // Check for time overlap:
        // New reservation overlaps if:
        // (new.start < existing.end) AND (new.end > existing.start)
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });

    return overlapping !== null;
  }

  /**
   * Count active reservations for a client in a given week
   * Week is defined as Monday to Sunday containing the given date
   */
  async countClientReservationsInWeek(
    clientEmail: string,
    date: Date
  ): Promise<number> {
    // Get Monday of the week
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    // Get Sunday of the week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return this.prisma.reservation.count({
      where: {
        clientEmail,
        date: {
          gte: monday,
          lte: sunday,
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
  }

  /**
   * Get all reservations for a client in a week (for quota checking)
   */
  async getClientReservationsInWeek(
    clientEmail: string,
    date: Date
  ): Promise<Reservation[]> {
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return this.prisma.reservation.findMany({
      where: {
        clientEmail,
        date: {
          gte: monday,
          lte: sunday,
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Check if reservation exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.reservation.count({
      where: { id },
    });
    return count > 0;
  }
}

// Singleton instance
export const reservationRepository = new ReservationRepository();
