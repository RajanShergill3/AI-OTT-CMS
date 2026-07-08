import type { NextFunction, Request, Response } from 'express';

import { config } from '../config/index.js';
import { getRequestId } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

const resolveRequestLogLevel = (statusCode: number): 'error' | 'warn' | 'info' => {
  if (statusCode >= 500) {
    return 'error';
  }

  if (statusCode >= 400) {
    return 'warn';
  }

  return 'info';
};

/**
 * Express middleware that logs HTTP requests on response finish.
 * Replaces Morgan — integrates with the Winston logger and request ID.
 */
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (config.isTest && req.originalUrl === '/api/v1/health') {
    next();
    return;
  }

  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
    const statusCode = res.statusCode;
    const level = resolveRequestLogLevel(statusCode);

    logger.log(level, 'HTTP request completed', {
      type: 'http',
      method: req.method,
      url: req.originalUrl,
      statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      contentLength: res.getHeader('content-length') ?? 0,
      requestId: getRequestId(req),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
};
