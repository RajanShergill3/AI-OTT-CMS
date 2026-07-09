import { ERROR_CODES } from '../constants/error-codes.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { AppError } from '../middleware/error.middleware.js';
import type { JwtVerificationError } from '../services/jwt.service.js';

type TokenContext = 'access' | 'refresh';

const MESSAGES = {
  invalidCredentials: 'Invalid email or password',
  duplicateEmail: 'Email already registered',
  inactiveUser: 'Your account has been deactivated. Contact an administrator.',
  unauthorized: 'Authentication required',
  accessTokenMissing: 'Access token is missing',
  forbidden: 'You do not have permission to access this resource',
  accessTokenInvalid: 'Access token is invalid',
  accessTokenExpired: 'Access token has expired',
  refreshTokenMissing: 'Refresh token is required',
  refreshTokenInvalid: 'Refresh token is invalid. Please log in again.',
  refreshTokenExpired: 'Refresh token has expired. Please log in again.',
} as const;

/**
 * Factory helpers for authentication and authorization errors.
 * All errors use the standardized API error envelope via {@link AppError}.
 */
export const AuthErrors = {
  invalidCredentials: (): AppError =>
    new AppError(
      MESSAGES.invalidCredentials,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_CREDENTIALS,
    ),

  duplicateEmail: (): AppError =>
    new AppError(MESSAGES.duplicateEmail, HTTP_STATUS.CONFLICT, ERROR_CODES.DUPLICATE_EMAIL),

  inactiveUser: (): AppError =>
    new AppError(MESSAGES.inactiveUser, HTTP_STATUS.FORBIDDEN, ERROR_CODES.ACCOUNT_INACTIVE),

  unauthorized: (message: string = MESSAGES.unauthorized): AppError =>
    new AppError(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED),

  accessTokenMissing: (): AppError =>
    new AppError(MESSAGES.accessTokenMissing, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED),

  forbidden: (message: string = MESSAGES.forbidden): AppError =>
    new AppError(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN),

  invalidToken: (message: string = MESSAGES.accessTokenInvalid): AppError =>
    new AppError(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN),

  expiredToken: (message: string = MESSAGES.accessTokenExpired): AppError =>
    new AppError(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED),

  refreshTokenMissing: (): AppError =>
    new AppError(
      MESSAGES.refreshTokenMissing,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_REFRESH_TOKEN,
    ),

  refreshTokenInvalid: (): AppError =>
    new AppError(
      MESSAGES.refreshTokenInvalid,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_REFRESH_TOKEN,
    ),

  refreshTokenExpired: (): AppError =>
    new AppError(
      MESSAGES.refreshTokenExpired,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.TOKEN_EXPIRED,
    ),
};

/**
 * Map a JWT verification failure to a standardized auth error.
 */
export const fromJwtVerificationError = (
  error: JwtVerificationError,
  context: TokenContext = 'access',
): AppError => {
  if (error.reason === 'expired') {
    return context === 'refresh'
      ? AuthErrors.refreshTokenExpired()
      : AuthErrors.expiredToken();
  }

  return context === 'refresh' ? AuthErrors.refreshTokenInvalid() : AuthErrors.invalidToken();
};
