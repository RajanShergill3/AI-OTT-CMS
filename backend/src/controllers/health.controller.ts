import type { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import { getHealthCheck } from '../services/health.service.js';
import { sendSuccess } from '../utils/api-response.js';

/**
 * GET /api/v1/health
 * Returns application health and runtime metadata.
 */
export const getHealth = (_req: Request, res: Response): void => {
  const health = getHealthCheck();

  sendSuccess(res, health, {
    status: HTTP_STATUS.OK,
    message: 'Service is healthy',
  });
};
