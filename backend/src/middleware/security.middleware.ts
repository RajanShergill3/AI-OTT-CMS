import helmet from 'helmet';
import { config } from '../config/index.js';

/**
 * Security headers via Helmet.
 * @see https://helmetjs.github.io/
 */
export const securityMiddleware = helmet({
  contentSecurityPolicy: config.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
});
