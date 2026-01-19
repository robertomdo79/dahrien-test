import { Request, Response, NextFunction } from 'express';
import { placeService } from '../services/index.js';
import { CreatePlaceDto, UpdatePlaceDto, ApiResponse } from '../types/index.js';

export class PlaceController {
  /**
   * GET /places
   * Get all places
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const places = await placeService.getAllPlaces();

      const response: ApiResponse = {
        success: true,
        data: places,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /places/:id
   * Get place by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const place = await placeService.getPlaceById(id);

      const response: ApiResponse = {
        success: true,
        data: place,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /places
   * Create a new place
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreatePlaceDto = req.body;
      const place = await placeService.createPlace(data);

      const response: ApiResponse = {
        success: true,
        data: place,
        message: 'Place created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /places/:id
   * Update a place
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdatePlaceDto = req.body;
      const place = await placeService.updatePlace(id, data);

      const response: ApiResponse = {
        success: true,
        data: place,
        message: 'Place updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /places/:id
   * Delete a place
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await placeService.deletePlace(id);

      const response: ApiResponse = {
        success: true,
        message: 'Place deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

// Singleton instance
export const placeController = new PlaceController();
