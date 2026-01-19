import { Request, Response, NextFunction } from 'express';
import { spaceService } from '../services/index.js';
import { CreateSpaceDto, UpdateSpaceDto, ApiResponse } from '../types/index.js';

export class SpaceController {
  /**
   * GET /spaces
   * Get all spaces with pagination and optional filters
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : undefined;
      const placeId = req.query.placeId as string | undefined;
      const isActive = req.query.isActive !== undefined 
        ? req.query.isActive === 'true' 
        : undefined;

      const result = await spaceService.getAllSpaces(page, pageSize, { placeId, isActive });

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
   * GET /spaces/:id
   * Get space by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const space = await spaceService.getSpaceById(id);

      const response: ApiResponse = {
        success: true,
        data: space,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /spaces
   * Create a new space
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateSpaceDto = req.body;
      const space = await spaceService.createSpace(data);

      const response: ApiResponse = {
        success: true,
        data: space,
        message: 'Space created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /spaces/:id
   * Update a space
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateSpaceDto = req.body;
      const space = await spaceService.updateSpace(id, data);

      const response: ApiResponse = {
        success: true,
        data: space,
        message: 'Space updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /spaces/:id
   * Delete a space
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await spaceService.deleteSpace(id);

      const response: ApiResponse = {
        success: true,
        message: 'Space deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

// Singleton instance
export const spaceController = new SpaceController();
