import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

import { ERROR_CODES } from '../constants/error-codes.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { formatZodErrors, type ValidationResult } from '../validators/zod.util.js';
import { AppError } from './error.middleware.js';

type RequestProperty = 'body' | 'query' | 'params';

export const validate =
  <T>(property: RequestProperty, validator: (input: unknown) => ValidationResult<T>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = validator(req[property]);

    if (!result.success) {
      throw new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        result.errors,
      );
    }

    req[property] = result.data;
    next();
  };

/**
 * Validate `req.query` against a Zod schema.
 */
export const validateQuery =
  <T>(schema: ZodType<T>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      throw new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        formatZodErrors(result.error),
      );
    }

    req.query = result.data as Request['query'];
    next();
  };

/**
 * Validate `req.params` against a Zod schema.
 */
export const validateParams =
  <T>(schema: ZodType<T>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      throw new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        formatZodErrors(result.error),
      );
    }

    req.params = result.data as Request['params'];
    next();
  };

/**
 * Validate `req.body` against a Zod schema.
 */
export const validateBody =
  <T>(schema: ZodType<T>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        formatZodErrors(result.error),
      );
    }

    req.body = result.data;
    next();
  };
