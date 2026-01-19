import { Router } from 'express';
import { spaceController } from '../controllers/index.js';
import { validate } from '../middlewares/index.js';
import {
  createSpaceValidator,
  updateSpaceValidator,
  spaceIdValidator,
  listSpacesValidator,
} from './validators/space.validator.js';

const router = Router();

/**
 * @route   GET /api/spaces
 * @desc    Get all spaces (with pagination and filters)
 * @access  Protected (API Key)
 */
router.get(
  '/',
  validate(listSpacesValidator),
  spaceController.getAll.bind(spaceController)
);

/**
 * @route   GET /api/spaces/:id
 * @desc    Get space by ID
 * @access  Protected (API Key)
 */
router.get(
  '/:id',
  validate(spaceIdValidator),
  spaceController.getById.bind(spaceController)
);

/**
 * @route   POST /api/spaces
 * @desc    Create a new space
 * @access  Protected (API Key)
 */
router.post(
  '/',
  validate(createSpaceValidator),
  spaceController.create.bind(spaceController)
);

/**
 * @route   PUT /api/spaces/:id
 * @desc    Update a space
 * @access  Protected (API Key)
 */
router.put(
  '/:id',
  validate(updateSpaceValidator),
  spaceController.update.bind(spaceController)
);

/**
 * @route   DELETE /api/spaces/:id
 * @desc    Delete a space
 * @access  Protected (API Key)
 */
router.delete(
  '/:id',
  validate(spaceIdValidator),
  spaceController.delete.bind(spaceController)
);

export default router;
