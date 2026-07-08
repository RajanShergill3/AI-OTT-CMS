import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key: string, defaultValue: string): string => {
  return process.env[key] ?? defaultValue;
};

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '5000'), 10),
  apiPrefix: optional('API_PREFIX', '/api/v1'),
  isProduction: optional('NODE_ENV', 'development') === 'production',

  mongodb: {
    uri: optional('MONGODB_URI', 'mongodb://localhost:27017/ai-ott-cms'),
  },

  jwt: {
    secret: optional('JWT_SECRET', 'dev-jwt-secret-change-in-production'),
    refreshSecret: optional('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-production'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  cors: {
    origin: optional('CORS_ORIGIN', 'http://localhost:5173'),
  },

  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    maxRequests: parseInt(optional('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  },
} as const;

export const validateConfig = (): void => {
  if (config.isProduction) {
    required('JWT_SECRET');
    required('JWT_REFRESH_SECRET');
    required('MONGODB_URI');
  }
};

export { databaseConfig } from './database.js';
export { jwtConfig } from './jwt.js';
export { corsConfig } from './cors.js';
export { connectDatabase, disconnectDatabase, getDatabaseStatus } from './connection.js';
