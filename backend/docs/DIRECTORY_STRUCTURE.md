# Backend Directory Structure

This document describes every folder under `backend/src/` and how they fit into the MVC request lifecycle.

---

## Request Flow

```
HTTP Request
    │
    ▼
routes/          ← Define paths and attach middleware chains
    │
    ▼
middleware/      ← Auth, RBAC, validation, rate limiting
    │
    ▼
controllers/     ← Parse request, call service, format response
    │
    ▼
services/        ← Business logic and orchestration
    │
    ▼
models/          ← Mongoose schemas and database persistence
    │
    ▼
HTTP Response    ← Standardized via utils/api-response
```

Supporting folders (`config`, `validators`, `utils`, `types`, `constants`) are used across all layers.

---

## Directory Tree

```
backend/src/
├── app.ts                    # Express app factory (middleware + routes)
├── server.ts                 # HTTP server bootstrap and graceful shutdown
│
├── config/                   # Application configuration
│   ├── index.ts              # Env loader, config object, barrel exports
│   ├── database.ts           # MongoDB connection settings
│   ├── connection.ts         # Mongoose connect / disconnect
│   ├── jwt.ts                # JWT secret and expiry settings
│   └── cors.ts               # CORS allowed origins and headers
│
├── routes/                   # HTTP route definitions
│   ├── index.ts              # API router mount (/api/v1)
│   ├── health.routes.ts      # Infrastructure health check
│   ├── auth.routes.ts        # /auth
│   ├── movie.routes.ts       # /movies
│   ├── category.routes.ts    # /categories
│   ├── user.routes.ts        # /users
│   ├── dashboard.routes.ts   # /dashboard
│   ├── analytics.routes.ts   # /analytics
│   ├── ai.routes.ts          # /ai
│   └── settings.routes.ts    # /settings
│
├── controllers/              # Request handlers
│   ├── index.ts
│   ├── health.controller.ts
│   ├── auth.controller.ts
│   ├── movie.controller.ts
│   ├── category.controller.ts
│   ├── user.controller.ts
│   ├── dashboard.controller.ts
│   ├── analytics.controller.ts
│   ├── ai.controller.ts
│   └── settings.controller.ts
│
├── services/                 # Business logic layer
│   ├── index.ts
│   ├── auth.service.ts
│   ├── token.service.ts
│   ├── movie.service.ts
│   ├── category.service.ts
│   ├── user.service.ts
│   ├── dashboard.service.ts
│   ├── analytics.service.ts
│   ├── ai.service.ts
│   ├── settings.service.ts
│   └── activity-log.service.ts
│
├── models/                   # Mongoose schemas
│   ├── index.ts
│   ├── user.model.ts
│   ├── role.model.ts
│   ├── movie.model.ts
│   ├── category.model.ts
│   ├── activity-log.model.ts
│   ├── watch-history.model.ts
│   ├── settings.model.ts
│   ├── ai-job.model.ts
│   └── ai-suggestion.model.ts
│
├── middleware/               # Express middleware
│   ├── index.ts
│   ├── auth.middleware.ts
│   ├── rbac.middleware.ts
│   ├── tenant.middleware.ts
│   ├── validate.middleware.ts
│   ├── error.middleware.ts
│   └── rate-limit.middleware.ts
│
├── validators/               # Request validation schemas
│   ├── index.ts
│   ├── auth.validator.ts
│   ├── movie.validator.ts
│   ├── category.validator.ts
│   ├── user.validator.ts
│   ├── ai.validator.ts
│   ├── settings.validator.ts
│   └── common.validator.ts
│
├── utils/                    # Pure utility functions
│   ├── index.ts
│   ├── api-response.ts
│   ├── async-handler.ts
│   ├── hash.ts
│   └── pagination.ts
│
├── types/                    # TypeScript types
│   ├── index.ts
│   ├── express.d.ts          # Express Request augmentation
│   └── auth.types.ts
│
└── constants/                # Fixed application values
    ├── index.ts
    ├── http-status.ts
    ├── roles.ts
    ├── movie-status.ts
    └── error-codes.ts
```

---

## Folder Purposes

### `config/`

**Purpose:** Centralize all environment-driven configuration and infrastructure bootstrapping.

| File | Responsibility |
|---|---|
| `index.ts` | Loads `.env`, exposes typed `config` object, validates production secrets |
| `database.ts` | MongoDB URI and connection pool options |
| `connection.ts` | `connectDatabase()`, `disconnectDatabase()`, `getDatabaseStatus()` |
| `jwt.ts` | JWT access/refresh secrets and expiry durations |
| `cors.ts` | Allowed frontend origin, methods, and headers |

Configuration is read once at startup. No business logic belongs here.

---

### `routes/`

**Purpose:** Define HTTP endpoints and wire middleware chains to controllers. Routes are thin — they map URLs to handlers and nothing more.

| File | Base Path | Milestone |
|---|---|---|
| `health.routes.ts` | `/health` | M0 (active) |
| `auth.routes.ts` | `/auth` | M1 |
| `movie.routes.ts` | `/movies` | M2 |
| `category.routes.ts` | `/categories` | M3 |
| `user.routes.ts` | `/users` | M4 |
| `dashboard.routes.ts` | `/dashboard` | M3 |
| `analytics.routes.ts` | `/analytics` | M5 |
| `ai.routes.ts` | `/ai` | M6 |
| `settings.routes.ts` | `/settings` | M7 |

`index.ts` mounts all route modules under `/api/v1`.

---

### `controllers/`

**Purpose:** Handle HTTP request/response cycle. Controllers parse input (body, params, query), delegate to services, and return standardized JSON responses.

**Rules:**
- No direct Mongoose calls
- No business rules
- Use `asyncHandler` for async error propagation
- Use `sendSuccess` / `sendError` from utils

---

### `services/`

**Purpose:** Core business logic layer. Services orchestrate models, enforce domain rules, emit activity logs, and coordinate cross-entity operations.

**Examples (when implemented):**
- `movie.service.ts` — status transitions, slug uniqueness, category sync
- `token.service.ts` — JWT issue, verify, refresh rotation
- `ai.service.ts` — call AI provider, track cost, store suggestions

Controllers never skip the service layer to access models directly.

---

### `models/`

**Purpose:** Mongoose schema definitions — one file per MongoDB collection. Models define document shape, indexes, virtuals, and instance methods.

Maps to `docs/database/SCHEMA.md`:

| Model File | Collection |
|---|---|
| `user.model.ts` | `users` |
| `role.model.ts` | `roles` |
| `movie.model.ts` | `movies` |
| `category.model.ts` | `categories` |
| `activity-log.model.ts` | `activity_logs` |
| `watch-history.model.ts` | `watch_history` |
| `settings.model.ts` | `settings` |
| `ai-job.model.ts` | `ai_jobs` |
| `ai-suggestion.model.ts` | `ai_suggestions` |

---

### `middleware/`

**Purpose:** Cross-cutting HTTP concerns applied before or after route handlers.

| File | Responsibility |
|---|---|
| `auth.middleware.ts` | Verify JWT access token; attach `req.user` |
| `rbac.middleware.ts` | Enforce role/permission checks (`admin`, `editor`, `viewer`) |
| `tenant.middleware.ts` | Scope queries to `tenantId` from JWT |
| `validate.middleware.ts` | Run validator schemas on body/query/params |
| `error.middleware.ts` | Global error handler and 404 handler |
| `rate-limit.middleware.ts` | Per-IP request throttling |

---

### `validators/`

**Purpose:** Request input validation schemas, decoupled from controllers. Validators define what shape and values incoming data must have before it reaches services.

Typically implemented with Zod or Joi. `common.validator.ts` holds shared rules (pagination, ObjectId params).

---

### `utils/`

**Purpose:** Pure, stateless helper functions with no HTTP or database coupling. Reusable across controllers and services.

| File | Responsibility |
|---|---|
| `api-response.ts` | Standardized `{ success, data, error }` response envelopes |
| `async-handler.ts` | Wraps async route handlers; forwards errors to error middleware |
| `hash.ts` | bcrypt password hashing and comparison |
| `pagination.ts` | Parse and validate `page`/`limit` query params |

---

### `types/`

**Purpose:** Shared TypeScript types, interfaces, and Express type augmentations.

| File | Responsibility |
|---|---|
| `express.d.ts` | Extends `Express.Request` with `user` property |
| `auth.types.ts` | `AuthenticatedRequest` and auth-related types |
| `index.ts` | Barrel export for importable types |

---

### `constants/`

**Purpose:** Fixed application values — enums, status strings, error codes, role slugs. Prevents magic strings scattered across the codebase.

| File | Responsibility |
|---|---|
| `http-status.ts` | HTTP status code constants |
| `roles.ts` | `admin`, `editor`, `viewer` role slugs |
| `movie-status.ts` | Publishing lifecycle status values |
| `error-codes.ts` | Machine-readable API error codes |

---

## Barrel `index.ts` Files

Each layer folder has an `index.ts` that re-exports public APIs. Import from the barrel, not deep paths:

```ts
// Preferred
import { sendSuccess } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/index.js';

// Avoid (deep import)
import { sendSuccess } from '../utils/api-response.js';
```

Barrel exports are uncommented as modules are implemented.

---

## Root Entry Files

| File | Purpose |
|---|---|
| `app.ts` | Creates and configures the Express application (middleware stack, routes, error handlers) |
| `server.ts` | Connects to MongoDB, starts HTTP server, handles graceful shutdown on `SIGTERM`/`SIGINT` |

---

*See also: [backend/README.md](../README.md) · [docs/API.md](../../docs/API.md) · [docs/database/SCHEMA.md](../../docs/database/SCHEMA.md)*
