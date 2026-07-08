import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { config, connectDatabase } from './config/index.js';
import type { Server } from 'node:http';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const log = (message: string): void => {
  console.log(`[server] ${new Date().toISOString()} ${message}`);
};

const logError = (message: string, error?: unknown): void => {
  console.error(`[server] ${new Date().toISOString()} ${message}`, error ?? '');
};

/**
 * Register process-level error handlers to prevent silent crashes.
 */
const registerProcessHandlers = (): void => {
  process.on('unhandledRejection', (reason: unknown) => {
    logError('Unhandled promise rejection', reason);
    if (config.isProduction) {
      process.exit(1);
    }
  });

  process.on('uncaughtException', (error: Error) => {
    logError('Uncaught exception', error);
    process.exit(1);
  });
};

/**
 * Bootstrap the HTTP server and MongoDB connection.
 */
export const startServer = async (): Promise<Server> => {
  registerProcessHandlers();

  const httpServer: { instance: Server | null } = { instance: null };

  try {
    await connectDatabase({
      registerSignalHandlers: true,
      onShutdown: async () => {
        if (!httpServer.instance) {
          return;
        }

        log('Closing HTTP server');

        await new Promise<void>((resolve, reject) => {
          httpServer.instance!.close((error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          });
        });

        log('HTTP server closed');
      },
      shutdownTimeoutMs: SHUTDOWN_TIMEOUT_MS,
    });
  } catch (error) {
    logError('Failed to connect to database', error);
    process.exit(1);
  }

  const app = createApp();

  return new Promise<Server>((resolve, reject) => {
    const server = app.listen(config.port, () => {
      log(`Running on port ${config.port} [${config.env}]`);
      log(`API: http://localhost:${config.port}/api/v1`);
      httpServer.instance = server;
      resolve(server);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logError(`Port ${config.port} is already in use`);
      }
      reject(error);
    });
  });
};

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  startServer().catch((error: unknown) => {
    logError('Failed to start server', error);
    process.exit(1);
  });
}
