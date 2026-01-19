import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * API Key Authentication Middleware
 * 
 * Validates the x-api-key header against the configured API key.
 * Returns 401 if header is missing, 403 if key is invalid.
 */
export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  // Check if API key header is present
  if (!apiKey) {
    logger.warn('Request missing x-api-key header', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    throw new UnauthorizedError('API key is required. Please provide x-api-key header.');
  }

  // Validate API key
  if (apiKey !== config.apiKey) {
    logger.warn('Invalid API key attempted', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    throw new ForbiddenError('Invalid API key');
  }

  // API key is valid, continue
  next();
};

/**
 * Optional authentication middleware for public endpoints
 * that may have enhanced features with authentication
 */
export const optionalAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string | undefined;
  
  // Store authentication status on request
  (req as Request & { isAuthenticated: boolean }).isAuthenticated = 
    apiKey === config.apiKey;
  
  next();
};
