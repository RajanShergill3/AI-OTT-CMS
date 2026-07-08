import mongoose from 'mongoose';
import { databaseConfig } from './database.js';

export const connectDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(databaseConfig.uri, databaseConfig.options);
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};

export const getDatabaseStatus = (): 'connected' | 'disconnected' => {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
};
