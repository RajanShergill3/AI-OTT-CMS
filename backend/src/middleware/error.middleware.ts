import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { ERROR_CODES } from '../constants/error-codes.js';
import { getRequestId, sendError } from '../utils/api-response.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: { field: string; message: string }[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    details?: { field: string; message: string }[],
    isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler — must be the last middleware registered.
 * Four-argument signature required by Express for error middleware.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (res.headersSent) {
    return;
  }

  const requestId = getRequestId(req);

  if (err instanceof AppError) {
    sendError(res, {
      status: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
      requestId,
    });
    return;
  }

  if (config.isProduction) {
    console.error('[error]', { requestId, message: err.message, stack: err.stack });
    sendError(res, {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      requestId,
    });
    return;
  }

  console.error('[error]', { requestId, err });
  sendError(res, {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.INTERNAL_ERROR,
    message: err.message,
    requestId,
  });
};
