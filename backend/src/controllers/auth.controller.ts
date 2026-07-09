import type { Request, Response } from 'express';

import { REFRESH_TOKEN_COOKIE } from '../constants/auth.constants.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import * as authService from '../services/auth.service.js';
import type { LoginInput, RefreshTokenInput, RegisterInput } from '../types/auth.types.js';
import { sendSuccess } from '../utils/api-response.js';
import {
  clearRefreshTokenCookie,
  parseCookies,
  setRefreshTokenCookie,
} from '../utils/auth-cookie.util.js';

const getRefreshTokenFromRequest = (req: Request): string | undefined => {
  const body = req.body as RefreshTokenInput;
  const bodyToken =
    typeof body.refreshToken === 'string' && body.refreshToken.trim().length > 0
      ? body.refreshToken.trim()
      : undefined;

  if (bodyToken) {
    return bodyToken;
  }

  const cookies = parseCookies(req.headers.cookie);
  return cookies[REFRESH_TOKEN_COOKIE];
};

/**
 * POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const session = await authService.register(req.body as RegisterInput);

  setRefreshTokenCookie(res, session.refreshToken);

  sendSuccess(
    res,
    {
      accessToken: session.accessToken,
      expiresIn: session.expiresIn,
      tokenType: session.tokenType,
      user: session.user,
    },
    {
      status: HTTP_STATUS.CREATED,
      message: 'Registration successful',
    },
  );
};

/**
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const session = await authService.login(req.body as LoginInput);

  setRefreshTokenCookie(res, session.refreshToken);

  sendSuccess(
    res,
    {
      accessToken: session.accessToken,
      expiresIn: session.expiresIn,
      tokenType: session.tokenType,
      user: session.user,
    },
    {
      status: HTTP_STATUS.OK,
      message: 'Login successful',
    },
  );
};

/**
 * POST /api/v1/auth/refresh
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = getRefreshTokenFromRequest(req);
  const tokens = await authService.refreshSession(refreshToken ?? '');

  setRefreshTokenCookie(res, tokens.refreshToken);

  sendSuccess(
    res,
    {
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      tokenType: tokens.tokenType,
    },
    {
      status: HTTP_STATUS.OK,
      message: 'Token refreshed successfully',
    },
  );
};

/**
 * POST /api/v1/auth/logout
 */
export const logout = (_req: Request, res: Response): void => {
  clearRefreshTokenCookie(res);
  res.status(HTTP_STATUS.NO_CONTENT).send();
};

/**
 * GET /api/v1/auth/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const profile = await authService.getProfile(req.user!.id);

  sendSuccess(res, profile, {
    status: HTTP_STATUS.OK,
    message: 'Profile retrieved successfully',
  });
};
