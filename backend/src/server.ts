import { createApp } from './app.js';
import { config, connectDatabase } from './config/index.js';
import type { Server } from 'node:http';

const startServer = async (): Promise<void> => {
  const httpServer: { instance: Server | null } = { instance: null };

  try {
    await connectDatabase({
      registerSignalHandlers: true,
      onShutdown: async () => {
        if (!httpServer.instance) {
          return;
        }

        await new Promise<void>((resolve, reject) => {
          httpServer.instance!.close((error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          });
        });
      },
      shutdownTimeoutMs: 10_000,
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }

  const app = createApp();

  httpServer.instance = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} [${config.env}]`);
    console.log(`API prefix: ${config.apiPrefix}`);
  });
};

startServer().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
