import { body, param, query } from 'express-validator';

export const createSpaceValidator = [
  body('placeId')
    .notEmpty()
    .withMessage('Place ID is required')
    .isUUID()
    .withMessage('Invalid place ID format'),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('reference')
    .optional()
    .isString()
    .withMessage('Reference must be a string')
    .isLength({ max: 100 })
    .withMessage('Reference must be at most 100 characters'),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters'),
];

export const updateSpaceValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid space ID format'),
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('reference')
    .optional()
    .isString()
    .withMessage('Reference must be a string')
    .isLength({ max: 100 })
    .withMessage('Reference must be at most 100 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const spaceIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid space ID format'),
];

export const listSpacesValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),
  query('placeId')
    .optional()
    .isUUID()
    .withMessage('Invalid place ID format'),
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),
];
