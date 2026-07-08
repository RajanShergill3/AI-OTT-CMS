import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

/**
 * Attaches a unique request ID for tracing across logs and error responses.
 * Uses incoming X-Request-Id header when provided, otherwise generates a UUID.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = req.headers['x-request-id'];
  const requestId =
    typeof incoming === 'string' && incoming.trim() !== '' ? incoming : randomUUID();

  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
};
