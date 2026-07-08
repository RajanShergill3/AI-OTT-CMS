/**
 * Middleware layer barrel export.
 *
 * Cross-cutting Express middleware — auth, RBAC, validation, errors, rate limiting.
 */

export { apiRateLimiter } from './rate-limit.middleware.js';
export { AppError, errorHandler, notFoundHandler } from './error.middleware.js';

// Export as implemented:
// export * from './auth.middleware.js';
// export * from './rbac.middleware.js';
// export * from './validate.middleware.js';
// export * from './tenant.middleware.js';
