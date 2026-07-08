import { createApp } from './app.js';
import { config, validateConfig } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/connection.js';

const startServer = async (): Promise<void> => {
  validateConfig();

  try {
    await connectDatabase();
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} [${config.env}]`);
    console.log(`API prefix: ${config.apiPrefix}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      await disconnectDatabase();
      console.log('Server closed');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
};

startServer().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
