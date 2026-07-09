import compression from 'compression';
import cors from 'cors';
import express, { type Application } from 'express';

import { corsConfig } from './config/cors.js';
import { config } from './config/index.js';
import { authOpenApiSpec, swaggerServe, swaggerSetup } from './config/swagger.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { apiRateLimiter } from './middleware/rate-limit.middleware.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware.js';
import { securityMiddleware } from './middleware/security.middleware.js';
import v1Router from './routes/v1/index.js';

const BODY_SIZE_LIMIT = '10mb';
const API_V1_PREFIX = '/api/v1';

/**
 * Creates and configures the Express application.
 *
 * Middleware order (production best practice):
 *  1. Security       — helmet, disable x-powered-by, trust proxy
 *  2. Request ID     — correlation ID for logging and errors
 *  3. CORS           — cross-origin policy
 *  4. Compression    — gzip response bodies
 *  5. Body parsing   — JSON and URL-encoded payloads
 *  6. Logging        — Winston HTTP request logging
 *  7. API routes     — versioned /api/v1 with rate limiting
 *  8. 404 handler    — unmatched routes
 *  9. Error handler  — global error boundary (must be last)
 */
export const createApp = (): Application => {
  const app = express();

  // --- Security ---
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(securityMiddleware);

  // --- Request tracing ---
  app.use(requestIdMiddleware);

  // --- Cross-origin ---
  app.use(cors(corsConfig));

  // --- Performance ---
  app.use(compression());

  // --- Body parsing ---
  app.use(express.json({ limit: BODY_SIZE_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: BODY_SIZE_LIMIT }));

  // --- HTTP logging (Winston) ---
  app.use(requestLoggerMiddleware);

  // --- API documentation (Swagger UI) ---
  app.get('/api/docs/openapi.json', (_req, res) => {
    res.status(200).json(authOpenApiSpec);
  });
  app.use('/api/docs', swaggerServe, swaggerSetup);

  // --- Versioned API (/api/v1) ---
  app.use(API_V1_PREFIX, apiRateLimiter, v1Router);

  // --- Root redirect (convenience) ---
  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'AI OTT CMS API',
      data: {
        version: 'v1',
        documentation: '/api/docs',
        environment: config.env,
      },
    });
  });

  // --- Error handling (must be last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
