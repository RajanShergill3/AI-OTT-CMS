/**
 * MongoDB connection state derived from Mongoose readyState.
 * @see https://mongoosejs.com/docs/api/connection.html#Connection.prototype.readyState
 */
export type DatabaseReadyState =
  'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'unknown';

export interface DatabaseStatus {
  readyState: DatabaseReadyState;
  isConnected: boolean;
  host: string | null;
  name: string | null;
}

export type GracefulShutdownCallback = () => Promise<void>;

export interface ConnectDatabaseOptions {
  /** Register SIGINT / SIGTERM handlers for graceful database shutdown. Default: false */
  registerSignalHandlers?: boolean;
  /** Async callback invoked before the database connection is closed (e.g. close HTTP server) */
  onShutdown?: GracefulShutdownCallback;
  /** Force shutdown after this many milliseconds. Default: 10_000 */
  shutdownTimeoutMs?: number;
}
