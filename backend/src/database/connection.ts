import mongoose from 'mongoose';

import { databaseConfig } from '../config/database.js';
import { logger } from '../utils/logger.js';
import type {
  ConnectDatabaseOptions,
  DatabaseReadyState,
  DatabaseStatus,
  GracefulShutdownCallback,
} from './types.js';

/**
 * Mongoose connection ready state values.
 *
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */
const STATES = {
  disconnected: 0,
  connected: 1,
  connecting: 2,
  disconnecting: 3,
} as const;

const READY_STATE_MAP: Record<number, DatabaseReadyState> = {
  [STATES.disconnected]: 'disconnected',
  [STATES.connected]: 'connected',
  [STATES.connecting]: 'connecting',
  [STATES.disconnecting]: 'disconnecting',
};

let listenersAttached = false;
let shutdownInProgress = false;
let shutdownCallback: GracefulShutdownCallback | undefined;
let shutdownTimeoutMs = 10_000;

const mapReadyState = (state: number): DatabaseReadyState => {
  return READY_STATE_MAP[state] ?? 'disconnected';
};

const matchesReadyState = (
  connection: mongoose.Connection,
  expected: (typeof STATES)[keyof typeof STATES],
): boolean => Number(connection.readyState) === expected;

const maskUri = (uri: string): string => uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');

const attachConnectionEventListeners = (): void => {
  if (listenersAttached) {
    return;
  }

  listenersAttached = true;
  const { connection } = mongoose;

  connection.on('connected', () => {
    logger.info('MongoDB connected', {
      type: 'database',
      host: connection.host,
      database: connection.name,
    });
  });

  connection.on('reconnected', () => {
    logger.info('MongoDB reconnected', {
      type: 'database',
      host: connection.host,
      database: connection.name,
    });
  });

  connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected', { type: 'database' });
  });

  connection.on('error', (error: Error) => {
    logger.error('MongoDB connection error', {
      type: 'database',
      message: error.message,
      stack: error.stack,
    });
  });
};

const handleShutdownSignal = (signal: NodeJS.Signals) => {
  return async (): Promise<void> => {
    if (shutdownInProgress) {
      logger.warn('Shutdown already in progress', { type: 'shutdown', signal });
      return;
    }

    shutdownInProgress = true;
    logger.info('Graceful shutdown initiated', { type: 'shutdown', signal });

    const forceExitTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit', {
        type: 'shutdown',
        timeoutMs: shutdownTimeoutMs,
      });
      process.exit(1);
    }, shutdownTimeoutMs);

    forceExitTimer.unref();

    try {
      if (shutdownCallback) {
        logger.info('Running pre-disconnect shutdown callback', { type: 'shutdown' });
        await shutdownCallback();
      }

      await disconnectDatabase();
      logger.info('Graceful shutdown complete', { type: 'shutdown' });
      clearTimeout(forceExitTimer);
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', {
        type: 'shutdown',
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      clearTimeout(forceExitTimer);
      process.exit(1);
    }
  };
};

const registerSignalHandlers = (): void => {
  process.once('SIGINT', () => void handleShutdownSignal('SIGINT')());
  process.once('SIGTERM', () => void handleShutdownSignal('SIGTERM')());
};

/**
 * Establish a connection to MongoDB using Mongoose.
 * Idempotent — returns immediately if already connected or awaits an in-flight connection.
 *
 * @throws {Error} When the initial connection attempt fails
 */
export const connectDatabase = async (options: ConnectDatabaseOptions = {}): Promise<void> => {
  const {
    registerSignalHandlers: shouldRegisterSignals = false,
    onShutdown,
    shutdownTimeoutMs: timeout,
  } = options;

  if (timeout !== undefined) {
    shutdownTimeoutMs = timeout;
  }

  if (onShutdown) {
    shutdownCallback = onShutdown;
  }

  mongoose.set('strictQuery', true);
  attachConnectionEventListeners();

  const { connection } = mongoose;

  if (matchesReadyState(connection, STATES.connected)) {
    logger.debug('MongoDB already connected', { type: 'database' });
    if (shouldRegisterSignals) {
      registerSignalHandlers();
    }
    return;
  }

  if (matchesReadyState(connection, STATES.connecting)) {
    logger.debug('MongoDB connection in progress — awaiting existing attempt', {
      type: 'database',
    });

    try {
      await mongoose.connection.asPromise();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown connection error';
      logger.error('MongoDB in-flight connection failed', {
        type: 'database',
        message,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`MongoDB connection failed: ${message}`, { cause: error });
    }

    if (shouldRegisterSignals) {
      registerSignalHandlers();
    }
    return;
  }

  try {
    logger.info('Connecting to MongoDB', {
      type: 'database',
      uri: maskUri(databaseConfig.uri),
    });

    await mongoose.connect(databaseConfig.uri, databaseConfig.options);

    if (shouldRegisterSignals) {
      registerSignalHandlers();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown connection error';
    logger.error('Failed to connect to MongoDB', {
      type: 'database',
      message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(`MongoDB connection failed: ${message}`, { cause: error });
  }
};

/**
 * Gracefully close the MongoDB connection.
 * Safe to call multiple times.
 */
export const disconnectDatabase = async (): Promise<void> => {
  const { connection } = mongoose;

  if (matchesReadyState(connection, STATES.disconnected)) {
    logger.debug('MongoDB already disconnected', { type: 'database' });
    return;
  }

  if (matchesReadyState(connection, STATES.disconnecting)) {
    logger.debug('MongoDB disconnect already in progress', { type: 'database' });
    await mongoose.connection.asPromise().catch(() => undefined);
    return;
  }

  try {
    logger.info('Closing MongoDB connection', { type: 'database' });
    await mongoose.disconnect();
    logger.info('MongoDB connection closed', { type: 'database' });
  } catch (error) {
    logger.error('Error while disconnecting from MongoDB', {
      type: 'database',
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

/**
 * Returns the current MongoDB connection status.
 */
export const getDatabaseStatus = (): DatabaseStatus => {
  const { connection } = mongoose;
  const readyState = mapReadyState(connection.readyState);

  return {
    readyState,
    isConnected: matchesReadyState(connection, STATES.connected),
    host: connection.host || null,
    name: connection.name || null,
  };
};

/**
 * Register a callback to run before database disconnect on SIGINT / SIGTERM.
 * Use with {@link connectDatabase} when `registerSignalHandlers` is true.
 */
export const setShutdownCallback = (callback: GracefulShutdownCallback): void => {
  shutdownCallback = callback;
};
