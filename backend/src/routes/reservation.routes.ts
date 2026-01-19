import { Router } from 'express';
import { reservationController } from '../controllers/index.js';
import { validate } from '../middlewares/index.js';
import {
  createReservationValidator,
  updateReservationValidator,
  reservationIdValidator,
  listReservationsValidator,
} from './validators/reservation.validator.js';

const router = Router();

/**
 * @route   GET /api/reservations
 * @desc    Get all reservations (with pagination and filters)
 * @access  Protected (API Key)
 */
router.get(
  '/',
  validate(listReservationsValidator),
  reservationController.getAll.bind(reservationController)
);

/**
 * @route   GET /api/reservations/:id
 * @desc    Get reservation by ID
 * @access  Protected (API Key)
 */
router.get(
  '/:id',
  validate(reservationIdValidator),
  reservationController.getById.bind(reservationController)
);

/**
 * @route   POST /api/reservations
 * @desc    Create a new reservation
 * @access  Protected (API Key)
 */
router.post(
  '/',
  validate(createReservationValidator),
  reservationController.create.bind(reservationController)
);

/**
 * @route   PUT /api/reservations/:id
 * @desc    Update a reservation
 * @access  Protected (API Key)
 */
router.put(
  '/:id',
  validate(updateReservationValidator),
  reservationController.update.bind(reservationController)
);

/**
 * @route   PATCH /api/reservations/:id/cancel
 * @desc    Cancel a reservation (soft delete)
 * @access  Protected (API Key)
 */
router.patch(
  '/:id/cancel',
  validate(reservationIdValidator),
  reservationController.cancel.bind(reservationController)
);

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Delete a reservation (hard delete)
 * @access  Protected (API Key)
 */
router.delete(
  '/:id',
  validate(reservationIdValidator),
  reservationController.delete.bind(reservationController)
);

export default router;
