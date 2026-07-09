import { z } from 'zod';

import { USER_ROLES } from '../models/user.model.js';
import { createValidator } from './zod.util.js';

const EMAIL_MAX_LENGTH = 254;
const NAME_MAX_LENGTH = 100;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const firstNameSchema = z
  .string()
  .trim()
  .min(1, 'First name is required')
  .max(NAME_MAX_LENGTH, `First name cannot exceed ${NAME_MAX_LENGTH} characters`);

const lastNameSchema = z
  .string()
  .trim()
  .min(1, 'Last name is required')
  .max(NAME_MAX_LENGTH, `Last name cannot exceed ${NAME_MAX_LENGTH} characters`);

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Email must be a valid email address')
  .max(EMAIL_MAX_LENGTH, `Email cannot exceed ${EMAIL_MAX_LENGTH} characters`);

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`);

const userRoleSchema = z.enum(USER_ROLES, {
  message: 'Role must be one of: ADMIN, EDITOR, VIEWER',
});

/**
 * POST /auth/register
 */
export const registerSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.optional(),
});

/**
 * POST /auth/login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(PASSWORD_MAX_LENGTH, `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`),
});

/**
 * POST /auth/refresh
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token cannot be empty').optional(),
});

/**
 * PATCH /auth/change-password
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required')
      .max(PASSWORD_MAX_LENGTH, `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Confirm password is required')
      .max(PASSWORD_MAX_LENGTH, `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const validateRegisterBody = createValidator(registerSchema);
export const validateLoginBody = createValidator(loginSchema);
export const validateRefreshBody = createValidator(refreshTokenSchema);
export const validateChangePasswordBody = createValidator(changePasswordSchema);

export type { ValidationErrorDetail, ValidationResult } from './zod.util.js';
