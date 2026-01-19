// Custom error classes for the application

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 - Bad Request
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown) {
    super(message, 400, 'BAD_REQUEST', true, details);
  }
}

// 401 - Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED', true);
  }
}

// 403 - Forbidden
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN', true);
  }
}

// 404 - Not Found
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND', true);
  }
}

// 409 - Conflict
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details?: unknown) {
    super(message, 409, 'CONFLICT', true, details);
  }
}

// 422 - Unprocessable Entity (Business logic validation)
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 422, 'VALIDATION_ERROR', true, details);
  }
}

// 429 - Too Many Requests (Rate limit / Quota exceeded)
export class QuotaExceededError extends AppError {
  constructor(message = 'Quota exceeded', details?: unknown) {
    super(message, 429, 'QUOTA_EXCEEDED', true, details);
  }
}

// 500 - Internal Server Error
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR', false);
  }
}
