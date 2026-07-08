/**
 * Route layer barrel export.
 * Versioned API routes live under ./v1/
 */

export { default as v1Router } from './v1/index.js';

// Re-export v1 route modules for convenience:
export { default as healthRoutes } from './v1/health.routes.js';

// Placeholder route modules (mount in v1/index.ts when implemented):
export { default as authRoutes } from './auth.routes.js';
export { default as movieRoutes } from './movie.routes.js';
export { default as categoryRoutes } from './category.routes.js';
export { default as userRoutes } from './user.routes.js';
export { default as dashboardRoutes } from './dashboard.routes.js';
export { default as analyticsRoutes } from './analytics.routes.js';
export { default as aiRoutes } from './ai.routes.js';
export { default as settingsRoutes } from './settings.routes.js';
