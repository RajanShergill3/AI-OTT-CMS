import type { NextFunction, Request, Response } from 'express';

import { AuthErrors } from '../errors/auth.errors.js';
import { USER_ROLES, type UserRole } from '../models/user.model.js';

const normalizeRole = (role: string | undefined): UserRole | null => {
  if (!role) {
    return null;
  }

  const normalizedRole = role.toUpperCase();

  if (USER_ROLES.includes(normalizedRole as UserRole)) {
    return normalizedRole as UserRole;
  }

  return null;
};

const assertAuthenticated = (req: Request): UserRole => {
  if (!req.user) {
    throw AuthErrors.unauthorized('Access token is missing or invalid');
  }

  const userRole = normalizeRole(req.user.role);

  if (!userRole) {
    throw AuthErrors.forbidden();
  }

  return userRole;
};

const assertAllowedRole = (userRole: UserRole, allowedRoles: UserRole[]): void => {
  if (!allowedRoles.includes(userRole)) {
    throw AuthErrors.forbidden();
  }
};

/**
 * Authorization middleware — user must have the specified role.
 *
 * Must be used after {@link authenticate}.
 */
export const requireRole =
  (role: UserRole) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = assertAuthenticated(req);
    assertAllowedRole(userRole, [role]);
    next();
  };

/**
 * Authorization middleware — user must have at least one of the specified roles.
 *
 * Must be used after {@link authenticate}.
 */
export const requireAnyRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (roles.length === 0) {
      throw AuthErrors.forbidden();
    }

    const userRole = assertAuthenticated(req);
    assertAllowedRole(userRole, roles);
    next();
  };
