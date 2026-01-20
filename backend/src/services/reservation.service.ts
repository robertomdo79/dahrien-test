import { 
  ReservationRepository, 
  reservationRepository, 
  SpaceRepository, 
  spaceRepository 
} from '../repositories/index.js';
import { 
  CreateReservationDto, 
  UpdateReservationDto, 
  ReservationResponse, 
  PaginationParams,
  PaginatedResponse,
  ReservationFilters 
} from '../types/index.js';
import { NotFoundError, ConflictError, QuotaExceededError, BadRequestError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export class ReservationService {
  constructor(
    private repository: ReservationRepository = reservationRepository,
    private spaceRepo: SpaceRepository = spaceRepository
  ) {}

  /**
   * Get all reservations with pagination and filters
   */
  async getAllReservations(
    page?: number,
    pageSize?: number,
    filters?: ReservationFilters
  ): Promise<PaginatedResponse<ReservationResponse>> {
    const pagination: PaginationParams = {
      page: page || config.pagination.defaultPage,
      pageSize: Math.min(
        pageSize || config.pagination.defaultPageSize,
        config.pagination.maxPageSize
      ),
    };

    logger.debug('Fetching reservations', { pagination, filters });

    const { data, total } = await this.repository.findAll(pagination, filters);

    const totalPages = Math.ceil(total / pagination.pageSize);

    return {
      data: data.map((reservation) => this.mapToResponse(reservation)),
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems: total,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  /**
   * Get reservation by ID
   */
  async getReservationById(id: string): Promise<ReservationResponse> {
    logger.debug(`Fetching reservation with id: ${id}`);

    const reservation = await this.repository.findById(id);

    if (!reservation) {
      throw new NotFoundError('Reservation', id);
    }

    return this.mapToResponse(reservation);
  }

  /**
   * Create a new reservation
   * 
   * Business Rules:
   * 1. Space must exist
   * 2. No overlapping reservations for the same space
   * 3. Client cannot have more than 3 active reservations per week
   */
  async createReservation(data: CreateReservationDto): Promise<ReservationResponse> {
    logger.info('Creating new reservation', { 
      spaceId: data.spaceId, 
      clientEmail: data.clientEmail,
      date: data.date 
    });

    // 1. Validate space exists and get placeId
    const space = await this.spaceRepo.getSpaceWithPlaceId(data.spaceId);
    if (!space) {
      throw new BadRequestError(`Space with id '${data.spaceId}' does not exist`);
    }

    // Parse dates using local timezone to avoid date shifting issues
    const reservationDate = this.parseDate(data.date);
    const startTime = this.parseTime(data.date, data.startTime);
    const endTime = this.parseTime(data.date, data.endTime);

    // Validate time range
    if (endTime <= startTime) {
      throw new BadRequestError('End time must be after start time');
    }

    // 2. Check for overlapping reservations (Conflict Detection)
    const hasConflict = await this.repository.hasOverlappingReservation(
      data.spaceId,
      reservationDate,
      startTime,
      endTime
    );

    if (hasConflict) {
      throw new ConflictError(
        'This space is already reserved for the requested time slot',
        {
          spaceId: data.spaceId,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
        }
      );
    }

    // 3. Check weekly quota (max 3 reservations per client per week)
    const weeklyReservationCount = await this.repository.countClientReservationsInWeek(
      data.clientEmail,
      reservationDate
    );

    if (weeklyReservationCount >= config.businessRules.maxReservationsPerWeek) {
      const existingReservations = await this.repository.getClientReservationsInWeek(
        data.clientEmail,
        reservationDate
      );

      throw new QuotaExceededError(
        `Client has reached the maximum of ${config.businessRules.maxReservationsPerWeek} reservations per week`,
        {
          clientEmail: data.clientEmail,
          currentCount: weeklyReservationCount,
          maxAllowed: config.businessRules.maxReservationsPerWeek,
          existingReservations: existingReservations.map((r) => ({
            id: r.id,
            date: r.date,
            startTime: r.startTime,
            endTime: r.endTime,
          })),
        }
      );
    }

    // Create the reservation
    const reservation = await this.repository.create({
      ...data,
      placeId: space.placeId,
      date: reservationDate,
      startTime,
      endTime,
    });

    logger.info(`Reservation created with id: ${reservation.id}`);

    return this.mapToResponse(reservation);
  }

  /**
   * Update a reservation
   */
  async updateReservation(
    id: string,
    data: UpdateReservationDto
  ): Promise<ReservationResponse> {
    logger.info(`Updating reservation with id: ${id}`);

    // Check if reservation exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Reservation', id);
    }

    // If dates/times are being updated, validate them
    if (data.date || data.startTime || data.endTime) {
      const reservationDate = data.date 
        ? this.parseDate(data.date) 
        : existing.date;
      
      const baseDate = data.date || existing.date.toISOString().split('T')[0];
      const startTime = data.startTime 
        ? this.parseTime(baseDate, data.startTime)
        : existing.startTime;
      const endTime = data.endTime 
        ? this.parseTime(baseDate, data.endTime)
        : existing.endTime;

      // Validate time range
      if (endTime <= startTime) {
        throw new BadRequestError('End time must be after start time');
      }

      // Check for conflicts (excluding current reservation)
      const hasConflict = await this.repository.hasOverlappingReservation(
        existing.spaceId,
        reservationDate,
        startTime,
        endTime,
        id
      );

      if (hasConflict) {
        throw new ConflictError(
          'This space is already reserved for the requested time slot',
          {
            spaceId: existing.spaceId,
            date: baseDate,
            startTime: data.startTime || existing.startTime.toISOString(),
            endTime: data.endTime || existing.endTime.toISOString(),
          }
        );
      }
    }

    // Prepare update data
    const updateData: Parameters<typeof this.repository.update>[1] = {};
    
    if (data.date) {
      updateData.date = this.parseDate(data.date);
    }
    if (data.startTime) {
      updateData.startTime = this.parseTime(
        data.date || existing.date.toISOString().split('T')[0],
        data.startTime
      );
    }
    if (data.endTime) {
      updateData.endTime = this.parseTime(
        data.date || existing.date.toISOString().split('T')[0],
        data.endTime
      );
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const reservation = await this.repository.update(id, updateData);

    logger.info(`Reservation updated: ${reservation.id}`);

    return this.mapToResponse(reservation);
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(id: string): Promise<ReservationResponse> {
    logger.info(`Cancelling reservation with id: ${id}`);

    // Check if reservation exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Reservation', id);
    }

    const reservation = await this.repository.cancel(id);

    logger.info(`Reservation cancelled: ${reservation.id}`);

    return this.mapToResponse(reservation);
  }

  /**
   * Delete a reservation (hard delete)
   */
  async deleteReservation(id: string): Promise<void> {
    logger.info(`Deleting reservation with id: ${id}`);

    // Check if reservation exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Reservation', id);
    }

    await this.repository.delete(id);

    logger.info(`Reservation deleted: ${id}`);
  }

  /**
   * Parse time string to Date object
   * Supports both "HH:mm" and ISO datetime formats
   */
  private parseTime(dateStr: string, timeStr: string): Date {
    // If it's already a full ISO string, parse it directly
    if (timeStr.includes('T')) {
      return new Date(timeStr);
    }

    // Parse date components to avoid timezone issues
    // dateStr format: "YYYY-MM-DD"
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Create date using local timezone components
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  /**
   * Parse date string to Date object at midnight local time
   * Avoids timezone issues with new Date("YYYY-MM-DD")
   */
  private parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  /**
   * Map database entity to response DTO
   */
  private mapToResponse(reservation: {
    id: string;
    spaceId: string;
    placeId: string;
    clientEmail: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    space?: { id: string; name: string; capacity: number };
    place?: { id: string; name: string };
  }): ReservationResponse {
    return {
      id: reservation.id,
      spaceId: reservation.spaceId,
      placeId: reservation.placeId,
      clientEmail: reservation.clientEmail,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      status: reservation.status as ReservationResponse['status'],
      notes: reservation.notes,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      space: reservation.space,
      place: reservation.place,
    };
  }
}

// Singleton instance
export const reservationService = new ReservationService();
