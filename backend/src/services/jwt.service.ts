import type { JwtPayload, SignOptions, VerifyOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import { jwtConfig } from '../config/jwt.js';

const TOKEN_ISSUER = 'ai-ott-cms';
const TOKEN_AUDIENCE = 'ai-ott-cms-api';
const ACCESS_TOKEN_TYPE = 'access' as const;
const REFRESH_TOKEN_TYPE = 'refresh' as const;

export type JwtVerificationFailureReason = 'expired' | 'invalid' | 'malformed';

export class JwtVerificationError extends Error {
  public readonly reason: JwtVerificationFailureReason;

  constructor(message: string, reason: JwtVerificationFailureReason) {
    super(message);
    this.name = 'JwtVerificationError';
    this.reason = reason;
  }
}

export interface AccessTokenClaims {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenClaims {
  userId: string;
}

export interface VerifiedAccessToken extends AccessTokenClaims {
  issuedAt: number;
  expiresAt: number;
}

export interface VerifiedRefreshToken extends RefreshTokenClaims {
  issuedAt: number;
  expiresAt: number;
}

interface AccessTokenPayload {
  sub: string;
  type: typeof ACCESS_TOKEN_TYPE;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface RefreshTokenPayload {
  sub: string;
  type: typeof REFRESH_TOKEN_TYPE;
  iat?: number;
  exp?: number;
}

const accessTokenSignOptions: SignOptions = {
  expiresIn: jwtConfig.expiresIn as SignOptions['expiresIn'],
  issuer: TOKEN_ISSUER,
  audience: TOKEN_AUDIENCE,
  algorithm: 'HS256',
};

const refreshTokenSignOptions: SignOptions = {
  expiresIn: jwtConfig.refreshExpiresIn as SignOptions['expiresIn'],
  issuer: TOKEN_ISSUER,
  audience: TOKEN_AUDIENCE,
  algorithm: 'HS256',
};

const accessTokenVerifyOptions: VerifyOptions = {
  issuer: TOKEN_ISSUER,
  audience: TOKEN_AUDIENCE,
  algorithms: ['HS256'],
};

const refreshTokenVerifyOptions: VerifyOptions = {
  issuer: TOKEN_ISSUER,
  audience: TOKEN_AUDIENCE,
  algorithms: ['HS256'],
};

const toUnixTimestamp = (value: Date | number | undefined): number => {
  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1000);
  }

  if (typeof value === 'number') {
    return value;
  }

  return Math.floor(Date.now() / 1000);
};

const mapVerificationError = (error: unknown): JwtVerificationError => {
  if (error instanceof jwt.TokenExpiredError) {
    return new JwtVerificationError('Token has expired', 'expired');
  }

  if (error instanceof jwt.NotBeforeError) {
    return new JwtVerificationError('Token is not yet valid', 'invalid');
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return new JwtVerificationError('Token is invalid', 'invalid');
  }

  return new JwtVerificationError('Token verification failed', 'malformed');
};

const assertAccessTokenPayload = (decoded: JwtPayload | string): AccessTokenPayload => {
  if (typeof decoded === 'string') {
    throw new JwtVerificationError('Access token payload is malformed', 'malformed');
  }

  if (decoded.type !== ACCESS_TOKEN_TYPE) {
    throw new JwtVerificationError('Invalid access token type', 'invalid');
  }

  if (typeof decoded.sub !== 'string' || decoded.sub.length === 0) {
    throw new JwtVerificationError('Access token subject is missing', 'malformed');
  }

  if (typeof decoded.email !== 'string' || decoded.email.length === 0) {
    throw new JwtVerificationError('Access token email claim is missing', 'malformed');
  }

  if (typeof decoded.role !== 'string' || decoded.role.length === 0) {
    throw new JwtVerificationError('Access token role claim is missing', 'malformed');
  }

  return {
    sub: decoded.sub,
    type: ACCESS_TOKEN_TYPE,
    email: decoded.email,
    role: decoded.role,
    iat: decoded.iat,
    exp: decoded.exp,
  };
};

const assertRefreshTokenPayload = (decoded: JwtPayload | string): RefreshTokenPayload => {
  if (typeof decoded === 'string') {
    throw new JwtVerificationError('Refresh token payload is malformed', 'malformed');
  }

  if (decoded.type !== REFRESH_TOKEN_TYPE) {
    throw new JwtVerificationError('Invalid refresh token type', 'invalid');
  }

  if (typeof decoded.sub !== 'string' || decoded.sub.length === 0) {
    throw new JwtVerificationError('Refresh token subject is missing', 'malformed');
  }

  return {
    sub: decoded.sub,
    type: REFRESH_TOKEN_TYPE,
    iat: decoded.iat,
    exp: decoded.exp,
  };
};

/**
 * Generate a signed JWT access token.
 */
export const generateAccessToken = (claims: AccessTokenClaims): string => {
  const payload: AccessTokenPayload = {
    sub: claims.userId,
    email: claims.email,
    role: claims.role,
    type: ACCESS_TOKEN_TYPE,
  };

  return jwt.sign(payload, jwtConfig.secret, accessTokenSignOptions);
};

/**
 * Generate a signed JWT refresh token.
 */
export const generateRefreshToken = (claims: RefreshTokenClaims): string => {
  const payload: RefreshTokenPayload = {
    sub: claims.userId,
    type: REFRESH_TOKEN_TYPE,
  };

  return jwt.sign(payload, jwtConfig.refreshSecret, refreshTokenSignOptions);
};

/**
 * Verify and decode an access token.
 *
 * @throws {JwtVerificationError} When the token is expired, invalid, or malformed
 */
export const verifyAccessToken = (token: string): VerifiedAccessToken => {
  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new JwtVerificationError('Access token is required', 'malformed');
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, accessTokenVerifyOptions);
    const payload = assertAccessTokenPayload(decoded);

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      issuedAt: toUnixTimestamp(payload.iat),
      expiresAt: toUnixTimestamp(payload.exp),
    };
  } catch (error) {
    if (error instanceof JwtVerificationError) {
      throw error;
    }

    throw mapVerificationError(error);
  }
};

/**
 * Verify and decode a refresh token.
 *
 * @throws {JwtVerificationError} When the token is expired, invalid, or malformed
 */
export const verifyRefreshToken = (token: string): VerifiedRefreshToken => {
  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new JwtVerificationError('Refresh token is required', 'malformed');
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret, refreshTokenVerifyOptions);
    const payload = assertRefreshTokenPayload(decoded);

    return {
      userId: payload.sub,
      issuedAt: toUnixTimestamp(payload.iat),
      expiresAt: toUnixTimestamp(payload.exp),
    };
  } catch (error) {
    if (error instanceof JwtVerificationError) {
      throw error;
    }

    throw mapVerificationError(error);
  }
};

/**
 * Access token lifetime from environment configuration (e.g. `15m`, `1h`).
 */
export const getAccessTokenExpiresIn = (): string => jwtConfig.expiresIn;

/**
 * Refresh token lifetime from environment configuration (e.g. `7d`).
 */
export const getRefreshTokenExpiresIn = (): string => jwtConfig.refreshExpiresIn;
