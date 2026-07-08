import type { ConnectOptions } from 'mongoose';

import { env } from './env.loader.js';

/**
 * MongoDB / Mongoose connection configuration.
 * Connection logic lives in src/database/connection.ts.
 */
export const databaseConfig = {
  uri: env.MONGODB_URI,
  options: {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5_000,
    socketTimeoutMS: 45_000,
    heartbeatFrequencyMS: 10_000,
    retryWrites: true,
    retryReads: true,
    autoIndex: env.NODE_ENV !== 'production',
  } satisfies ConnectOptions,
} as const;

export type DatabaseConfig = typeof databaseConfig;
