# MongoDB Database Schema — AI OTT CMS

| Field | Value |
|---|---|
| **Version** | 1.0.0 |
| **Database** | MongoDB 7.x |
| **Convention** | camelCase field names · snake_case collection names |
| **Last Updated** | July 8, 2026 |

---

## Table of Contents

1. [Schema Overview](#1-schema-overview)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Global Conventions](#3-global-conventions)
4. [Collection: `users`](#4-collection-users)
5. [Collection: `movies`](#5-collection-movies)
6. [Collection: `categories`](#6-collection-categories)
7. [Collection: `roles`](#7-collection-roles)
8. [Collection: `activity_logs`](#8-collection-activity_logs)
9. [Collection: `watch_history`](#9-collection-watch_history)
10. [Collection: `settings`](#10-collection-settings)
11. [Index Summary](#11-index-summary)
12. [Data Integrity & Referential Notes](#12-data-integrity--referential-notes)

---

## 1. Schema Overview

This schema supports a multi-tenant OTT Content Management System where:

- **CMS operators** (`users` + `roles`) manage the content catalog
- **`movies`** are the primary content entities with rich metadata and publishing lifecycle
- **`categories`** organize movies into browsable genre/topic hierarchies
- **`activity_logs`** provide an immutable audit trail of all significant actions
- **`watch_history`** tracks end-user viewing progress for analytics and resume-playback
- **`settings`** stores tenant-level and system-level configuration as structured documents

All tenant-scoped collections include a `tenantId` field for logical data isolation.

---

## 2. Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│    roles    │◀────────│    users    │
│             │  N : 1  │             │
└─────────────┘         └──────┬──────┘
                               │
                               │ 1 : N (actor)
                               ▼
                        ┌─────────────┐
                        │activity_logs│
                        └──────┬──────┘
                               │ references (polymorphic)
                               ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ categories  │◀───────▶│   movies    │◀────────│watch_history│
│  (M : N)    │         │             │  N : 1  │             │
└─────────────┘         └─────────────┘         └──────┬──────┘
                                                       │
                                                       │ N : 1
                                                       ▼
                                                ┌─────────────┐
                                                │    users    │
                                                │  (viewer)   │
                                                └─────────────┘

┌─────────────┐
│  settings   │  ← 1 document per tenant (or key-group)
└─────────────┘
```

### Relationship Summary

| From | To | Cardinality | Type |
|---|---|---|---|
| `users` | `roles` | N : 1 | Reference (`roleId` → `roles._id`) |
| `movies` | `categories` | M : N | Reference array (`categoryIds[]` → `categories._id`) |
| `categories` | `categories` | 1 : N | Self-reference (`parentId` → `categories._id`) |
| `activity_logs` | `users` | N : 1 | Reference (`actorId` → `users._id`) |
| `activity_logs` | any entity | N : 1 | Polymorphic (`entityType` + `entityId`) |
| `watch_history` | `users` | N : 1 | Reference (`userId` → `users._id`) |
| `watch_history` | `movies` | N : 1 | Reference (`movieId` → `movies._id`) |
| `settings` | tenant | 1 : 1 | Scoped by `tenantId` |

---

## 3. Global Conventions

| Convention | Rule |
|---|---|
| **Primary key** | `_id` — MongoDB `ObjectId`, auto-generated |
| **Timestamps** | `createdAt` and `updatedAt` as `Date` on all collections |
| **Soft delete** | `deletedAt: Date \| null` where applicable; queries filter `deletedAt: null` |
| **Tenant scope** | `tenantId: ObjectId` on all collections except system-global `roles` (if shared) |
| **References** | Stored as `ObjectId`; application layer validates existence |
| **Enums** | Stored as `String`; validated at application and JSON Schema level |
| **Embedded vs referenced** | Small, bounded arrays embedded; large/unbounded data referenced or separate collections |

---

## 4. Collection: `users`

### Purpose

Stores CMS operator accounts and end-user viewer accounts. Supports authentication, role assignment, profile management, and account lifecycle (active, suspended, deactivated).

Distinguishes account types via `userType`:
- `cms` — internal content managers, editors, admins
- `viewer` — end consumers of the OTT platform (for watch history linkage)

---

### Fields

| Field | Data Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | — | Primary key |
| `tenantId` | `ObjectId` | Yes | — | Tenant this user belongs to |
| `email` | `String` | Yes | — | Unique per tenant; login identifier |
| `passwordHash` | `String` | Conditional | — | bcrypt hash; required for local auth, null for SSO-only |
| `firstName` | `String` | Yes | — | Given name |
| `lastName` | `String` | Yes | — | Family name |
| `displayName` | `String` | No | computed | Full display name; falls back to `firstName + lastName` |
| `avatarUrl` | `String` | No | `null` | Profile image URL |
| `userType` | `String` | Yes | `"cms"` | Enum: `cms`, `viewer` |
| `roleId` | `ObjectId` | Conditional | — | Reference to `roles._id`; required when `userType` is `cms` |
| `status` | `String` | Yes | `"active"` | Enum: `active`, `invited`, `suspended`, `deactivated` |
| `authProvider` | `String` | Yes | `"local"` | Enum: `local`, `google`, `azure`, `okta` |
| `externalId` | `String` | No | `null` | IdP subject ID for SSO users |
| `emailVerified` | `Boolean` | Yes | `false` | Whether email has been confirmed |
| `lastLoginAt` | `Date` | No | `null` | Timestamp of most recent successful login |
| `lastLoginIp` | `String` | No | `null` | IP address of most recent login |
| `loginAttempts` | `Number` | Yes | `0` | Failed login counter for lockout |
| `lockedUntil` | `Date` | No | `null` | Account lockout expiry |
| `inviteToken` | `String` | No | `null` | Hashed invite token for pending invitations |
| `inviteExpiresAt` | `Date` | No | `null` | Invite token expiry |
| `preferences` | `Object` | No | `{}` | User UI preferences (see sub-schema) |
| `metadata` | `Object` | No | `{}` | Extensible key-value metadata |
| `createdAt` | `Date` | Auto | `now` | Record creation timestamp |
| `updatedAt` | `Date` | Auto | `now` | Last modification timestamp |
| `deletedAt` | `Date` | No | `null` | Soft-delete timestamp |

#### Sub-schema: `preferences`

| Field | Data Type | Description |
|---|---|---|
| `locale` | `String` | ISO 639-1 locale code (e.g., `en`, `hi`) |
| `timezone` | `String` | IANA timezone (e.g., `Asia/Kolkata`) |
| `theme` | `String` | Enum: `light`, `dark`, `system` |
| `emailNotifications` | `Boolean` | Opt-in for email alerts |

---

### Indexes

| Name | Keys | Options | Purpose |
|---|---|---|---|
| `idx_users_tenant_email` | `{ tenantId: 1, email: 1 }` | `unique: true`, `partialFilterExpression: { deletedAt: null }` | Unique login per tenant |
| `idx_users_tenant_status` | `{ tenantId: 1, status: 1 }` | — | Filter active users in admin UI |
| `idx_users_role` | `{ tenantId: 1, roleId: 1 }` | — | Users-by-role queries |
| `idx_users_type` | `{ tenantId: 1, userType: 1 }` | — | Separate CMS vs viewer lists |
| `idx_users_external` | `{ tenantId: 1, authProvider: 1, externalId: 1 }` | `unique: true`, `sparse: true` | SSO identity lookup |
| `idx_users_invite` | `{ inviteToken: 1 }` | `sparse: true` | Invite acceptance lookup |
| `idx_users_deleted` | `{ deletedAt: 1 }` | `expireAfterSeconds: 2592000` (optional TTL) | Auto-purge soft-deleted after 30 days |

---

### Relationships

| Field | References | Description |
|---|---|---|
| `tenantId` | `tenants._id` (future) | Tenant isolation boundary |
| `roleId` | `roles._id` | CMS user's assigned role and permissions |

**Referenced by:**
- `activity_logs.actorId`
- `watch_history.userId`

---

### Validation Rules

| Rule | Constraint |
|---|---|
| `email` | Valid email format; max 254 characters; stored lowercase |
| `passwordHash` | Required when `authProvider` is `local` and `status` is not `invited`; min bcrypt cost factor 12 |
| `firstName`, `lastName` | 1–100 characters; trimmed |
| `userType` | Must be one of: `cms`, `viewer` |
| `roleId` | Required when `userType` is `cms`; must reference an existing, non-deleted role in the same tenant |
| `status` | Must be one of: `active`, `invited`, `suspended`, `deactivated` |
| `authProvider` | Must be one of: `local`, `google`, `azure`, `okta` |
| `loginAttempts` | Integer ≥ 0; lock account when ≥ 5 (set `lockedUntil` to now + 15 min) |
| `avatarUrl` | Valid HTTPS URL if provided |
| `externalId` | Required when `authProvider` is not `local` |
| Soft delete | Deactivated users must have `status: "deactivated"` and `deletedAt` set; email cannot be reused until purge |

---

## 5. Collection: `movies`

### Purpose

Primary content entity representing a standalone film or feature-length title in the OTT catalog. Stores metadata, media asset references, publishing state, ratings, and availability rules managed through the CMS.

---

### Fields

| Field | Data Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | — | Primary key |
| `tenantId` | `ObjectId` | Yes | — | Owning tenant |
| `title` | `String` | Yes | — | Display title |
| `slug` | `String` | Yes | — | URL-safe identifier; unique per tenant |
| `originalTitle` | `String` | No | `null` | Title in original language |
| `synopsis` | `String` | No | `""` | Short description (≤ 500 chars) |
| `description` | `String` | No | `""` | Long-form description |
| `tagline` | `String` | No | `null` | Marketing tagline |
| `categoryIds` | `[ObjectId]` | No | `[]` | References to `categories._id` |
| `genres` | `[String]` | No | `[]` | Denormalized genre labels for search |
| `tags` | `[String]` | No | `[]` | Free-form tags for filtering |
| `contentRating` | `String` | No | `null` | Enum: `G`, `PG`, `PG-13`, `R`, `NC-17`, `U`, `UA`, `A` |
| `contentWarnings` | `[String]` | No | `[]` | e.g., `violence`, `language`, `nudity` |
| `duration` | `Number` | Yes | — | Runtime in seconds |
| `releaseYear` | `Number` | No | `null` | Original release year |
| `releaseDate` | `Date` | No | `null` | Theatrical or digital release date |
| `language` | `String` | No | `"en"` | Primary audio language (ISO 639-1) |
| `availableLanguages` | `[String]` | No | `[]` | Available audio/subtitle languages |
| `country` | `String` | No | `null` | Country of origin (ISO 3166-1 alpha-2) |
| `director` | `String` | No | `null` | Director name |
| `cast` | `[Object]` | No | `[]` | Cast list (see sub-schema) |
| `crew` | `[Object]` | No | `[]` | Crew list (see sub-schema) |
| `media` | `Object` | No | `{}` | Media asset references (see sub-schema) |
| `status` | `String` | Yes | `"draft"` | Enum: `draft`, `in_review`, `approved`, `scheduled`, `published`, `unpublished`, `archived` |
| `publishAt` | `Date` | No | `null` | Scheduled publish datetime (UTC) |
| `unpublishAt` | `Date` | No | `null` | Scheduled unpublish datetime (UTC) |
| `publishedAt` | `Date` | No | `null` | Actual publish timestamp |
| `featured` | `Boolean` | Yes | `false` | Featured/highlighted on homepage |
| `featuredOrder` | `Number` | No | `null` | Sort order among featured titles |
| `availability` | `Object` | No | `{}` | Geo and windowing rules (see sub-schema) |
| `monetization` | `Object` | No | `{}` | Pricing model (see sub-schema) |
| `seo` | `Object` | No | `{}` | SEO metadata (see sub-schema) |
| `statistics` | `Object` | No | `{}` | Denormalized counters (see sub-schema) |
| `aiMetadata` | `Object` | No | `{}` | AI-generated enrichment (see sub-schema) |
| `createdBy` | `ObjectId` | Yes | — | Reference to `users._id` (CMS user) |
| `updatedBy` | `ObjectId` | No | `null` | Last editor |
| `approvedBy` | `ObjectId` | No | `null` | QC approver |
| `approvedAt` | `Date` | No | `null` | QC approval timestamp |
| `version` | `Number` | Yes | `1` | Optimistic concurrency version |
| `createdAt` | `Date` | Auto | `now` | Record creation timestamp |
| `updatedAt` | `Date` | Auto | `now` | Last modification timestamp |
| `deletedAt` | `Date` | No | `null` | Soft-delete timestamp |

#### Sub-schema: `cast[]`

| Field | Data Type | Description |
|---|---|---|
| `name` | `String` | Actor name |
| `character` | `String` | Character played |
| `order` | `Number` | Billing order |
| `imageUrl` | `String` | Headshot URL (optional) |

#### Sub-schema: `crew[]`

| Field | Data Type | Description |
|---|---|---|
| `name` | `String` | Crew member name |
| `role` | `String` | e.g., `Producer`, `Writer`, `Cinematographer` |

#### Sub-schema: `media`

| Field | Data Type | Description |
|---|---|---|
| `posterUrl` | `String` | Portrait poster image URL |
| `backdropUrl` | `String` | Landscape backdrop image URL |
| `thumbnailUrl` | `String` | Small thumbnail for lists |
| `trailerUrl` | `String` | Trailer video URL |
| `videoUrl` | `String` | Primary streaming manifest/URL |
| `videoFormat` | `String` | Enum: `hls`, `dash`, `mp4` |
| `videoQuality` | `[String]` | Available qualities: `360p`, `720p`, `1080p`, `4k` |
| `subtitles` | `[Object]` | `{ language: String, url: String, format: String }` |
| `audioTracks` | `[Object]` | `{ language: String, label: String }` |
| `fileSize` | `Number` | Video file size in bytes |
| `checksum` | `String` | SHA-256 checksum of source file |

#### Sub-schema: `availability`

| Field | Data Type | Description |
|---|---|---|
| `regions` | `[String]` | Allowed ISO country codes; empty = all |
| `blockedRegions` | `[String]` | Explicitly blocked country codes |
| `startDate` | `Date` | License window start |
| `endDate` | `Date` | License window end |

#### Sub-schema: `monetization`

| Field | Data Type | Description |
|---|---|---|
| `model` | `String` | Enum: `free`, `svod`, `tvod`, `avod` |
| `price` | `Number` | Price in smallest currency unit (paise/cents) |
| `currency` | `String` | ISO 4217 currency code |

#### Sub-schema: `seo`

| Field | Data Type | Description |
|---|---|---|
| `metaTitle` | `String` | SEO page title (≤ 70 chars) |
| `metaDescription` | `String` | SEO description (≤ 160 chars) |
| `keywords` | `[String]` | SEO keywords |

#### Sub-schema: `statistics` (denormalized)

| Field | Data Type | Description |
|---|---|---|
| `viewCount` | `Number` | Total views |
| `completionCount` | `Number` | Full watches |
| `averageRating` | `Number` | Average user rating (0–5) |
| `ratingCount` | `Number` | Number of ratings |

#### Sub-schema: `aiMetadata`

| Field | Data Type | Description |
|---|---|---|
| `generatedSynopsis` | `String` | AI-generated synopsis |
| `suggestedTags` | `[String]` | AI-suggested tags |
| `moderationScore` | `Number` | Content safety score (0–1) |
| `moderationFlags` | `[String]` | Detected issues |
| `lastProcessedAt` | `Date` | Last AI processing timestamp |

---

### Indexes

| Name | Keys | Options | Purpose |
|---|---|---|---|
| `idx_movies_tenant_slug` | `{ tenantId: 1, slug: 1 }` | `unique: true`, partial: `{ deletedAt: null }` | Unique URL slug per tenant |
| `idx_movies_tenant_status` | `{ tenantId: 1, status: 1 }` | — | Filter by publishing state |
| `idx_movies_tenant_published` | `{ tenantId: 1, status: 1, publishedAt: -1 }` | — | Published catalog listing |
| `idx_movies_categories` | `{ tenantId: 1, categoryIds: 1 }` | — | Movies by category |
| `idx_movies_featured` | `{ tenantId: 1, featured: 1, featuredOrder: 1 }` | partial: `{ featured: true }` | Homepage featured rail |
| `idx_movies_schedule` | `{ tenantId: 1, status: 1, publishAt: 1 }` | — | Scheduled publish job queries |
| `idx_movies_text` | `{ title: "text", synopsis: "text", tags: "text" }` | `weights: { title: 10, tags: 5, synopsis: 1 }` | Full-text search |
| `idx_movies_release` | `{ tenantId: 1, releaseYear: -1 }` | — | Browse by year |
| `idx_movies_created` | `{ tenantId: 1, createdAt: -1 }` | — | Recently added content |

---

### Relationships

| Field | References | Description |
|---|---|---|
| `categoryIds[]` | `categories._id` | M:N genre/category classification |
| `createdBy` | `users._id` | CMS user who created the record |
| `updatedBy` | `users._id` | Last CMS user to edit |
| `approvedBy` | `users._id` | QC reviewer who approved |

**Referenced by:**
- `watch_history.movieId`
- `activity_logs.entityId` (when `entityType` is `movie`)

---

### Validation Rules

| Rule | Constraint |
|---|---|
| `title` | 1–300 characters; trimmed; cannot be empty |
| `slug` | 1–200 characters; lowercase alphanumeric + hyphens only; unique per tenant |
| `synopsis` | Max 500 characters |
| `description` | Max 5000 characters |
| `duration` | Integer > 0 |
| `releaseYear` | Integer between 1900 and current year + 2 |
| `contentRating` | Must be a recognized rating enum value |
| `status` | Valid enum; transitions enforced at application layer (see state machine below) |
| `publishAt` | Required when `status` is `scheduled`; must be a future date |
| `categoryIds` | Each ID must reference an existing, active category in the same tenant |
| `media.videoUrl` | Required when `status` is `published` |
| `media.posterUrl` | Required when `status` is `published` |
| `cast[].name` | 1–200 characters |
| `availability.endDate` | Must be after `availability.startDate` if both provided |
| `monetization.price` | Required and ≥ 0 when `model` is `tvod` |
| `version` | Incremented on every update; reject stale writes |

#### Status State Machine

```
draft → in_review → approved → scheduled → published → unpublished → archived
  ↑         ↓           ↓                                    ↓
  └─────────┴───────────┴──── (reject) ──────────────────────┘
```

---

## 6. Collection: `categories`

### Purpose

Organizes movies into browsable genre and topic classifications. Supports hierarchical parent-child relationships (e.g., `Action` → `Martial Arts`) for nested navigation in the CMS and consumer app.

---

### Fields

| Field | Data Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | — | Primary key |
| `tenantId` | `ObjectId` | Yes | — | Owning tenant |
| `name` | `String` | Yes | — | Display name (e.g., `Action`, `Documentary`) |
| `slug` | `String` | Yes | — | URL-safe identifier; unique per tenant |
| `description` | `String` | No | `""` | Category description for CMS |
| `parentId` | `ObjectId` | No | `null` | Self-reference to parent category |
| `imageUrl` | `String` | No | `null` | Category thumbnail/banner image |
| `iconName` | `String` | No | `null` | Icon identifier for UI (e.g., `film`, `star`) |
| `color` | `String` | No | `null` | Hex color code for UI badges (e.g., `#E50914`) |
| `sortOrder` | `Number` | Yes | `0` | Manual sort position in navigation |
| `isActive` | `Boolean` | Yes | `true` | Whether category is visible |
| `movieCount` | `Number` | Yes | `0` | Denormalized count of associated movies |
| `metadata` | `Object` | No | `{}` | Extensible metadata |
| `createdBy` | `ObjectId` | Yes | — | CMS user who created the category |
| `createdAt` | `Date` | Auto | `now` | Record creation timestamp |
| `updatedAt` | `Date` | Auto | `now` | Last modification timestamp |
| `deletedAt` | `Date` | No | `null` | Soft-delete timestamp |

---

### Indexes

| Name | Keys | Options | Purpose |
|---|---|---|---|
| `idx_categories_tenant_slug` | `{ tenantId: 1, slug: 1 }` | `unique: true`, partial: `{ deletedAt: null }` | Unique slug per tenant |
| `idx_categories_tenant_name` | `{ tenantId: 1, name: 1 }` | `unique: true`, partial: `{ deletedAt: null }` | Prevent duplicate names |
| `idx_categories_parent` | `{ tenantId: 1, parentId: 1, sortOrder: 1 }` | — | Hierarchical navigation tree |
| `idx_categories_active` | `{ tenantId: 1, isActive: 1, sortOrder: 1 }` | — | Active categories for dropdowns |
| `idx_categories_text` | `{ name: "text", description: "text" }` | — | Category search in CMS |

---

### Relationships

| Field | References | Description |
|---|---|---|
| `parentId` | `categories._id` | Parent in hierarchy; `null` = root category |
| `createdBy` | `users._id` | Creator |

**Referenced by:**
- `movies.categoryIds[]`
- `activity_logs.entityId` (when `entityType` is `category`)

---

### Validation Rules

| Rule | Constraint |
|---|---|
| `name` | 1–100 characters; trimmed; unique per tenant |
| `slug` | 1–100 characters; lowercase alphanumeric + hyphens; unique per tenant |
| `description` | Max 1000 characters |
| `parentId` | If set, must reference an existing, active category in the same tenant |
| `parentId` | Cannot reference self; max hierarchy depth = 3 levels |
| `color` | Must match regex `^#[0-9A-Fa-f]{6}$` if provided |
| `sortOrder` | Integer ≥ 0 |
| `movieCount` | Integer ≥ 0; updated by application on movie assignment/removal |
| Deletion | Cannot soft-delete if `movieCount > 0` unless `force: true` admin override |
| Deletion | Cannot soft-delete if child categories exist |

---

## 7. Collection: `roles`

### Purpose

Defines role-based access control (RBAC) for CMS operators. Each role carries a set of granular permissions that determine what actions a user can perform within the CMS.

---

### Fields

| Field | Data Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | — | Primary key |
| `tenantId` | `ObjectId` | Yes | — | Owning tenant |
| `name` | `String` | Yes | — | Role name (e.g., `Content Manager`) |
| `slug` | `String` | Yes | — | Machine identifier (e.g., `content_manager`) |
| `description` | `String` | No | `""` | Human-readable role description |
| `permissions` | `[String]` | Yes | `[]` | Permission keys (see permission catalog) |
| `isSystem` | `Boolean` | Yes | `false` | System roles cannot be deleted or renamed |
| `isDefault` | `Boolean` | Yes | `false` | Auto-assigned to new CMS users if no role specified |
| `priority` | `Number` | Yes | `0` | Hierarchy level for role comparison (higher = more authority) |
| `createdBy` | `ObjectId` | No | `null` | Creator; `null` for system-seeded roles |
| `createdAt` | `Date` | Auto | `now` | Record creation timestamp |
| `updatedAt` | `Date` | Auto | `now` | Last modification timestamp |
| `deletedAt` | `Date` | No | `null` | Soft-delete timestamp |

#### Permission Catalog

| Permission Key | Description |
|---|---|
| `movies:create` | Create new movie entries |
| `movies:read` | View movie details |
| `movies:update` | Edit movie metadata and assets |
| `movies:delete` | Soft-delete movies |
| `movies:publish` | Publish or unpublish movies |
| `categories:manage` | CRUD categories |
| `users:read` | View user list |
| `users:manage` | Create, edit, deactivate users |
| `roles:manage` | Create and edit roles |
| `settings:read` | View tenant settings |
| `settings:manage` | Modify tenant settings |
| `activity_logs:read` | View audit trail |
| `analytics:read` | View analytics dashboards |
| `ai:trigger` | Trigger AI processing jobs |
| `ai:approve` | Accept or reject AI suggestions |

#### System-Seeded Roles

| Slug | Name | Priority | Key Permissions |
|---|---|---|---|
| `tenant_admin` | Tenant Admin | 100 | All permissions |
| `content_manager` | Content Manager | 80 | movies:*, categories:manage, ai:*, analytics:read |
| `content_editor` | Content Editor | 60 | movies:create, movies:read, movies:update, ai:trigger |
| `metadata_editor` | Metadata Editor | 40 | movies:read, movies:update (metadata only) |
| `viewer` | Viewer | 10 | movies:read, analytics:read, activity_logs:read |

---

### Indexes

| Name | Keys | Options | Purpose |
|---|---|---|---|
| `idx_roles_tenant_slug` | `{ tenantId: 1, slug: 1 }` | `unique: true`, partial: `{ deletedAt: null }` | Unique role identifier per tenant |
| `idx_roles_tenant_name` | `{ tenantId: 1, name: 1 }` | `unique: true`, partial: `{ deletedAt: null }` | Prevent duplicate role names |
| `idx_roles_default` | `{ tenantId: 1, isDefault: 1 }` | partial: `{ isDefault: true }` | Lookup default role for new users |

---

### Relationships

| Field | References | Description |
|---|---|---|
| `tenantId` | tenant scope | Logical tenant boundary |
| `createdBy` | `users._id` | Admin who created custom role |

**Referenced by:**
- `users.roleId`

---

### Validation Rules

| Rule | Constraint |
|---|---|
| `name` | 1–100 characters; unique per tenant |
| `slug` | 1–50 characters; lowercase alphanumeric + underscores; unique per tenant |
| `permissions` | Array of valid permission keys from catalog; no duplicates |
| `permissions` | Must contain at least one permission |
| `isSystem` | System roles (`isSystem: true`) cannot be deleted or have `slug` changed |
| `isDefault` | Only one role per tenant can have `isDefault: true` |
| `priority` | Integer 0–100 |
| Deletion | Cannot delete role if any `users` reference it (`roleId` count > 0) |
| Deletion | Cannot delete system roles |
| Custom roles | `isSystem` must be `false`; max 20 custom roles per tenant |

---

## 8. Collection: `activity_logs`

### Purpose

Immutable audit trail recording all significant actions performed within the CMS. Supports compliance, debugging, security investigations, and activity feeds in the admin UI. **Append-only** — records are never updated or deleted.

---

### Fields

| Field | Data Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | — | Primary key |
| `tenantId` | `ObjectId` | Yes | — | Tenant where action occurred |
| `actorId` | `ObjectId` | Yes | — | Reference to `users._id` who performed the action |
| `actorEmail` | `String` | Yes | — | Denormalized actor email for historical accuracy |
| `actorRole` | `String` | No | `null` | Denormalized role slug at time of action |
| `action` | `String` | Yes | — | Action identifier (see action catalog) |
| `entityType` | `String` | Yes | — | Enum: `user`, `movie`, `category`, `role`, `setting`, `session` |
| `entityId` | `ObjectId` | No | `null` | ID of the affected entity |
| `entityLabel` | `String` | No | `null` | Denormalized display name (e.g., movie title) |
| `description` | `String` | Yes | — | Human-readable summary of the action |
| `changes` | `Object` | No | `null` | Before/after diff (see sub-schema) |
| `metadata` | `Object` | No | `{}` | Additional context (request ID, batch ID, etc.) |
| `ipAddress` | `String` | No | `null` | Client IP address |
| `userAgent` | `String` | No | `null` | Client user-agent string |
| `requestMethod` | `String` | No | `null` | HTTP method (e.g., `POST`, `PATCH`) |
| `requestPath` | `String` | No | `null` | API endpoint path |
| `status` | `String` | Yes | `"success"` | Enum: `success`, `failure` |
| `errorMessage` | `String` | No | `null` | Error detail if `status` is `failure` |
| `severity` | `String` | Yes | `"info"` | Enum: `info`, `warning`, `critical` |
| `createdAt` | `Date` | Auto | `now` | Timestamp of the action (immutable) |

#### Sub-schema: `changes`

| Field | Data Type | Description |
|---|---|---|
| `before` | `Object` | Entity state before the change (subset of fields) |
| `after` | `Object` | Entity state after the change (subset of fields) |
| `changedFields` | `[String]` | List of field names that were modified |

#### Action Catalog

| Action | Entity Type | Severity | Description |
|---|---|---|---|
| `user.login` | `session` | `info` | Successful login |
| `user.login_failed` | `session` | `warning` | Failed login attempt |
| `user.logout` | `session` | `info` | User logout |
| `user.created` | `user` | `info` | New user account created |
| `user.updated` | `user` | `info` | User profile modified |
| `user.deactivated` | `user` | `warning` | User account deactivated |
| `movie.created` | `movie` | `info` | New movie entry created |
| `movie.updated` | `movie` | `info` | Movie metadata modified |
| `movie.status_changed` | `movie` | `info` | Publishing status transition |
| `movie.published` | `movie` | `info` | Movie published to catalog |
| `movie.unpublished` | `movie` | `warning` | Movie removed from catalog |
| `movie.deleted` | `movie` | `warning` | Movie soft-deleted |
| `category.created` | `category` | `info` | Category created |
| `category.updated` | `category` | `info` | Category modified |
| `category.deleted` | `category` | `warning` | Category deleted |
| `role.created` | `role` | `info` | Custom role created |
| `role.updated` | `role` | `warning` | Role permissions modified |
| `settings.updated` | `setting` | `warning` | Tenant settings changed |
| `ai.suggestion_accepted` | `movie` | `info` | AI suggestion approved |
| `ai.suggestion_rejected` | `movie` | `info` | AI suggestion rejected |

---

### Indexes

| Name | Keys | Options | Purpose |
|---|---|---|---|
| `idx_activity_tenant_created` | `{ tenantId: 1, createdAt: -1 }` | — | Recent activity feed (primary query) |
| `idx_activity_actor` | `{ tenantId: 1, actorId: 1, createdAt: -1 }` | — | Activity by specific user |
| `idx_activity_entity` | `{ tenantId: 1, entityType: 1, entityId: 1, createdAt: -1 }` | — | History for a specific entity |
| `idx_activity_action` | `{ tenantId: 1, action: 1, createdAt: -1 }` | — | Filter by action type |
| `idx_activity_severity` | `{ tenantId: 1, severity: 1, createdAt: -1 }` | partial: `{ severity: { $in: ["warning", "critical"] } }` | Security alerts |
| `idx_activity_ttl` | `{ createdAt: 1 }` | `expireAfterSeconds: 7776000` (90 days, configurable per tenant) | Automatic log retention |

---

### Relationships

| Field | References | Description |
|---|---|---|
| `actorId` | `users._id` | User who performed the action |
| `entityId` | Polymorphic | References `movies._id`, `users._id`, `categories._id`, `roles._id`, or `settings._id` depending on `entityType` |

**Referenced by:** None (append-only, leaf collection)

---

### Validation Rules

| Rule | Constraint |
|---|---|
| Immutability | Records must never be updated or deleted (except TTL expiry) |
| `actorId` | Must reference an existing user at time of logging |
| `action` | Must be a recognized action from the catalog |
| `entityType` | Must be one of: `user`, `movie`, `category`, `role`, `setting`, `session` |
| `entityId` | Required when `entityType` is not `session` |
| `description` | 1–500 characters |
| `changes` | Required for `update` actions; must contain `changedFields` array |
| `changes.before` / `changes.after` | Must not contain sensitive fields (`passwordHash`, `inviteToken`) |
| `ipAddress` | Valid IPv4 or IPv6 format if provided |
| `severity` | Auto-set to `critical` for: `user.login_failed` (after threshold), `role.updated`, `settings.updated` |
| `actorEmail` | Denormalized at write time; not updated if user later changes email |

---

## 9. Collection: `watch_history`

### Purpose

Tracks end-user viewing sessions for each movie. Enables resume-playback ("Continue Watching"), viewing analytics, completion rate metrics, and content performance reporting in the CMS dashboard.

---

### Fields

| Field | Data Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | — | Primary key |
| `tenantId` | `ObjectId` | Yes | — | Tenant context |
| `userId` | `ObjectId` | Yes | — | Reference to `users._id` (viewer) |
| `movieId` | `ObjectId` | Yes | — | Reference to `movies._id` |
| `watchDuration` | `Number` | Yes | `0` | Total seconds watched across all sessions |
| `lastPosition` | `Number` | Yes | `0` | Playback position in seconds (for resume) |
| `totalDuration` | `Number` | Yes | — | Movie total duration in seconds (denormalized) |
| `progress` | `Number` | Yes | `0` | Completion percentage (0–100) |
| `completed` | `Boolean` | Yes | `false` | `true` when `progress` ≥ 90% |
| `watchCount` | `Number` | Yes | `1` | Number of distinct viewing sessions |
| `firstWatchedAt` | `Date` | Yes | `now` | Timestamp of first view |
| `lastWatchedAt` | `Date` | Yes | `now` | Timestamp of most recent view |
| `deviceType` | `String` | No | `null` | Enum: `web`, `mobile`, `tablet`, `tv`, `console` |
| `platform` | `String` | No | `null` | e.g., `ios`, `android`, `roku`, `firetv` |
| `quality` | `String` | No | `null` | Last watched quality: `360p`, `720p`, `1080p`, `4k` |
| `sessions` | `[Object]` | No | `[]` | Individual session records (see sub-schema) |
| `createdAt` | `Date` | Auto | `now` | Record creation timestamp |
| `updatedAt` | `Date` | Auto | `now` | Last modification timestamp |

#### Sub-schema: `sessions[]` (capped)

| Field | Data Type | Description |
|---|---|---|
| `startedAt` | `Date` | Session start time |
| `endedAt` | `Date` | Session end time |
| `duration` | `Number` | Seconds watched in this session |
| `startPosition` | `Number` | Playback start position in seconds |
| `endPosition` | `Number` | Playback end position in seconds |
| `deviceType` | `String` | Device used for this session |
| `ipAddress` | `String` | Client IP (hashed for privacy) |

> **Note:** `sessions` array is capped at **50 entries** per document. Older sessions are rolled off (FIFO) to prevent unbounded document growth.

---

### Indexes

| Name | Keys | Options | Purpose |
|---|---|---|---|
| `idx_watch_user_movie` | `{ tenantId: 1, userId: 1, movieId: 1 }` | `unique: true` | One record per user-movie pair |
| `idx_watch_user_recent` | `{ tenantId: 1, userId: 1, lastWatchedAt: -1 }` | — | "Continue Watching" rail |
| `idx_watch_movie_stats` | `{ tenantId: 1, movieId: 1, completed: 1 }` | — | Completion rate per movie |
| `idx_watch_user_completed` | `{ tenantId: 1, userId: 1, completed: 1, lastWatchedAt: -1 }` | — | User's completed watches |
| `idx_watch_tenant_recent` | `{ tenantId: 1, lastWatchedAt: -1 }` | — | Platform-wide recent activity |
| `idx_watch_ttl` | `{ lastWatchedAt: 1 }` | `expireAfterSeconds: 31536000` (365 days, configurable) | Auto-purge stale history |

---

### Relationships

| Field | References | Description |
|---|---|---|
| `userId` | `users._id` | Viewer who watched the movie |
| `movieId` | `movies._id` | Movie that was watched |

**Referenced by:** None (leaf collection; aggregated into `movies.statistics`)

---

### Validation Rules

| Rule | Constraint |
|---|---|
| `userId` | Must reference an existing user with `userType: "viewer"` |
| `movieId` | Must reference an existing, published movie in the same tenant |
| `watchDuration` | Integer ≥ 0 |
| `lastPosition` | Integer ≥ 0 and ≤ `totalDuration` |
| `totalDuration` | Integer > 0; synced from `movies.duration` on first write |
| `progress` | Number 0–100; computed as `Math.round((lastPosition / totalDuration) * 100)` |
| `completed` | Auto-set to `true` when `progress` ≥ 90 |
| `watchCount` | Integer ≥ 1; incremented on each new session |
| `deviceType` | Must be one of: `web`, `mobile`, `tablet`, `tv`, `console` |
| `sessions` | Max 50 entries; oldest removed when cap exceeded |
| `sessions[].duration` | Integer ≥ 0 |
| Upsert behavior | Use `upsert` on `{ tenantId, userId, movieId }` — update existing record on repeat views |
| Privacy | `sessions[].ipAddress` stored as SHA-256 hash, not plaintext |

---

## 10. Collection: `settings`

### Purpose

Stores tenant-level and system-level configuration as structured documents. Provides a single source of truth for branding, feature toggles, integration credentials (encrypted), notification preferences, and AI configuration.

---

### Fields

| Field | Data Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | — | Primary key |
| `tenantId` | `ObjectId` | Yes | — | Owning tenant |
| `group` | `String` | Yes | — | Settings group identifier (see groups) |
| `values` | `Object` | Yes | `{}` | Key-value settings for this group |
| `version` | `Number` | Yes | `1` | Optimistic concurrency version |
| `updatedBy` | `ObjectId` | No | `null` | Last CMS user who modified |
| `createdAt` | `Date` | Auto | `now` | Record creation timestamp |
| `updatedAt` | `Date` | Auto | `now` | Last modification timestamp |

#### Settings Groups and `values` Sub-schemas

##### Group: `general`

| Key | Data Type | Default | Description |
|---|---|---|---|
| `platformName` | `String` | `"OTT CMS"` | Display name of the platform |
| `supportEmail` | `String` | — | Support contact email |
| `defaultLanguage` | `String` | `"en"` | Default content language |
| `defaultTimezone` | `String` | `"UTC"` | Default timezone for scheduling |
| `dateFormat` | `String` | `"YYYY-MM-DD"` | Display date format |
| `maintenanceMode` | `Boolean` | `false` | Enable maintenance mode |

##### Group: `branding`

| Key | Data Type | Default | Description |
|---|---|---|---|
| `logoUrl` | `String` | `null` | Tenant logo URL |
| `faviconUrl` | `String` | `null` | Favicon URL |
| `primaryColor` | `String` | `"#E50914"` | Primary brand color (hex) |
| `secondaryColor` | `String` | `"#221F1F"` | Secondary brand color (hex) |
| `customCss` | `String` | `""` | Custom CSS overrides (sanitized) |

##### Group: `content`

| Key | Data Type | Default | Description |
|---|---|---|---|
| `defaultContentRating` | `String` | `"PG-13"` | Default rating for new movies |
| `requireQCApproval` | `Boolean` | `true` | Require QC before publish |
| `autoPublishOnSchedule` | `Boolean` | `true` | Auto-publish at `publishAt` time |
| `maxUploadSizeMB` | `Number` | `5120` | Max video upload size in MB |
| `allowedVideoFormats` | `[String]` | `["mp4","mov","mkv"]` | Accepted upload formats |
| `thumbnailDimensions` | `Object` | `{ width: 480, height: 720 }` | Required poster dimensions |

##### Group: `ai`

| Key | Data Type | Default | Description |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | Master AI feature toggle |
| `provider` | `String` | `"openai"` | AI provider: `openai`, `bedrock`, `azure` |
| `autoGenerateMetadata` | `Boolean` | `false` | Auto-trigger metadata on upload |
| `requireApproval` | `Boolean` | `true` | Require human approval for AI output |
| `dailyBudgetUSD` | `Number` | `50` | Daily AI spend cap |
| `moderationEnabled` | `Boolean` | `true` | Auto content moderation on upload |

##### Group: `notifications`

| Key | Data Type | Default | Description |
|---|---|---|---|
| `emailOnPublish` | `Boolean` | `true` | Email when content is published |
| `emailOnQCReject` | `Boolean` | `true` | Email on QC rejection |
| `slackWebhookUrl` | `String` | `null` | Encrypted Slack webhook URL |
| `alertRecipients` | `[String]` | `[]` | Email addresses for system alerts |

##### Group: `security`

| Key | Data Type | Default | Description |
|---|---|---|---|
| `sessionTimeoutMinutes` | `Number` | `60` | Idle session timeout |
| `maxLoginAttempts` | `Number` | `5` | Before account lockout |
| `lockoutDurationMinutes` | `Number` | `15` | Lockout duration |
| `passwordMinLength` | `Number` | `8` | Minimum password length |
| `requireMFA` | `Boolean` | `false` | Require multi-factor authentication |
| `ipWhitelist` | `[String]` | `[]` | Allowed IP ranges (empty = all) |

##### Group: `integrations`

| Key | Data Type | Default | Description |
|---|---|---|---|
| `cdnBaseUrl` | `String` | `null` | CDN base URL for media delivery |
| `transcodingProvider` | `String` | `"mediaconvert"` | Transcoding service |
| `storageProvider` | `String` | `"s3"` | Object storage provider |
| `storageBucket` | `String` | `null` | Storage bucket name |
| `analyticsProvider` | `String` | `null` | External analytics integration |

---

### Indexes

| Name | Keys | Options | Purpose |
|---|---|---|---|
| `idx_settings_tenant_group` | `{ tenantId: 1, group: 1 }` | `unique: true` | One document per group per tenant |
| `idx_settings_tenant` | `{ tenantId: 1 }` | — | Load all settings for a tenant |

---

### Relationships

| Field | References | Description |
|---|---|---|
| `tenantId` | tenant scope | One set of settings per tenant |
| `updatedBy` | `users._id` | Last editor |

**Referenced by:**
- `activity_logs.entityId` (when `entityType` is `setting`)

---

### Validation Rules

| Rule | Constraint |
|---|---|
| `group` | Must be one of: `general`, `branding`, `content`, `ai`, `notifications`, `security`, `integrations` |
| `group` + `tenantId` | Unique combination — one document per group per tenant |
| `values` | Must conform to the sub-schema for the given `group` |
| `values.primaryColor` | Hex color regex if in `branding` group |
| `values.supportEmail` | Valid email format if in `general` group |
| `values.maxUploadSizeMB` | Integer 1–10240 (10 GB max) |
| `values.dailyBudgetUSD` | Number ≥ 0 |
| `values.sessionTimeoutMinutes` | Integer 5–1440 |
| `values.passwordMinLength` | Integer 8–128 |
| `values.slackWebhookUrl` | Encrypted at rest; validated as HTTPS URL before encryption |
| `version` | Incremented on every update; reject stale writes |
| Sensitive values | `slackWebhookUrl`, API keys must be encrypted with AES-256 before storage |
| `customCss` | Sanitized server-side; max 10 KB; no `@import` or `url()` |

---

## 11. Index Summary

| Collection | Index Count | Unique Indexes | TTL Indexes | Text Indexes |
|---|---|---|---|---|
| `users` | 7 | 3 | 1 (optional) | 0 |
| `movies` | 9 | 1 | 0 | 1 |
| `categories` | 5 | 2 | 0 | 1 |
| `roles` | 3 | 2 | 0 | 0 |
| `activity_logs` | 6 | 0 | 1 | 0 |
| `watch_history` | 6 | 1 | 1 | 0 |
| `settings` | 2 | 1 | 0 | 0 |
| **Total** | **38** | **10** | **3** | **2** |

---

## 12. Data Integrity & Referential Notes

MongoDB does not enforce foreign keys natively. The application layer must enforce these rules:

### Referential Integrity Checks

| Operation | Check |
|---|---|
| Delete `role` | Reject if any `users.roleId` references it |
| Delete `category` | Reject if `movieCount > 0` or child categories exist |
| Delete `movie` | Soft-delete only; remove from `watch_history` via TTL |
| Delete `user` (CMS) | Soft-delete; reassign or deactivate |
| Update `movies.categoryIds` | Validate all IDs exist and are active; update `categories.movieCount` |
| Update `settings` | Log to `activity_logs` with `changes` diff |

### Denormalization Strategy

| Field | Source | Sync Trigger |
|---|---|---|
| `categories.movieCount` | Count of `movies` with `categoryIds` containing this category | On movie create/update/delete |
| `movies.statistics.*` | Aggregated from `watch_history` | Periodic batch job (every 15 min) |
| `activity_logs.actorEmail` | `users.email` at write time | Immutable after insert |
| `watch_history.totalDuration` | `movies.duration` | On first watch record creation |

### Estimated Document Sizes

| Collection | Avg Size | Growth Rate | Notes |
|---|---|---|---|
| `users` | ~2 KB | Low | Grows with user base |
| `movies` | ~5–10 KB | Medium | Rich metadata and embedded cast |
| `categories` | ~0.5 KB | Very low | Small, stable collection |
| `roles` | ~1 KB | Very low | Few roles per tenant |
| `activity_logs` | ~1–3 KB | High | Append-only; TTL manages growth |
| `watch_history` | ~2–5 KB | High | Capped sessions array controls size |
| `settings` | ~2 KB | Very low | 7 documents max per tenant |

---

*End of Database Schema Document*
