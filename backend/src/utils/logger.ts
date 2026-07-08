import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import winston from 'winston';

import { env } from '../config/env.loader.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

const LOGS_DIR = path.resolve(process.cwd(), 'logs');

const ensureLogsDirectory = (): void => {
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }
};

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${String(timestamp)} [${String(level)}]: ${String(message)}${metaString}`;
  }),
);

const resolveLogLevel = (): LogLevel => {
  if (env.NODE_ENV === 'test') {
    return 'error';
  }

  if (env.NODE_ENV === 'production') {
    return 'info';
  }

  return 'debug';
};

const isProduction = env.NODE_ENV === 'production';
const isTest = env.NODE_ENV === 'test';

ensureLogsDirectory();

/**
 * Application logger powered by Winston.
 *
 * Transports:
 *  - Console  — all levels (human-readable in dev, JSON optional)
 *  - combined.log — all levels (JSON, rotated by size in production ops)
 *  - error.log    — error level only (JSON)
 */
export const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: resolveLogLevel(),
  defaultMeta: {
    service: 'ai-ott-cms-api',
    environment: env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: isProduction ? jsonFormat : consoleFormat,
      silent: isTest,
    }),
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'combined.log'),
      format: jsonFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      silent: isTest,
    }),
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      silent: isTest,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'exceptions.log'),
      format: jsonFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'rejections.log'),
      format: jsonFormat,
    }),
  ],
  exitOnError: false,
});

export const logInfo = (message: string, meta?: Record<string, unknown>): void => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta?: Record<string, unknown>): void => {
  logger.warn(message, meta);
};

export const logError = (message: string, meta?: Record<string, unknown>): void => {
  logger.error(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, unknown>): void => {
  logger.debug(message, meta);
};
