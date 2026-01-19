import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ApiResponse } from '../types/index.js';

/**
 * Global Error Handler Middleware
 * 
 * Catches all errors and returns standardized JSON responses.
 * Handles both operational errors (AppError) and unexpected errors.
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  // Handle AppError (operational errors)
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code: string; meta?: { target?: string[] } };
    
    let statusCode = 400;
    let message = 'Database operation failed';
    let code = 'DATABASE_ERROR';

    switch (prismaError.code) {
      case 'P2002': // Unique constraint violation
        statusCode = 409;
        message = `Duplicate value for field: ${prismaError.meta?.target?.join(', ')}`;
        code = 'DUPLICATE_ENTRY';
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        message = 'Record not found';
        code = 'NOT_FOUND';
        break;
      case 'P2003': // Foreign key constraint violation
        statusCode = 400;
        message = 'Related record not found';
        code = 'FOREIGN_KEY_ERROR';
        break;
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
      },
    };

    res.status(statusCode).json(response);
    return;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    };

    res.status(422).json(response);
    return;
  }

  // Handle unexpected errors (don't expose details in production)
  const isProduction = process.env.NODE_ENV === 'production';
  
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'An unexpected error occurred' : err.message,
      details: isProduction ? undefined : err.stack,
    },
  };

  res.status(500).json(response);
};

/**
 * Not Found Handler
 * 
 * Catches requests to undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  };

  res.status(404).json(response);
};
