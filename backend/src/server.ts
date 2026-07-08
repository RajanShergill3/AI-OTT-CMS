import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { config, connectDatabase } from './config/index.js';
import { logger } from './utils/logger.js';
import type { Server } from 'node:http';

const SHUTDOWN_TIMEOUT_MS = 10_000;

/**
 * Register process-level error handlers to prevent silent crashes.
 */
const registerProcessHandlers = (): void => {
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled promise rejection', {
      type: 'process',
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
    });

    if (config.isProduction) {
      process.exit(1);
    }
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception', {
      type: 'process',
      message: error.message,
      stack: error.stack,
    });
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

        logger.info('Closing HTTP server', { type: 'shutdown' });

        await new Promise<void>((resolve, reject) => {
          httpServer.instance!.close((error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          });
        });

        logger.info('HTTP server closed', { type: 'shutdown' });
      },
      shutdownTimeoutMs: SHUTDOWN_TIMEOUT_MS,
    });
  } catch (error) {
    logger.error('Failed to connect to database', {
      type: 'startup',
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }

  const app = createApp();

  return new Promise<Server>((resolve, reject) => {
    const server = app.listen(config.port, () => {
      logger.info('Server started', {
        type: 'startup',
        port: config.port,
        environment: config.env,
        apiPrefix: '/api/v1',
      });
      httpServer.instance = server;
      resolve(server);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      logger.error('Server failed to start', {
        type: 'startup',
        code: error.code,
        message: error.message,
        port: config.port,
      });
      reject(error);
    });
  });
};

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  startServer().catch((error: unknown) => {
    logger.error('Failed to start server', {
      type: 'startup',
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  });
}
