import morgan from 'morgan';
import { config } from '../config/index.js';

morgan.token('request-id', (req) => {
  const header = req.headers['x-request-id'];
  return typeof header === 'string' ? header : '-';
});

const developmentFormat = ':method :url :status :response-time ms - :request-id';
const productionFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :request-id';

/**
 * HTTP request logging via Morgan.
 */
export const loggerMiddleware = morgan(config.isProduction ? productionFormat : developmentFormat, {
  skip: (req) => config.isTest && req.url === '/api/v1/health',
});
