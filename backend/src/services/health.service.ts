import { createRequire } from 'node:module';

import { config } from '../config/index.js';
import type { HealthCheckResult } from '../types/health.types.js';

const require = createRequire(import.meta.url);
const { version: applicationVersion } = require('../../package.json') as { version: string };

/**
 * Collects application health metadata.
 * Infrastructure checks (e.g. database) can be extended here in future readiness probes.
 */
export const getHealthCheck = (): HealthCheckResult => {
  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.env,
    nodeVersion: process.version,
    applicationVersion,
  };
};
