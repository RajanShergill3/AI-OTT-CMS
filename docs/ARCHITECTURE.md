# AI-Powered OTT Content Management System
## Software Architecture Document

| Field | Value |
|---|---|
| **Version** | 1.0.0 |
| **Status** | Draft — Architecture Phase |
| **Audience** | Engineering leadership, frontend assessment reviewers, platform & backend teams |
| **Last Updated** | July 8, 2026 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [Complete Project Architecture](#3-complete-project-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Folder Structure](#5-folder-structure)
6. [Feature List](#6-feature-list)
7. [Database Collections](#7-database-collections)
8. [API Modules](#8-api-modules)
9. [Authentication Flow](#9-authentication-flow)
10. [AI-Powered Features](#10-ai-powered-features)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Folder Naming Conventions](#12-folder-naming-conventions)
13. [Cross-Cutting Concerns](#13-cross-cutting-concerns)
14. [Frontend Tech Lead Assessment Criteria](#14-frontend-tech-lead-assessment-criteria)
15. [Phased Delivery Roadmap](#15-phased-delivery-roadmap)

---

## 1. Executive Summary

This document defines the architecture for a **production-ready, AI-powered Over-The-Top (OTT) Content Management System (CMS)**. The platform enables content operations teams to ingest, enrich, schedule, publish, and monetize video catalogs across web, mobile, and connected-TV endpoints.

The system is designed with a **frontend-first operational experience** while maintaining a scalable, event-driven backend. AI capabilities are embedded as first-class workflows—not bolt-on utilities—covering metadata generation, content moderation, thumbnail optimization, audience segmentation, and intelligent scheduling.

**Primary users:**

| Persona | Primary Goals |
|---|---|
| Content Editor | Create and publish titles, episodes, and collections |
| Metadata Specialist | Enrich tags, descriptions, and localization |
| Operations Manager | Monitor ingest pipelines, QC, and publishing SLAs |
| Marketing Manager | Configure promotions, rails, and audience campaigns |
| Platform Admin | Manage users, roles, tenants, and system configuration |
| Data Analyst | Review performance dashboards and AI recommendations |

---

## 2. Goals & Non-Goals

### Goals

- Deliver a **modular, testable frontend** suitable for team-scale development and Tech Lead review
- Support **multi-tenant** OTT operations with role-based access control (RBAC)
- Provide **end-to-end content lifecycle** management: ingest → QC → enrich → schedule → publish → analyze
- Integrate **AI-assisted workflows** with human-in-the-loop approval gates
- Achieve **sub-2s dashboard load** on standard enterprise hardware (P95)
- Enable **horizontal scaling** of API, workers, and media processing pipelines
- Maintain **auditability** for all publish and permission changes

### Non-Goals (v1)

- Building a consumer-facing streaming player (integration only)
- Operating proprietary CDN infrastructure (use cloud/CDN providers)
- Real-time live linear channel playout (future phase)
- Training custom foundation models in-house (use managed AI APIs)

---

## 3. Complete Project Architecture

### 3.1 High-Level System Context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL ACTORS & SYSTEMS                         │
├──────────────┬──────────────┬──────────────┬──────────────┬───────────────┤
│ Content Ops  │  Identity    │  Transcoding │  CDN / Edge  │  AI Providers │
│   Teams      │  Provider    │  Services    │  (CloudFront)│  (OpenAI etc) │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴───────┬───────┘
       │              │              │              │               │
       ▼              ▼              ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI OTT CMS PLATFORM (THIS SYSTEM)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Admin Web   │  │ API Gateway │  │ Core        │  │ AI Orchestration    │ │
│  │ App (SPA)   │──│ + BFF Layer │──│ Services    │──│ Service             │ │
│  └─────────────┘  └─────────────┘  └──────┬──────┘  └─────────────────────┘ │
│                                             │                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌──────▼──────┐  ┌─────────────────────┐ │
│  │ Design      │  │ Real-time   │  │ Event Bus   │  │ Media Pipeline      │ │
│  │ System      │  │ Notifications│  │ (Kafka/SQS) │  │ Workers             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
       │              │              │              │               │
       ▼              ▼              ▼              ▼               ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────┐
│ MongoDB      │ │ Redis    │ │ Object Store │ │ Search     │ │ Analytics    │
│ (Primary DB) │ │ (Cache)  │ │ (S3/GCS)     │ │ (OpenSearch)│ │ (Warehouse)   │
└──────────────┘ └──────────┘ └──────────────┘ └────────────┘ └──────────────┘
```

### 3.2 Architectural Style

| Layer | Pattern | Rationale |
|---|---|---|
| Frontend | Feature-sliced SPA + shared design system | Scales team ownership; isolates domain logic |
| API | Modular monolith → service extraction path | Faster v1 delivery; clear module boundaries |
| BFF | Backend-for-Frontend per client surface | Shapes payloads for UI; reduces over-fetching |
| Data | CQRS-lite (write DB + read-optimized search index) | Fast catalog search and dashboard queries |
| Async | Event-driven workers | Decouples ingest, AI jobs, and publishing |
| AI | Orchestration service with job queue | Retries, rate limits, cost controls, audit trail |

### 3.3 Core Domain Bounded Contexts

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   Identity &   │     │    Content     │     │    Catalog     │
│   Access       │────▶│    Ingestion   │────▶│    Management  │
└────────────────┘     └────────────────┘     └───────┬────────┘
                                                      │
┌────────────────┐     ┌────────────────┐          ▼
│   Analytics &  │     │   Publishing   │     ┌────────────────┐
│   Insights     │◀────│   & Scheduling │◀────│   Metadata &   │
└────────────────┘     └────────────────┘     │   Enrichment   │
        ▲                      ▲              └───────┬────────┘
        │                      │                      │
        └──────────────────────┴──────────────────────┘
                               │
                        ┌──────▼──────┐
                        │  AI Engine  │
                        └─────────────┘
```

### 3.4 Request Flow (Synchronous Read Path)

```
User → CDN → SPA Shell → Auth Token Check → BFF API → Cache (Redis)
                                                    ↓ (miss)
                                              Service Layer
                                                    ↓
                                              MongoDB / OpenSearch
                                                    ↓
                                              Normalized DTO → UI
```

### 3.5 Event Flow (Asynchronous Write Path)

```
User Action → API Validation → Persist Draft → Emit Domain Event
                                                    ↓
                              ┌─────────────────────┼─────────────────────┐
                              ▼                     ▼                     ▼
                        AI Job Worker        Search Indexer        Notification Service
                              ↓                     ↓                     ↓
                        Update Metadata      OpenSearch Sync       WebSocket / Email
```

### 3.6 Multi-Tenancy Model

- **Tenant isolation:** Every document carries `tenantId`; enforced at repository and API middleware layers
- **Shared infrastructure, logical separation:** Single cluster with tenant-scoped indexes and RBAC
- **Branding:** Per-tenant theme tokens (design system overrides)
- **Data residency (future):** Tenant-level region pinning for storage and AI processing

---

## 4. Technology Stack

### 4.1 Frontend

| Category | Technology | Justification |
|---|---|---|
| Framework | **React 19** + **TypeScript 5.x** | Industry standard; strong typing for large CMS surfaces |
| Build Tool | **Vite** | Fast HMR; optimized production bundles |
| Routing | **React Router v7** | Nested layouts for CMS modules |
| Server State | **TanStack Query v5** | Caching, invalidation, optimistic updates |
| Client State | **Zustand** (local UI) + **React Context** (tenant/theme) | Minimal boilerplate; scoped state |
| Forms | **React Hook Form** + **Zod** | Performant forms with schema validation |
| UI Components | **Radix UI** + internal design system | Accessible primitives; customizable |
| Styling | **Tailwind CSS v4** + CSS variables | Consistent tokens; rapid iteration |
| Tables | **TanStack Table** | Virtualized data grids for large catalogs |
| Charts | **Recharts** or **Visx** | Dashboard analytics |
| Rich Text | **TipTap** | Metadata descriptions, editorial notes |
| Media Preview | **Video.js** / **Shaka Player** | In-browser QC preview |
| i18n | **react-i18next** | Multi-language metadata management |
| Testing | **Vitest** + **Testing Library** + **Playwright** | Unit, integration, E2E pyramid |
| Linting | **ESLint** + **Prettier** + **TypeScript strict** | Code quality gates |

### 4.2 Backend

| Category | Technology | Justification |
|---|---|---|
| Runtime | **Node.js 22 LTS** | Aligns with frontend TypeScript ecosystem |
| Framework | **NestJS** | Modular architecture, DI, guards, interceptors |
| API Style | **REST** (primary) + **WebSocket** (real-time) | CMS-friendly; predictable contracts |
| Validation | **class-validator** + **Zod** (shared schemas) | Shared types between FE/BE |
| ORM/ODM | **Mongoose** | Flexible schema for evolving content metadata |
| Auth | **Passport.js** + **JWT** + optional **OAuth 2.0 / OIDC** | Enterprise SSO support |
| Job Queue | **BullMQ** (Redis-backed) | AI and ingest job orchestration |
| Event Bus | **AWS SQS** / **Kafka** (scale path) | Decoupled async processing |
| File Upload | **Multer** + pre-signed S3 URLs | Secure direct-to-storage uploads |
| API Docs | **Swagger / OpenAPI 3.1** | Contract-first development |

### 4.3 Data & Infrastructure

| Category | Technology |
|---|---|
| Primary Database | **MongoDB Atlas** |
| Cache | **Redis (ElastiCache)** |
| Search | **OpenSearch** |
| Object Storage | **AWS S3** |
| CDN | **CloudFront** |
| Transcoding | **AWS MediaConvert** / **Mux** |
| AI Providers | **OpenAI API**, **AWS Bedrock**, **Azure OpenAI** (abstracted) |
| Secrets | **AWS Secrets Manager** |
| Observability | **OpenTelemetry**, **Datadog** / **Grafana Cloud** |
| CI/CD | **GitHub Actions** |
| IaC | **Terraform** |
| Containers | **Docker** + **ECS Fargate** / **EKS** |

### 4.4 Monorepo Tooling

| Tool | Purpose |
|---|---|
| **Turborepo** | Task orchestration, caching |
| **pnpm workspaces** | Dependency management |
| Shared packages | `ui`, `types`, `api-client`, `config`, `utils` |

---

## 5. Folder Structure

```
ai-ott-cms/
├── .github/
│   ├── workflows/                  # CI/CD pipelines
│   ├── CODEOWNERS
│   └── pull_request_template.md
│
├── apps/
│   ├── web-admin/                  # Primary CMS SPA
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/                # App shell, providers, routing
│   │   │   ├── features/           # Domain feature modules
│   │   │   ├── pages/              # Route-level page components
│   │   │   ├── shared/             # App-local shared utilities
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                        # NestJS backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/             # Guards, filters, interceptors, pipes
│       │   ├── config/
│       │   └── modules/              # Domain modules (see §8)
│       ├── test/
│       └── package.json
│
├── packages/
│   ├── ui/                         # Design system (components, tokens, hooks)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── primitives/
│   │   │   ├── patterns/           # Composite UI patterns (DataTable, PageHeader)
│   │   │   ├── tokens/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── api-client/                 # Generated + hand-crafted API SDK
│   ├── types/                      # Shared TypeScript types & Zod schemas
│   ├── utils/                      # Pure utility functions
│   ├── config/                     # ESLint, TSConfig, Tailwind presets
│   └── testing/                    # Test utilities, mocks, fixtures
│
├── services/
│   ├── ai-orchestrator/            # AI job routing, prompt management
│   ├── media-worker/               # Transcode status, asset processing
│   └── search-indexer/             # OpenSearch sync consumer
│
├── infrastructure/
│   ├── terraform/
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── modules/
│   └── docker/
│
├── docs/
│   ├── ARCHITECTURE.md             # This document
│   ├── api/                        # OpenAPI specs
│   ├── adr/                        # Architecture Decision Records
│   └── runbooks/
│
├── scripts/                        # Dev tooling, seed data, migrations
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

### 5.1 Frontend Feature Module Structure

Each feature under `apps/web-admin/src/features/` follows a consistent internal layout:

```
features/
└── content-catalog/
    ├── api/                        # TanStack Query hooks, API calls
    ├── components/                 # Feature-specific UI components
    ├── hooks/                      # Feature-specific hooks
    ├── stores/                     # Zustand slices (if needed)
    ├── types/                      # Feature-local types
    ├── utils/                      # Feature-local helpers
    ├── constants/
    ├── pages/                      # Feature page compositions (optional)
    └── index.ts                    # Public API barrel export
```

**Principle:** Features expose only their public API via `index.ts`. Cross-feature imports must go through the public barrel—never deep-import internal files.

---

## 6. Feature List

### 6.1 Core CMS Features (MVP — Phase 1)

| Module | Features |
|---|---|
| **Dashboard** | KPI cards, ingest queue status, publish calendar, AI job monitor, alerts |
| **Content Catalog** | Movies, series, seasons, episodes; CRUD; bulk actions; advanced filters |
| **Asset Management** | Video upload, poster/backdrop images, subtitle files, audio tracks |
| **Metadata Editor** | Title, synopsis, genres, cast, ratings, content warnings, SEO fields |
| **Publishing** | Draft → Review → Scheduled → Published → Archived lifecycle |
| **Collections & Rails** | Curated lists, dynamic rules, homepage layout builder |
| **User Management** | Invite users, assign roles, deactivate accounts |
| **Tenant Settings** | Branding, locales, default policies, integration keys |
| **Audit Log** | Immutable activity trail with diff view |
| **Global Search** | Cross-entity search with facets (type, status, genre, date) |

### 6.2 Advanced Features (Phase 2)

| Module | Features |
|---|---|
| **Rights & Availability** | Geo-restrictions, windowing, license expiry alerts |
| **Monetization** | SVOD/TVOD/AVOD models, pricing tiers, offer mapping |
| **QC Workflow** | Checklist-based review, rejection reasons, re-ingest triggers |
| **Localization** | Multi-language metadata, translation workflow, locale fallbacks |
| **Promotions** | Campaign banners, featured slots, A/B placement |
| **Analytics** | Views, completion rate, catalog health, AI suggestion acceptance |
| **Webhooks & Integrations** | External DAM, MAM, billing, consumer app sync |
| **Version History** | Content revision diff and rollback |

### 6.3 Platform & Developer Experience

| Feature | Description |
|---|---|
| Feature flags | Gradual rollout per tenant |
| Role-based UI | Dynamic nav and action visibility |
| Keyboard shortcuts | Power-user productivity |
| Responsive layout | Tablet-friendly ops workflows |
| Accessibility (WCAG 2.1 AA) | Focus management, ARIA, contrast |
| Offline-tolerant drafts | Local persistence for in-progress edits |
| Export / Import | Bulk CSV/JSON catalog operations |

---

## 7. Database Collections

MongoDB is the system of record. All collections include `tenantId`, `createdAt`, `updatedAt`, and `createdBy` unless noted.

### 7.1 Identity & Access

| Collection | Key Fields | Indexes |
|---|---|---|
| `tenants` | name, slug, settings, branding, status, plan | `{ slug: 1 }` unique |
| `users` | email, name, avatarUrl, status, lastLoginAt | `{ tenantId, email }` unique |
| `roles` | name, permissions[], isSystem | `{ tenantId, name }` unique |
| `user_roles` | userId, roleId, scope | `{ tenantId, userId }` |
| `sessions` | userId, refreshTokenHash, expiresAt, deviceInfo | TTL on `expiresAt` |
| `api_keys` | name, keyHash, scopes[], expiresAt | `{ tenantId, keyHash }` |

### 7.2 Content Domain

| Collection | Key Fields | Indexes |
|---|---|---|
| `titles` | type (movie\|series), status, metadata{}, rights{}, publishAt | `{ tenantId, status }`, text index on title |
| `seasons` | titleId, seasonNumber, metadata{} | `{ tenantId, titleId, seasonNumber }` unique |
| `episodes` | titleId, seasonId, episodeNumber, duration, status | `{ tenantId, seasonId, episodeNumber }` unique |
| `assets` | entityType, entityId, assetType, storageUrl, checksum, status | `{ tenantId, entityId }` |
| `subtitles` | assetId, language, format, url | `{ assetId, language }` |
| `collections` | name, type (manual\|dynamic), rules{}, itemIds[] | `{ tenantId, type }` |
| `rails` | name, layout, items[], placement | `{ tenantId, placement }` |
| `publish_schedules` | entityType, entityId, scheduledAt, timezone, status | `{ tenantId, scheduledAt }` |

### 7.3 Workflow & Governance

| Collection | Key Fields | Indexes |
|---|---|---|
| `workflow_states` | entityType, entityId, stage, assigneeId, history[] | `{ tenantId, entityId }` |
| `qc_reviews` | entityId, checklist[], verdict, reviewerId, notes | `{ tenantId, entityId }` |
| `audit_logs` | actorId, action, entityType, entityId, diff, ip | `{ tenantId, createdAt }` |
| `comments` | entityType, entityId, body, mentions[] | `{ tenantId, entityId }` |

### 7.4 AI & Jobs

| Collection | Key Fields | Indexes |
|---|---|---|
| `ai_jobs` | type, status, input{}, output{}, model, cost, duration | `{ tenantId, status, createdAt }` |
| `ai_suggestions` | entityType, entityId, field, suggestedValue, confidence, status | `{ tenantId, entityId, status }` |
| `prompt_templates` | name, version, template, variables[], modelConfig | `{ tenantId, name, version }` unique |
| `moderation_results` | assetId, flags[], severity, reviewedAt | `{ tenantId, assetId }` |

### 7.5 Analytics (Operational)

| Collection | Key Fields | Indexes |
|---|---|---|
| `content_metrics` | entityId, period, views, completions, avgWatchTime | `{ tenantId, entityId, period }` |
| `catalog_health` | score, issues[], computedAt | `{ tenantId, computedAt }` |

### 7.6 Search Index (OpenSearch)

Denormalized `catalog_index` documents combining title, season, episode, tags, cast, and status for sub-100ms search.

---

## 8. API Modules

All REST endpoints are prefixed with `/api/v1`. WebSocket namespace: `/ws`.

### 8.1 Module Map

| Module | Base Path | Responsibility |
|---|---|---|
| **Auth** | `/auth` | Login, logout, refresh, SSO callback, password reset |
| **Users** | `/users` | User CRUD, profile, invitations |
| **Roles** | `/roles` | Role and permission management |
| **Tenants** | `/tenants` | Tenant config, branding, feature flags |
| **Titles** | `/titles` | Movie and series CRUD, lifecycle transitions |
| **Seasons** | `/titles/:titleId/seasons` | Season management |
| **Episodes** | `/titles/:titleId/episodes` | Episode management |
| **Assets** | `/assets` | Upload initiation, status, metadata |
| **Collections** | `/collections` | Manual and dynamic collections |
| **Rails** | `/rails` | Homepage and section rails |
| **Publishing** | `/publishing` | Schedule, publish, unpublish, archive |
| **Search** | `/search` | Full-text and faceted search |
| **Workflow** | `/workflow` | QC stages, assignments, approvals |
| **AI** | `/ai` | Job submission, suggestions, accept/reject |
| **Analytics** | `/analytics` | Dashboards, reports, export |
| **Audit** | `/audit` | Activity log queries |
| **Webhooks** | `/webhooks` | Outbound event subscriptions |
| **Health** | `/health` | Liveness and readiness probes |

### 8.2 Representative Endpoint Contracts

```
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me

GET    /titles?status=&type=&page=&limit=
POST   /titles
GET    /titles/:id
PATCH  /titles/:id
DELETE /titles/:id
POST   /titles/:id/transition          # { action: "submit_for_review" }

POST   /assets/upload-url              # Returns pre-signed URL
POST   /assets/:id/complete

GET    /search?q=&facets=
POST   /ai/jobs                        # { type, entityId, options }
GET    /ai/jobs/:id
GET    /ai/suggestions?entityId=
POST   /ai/suggestions/:id/accept
POST   /ai/suggestions/:id/reject

GET    /analytics/dashboard
GET    /audit?entityType=&entityId=
```

### 8.3 API Design Standards

- **Versioning:** URI-based (`/api/v1`)
- **Pagination:** Cursor-based for large lists; `page`/`limit` for admin tables
- **Filtering:** Query params with whitelist validation
- **Errors:** RFC 7807 Problem Details (`application/problem+json`)
- **Idempotency:** `Idempotency-Key` header on POST mutations
- **Rate Limiting:** Per-tenant and per-user buckets
- **Correlation:** `X-Request-Id` propagated across services

### 8.4 BFF Layer (Frontend-Optimized)

The admin SPA communicates primarily with a **BFF** (`/bff/admin`) that:

- Aggregates multi-entity responses (e.g., title + seasons + assets in one call)
- Shapes DTOs to match UI view models
- Enforces field-level permissions before response serialization
- Handles ETag-based conditional requests for large catalog pages

---

## 9. Authentication Flow

### 9.1 Supported Auth Methods

1. **Email + Password** (local auth, bcrypt-hashed)
2. **OAuth 2.0 / OIDC** (Google Workspace, Azure AD, Okta)
3. **API Keys** (machine-to-machine integrations, scoped)

### 9.2 Token Strategy

| Token | Storage | Lifetime | Purpose |
|---|---|---|---|
| Access Token (JWT) | Memory (JS variable) | 15 minutes | API authorization |
| Refresh Token | HttpOnly, Secure, SameSite=Strict cookie | 7 days | Silent token renewal |
| CSRF Token | Double-submit cookie | Session | Mutation protection |

**JWT Claims:** `sub`, `tenantId`, `roles[]`, `permissions[]`, `iat`, `exp`, `jti`

### 9.3 Login Flow (SPA)

```
┌──────┐                ┌──────┐                ┌──────────┐
│ User │                │ SPA  │                │ Auth API │
└──┬───┘                └──┬───┘                └────┬─────┘
   │  Enter credentials    │                         │
   │──────────────────────▶│                         │
   │                       │  POST /auth/login       │
   │                       │────────────────────────▶│
   │                       │                         │ Validate credentials
   │                       │                         │ Issue JWT + refresh cookie
   │                       │◀────────────────────────│
   │                       │  { accessToken, user }  │
   │                       │                         │
   │                       │ Store accessToken in memory
   │                       │ Set Authorization header
   │  Redirect to dashboard│                         │
   │◀──────────────────────│                         │
```

### 9.4 Token Refresh Flow

```
SPA detects 401 or proactive expiry (T-60s)
  → POST /auth/refresh (refresh cookie sent automatically)
  → New accessToken returned
  → Retry queued requests
  → On refresh failure: clear state, redirect to /login?session=expired
```

### 9.5 Authorization Model (RBAC + ABAC)

**Roles (system-defined):**

| Role | Capabilities |
|---|---|
| `super_admin` | Cross-tenant platform administration |
| `tenant_admin` | Full tenant configuration and user management |
| `content_manager` | Publish, unpublish, manage catalog |
| `content_editor` | Create and edit drafts; cannot publish |
| `metadata_editor` | Edit metadata and tags only |
| `qc_reviewer` | Approve/reject QC workflows |
| `analyst` | Read-only analytics access |
| `viewer` | Read-only catalog access |

**Permission format:** `resource:action` (e.g., `titles:publish`, `ai:approve_suggestions`)

**Enforcement layers:**
1. API Gateway — JWT validation
2. NestJS Guards — role/permission check
3. Service Layer — tenant scoping
4. Frontend — route guards + conditional UI rendering (defense in depth; not sole enforcement)

### 9.6 SSO Flow (OIDC)

```
User clicks "Sign in with SSO"
  → Redirect to IdP authorization endpoint
  → IdP authenticates user
  → Callback to /auth/oidc/callback with authorization code
  → Backend exchanges code for IdP tokens
  → Backend maps IdP groups → CMS roles (configurable mapping)
  → Issue CMS JWT + refresh cookie
  → Redirect to SPA with session established
```

---

## 10. AI-Powered Features

AI is delivered through a dedicated **AI Orchestration Service** that abstracts provider APIs, manages prompts, tracks costs, and enforces approval workflows.

### 10.1 AI Feature Matrix

| Feature | Input | Output | Human Approval |
|---|---|---|---|
| **Auto Metadata Generation** | Video file / transcript | Title, synopsis, genres, tags | Required before publish |
| **Cast & Crew Extraction** | Video + existing metadata | Structured cast list with confidence | Required |
| **Thumbnail Selection** | Video frames | Ranked thumbnail candidates | Required |
| **Subtitle Generation** | Audio track | SRT/VTT subtitles per locale | Required |
| **Content Moderation** | Video frames + audio transcript | Safety flags, severity scores | Required for flagged content |
| **SEO Optimization** | Metadata + trends | SEO title, description, keywords | Optional |
| **Catalog Gap Analysis** | Full catalog + analytics | Missing genre coverage, stale content alerts | Informational |
| **Smart Collections** | Natural language query | Dynamic collection rules | Required |
| **Publish Time Optimization** | Historical engagement data | Recommended publish windows | Optional |
| **Duplicate Detection** | New upload + catalog | Similarity score, match candidates | Required |
| **Translation Assist** | Source metadata + target locale | Translated fields with glossary | Required |
| **Chapters & Highlights** | Video + transcript | Chapter markers, highlight clips | Optional |

### 10.2 AI Job Lifecycle

```
┌─────────┐    ┌──────────┐    ┌────────────┐    ┌──────────────┐    ┌──────────┐
│ PENDING │───▶│ QUEUED   │───▶│ PROCESSING │───▶│ COMPLETED    │───▶│ APPROVED │
└─────────┘    └──────────┘    └────────────┘    └──────────────┘    └──────────┘
                                    │                    │
                                    ▼                    ▼
                               ┌─────────┐         ┌──────────┐
                               │ FAILED  │         │ REJECTED │
                               └─────────┘         └──────────┘
```

### 10.3 AI Architecture Components

| Component | Responsibility |
|---|---|
| **Prompt Registry** | Versioned prompts with A/B testing support |
| **Provider Adapter** | Swappable OpenAI / Bedrock / Azure backends |
| **Cost Tracker** | Per-tenant token/compute budgeting |
| **Confidence Scorer** | Threshold-based auto-flagging for low-confidence results |
| **Feedback Loop** | Accept/reject signals stored for prompt tuning |
| **PII Redactor** | Strip sensitive data before external AI calls |

### 10.4 AI UX Patterns (Frontend)

- **Inline suggestions:** Ghost text in metadata fields with accept/dismiss actions
- **AI panel:** Side drawer showing job status, history, and batch operations
- **Diff view:** Side-by-side comparison of AI suggestion vs. current value
- **Batch AI:** Select multiple titles → run metadata generation queue
- **Cost indicator:** Per-job and per-tenant AI spend visible to admins

### 10.5 Guardrails

- No auto-publish from AI output without explicit human approval
- Tenant-configurable AI feature toggles
- Content sent to external models is logged with retention policies
- Rate limits and daily spend caps per tenant
- Fallback to manual workflow on provider outage

---

## 11. Deployment Architecture

### 11.1 Environment Topology

| Environment | Purpose | Data |
|---|---|---|
| **local** | Developer machines | Docker Compose (MongoDB, Redis, LocalStack) |
| **dev** | Integration testing | Shared cloud resources, synthetic data |
| **staging** | Pre-production validation | Anonymized production-like data |
| **production** | Live tenant operations | Full HA, multi-AZ |

### 11.2 Production Infrastructure Diagram

```
                         ┌─────────────────────────────────┐
                         │         Route 53 (DNS)          │
                         └───────────────┬─────────────────┘
                                         │
                         ┌───────────────▼─────────────────┐
                         │   CloudFront CDN + WAF          │
                         │   (SPA static assets)           │
                         └───────────────┬─────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
   ┌──────────▼──────────┐   ┌──────────▼──────────┐   ┌──────────▼──────────┐
   │  S3 (Static Host)   │   │  ALB (HTTPS)        │   │  WebSocket ALB      │
   │  web-admin build    │   │  API + BFF          │   │  Real-time events   │
   └─────────────────────┘   └──────────┬──────────┘   └──────────┬──────────┘
                                        │                          │
                              ┌─────────▼──────────────────────────▼─────────┐
                              │         ECS Fargate / EKS Cluster            │
                              │  ┌─────────┐ ┌─────────┐ ┌───────────────┐  │
                              │  │ API (x3)│ │ BFF (x2)│ │ AI Orch. (x2) │  │
                              │  └─────────┘ └─────────┘ └───────────────┘  │
                              │  ┌─────────┐ ┌─────────┐ ┌───────────────┐  │
                              │  │ Media   │ │ Search  │ │ Notification  │  │
                              │  │ Worker  │ │ Indexer │ │ Service       │  │
                              │  └─────────┘ └─────────┘ └───────────────┘  │
                              └─────────┬────────────────────────────────────┘
                                        │
         ┌──────────────┬───────────────┼───────────────┬──────────────┐
         │              │               │               │              │
  ┌──────▼──────┐ ┌─────▼─────┐ ┌───────▼───────┐ ┌─────▼─────┐ ┌─────▼─────┐
  │ MongoDB     │ │ Redis     │ │ S3 (Media)    │ │ OpenSearch│ │ SQS       │
  │ Atlas (HA)  │ │ Cluster   │ │ + Lifecycle   │ │ Cluster   │ │ Queues    │
  └─────────────┘ └───────────┘ └───────────────┘ └───────────┘ └───────────┘
```

### 11.3 CI/CD Pipeline

```
PR opened
  → Lint + Type Check (Turborepo affected)
  → Unit Tests (Vitest)
  → Integration Tests (API + Testcontainers)
  → Build (Vite + NestJS)
  → E2E Tests (Playwright against preview env)
  → Security Scan (Snyk / Trivy)
  → Preview Deploy (staging slot)
  → Manual / Auto promote to production
```

### 11.4 Scaling Strategy

| Component | Scaling Trigger | Strategy |
|---|---|---|
| API / BFF | CPU > 70% or p95 latency | Horizontal pod autoscaling |
| AI Workers | Queue depth > 100 | Worker pool scale-out |
| Media Workers | Ingest backlog | Independent worker fleet |
| MongoDB | Storage / IOPS | Atlas auto-scaling |
| Redis | Memory > 80% | Cluster resize |
| CDN | Traffic spikes | Edge caching (automatic) |

### 11.5 Observability

| Signal | Tool | Key Dashboards |
|---|---|---|
| Logs | Structured JSON → CloudWatch / Datadog | Error rate, auth failures |
| Metrics | Prometheus / Datadog | API latency, queue depth, AI cost |
| Traces | OpenTelemetry | End-to-end request tracing |
| Uptime | Synthetic checks | Login, search, publish flows |
| RUM | Frontend SDK | LCP, CLS, INP, JS errors |

### 11.6 Disaster Recovery

- **RPO:** 1 hour (MongoDB continuous backup)
- **RTO:** 4 hours (multi-AZ failover + runbook)
- **Media assets:** S3 cross-region replication
- **Runbooks:** Documented in `docs/runbooks/`

---

## 12. Folder Naming Conventions

### 12.1 General Rules

| Rule | Convention | Example |
|---|---|---|
| Directories | `kebab-case` | `content-catalog/`, `ai-orchestrator/` |
| React components | `PascalCase` files | `TitleCard.tsx`, `MetadataEditor.tsx` |
| Hooks | `camelCase` with `use` prefix | `useTitleQuery.ts`, `usePublishFlow.ts` |
| Utilities | `camelCase` | `formatDuration.ts`, `parseApiError.ts` |
| Constants | `SCREAMING_SNAKE_CASE` in `constants.ts` | `MAX_UPLOAD_SIZE` |
| Types/Interfaces | `PascalCase` | `Title`, `PublishSchedule` |
| Enums | `PascalCase` name, `PascalCase` members | `ContentStatus.Draft` |
| API modules (BE) | `kebab-case` folders, `PascalCase` classes | `titles/titles.controller.ts` |
| Test files | Same name + `.test.ts` / `.spec.ts` | `TitleCard.test.tsx` |
| Storybook | Same name + `.stories.tsx` | `Button.stories.tsx` |
| CSS Modules | `PascalCase.module.css` | `TitleCard.module.css` |
| Environment files | `.env.{environment}` | `.env.staging` |

### 12.2 Feature Naming

- Feature folder name = **domain noun**, singular or compound: `content-catalog`, `user-management`
- Page components suffix with `Page`: `TitlesListPage.tsx`, `DashboardPage.tsx`
- Layout components suffix with `Layout`: `AdminLayout.tsx`, `AuthLayout.tsx`
- Provider components suffix with `Provider`: `AuthProvider.tsx`, `TenantProvider.tsx`

### 12.3 API & Data Naming

| Context | Convention | Example |
|---|---|---|
| REST endpoints | Plural nouns, kebab-case | `/api/v1/publish-schedules` |
| Query params | camelCase | `?sortBy=createdAt&pageSize=25` |
| JSON fields | camelCase | `{ "tenantId", "createdAt" }` |
| DB collections | snake_case plural | `audit_logs`, `ai_jobs` |
| Event names | dot-namespaced | `content.title.published` |
| Permission keys | colon-separated | `titles:publish` |

### 12.4 Git Conventions

| Item | Convention |
|---|---|
| Branch | `feature/<ticket>-<short-description>` |
| Commit | Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:` |
| PR title | `[MODULE] Description` e.g., `[Catalog] Add bulk publish` |

---

## 13. Cross-Cutting Concerns

### 13.1 Error Handling

- **Frontend:** Global error boundary per route segment; toast for recoverable errors; retry for network failures
- **Backend:** Centralized exception filter; never leak stack traces in production
- **AI Jobs:** Dead-letter queue with admin retry UI

### 13.2 Caching Strategy

| Layer | Strategy | TTL |
|---|---|---|
| CDN | Static assets, immutable hashed files | 1 year |
| Redis | Session, permissions, hot catalog queries | 5–60 min |
| TanStack Query | Server state per entity type | Stale-while-revalidate |
| OpenSearch | Search results | Near real-time (event-driven) |

### 13.3 Security Checklist

- HTTPS everywhere; HSTS enabled
- CSP headers on SPA
- Input validation on all API boundaries (Zod/class-validator)
- OWASP Top 10 mitigations documented in ADRs
- Dependency scanning in CI
- Least-privilege IAM roles per service
- Encryption at rest (AES-256) and in transit (TLS 1.3)

### 13.4 Performance Budgets (Frontend)

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| Initial JS bundle | < 200KB gzipped (route-level code splitting) |
| Catalog table (10K rows) | Virtualized; 60fps scroll |

### 13.5 Testing Strategy

| Level | Scope | Tools |
|---|---|---|
| Unit | Utils, hooks, reducers | Vitest |
| Component | UI components in isolation | Testing Library + Vitest |
| Integration | Feature flows with MSW | Testing Library |
| E2E | Critical paths (login, create title, publish) | Playwright |
| Contract | API schema validation | OpenAPI + Pact (optional) |
| Visual | Design system regression | Chromatic / Percy |

---

## 14. Frontend Tech Lead Assessment Criteria

This architecture is intentionally structured to evaluate frontend leadership across these dimensions:

| Dimension | How This Architecture Demonstrates It |
|---|---|
| **System Design** | Feature-sliced monorepo, BFF, clear module boundaries |
| **Scalability** | Virtualized tables, code splitting, caching layers |
| **Maintainability** | Design system package, shared types, barrel exports |
| **Developer Experience** | Turborepo, strict TS, consistent folder conventions |
| **Quality Engineering** | Testing pyramid, CI gates, performance budgets |
| **Security Awareness** | Token storage, RBAC UI, CSP, no secrets in client |
| **Accessibility** | Radix primitives, WCAG targets, keyboard navigation |
| **AI Integration UX** | Human-in-the-loop patterns, job monitoring, cost visibility |
| **Cross-Team Collaboration** | OpenAPI contracts, ADRs, shared `types` package |
| **Operational Maturity** | Observability, feature flags, runbooks, phased delivery |

---

## 15. Phased Delivery Roadmap

### Phase 1 — Foundation (Weeks 1–4)
- Monorepo scaffolding, design system, auth, tenant model
- Title/Episode CRUD, asset upload, basic publishing
- Dashboard skeleton, audit log

### Phase 2 — AI & Workflow (Weeks 5–8)
- AI orchestration service, metadata generation, moderation
- QC workflow, suggestion approval UI
- Global search, collections

### Phase 3 — Scale & Polish (Weeks 9–12)
- Analytics dashboards, performance optimization
- Rights/availability, localization
- E2E test suite, staging → production deploy

---

## Appendix A — Architecture Decision Records (ADR) Index

| ADR | Decision |
|---|---|
| ADR-001 | Monorepo with Turborepo + pnpm |
| ADR-002 | MongoDB as primary datastore |
| ADR-003 | JWT access + HttpOnly refresh token |
| ADR-004 | AI human-in-the-loop approval required |
| ADR-005 | BFF layer for admin SPA |
| ADR-006 | Feature-sliced frontend architecture |

*Individual ADR documents to be authored in `docs/adr/` during implementation.*

---

## Appendix B — Glossary

| Term | Definition |
|---|---|
| **OTT** | Over-The-Top; streaming content delivered directly to viewers |
| **CMS** | Content Management System for operations teams |
| **BFF** | Backend-for-Frontend; API tailored to a specific client |
| **Rail** | A horizontal row of content items on a streaming homepage |
| **QC** | Quality Control review before publish |
| **Windowing** | Time-bound availability of content rights |

---

*End of Architecture Document*
