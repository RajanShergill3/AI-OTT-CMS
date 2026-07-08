/**
 * Middleware layer barrel export.
 */

export { AppError, errorHandler } from './error.middleware.js';
export { notFoundHandler } from './not-found.middleware.js';
export { apiRateLimiter } from './rate-limit.middleware.js';
export { requestIdMiddleware } from './request-id.middleware.js';
export { requestLoggerMiddleware } from './request-logger.middleware.js';
export { securityMiddleware } from './security.middleware.js';

// Export as implemented:
// export * from './auth.middleware.js';
// export * from './rbac.middleware.js';
// export * from './validate.middleware.js';
// export * from './tenant.middleware.js';
