import type { Response } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config/index.js';
import { AUTH_COOKIE_PATH, REFRESH_TOKEN_COOKIE } from '../constants/auth.constants.js';

const DURATION_PATTERN = /^(\d+)([smhd])$/;

export const parseDurationToMilliseconds = (duration: string): number => {
  const match = DURATION_PATTERN.exec(duration.trim());

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return value * (multipliers[unit] ?? 86_400_000);
};

export const getTokenExpiresInSeconds = (token: string): number => {
  const decoded = jwt.decode(token);

  if (
    !decoded ||
    typeof decoded === 'string' ||
    decoded.exp === undefined ||
    decoded.iat === undefined
  ) {
    return 0;
  }

  return decoded.exp - decoded.iat;
};

export const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separatorIndex = part.indexOf('=');

    if (separatorIndex === -1) {
      return cookies;
    }

    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    path: AUTH_COOKIE_PATH,
    maxAge: parseDurationToMilliseconds(config.jwt.refreshExpiresIn),
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    path: AUTH_COOKIE_PATH,
  });
};
