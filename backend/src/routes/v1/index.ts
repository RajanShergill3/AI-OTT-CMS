import { Router } from 'express';

import authRoutes from './auth.routes.js';
// import healthRoutes from './health.routes.js';
import movieRoutes from './movie.routes.js';

/**
 * API v1 router — aggregates all v1 route modules.
 * Business routes will be mounted here as they are implemented.
 */
const v1Router = Router();

// v1Router.use(healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/movies', movieRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/users', userRoutes);
// router.use('/dashboard', dashboardRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/ai', aiRoutes);
// router.use('/settings', settingsRoutes);

export default v1Router;
