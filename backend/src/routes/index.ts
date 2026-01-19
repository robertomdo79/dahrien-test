import { Router } from 'express';
import placeRoutes from './place.routes.js';
import spaceRoutes from './space.routes.js';
import reservationRoutes from './reservation.routes.js';
import telemetryRoutes from './telemetry.routes.js';

const router = Router();

// Mount routes
router.use('/places', placeRoutes);
router.use('/spaces', spaceRoutes);
router.use('/reservations', reservationRoutes);
router.use('/telemetry', telemetryRoutes);

export default router;
