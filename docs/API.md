# AI OTT CMS — REST API Specification

| Field | Value |
|---|---|
| **Version** | 1.0.0 |
| **Base URL** | `/api/v1` |
| **Protocol** | HTTPS |
| **Content-Type** | `application/json` |
| **Auth** | JWT Bearer Token + Refresh Token |
| **Last Updated** | July 8, 2026 |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Standard Response Format](#3-standard-response-format)
4. [HTTP Status Codes](#4-http-status-codes)
5. [Pagination, Filtering & Sorting](#5-pagination-filtering--sorting)
6. [Module: Authentication](#6-module-authentication)
7. [Module: Dashboard](#7-module-dashboard)
8. [Module: Movies](#8-module-movies)
9. [Module: Categories](#9-module-categories)
10. [Module: Users](#10-module-users)
11. [Module: Analytics](#11-module-analytics)
12. [Module: AI Assistant](#12-module-ai-assistant)
13. [Error Code Reference](#13-error-code-reference)

---

## 1. Introduction

This document defines the RESTful API for the **AI OTT Content Management System**. The API enables CMS operators to manage movies, categories, users, and AI-generated metadata through a consistent, versioned interface.

### 1.1 API Design Principles

| Principle | Implementation |
|---|---|
| RESTful resources | Nouns for resources, HTTP verbs for actions |
| Versioning | URI prefix `/api/v1` |
| Stateless | JWT access tokens; no server-side sessions |
| Consistent envelopes | All responses follow a standard JSON structure |
| Idempotency | `DELETE` and safe `GET` are idempotent; `PUT` replaces, `PATCH` partial-updates |
| Security | HTTPS only; RBAC on every protected endpoint |

### 1.2 Global Headers

| Header | Required | Description |
|---|---|---|
| `Authorization` | Protected routes | `Bearer <access_token>` |
| `Content-Type` | POST/PATCH/PUT | `application/json` |
| `X-Request-Id` | Optional | Client-generated UUID for request tracing |
| `Idempotency-Key` | Optional | UUID for safe POST retries on create operations |

---

## 2. Authentication & Authorization

### 2.1 Token Strategy

| Token | Delivery | Lifetime | Storage |
|---|---|---|---|
| **Access Token** | JSON response body | 15 minutes | Client memory (not localStorage) |
| **Refresh Token** | `HttpOnly` cookie + optional body | 7 days | Secure cookie (`SameSite=Strict`) |

### 2.2 Roles

| Role | Slug | Capabilities |
|---|---|---|
| **Admin** | `admin` | Full access — users, settings, publish, delete |
| **Editor** | `editor` | Create and edit content; trigger AI; no user management |
| **Viewer** | `viewer` | Read-only access to catalog, dashboard, and analytics |

### 2.3 Role Matrix (Summary)

| Action | Admin | Editor | Viewer |
|---|---|---|---|
| Auth (login, profile) | ✅ | ✅ | ✅ |
| Dashboard read | ✅ | ✅ | ✅ |
| Movies CRUD | ✅ | Create/Update | Read only |
| Movies delete | ✅ | ❌ | ❌ |
| Categories CRUD | ✅ | Create/Update | Read only |
| Users CRUD | ✅ | ❌ | ❌ |
| Analytics read | ✅ | ✅ | ✅ |
| AI generation | ✅ | ✅ | ❌ |

---

## 3. Standard Response Format

### 3.1 Success Response

```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": {},
  "meta": {}
}
```

| Field | Type | Description |
|---|---|---|
| `success` | `boolean` | Always `true` for successful responses |
| `message` | `string` | Optional human-readable message |
| `data` | `object \| array \| null` | Response payload |
| `meta` | `object` | Pagination, timestamps, or metadata (optional) |

### 3.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error summary",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-07-08T16:00:00.000Z"
  }
}
```

| Field | Type | Description |
|---|---|---|
| `success` | `boolean` | Always `false` for errors |
| `error.code` | `string` | Machine-readable error code (see §13) |
| `error.message` | `string` | Human-readable error summary |
| `error.details` | `array` | Field-level validation errors (optional) |
| `meta.requestId` | `string` | Correlation ID for debugging |

### 3.3 Paginated List Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 142,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 4. HTTP Status Codes

| Code | Meaning | Usage |
|---|---|---|
| `200` | OK | Successful GET, PATCH, PUT |
| `201` | Created | Successful POST creating a resource |
| `204` | No Content | Successful DELETE or logout with no body |
| `400` | Bad Request | Malformed JSON or invalid query parameters |
| `401` | Unauthorized | Missing, expired, or invalid access token |
| `403` | Forbidden | Valid token but insufficient role/permission |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate slug, email, or version conflict |
| `422` | Unprocessable Entity | Validation failed on request body |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server failure |
| `503` | Service Unavailable | AI provider or dependency unavailable |

---

## 5. Pagination, Filtering & Sorting

### 5.1 Pagination Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | `integer` | `1` | Page number (1-indexed) |
| `limit` | `integer` | `20` | Items per page (max `100`) |

### 5.2 Sorting

| Parameter | Type | Default | Description |
|---|---|---|---|
| `sortBy` | `string` | `createdAt` | Field to sort by (whitelist per endpoint) |
| `sortOrder` | `string` | `desc` | `asc` or `desc` |

### 5.3 Filtering

Filters are passed as query parameters. Supported operators:

| Operator | Syntax | Example |
|---|---|---|
| Equality | `field=value` | `status=published` |
| Multiple values | `field=val1,val2` | `status=draft,published` |
| Date range | `fieldFrom` / `fieldTo` | `createdAtFrom=2026-01-01` |
| Search | `q` | `q=avengers` (full-text) |

---

## 6. Module: Authentication

**Base URL:** `/api/v1/auth`

---

### 6.1 Login

| Property | Value |
|---|---|
| **Purpose** | Authenticate a user with email and password; issue access and refresh tokens |
| **Base URL** | `/api/v1/auth` |
| **HTTP Method** | `POST` |
| **Endpoint** | `/login` |
| **Authentication Required** | No |
| **Required User Role** | None (public) |

#### Request Parameters

None.

#### Request Body

```json
{
  "email": "editor@ottcms.com",
  "password": "SecurePass123!"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | Yes | User email address |
| `password` | `string` | Yes | User password |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "email": "editor@ottcms.com",
      "firstName": "Jane",
      "lastName": "Editor",
      "displayName": "Jane Editor",
      "role": "editor",
      "avatarUrl": null
    }
  }
}
```

> **Note:** Refresh token is set as an `HttpOnly` cookie (`refreshToken`) in the response headers.

#### Error Response

**Status:** `401 Unauthorized`

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Status:** `403 Forbidden`

```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_SUSPENDED",
    "message": "Your account has been suspended. Contact an administrator."
  }
}
```

**Status:** `429 Too Many Requests`

```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account locked due to too many failed attempts. Try again in 15 minutes."
  }
}
```

#### Validation Rules

| Field | Rule |
|---|---|
| `email` | Required; valid email format; max 254 characters |
| `password` | Required; min 1 character |

---

### 6.2 Logout

| Property | Value |
|---|---|
| **Purpose** | Invalidate the current refresh token and end the user session |
| **Base URL** | `/api/v1/auth` |
| **HTTP Method** | `POST` |
| **Endpoint** | `/logout` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

None.

#### Request Body

```json
{}
```

Optional body; refresh token is read from the `HttpOnly` cookie.

#### Success Response

**Status:** `204 No Content`

No response body. Refresh token cookie is cleared.

#### Error Response

**Status:** `401 Unauthorized`

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Access token is missing or invalid"
  }
}
```

#### Validation Rules

None.

---

### 6.3 Refresh Token

| Property | Value |
|---|---|
| **Purpose** | Exchange a valid refresh token for a new access token (and optionally rotate refresh token) |
| **Base URL** | `/api/v1/auth` |
| **HTTP Method** | `POST` |
| **Endpoint** | `/refresh` |
| **Authentication Required** | No (uses refresh token cookie) |
| **Required User Role** | None |

#### Request Parameters

None.

#### Request Body

```json
{
  "refreshToken": "optional-if-not-using-cookie"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `refreshToken` | `string` | No | Only required if cookie is unavailable |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

#### Error Response

**Status:** `401 Unauthorized`

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token is invalid or expired. Please log in again."
  }
}
```

#### Validation Rules

| Field | Rule |
|---|---|
| `refreshToken` | Required if not present in cookie; must be a valid non-expired token |

---

### 6.4 Get Profile

| Property | Value |
|---|---|
| **Purpose** | Retrieve the authenticated user's profile and role information |
| **Base URL** | `/api/v1/auth` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/me` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

None.

#### Request Body

None.

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "email": "editor@ottcms.com",
    "firstName": "Jane",
    "lastName": "Editor",
    "displayName": "Jane Editor",
    "avatarUrl": "https://cdn.example.com/avatars/jane.jpg",
    "role": "editor",
    "status": "active",
    "preferences": {
      "locale": "en",
      "timezone": "Asia/Kolkata",
      "theme": "dark"
    },
    "lastLoginAt": "2026-07-08T10:30:00.000Z",
    "createdAt": "2026-01-15T08:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `401 Unauthorized`

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Access token is missing or invalid"
  }
}
```

#### Validation Rules

None.

---

### 6.5 Change Password

| Property | Value |
|---|---|
| **Purpose** | Allow the authenticated user to change their own password |
| **Base URL** | `/api/v1/auth` |
| **HTTP Method** | `PATCH` |
| **Endpoint** | `/change-password` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

None.

#### Request Body

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecure456!",
  "confirmPassword": "NewSecure456!"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `currentPassword` | `string` | Yes | Existing password for verification |
| `newPassword` | `string` | Yes | New password |
| `confirmPassword` | `string` | Yes | Must match `newPassword` |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully. Please log in again on other devices."
}
```

#### Error Response

**Status:** `401 Unauthorized`

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CURRENT_PASSWORD",
    "message": "Current password is incorrect"
  }
}
```

**Status:** `422 Unprocessable Entity`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "newPassword", "message": "Password must be at least 8 characters" },
      { "field": "confirmPassword", "message": "Passwords do not match" }
    ]
  }
}
```

#### Validation Rules

| Field | Rule |
|---|---|
| `currentPassword` | Required |
| `newPassword` | Required; min 8 characters; must contain uppercase, lowercase, and number |
| `confirmPassword` | Required; must equal `newPassword` |
| `newPassword` | Must differ from `currentPassword` |

---

## 7. Module: Dashboard

**Base URL:** `/api/v1/dashboard`

---

### 7.1 Dashboard Summary

| Property | Value |
|---|---|
| **Purpose** | Provide high-level KPIs and counts for the CMS home dashboard |
| **Base URL** | `/api/v1/dashboard` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/summary` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

None.

#### Request Body

None.

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalMovies": 248,
    "publishedMovies": 186,
    "draftMovies": 42,
    "inReviewMovies": 20,
    "totalCategories": 18,
    "totalUsers": 12,
    "activeUsers": 10,
    "pendingAiJobs": 3,
    "recentUploads": 7,
    "catalogHealthScore": 87
  },
  "meta": {
    "generatedAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `401 Unauthorized` | `403 Forbidden`

#### Validation Rules

None.

---

### 7.2 Recent Activities

| Property | Value |
|---|---|
| **Purpose** | Return the most recent audit log entries for the activity feed widget |
| **Base URL** | `/api/v1/dashboard` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/activities` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | `integer` | No | `10` | Number of activities (max `50`) |
| `severity` | `string` | No | — | Filter: `info`, `warning`, `critical` |
| `entityType` | `string` | No | — | Filter: `movie`, `user`, `category` |

#### Request Body

None.

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "665f1a2b3c4d5e6f7a8b9c0e",
      "actor": {
        "id": "665f1a2b3c4d5e6f7a8b9c0d",
        "email": "editor@ottcms.com",
        "displayName": "Jane Editor"
      },
      "action": "movie.published",
      "entityType": "movie",
      "entityId": "665f1a2b3c4d5e6f7a8b9c0f",
      "entityLabel": "The Last Horizon",
      "description": "Published movie 'The Last Horizon'",
      "severity": "info",
      "createdAt": "2026-07-08T15:45:00.000Z"
    }
  ],
  "meta": {
    "limit": 10
  }
}
```

#### Error Response

**Status:** `400 Bad Request` — invalid `limit` or filter value

**Status:** `401 Unauthorized` | `403 Forbidden`

#### Validation Rules

| Parameter | Rule |
|---|---|
| `limit` | Integer 1–50 |
| `severity` | One of: `info`, `warning`, `critical` |
| `entityType` | One of: `movie`, `user`, `category`, `role`, `setting` |

#### Pagination, Filtering & Sorting

- **Filtering:** `severity`, `entityType`
- **Sorting:** Fixed `createdAt desc` (most recent first)
- **Pagination:** `limit` only (no page offset for feed widget)

---

### 7.3 Statistics

| Property | Value |
|---|---|
| **Purpose** | Return time-series statistics for dashboard charts (uploads, publishes, views) |
| **Base URL** | `/api/v1/dashboard` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/statistics` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `period` | `string` | No | `30d` | Time range: `7d`, `30d`, `90d`, `12m` |
| `metrics` | `string` | No | all | Comma-separated: `uploads`, `publishes`, `views` |

#### Request Body

None.

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "period": "30d",
    "uploads": [
      { "date": "2026-07-01", "count": 3 },
      { "date": "2026-07-02", "count": 5 }
    ],
    "publishes": [
      { "date": "2026-07-01", "count": 2 },
      { "date": "2026-07-02", "count": 4 }
    ],
    "views": [
      { "date": "2026-07-01", "count": 1240 },
      { "date": "2026-07-02", "count": 1580 }
    ]
  },
  "meta": {
    "generatedAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid period. Allowed values: 7d, 30d, 90d, 12m"
  }
}
```

#### Validation Rules

| Parameter | Rule |
|---|---|
| `period` | One of: `7d`, `30d`, `90d`, `12m` |
| `metrics` | Comma-separated subset of: `uploads`, `publishes`, `views` |

#### Pagination, Filtering & Sorting

Not applicable — returns aggregated time-series buckets.

---

## 8. Module: Movies

**Base URL:** `/api/v1/movies`

---

### 8.1 Create Movie

| Property | Value |
|---|---|
| **Purpose** | Create a new movie entry in draft status |
| **Base URL** | `/api/v1/movies` |
| **HTTP Method** | `POST` |
| **Endpoint** | `/` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor |

#### Request Parameters

None.

#### Request Body

```json
{
  "title": "The Last Horizon",
  "slug": "the-last-horizon",
  "synopsis": "A sci-fi epic about humanity's final journey.",
  "description": "Extended description for detail pages...",
  "duration": 7200,
  "releaseYear": 2026,
  "language": "en",
  "contentRating": "PG-13",
  "categoryIds": ["665f1a2b3c4d5e6f7a8b9c10"],
  "tags": ["sci-fi", "adventure", "space"],
  "director": "Alex Rivera",
  "cast": [
    { "name": "Maria Chen", "character": "Captain Eva", "order": 1 }
  ],
  "media": {
    "posterUrl": "https://cdn.example.com/posters/last-horizon.jpg",
    "backdropUrl": "https://cdn.example.com/backdrops/last-horizon.jpg"
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Movie title |
| `slug` | `string` | No | Auto-generated from title if omitted |
| `synopsis` | `string` | No | Short description (≤ 500 chars) |
| `description` | `string` | No | Long description |
| `duration` | `number` | Yes | Runtime in seconds |
| `releaseYear` | `number` | No | Release year |
| `language` | `string` | No | ISO 639-1 code (default `en`) |
| `contentRating` | `string` | No | Content rating enum |
| `categoryIds` | `string[]` | No | Category ObjectId references |
| `tags` | `string[]` | No | Free-form tags |
| `director` | `string` | No | Director name |
| `cast` | `array` | No | Cast members |
| `media` | `object` | No | Media asset URLs |

#### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "message": "Movie created successfully",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0f",
    "title": "The Last Horizon",
    "slug": "the-last-horizon",
    "status": "draft",
    "duration": 7200,
    "createdBy": "665f1a2b3c4d5e6f7a8b9c0d",
    "createdAt": "2026-07-08T16:00:00.000Z",
    "updatedAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `409 Conflict`

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_SLUG",
    "message": "A movie with slug 'the-last-horizon' already exists"
  }
}
```

**Status:** `422 Unprocessable Entity` — validation errors

#### Validation Rules

| Field | Rule |
|---|---|
| `title` | Required; 1–300 characters |
| `slug` | Optional; lowercase alphanumeric + hyphens; unique per tenant |
| `synopsis` | Max 500 characters |
| `description` | Max 5000 characters |
| `duration` | Required; integer > 0 |
| `releaseYear` | 1900 – (current year + 2) |
| `contentRating` | One of: `G`, `PG`, `PG-13`, `R`, `NC-17`, `U`, `UA`, `A` |
| `categoryIds` | Each must be a valid, active category ID |
| `tags` | Max 20 tags; each max 50 characters |

---

### 8.2 Update Movie

| Property | Value |
|---|---|
| **Purpose** | Partially update an existing movie's metadata |
| **Base URL** | `/api/v1/movies` |
| **HTTP Method** | `PATCH` |
| **Endpoint** | `/:id` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor |

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Movie ObjectId (path param) |

#### Request Body

```json
{
  "title": "The Last Horizon (Director's Cut)",
  "synopsis": "Updated synopsis...",
  "status": "in_review",
  "categoryIds": ["665f1a2b3c4d5e6f7a8b9c10", "665f1a2b3c4d5e6f7a8b9c11"],
  "version": 2
}
```

All fields optional. Include `version` for optimistic concurrency.

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Movie updated successfully",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0f",
    "title": "The Last Horizon (Director's Cut)",
    "status": "in_review",
    "version": 3,
    "updatedAt": "2026-07-08T16:30:00.000Z"
  }
}
```

#### Error Response

**Status:** `404 Not Found`

```json
{
  "success": false,
  "error": {
    "code": "MOVIE_NOT_FOUND",
    "message": "Movie not found"
  }
}
```

**Status:** `409 Conflict` — stale `version` (optimistic lock)

**Status:** `422 Unprocessable Entity` — invalid status transition

#### Validation Rules

| Field | Rule |
|---|---|
| `id` | Valid MongoDB ObjectId |
| `version` | Must match current document version if provided |
| `status` | Valid transition per state machine (see SCHEMA.md) |
| All create fields | Same rules as Create Movie when provided |

---

### 8.3 Delete Movie

| Property | Value |
|---|---|
| **Purpose** | Soft-delete a movie (sets `deletedAt`; does not purge data) |
| **Base URL** | `/api/v1/movies` |
| **HTTP Method** | `DELETE` |
| **Endpoint** | `/:id` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin |

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Movie ObjectId (path param) |

#### Request Body

None.

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Movie deleted successfully",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0f",
    "deletedAt": "2026-07-08T16:45:00.000Z"
  }
}
```

#### Error Response

**Status:** `404 Not Found` | `403 Forbidden` (Editor attempting delete)

#### Validation Rules

| Rule | Constraint |
|---|---|
| `id` | Valid MongoDB ObjectId; movie must exist and not already be deleted |

---

### 8.4 Get Movie

| Property | Value |
|---|---|
| **Purpose** | Retrieve a single movie by ID with full metadata |
| **Base URL** | `/api/v1/movies` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/:id` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Movie ObjectId (path param) |

#### Request Body

None.

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0f",
    "title": "The Last Horizon",
    "slug": "the-last-horizon",
    "synopsis": "A sci-fi epic about humanity's final journey.",
    "description": "Extended description...",
    "duration": 7200,
    "releaseYear": 2026,
    "language": "en",
    "contentRating": "PG-13",
    "status": "published",
    "categoryIds": ["665f1a2b3c4d5e6f7a8b9c10"],
    "categories": [
      { "id": "665f1a2b3c4d5e6f7a8b9c10", "name": "Sci-Fi", "slug": "sci-fi" }
    ],
    "tags": ["sci-fi", "adventure"],
    "director": "Alex Rivera",
    "cast": [
      { "name": "Maria Chen", "character": "Captain Eva", "order": 1 }
    ],
    "media": {
      "posterUrl": "https://cdn.example.com/posters/last-horizon.jpg",
      "backdropUrl": "https://cdn.example.com/backdrops/last-horizon.jpg",
      "videoUrl": "https://cdn.example.com/videos/last-horizon.m3u8",
      "videoFormat": "hls"
    },
    "seo": {
      "metaTitle": "The Last Horizon | Stream Now",
      "metaDescription": "Watch The Last Horizon...",
      "keywords": ["sci-fi movie", "space adventure"]
    },
    "aiMetadata": {
      "generatedSynopsis": "AI-generated synopsis...",
      "suggestedTags": ["space", "future"],
      "lastProcessedAt": "2026-07-07T12:00:00.000Z"
    },
    "statistics": {
      "viewCount": 4520,
      "completionCount": 2100,
      "averageRating": 4.3
    },
    "featured": false,
    "publishedAt": "2026-07-01T00:00:00.000Z",
    "createdBy": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "displayName": "Jane Editor"
    },
    "version": 3,
    "createdAt": "2026-06-15T10:00:00.000Z",
    "updatedAt": "2026-07-08T16:30:00.000Z"
  }
}
```

#### Error Response

**Status:** `404 Not Found`

#### Validation Rules

| Rule | Constraint |
|---|---|
| `id` | Valid MongoDB ObjectId |

---

### 8.5 List Movies

| Property | Value |
|---|---|
| **Purpose** | Retrieve a paginated, filterable list of movies |
| **Base URL** | `/api/v1/movies` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | `integer` | No | `1` | Page number |
| `limit` | `integer` | No | `20` | Items per page (max `100`) |
| `sortBy` | `string` | No | `createdAt` | `title`, `createdAt`, `updatedAt`, `releaseYear`, `publishedAt` |
| `sortOrder` | `string` | No | `desc` | `asc` or `desc` |
| `status` | `string` | No | — | `draft`, `in_review`, `approved`, `scheduled`, `published`, `unpublished`, `archived` |
| `categoryId` | `string` | No | — | Filter by category |
| `contentRating` | `string` | No | — | Filter by rating |
| `featured` | `boolean` | No | — | Filter featured movies |
| `releaseYear` | `integer` | No | — | Filter by year |

#### Request Body

None.

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "665f1a2b3c4d5e6f7a8b9c0f",
      "title": "The Last Horizon",
      "slug": "the-last-horizon",
      "status": "published",
      "duration": 7200,
      "releaseYear": 2026,
      "contentRating": "PG-13",
      "media": {
        "posterUrl": "https://cdn.example.com/posters/last-horizon.jpg",
        "thumbnailUrl": "https://cdn.example.com/thumbs/last-horizon.jpg"
      },
      "categories": [
        { "id": "665f1a2b3c4d5e6f7a8b9c10", "name": "Sci-Fi" }
      ],
      "featured": false,
      "publishedAt": "2026-07-01T00:00:00.000Z",
      "createdAt": "2026-06-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 248,
      "totalPages": 13,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### Error Response

**Status:** `400 Bad Request` — invalid query parameters

#### Validation Rules

| Parameter | Rule |
|---|---|
| `page` | Integer ≥ 1 |
| `limit` | Integer 1–100 |
| `sortBy` | Whitelist: `title`, `createdAt`, `updatedAt`, `releaseYear`, `publishedAt` |
| `status` | Valid status enum or comma-separated list |

#### Pagination, Filtering & Sorting

- **Pagination:** `page`, `limit`
- **Sorting:** `sortBy`, `sortOrder`
- **Filtering:** `status`, `categoryId`, `contentRating`, `featured`, `releaseYear`

---

### 8.6 Search Movies

| Property | Value |
|---|---|
| **Purpose** | Full-text search across movie title, synopsis, tags, and cast |
| **Base URL** | `/api/v1/movies` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/search` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `q` | `string` | Yes | — | Search query (min 2 characters) |
| `page` | `integer` | No | `1` | Page number |
| `limit` | `integer` | No | `20` | Items per page (max `50`) |
| `status` | `string` | No | — | Filter by status |
| `categoryId` | `string` | No | — | Filter by category |

#### Request Body

None.

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "665f1a2b3c4d5e6f7a8b9c0f",
      "title": "The Last Horizon",
      "slug": "the-last-horizon",
      "status": "published",
      "synopsis": "A sci-fi epic about humanity's final journey.",
      "media": {
        "posterUrl": "https://cdn.example.com/posters/last-horizon.jpg"
      },
      "score": 12.5,
      "matchedFields": ["title", "tags"]
    }
  ],
  "meta": {
    "query": "horizon sci-fi",
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 3,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### Error Response

**Status:** `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Search query must be at least 2 characters"
  }
}
```

#### Validation Rules

| Parameter | Rule |
|---|---|
| `q` | Required; 2–200 characters |
| `page` | Integer ≥ 1 |
| `limit` | Integer 1–50 |

#### Pagination, Filtering & Sorting

- **Pagination:** `page`, `limit`
- **Filtering:** `status`, `categoryId`
- **Sorting:** Relevance score (desc) — not user-configurable

---

## 9. Module: Categories

**Base URL:** `/api/v1/categories`

---

### 9.1 Create Category

| Property | Value |
|---|---|
| **Purpose** | Create a new content category or genre |
| **Base URL** | `/api/v1/categories` |
| **HTTP Method** | `POST` |
| **Endpoint** | `/` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor |

#### Request Body

```json
{
  "name": "Sci-Fi",
  "slug": "sci-fi",
  "description": "Science fiction movies and series",
  "parentId": null,
  "imageUrl": "https://cdn.example.com/categories/sci-fi.jpg",
  "color": "#6366F1",
  "sortOrder": 1,
  "isActive": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Display name |
| `slug` | `string` | No | Auto-generated if omitted |
| `description` | `string` | No | Category description |
| `parentId` | `string` | No | Parent category ID for hierarchy |
| `imageUrl` | `string` | No | Category image URL |
| `color` | `string` | No | Hex color for UI badges |
| `sortOrder` | `number` | No | Sort position (default `0`) |
| `isActive` | `boolean` | No | Visibility flag (default `true`) |

#### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c10",
    "name": "Sci-Fi",
    "slug": "sci-fi",
    "isActive": true,
    "movieCount": 0,
    "createdAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `409 Conflict` — duplicate name or slug

**Status:** `422 Unprocessable Entity` — validation errors

#### Validation Rules

| Field | Rule |
|---|---|
| `name` | Required; 1–100 characters; unique per tenant |
| `slug` | Lowercase alphanumeric + hyphens; unique per tenant |
| `description` | Max 1000 characters |
| `parentId` | Valid category ID; max hierarchy depth 3 |
| `color` | Hex format `#RRGGBB` if provided |

---

### 9.2 List Categories

| Property | Value |
|---|---|
| **Purpose** | Retrieve all categories with optional hierarchy |
| **Base URL** | `/api/v1/categories` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | `integer` | No | `1` | Page number |
| `limit` | `integer` | No | `50` | Items per page (max `100`) |
| `sortBy` | `string` | No | `sortOrder` | `name`, `sortOrder`, `movieCount`, `createdAt` |
| `sortOrder` | `string` | No | `asc` | `asc` or `desc` |
| `isActive` | `boolean` | No | — | Filter active/inactive |
| `parentId` | `string` | No | — | Filter by parent (`root` for top-level) |
| `flat` | `boolean` | No | `true` | `false` returns nested tree structure |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "665f1a2b3c4d5e6f7a8b9c10",
      "name": "Sci-Fi",
      "slug": "sci-fi",
      "description": "Science fiction movies",
      "parentId": null,
      "imageUrl": "https://cdn.example.com/categories/sci-fi.jpg",
      "color": "#6366F1",
      "sortOrder": 1,
      "isActive": true,
      "movieCount": 42,
      "children": []
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalItems": 18,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### Pagination, Filtering & Sorting

- **Pagination:** `page`, `limit`
- **Sorting:** `sortBy`, `sortOrder`
- **Filtering:** `isActive`, `parentId`

---

### 9.3 Get Category

| Property | Value |
|---|---|
| **Purpose** | Retrieve a single category by ID |
| **Base URL** | `/api/v1/categories` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/:id` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Category ObjectId |

#### Success Response

**Status:** `200 OK` — full category object with `movieCount` and optional `children`

#### Error Response

**Status:** `404 Not Found`

---

### 9.4 Update Category

| Property | Value |
|---|---|
| **Purpose** | Partially update a category |
| **Base URL** | `/api/v1/categories` |
| **HTTP Method** | `PATCH` |
| **Endpoint** | `/:id` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor |

#### Request Body

```json
{
  "name": "Science Fiction",
  "description": "Updated description",
  "sortOrder": 2,
  "isActive": true
}
```

#### Success Response

**Status:** `200 OK`

#### Error Response

**Status:** `404 Not Found` | `409 Conflict` | `422 Unprocessable Entity`

#### Validation Rules

Same as Create Category for provided fields. Cannot set `parentId` to self or descendant.

---

### 9.5 Delete Category

| Property | Value |
|---|---|
| **Purpose** | Soft-delete a category |
| **Base URL** | `/api/v1/categories` |
| **HTTP Method** | `DELETE` |
| **Endpoint** | `/:id` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin |

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Category ObjectId |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c10",
    "deletedAt": "2026-07-08T17:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `409 Conflict`

```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_IN_USE",
    "message": "Cannot delete category with 42 associated movies. Reassign movies first."
  }
}
```

#### Validation Rules

| Rule | Constraint |
|---|---|
| `id` | Valid ObjectId; must have `movieCount === 0` and no child categories |

---

## 10. Module: Users

**Base URL:** `/api/v1/users`

---

### 10.1 Create User

| Property | Value |
|---|---|
| **Purpose** | Create a new CMS user account (sends invite email) |
| **Base URL** | `/api/v1/users` |
| **HTTP Method** | `POST` |
| **Endpoint** | `/` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin |

#### Request Body

```json
{
  "email": "neweditor@ottcms.com",
  "firstName": "John",
  "lastName": "Smith",
  "role": "editor"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | Yes | Unique email per tenant |
| `firstName` | `string` | Yes | Given name |
| `lastName` | `string` | Yes | Family name |
| `role` | `string` | Yes | `admin`, `editor`, or `viewer` |

#### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "message": "User created. Invitation email sent.",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c20",
    "email": "neweditor@ottcms.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "editor",
    "status": "invited",
    "createdAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `409 Conflict` — duplicate email

**Status:** `422 Unprocessable Entity`

#### Validation Rules

| Field | Rule |
|---|---|
| `email` | Required; valid email; unique per tenant |
| `firstName`, `lastName` | Required; 1–100 characters |
| `role` | One of: `admin`, `editor`, `viewer` |

---

### 10.2 List Users

| Property | Value |
|---|---|
| **Purpose** | Retrieve a paginated list of CMS users |
| **Base URL** | `/api/v1/users` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin |

#### Request Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | `integer` | No | `1` | Page number |
| `limit` | `integer` | No | `20` | Items per page (max `100`) |
| `sortBy` | `string` | No | `createdAt` | `firstName`, `lastName`, `email`, `createdAt`, `lastLoginAt` |
| `sortOrder` | `string` | No | `desc` | `asc` or `desc` |
| `status` | `string` | No | — | `active`, `invited`, `suspended`, `deactivated` |
| `role` | `string` | No | — | `admin`, `editor`, `viewer` |
| `q` | `string` | No | — | Search by name or email |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "email": "editor@ottcms.com",
      "firstName": "Jane",
      "lastName": "Editor",
      "displayName": "Jane Editor",
      "role": "editor",
      "status": "active",
      "lastLoginAt": "2026-07-08T10:30:00.000Z",
      "createdAt": "2026-01-15T08:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 12,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### Pagination, Filtering & Sorting

- **Pagination:** `page`, `limit`
- **Sorting:** `sortBy`, `sortOrder`
- **Filtering:** `status`, `role`
- **Search:** `q` (name or email)

---

### 10.3 Get User

| Property | Value |
|---|---|
| **Purpose** | Retrieve a single user by ID |
| **Base URL** | `/api/v1/users` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/:id` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin |

#### Success Response

**Status:** `200 OK` — full user profile (excludes `passwordHash`)

#### Error Response

**Status:** `404 Not Found`

---

### 10.4 Update User

| Property | Value |
|---|---|
| **Purpose** | Update a user's profile information |
| **Base URL** | `/api/v1/users` |
| **HTTP Method** | `PATCH` |
| **Endpoint** | `/:id` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin |

#### Request Body

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "avatarUrl": "https://cdn.example.com/avatars/jane.jpg"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `firstName` | `string` | No | Given name |
| `lastName` | `string` | No | Family name |
| `avatarUrl` | `string` | No | Profile image URL |

#### Success Response

**Status:** `200 OK`

#### Validation Rules

| Field | Rule |
|---|---|
| `firstName`, `lastName` | 1–100 characters if provided |
| `avatarUrl` | Valid HTTPS URL if provided |

---

### 10.5 Delete User

| Property | Value |
|---|---|
| **Purpose** | Soft-delete and deactivate a user account |
| **Base URL** | `/api/v1/users` |
| **HTTP Method** | `DELETE` |
| **Endpoint** | `/:id` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c20",
    "status": "deactivated",
    "deletedAt": "2026-07-08T17:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `403 Forbidden` — cannot delete own account

**Status:** `404 Not Found`

#### Validation Rules

| Rule | Constraint |
|---|---|
| Cannot delete self | Admin cannot delete their own account via this endpoint |
| Cannot delete last admin | At least one active admin must remain |

---

### 10.6 Change Role

| Property | Value |
|---|---|
| **Purpose** | Assign a different role to a user |
| **Base URL** | `/api/v1/users` |
| **HTTP Method** | `PATCH` |
| **Endpoint** | `/:id/role` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin |

#### Request Body

```json
{
  "role": "editor"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `role` | `string` | Yes | `admin`, `editor`, or `viewer` |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c20",
    "role": "editor",
    "updatedAt": "2026-07-08T17:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `403 Forbidden` — cannot change own role

#### Validation Rules

| Field | Rule |
|---|---|
| `role` | One of: `admin`, `editor`, `viewer` |
| Self-modification | Admin cannot change their own role |

---

### 10.7 Activate / Deactivate User

| Property | Value |
|---|---|
| **Purpose** | Toggle a user's account status between active and suspended/deactivated |
| **Base URL** | `/api/v1/users` |
| **HTTP Method** | `PATCH` |
| **Endpoint** | `/:id/status` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin |

#### Request Body

```json
{
  "status": "suspended",
  "reason": "Policy violation — optional audit note"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | `string` | Yes | `active`, `suspended`, or `deactivated` |
| `reason` | `string` | No | Audit note (max 500 chars) |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "User status updated to suspended",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c20",
    "status": "suspended",
    "updatedAt": "2026-07-08T17:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `403 Forbidden` — cannot deactivate self

#### Validation Rules

| Field | Rule |
|---|---|
| `status` | One of: `active`, `suspended`, `deactivated` |
| `reason` | Max 500 characters |
| Self-modification | Admin cannot suspend/deactivate own account |

---

## 11. Module: Analytics

**Base URL:** `/api/v1/analytics`

---

### 11.1 Total Movies

| Property | Value |
|---|---|
| **Purpose** | Return aggregate movie counts broken down by status |
| **Base URL** | `/api/v1/analytics` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/movies/total` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

None.

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "total": 248,
    "byStatus": {
      "draft": 42,
      "in_review": 20,
      "approved": 8,
      "scheduled": 12,
      "published": 186,
      "unpublished": 5,
      "archived": 15
    },
    "publishedPercentage": 75.0
  },
  "meta": {
    "generatedAt": "2026-07-08T16:00:00.000Z"
  }
}
```

---

### 11.2 Total Users

| Property | Value |
|---|---|
| **Purpose** | Return aggregate user counts broken down by role and status |
| **Base URL** | `/api/v1/analytics` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/users/total` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "total": 12,
    "byRole": {
      "admin": 2,
      "editor": 6,
      "viewer": 4
    },
    "byStatus": {
      "active": 10,
      "invited": 1,
      "suspended": 0,
      "deactivated": 1
    }
  },
  "meta": {
    "generatedAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `403 Forbidden` — Editor/Viewer cannot access user analytics

---

### 11.3 Content by Category

| Property | Value |
|---|---|
| **Purpose** | Return movie distribution across categories for chart visualization |
| **Base URL** | `/api/v1/analytics` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/content/by-category` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `status` | `string` | No | `published` | Filter movies by status |
| `limit` | `integer` | No | `20` | Top N categories (max `50`) |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "665f1a2b3c4d5e6f7a8b9c10",
        "name": "Sci-Fi",
        "slug": "sci-fi",
        "movieCount": 42,
        "percentage": 22.6
      },
      {
        "id": "665f1a2b3c4d5e6f7a8b9c11",
        "name": "Action",
        "slug": "action",
        "movieCount": 38,
        "percentage": 20.4
      }
    ],
    "totalMovies": 186,
    "uncategorized": 5
  },
  "meta": {
    "status": "published",
    "generatedAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Pagination, Filtering & Sorting

- **Filtering:** `status`
- **Limit:** Top N categories by `movieCount desc`

---

### 11.4 Monthly Upload Report

| Property | Value |
|---|---|
| **Purpose** | Return month-by-month movie upload counts for trend reporting |
| **Base URL** | `/api/v1/analytics` |
| **HTTP Method** | `GET` |
| **Endpoint** | `/reports/monthly-uploads` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor, Viewer |

#### Request Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `year` | `integer` | No | current year | Report year (e.g., `2026`) |
| `months` | `integer` | No | `12` | Number of months to include (max `24`) |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "year": 2026,
    "months": [
      {
        "month": 1,
        "label": "January 2026",
        "uploadCount": 18,
        "publishedCount": 14,
        "draftCount": 4
      },
      {
        "month": 2,
        "label": "February 2026",
        "uploadCount": 22,
        "publishedCount": 19,
        "draftCount": 3
      }
    ],
    "totals": {
      "uploadCount": 156,
      "publishedCount": 130,
      "averagePerMonth": 13.0
    }
  },
  "meta": {
    "generatedAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `400 Bad Request` — invalid `year` or `months`

#### Validation Rules

| Parameter | Rule |
|---|---|
| `year` | Integer 2020 – current year |
| `months` | Integer 1–24 |

---

## 12. Module: AI Assistant

**Base URL:** `/api/v1/ai`

All AI endpoints are **asynchronous-capable** but return results synchronously for short operations. Long operations return a `jobId` for polling (future enhancement).

---

### 12.1 Generate Movie Description

| Property | Value |
|---|---|
| **Purpose** | Generate a synopsis and extended description for a movie using AI |
| **Base URL** | `/api/v1/ai` |
| **HTTP Method** | `POST` |
| **Endpoint** | `/generate/description` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor |

#### Request Body

```json
{
  "movieId": "665f1a2b3c4d5e6f7a8b9c0f",
  "title": "The Last Horizon",
  "genre": "Sci-Fi",
  "director": "Alex Rivera",
  "cast": ["Maria Chen", "James Park"],
  "releaseYear": 2026,
  "tone": "engaging",
  "maxLength": 500
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `movieId` | `string` | No | Existing movie ID (loads context if provided) |
| `title` | `string` | Yes* | Movie title (*required if no `movieId`) |
| `genre` | `string` | No | Primary genre for context |
| `director` | `string` | No | Director name |
| `cast` | `string[]` | No | Cast names |
| `releaseYear` | `number` | No | Release year |
| `tone` | `string` | No | `engaging`, `formal`, `casual` (default `engaging`) |
| `maxLength` | `number` | No | Max synopsis length (default `500`) |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Description generated successfully",
  "data": {
    "synopsis": "In a distant future where Earth is dying, Captain Eva leads humanity's last starship toward a mysterious new horizon — a planet that may hold the key to survival or humanity's final extinction.",
    "description": "The Last Horizon is a sweeping science fiction epic that follows Captain Eva and her crew aboard the starship Prometheus as they embark on humanity's most ambitious journey...",
    "confidence": 0.92,
    "model": "gpt-4o",
    "tokensUsed": 342,
    "generatedAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `404 Not Found` — `movieId` not found

**Status:** `422 Unprocessable Entity` — missing required context

**Status:** `429 Too Many Requests` — AI daily budget exceeded

**Status:** `503 Service Unavailable` — AI provider down

```json
{
  "success": false,
  "error": {
    "code": "AI_BUDGET_EXCEEDED",
    "message": "Daily AI budget limit reached. Contact your administrator."
  }
}
```

#### Validation Rules

| Field | Rule |
|---|---|
| `movieId` | Valid ObjectId if provided |
| `title` | Required if `movieId` not provided; 1–300 characters |
| `tone` | One of: `engaging`, `formal`, `casual` |
| `maxLength` | Integer 100–2000 |

---

### 12.2 Generate SEO Keywords

| Property | Value |
|---|---|
| **Purpose** | Generate SEO-optimized title, meta description, and keywords for a movie |
| **Base URL** | `/api/v1/ai` |
| **HTTP Method** | `POST` |
| **Endpoint** | `/generate/seo` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor |

#### Request Body

```json
{
  "movieId": "665f1a2b3c4d5e6f7a8b9c0f",
  "title": "The Last Horizon",
  "synopsis": "A sci-fi epic about humanity's final journey.",
  "genre": "Sci-Fi",
  "language": "en"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `movieId` | `string` | No | Existing movie ID |
| `title` | `string` | Yes* | Movie title |
| `synopsis` | `string` | No | Existing synopsis for context |
| `genre` | `string` | No | Primary genre |
| `language` | `string` | No | Target language (default `en`) |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "SEO keywords generated successfully",
  "data": {
    "metaTitle": "The Last Horizon (2026) — Watch Sci-Fi Epic Online",
    "metaDescription": "Stream The Last Horizon, a gripping sci-fi adventure about humanity's last hope. Starring Maria Chen. Watch now on OTT CMS.",
    "keywords": [
      "the last horizon",
      "sci-fi movie 2026",
      "space adventure film",
      "watch sci-fi online",
      "Maria Chen movie"
    ],
    "confidence": 0.88,
    "model": "gpt-4o",
    "tokensUsed": 256,
    "generatedAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Validation Rules

| Field | Rule |
|---|---|
| `title` | Required if no `movieId`; 1–300 characters |
| `synopsis` | Max 500 characters |
| `language` | Valid ISO 639-1 code |

---

### 12.3 Generate Tags

| Property | Value |
|---|---|
| **Purpose** | Generate relevant content tags for categorization and search |
| **Base URL** | `/api/v1/ai` |
| **HTTP Method** | `POST` |
| **Endpoint** | `/generate/tags` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor |

#### Request Body

```json
{
  "movieId": "665f1a2b3c4d5e6f7a8b9c0f",
  "title": "The Last Horizon",
  "synopsis": "A sci-fi epic about humanity's final journey.",
  "genre": "Sci-Fi",
  "maxTags": 10
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `movieId` | `string` | No | Existing movie ID |
| `title` | `string` | Yes* | Movie title |
| `synopsis` | `string` | No | Synopsis for context |
| `genre` | `string` | No | Primary genre |
| `maxTags` | `number` | No | Max tags to generate (default `10`, max `20`) |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Tags generated successfully",
  "data": {
    "tags": [
      { "tag": "sci-fi", "confidence": 0.98 },
      { "tag": "space", "confidence": 0.95 },
      { "tag": "adventure", "confidence": 0.91 },
      { "tag": "future", "confidence": 0.87 },
      { "tag": "survival", "confidence": 0.84 },
      { "tag": "interstellar", "confidence": 0.82 }
    ],
    "model": "gpt-4o",
    "tokensUsed": 128,
    "generatedAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Validation Rules

| Field | Rule |
|---|---|
| `title` | Required if no `movieId` |
| `maxTags` | Integer 1–20 |

---

### 12.4 Generate Social Media Caption

| Property | Value |
|---|---|
| **Purpose** | Generate platform-specific social media captions for movie promotion |
| **Base URL** | `/api/v1/ai` |
| **HTTP Method** | `POST` |
| **Endpoint** | `/generate/social-caption` |
| **Authentication Required** | Yes |
| **Required User Role** | Admin, Editor |

#### Request Body

```json
{
  "movieId": "665f1a2b3c4d5e6f7a8b9c0f",
  "title": "The Last Horizon",
  "synopsis": "A sci-fi epic about humanity's final journey.",
  "platform": "instagram",
  "includeHashtags": true,
  "tone": "exciting"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `movieId` | `string` | No | Existing movie ID |
| `title` | `string` | Yes* | Movie title |
| `synopsis` | `string` | No | Synopsis for context |
| `platform` | `string` | Yes | `instagram`, `twitter`, `facebook`, `linkedin` |
| `includeHashtags` | `boolean` | No | Include hashtags (default `true`) |
| `tone` | `string` | No | `exciting`, `professional`, `casual` (default `exciting`) |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Social media caption generated successfully",
  "data": {
    "platform": "instagram",
    "caption": "Humanity's last hope lies beyond the stars. 🚀\n\nThe Last Horizon — a breathtaking sci-fi epic that will take you to the edge of the universe and back.\n\nNow streaming. Link in bio.",
    "hashtags": [
      "#TheLastHorizon",
      "#SciFi",
      "#NewRelease",
      "#SpaceMovie",
      "#MustWatch",
      "#StreamingNow"
    ],
    "characterCount": 187,
    "confidence": 0.90,
    "model": "gpt-4o",
    "tokensUsed": 198,
    "generatedAt": "2026-07-08T16:00:00.000Z"
  }
}
```

#### Error Response

**Status:** `422 Unprocessable Entity`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "platform", "message": "Platform must be one of: instagram, twitter, facebook, linkedin" }
    ]
  }
}
```

#### Validation Rules

| Field | Rule |
|---|---|
| `title` | Required if no `movieId`; 1–300 characters |
| `platform` | One of: `instagram`, `twitter`, `facebook`, `linkedin` |
| `tone` | One of: `exciting`, `professional`, `casual` |
| `includeHashtags` | Boolean |

---

## 13. Error Code Reference

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid access token |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token expired or revoked |
| `INVALID_CURRENT_PASSWORD` | 401 | Current password incorrect on change |
| `FORBIDDEN` | 403 | Insufficient role or permission |
| `ACCOUNT_SUSPENDED` | 403 | Account is suspended |
| `ACCOUNT_LOCKED` | 429 | Too many failed login attempts |
| `NOT_FOUND` | 404 | Generic resource not found |
| `MOVIE_NOT_FOUND` | 404 | Movie does not exist |
| `USER_NOT_FOUND` | 404 | User does not exist |
| `CATEGORY_NOT_FOUND` | 404 | Category does not exist |
| `DUPLICATE_SLUG` | 409 | Slug already exists |
| `DUPLICATE_EMAIL` | 409 | Email already registered |
| `VERSION_CONFLICT` | 409 | Optimistic lock version mismatch |
| `CATEGORY_IN_USE` | 409 | Category has associated movies |
| `VALIDATION_ERROR` | 422 | Request body validation failed |
| `INVALID_STATUS_TRANSITION` | 422 | Invalid movie status change |
| `INVALID_PARAMETER` | 400 | Invalid query parameter |
| `AI_BUDGET_EXCEEDED` | 429 | Tenant AI daily budget exceeded |
| `AI_PROVIDER_ERROR` | 503 | External AI service unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Appendix A — Endpoint Summary

| Module | Method | Endpoint | Auth | Role |
|---|---|---|---|---|
| **Auth** | POST | `/auth/login` | No | — |
| **Auth** | POST | `/auth/logout` | Yes | All |
| **Auth** | POST | `/auth/refresh` | No | — |
| **Auth** | GET | `/auth/me` | Yes | All |
| **Auth** | PATCH | `/auth/change-password` | Yes | All |
| **Dashboard** | GET | `/dashboard/summary` | Yes | All |
| **Dashboard** | GET | `/dashboard/activities` | Yes | All |
| **Dashboard** | GET | `/dashboard/statistics` | Yes | All |
| **Movies** | POST | `/movies` | Yes | Admin, Editor |
| **Movies** | GET | `/movies` | Yes | All |
| **Movies** | GET | `/movies/search` | Yes | All |
| **Movies** | GET | `/movies/:id` | Yes | All |
| **Movies** | PATCH | `/movies/:id` | Yes | Admin, Editor |
| **Movies** | DELETE | `/movies/:id` | Yes | Admin |
| **Categories** | POST | `/categories` | Yes | Admin, Editor |
| **Categories** | GET | `/categories` | Yes | All |
| **Categories** | GET | `/categories/:id` | Yes | All |
| **Categories** | PATCH | `/categories/:id` | Yes | Admin, Editor |
| **Categories** | DELETE | `/categories/:id` | Yes | Admin |
| **Users** | POST | `/users` | Yes | Admin |
| **Users** | GET | `/users` | Yes | Admin |
| **Users** | GET | `/users/:id` | Yes | Admin |
| **Users** | PATCH | `/users/:id` | Yes | Admin |
| **Users** | DELETE | `/users/:id` | Yes | Admin |
| **Users** | PATCH | `/users/:id/role` | Yes | Admin |
| **Users** | PATCH | `/users/:id/status` | Yes | Admin |
| **Analytics** | GET | `/analytics/movies/total` | Yes | All |
| **Analytics** | GET | `/analytics/users/total` | Yes | Admin |
| **Analytics** | GET | `/analytics/content/by-category` | Yes | All |
| **Analytics** | GET | `/analytics/reports/monthly-uploads` | Yes | All |
| **AI** | POST | `/ai/generate/description` | Yes | Admin, Editor |
| **AI** | POST | `/ai/generate/seo` | Yes | Admin, Editor |
| **AI** | POST | `/ai/generate/tags` | Yes | Admin, Editor |
| **AI** | POST | `/ai/generate/social-caption` | Yes | Admin, Editor |

**Total endpoints:** 33

---

*End of API Specification*
