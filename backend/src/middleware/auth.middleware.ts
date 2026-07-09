import type { NextFunction, Request, Response } from 'express';

import { ERROR_CODES } from '../constants/error-codes.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { JwtVerificationError, verifyAccessToken } from '../services/jwt.service.js';
import { AppError } from './error.middleware.js';

const BEARER_SCHEME_PATTERN = /^Bearer\s+/i;

const UNAUTHORIZED_MESSAGE = 'Access token is missing or invalid';

/**
 * Extract a JWT from the `Authorization` header.
 * Expects the format: `Bearer <token>`
 */
const extractBearerToken = (authorizationHeader: string | undefined): string | undefined => {
  if (!authorizationHeader || !BEARER_SCHEME_PATTERN.test(authorizationHeader)) {
    return undefined;
  }

  const token = authorizationHeader.replace(BEARER_SCHEME_PATTERN, '').trim();
  return token.length > 0 ? token : undefined;
};

/**
 * Authentication middleware.
 *
 * - Reads the access token from the `Authorization: Bearer <token>` header
 * - Validates the JWT signature, expiry, issuer, and audience
 * - Attaches the authenticated user to `req.user`
 *
 * @throws {AppError} 401 Unauthorized when the token is missing, invalid, or expired
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw new AppError(UNAUTHORIZED_MESSAGE, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof JwtVerificationError) {
      throw new AppError(UNAUTHORIZED_MESSAGE, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    throw error;
  }
};

/**
 * Alias for {@link authenticate}.
 */
export const authMiddleware = authenticate;
