import { Request, Response, NextFunction } from 'express';
import { telemetryRepository } from '../repositories/index.js';
import { telemetryGeneratorService } from '../services/telemetry-generator.service.js';
import { ApiResponse } from '../types/index.js';

export class TelemetryController {
  /**
   * GET /telemetry/space/:spaceId/latest
   * Get latest telemetry for a space
   */
  async getLatestForSpace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { spaceId } = req.params;
      const telemetry = await telemetryRepository.getLatestForSpace(spaceId);

      const response: ApiResponse = {
        success: true,
        data: telemetry,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /telemetry/space/:spaceId/history
   * Get telemetry history for a space
   */
  async getHistoryForSpace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { spaceId } = req.params;
      const from = req.query.from ? new Date(req.query.from as string) : undefined;
      const to = req.query.to ? new Date(req.query.to as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const telemetry = await telemetryRepository.getHistoryForSpace(spaceId, {
        from,
        to,
        limit,
      });

      const response: ApiResponse = {
        success: true,
        data: telemetry,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /telemetry/place/:placeId/latest
   * Get latest telemetry for all spaces in a place
   */
  async getLatestForPlace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { placeId } = req.params;
      const telemetry = await telemetryRepository.getLatestForPlace(placeId);

      const response: ApiResponse = {
        success: true,
        data: telemetry,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /telemetry/generate
   * Manually trigger telemetry generation for all spaces
   */
  async generateTelemetry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await telemetryGeneratorService.generateForAllSpaces();

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Telemetry generation completed',
          spacesUpdated: result.success,
          spacesFailed: result.failed,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /telemetry/generator/status
   * Get the status of the telemetry generator
   */
  async getGeneratorStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = telemetryGeneratorService.getStatus();

      const response: ApiResponse = {
        success: true,
        data: {
          ...status,
          message: status.isRunning 
            ? `Generator is running, updating every ${status.intervalMinutes} minutes`
            : 'Generator is stopped',
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /telemetry/generator/start
   * Start the telemetry generator
   */
  async startGenerator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      telemetryGeneratorService.start();
      const status = telemetryGeneratorService.getStatus();

      const response: ApiResponse = {
        success: true,
        data: {
          ...status,
          message: 'Telemetry generator started successfully',
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /telemetry/generator/stop
   * Stop the telemetry generator
   */
  async stopGenerator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      telemetryGeneratorService.stop();
      const status = telemetryGeneratorService.getStatus();

      const response: ApiResponse = {
        success: true,
        data: {
          ...status,
          message: 'Telemetry generator stopped successfully',
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

// Singleton instance
export const telemetryController = new TelemetryController();
