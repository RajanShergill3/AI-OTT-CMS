import type { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import { ERROR_CODES } from '../constants/error-codes.js';
import { getRequestId, sendError } from '../utils/api-response.js';

/**
 * 404 handler — must be registered after all routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, {
    status: HTTP_STATUS.NOT_FOUND,
    code: ERROR_CODES.NOT_FOUND,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    requestId: getRequestId(req),
  });
};
