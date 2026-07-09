import { User } from '../../models/user.model.js';
import { logger } from '../../utils/logger.js';

export const ADMIN_USER_SEED = {
  firstName: 'System',
  lastName: 'Admin',
  email: 'admin@aiottcms.com',
  password: 'Admin@123',
  role: 'ADMIN' as const,
  isActive: true,
};

export type AdminSeedResult = 'created' | 'skipped';

/**
 * Seed the default admin user if it does not already exist.
 * Idempotent — safe to run multiple times.
 */
export const seedAdminUser = async (): Promise<AdminSeedResult> => {
  const email = ADMIN_USER_SEED.email.toLowerCase();
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    logger.info('Admin user seed skipped — account already exists', {
      type: 'seed',
      email,
      userId: existingAdmin._id.toString(),
    });
    return 'skipped';
  }

  const admin = await User.create({
    firstName: ADMIN_USER_SEED.firstName,
    lastName: ADMIN_USER_SEED.lastName,
    email,
    password: ADMIN_USER_SEED.password,
    role: ADMIN_USER_SEED.role,
    isActive: ADMIN_USER_SEED.isActive,
  });

  logger.info('Admin user seeded successfully', {
    type: 'seed',
    email: admin.email,
    userId: admin._id.toString(),
    role: admin.role,
  });

  return 'created';
};
