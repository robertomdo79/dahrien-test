import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { BadRequestError } from '../utils/errors.js';

/**
 * Validation Middleware
 * 
 * Wraps express-validator chains and throws BadRequestError if validation fails.
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      next();
      return;
    }

    // Format validation errors
    const formattedErrors = errors.array().map((error) => {
      if (error.type === 'field') {
        return {
          field: error.path,
          message: error.msg,
          value: error.value,
        };
      }
      return {
        message: error.msg,
      };
    });

    throw new BadRequestError('Validation failed', formattedErrors);
  };
};
