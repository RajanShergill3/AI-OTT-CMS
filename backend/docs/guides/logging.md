# Logging Strategy

This document describes the Winston-based logging architecture for the AI OTT CMS backend.

---

## Overview

| Component | File | Purpose |
|---|---|---|
| Logger | `src/utils/logger.ts` | Winston instance with transports and log levels |
| Request middleware | `src/middleware/request-logger.middleware.ts` | HTTP request/response logging |
| Error handler | `src/middleware/error.middleware.ts` | Logs operational and unhandled errors |

Morgan has been **replaced** by Winston to provide a single, unified logging pipeline.

---

## Log Levels

| Level | Priority | When to Use |
|---|---|---|
| `error` | 0 | Failures requiring attention — 5xx responses, DB errors, uncaught exceptions |
| `warn` | 1 | Recoverable issues — 4xx responses, disconnections, validation failures |
| `info` | 2 | Normal operations — server start, HTTP requests, DB connected |
| `debug` | 3 | Development detail — connection state, skipped operations |

### Default Level by Environment

| Environment | Level | Console | Files |
|---|---|---|---|
| `development` | `debug` | Colorized, human-readable | JSON |
| `production` | `info` | JSON | JSON |
| `test` | `error` | Silent | Silent |

---

## Transports

### 1. Console

- **Development:** Colorized output with timestamp, level, message, and metadata JSON
- **Production:** Structured JSON for log aggregation (CloudWatch, Datadog, etc.)
- **Test:** Silent to keep test output clean

### 2. File — `logs/combined.log`

- All log levels (`debug` through `error`)
- JSON format for machine parsing
- Rotation: 5 MB max size, 5 retained files

### 3. File — `logs/error.log`

- **Error level only** — quick access to failures without noise
- JSON format
- Same rotation policy

### 4. Process Handlers

| File | Captures |
|---|---|
| `logs/exceptions.log` | Uncaught synchronous exceptions |
| `logs/rejections.log` | Unhandled promise rejections |

---

## Request Logging

The `requestLoggerMiddleware` logs each HTTP request when the response finishes:

```json
{
  "level": "info",
  "message": "HTTP request completed",
  "type": "http",
  "method": "GET",
  "url": "/api/v1/health",
  "statusCode": 200,
  "durationMs": 2.45,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "ip": "::1",
  "userAgent": "..."
}
```

### Status → Level Mapping

| Status Code | Log Level |
|---|---|
| 2xx, 3xx | `info` |
| 4xx | `warn` |
| 5xx | `error` |

---

## Correlation IDs

Every request receives an `X-Request-Id` header (via `requestIdMiddleware`). This ID is:

1. Attached to the request object
2. Included in HTTP request logs
3. Returned in error response `meta.requestId`
4. Logged in the global error handler

Use the request ID to trace a single request across log entries.

---

## Structured Metadata

All logs include `defaultMeta`:

```json
{
  "service": "ai-ott-cms-api",
  "environment": "development"
}
```

Domain-specific logs use a `type` field:

| Type | Source |
|---|---|
| `http` | Request middleware |
| `error` | Error handler |
| `database` | MongoDB connection module |
| `startup` | Server bootstrap |
| `shutdown` | Graceful shutdown |
| `process` | Uncaught exceptions / rejections |

---

## Usage in Code

```ts
import { logger, logInfo, logError, logDebug } from '../utils/logger.js';

logger.info('User logged in', { type: 'auth', userId: '...' });
logError('Payment failed', { type: 'billing', orderId: '...' });
logDebug('Cache miss', { type: 'cache', key: '...' });
```

**Never use `console.log` in application code** — always use the Winston logger.

---

## Log Files Location

```
backend/logs/
├── combined.log      # All levels
├── error.log         # Errors only
├── exceptions.log    # Uncaught exceptions
└── rejections.log    # Unhandled promise rejections
```

The `logs/` directory is gitignored. Created automatically on first startup.

---

## Production Recommendations

1. Ship `combined.log` and `error.log` to a log aggregator
2. Set up alerts on `error` level volume spikes
3. Never log secrets (JWT, passwords, API keys)
4. Use `requestId` for distributed tracing
5. In containerized deployments, prefer stdout (Console transport) and let the orchestrator collect logs

---

*See also: [backend/README.md](../README.md)*
