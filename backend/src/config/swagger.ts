import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import swaggerUi from 'swagger-ui-express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const openApiSpecPath = path.resolve(__dirname, '../../docs/openapi/auth.openapi.json');

export const authOpenApiSpec = JSON.parse(readFileSync(openApiSpecPath, 'utf8')) as Record<
  string,
  unknown
>;

export const swaggerServe = swaggerUi.serve;

export const swaggerSetup = swaggerUi.setup(authOpenApiSpec, {
  customSiteTitle: 'AI OTT CMS — Auth API',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
});
