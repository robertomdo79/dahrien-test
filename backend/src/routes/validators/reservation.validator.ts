import { body, param, query } from 'express-validator';

// ISO date regex (YYYY-MM-DD)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
// Time regex (HH:mm or HH:mm:ss)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const createReservationValidator = [
  body('spaceId')
    .notEmpty()
    .withMessage('Space ID is required')
    .isUUID()
    .withMessage('Invalid space ID format'),
  body('clientEmail')
    .notEmpty()
    .withMessage('Client email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(dateRegex)
    .withMessage('Date must be in YYYY-MM-DD format')
    .custom((value) => {
      // Compare dates as strings (YYYY-MM-DD) to avoid timezone issues
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // Gets YYYY-MM-DD in UTC
      
      // For local date comparison, use local date string
      const localTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      if (value < localTodayStr) {
        throw new Error('Date cannot be in the past');
      }
      return true;
    }),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(timeRegex)
    .withMessage('Start time must be in HH:mm format'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(timeRegex)
    .withMessage('End time must be in HH:mm format'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 500 })
    .withMessage('Notes must be at most 500 characters'),
];

export const updateReservationValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid reservation ID format'),
  body('date')
    .optional()
    .matches(dateRegex)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('startTime')
    .optional()
    .matches(timeRegex)
    .withMessage('Start time must be in HH:mm format'),
  body('endTime')
    .optional()
    .matches(timeRegex)
    .withMessage('End time must be in HH:mm format'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 500 })
    .withMessage('Notes must be at most 500 characters'),
];

export const reservationIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid reservation ID format'),
];

export const listReservationsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),
  query('spaceId')
    .optional()
    .isUUID()
    .withMessage('Invalid space ID format'),
  query('placeId')
    .optional()
    .isUUID()
    .withMessage('Invalid place ID format'),
  query('clientEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  query('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Invalid status value'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid ISO date'),
];
