# AI OTT CMS — Backend

Express + TypeScript API for the AI-Powered OTT Content Management System.

## Quick Start

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Health check: `GET http://localhost:5000/api/v1/health`

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (tsx) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format `src/**/*.ts` |

## Architecture (MVC)

```
Request → routes/ → controllers/ → services/ → models/ → MongoDB
                ↓
           middleware/ (auth, validation, errors)
```

| Layer | Directory | Responsibility |
|---|---|---|
| **Routes** | `src/routes/` | HTTP paths, middleware chains |
| **Controllers** | `src/controllers/` | Parse request, call service, format response |
| **Services** | `src/services/` | Business logic and orchestration |
| **Models** | `src/models/` | Mongoose schemas and database access |

> Full directory tree and folder purposes: [docs/DIRECTORY_STRUCTURE.md](docs/DIRECTORY_STRUCTURE.md)

## Dependencies

### Production

| Package | Purpose |
|---|---|
| **express** | HTTP server framework — routing, middleware pipeline, request/response handling |
| **mongoose** | MongoDB ODM — schemas, models, queries, connection pooling |
| **jsonwebtoken** | JWT sign/verify for access and refresh tokens (auth module, M1) |
| **bcrypt** | Password hashing with salt — stores `passwordHash`, never plaintext |
| **dotenv** | Loads `.env` into `process.env` at startup |
| **cors** | Cross-Origin Resource Sharing — allows the React frontend to call the API |
| **helmet** | Sets secure HTTP headers (CSP, X-Frame-Options, HSTS, etc.) |
| **winston** | Structured logging — console, file, and error transports |
| **express-rate-limit** | Rate limiting per IP — mitigates brute-force and abuse |
| **compression** | Gzip response bodies — reduces payload size for JSON responses |

### Development

| Package | Purpose |
|---|---|
| **typescript** | Static typing and compile-time checks |
| **tsx** | Run TypeScript directly in dev with watch mode (no separate compile step) |
| **eslint** | Linting for code quality and consistency |
| **typescript-eslint** | TypeScript-aware ESLint rules |
| **eslint-config-prettier** | Disables ESLint rules that conflict with Prettier |
| **prettier** | Code formatting |
| **@types/\*** | TypeScript definitions for JavaScript packages |

## Logging

Winston-based structured logging with console and file transports. See [docs/guides/logging.md](docs/guides/logging.md).

## Environment Variables

See `.env.example` for all required variables. The server **fails fast** at startup if any are missing or invalid.

| Variable | Description |
|---|---|
| `NODE_ENV` | `development`, `production`, or `test` |
| `PORT` | HTTP server port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | Access token lifetime (e.g. `15m`) |
| `REFRESH_TOKEN_SECRET` | Refresh token signing secret (min 32 chars) |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `http://localhost:5173`) |

Configuration is loaded by `src/config/env.loader.ts` and exposed via `src/config/index.ts`.

## Project Status

- [x] Express app with security middleware
- [x] MongoDB connection with graceful shutdown
- [x] Versioned API router (`/api/v1`)
- [x] Health check endpoint
- [x] Standardized API response helpers
- [x] Global error handling and 404 handler
- [ ] Auth API (Milestone M1)
- [ ] Domain APIs (Milestones M2–M6)
