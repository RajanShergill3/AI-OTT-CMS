# AI OTT CMS — Backend

REST API for the **AI-Powered OTT Content Management System**. Built with Express, TypeScript, and MongoDB, this service powers content catalog management, user administration, analytics, and AI-assisted metadata generation for OTT operations teams.

> Part of the [AI OTT CMS](../README.md) monorepo. API contract: [`docs/API.md`](../docs/API.md) · Database schema: [`docs/database/SCHEMA.md`](../docs/database/SCHEMA.md) · Roadmap: [`docs/ROADMAP.md`](../docs/ROADMAP.md)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Scripts](#scripts)
- [API Versioning](#api-versioning)
- [Future Modules](#future-modules)
- [Related Documentation](#related-documentation)

---

## Overview

The backend exposes a versioned JSON REST API under `/api/v1`. It follows a layered **MVC-inspired architecture** with clear separation between routing, request handling, business logic, and data persistence.

**Current status (Milestone M0 — Foundation):**

| Capability | Status |
|---|---|
| Express application with security middleware | ✅ Complete |
| MongoDB connection with graceful shutdown | ✅ Complete |
| Versioned API router (`/api/v1`) | ✅ Complete |
| Health check endpoint | ✅ Complete |
| Standardized API response envelope | ✅ Complete |
| Global error handling and 404 handler | ✅ Complete |
| Winston structured logging | ✅ Complete |
| ESLint + Prettier tooling | ✅ Complete |
| Authentication & domain APIs | 🔜 Milestones M1–M6 |

**Design principles:**

- **Fail fast** — required environment variables are validated at startup
- **Stateless auth** — JWT access and refresh tokens (planned M1)
- **RBAC** — role-based access for Admin, Editor, and Viewer roles
- **Consistent responses** — every endpoint returns `{ success, message, data, meta }`
- **Production readiness** — helmet, rate limiting, compression, request tracing, and structured logs

---

## Architecture

### Request lifecycle

```
HTTP Request
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  Middleware pipeline (app.ts)                           │
│  helmet → request-id → cors → compression → body parse  │
│  → Winston logger → rate limiter                        │
└─────────────────────────────────────────────────────────┘
    │
    ▼
routes/          ← Path definitions and middleware chains
    │
    ▼
middleware/      ← Auth, RBAC, validation, rate limiting
    │
    ▼
controllers/     ← Parse request, call service, send response
    │
    ▼
services/        ← Business logic and orchestration
    │
    ▼
models/          ← Mongoose schemas and database access
    │
    ▼
MongoDB
```

### Layer responsibilities

| Layer | Directory | Responsibility |
|---|---|---|
| **Routes** | `src/routes/` | HTTP paths, versioned mounts, middleware chains |
| **Controllers** | `src/controllers/` | Input extraction, service invocation, HTTP status codes |
| **Services** | `src/services/` | Business rules, transactions, cross-entity orchestration |
| **Models** | `src/models/` | Mongoose schemas, indexes, database queries |
| **Middleware** | `src/middleware/` | Auth, RBAC, validation, errors, rate limiting |
| **Validators** | `src/validators/` | Request body and query validation schemas |
| **Config** | `src/config/` | Environment loading, database, JWT, and CORS settings |
| **Utils** | `src/utils/` | API response helpers, logging, hashing, pagination |

### Middleware order

The Express app applies middleware in a deliberate order to ensure security and observability before route handling:

1. **Security** — Helmet headers, `x-powered-by` disabled, trust proxy
2. **Request ID** — correlation ID for logs and error responses
3. **CORS** — cross-origin policy for the React frontend
4. **Compression** — gzip response bodies
5. **Body parsing** — JSON and URL-encoded payloads (10 MB limit)
6. **Logging** — Winston HTTP request logger
7. **API routes** — versioned `/api/v1` with per-IP rate limiting
8. **404 handler** — unmatched routes
9. **Error handler** — global error boundary (must be last)

### API response envelope

All endpoints return a consistent JSON structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {}
}
```

Errors follow the same envelope with `success: false` and an appropriate HTTP status code.

---

## Folder Structure

```
backend/
├── src/
│   ├── app.ts                    # Express app factory
│   ├── server.ts                 # HTTP server bootstrap and graceful shutdown
│   │
│   ├── config/                   # Application configuration
│   │   ├── env.loader.ts         # dotenv + fail-fast validation
│   │   ├── database.ts           # MongoDB connection settings
│   │   ├── jwt.ts                # JWT secret and expiry
│   │   └── cors.ts               # CORS allowed origins
│   │
│   ├── database/                 # MongoDB connection lifecycle
│   │   └── connection.ts         # connect, disconnect, status helpers
│   │
│   ├── routes/                   # HTTP route definitions
│   │   ├── v1/                   # API v1 route modules
│   │   │   ├── index.ts          # v1 router aggregator
│   │   │   └── health.routes.ts
│   │   ├── auth.routes.ts        # (planned)
│   │   ├── movie.routes.ts
│   │   ├── category.routes.ts
│   │   ├── user.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── ai.routes.ts
│   │   └── settings.routes.ts
│   │
│   ├── controllers/              # Request handlers
│   ├── services/                 # Business logic
│   ├── models/                   # Mongoose schemas
│   ├── middleware/               # Express middleware
│   ├── validators/               # Request validation
│   ├── utils/                    # Shared utilities
│   ├── types/                    # TypeScript type definitions
│   └── constants/                # Enums, error codes, HTTP status
│
├── docs/                         # Backend-specific documentation
│   ├── DIRECTORY_STRUCTURE.md      # Detailed folder reference
│   └── guides/
│       └── logging.md            # Winston logging guide
│
├── .env.example                  # Environment variable template
├── eslint.config.js              # ESLint 9 flat config
├── .eslintrc.cjs                 # Legacy ESLint config (IDE reference)
├── .prettierrc                   # Prettier formatting rules
├── tsconfig.json                 # TypeScript compiler options
└── package.json
```

> For a line-by-line breakdown of every folder, see [docs/DIRECTORY_STRUCTURE.md](docs/DIRECTORY_STRUCTURE.md).

---

## Technology Stack

### Runtime & framework

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 22 LTS | JavaScript runtime |
| **Express** | 4.x | HTTP server, routing, middleware pipeline |
| **TypeScript** | 5.x | Static typing and compile-time safety |
| **Mongoose** | 8.x | MongoDB ODM — schemas, models, queries |

### Security & reliability

| Package | Purpose |
|---|---|
| **helmet** | Secure HTTP headers (CSP, X-Frame-Options, HSTS) |
| **cors** | Cross-origin resource sharing for the React frontend |
| **express-rate-limit** | Per-IP rate limiting on API routes |
| **bcrypt** | Password hashing (auth module, M1) |
| **jsonwebtoken** | JWT sign/verify for access and refresh tokens |
| **compression** | Gzip response bodies |
| **winston** | Structured logging — console and file transports |

### Developer experience

| Package | Purpose |
|---|---|
| **tsx** | TypeScript execution with watch mode in development |
| **eslint** + **typescript-eslint** | Linting with TypeScript and Node.js rules |
| **eslint-plugin-simple-import-sort** | Automatic import ordering |
| **eslint-plugin-n** | Node.js best practices |
| **prettier** | Consistent code formatting |
| **dotenv** | Environment variable loading |

---

## Installation

### Prerequisites

- **Node.js** ≥ 22.0.0
- **npm** ≥ 10
- **MongoDB** ≥ 6.0 (local instance or Atlas cluster)

### Steps

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file from template
cp .env.example .env

# 4. Edit .env with your values (see Environment Variables below)
```

---

## Environment Variables

All variables marked **required** must be set before the server starts. Configuration is loaded by `src/config/env.loader.ts` and validated at startup — missing or invalid values cause an immediate exit with a descriptive error.

### Required

| Variable | Example | Description |
|---|---|---|
| `NODE_ENV` | `development` | Runtime environment: `development`, `production`, or `test` |
| `PORT` | `5000` | HTTP server port |
| `MONGODB_URI` | `mongodb://localhost:27017/ai-ott-cms` | MongoDB connection string |
| `JWT_SECRET` | *(32+ char random string)* | Access token signing secret |
| `JWT_EXPIRES_IN` | `15m` | Access token lifetime |
| `REFRESH_TOKEN_SECRET` | *(32+ char random string)* | Refresh token signing secret |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | Frontend origin for CORS |

### Optional

| Variable | Default | Description |
|---|---|---|
| `API_PREFIX` | `/api/v1` | API route prefix |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window per IP |
| `LOG_LEVEL` | `debug` (dev) / `info` (prod) | Winston log level |

> See [`.env.example`](.env.example) for the full template with inline comments.

---

## Running Locally

### 1. Start MongoDB

Ensure MongoDB is running and reachable at the URI configured in `.env`:

```bash
# Local MongoDB (default port)
mongod

# Or use Docker
docker run -d --name mongo -p 27017:27017 mongo:7
```

### 2. Start the development server

```bash
npm run dev
```

The server starts with hot reload via `tsx watch`. You should see log output confirming the MongoDB connection and the listening port.

### 3. Verify the health endpoint

```bash
curl http://localhost:5000/api/v1/health
```

**Example response:**

```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "uptime": 12.345,
    "timestamp": "2026-07-08T17:00:00.000Z",
    "environment": "development",
    "nodeVersion": "v22.0.0",
    "applicationVersion": "0.1.0"
  },
  "meta": {}
}
```

### Production build

```bash
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled server
```

The server handles `SIGINT` and `SIGTERM` for graceful shutdown — in-flight requests complete before the HTTP server and MongoDB connection close.

---

## Scripts

| Script | Command | Description |
|---|---|---|
| **dev** | `npm run dev` | Start development server with hot reload (`tsx watch`) |
| **build** | `npm run build` | Compile TypeScript to `dist/` |
| **start** | `npm start` | Run the compiled production build |
| **lint** | `npm run lint` | Run ESLint on `src/` |
| **lint:fix** | `npm run lint:fix` | Auto-fix lint issues (import order, etc.) |
| **format** | `npm run format` | Format all source files with Prettier |
| **format:check** | `npm run format:check` | Verify formatting without writing (CI-friendly) |

---

## API Versioning

The API uses **URI path versioning**. All endpoints are prefixed with `/api/v1`, defined in `src/app.ts` and aggregated in `src/routes/v1/index.ts`.

```
https://api.example.com/api/v1/health
https://api.example.com/api/v1/movies
https://api.example.com/api/v1/auth/login
```

### Versioning strategy

| Aspect | Approach |
|---|---|
| **Current version** | `v1` |
| **Prefix** | `/api/v1` |
| **Breaking changes** | Introduce `/api/v2`; maintain `v1` during deprecation |
| **Non-breaking changes** | Added within the current version (new fields, endpoints) |
| **Documentation** | Full spec in [`docs/API.md`](../docs/API.md) |

### v1 route map (planned)

| Module | Base path | Endpoints | Milestone |
|---|---|---|---|
| Health | `/health` | 1 | M0 ✅ |
| Auth | `/auth` | 5 | M1 |
| Dashboard | `/dashboard` | 3 | M3 |
| Movies | `/movies` | 8 | M2 |
| Categories | `/categories` | 6 | M3 |
| Users | `/users` | 6 | M4 |
| Analytics | `/analytics` | 4 | M5 |
| AI Assistant | `/ai` | 4 | M6 |
| Settings | `/settings` | 3 | M7 |

New route modules are registered in `src/routes/v1/index.ts` as they are implemented:

```typescript
v1Router.use('/auth', authRoutes);
v1Router.use('/movies', movieRoutes);
// ...
```

---

## Future Modules

The backend is scaffolded for seven domain modules. Placeholder files exist for routes, controllers, services, models, and validators — implementation follows the [development roadmap](../docs/ROADMAP.md).

### M1 — Authentication & Authorization

- User registration and login
- JWT access + refresh token rotation
- Password hashing with bcrypt
- Role-based access control (Admin, Editor, Viewer)
- Auth and RBAC middleware

### M2 — Movies

- Full CRUD for movie catalog entries
- Draft → review → published workflow
- Search, filtering, and pagination
- Poster and metadata management

### M3 — Categories & Dashboard

- Hierarchical category taxonomy
- Dashboard KPIs, activity feed, and pending review queue

### M4 — Users & Role Management

- User invite, activate/deactivate
- Role assignment and profile management
- Activity audit logging

### M5 — Analytics & Reporting

- Movie distribution and upload trends
- Category breakdowns
- CSV export for reporting

### M6 — AI Assistant

- AI-generated descriptions, SEO keywords, tags, and social captions
- Human-in-the-loop approval workflow
- Async job tracking via `ai-job` and `ai-suggestion` models

### M7 — Settings & Profile

- Tenant branding and content policies
- AI feature toggles and security configuration
- User profile management

### M8 — Hardening & Production Launch

- Integration and E2E test coverage
- Docker containerization
- GitHub Actions CI/CD pipeline
- Staging and production deployment runbooks

---

## Related Documentation

| Document | Description |
|---|---|
| [API Specification](../docs/API.md) | Full REST API contract (33 endpoints) |
| [Database Schema](../docs/database/SCHEMA.md) | MongoDB collections and indexes |
| [Architecture](../docs/ARCHITECTURE.md) | System-wide architecture overview |
| [Roadmap](../docs/ROADMAP.md) | 14-week milestone plan (M0–M8) |
| [Directory Structure](docs/DIRECTORY_STRUCTURE.md) | Detailed `src/` folder reference |
| [Logging Guide](docs/guides/logging.md) | Winston configuration and usage |

---

## License

UNLICENSED — assessment project.
