export {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus,
  setShutdownCallback,
} from './connection.js';

export type {
  ConnectDatabaseOptions,
  DatabaseReadyState,
  DatabaseStatus,
  GracefulShutdownCallback,
} from './types.js';
