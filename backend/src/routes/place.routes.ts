import { Router } from 'express';
import { placeController } from '../controllers/index.js';
import { validate } from '../middlewares/index.js';
import {
  createPlaceValidator,
  updatePlaceValidator,
  placeIdValidator,
} from './validators/place.validator.js';

const router = Router();

/**
 * @route   GET /api/places
 * @desc    Get all places
 * @access  Protected (API Key)
 */
router.get('/', placeController.getAll.bind(placeController));

/**
 * @route   GET /api/places/:id
 * @desc    Get place by ID
 * @access  Protected (API Key)
 */
router.get(
  '/:id',
  validate(placeIdValidator),
  placeController.getById.bind(placeController)
);

/**
 * @route   POST /api/places
 * @desc    Create a new place
 * @access  Protected (API Key)
 */
router.post(
  '/',
  validate(createPlaceValidator),
  placeController.create.bind(placeController)
);

/**
 * @route   PUT /api/places/:id
 * @desc    Update a place
 * @access  Protected (API Key)
 */
router.put(
  '/:id',
  validate(updatePlaceValidator),
  placeController.update.bind(placeController)
);

/**
 * @route   DELETE /api/places/:id
 * @desc    Delete a place
 * @access  Protected (API Key)
 */
router.delete(
  '/:id',
  validate(placeIdValidator),
  placeController.delete.bind(placeController)
);

export default router;
