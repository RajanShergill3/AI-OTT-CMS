/**
 * Controller layer barrel export.
 *
 * Controllers parse HTTP requests, invoke services, and shape responses.
 * They must not contain business logic or direct database access.
 */

export { getHealth } from './health.controller.js';

// Domain controllers — export as implemented:
// export * from './auth.controller.js';
// export * from './movie.controller.js';
// export * from './category.controller.js';
// export * from './user.controller.js';
// export * from './dashboard.controller.js';
// export * from './analytics.controller.js';
// export * from './ai.controller.js';
// export * from './settings.controller.js';
