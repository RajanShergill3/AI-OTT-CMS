# AI OTT CMS — Software Development Roadmap

| Field | Value |
|---|---|
| **Version** | 1.0.0 |
| **Project** | AI-Powered OTT Content Management System |
| **Total Duration** | 14 weeks (70 working days) |
| **Team Model** | 1 Frontend Tech Lead · 1 Backend Engineer · 0.5 QA (shared) |
| **Methodology** | Milestone-driven · trunk-based development · weekly releases to staging |
| **Last Updated** | July 8, 2026 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Team & Working Agreements](#2-team--working-agreements)
3. [Milestone Overview](#3-milestone-overview)
4. [Milestone 0 — Project Foundation](#milestone-0--project-foundation)
5. [Milestone 1 — Authentication & App Shell](#milestone-1--authentication--app-shell)
6. [Milestone 2 — Movies Module (Backend + Frontend)](#milestone-2--movies-module-backend--frontend)
7. [Milestone 3 — Categories & Dashboard](#milestone-3--categories--dashboard)
8. [Milestone 4 — Users & Role Management](#milestone-4--users--role-management)
9. [Milestone 5 — Analytics & Reporting](#milestone-5--analytics--reporting)
10. [Milestone 6 — AI Assistant Integration](#milestone-6--ai-assistant-integration)
11. [Milestone 7 — Settings, Profile & Polish](#milestone-7--settings-profile--polish)
12. [Milestone 8 — Hardening, E2E & Production Launch](#milestone-8--hardening-e2e--production-launch)
13. [Cross-Milestone Standards](#13-cross-milestone-standards)
14. [Risk Register](#14-risk-register)
15. [Post-Launch Backlog](#15-post-launch-backlog)

---

## 1. Executive Summary

This roadmap breaks the AI OTT CMS into **9 milestones (M0–M8)** over **14 weeks**, mirroring how a small engineering team would deliver a production-ready admin platform.

| Phase | Milestones | Weeks | Outcome |
|---|---|---|---|
| **Foundation** | M0 – M1 | 1 – 3 | Repo, CI/CD, auth, app shell |
| **Core CMS** | M2 – M4 | 4 – 8 | Movies, categories, dashboard, users |
| **Intelligence** | M5 – M6 | 9 – 11 | Analytics, AI metadata tools |
| **Launch** | M7 – M8 | 12 – 14 | Settings, polish, E2E, production |

### Cumulative Deliverables by Week 14

- Fully functional React 19 admin SPA with 9 pages
- Express + MongoDB API (33 endpoints per API spec)
- JWT auth with RBAC (Admin, Editor, Viewer)
- Dockerized local and staging environments
- GitHub Actions CI pipeline
- Postman collection, API docs, screenshots
- Staging and production deployment runbooks

---

## 2. Team & Working Agreements

### 2.1 Roles

| Role | Responsibility |
|---|---|
| **Frontend Tech Lead** | React architecture, design system, feature modules, E2E tests, code review |
| **Backend Engineer** | Express API, MongoDB schemas, auth, AI service integration, integration tests |
| **QA (part-time)** | Test plans, manual regression, E2E scenario validation from M4 onward |

### 2.2 Git Workflow

| Practice | Rule |
|---|---|
| **Main branch** | `main` — always deployable to staging |
| **Feature branches** | `feature/<ticket>-<short-description>` |
| **Commit format** | [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `chore:`, `docs:`, `test:` |
| **PR policy** | 1 approval required; CI must pass; squash merge to `main` |
| **Release tags** | `v0.1.0` after M1, increment minor per milestone, `v1.0.0` at M8 |

### 2.3 Definition of Done (Global)

A milestone is complete when:

- [ ] All planned features merged to `main`
- [ ] Unit test coverage ≥ 70% on new backend services
- [ ] No P0/P1 bugs open for the milestone scope
- [ ] API endpoints documented and added to Postman collection
- [ ] Staging deployment verified by QA smoke test
- [ ] README and relevant docs updated
- [ ] Screenshots captured for new UI surfaces

---

## 3. Milestone Overview

```
Week:  1    2    3    4    5    6    7    8    9   10   11   12   13   14
       ├────┤
       M0 Foundation
            ├─────────┤
            M1 Auth & Shell
                      ├──────────────┤
                      M2 Movies
                                     ├──────────┤
                                     M3 Categories & Dashboard
                                                ├─────────┤
                                                M4 Users & RBAC
                                                          ├────────┤
                                                          M5 Analytics
                                                                   ├────────┤
                                                                   M6 AI Assistant
                                                                            ├────────┤
                                                                            M7 Settings & Polish
                                                                                     ├──────────┤
                                                                                     M8 Launch
```

| Milestone | Name | Duration | Target Tag |
|---|---|---|---|
| M0 | Project Foundation | 1 week | — |
| M1 | Authentication & App Shell | 2 weeks | `v0.1.0` |
| M2 | Movies Module | 2.5 weeks | `v0.2.0` |
| M3 | Categories & Dashboard | 1.5 weeks | `v0.3.0` |
| M4 | Users & Role Management | 1.5 weeks | `v0.4.0` |
| M5 | Analytics & Reporting | 1.5 weeks | `v0.5.0` |
| M6 | AI Assistant Integration | 1.5 weeks | `v0.6.0` |
| M7 | Settings, Profile & Polish | 1.5 weeks | `v0.7.0` |
| M8 | Hardening, E2E & Production | 2 weeks | `v1.0.0` |

---

## Milestone 0 — Project Foundation

| Field | Value |
|---|---|
| **Duration** | 5 working days (Week 1) |
| **Goal** | Establish repository structure, tooling, CI skeleton, and local dev environment |
| **Owners** | Frontend Tech Lead + Backend Engineer (pair) |

### Deliverables

- `frontend/` and `backend/` scaffolded with TypeScript strict mode
- Docker Compose for MongoDB + Redis + local stack
- ESLint, Prettier, EditorConfig configured
- GitHub Actions CI: lint + typecheck (no tests yet)
- Empty route shells for all 9 pages
- Seed script skeleton

### Git Commits

| # | Branch | Commit Message |
|---|---|---|
| 1 | `feature/init-repo` | `chore: initialize repository with README and gitignore` |
| 2 | `feature/init-repo` | `chore(frontend): scaffold Vite React 19 TypeScript app` |
| 3 | `feature/init-repo` | `chore(backend): scaffold Express TypeScript project structure` |
| 4 | `feature/init-repo` | `chore: add ESLint, Prettier, and EditorConfig for frontend and backend` |
| 5 | `feature/docker-setup` | `chore(docker): add docker-compose for MongoDB and Redis` |
| 6 | `feature/docker-setup` | `chore(docker): add Dockerfiles for frontend and backend` |
| 7 | `feature/ci-pipeline` | `ci: add GitHub Actions workflow for lint and typecheck` |
| 8 | `feature/frontend-routes` | `feat(frontend): add route shells for all pages with placeholder components` |
| 9 | `feature/backend-health` | `feat(backend): add health check endpoint and MongoDB connection` |
| 10 | `feature/docs` | `docs: add getting-started guide and environment variable templates` |

**Expected commit count:** 10–12 commits

### Testing

| Type | Scope | Target |
|---|---|---|
| Manual | `docker compose up` starts all services | Pass |
| Manual | `npm run dev` starts frontend and backend | Pass |
| Manual | `GET /api/v1/health` returns 200 | Pass |
| Automated | CI lint + typecheck on PR | Green |

### Documentation

| Document | Action |
|---|---|
| `README.md` | Setup instructions, prerequisites, quick start |
| `frontend/.env.example` | Document `VITE_API_URL` |
| `backend/.env.example` | Document `MONGODB_URI`, `JWT_SECRET`, `PORT` |
| `docs/guides/getting-started.md` | Local development walkthrough |
| `docker/README.md` | Docker usage instructions |

### Deployment

| Environment | Action |
|---|---|
| **Local** | Docker Compose verified on macOS and Linux |
| **GitHub** | Repository created; branch protection on `main` enabled |
| **Staging** | Not deployed — infrastructure provisioned in M1 |

### Exit Criteria

- [ ] Clone → install → run works in under 15 minutes for a new developer
- [ ] CI pipeline green on `main`
- [ ] All 9 page routes render placeholder content

---

## Milestone 1 — Authentication & App Shell

| Field | Value |
|---|---|
| **Duration** | 10 working days (Weeks 2–3) |
| **Goal** | JWT authentication, RBAC middleware, admin layout, login page, protected routes |
| **Owners** | Backend: auth module · Frontend: layout + login |
| **Depends on** | M0 |

### Deliverables

**Backend**
- User and Role Mongoose models
- `POST /auth/login`, `/logout`, `/refresh`, `GET /auth/me`, `PATCH /auth/change-password`
- JWT access token + HttpOnly refresh cookie
- Auth, RBAC, and error middleware
- Database seed: 3 default roles + 1 admin user

**Frontend**
- `AuthLayout`, `AdminLayout`, `ErrorLayout`
- `Sidebar`, `TopBar`, `PageHeader`, `UserMenu`
- Login page with form validation
- Auth context, route guards, token refresh interceptor
- 404 page
- Role-based sidebar visibility (Users, Settings hidden for non-admin)

### Git Commits

| # | Branch | Commit Message |
|---|---|---|
| 1 | `feature/auth-models` | `feat(backend): add User and Role mongoose models` |
| 2 | `feature/auth-models` | `feat(backend): add database seed for roles and admin user` |
| 3 | `feature/auth-service` | `feat(backend): implement JWT token service with refresh rotation` |
| 4 | `feature/auth-routes` | `feat(backend): add auth routes for login, logout, refresh, and profile` |
| 5 | `feature/auth-middleware` | `feat(backend): add auth and RBAC middleware` |
| 6 | `feature/auth-tests` | `test(backend): add integration tests for auth endpoints` |
| 7 | `feature/admin-layout` | `feat(frontend): add AdminLayout with Sidebar and TopBar` |
| 8 | `feature/admin-layout` | `feat(frontend): add role-based sidebar navigation` |
| 9 | `feature/login-page` | `feat(frontend): implement Login page with form validation` |
| 10 | `feature/auth-context` | `feat(frontend): add auth context, route guards, and API interceptor` |
| 11 | `feature/404-page` | `feat(frontend): add 404 error page` |
| 12 | `feature/postman-auth` | `docs(postman): add auth collection and local environment` |
| 13 | `feature/deploy-staging` | `ci: add staging deployment workflow` |

**Expected commit count:** 18–22 commits

### Testing

| Type | Scope | Target |
|---|---|---|
| Unit | `token.service`, password hashing utils | ≥ 80% coverage |
| Integration | Auth endpoints (login, refresh, logout, me) | 100% pass |
| Integration | RBAC middleware rejects wrong roles | Pass |
| Component | LoginForm validation states | Pass |
| Component | Route guard redirects unauthenticated users | Pass |
| Manual | Login → dashboard → logout flow | Pass |
| E2E | Login happy path (Playwright) | 1 spec passing |

### Documentation

| Document | Action |
|---|---|
| `docs/api/authentication.md` | Auth flows, token lifecycle, cookie config |
| `docs/adr/002-jwt-refresh-strategy.md` | ADR for JWT + HttpOnly refresh |
| `postman/collections/AI-OTT-CMS-Auth.postman_collection.json` | Auth-only collection |
| `screenshots/auth/login.png` | Login page screenshot |

### Deployment

| Environment | Action |
|---|---|
| **Staging** | First deploy: frontend (static) + backend API |
| **Staging** | MongoDB Atlas cluster provisioned (dev tier) |
| **Staging** | Environment secrets configured in GitHub Actions |
| **Staging** | Smoke test: health + login endpoints |

**Release tag:** `v0.1.0-staging`

### Exit Criteria

- [ ] Admin can log in and reach dashboard placeholder
- [ ] Invalid credentials show error; locked account handled
- [ ] Token refresh works silently before expiry
- [ ] Viewer cannot see Users/Settings in sidebar
- [ ] Staging URL accessible to team

---

## Milestone 2 — Movies Module (Backend + Frontend)

| Field | Value |
|---|---|
| **Duration** | 12 working days (Weeks 4–6, first half) |
| **Goal** | Full movie CRUD, list, search, media fields, publish status workflow |
| **Owners** | Backend: movies API · Frontend: movies list + create/edit |
| **Depends on** | M1 |

### Deliverables

**Backend**
- Movie Mongoose model (per SCHEMA.md)
- CRUD + list + search endpoints
- Pagination, filtering, sorting
- Activity log on create/update/delete
- Slug auto-generation and uniqueness validation
- Optimistic concurrency (`version` field)

**Frontend**
- Movies list page: DataTable, filters, search, pagination
- Movie create page: tabbed form (Details, Media, Cast, SEO)
- Movie edit page: same form with pre-filled data
- Status badges, delete confirmation modal
- Publish workflow buttons (role-gated)
- Viewer read-only mode

### Git Commits

| # | Branch | Commit Message |
|---|---|---|
| 1 | `feature/movie-model` | `feat(backend): add Movie mongoose model with indexes` |
| 2 | `feature/movie-service` | `feat(backend): implement movie service with CRUD and slug generation` |
| 3 | `feature/movie-routes` | `feat(backend): add movie routes for CRUD, list, and search` |
| 4 | `feature/movie-validation` | `feat(backend): add movie request validators and status state machine` |
| 5 | `feature/activity-log` | `feat(backend): add activity log model and logging on movie mutations` |
| 6 | `feature/movie-tests` | `test(backend): add integration tests for movie endpoints` |
| 7 | `feature/movies-list` | `feat(frontend): implement Movies list page with DataTable` |
| 8 | `feature/movies-filters` | `feat(frontend): add search, filters, and pagination to movies list` |
| 9 | `feature/movie-form` | `feat(frontend): add movie create/edit form with tabbed layout` |
| 10 | `feature/movie-form` | `feat(frontend): add cast table and media upload zones` |
| 11 | `feature/movie-publish` | `feat(frontend): add publish workflow bar with role-based actions` |
| 12 | `feature/movie-modals` | `feat(frontend): add delete and unsaved changes modals` |
| 13 | `feature/movie-readonly` | `feat(frontend): enforce read-only mode for Viewer role` |
| 14 | `feature/postman-movies` | `docs(postman): add movies endpoints to API collection` |
| 15 | `feature/screenshots-movies` | `docs: add movie list and edit page screenshots` |

**Expected commit count:** 25–30 commits

### Testing

| Type | Scope | Target |
|---|---|---|
| Unit | Movie service, slug util, pagination util | ≥ 75% coverage |
| Integration | Movie CRUD, search, filter, pagination | 100% pass |
| Integration | Status transition validation | Pass |
| Integration | Duplicate slug returns 409 | Pass |
| Component | MoviesDataTable renders and sorts | Pass |
| Component | MovieForm validation errors | Pass |
| Manual | Create → edit → publish → delete flow | Pass |
| E2E | Create movie and verify in list | 1 spec |

### Documentation

| Document | Action |
|---|---|
| `docs/API.md` | Verify movies section matches implementation |
| `postman/collections/AI-OTT-CMS-API.postman_collection.json` | Movies folder |
| `screenshots/content-catalog/` | List, detail, bulk actions |
| `docs/guides/testing.md` | How to run movie integration tests |

### Deployment

| Environment | Action |
|---|---|
| **Staging** | Deploy movies API + frontend |
| **Staging** | Run seed script with sample movies |
| **Staging** | QA regression: full movie CRUD smoke test |

**Release tag:** `v0.2.0`

### Exit Criteria

- [ ] Admin/Editor can create, edit, publish movies
- [ ] Viewer sees movies read-only
- [ ] Search and filters work with 100+ seeded movies
- [ ] Activity log records movie mutations
- [ ] Delete is soft-delete (Admin only)

---

## Milestone 3 — Categories & Dashboard

| Field | Value |
|---|---|
| **Duration** | 7 working days (Week 6, second half – Week 7) |
| **Goal** | Category CRUD, hierarchical categories, dashboard KPIs and activity feed |
| **Owners** | Backend: categories + dashboard APIs · Frontend: categories page + dashboard |
| **Depends on** | M2 |

### Deliverables

**Backend**
- Category model with parent hierarchy
- Category CRUD endpoints
- `movieCount` denormalization on movie assignment
- Dashboard summary, activities, statistics endpoints

**Frontend**
- Categories page: table/tree toggle, create/edit/delete modals
- Dashboard page: KPI cards, activity feed, upload trend chart
- Pending review table widget
- Category multi-select on movie form (wire up)

### Git Commits

| # | Branch | Commit Message |
|---|---|---|
| 1 | `feature/category-model` | `feat(backend): add Category model with hierarchy support` |
| 2 | `feature/category-routes` | `feat(backend): add category CRUD endpoints` |
| 3 | `feature/category-count` | `feat(backend): sync movieCount on movie category changes` |
| 4 | `feature/category-tests` | `test(backend): add integration tests for category endpoints` |
| 5 | `feature/dashboard-api` | `feat(backend): add dashboard summary, activities, and statistics endpoints` |
| 6 | `feature/categories-page` | `feat(frontend): implement Categories page with table and tree views` |
| 7 | `feature/category-modals` | `feat(frontend): add create, edit, and delete category modals` |
| 8 | `feature/dashboard-page` | `feat(frontend): implement Dashboard with KPI cards and activity feed` |
| 9 | `feature/dashboard-charts` | `feat(frontend): add upload trend chart to dashboard` |
| 10 | `feature/movie-category-link` | `feat(frontend): wire category multi-select on movie form` |
| 11 | `feature/postman-categories` | `docs(postman): add categories and dashboard endpoints` |
| 12 | `feature/screenshots-dashboard` | `docs: add dashboard and categories screenshots` |

**Expected commit count:** 15–18 commits

### Testing

| Type | Scope | Target |
|---|---|---|
| Integration | Category CRUD, hierarchy depth limit | Pass |
| Integration | Cannot delete category with movies | 409 |
| Integration | Dashboard summary returns correct counts | Pass |
| Component | CategoryTree expand/collapse | Pass |
| Component | KPI cards render loading and error states | Pass |
| Manual | Dashboard reflects newly created movie | Pass |
| E2E | Create category and assign to movie | 1 spec |

### Documentation

| Document | Action |
|---|---|
| `docs/database/SCHEMA.md` | Verify categories section |
| `screenshots/dashboard/` | Overview, activity feed |
| `screenshots/content-catalog/` | Category builder |

### Deployment

| Environment | Action |
|---|---|
| **Staging** | Deploy + seed categories |
| **Staging** | QA smoke: dashboard loads under 2s (P95) |

**Release tag:** `v0.3.0`

### Exit Criteria

- [ ] Categories CRUD with hierarchy (max 3 levels)
- [ ] Dashboard shows live KPIs and recent activity
- [ ] Movies can be assigned to categories
- [ ] Delete blocked when category has movies

---

## Milestone 4 — Users & Role Management

| Field | Value |
|---|---|
| **Duration** | 7 working days (Week 8) |
| **Goal** | Admin-only user management: invite, CRUD, change role, activate/deactivate |
| **Owners** | Backend: users API · Frontend: users page |
| **Depends on** | M1 |

### Deliverables

**Backend**
- User CRUD endpoints (Admin only)
- Change role and status endpoints
- Self-modification guards
- Invite flow (`status: invited`)

**Frontend**
- Users list page with filters
- Invite, edit, change role, deactivate modals
- User detail drawer with activity preview
- Enforce Admin-only route guard on `/users`

### Git Commits

| # | Branch | Commit Message |
|---|---|---|
| 1 | `feature/users-service` | `feat(backend): extend user service with admin CRUD operations` |
| 2 | `feature/users-routes` | `feat(backend): add user management routes with admin guard` |
| 3 | `feature/users-role-status` | `feat(backend): add change role and change status endpoints` |
| 4 | `feature/users-validation` | `feat(backend): add self-modification and last-admin guards` |
| 5 | `feature/users-tests` | `test(backend): add integration tests for user management` |
| 6 | `feature/users-page` | `feat(frontend): implement Users list page with DataTable` |
| 7 | `feature/users-modals` | `feat(frontend): add invite, edit, role, and status modals` |
| 8 | `feature/users-drawer` | `feat(frontend): add user detail drawer with activity preview` |
| 9 | `feature/users-route-guard` | `feat(frontend): add admin-only route guard for users page` |
| 10 | `feature/postman-users` | `docs(postman): add users endpoints to API collection` |
| 11 | `feature/screenshots-users` | `docs: add user management screenshots` |

**Expected commit count:** 14–16 commits

### Testing

| Type | Scope | Target |
|---|---|---|
| Integration | User CRUD (Admin only) | Pass |
| Integration | Editor gets 403 on user endpoints | Pass |
| Integration | Cannot deactivate self or last admin | Pass |
| Integration | Change role updates permissions | Pass |
| Component | InviteUserForm validation | Pass |
| Manual | Invite → change role → suspend flow | Pass |
| E2E | Admin invites editor; editor cannot access users | 1 spec |

### Documentation

| Document | Action |
|---|---|
| `docs/api/authentication.md` | Add RBAC matrix for user management |
| `screenshots/admin/` | User management, role permissions |

### Deployment

| Environment | Action |
|---|---|
| **Staging** | Deploy with test users (admin, editor, viewer) |
| **Staging** | QA role-based access regression test |

**Release tag:** `v0.4.0`

### Exit Criteria

- [ ] Admin can manage full user lifecycle
- [ ] Editor and Viewer cannot access `/users`
- [ ] Role changes reflect immediately in UI permissions
- [ ] All user mutations logged to activity_logs

---

## Milestone 5 — Analytics & Reporting

| Field | Value |
|---|---|
| **Duration** | 7 working days (Week 9) |
| **Goal** | Analytics dashboards with charts and exportable reports |
| **Owners** | Backend: analytics aggregation · Frontend: analytics page |
| **Depends on** | M2, M3, M4 |

### Deliverables

**Backend**
- Analytics endpoints: movie totals, user totals, content by category, monthly uploads
- Aggregation queries with caching (Redis, 5-min TTL)

**Frontend**
- Analytics page with tabbed layout (Overview, Content, Users, Uploads)
- Charts: category breakdown, upload trends, status distribution
- Top movies table, monthly uploads table
- Date range picker, CSV export

### Git Commits

| # | Branch | Commit Message |
|---|---|---|
| 1 | `feature/analytics-service` | `feat(backend): add analytics aggregation service` |
| 2 | `feature/analytics-cache` | `feat(backend): add Redis caching for analytics queries` |
| 3 | `feature/analytics-routes` | `feat(backend): add analytics endpoints` |
| 4 | `feature/analytics-tests` | `test(backend): add integration tests for analytics endpoints` |
| 5 | `feature/analytics-page` | `feat(frontend): implement Analytics page with tabbed layout` |
| 6 | `feature/analytics-charts` | `feat(frontend): add category breakdown and upload trend charts` |
| 7 | `feature/analytics-tables` | `feat(frontend): add top movies and monthly uploads tables` |
| 8 | `feature/analytics-export` | `feat(frontend): add CSV export for analytics data` |
| 9 | `feature/analytics-rbac` | `feat(frontend): hide user analytics from non-admin roles` |
| 10 | `feature/postman-analytics` | `docs(postman): add analytics endpoints` |
| 11 | `feature/screenshots-analytics` | `docs: add analytics dashboard screenshots` |

**Expected commit count:** 14–16 commits

### Testing

| Type | Scope | Target |
|---|---|---|
| Integration | Analytics endpoints return correct aggregates | Pass |
| Integration | User totals endpoint Admin-only | Pass |
| Unit | Analytics date range bucketing | Pass |
| Component | Charts render with empty data | Pass |
| Component | Date range picker updates queries | Pass |
| Manual | Export CSV downloads valid file | Pass |
| Performance | Analytics API P95 < 500ms with cache | Pass |

### Documentation

| Document | Action |
|---|---|
| `docs/API.md` | Verify analytics section |
| `screenshots/analytics/` | Dashboard metrics |

### Deployment

| Environment | Action |
|---|---|
| **Staging** | Redis added to staging stack |
| **Staging** | Seed sufficient data for meaningful charts |

**Release tag:** `v0.5.0`

### Exit Criteria

- [ ] All 4 analytics endpoints functional
- [ ] Charts render correctly with 6+ months of seed data
- [ ] User analytics hidden from Editor/Viewer
- [ ] CSV export works

---

## Milestone 6 — AI Assistant Integration

| Field | Value |
|---|---|
| **Duration** | 7 working days (Week 10) |
| **Goal** | AI-powered metadata generation with human-in-the-loop approval |
| **Owners** | Backend: AI service + endpoints · Frontend: AI panel on movie form |
| **Depends on** | M2 |

### Deliverables

**Backend**
- AI service with provider adapter (OpenAI)
- Endpoints: description, SEO, tags, social caption
- `ai_jobs` and `ai_suggestions` models
- Cost tracking and daily budget enforcement
- Mock mode for development without API key

**Frontend**
- AI Assistant panel on movie create/edit
- Generate buttons for each AI feature
- AISuggestionCard with Accept/Reject/Edit
- Loading states and error handling (budget exceeded, provider down)

### Git Commits

| # | Branch | Commit Message |
|---|---|---|
| 1 | `feature/ai-models` | `feat(backend): add AI job and suggestion mongoose models` |
| 2 | `feature/ai-adapter` | `feat(backend): add AI provider adapter with OpenAI integration` |
| 3 | `feature/ai-mock` | `feat(backend): add mock AI adapter for development and testing` |
| 4 | `feature/ai-service` | `feat(backend): implement AI generation service with cost tracking` |
| 5 | `feature/ai-routes` | `feat(backend): add AI generation endpoints` |
| 6 | `feature/ai-budget` | `feat(backend): add daily AI budget enforcement per tenant` |
| 7 | `feature/ai-tests` | `test(backend): add integration tests for AI endpoints with mock adapter` |
| 8 | `feature/ai-panel` | `feat(frontend): add AI Assistant panel to movie form` |
| 9 | `feature/ai-suggestions` | `feat(frontend): add AI suggestion cards with accept and reject actions` |
| 10 | `feature/ai-loading` | `feat(frontend): add loading and error states for AI generation` |
| 11 | `feature/ai-logging` | `feat(backend): log AI accept/reject actions to activity log` |
| 12 | `feature/postman-ai` | `docs(postman): add AI endpoints to collection` |
| 13 | `feature/screenshots-ai` | `docs: add AI panel and suggestion screenshots` |
| 14 | `feature/adr-ai` | `docs(adr): add ADR for AI human-in-the-loop approval` |

**Expected commit count:** 16–20 commits

### Testing

| Type | Scope | Target |
|---|---|---|
| Unit | AI prompt builder, response parser | ≥ 80% coverage |
| Integration | AI endpoints with mock adapter | Pass |
| Integration | Budget exceeded returns 429 | Pass |
| Component | AI panel loading, success, error states | Pass |
| Component | Accept suggestion populates form field | Pass |
| Manual | Full flow: generate → accept → save movie | Pass |
| Manual | Reject suggestion does not modify form | Pass |

### Documentation

| Document | Action |
|---|---|
| `docs/adr/004-ai-human-in-the-loop.md` | AI approval ADR |
| `docs/guides/ai-configuration.md` | API key setup, mock mode, budget config |
| `screenshots/ai/` | AI panel, suggestion diff |
| `prompt-history/sessions/` | Log AI integration session |

### Deployment

| Environment | Action |
|---|---|
| **Staging** | OpenAI API key in secrets (or mock mode) |
| **Staging** | AI budget set to $10/day for staging |
| **Staging** | QA validates all 4 AI generation types |

**Release tag:** `v0.6.0`

### Exit Criteria

- [ ] All 4 AI endpoints generate usable output
- [ ] Suggestions require explicit accept before applying
- [ ] Budget limit enforced with clear error message
- [ ] Mock mode works for CI and local dev without API key
- [ ] AI actions logged to activity_logs

---

## Milestone 7 — Settings, Profile & Polish

| Field | Value |
|---|---|
| **Duration** | 7 working days (Week 11) |
| **Goal** | Tenant settings, user profile, UI polish, accessibility, responsive fixes |
| **Owners** | Frontend Tech Lead (lead) · Backend: settings API |
| **Depends on** | M1, M4 |

### Deliverables

**Backend**
- Settings model with 7 groups (general, branding, content, AI, notifications, security, integrations)
- Settings GET/PATCH endpoints (Admin only)
- Change password already done in M1; profile PATCH endpoint

**Frontend**
- Settings page with sidebar navigation and group forms
- Profile page with personal info, security, preferences tabs
- Dark mode theme toggle
- Responsive fixes across all pages (per UI_STRUCTURE.md)
- Accessibility pass: focus management, ARIA labels, keyboard navigation
- Loading skeletons and empty states on all list pages

### Git Commits

| # | Branch | Commit Message |
|---|---|---|
| 1 | `feature/settings-model` | `feat(backend): add Settings model with group sub-schemas` |
| 2 | `feature/settings-routes` | `feat(backend): add settings GET and PATCH endpoints` |
| 3 | `feature/profile-routes` | `feat(backend): add profile update endpoint` |
| 4 | `feature/settings-tests` | `test(backend): add integration tests for settings endpoints` |
| 5 | `feature/settings-page` | `feat(frontend): implement Settings page with sidebar groups` |
| 6 | `feature/settings-forms` | `feat(frontend): add settings forms for all seven groups` |
| 7 | `feature/profile-page` | `feat(frontend): implement Profile page with tabs` |
| 8 | `feature/theme-toggle` | `feat(frontend): add dark mode theme toggle` |
| 9 | `feature/responsive-fixes` | `fix(frontend): responsive layout fixes for mobile and tablet` |
| 10 | `feature/a11y-pass` | `fix(frontend): accessibility improvements for forms and navigation` |
| 11 | `feature/loading-states` | `feat(frontend): add skeleton loaders and empty states` |
| 12 | `feature/screenshots-all` | `docs: capture remaining page screenshots for assessment` |
| 13 | `feature/component-guidelines` | `docs(frontend): add component and accessibility guidelines` |

**Expected commit count:** 18–22 commits

### Testing

| Type | Scope | Target |
|---|---|---|
| Integration | Settings CRUD per group | Pass |
| Integration | Non-admin cannot access settings | 403 |
| Component | Settings forms validation | Pass |
| Component | Profile password change flow | Pass |
| Component | Theme toggle persists preference | Pass |
| Manual | Responsive check on mobile, tablet, desktop | Pass |
| Accessibility | axe-core scan — 0 critical violations | Pass |
| Lighthouse | Performance ≥ 85, Accessibility ≥ 95 | Pass |

### Documentation

| Document | Action |
|---|---|
| `docs/frontend/component-guidelines.md` | Design system usage |
| `docs/frontend/state-management.md` | Query vs Zustand conventions |
| `screenshots/` | Complete screenshot set for all pages |
| `screenshots/responsive/` | Tablet and mobile layouts |

### Deployment

| Environment | Action |
|---|---|
| **Staging** | Full UI regression by QA |
| **Staging** | Lighthouse audit on staging URL |

**Release tag:** `v0.7.0`

### Exit Criteria

- [ ] All 9 pages fully functional and polished
- [ ] Settings persist across sessions
- [ ] Profile password change works
- [ ] Dark mode works
- [ ] Mobile layouts usable for core workflows
- [ ] Complete screenshot set in `screenshots/`

---

## Milestone 8 — Hardening, E2E & Production Launch

| Field | Value |
|---|---|
| **Duration** | 10 working days (Weeks 12–14) |
| **Goal** | Production readiness: security hardening, full E2E suite, performance, launch |
| **Owners** | Full team |
| **Depends on** | M0 – M7 |

### Deliverables

- Full Playwright E2E test suite (critical paths)
- Security hardening: rate limiting, CORS, CSP, input sanitization
- Performance optimization: code splitting, lazy routes, query caching
- Production infrastructure (Terraform or manual AWS setup)
- Production deployment with rollback runbook
- Final documentation package for assessment
- `v1.0.0` release

### Git Commits

| # | Branch | Commit Message |
|---|---|---|
| 1 | `feature/e2e-auth` | `test(e2e): add Playwright specs for auth flows` |
| 2 | `feature/e2e-movies` | `test(e2e): add Playwright specs for movie CRUD` |
| 3 | `feature/e2e-categories` | `test(e2e): add Playwright specs for categories` |
| 4 | `feature/e2e-users` | `test(e2e): add Playwright specs for user management` |
| 5 | `feature/e2e-ci` | `ci: add E2E workflow with docker-compose test stack` |
| 6 | `feature/security-hardening` | `fix(backend): add rate limiting, CORS whitelist, and helmet headers` |
| 7 | `feature/security-csp` | `fix(frontend): add Content Security Policy meta headers` |
| 8 | `feature/performance` | `perf(frontend): add route-level code splitting and lazy loading` |
| 9 | `feature/performance` | `perf(frontend): optimize bundle size and add query stale times` |
| 10 | `feature/security-scan` | `ci: add dependency and container security scanning` |
| 11 | `feature/terraform` | `infra: add Terraform modules for staging and production` |
| 12 | `feature/deploy-production` | `ci: add production deployment workflow with manual approval` |
| 13 | `feature/runbooks` | `docs: add incident response, backup, and rollback runbooks` |
| 14 | `feature/postman-final` | `docs(postman): finalize complete API collection` |
| 15 | `feature/readme-final` | `docs: finalize README with architecture links and demo credentials` |
| 16 | `release/v1.0.0` | `chore(release): v1.0.0 production release` |

**Expected commit count:** 20–25 commits

### Testing

| Type | Scope | Target |
|---|---|---|
| E2E | Login → dashboard → create movie → publish | Pass |
| E2E | Admin invites user → role enforcement | Pass |
| E2E | AI generate description → accept → save | Pass |
| E2E | Category CRUD and assign to movie | Pass |
| E2E | Settings update and verify persistence | Pass |
| Integration | Full API regression suite | 100% pass |
| Security | npm audit — 0 high/critical | Pass |
| Security | OWASP ZAP baseline scan on staging | No high findings |
| Performance | LCP < 2.5s, INP < 200ms on dashboard | Pass |
| Load | API handles 50 concurrent users (k6 smoke) | P95 < 500ms |
| Manual | Full regression checklist (QA sign-off) | Pass |

### Documentation

| Document | Action |
|---|---|
| `README.md` | Final project overview, demo URL, credentials, architecture links |
| `docs/guides/deployment.md` | Staging and production deploy steps |
| `docs/guides/testing.md` | Complete testing guide (unit, integration, E2E) |
| `docs/runbooks/` | Incident response, rollback, database backup |
| `postman/README.md` | Import and usage instructions |
| `prompt-history/index.md` | Complete session index |
| All `docs/adr/` | Finalize 6 ADRs |

### Deployment

| Environment | Action |
|---|---|
| **CI** | E2E runs on every PR to `main` |
| **Staging** | Final staging regression and sign-off |
| **Production** | Provision infrastructure (CloudFront, ALB, ECS/VM, MongoDB Atlas) |
| **Production** | Deploy `v1.0.0` with manual approval gate |
| **Production** | DNS configured; HTTPS verified |
| **Production** | Seed production admin account; disable default credentials |
| **Production** | Monitoring: health checks, error alerting, uptime monitor |
| **Production** | Rollback tested: redeploy previous tag `v0.7.0` |

**Release tag:** `v1.0.0`

### Exit Criteria

- [ ] E2E suite passes in CI (≥ 8 critical specs)
- [ ] Production deployed and accessible
- [ ] Rollback procedure tested
- [ ] All documentation complete for assessment
- [ ] Postman collection covers all 33 endpoints
- [ ] Security scan clean
- [ ] Team sign-off on launch checklist

---

## 13. Cross-Milestone Standards

### 13.1 Git Commit Cadence

| Milestone | Expected Commits | PRs |
|---|---|---|
| M0 | 10–12 | 3–4 |
| M1 | 18–22 | 5–6 |
| M2 | 25–30 | 6–8 |
| M3 | 15–18 | 4–5 |
| M4 | 14–16 | 4 |
| M5 | 14–16 | 4 |
| M6 | 16–20 | 5 |
| M7 | 18–22 | 5–6 |
| M8 | 20–25 | 6–8 |
| **Total** | **~155–180** | **~42–50** |

### 13.2 Testing Pyramid (Target at v1.0.0)

```
        ╱ E2E (8–12 specs) ╲
       ╱ Integration (60+) ╲
      ╱   Unit (120+)       ╲
```

| Layer | Tool | Coverage Target |
|---|---|---|
| Unit (backend) | Vitest / Jest | ≥ 75% on services |
| Unit (frontend) | Vitest + Testing Library | ≥ 60% on hooks and utils |
| Integration (backend) | Supertest + Testcontainers MongoDB | All API endpoints |
| E2E | Playwright | Critical user journeys |
| Manual | QA checklist | Every milestone staging sign-off |

### 13.3 Documentation Deliverables (Cumulative)

| Document | Milestone |
|---|---|
| `README.md` | M0 (draft) → M8 (final) |
| `docs/ARCHITECTURE.md` | Pre-built |
| `docs/FOLDER_STRUCTURE.md` | Pre-built |
| `docs/database/SCHEMA.md` | Pre-built |
| `docs/API.md` | Pre-built → verified M2–M6 |
| `docs/frontend/UI_STRUCTURE.md` | Pre-built → verified M7 |
| `docs/guides/getting-started.md` | M0 |
| `docs/guides/testing.md` | M2 → M8 |
| `docs/guides/deployment.md` | M1 → M8 |
| `docs/api/authentication.md` | M1 |
| `docs/adr/*.md` | M1, M6, M8 |
| `postman/collections/` | M1 → M8 |
| `screenshots/` | M1 → M7 |
| `prompt-history/` | Ongoing |
| `docs/runbooks/` | M8 |

### 13.4 Deployment Cadence

| Event | Environment | Trigger |
|---|---|---|
| Every merge to `main` | Staging (auto) | GitHub Actions |
| Milestone complete | Staging (tagged) | Manual tag + QA sign-off |
| M8 completion | Production | Manual approval + `v1.0.0` tag |
| Hotfix | Production | `hotfix/*` branch → fast-track PR |

### 13.5 Weekly Team Ceremonies

| Ceremony | Frequency | Duration |
|---|---|---|
| Sprint planning | Monday | 30 min |
| Daily standup | Daily | 15 min |
| PR review block | Daily | 1 hr |
| Staging demo | Friday | 30 min |
| Milestone retrospective | End of milestone | 45 min |

---

## 14. Risk Register

| Risk | Impact | Likelihood | Mitigation | Owner |
|---|---|---|---|---|
| AI provider outage or rate limits | High | Medium | Mock adapter for dev/CI; graceful degradation UI | Backend |
| MongoDB schema changes mid-project | Medium | Medium | ADRs for schema; migration scripts in `backend/scripts/` | Backend |
| Scope creep (Series/Episodes) | High | High | Defer to post-launch backlog; movies-only for v1 | Tech Lead |
| Frontend bundle size bloat | Medium | Medium | Route-level code splitting in M8; bundle budget in CI | Frontend |
| JWT refresh token security issues | High | Low | HttpOnly cookie; ADR documented; security review in M8 | Backend |
| Single developer bandwidth | High | Medium | Prioritize M1–M4 for MVP demo; M5–M8 can compress | Tech Lead |
| Staging/production config drift | Medium | Medium | Terraform IaC in M8; env parity checklist | DevOps |

---

## 15. Post-Launch Backlog

Items explicitly deferred beyond v1.0.0:

| Priority | Feature | Estimated Effort |
|---|---|---|
| P1 | Series, Seasons, Episodes content types | 3 weeks |
| P1 | SSO / OIDC integration | 1 week |
| P2 | Forgot password / email reset flow | 3 days |
| P2 | WebSocket real-time notifications | 1 week |
| P2 | Bulk import/export (CSV/JSON) | 1 week |
| P3 | Watch history admin view | 3 days |
| P3 | Collections and homepage rails | 2 weeks |
| P3 | Rights and geo-availability windowing | 2 weeks |
| P3 | Multi-tenant branding per tenant | 1 week |

---

## Appendix A — Launch Checklist

```
Pre-Launch (M8 Week 1)
  □ E2E suite green in CI
  □ Security scan clean
  □ All API endpoints in Postman collection
  □ All pages have screenshots
  □ README complete with demo URL
  □ Staging regression signed off by QA

Launch Day (M8 Week 2)
  □ Production infrastructure provisioned
  □ Secrets rotated from staging defaults
  □ v1.0.0 tagged and deployed
  □ DNS and HTTPS verified
  □ Health checks and monitoring active
  □ Admin account created; seed credentials disabled
  □ Rollback procedure tested

Post-Launch (Week 15)
  □ Monitor error rates for 48 hours
  □ Milestone retrospective
  □ Prioritize post-launch backlog
  □ Submit assessment deliverables
```

---

## Appendix B — Milestone Dependency Graph

```
M0 (Foundation)
 └── M1 (Auth & Shell)
      ├── M2 (Movies)
      │    ├── M3 (Categories & Dashboard)
      │    ├── M5 (Analytics)
      │    └── M6 (AI Assistant)
      ├── M4 (Users)
      │    └── M7 (Settings & Profile)
      └── M7 (Settings & Profile)
           └── M8 (Launch)
                ↑
      M3, M4, M5, M6 ──→ M8
```

---

*End of Software Development Roadmap*
