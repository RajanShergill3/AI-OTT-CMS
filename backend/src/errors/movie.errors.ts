import { ERROR_CODES } from '../constants/error-codes.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { AppError } from '../middleware/error.middleware.js';
import type { MovieStatus } from '../models/movie.model.js';

const MESSAGES = {
  notFound: 'Movie not found',
  duplicateSlug: (slug: string) => `A movie with slug '${slug}' already exists`,
  invalidStatusTransition: (from: MovieStatus, to: MovieStatus) =>
    `Cannot transition movie status from ${from} to ${to}`,
  publishRequirements:
    'Published movies require both posterUrl and videoUrl before they can be published',
} as const;

/**
 * Factory helpers for movie domain errors.
 */
export const MovieErrors = {
  notFound: (): AppError =>
    new AppError(MESSAGES.notFound, HTTP_STATUS.NOT_FOUND, ERROR_CODES.MOVIE_NOT_FOUND),

  duplicateSlug: (slug: string): AppError =>
    new AppError(MESSAGES.duplicateSlug(slug), HTTP_STATUS.CONFLICT, ERROR_CODES.DUPLICATE_SLUG),

  invalidStatusTransition: (from: MovieStatus, to: MovieStatus): AppError =>
    new AppError(
      MESSAGES.invalidStatusTransition(from, to),
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.INVALID_STATUS_TRANSITION,
    ),

  publishRequirements: (): AppError =>
    new AppError(
      MESSAGES.publishRequirements,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_ERROR,
    ),
};
