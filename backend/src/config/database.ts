import { config } from './index.js';

export const databaseConfig = {
  uri: config.mongodb.uri,
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
} as const;
