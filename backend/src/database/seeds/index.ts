import { seedAdminUser } from './admin.seed.js';

/**
 * Run all database seeds.
 */
export const runSeeds = async (): Promise<void> => {
  await seedAdminUser();
};
