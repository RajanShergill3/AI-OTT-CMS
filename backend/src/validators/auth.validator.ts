import { USER_ROLES, type UserRole } from '../models/user.model.js';
import type { LoginInput, RefreshTokenInput, RegisterInput } from '../types/auth.types.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;
const NAME_MAX_LENGTH = 100;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationErrorDetail[] };

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const validateEmail = (value: unknown, errors: ValidationErrorDetail[], required = true): string | undefined => {
  if (value === undefined || value === null || value === '') {
    if (required) {
      errors.push({ field: 'email', message: 'Email is required' });
    }
    return undefined;
  }

  if (typeof value !== 'string') {
    errors.push({ field: 'email', message: 'Email must be a string' });
    return undefined;
  }

  const email = value.trim().toLowerCase();

  if (email.length > EMAIL_MAX_LENGTH) {
    errors.push({ field: 'email', message: `Email cannot exceed ${EMAIL_MAX_LENGTH} characters` });
    return undefined;
  }

  if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Email must be a valid email address' });
    return undefined;
  }

  return email;
};

const validateName = (
  value: unknown,
  field: 'firstName' | 'lastName',
  errors: ValidationErrorDetail[],
): string | undefined => {
  if (!isNonEmptyString(value)) {
    errors.push({ field, message: `${field === 'firstName' ? 'First name' : 'Last name'} is required` });
    return undefined;
  }

  const name = value.trim();

  if (name.length > NAME_MAX_LENGTH) {
    errors.push({
      field,
      message: `${field === 'firstName' ? 'First name' : 'Last name'} cannot exceed ${NAME_MAX_LENGTH} characters`,
    });
    return undefined;
  }

  return name;
};

const validatePassword = (
  value: unknown,
  errors: ValidationErrorDetail[],
  options: { field?: string; minLength?: number; required?: boolean } = {},
): string | undefined => {
  const field = options.field ?? 'password';
  const minLength = options.minLength ?? PASSWORD_MIN_LENGTH;
  const required = options.required ?? true;

  if (value === undefined || value === null || value === '') {
    if (required) {
      errors.push({ field, message: 'Password is required' });
    }
    return undefined;
  }

  if (typeof value !== 'string') {
    errors.push({ field, message: 'Password must be a string' });
    return undefined;
  }

  if (value.length < minLength) {
    errors.push({ field, message: `Password must be at least ${minLength} characters` });
    return undefined;
  }

  if (value.length > PASSWORD_MAX_LENGTH) {
    errors.push({ field, message: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters` });
    return undefined;
  }

  return value;
};

const validateRole = (value: unknown, errors: ValidationErrorDetail[]): UserRole | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string' || !USER_ROLES.includes(value as UserRole)) {
    errors.push({ field: 'role', message: 'Role must be one of: ADMIN, EDITOR, VIEWER' });
    return undefined;
  }

  return value as UserRole;
};

export const validateRegisterBody = (body: unknown): ValidationResult<RegisterInput> => {
  const errors: ValidationErrorDetail[] = [];

  if (!isRecord(body)) {
    return {
      success: false,
      errors: [{ field: 'body', message: 'Request body must be a JSON object' }],
    };
  }

  const firstName = validateName(body.firstName, 'firstName', errors);
  const lastName = validateName(body.lastName, 'lastName', errors);
  const email = validateEmail(body.email, errors);
  const password = validatePassword(body.password, errors);
  const role = validateRole(body.role, errors);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      firstName: firstName!,
      lastName: lastName!,
      email: email!,
      password: password!,
      ...(role ? { role } : {}),
    },
  };
};

export const validateLoginBody = (body: unknown): ValidationResult<LoginInput> => {
  const errors: ValidationErrorDetail[] = [];

  if (!isRecord(body)) {
    return {
      success: false,
      errors: [{ field: 'body', message: 'Request body must be a JSON object' }],
    };
  }

  const email = validateEmail(body.email, errors);
  const password = validatePassword(body.password, errors, { minLength: 1 });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      email: email!,
      password: password!,
    },
  };
};

export const validateRefreshBody = (body: unknown): ValidationResult<RefreshTokenInput> => {
  if (!isRecord(body)) {
    return { success: true, data: {} };
  }

  if (body.refreshToken === undefined || body.refreshToken === null || body.refreshToken === '') {
    return { success: true, data: {} };
  }

  if (typeof body.refreshToken !== 'string') {
    return {
      success: false,
      errors: [{ field: 'refreshToken', message: 'Refresh token must be a string' }],
    };
  }

  return {
    success: true,
    data: {
      refreshToken: body.refreshToken.trim(),
    },
  };
};
