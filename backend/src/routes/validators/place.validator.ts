import { body, param } from 'express-validator';

export const createPlaceValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isString()
    .withMessage('Location must be a string')
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2 and 255 characters'),
];

export const updatePlaceValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid place ID format'),
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string')
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2 and 255 characters'),
];

export const placeIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid place ID format'),
];
