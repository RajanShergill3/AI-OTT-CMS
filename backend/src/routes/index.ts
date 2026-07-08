import { Router } from 'express';
import { config } from '../config/index.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use(healthRoutes);

/**
 * Domain route modules — mount as implemented:
 *
 * import authRoutes from './auth.routes.js';
 * import movieRoutes from './movie.routes.js';
 * import categoryRoutes from './category.routes.js';
 * import userRoutes from './user.routes.js';
 * import dashboardRoutes from './dashboard.routes.js';
 * import analyticsRoutes from './analytics.routes.js';
 * import aiRoutes from './ai.routes.js';
 * import settingsRoutes from './settings.routes.js';
 *
 * router.use('/auth', authRoutes);
 * router.use('/movies', movieRoutes);
 * router.use('/categories', categoryRoutes);
 * router.use('/users', userRoutes);
 * router.use('/dashboard', dashboardRoutes);
 * router.use('/analytics', analyticsRoutes);
 * router.use('/ai', aiRoutes);
 * router.use('/settings', settingsRoutes);
 */

export const createApiRouter = (): Router => {
  const apiRouter = Router();
  apiRouter.use(config.apiPrefix, router);
  return apiRouter;
};

export { default as healthRoutes } from './health.routes.js';
export { default as authRoutes } from './auth.routes.js';
export { default as movieRoutes } from './movie.routes.js';
export { default as categoryRoutes } from './category.routes.js';
export { default as userRoutes } from './user.routes.js';
export { default as dashboardRoutes } from './dashboard.routes.js';
export { default as analyticsRoutes } from './analytics.routes.js';
export { default as aiRoutes } from './ai.routes.js';
export { default as settingsRoutes } from './settings.routes.js';
