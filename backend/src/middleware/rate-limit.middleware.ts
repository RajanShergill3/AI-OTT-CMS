import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { ERROR_CODES } from '../constants/error-codes.js';

/**
 * Rate limiter applied to all /api/v1 routes.
 * Returns standard JSON error envelope on limit exceeded.
 */
export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: 'Too many requests. Please try again later.',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  },
});
