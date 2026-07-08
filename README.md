# AI OTT CMS

A production-ready, **AI-powered Over-The-Top (OTT) Content Management System** built for content operations teams to manage movies, categories, users, and AI-generated metadata.

Designed as a **Frontend Tech Lead assessment** project with enterprise-grade architecture, API specifications, database design, UI structure, and a 14-week development roadmap.

---

## Project Status

| Phase | Status |
|---|---|
| Architecture & Planning | Complete |
| API & Database Design | Complete |
| UI Structure Specification | Complete |
| Development Roadmap | Complete |
| Implementation (M0–M8) | Not started |

---

## Features

- **Content Catalog** — Movie CRUD, search, filters, publish workflow (draft → review → published)
- **Categories** — Hierarchical genre/topic taxonomy with tree and table views
- **User Management** — Invite users, assign roles, activate/deactivate accounts (Admin)
- **Dashboard** — KPI cards, activity feed, upload trends, pending review queue
- **Analytics** — Movie distribution, upload reports, category breakdowns, CSV export
- **AI Assistant** — Generate descriptions, SEO keywords, tags, and social captions with human-in-the-loop approval
- **Settings** — Tenant branding, content policies, AI toggles, security configuration
- **RBAC** — Role-based access control (Admin, Editor, Viewer)

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | HTTP API framework |
| TypeScript | Type safety |
| MongoDB | Primary database |
| JWT | Authentication (access + refresh tokens) |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker | Local development and containerization |
| GitHub Actions | CI/CD pipelines |
| Redis | Caching (analytics, sessions) |

---

## Project Structure

```
ai-ott-cms/
├── frontend/                 # React 19 + Vite + Tailwind CSS
├── backend/                  # Node.js + Express + MongoDB
├── docker/                   # Dockerfiles and compose stacks
├── .github/workflows/        # GitHub Actions CI/CD
├── docs/                     # Architecture, API, schema, UI, roadmap
├── postman/                  # API collections and environments
├── screenshots/              # UI captures for assessment
├── prompt-history/           # AI-assisted development audit trail
├── prompts/                  # Original planning prompts
└── README.md
```

> See [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) for the complete enterprise folder layout.

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | System design, tech stack, bounded contexts, deployment |
| [Folder Structure](docs/FOLDER_STRUCTURE.md) | Enterprise directory layout for frontend, backend, Docker, CI |
| [API Specification](docs/API.md) | REST API — 33 endpoints across 7 modules |
| [Database Schema](docs/database/SCHEMA.md) | MongoDB collections, indexes, validation rules |
| [UI Structure](docs/frontend/UI_STRUCTURE.md) | Page layouts, components, modals, responsive behavior |
| [Development Roadmap](docs/ROADMAP.md) | 14-week milestone plan with commits, testing, deployment |

---

## Application Pages

| Page | Route | Access |
|---|---|---|
| Login | `/login` | Public |
| Dashboard | `/dashboard` | All roles |
| Movies | `/movies` | All roles (Editor+: write) |
| Categories | `/categories` | All roles (Editor+: write) |
| Users | `/users` | Admin |
| Analytics | `/analytics` | All roles |
| Settings | `/settings` | Admin |
| Profile | `/profile` | All roles |
| 404 | `*` | Public |

---

## API Overview

**Base URL:** `/api/v1`

| Module | Endpoints | Description |
|---|---|---|
| Authentication | 5 | Login, logout, refresh, profile, change password |
| Dashboard | 3 | Summary, activities, statistics |
| Movies | 6 | CRUD, list, search |
| Categories | 5 | CRUD, list |
| Users | 7 | CRUD, change role, activate/deactivate |
| Analytics | 4 | Totals, category breakdown, monthly uploads |
| AI Assistant | 4 | Description, SEO, tags, social caption |

> Full specification: [docs/API.md](docs/API.md)

---

## Roles & Permissions

| Role | Capabilities |
|---|---|
| **Admin** | Full access — users, settings, publish, delete |
| **Editor** | Create and edit content, trigger AI generation |
| **Viewer** | Read-only access to catalog, dashboard, and analytics |

---

## Getting Started

> Implementation begins at **Milestone M0** per the [roadmap](docs/ROADMAP.md). The steps below apply once `frontend/` and `backend/` are scaffolded.

### Prerequisites

- Node.js 22 LTS
- pnpm or npm
- Docker and Docker Compose
- MongoDB 7.x (or use Docker)

### Local Development (planned)

```bash
# Clone the repository
git clone <repository-url>
cd ai-ott-cms

# Start infrastructure (MongoDB, Redis)
docker compose -f docker/docker-compose.yml up -d

# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Environment Variables

**Backend** (`backend/.env.example`)

| Variable | Description |
|---|---|
| `PORT` | API server port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `CORS_ORIGIN` | Allowed frontend origin |

**Frontend** (`frontend/.env.example`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

## Development Roadmap

| Milestone | Weeks | Deliverable |
|---|---|---|
| M0 — Foundation | 1 | Repo, Docker, CI, route shells |
| M1 — Auth & Shell | 2–3 | JWT, layouts, login, staging deploy |
| M2 — Movies | 4–6 | Movie CRUD, search, publish workflow |
| M3 — Categories & Dashboard | 6–7 | Categories, KPIs, activity feed |
| M4 — Users | 8 | User management, RBAC |
| M5 — Analytics | 9 | Charts, reports, export |
| M6 — AI Assistant | 10 | AI metadata generation |
| M7 — Settings & Polish | 11 | Settings, profile, accessibility |
| M8 — Launch | 12–14 | E2E tests, security, production |

> Full plan: [docs/ROADMAP.md](docs/ROADMAP.md)

---

## Testing Strategy

| Layer | Tool | When |
|---|---|---|
| Unit | Vitest | Every milestone |
| Integration | Supertest + Testcontainers | M1 onward |
| Component | Testing Library | M1 onward |
| E2E | Playwright | M8 |
| Manual | QA checklist | Staging sign-off per milestone |

---

## Git Conventions

```
Branch:  feature/<ticket>-<short-description>
Commit:  feat: | fix: | chore: | docs: | test:
PR:      [MODULE] Description
```

---

## AI-Powered Features

| Feature | Description | Approval |
|---|---|---|
| Auto Description | Generate synopsis and extended description | Required |
| SEO Keywords | Meta title, description, keywords | Optional |
| Tag Generation | Content tags with confidence scores | Required |
| Social Caption | Platform-specific promotional captions | Optional |

All AI output requires explicit human acceptance before being saved to the catalog.

---

## Screenshots

UI screenshots will be added to `screenshots/` as pages are implemented:

```
screenshots/
├── auth/
├── dashboard/
├── content-catalog/
├── ai/
├── admin/
├── analytics/
└── responsive/
```

---

## Postman Collection

API collections and environments will live in `postman/`:

```
postman/
├── collections/
│   └── AI-OTT-CMS-API.postman_collection.json
└── environments/
    ├── local.postman_environment.json
    └── staging.postman_environment.json
```

---

## License

This project is for assessment and educational purposes. Add a license file before public distribution.

---

## Contributing

1. Read [docs/ROADMAP.md](docs/ROADMAP.md) to find the current milestone
2. Create a feature branch from `main`
3. Follow [Conventional Commits](https://www.conventionalcommits.org/)
4. Ensure CI passes (lint, typecheck, tests)
5. Open a PR with the format `[MODULE] Description`

---

## Links

- [Architecture Document](docs/ARCHITECTURE.md)
- [API Specification](docs/API.md)
- [Database Schema](docs/database/SCHEMA.md)
- [UI Structure](docs/frontend/UI_STRUCTURE.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [Development Roadmap](docs/ROADMAP.md)
