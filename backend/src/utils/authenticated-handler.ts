import type { Request, RequestHandler, Response } from 'express';

import type { ValidatedRequest } from '../types/express.d.js';
import { asyncHandler } from './async-handler.js';

/**
 * Wrap an authenticated controller so errors propagate to the global error handler.
 * Casts `req` to the handler's validated request type at the Express boundary.
 */
export const authenticatedHandler = <
  TBody = unknown,
  TQuery = Request['query'],
  TParams = Request['params'],
>(
  handler: (req: ValidatedRequest<TBody, TQuery, TParams>, res: Response) => Promise<void>,
): RequestHandler =>
  asyncHandler((req, res) => handler(req as ValidatedRequest<TBody, TQuery, TParams>, res));
