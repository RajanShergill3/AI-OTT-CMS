import { Router } from 'express';
import { config } from '../config/index.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use(healthRoutes);

/**
 * Domain route modules will be mounted here in subsequent milestones:
 *
 * router.use('/auth', authRoutes);
 * router.use('/movies', movieRoutes);
 * router.use('/categories', categoryRoutes);
 * router.use('/users', userRoutes);
 * router.use('/dashboard', dashboardRoutes);
 * router.use('/analytics', analyticsRoutes);
 * router.use('/ai', aiRoutes);
 */

export const createApiRouter = (): Router => {
  const apiRouter = Router();
  apiRouter.use(config.apiPrefix, router);
  return apiRouter;
};
