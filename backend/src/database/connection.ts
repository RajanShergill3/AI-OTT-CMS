import mongoose from 'mongoose';
import { databaseConfig } from '../config/database.js';
import type {
  ConnectDatabaseOptions,
  DatabaseReadyState,
  DatabaseStatus,
  GracefulShutdownCallback,
} from './types.js';

const READY_STATE_MAP: Record<number, DatabaseReadyState> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

let listenersAttached = false;
let shutdownInProgress = false;
let shutdownCallback: GracefulShutdownCallback | undefined;
let shutdownTimeoutMs = 10_000;

const log = (message: string): void => {
  const timestamp = new Date().toISOString();
  console.log(`[database] ${timestamp} ${message}`);
};

const logError = (message: string, error?: unknown): void => {
  const timestamp = new Date().toISOString();
  console.error(`[database] ${timestamp} ${message}`, error ?? '');
};

const mapReadyState = (state: number): DatabaseReadyState => {
  return READY_STATE_MAP[state] ?? 'unknown';
};

const attachConnectionEventListeners = (): void => {
  if (listenersAttached) {
    return;
  }

  listenersAttached = true;
  const { connection } = mongoose;

  connection.on('connected', () => {
    log(`Connected to MongoDB [${connection.host}/${connection.name}]`);
  });

  connection.on('reconnected', () => {
    log(`Reconnected to MongoDB [${connection.host}/${connection.name}]`);
  });

  connection.on('disconnected', () => {
    log('Disconnected from MongoDB');
  });

  connection.on('error', (error: Error) => {
    logError('MongoDB connection error', error);
  });
};

const handleShutdownSignal = (signal: NodeJS.Signals) => {
  return async (): Promise<void> => {
    if (shutdownInProgress) {
      log(`Shutdown already in progress — ignoring ${signal}`);
      return;
    }

    shutdownInProgress = true;
    log(`${signal} received — starting graceful shutdown`);

    const forceExitTimer = setTimeout(() => {
      logError(`Graceful shutdown timed out after ${shutdownTimeoutMs}ms — forcing exit`);
      process.exit(1);
    }, shutdownTimeoutMs);

    forceExitTimer.unref();

    try {
      if (shutdownCallback) {
        log('Running pre-disconnect shutdown callback');
        await shutdownCallback();
      }

      await disconnectDatabase();
      log('Graceful shutdown complete');
      clearTimeout(forceExitTimer);
      process.exit(0);
    } catch (error) {
      logError('Error during graceful shutdown', error);
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
 * Idempotent — returns immediately if already connected or connecting.
 *
 * @throws {Error} When the initial connection attempt fails
 */
export const connectDatabase = async (options: ConnectDatabaseOptions = {}): Promise<void> => {
  const { registerSignalHandlers: shouldRegisterSignals = false, onShutdown, shutdownTimeoutMs: timeout } =
    options;

  if (timeout !== undefined) {
    shutdownTimeoutMs = timeout;
  }

  if (onShutdown) {
    shutdownCallback = onShutdown;
  }

  mongoose.set('strictQuery', true);

  attachConnectionEventListeners();

  const currentState = mongoose.connection.readyState;

  if (currentState === 1) {
    log('Already connected to MongoDB');
    if (shouldRegisterSignals) {
      registerSignalHandlers();
    }
    return;
  }

  if (currentState === 2) {
    log('Connection already in progress — waiting for existing attempt');
    await mongoose.connection.asPromise();
    if (shouldRegisterSignals) {
      registerSignalHandlers();
    }
    return;
  }

  try {
    log(`Connecting to MongoDB [${maskUri(databaseConfig.uri)}]`);
    await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    log('MongoDB connection established');

    if (shouldRegisterSignals) {
      registerSignalHandlers();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown connection error';
    logError(`Failed to connect to MongoDB: ${message}`, error);
    throw new Error(`MongoDB connection failed: ${message}`, { cause: error });
  }
};

/**
 * Gracefully close the MongoDB connection.
 * Safe to call multiple times.
 */
export const disconnectDatabase = async (): Promise<void> => {
  const currentState = mongoose.connection.readyState;

  if (currentState === 0) {
    log('Already disconnected from MongoDB');
    return;
  }

  if (currentState === 3) {
    log('Disconnect already in progress');
    await mongoose.connection.asPromise().catch(() => undefined);
    return;
  }

  try {
    log('Closing MongoDB connection');
    await mongoose.disconnect();
    log('MongoDB connection closed');
  } catch (error) {
    logError('Error while disconnecting from MongoDB', error);
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
    isConnected: connection.readyState === 1,
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

const maskUri = (uri: string): string => {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
};
