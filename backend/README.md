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
| **morgan** | HTTP request logger — `dev` format locally, `combined` in production |
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

## Environment Variables

See `.env.example` for all variables.

## Project Status

- [x] Express app with security middleware
- [x] MongoDB connection with graceful shutdown
- [x] Health check endpoint
- [x] Standardized API response helpers
- [x] Global error handling
- [ ] Auth API (Milestone M1)
- [ ] Domain APIs (Milestones M2–M6)
