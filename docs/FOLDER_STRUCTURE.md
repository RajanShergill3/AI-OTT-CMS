# AI OTT CMS — Enterprise Folder Structure

| Field | Value |
|---|---|
| **Version** | 1.0.0 |
| **Stack** | React 19 · TypeScript · Vite · Tailwind CSS · Node.js · Express · MongoDB · JWT |
| **Purpose** | Canonical directory layout for development, CI/CD, documentation, and assessment deliverables |
| **Last Updated** | July 8, 2026 |

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Root Layout](#2-root-layout)
3. [Frontend (`frontend/`)](#3-frontend-frontend)
4. [Backend (`backend/`)](#4-backend-backend)
5. [Docker (`docker/`)](#5-docker-docker)
6. [GitHub Actions (`.github/`)](#6-github-actions-github)
7. [Documentation (`docs/`)](#7-documentation-docs)
8. [Postman Collection (`postman/`)](#8-postman-collection-postman)
9. [Screenshots (`screenshots/`)](#9-screenshots-screenshots)
10. [Prompt History (`prompt-history/`)](#10-prompt-history-prompt-history)
11. [Naming Conventions](#11-naming-conventions)
12. [What Goes Where — Quick Reference](#12-what-goes-where--quick-reference)

---

## 1. Design Principles

| Principle | Application |
|---|---|
| **Separation of concerns** | Frontend and backend are sibling top-level directories with independent dependency trees |
| **Feature ownership** | Domain logic grouped by business capability, not by file type alone |
| **Scalable defaults** | Structure supports a small team today and module extraction tomorrow |
| **Assessment-ready** | Dedicated areas for docs, API collections, screenshots, and AI prompt audit trail |
| **Environment parity** | Docker and CI configs live in predictable, version-controlled locations |
| **No secrets in repo** | `.env.example` only; real credentials excluded via `.gitignore` |

---

## 2. Root Layout

```
ai-ott-cms/
│
├── frontend/                       # React 19 + TypeScript + Vite + Tailwind CSS
├── backend/                        # Node.js + Express + MongoDB + JWT
├── docker/                         # Container definitions and compose stacks
├── .github/                        # GitHub Actions workflows and repo templates
├── docs/                           # Architecture, guides, ADRs, API references
├── postman/                        # Postman collections and environments
├── screenshots/                    # UI captures for README and assessment
├── prompt-history/                 # AI prompt log for reproducibility and review
│
├── .editorconfig                   # Editor consistency (indent, charset, EOL)
├── .gitignore                      # Ignore node_modules, .env, build artifacts
├── .nvmrc                          # Node.js version pin (optional)
├── LICENSE                         # Project license
└── README.md                       # Project overview, setup, and quick start
```

### Root-Level File Explanations

| File | Purpose |
|---|---|
| `README.md` | Entry point for reviewers; links to docs, screenshots, and setup |
| `.gitignore` | Excludes `node_modules/`, `.env`, `dist/`, `coverage/`, OS junk |
| `.editorconfig` | Ensures consistent formatting across IDEs |
| `.nvmrc` | Locks Node version for local dev and CI alignment |
| `LICENSE` | Legal terms for the repository |

---

## 3. Frontend (`frontend/`)

```
frontend/
│
├── public/                         # Static assets served as-is (no bundling)
│   ├── favicon.ico
│   ├── robots.txt
│   └── assets/                     # Public images, fonts, manifest icons
│       ├── images/
│       └── fonts/
│
├── src/
│   ├── app/                        # Application shell and global wiring
│   │   ├── providers/              # React context providers (auth, theme, query)
│   │   ├── router/                 # Route definitions and route guards
│   │   ├── layouts/                # AdminLayout, AuthLayout, ErrorLayout
│   │   └── App.tsx                 # Root component
│   │
│   ├── features/                   # Domain feature modules (primary organization unit)
│   │   ├── auth/
│   │   │   ├── api/                # Auth API calls and TanStack Query hooks
│   │   │   ├── components/         # LoginForm, ForgotPasswordForm
│   │   │   ├── hooks/              # useAuth, useLogin
│   │   │   ├── pages/              # LoginPage, ResetPasswordPage
│   │   │   ├── types/              # Auth-specific TypeScript types
│   │   │   ├── utils/              # Token helpers, auth validators
│   │   │   └── index.ts            # Public barrel export for the feature
│   │   │
│   │   ├── dashboard/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   └── index.ts
│   │   │
│   │   ├── content-catalog/        # Movies, series, seasons, episodes
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── stores/             # Zustand slices for local UI state
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── asset-management/       # Video, poster, subtitle uploads
│   │   ├── metadata-editor/        # Title metadata, tags, cast, SEO
│   │   ├── publishing/             # Draft → review → publish workflow
│   │   ├── collections/            # Curated and dynamic collections
│   │   ├── rails/                  # Homepage and section rail builder
│   │   ├── user-management/        # Users, invites, role assignment
│   │   ├── tenant-settings/        # Branding, locales, tenant config
│   │   ├── ai-assistant/           # AI job monitor, suggestions, approvals
│   │   ├── analytics/              # Dashboards and reports
│   │   ├── audit-log/              # Activity trail viewer
│   │   └── global-search/          # Cross-entity search UI
│   │
│   ├── components/                 # Shared, cross-feature UI components
│   │   ├── ui/                     # Design system primitives (Button, Input, Modal)
│   │   ├── forms/                  # Reusable form fields and form layouts
│   │   ├── data-display/           # DataTable, StatusBadge, EmptyState
│   │   ├── feedback/               # Toast, Alert, Skeleton, Spinner
│   │   └── navigation/             # Sidebar, Breadcrumb, TopBar
│   │
│   ├── hooks/                      # Shared custom hooks (not feature-specific)
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── usePermissions.ts
│   │
│   ├── lib/                        # Third-party client setup and wrappers
│   │   ├── api-client.ts           # Axios/fetch instance with interceptors
│   │   ├── query-client.ts         # TanStack Query client config
│   │   └── utils.ts                # cn() helper, class merging
│   │
│   ├── services/                   # Thin API service layer (optional abstraction)
│   │   ├── auth.service.ts
│   │   ├── titles.service.ts
│   │   └── assets.service.ts
│   │
│   ├── stores/                     # Global client state (Zustand)
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── tenant.store.ts
│   │
│   ├── types/                      # Shared TypeScript types and interfaces
│   │   ├── api.types.ts            # API request/response shapes
│   │   ├── common.types.ts         # Pagination, status enums
│   │   └── index.ts
│   │
│   ├── constants/                  # App-wide constants and route paths
│   │   ├── routes.ts
│   │   ├── permissions.ts
│   │   └── config.ts
│   │
│   ├── utils/                      # Pure utility functions
│   │   ├── format-date.ts
│   │   ├── format-duration.ts
│   │   └── parse-error.ts
│   │
│   ├── styles/                     # Global styles and Tailwind entry
│   │   ├── globals.css             # Tailwind directives, CSS variables
│   │   └── themes/                 # Light/dark theme token overrides
│   │
│   ├── assets/                     # Bundled static assets (imported in code)
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── config/                     # Runtime frontend configuration
│   │   └── env.ts                  # Typed environment variable access
│   │
│   ├── test/                       # Test utilities, mocks, MSW handlers
│   │   ├── setup.ts
│   │   ├── mocks/
│   │   └── fixtures/
│   │
│   ├── main.tsx                    # Application entry point
│   └── vite-env.d.ts               # Vite type declarations
│
├── e2e/                            # Playwright end-to-end tests
│   ├── fixtures/
│   ├── pages/                      # Page Object Models
│   └── specs/
│       ├── auth.spec.ts
│       └── content-catalog.spec.ts
│
├── .env.example                    # Documented env vars (no secrets)
├── .eslintrc.cjs                   # ESLint configuration
├── .prettierrc                     # Prettier formatting rules
├── index.html                      # Vite HTML entry
├── package.json
├── playwright.config.ts
├── postcss.config.js               # PostCSS for Tailwind
├── tailwind.config.ts              # Tailwind theme and content paths
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Frontend Directory Explanations

| Directory / File | Responsibility |
|---|---|
| `public/` | Files copied verbatim to build output; favicons, robots.txt |
| `src/app/` | App shell only — routing, layouts, global providers; no business logic |
| `src/features/` | **Primary unit of organization.** Each OTT domain owns its UI, hooks, and API layer |
| `src/features/*/index.ts` | Public API of a feature; other features import only from here |
| `src/components/` | Reusable UI shared across two or more features |
| `src/components/ui/` | Atomic design system primitives built on Tailwind + Radix (optional) |
| `src/lib/` | Singleton clients (API, query) configured once at startup |
| `src/services/` | Optional thin wrappers over `lib/api-client` for cleaner feature code |
| `src/stores/` | Global UI state only; server state belongs in TanStack Query |
| `src/types/` | Shared types used by multiple features |
| `src/styles/` | Tailwind entry point, CSS custom properties, theme tokens |
| `src/test/` | Shared test setup, MSW mock handlers, reusable fixtures |
| `e2e/` | Playwright tests isolated from unit test runner |

---

## 4. Backend (`backend/`)

```
backend/
│
├── src/
│   ├── config/                     # Application configuration
│   │   ├── index.ts                # Config aggregator
│   │   ├── database.ts             # MongoDB connection settings
│   │   ├── jwt.ts                  # JWT secret, expiry, issuer
│   │   └── cors.ts                 # CORS allowed origins
│   │
│   ├── app.ts                      # Express app setup (middleware, routes)
│   ├── server.ts                   # HTTP server bootstrap and graceful shutdown
│   │
│   ├── routes/                     # Route registration (thin — delegates to controllers)
│   │   ├── index.ts                # Mounts all route modules under /api/v1
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── titles.routes.ts
│   │   ├── seasons.routes.ts
│   │   ├── episodes.routes.ts
│   │   ├── assets.routes.ts
│   │   ├── collections.routes.ts
│   │   ├── rails.routes.ts
│   │   ├── publishing.routes.ts
│   │   ├── search.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── audit.routes.ts
│   │   └── health.routes.ts
│   │
│   ├── controllers/                # Request handlers (parse input, call services, send response)
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── titles.controller.ts
│   │   ├── assets.controller.ts
│   │   ├── publishing.controller.ts
│   │   ├── ai.controller.ts
│   │   └── ...
│   │
│   ├── services/                   # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── token.service.ts        # JWT issue, verify, refresh
│   │   ├── users.service.ts
│   │   ├── titles.service.ts
│   │   ├── assets.service.ts
│   │   ├── publishing.service.ts
│   │   ├── search.service.ts
│   │   ├── ai.service.ts
│   │   └── audit.service.ts
│   │
│   ├── models/                     # Mongoose schemas and models
│   │   ├── user.model.ts
│   │   ├── tenant.model.ts
│   │   ├── role.model.ts
│   │   ├── title.model.ts
│   │   ├── season.model.ts
│   │   ├── episode.model.ts
│   │   ├── asset.model.ts
│   │   ├── collection.model.ts
│   │   ├── rail.model.ts
│   │   ├── publish-schedule.model.ts
│   │   ├── ai-job.model.ts
│   │   ├── ai-suggestion.model.ts
│   │   └── audit-log.model.ts
│   │
│   ├── middleware/                 # Express middleware
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── rbac.middleware.ts      # Role/permission checks
│   │   ├── tenant.middleware.ts    # Tenant scoping from JWT
│   │   ├── validate.middleware.ts  # Request body/query validation
│   │   ├── error.middleware.ts     # Global error handler
│   │   ├── logger.middleware.ts    # Request logging
│   │   └── rate-limit.middleware.ts
│   │
│   ├── validators/                 # Joi / Zod schemas for request validation
│   │   ├── auth.validator.ts
│   │   ├── titles.validator.ts
│   │   ├── assets.validator.ts
│   │   └── common.validator.ts     # Pagination, ID params
│   │
│   ├── utils/                      # Pure helper functions
│   │   ├── api-response.ts         # Standardized success/error response helpers
│   │   ├── async-handler.ts        # Wraps async route handlers
│   │   ├── hash.ts                 # Password hashing (bcrypt)
│   │   └── pagination.ts
│   │
│   ├── types/                      # TypeScript types and Express augmentations
│   │   ├── express.d.ts            # Extends Request with user, tenantId
│   │   └── index.ts
│   │
│   ├── constants/                  # Enums, permission keys, status values
│   │   ├── permissions.ts
│   │   ├── content-status.ts
│   │   └── http-status.ts
│   │
│   ├── jobs/                       # Background job processors (optional)
│   │   ├── ai-job.processor.ts
│   │   └── search-index.processor.ts
│   │
│   └── database/                   # DB connection and seed scripts
│       ├── connection.ts           # Mongoose connect/disconnect
│       └── seeds/                  # Development seed data
│           ├── users.seed.ts
│           └── titles.seed.ts
│
├── tests/
│   ├── unit/                       # Service and utility unit tests
│   │   ├── services/
│   │   └── utils/
│   ├── integration/                # API integration tests (supertest)
│   │   ├── auth.test.ts
│   │   ├── titles.test.ts
│   │   └── setup.ts                # Test DB, app bootstrap
│   └── fixtures/                   # Reusable test data factories
│
├── scripts/                        # Operational scripts
│   ├── seed.ts                     # Run database seeds
│   └── migrate.ts                  # One-off data migrations
│
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── package.json
├── tsconfig.json
└── jest.config.ts                  # Or vitest.config.ts
```

### Backend Directory Explanations

| Directory / File | Responsibility |
|---|---|
| `src/config/` | Centralized, typed configuration loaded from environment variables |
| `src/app.ts` | Express application factory — middleware stack, no `listen()` |
| `src/server.ts` | Starts server, handles SIGTERM graceful shutdown |
| `src/routes/` | Defines HTTP paths and attaches middleware + controllers; no business logic |
| `src/controllers/` | Translates HTTP ↔ service layer; handles status codes and DTO mapping |
| `src/services/` | **Core business logic.** Database access, domain rules, orchestration |
| `src/models/` | Mongoose schema definitions; one file per collection |
| `src/middleware/` | Cross-cutting HTTP concerns: auth, RBAC, validation, errors |
| `src/validators/` | Input schemas decoupled from controllers for reuse and testing |
| `src/jobs/` | Async workers for AI processing, search indexing (BullMQ optional) |
| `src/database/seeds/` | Repeatable dev/staging data for demos and E2E tests |
| `tests/integration/` | Full request/response tests against a test MongoDB instance |

### Backend Layer Flow

```
HTTP Request
  → routes/          (path + middleware chain)
  → controllers/     (parse request, call service)
  → services/        (business logic)
  → models/          (MongoDB persistence)
  → controllers/     (format response)
  → HTTP Response
```

---

## 5. Docker (`docker/`)

```
docker/
│
├── frontend/
│   └── Dockerfile                  # Multi-stage: build Vite app → serve with nginx
│
├── backend/
│   └── Dockerfile                  # Multi-stage: build TypeScript → run Node production
│
├── nginx/
│   ├── Dockerfile                  # Reverse proxy for SPA + API routing
│   └── nginx.conf                  # Proxy rules, gzip, security headers
│
├── mongo/
│   └── init/                       # MongoDB init scripts (run on first container start)
│       └── 01-init-db.js
│
├── docker-compose.yml              # Full local stack (frontend, backend, mongo, redis)
├── docker-compose.dev.yml          # Dev overrides (volume mounts, hot reload)
├── docker-compose.test.yml         # CI test stack (ephemeral DB)
└── .env.example                    # Docker-specific env template
```

### Docker Directory Explanations

| File / Directory | Purpose |
|---|---|
| `frontend/Dockerfile` | Builds static Vite output; production image uses nginx |
| `backend/Dockerfile` | Compiles TypeScript; runs `node dist/server.js` in slim Alpine image |
| `nginx/` | Optional unified entry point routing `/api` → backend, `/` → frontend |
| `mongo/init/` | Creates databases, users, and indexes on first `docker compose up` |
| `docker-compose.yml` | One-command local environment for reviewers and developers |
| `docker-compose.dev.yml` | Bind-mounts source for hot reload without rebuilding images |
| `docker-compose.test.yml` | Lightweight stack spun up in GitHub Actions for integration tests |

---

## 6. GitHub Actions (`.github/`)

```
.github/
│
├── workflows/
│   ├── ci.yml                      # Main CI: lint, typecheck, test on every PR
│   ├── frontend-ci.yml             # Frontend-only pipeline (optional split)
│   ├── backend-ci.yml              # Backend-only pipeline (optional split)
│   ├── e2e.yml                     # Playwright E2E against docker-compose stack
│   ├── docker-build.yml            # Build and push images on release tags
│   ├── security-scan.yml           # Dependency audit (npm audit, Trivy)
│   └── deploy-staging.yml          # Deploy to staging on merge to main
│
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
│
├── PULL_REQUEST_TEMPLATE.md        # PR checklist (tests, screenshots, docs)
├── CODEOWNERS                        # Auto-assign reviewers per directory
└── dependabot.yml                    # Automated dependency update PRs
```

### GitHub Actions Explanations

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Pull request, push to `main` | Lint, typecheck, unit tests for frontend + backend |
| `e2e.yml` | Pull request (label or path filter) | Spins up Docker stack, runs Playwright |
| `docker-build.yml` | Tag `v*` or manual dispatch | Builds and publishes container images |
| `security-scan.yml` | Weekly cron + PR | Scans dependencies and Docker images for CVEs |
| `deploy-staging.yml` | Merge to `main` | Automated staging deployment |

---

## 7. Documentation (`docs/`)

```
docs/
│
├── ARCHITECTURE.md                 # System architecture (already exists)
├── FOLDER_STRUCTURE.md             # This document
│
├── api/
│   ├── openapi.yaml                # OpenAPI 3.1 specification
│   ├── authentication.md           # Auth flows, token lifecycle, RBAC matrix
│   └── error-codes.md              # Standard error codes and problem details
│
├── adr/                            # Architecture Decision Records
│   ├── 001-monorepo-layout.md
│   ├── 002-jwt-refresh-strategy.md
│   ├── 003-mongodb-as-primary-db.md
│   └── 004-feature-sliced-frontend.md
│
├── guides/
│   ├── getting-started.md          # Local setup from clone to running app
│   ├── development.md              # Branching, commits, PR process
│   ├── testing.md                  # How to run unit, integration, E2E tests
│   ├── deployment.md               # Staging and production deploy steps
│   └── contributing.md             # Contribution guidelines for reviewers
│
├── database/
│   ├── schema-overview.md          # Collection relationships and ER-style diagrams
│   └── indexes.md                  # Index strategy and query patterns
│
├── frontend/
│   ├── component-guidelines.md     # Design system usage, accessibility rules
│   ├── state-management.md         # When to use Query vs Zustand vs Context
│   └── routing.md                  # Route map and permission guards
│
├── backend/
│   ├── api-conventions.md          # REST standards, pagination, versioning
│   ├── middleware.md               # Middleware chain order and responsibilities
│   └── seeding.md                  # How to seed and reset development data
│
└── runbooks/
    ├── incident-response.md        # On-call procedures
    ├── database-backup.md          # Backup and restore steps
    └── rollback.md                 # Application rollback procedure
```

### Documentation Explanations

| Section | Audience | Content |
|---|---|---|
| `api/` | Frontend devs, QA, integrators | Machine-readable OpenAPI + human auth guide |
| `adr/` | Tech leads, architects | Immutable record of significant technical decisions |
| `guides/` | All contributors | Onboarding and day-to-day development workflows |
| `database/` | Backend devs, DBAs | Schema design rationale and index documentation |
| `frontend/` / `backend/` | Specialists | Deep-dive conventions per layer |
| `runbooks/` | Ops, on-call engineers | Production incident and maintenance procedures |

---

## 8. Postman Collection (`postman/`)

```
postman/
│
├── collections/
│   ├── AI-OTT-CMS-API.postman_collection.json    # Full API collection
│   └── AI-OTT-CMS-Auth.postman_collection.json   # Auth-only subset for quick testing
│
├── environments/
│   ├── local.postman_environment.json            # http://localhost:5000
│   ├── staging.postman_environment.json          # Staging API base URL
│   └── production.postman_environment.json       # Production (read-only keys)
│
├── globals/
│   └── globals.postman_globals.json              # Shared variables (if any)
│
└── README.md                                     # Import instructions, auth setup, folder map
```

### Postman Directory Explanations

| Item | Purpose |
|---|---|
| `collections/` | Grouped API requests mirroring backend `routes/` modules |
| `environments/` | Per-environment `baseUrl`, `accessToken`, `tenantId` variables |
| `Auth.postman_collection.json` | Isolated login → refresh → me flow for quick JWT testing |
| `README.md` | Step-by-step: import collection, select environment, run auth pre-request script |

### Recommended Collection Folder Structure (inside Postman)

```
AI-OTT-CMS-API/
├── Auth/
├── Users/
├── Titles/
├── Seasons & Episodes/
├── Assets/
├── Collections/
├── Rails/
├── Publishing/
├── Search/
├── AI/
├── Analytics/
└── Audit/
```

---

## 9. Screenshots (`screenshots/`)

```
screenshots/
│
├── README.md                       # Index of all screenshots with descriptions
│
├── auth/
│   ├── login.png
│   ├── forgot-password.png
│   └── sso-login.png
│
├── dashboard/
│   ├── overview.png
│   └── ai-job-monitor.png
│
├── content-catalog/
│   ├── titles-list.png
│   ├── title-detail.png
│   ├── season-episode-tree.png
│   └── bulk-actions.png
│
├── metadata/
│   ├── metadata-editor.png
│   └── ai-suggestions-inline.png
│
├── publishing/
│   ├── publish-workflow.png
│   └── schedule-calendar.png
│
├── collections/
│   ├── collection-builder.png
│   └── rail-layout.png
│
├── ai/
│   ├── ai-panel.png
│   ├── suggestion-diff.png
│   └── moderation-flags.png
│
├── admin/
│   ├── user-management.png
│   ├── role-permissions.png
│   └── tenant-settings.png
│
├── analytics/
│   └── dashboard-metrics.png
│
└── responsive/
    ├── tablet-layout.png
    └── mobile-nav.png
```

### Screenshots Directory Explanations

| Purpose | Details |
|---|---|
| **Assessment evidence** | Visual proof of implemented features for Tech Lead reviewers |
| **README embedding** | Referenced from root `README.md` via relative paths |
| **Organized by feature** | Mirrors `frontend/src/features/` for easy navigation |
| **Naming convention** | `kebab-case.png`; prefix with version if UI changes significantly (`v2-titles-list.png`) |
| `responsive/` | Demonstrates mobile/tablet readiness for frontend leadership evaluation |

---

## 10. Prompt History (`prompt-history/`)

```
prompt-history/
│
├── README.md                       # How this folder is maintained and its purpose
│
├── sessions/
│   ├── 2026-07-08-architecture/
│   │   ├── 01-initial-architecture-request.md
│   │   ├── 02-folder-structure-request.md
│   │   └── summary.md              # Outcomes and decisions from this session
│   │
│   └── 2026-07-XX-implementation/  # Future sessions follow same pattern
│       ├── 01-monorepo-scaffold.md
│       └── summary.md
│
├── templates/
│   ├── session-entry.template.md   # Standard format for logging a prompt
│   └── summary.template.md         # Standard format for session summaries
│
└── index.md                        # Chronological index of all sessions
```

### Prompt History Explanations

| Item | Purpose |
|---|---|
| `sessions/` | One subfolder per working session, dated `YYYY-MM-DD-topic` |
| `*.md` per prompt | Records the original prompt, context, and AI response summary |
| `summary.md` | Decisions made, files created, and open items after each session |
| `templates/` | Ensures consistent logging format across sessions |
| `index.md` | Master chronological log linking to all sessions |

### Recommended Session Entry Format

Each prompt log file should capture:

1. **Date and session ID**
2. **Original prompt** (verbatim or paraphrased)
3. **Context** (what existed before this prompt)
4. **Output** (files created/modified, decisions taken)
5. **Follow-up items** (deferred work, open questions)

This folder provides an **audit trail** for AI-assisted development — valuable for assessment transparency and reproducibility.

---

## 11. Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Top-level directories | `kebab-case` | `prompt-history/`, `postman/` |
| Frontend features | `kebab-case` | `content-catalog/`, `ai-assistant/` |
| React components | `PascalCase.tsx` | `TitleCard.tsx`, `LoginPage.tsx` |
| React hooks | `use` + `PascalCase.ts` | `useAuth.ts`, `useTitleQuery.ts` |
| Backend files | `kebab-case.{layer}.ts` | `auth.controller.ts`, `title.model.ts` |
| MongoDB collections | `snake_case` plural | `audit_logs`, `ai_jobs` |
| Postman files | `PascalCase-Descriptive.postman_*.json` | `AI-OTT-CMS-API.postman_collection.json` |
| Screenshot files | `kebab-case.png` | `titles-list.png`, `ai-panel.png` |
| Prompt session folders | `YYYY-MM-DD-topic` | `2026-07-08-architecture/` |
| Environment files | `.env.example` only in repo | Never commit `.env` |

---

## 12. What Goes Where — Quick Reference

| I need to add… | Location |
|---|---|
| A new CMS page (e.g., Rights Management) | `frontend/src/features/rights-management/` |
| A new API endpoint | `backend/src/routes/` + `controllers/` + `services/` + `models/` |
| A shared UI button variant | `frontend/src/components/ui/` |
| JWT refresh logic | `backend/src/services/token.service.ts` |
| MongoDB schema for a new entity | `backend/src/models/` |
| Request validation for an endpoint | `backend/src/validators/` |
| Local dev with one command | `docker/docker-compose.yml` |
| PR CI checks | `.github/workflows/ci.yml` |
| API documentation for reviewers | `docs/api/openapi.yaml` |
| Postman request for a new module | `postman/collections/` (new folder in collection) |
| Screenshot of a completed feature | `screenshots/{feature-name}/` |
| Log of an AI pair-programming session | `prompt-history/sessions/{date-topic}/` |
| Architecture decision rationale | `docs/adr/` |
| Seed data for local development | `backend/src/database/seeds/` |
| E2E test for login flow | `frontend/e2e/specs/auth.spec.ts` |

---

## Visual Map — Top-Level Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ai-ott-cms (root)                             │
├─────────────┬─────────────┬──────────┬──────────┬──────────┬──────────┤
│  frontend/  │  backend/   │  docker/ │ .github/ │  docs/   │ postman/ │
│  React SPA  │  Express API│  Compose │   CI/CD  │  Guides  │   API    │
├─────────────┴─────────────┴──────────┴──────────┴──────────┴──────────┤
│  screenshots/              │              prompt-history/               │
│  UI evidence               │              AI session audit trail        │
└────────────────────────────┴────────────────────────────────────────────┘
```

---

*End of Folder Structure Document*
