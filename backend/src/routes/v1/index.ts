import { Router } from 'express';
import healthRoutes from './health.routes.js';

/**
 * API v1 router — aggregates all v1 route modules.
 * Business routes will be mounted here as they are implemented.
 */
const v1Router = Router();

v1Router.use(healthRoutes);

// router.use('/auth', authRoutes);
// router.use('/movies', movieRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/users', userRoutes);
// router.use('/dashboard', dashboardRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/ai', aiRoutes);
// router.use('/settings', settingsRoutes);

export default v1Router;
