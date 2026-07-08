export { env, loadEnv } from './env.loader.js';
export { databaseConfig } from './database.js';
export type { DatabaseConfig } from './database.js';
export { jwtConfig } from './jwt.js';
export { corsConfig } from './cors.js';

export {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus,
  setShutdownCallback,
} from '../database/index.js';

export type {
  ConnectDatabaseOptions,
  DatabaseReadyState,
  DatabaseStatus,
  GracefulShutdownCallback,
} from '../database/index.js';

import { env, loadEnv } from './env.loader.js';

/**
 * Application configuration module.
 * Built from validated environment variables — see env.loader.ts.
 */
export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  apiPrefix: env.API_PREFIX,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',

  mongodb: {
    uri: env.MONGODB_URI,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },

  client: {
    url: env.CLIENT_URL,
  },

  cors: {
    origin: env.CLIENT_URL,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
} as const;

export type AppConfig = typeof config;

/**
 * Explicit validation entry point.
 * Environment is already validated when this module is imported;
 * calling this re-runs validation (e.g. in tests after env changes).
 */
export const validateConfig = (): void => {
  loadEnv();
};
