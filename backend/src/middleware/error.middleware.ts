import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { getRequestId, sendError } from '../utils/api-response.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: { field: string; message: string }[];

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, {
    status: HTTP_STATUS.NOT_FOUND,
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    requestId: getRequestId(req),
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
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
    sendError(res, {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    });
    return;
  }

  sendError(res, {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_ERROR',
    message: err.message,
    requestId,
  });
};
