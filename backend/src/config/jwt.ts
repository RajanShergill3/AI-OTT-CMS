import { config } from './index.js';

export const jwtConfig = {
  secret: config.jwt.secret,
  refreshSecret: config.jwt.refreshSecret,
  accessExpiresIn: config.jwt.accessExpiresIn,
  refreshExpiresIn: config.jwt.refreshExpiresIn,
} as const;
