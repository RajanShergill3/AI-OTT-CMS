/**
 * Validator layer barrel export.
 *
 * Request validation schemas for body, query, and route params.
 * Decoupled from controllers for reuse and testability.
 */

export type {
  ChangePasswordInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
} from './auth.validator.js';
export {
  changePasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  validateChangePasswordBody,
  validateLoginBody,
  validateRefreshBody,
  validateRegisterBody,
} from './auth.validator.js';
export type { ValidationErrorDetail, ValidationResult } from './zod.util.js';
