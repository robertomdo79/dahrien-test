import { Request, Response, NextFunction } from 'express';
import { reservationService } from '../services/index.js';
import { CreateReservationDto, UpdateReservationDto, ApiResponse, ReservationFilters, ReservationStatus } from '../types/index.js';

export class ReservationController {
  /**
   * GET /reservations
   * Get all reservations with pagination and optional filters
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : undefined;
      
      // Build filters from query params
      const filters: ReservationFilters = {};
      
      if (req.query.spaceId) {
        filters.spaceId = req.query.spaceId as string;
      }
      if (req.query.placeId) {
        filters.placeId = req.query.placeId as string;
      }
      if (req.query.clientEmail) {
        filters.clientEmail = req.query.clientEmail as string;
      }
      if (req.query.status) {
        filters.status = req.query.status as ReservationStatus;
      }
      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }
      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }

      const result = await reservationService.getAllReservations(page, pageSize, filters);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        ...({ pagination: result.pagination }),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reservations/:id
   * Get reservation by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reservation = await reservationService.getReservationById(id);

      const response: ApiResponse = {
        success: true,
        data: reservation,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /reservations
   * Create a new reservation
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateReservationDto = req.body;
      const reservation = await reservationService.createReservation(data);

      const response: ApiResponse = {
        success: true,
        data: reservation,
        message: 'Reservation created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /reservations/:id
   * Update a reservation
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateReservationDto = req.body;
      const reservation = await reservationService.updateReservation(id, data);

      const response: ApiResponse = {
        success: true,
        data: reservation,
        message: 'Reservation updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /reservations/:id/cancel
   * Cancel a reservation (soft delete)
   */
  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reservation = await reservationService.cancelReservation(id);

      const response: ApiResponse = {
        success: true,
        data: reservation,
        message: 'Reservation cancelled successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /reservations/:id
   * Delete a reservation (hard delete)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await reservationService.deleteReservation(id);

      const response: ApiResponse = {
        success: true,
        message: 'Reservation deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

// Singleton instance
export const reservationController = new ReservationController();
