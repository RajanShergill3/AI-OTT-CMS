import { connectDatabase, disconnectDatabase } from '../connection.js';
import { logger } from '../../utils/logger.js';
import { runSeeds } from './index.js';

const run = async (): Promise<void> => {
  try {
    await connectDatabase({ registerSignalHandlers: false });
    await runSeeds();
    logger.info('Database seeding completed', { type: 'seed' });
  } catch (error) {
    logger.error('Database seeding failed', {
      type: 'seed',
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
};

void run();
