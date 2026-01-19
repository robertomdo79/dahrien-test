import { Router } from 'express';
import { telemetryController } from '../controllers/telemetry.controller.js';
import { validate } from '../middlewares/index.js';
import { param, query } from 'express-validator';

const router = Router();

const spaceIdValidator = [
  param('spaceId')
    .isUUID()
    .withMessage('Invalid space ID format'),
];

const placeIdValidator = [
  param('placeId')
    .isUUID()
    .withMessage('Invalid place ID format'),
];

const historyQueryValidator = [
  ...spaceIdValidator,
  query('from')
    .optional()
    .isISO8601()
    .withMessage('from must be a valid ISO date'),
  query('to')
    .optional()
    .isISO8601()
    .withMessage('to must be a valid ISO date'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('limit must be between 1 and 1000'),
];

/**
 * @route   GET /api/telemetry/space/:spaceId/latest
 * @desc    Get latest telemetry for a space
 * @access  Protected (API Key)
 */
router.get(
  '/space/:spaceId/latest',
  validate(spaceIdValidator),
  telemetryController.getLatestForSpace.bind(telemetryController)
);

/**
 * @route   GET /api/telemetry/space/:spaceId/history
 * @desc    Get telemetry history for a space
 * @access  Protected (API Key)
 */
router.get(
  '/space/:spaceId/history',
  validate(historyQueryValidator),
  telemetryController.getHistoryForSpace.bind(telemetryController)
);

/**
 * @route   GET /api/telemetry/place/:placeId/latest
 * @desc    Get latest telemetry for all spaces in a place
 * @access  Protected (API Key)
 */
router.get(
  '/place/:placeId/latest',
  validate(placeIdValidator),
  telemetryController.getLatestForPlace.bind(telemetryController)
);

/**
 * @route   POST /api/telemetry/generate
 * @desc    Manually trigger telemetry generation for all spaces
 * @access  Admin only
 */
router.post(
  '/generate',
  telemetryController.generateTelemetry.bind(telemetryController)
);

/**
 * @route   GET /api/telemetry/generator/status
 * @desc    Get the status of the telemetry generator
 * @access  Admin only
 */
router.get(
  '/generator/status',
  telemetryController.getGeneratorStatus.bind(telemetryController)
);

/**
 * @route   POST /api/telemetry/generator/start
 * @desc    Start the telemetry generator
 * @access  Admin only
 */
router.post(
  '/generator/start',
  telemetryController.startGenerator.bind(telemetryController)
);

/**
 * @route   POST /api/telemetry/generator/stop
 * @desc    Stop the telemetry generator
 * @access  Admin only
 */
router.post(
  '/generator/stop',
  telemetryController.stopGenerator.bind(telemetryController)
);

export default router;
