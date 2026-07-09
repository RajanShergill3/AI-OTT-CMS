import type { NextFunction, Request, Response } from 'express';

import { AuthErrors, fromJwtVerificationError } from '../errors/auth.errors.js';
import { JwtVerificationError, verifyAccessToken } from '../services/jwt.service.js';

const BEARER_SCHEME_PATTERN = /^Bearer\s+/i;

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
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    throw AuthErrors.accessTokenMissing();
  }

  if (!BEARER_SCHEME_PATTERN.test(authorizationHeader)) {
    throw AuthErrors.unauthorized('Authorization header must use Bearer scheme');
  }

  const token = extractBearerToken(authorizationHeader);

  if (!token) {
    throw AuthErrors.accessTokenMissing();
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
      throw fromJwtVerificationError(error, 'access');
    }

    throw error;
  }
};

/**
 * Alias for {@link authenticate}.
 */
export const authMiddleware = authenticate;
