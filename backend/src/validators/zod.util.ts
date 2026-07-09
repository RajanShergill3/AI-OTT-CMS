import type { ZodError, ZodType } from 'zod';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationErrorDetail[] };

export const formatZodErrors = (error: ZodError): ValidationErrorDetail[] => {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : 'body',
    message: issue.message,
  }));
};

export const createValidator =
  <T>(schema: ZodType<T>) =>
  (input: unknown): ValidationResult<T> => {
    const result = schema.safeParse(input);

    if (!result.success) {
      return {
        success: false,
        errors: formatZodErrors(result.error),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  };
