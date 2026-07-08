/**
 * MongoDB connection states based on Mongoose connection.readyState.
 *
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */
export type DatabaseReadyState =
  | 'disconnected'
  | 'connected'
  | 'connecting'
  | 'disconnecting'
  | 'unknown';

export interface DatabaseStatus {
  readyState: DatabaseReadyState;
  isConnected: boolean;
  host: string | null;
  name: string | null;
}

export type GracefulShutdownCallback = () => Promise<void>;

export interface ConnectDatabaseOptions {
  /**
   * Register SIGINT / SIGTERM handlers.
   * Default: false
   */
  registerSignalHandlers?: boolean;

  /**
   * Callback executed before MongoDB disconnects.
   * Example: close HTTP server.
   */
  onShutdown?: GracefulShutdownCallback;

  /**
   * Force shutdown timeout.
   * Default: 10000 ms
   */
  shutdownTimeoutMs?: number;
}