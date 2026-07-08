import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Required environment variables.
 * The application fails fast at startup if any of these are missing or invalid.
 */
export const REQUIRED_ENV_KEYS = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_EXPIRES_IN',
  'CLIENT_URL',
] as const;

export type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

export interface Env {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  CLIENT_URL: string;
  API_PREFIX: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const ALLOWED_NODE_ENV = new Set(['development', 'production', 'test']);

const loadDotenv = (): void => {
  const envPath = resolve(__dirname, '../../.env');
  const result = dotenv.config({ path: envPath });

  if (result.error && process.env.NODE_ENV !== 'test') {
    const nodeEnvPath = resolve(process.cwd(), '.env');
    dotenv.config({ path: nodeEnvPath });
  }
};

const getRaw = (key: string): string | undefined => {
  const value = process.env[key];
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  return value.trim();
};

const parsePort = (value: string): number => {
  const port = Number.parseInt(value, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, received: "${value}"`);
  }
  return port;
};

const parsePositiveInt = (value: string, key: string): number => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    throw new Error(`${key} must be a positive integer, received: "${value}"`);
  }
  return parsed;
};

const validateUrl = (value: string, key: string): void => {
  try {
    new URL(value);
  } catch {
    throw new Error(`${key} must be a valid URL, received: "${value}"`);
  }
};

const validateMongoUri = (value: string): void => {
  if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
    throw new Error(
      `MONGODB_URI must start with "mongodb://" or "mongodb+srv://", received: "${value}"`,
    );
  }
};

const validateSecrets = (jwtSecret: string, refreshSecret: string): void => {
  if (jwtSecret === refreshSecret) {
    throw new Error('JWT_SECRET and REFRESH_TOKEN_SECRET must be different values');
  }

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  if (refreshSecret.length < 32) {
    throw new Error('REFRESH_TOKEN_SECRET must be at least 32 characters');
  }
};

const collectMissingKeys = (): RequiredEnvKey[] => {
  return REQUIRED_ENV_KEYS.filter((key) => getRaw(key) === undefined);
};

const buildEnv = (): Env => {
  loadDotenv();

  const missing = collectMissingKeys();
  if (missing.length > 0) {
    throw new Error(
      [
        'Missing required environment variables:',
        ...missing.map((key) => `  - ${key}`),
        '',
        'Copy .env.example to .env and set all required values.',
      ].join('\n'),
    );
  }

  const nodeEnv = getRaw('NODE_ENV')!;
  if (!ALLOWED_NODE_ENV.has(nodeEnv)) {
    throw new Error(
      `NODE_ENV must be one of: development, production, test. Received: "${nodeEnv}"`,
    );
  }

  const mongodbUri = getRaw('MONGODB_URI')!;
  validateMongoUri(mongodbUri);

  const jwtSecret = getRaw('JWT_SECRET')!;
  const refreshSecret = getRaw('REFRESH_TOKEN_SECRET')!;
  validateSecrets(jwtSecret, refreshSecret);

  const clientUrl = getRaw('CLIENT_URL')!;
  validateUrl(clientUrl, 'CLIENT_URL');

  const port = parsePort(getRaw('PORT')!);

  return {
    NODE_ENV: nodeEnv as Env['NODE_ENV'],
    PORT: port,
    MONGODB_URI: mongodbUri,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: getRaw('JWT_EXPIRES_IN')!,
    REFRESH_TOKEN_SECRET: refreshSecret,
    REFRESH_TOKEN_EXPIRES_IN: getRaw('REFRESH_TOKEN_EXPIRES_IN')!,
    CLIENT_URL: clientUrl,
    API_PREFIX: getRaw('API_PREFIX') ?? '/api/v1',
    RATE_LIMIT_WINDOW_MS: parsePositiveInt(
      getRaw('RATE_LIMIT_WINDOW_MS') ?? '900000',
      'RATE_LIMIT_WINDOW_MS',
    ),
    RATE_LIMIT_MAX_REQUESTS: parsePositiveInt(
      getRaw('RATE_LIMIT_MAX_REQUESTS') ?? '100',
      'RATE_LIMIT_MAX_REQUESTS',
    ),
  };
};

/**
 * Validated environment variables.
 * Throws immediately if validation fails (fail-fast).
 */
export const env: Env = buildEnv();

/**
 * Re-run validation — useful for tests or explicit startup checks.
 */
export const loadEnv = (): Env => buildEnv();
