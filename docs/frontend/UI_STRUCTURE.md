# AI OTT CMS — UI Structure Specification

| Field | Value |
|---|---|
| **Version** | 1.0.0 |
| **Stack** | React 19 · TypeScript · Vite · Tailwind CSS |
| **Audience** | Frontend engineers, designers, Tech Lead reviewers |
| **Last Updated** | July 8, 2026 |

---

## Table of Contents

1. [Design System Foundations](#1-design-system-foundations)
2. [Application Shell & Global Navigation](#2-application-shell--global-navigation)
3. [Route Map](#3-route-map)
4. [Page: Login](#4-page-login)
5. [Page: Dashboard](#5-page-dashboard)
6. [Page: Movies](#6-page-movies)
7. [Page: Categories](#7-page-categories)
8. [Page: Users](#8-page-users)
9. [Page: Analytics](#9-page-analytics)
10. [Page: Settings](#10-page-settings)
11. [Page: Profile](#11-page-profile)
12. [Page: 404](#12-page-404)
13. [Shared Components Library](#13-shared-components-library)
14. [Role-Based UI Visibility Matrix](#14-role-based-ui-visibility-matrix)
15. [Responsive Breakpoints Summary](#15-responsive-breakpoints-summary)

---

## 1. Design System Foundations

### 1.1 Layout Grid

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | `< 640px` | Single column; collapsible nav |
| Tablet | `640px – 1023px` | Sidebar collapsed to icons; 1–2 column content |
| Desktop | `≥ 1024px` | Fixed sidebar (240px) + fluid content area |
| Wide | `≥ 1440px` | Max content width 1280px, centered |

### 1.2 Visual Hierarchy

| Level | Usage | Tailwind Reference |
|---|---|---|
| Page title | H1 per page | `text-2xl font-semibold` |
| Section title | Card/panel headers | `text-lg font-medium` |
| Body | Default content | `text-sm text-gray-700` |
| Caption | Metadata, timestamps | `text-xs text-gray-500` |

### 1.3 Color Tokens (Semantic)

| Token | Usage |
|---|---|
| `primary` | Primary actions, active nav, links |
| `destructive` | Delete, deactivate, error states |
| `success` | Published, active, approved |
| `warning` | Draft, pending review, suspended |
| `muted` | Disabled, archived, secondary text |

### 1.4 Spacing & Density

- Page padding: `p-4` (mobile) → `p-6` (tablet) → `p-8` (desktop)
- Card gap: `gap-4` between cards; `gap-6` between sections
- Form field gap: `space-y-4`
- Table row height: 48px (compact) / 56px (comfortable)

---

## 2. Application Shell & Global Navigation

All authenticated pages (Dashboard through Profile) share a common **Admin Layout**.

### 2.1 Shell Components

```
┌─────────────────────────────────────────────────────────────────────┐
│  TopBar                                                             │
│  [☰ Menu]  [Breadcrumb]              [Search] [🔔] [Avatar ▾]      │
├────────────┬────────────────────────────────────────────────────────┤
│            │                                                        │
│  Sidebar   │  Main Content Area                                     │
│            │  ┌──────────────────────────────────────────────────┐  │
│  • Dashboard│  │ PageHeader (title + actions)                    │  │
│  • Movies   │  ├──────────────────────────────────────────────────┤  │
│  • Categories│ │ Page Body (tables, forms, charts)               │  │
│  • Users    │  └──────────────────────────────────────────────────┘  │
│  • Analytics│                                                       │
│  • Settings │                                                       │
│            │                                                        │
│  [Collapse]│                                                        │
└────────────┴────────────────────────────────────────────────────────┘
```

| Component | Responsibility |
|---|---|
| `AdminLayout` | Root layout wrapper for authenticated routes |
| `TopBar` | Global header: menu toggle, breadcrumb, search, notifications, user menu |
| `Sidebar` | Primary navigation links with active state and role-based visibility |
| `PageHeader` | Page title, subtitle, and primary action buttons |
| `Breadcrumb` | Hierarchical path (e.g., Movies → The Last Horizon) |
| `UserMenu` | Avatar dropdown: Profile, Settings, Logout |
| `GlobalSearch` | Command-palette style search (⌘K) across movies and categories |
| `NotificationBell` | Activity feed dropdown (recent audit events) |
| `ToastContainer` | Global success/error/info toast notifications |
| `ConfirmDialog` | Reusable destructive action confirmation |

### 2.2 Sidebar Navigation Items

| Label | Route | Icon | Visible To |
|---|---|---|---|
| Dashboard | `/dashboard` | LayoutDashboard | All |
| Movies | `/movies` | Film | All |
| Categories | `/categories` | Tags | All |
| Users | `/users` | Users | Admin |
| Analytics | `/analytics` | BarChart3 | All |
| Settings | `/settings` | Settings | Admin |

### 2.3 User Menu Dropdown

| Item | Route / Action |
|---|---|
| Profile | `/profile` |
| Settings | `/settings` (Admin only) |
| Theme toggle | Light / Dark / System |
| Logout | POST `/auth/logout` → redirect `/login` |

---

## 3. Route Map

| Route | Page | Layout | Auth | Roles |
|---|---|---|---|---|
| `/login` | Login | AuthLayout | Public | — |
| `/dashboard` | Dashboard | AdminLayout | Required | All |
| `/movies` | Movies List | AdminLayout | Required | All |
| `/movies/new` | Create Movie | AdminLayout | Required | Admin, Editor |
| `/movies/:id` | Movie Detail / Edit | AdminLayout | Required | All (edit: Admin, Editor) |
| `/categories` | Categories List | AdminLayout | Required | All |
| `/users` | Users List | AdminLayout | Required | Admin |
| `/analytics` | Analytics | AdminLayout | Required | All |
| `/settings` | Settings | AdminLayout | Required | Admin |
| `/profile` | Profile | AdminLayout | Required | All |
| `*` | 404 | ErrorLayout | — | — |

---

## 4. Page: Login

**Route:** `/login`  
**Layout:** `AuthLayout` (centered card, no sidebar)

### Purpose

Authenticate CMS operators via email and password. Entry point for unauthenticated users. Redirects to `/dashboard` on success. Supports SSO button placeholder for future OIDC integration.

### Components

| Component | Description |
|---|---|
| `AuthLayout` | Full-viewport centered layout with brand logo and background gradient |
| `LoginCard` | White/dark card container for the login form |
| `BrandLogo` | Tenant/platform logo and product name |
| `LoginForm` | Email + password form with validation |
| `FormField` | Reusable labeled input with error message |
| `PasswordInput` | Password field with show/hide toggle |
| `AlertBanner` | Displays login errors (invalid credentials, locked account) |
| `SSOButtonGroup` | Optional "Sign in with Google" / "Sign in with SSO" buttons (disabled in v1) |
| `FooterLinks` | "Forgot password?" link (future), copyright text |

### Buttons

| Button | Type | Action | State |
|---|---|---|---|
| Sign In | Primary (full width) | Submit login form | Loading spinner while authenticating |
| Show/Hide Password | Icon (ghost) | Toggle password visibility | — |
| Sign in with Google | Secondary (outline) | SSO redirect (future) | Disabled in v1 |

### Tables

None.

### Forms

**LoginForm**

| Field | Type | Validation | Placeholder |
|---|---|---|---|
| Email | `email` input | Required; valid email format | `you@company.com` |
| Password | `password` input | Required; min 1 character | `Enter your password` |
| Remember me | `checkbox` | Optional | — |

**Form behavior:**
- Inline validation on blur
- Submit on Enter key
- Display field-level and form-level errors from API (`401`, `403`, `429`)
- Clear password field on failed attempt

### Modals

None on this page.

### Navigation

| Behavior | Detail |
|---|---|
| Entry | Redirect from any protected route when unauthenticated |
| Exit (success) | Redirect to `/dashboard` or `returnUrl` query param |
| Exit (already auth) | Auto-redirect to `/dashboard` if valid session exists |
| Links | No sidebar; minimal footer links only |

### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile (`< 640px`) | Card full-width with `mx-4`; logo scaled down; form fields stack vertically |
| Tablet | Card fixed width `max-w-md`, centered |
| Desktop | Card `max-w-md`, centered; optional brand illustration on left half (split layout) |

---

## 5. Page: Dashboard

**Route:** `/dashboard`  
**Layout:** `AdminLayout`

### Purpose

Provide an at-a-glance operational overview of the OTT catalog. Surfaces KPIs, recent activity, upload/publish trends, and quick actions for content managers. Primary landing page after login.

### Components

| Component | Description |
|---|---|
| `PageHeader` | Title "Dashboard" + optional date range selector |
| `KPICardGrid` | Row of 4–6 stat cards (movies, users, drafts, AI jobs) |
| `KPICard` | Single metric: label, value, trend indicator (↑↓), sparkline |
| `ActivityFeed` | Scrollable list of recent audit log entries |
| `ActivityFeedItem` | Actor avatar, action description, entity link, timestamp |
| `UploadTrendChart` | Line/area chart — uploads and publishes over time |
| `CatalogHealthGauge` | Circular progress or score badge (0–100) |
| `QuickActionsPanel` | Shortcut buttons to common tasks |
| `PendingReviewList` | Compact table of movies in `in_review` status |
| `AIJobMonitor` | Status chips for pending AI processing jobs |
| `EmptyState` | Shown when no data exists (new tenant) |

### Buttons

| Button | Location | Action | Role |
|---|---|---|---|
| Add Movie | PageHeader | Navigate to `/movies/new` | Admin, Editor |
| View All Activity | ActivityFeed header | Navigate to filtered audit view | All |
| View All Pending | PendingReviewList header | Navigate to `/movies?status=in_review` | All |
| Refresh | PageHeader (icon) | Refetch dashboard data | All |
| Date range selector | PageHeader | Filter charts: 7d / 30d / 90d | All |

### Tables

**PendingReviewTable** (embedded, max 5 rows)

| Column | Content |
|---|---|
| Poster | Thumbnail 40×60 |
| Title | Movie title (link to detail) |
| Submitted By | Editor name |
| Submitted At | Relative time |
| Actions | Review button |

### Forms

None on main dashboard view.

### Modals

None on main dashboard view.

### Navigation

| Source | Destination |
|---|---|
| Sidebar → Dashboard | `/dashboard` |
| KPI card "Total Movies" | `/movies` |
| KPI card "Draft Movies" | `/movies?status=draft` |
| Activity item entity link | `/movies/:id` or `/users/:id` |
| Quick Action "Add Movie" | `/movies/new` |
| Quick Action "Manage Categories" | `/categories` |

### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile | KPI cards stack 1-column; charts full-width; activity feed below KPIs; pending table becomes card list |
| Tablet | KPI cards 2-column grid; charts and activity side-by-side (stacked) |
| Desktop | KPI cards 3–4 column row; charts left (2/3) + activity feed right (1/3); pending table full width below |
| Wide | Same as desktop with max-width container |

---

## 6. Page: Movies

**Routes:** `/movies`, `/movies/new`, `/movies/:id`  
**Layout:** `AdminLayout`

### Purpose

Manage the full movie catalog lifecycle — browse, search, create, edit, publish, and delete movies. Central workspace for content editors with integrated AI metadata assistance.

---

### 6A. Movies List (`/movies`)

#### Components

| Component | Description |
|---|---|
| `PageHeader` | Title "Movies" + count badge + primary actions |
| `SearchBar` | Full-text search with debounce |
| `FilterBar` | Status, category, rating, year filters |
| `FilterChip` | Removable active filter tags |
| `MoviesDataTable` | Virtualized sortable table of movies |
| `StatusBadge` | Color-coded status pill (draft, published, etc.) |
| `PosterThumbnail` | 40×60 image with fallback placeholder |
| `BulkActionBar` | Appears when rows selected (publish, archive, delete) |
| `Pagination` | Page controls with items-per-page selector |
| `EmptyState` | "No movies found" with CTA to create |
| `ViewToggle` | Table view / Grid view switcher |

#### Buttons

| Button | Location | Action | Role |
|---|---|---|---|
| Add Movie | PageHeader | Navigate `/movies/new` | Admin, Editor |
| Search | SearchBar | Trigger `/movies/search` | All |
| Clear Filters | FilterBar | Reset all filters | All |
| Table / Grid toggle | FilterBar | Switch view mode | All |
| Row: View | Actions column | Navigate `/movies/:id` | All |
| Row: Edit | Actions dropdown | Navigate `/movies/:id?edit=true` | Admin, Editor |
| Row: Delete | Actions dropdown | Open delete confirmation modal | Admin |
| Bulk: Publish | BulkActionBar | Publish selected movies | Admin |
| Bulk: Archive | BulkActionBar | Archive selected | Admin |
| Bulk: Delete | BulkActionBar | Open bulk delete modal | Admin |
| Export CSV | PageHeader dropdown | Download filtered list | Admin, Editor |

#### Tables

**MoviesDataTable**

| Column | Sortable | Content |
|---|---|---|
| Checkbox | — | Row selection |
| Poster | — | Thumbnail image |
| Title | Yes | Title + slug subtitle |
| Status | Yes | StatusBadge |
| Categories | No | Category chips (max 2 + overflow) |
| Duration | Yes | Formatted `HH:MM:SS` |
| Release Year | Yes | Year |
| Published At | Yes | Date or "—" |
| Actions | — | View, Edit, Delete dropdown |

**Grid View (alternative):** `MovieCard` with poster, title, status, category chips, and action menu.

#### Forms

**FilterBar** (inline filters, not a submit form)

| Control | Type | Options |
|---|---|---|
| Status | Multi-select | draft, in_review, published, archived, etc. |
| Category | Select | From categories API |
| Content Rating | Multi-select | G, PG, PG-13, R, etc. |
| Release Year | Range | From – To year inputs |
| Featured | Toggle | Yes / No |

#### Modals

| Modal | Trigger | Content |
|---|---|---|
| `DeleteMovieModal` | Delete action | Confirmation message, movie title, destructive confirm |
| `BulkDeleteModal` | Bulk delete | Count of selected movies, warning text |
| `BulkPublishModal` | Bulk publish | List of movies to publish, schedule option |

#### Navigation

| Source | Destination |
|---|---|
| Sidebar → Movies | `/movies` |
| Add Movie | `/movies/new` |
| Row click / View | `/movies/:id` |
| Breadcrumb | Dashboard → Movies |

#### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile | FilterBar collapses to filter drawer (slide-over); table switches to card list; bulk actions in bottom sheet; fewer columns (title, status, actions) |
| Tablet | Horizontal scroll table or grid view (2 columns); filter bar wraps |
| Desktop | Full table with all columns; filter bar inline; bulk action bar sticky above table |
| Wide | Grid view option shows 4–5 columns of movie cards |

---

### 6B. Create / Edit Movie (`/movies/new`, `/movies/:id`)

#### Components

| Component | Description |
|---|---|
| `PageHeader` | Title (Create / Edit) + status badge + save actions |
| `MovieFormTabs` | Tab navigation: Details, Media, Cast & Crew, SEO, AI Assistant |
| `MovieDetailsTab` | Core metadata fields |
| `MovieMediaTab` | Poster, backdrop, video upload zones |
| `CastCrewTab` | Editable cast and crew lists |
| `SEOTab` | Meta title, description, keywords |
| `AIAssistantPanel` | Side panel or tab for AI generation tools |
| `FileUploadZone` | Drag-and-drop upload for poster/video |
| `ImagePreview` | Preview uploaded images with crop option |
| `VideoPreview` | Inline video player for QC |
| `TagInput` | Multi-value tag entry with autocomplete |
| `CategoryMultiSelect` | Searchable category picker |
| `CastRowEditor` | Inline editable row for cast member |
| `PublishWorkflowBar` | Status transition buttons with validation gates |
| `UnsavedChangesBanner` | Warning when navigating away with dirty form |
| `AISuggestionCard` | Inline AI result with Accept / Reject / Edit actions |

#### Buttons

| Button | Location | Action | Role |
|---|---|---|---|
| Save Draft | PageHeader | PATCH movie, status=draft | Admin, Editor |
| Submit for Review | PublishWorkflowBar | Transition to in_review | Admin, Editor |
| Approve | PublishWorkflowBar | Transition to approved | Admin |
| Publish | PublishWorkflowBar | Transition to published | Admin |
| Unpublish | PublishWorkflowBar | Transition to unpublished | Admin |
| Archive | PublishWorkflowBar | Transition to archived | Admin |
| Cancel | PageHeader | Navigate back with unsaved warning | All |
| Add Cast Member | CastCrewTab | Add empty cast row | Admin, Editor |
| Remove Cast Row | Cast row | Delete cast entry | Admin, Editor |
| Upload Poster | MediaTab | Open file picker | Admin, Editor |
| Upload Video | MediaTab | Initiate pre-signed upload | Admin, Editor |
| Generate Description | AI Panel | POST `/ai/generate/description` | Admin, Editor |
| Generate SEO | AI Panel | POST `/ai/generate/seo` | Admin, Editor |
| Generate Tags | AI Panel | POST `/ai/generate/tags` | Admin, Editor |
| Generate Caption | AI Panel | POST `/ai/generate/social-caption` | Admin, Editor |
| Accept AI Suggestion | AISuggestionCard | Apply AI output to form field | Admin, Editor |
| Reject AI Suggestion | AISuggestionCard | Dismiss suggestion | Admin, Editor |
| Delete Movie | PageHeader dropdown | Open delete modal | Admin |

#### Tables

**CastTable** (editable inline)

| Column | Editable | Content |
|---|---|---|
| Order | Yes (drag) | Drag handle + order number |
| Name | Yes | Text input |
| Character | Yes | Text input |
| Image | No | Upload button / thumbnail |
| Actions | — | Remove row |

**CrewTable** — same pattern with `Name` and `Role` columns.

#### Forms

**MovieDetailsForm (Tab: Details)**

| Field | Type | Required | Notes |
|---|---|---|---|
| Title | Text | Yes | Auto-generates slug |
| Slug | Text | Yes | Editable; uniqueness validated |
| Synopsis | Textarea | No | Max 500 chars; char counter |
| Description | Rich text (TipTap) | No | Max 5000 chars |
| Duration | Duration picker | Yes | Hours : Minutes : Seconds |
| Release Year | Number | No | 1900 – current+2 |
| Language | Select | No | ISO language list |
| Content Rating | Select | No | G, PG, PG-13, etc. |
| Categories | Multi-select | No | Category picker |
| Tags | Tag input | No | Max 20 tags |
| Director | Text | No | — |
| Featured | Toggle | No | Homepage featured flag |

**MovieMediaForm (Tab: Media)**

| Field | Type | Required | Notes |
|---|---|---|---|
| Poster | File upload | On publish | JPG/PNG, min 480×720 |
| Backdrop | File upload | No | 1920×1080 recommended |
| Trailer URL | URL input | No | YouTube/Vimeo embed |
| Video | File upload | On publish | MP4/MOV; shows upload progress |
| Subtitles | File upload (multi) | No | SRT/VTT per language |

**SEOForm (Tab: SEO)**

| Field | Type | Notes |
|---|---|---|
| Meta Title | Text | Max 70 chars; counter |
| Meta Description | Textarea | Max 160 chars; counter |
| Keywords | Tag input | — |

#### Modals

| Modal | Trigger | Content |
|---|---|---|
| `DeleteMovieModal` | Delete button | Confirm deletion |
| `UnsavedChangesModal` | Cancel / navigate away | "Discard changes?" confirm |
| `PublishConfirmModal` | Publish button | Pre-publish checklist (poster ✓, video ✓) |
| `SchedulePublishModal` | Schedule option | Date/time picker for `publishAt` |
| `AIGeneratingModal` | AI generate (long ops) | Loading spinner with cancel |
| `ImageCropModal` | Poster upload | Crop to required aspect ratio |

#### Navigation

| Source | Destination |
|---|---|
| Breadcrumb | Dashboard → Movies → [Movie Title] |
| Cancel / Back | `/movies` |
| Save success | Stay on page; toast notification |
| Publish success | Stay on page; status badge updates |
| Delete success | `/movies` |

#### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile | Tabs become accordion sections; AI panel moves to bottom sheet (floating action button); form single column; publish bar sticky at bottom |
| Tablet | Tabs horizontal; AI panel as collapsible right drawer; two-column form layout |
| Desktop | Tabs horizontal; AI panel fixed right sidebar (320px); two-column form; publish workflow bar in PageHeader |
| Wide | Three-column form for short fields; media upload zones side-by-side |

---

## 7. Page: Categories

**Route:** `/categories`  
**Layout:** `AdminLayout`

### Purpose

Manage the genre and topic taxonomy used to classify movies. Supports flat and hierarchical category structures, sort ordering, and visibility toggling.

### Components

| Component | Description |
|---|---|
| `PageHeader` | Title "Categories" + count + Add button |
| `ViewToggle` | Table view / Tree view |
| `CategoriesDataTable` | Sortable flat list of categories |
| `CategoryTree` | Expandable hierarchical tree view |
| `CategoryTreeNode` | Single node with drag handle, name, count, actions |
| `ColorBadge` | Category color swatch chip |
| `MovieCountBadge` | Number of associated movies |
| `EmptyState` | "No categories yet" with CTA |
| `SearchInput` | Filter categories by name |

### Buttons

| Button | Location | Action | Role |
|---|---|---|---|
| Add Category | PageHeader | Open Create Category modal | Admin, Editor |
| Table / Tree toggle | PageHeader | Switch view mode | All |
| Row: Edit | Actions | Open Edit Category modal | Admin, Editor |
| Row: Delete | Actions | Open Delete modal | Admin |
| Row: Toggle Active | Actions | PATCH `isActive` | Admin, Editor |
| Tree: Expand All | Tree header | Expand all nodes | All |
| Tree: Collapse All | Tree header | Collapse all nodes | All |
| Drag reorder | Tree view | PATCH `sortOrder` on drop | Admin, Editor |

### Tables

**CategoriesDataTable**

| Column | Sortable | Content |
|---|---|---|
| Color | — | Color swatch |
| Name | Yes | Name + slug subtitle |
| Parent | No | Parent category name or "—" |
| Movies | Yes | MovieCountBadge |
| Sort Order | Yes | Number |
| Status | Yes | Active / Inactive badge |
| Actions | — | Edit, Toggle, Delete |

### Forms

**CategoryForm** (inside Create/Edit modal)

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | Text | Yes | Unique per tenant |
| Slug | Text | No | Auto-generated from name |
| Description | Textarea | No | Max 1000 chars |
| Parent Category | Select | No | Tree select; excludes self |
| Image | File upload | No | Category thumbnail |
| Color | Color picker | No | Hex color for UI badges |
| Sort Order | Number | No | Default 0 |
| Active | Toggle | No | Default true |

### Modals

| Modal | Trigger | Content |
|---|---|---|
| `CreateCategoryModal` | Add Category | CategoryForm (empty) |
| `EditCategoryModal` | Edit action | CategoryForm (pre-filled) |
| `DeleteCategoryModal` | Delete action | Warning if `movieCount > 0`; block or force override (Admin) |

### Navigation

| Source | Destination |
|---|---|
| Sidebar → Categories | `/categories` |
| Movie count badge click | `/movies?categoryId=:id` |
| Breadcrumb | Dashboard → Categories |

### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile | Table switches to card list; tree view uses indented list with swipe actions; modals full-screen |
| Tablet | Table with horizontal scroll; tree view with reduced indentation |
| Desktop | Full table or full tree; modals centered `max-w-lg` |
| Wide | Tree view shows movie count and actions inline |

---

## 8. Page: Users

**Route:** `/users`  
**Layout:** `AdminLayout`

### Purpose

Admin-only user management. Invite new CMS operators, assign roles, activate/deactivate accounts, and audit user activity.

### Components

| Component | Description |
|---|---|
| `PageHeader` | Title "Users" + count + Invite button |
| `SearchBar` | Search by name or email |
| `FilterBar` | Role and status filters |
| `UsersDataTable` | Paginated user list |
| `RoleBadge` | Color-coded role pill (admin, editor, viewer) |
| `StatusBadge` | Active, invited, suspended, deactivated |
| `AvatarCell` | User avatar with initials fallback |
| `EmptyState` | "No users found" |

### Buttons

| Button | Location | Action | Role |
|---|---|---|---|
| Invite User | PageHeader | Open Invite User modal | Admin |
| Search | SearchBar | Filter table | Admin |
| Row: View | Actions | Open User Detail drawer | Admin |
| Row: Edit | Actions | Open Edit User modal | Admin |
| Row: Change Role | Actions | Open Change Role modal | Admin |
| Row: Suspend | Actions | Open status confirmation | Admin |
| Row: Deactivate | Actions | Open deactivate modal | Admin |
| Row: Resend Invite | Actions (invited only) | Resend invitation email | Admin |

### Tables

**UsersDataTable**

| Column | Sortable | Content |
|---|---|---|
| Avatar | — | AvatarCell |
| Name | Yes | Display name |
| Email | Yes | Email address |
| Role | Yes | RoleBadge |
| Status | Yes | StatusBadge |
| Last Login | Yes | Relative time or "Never" |
| Created | Yes | Date |
| Actions | — | View, Edit, Role, Suspend dropdown |

### Forms

**InviteUserForm** (Invite modal)

| Field | Type | Required | Notes |
|---|---|---|---|
| Email | Email | Yes | Unique per tenant |
| First Name | Text | Yes | — |
| Last Name | Text | Yes | — |
| Role | Select | Yes | admin, editor, viewer |

**EditUserForm** (Edit modal)

| Field | Type | Required | Notes |
|---|---|---|---|
| First Name | Text | Yes | — |
| Last Name | Text | Yes | — |
| Avatar | File upload | No | Profile image |

**ChangeRoleForm** (Change Role modal)

| Field | Type | Required | Notes |
|---|---|---|---|
| Current Role | Read-only | — | Display only |
| New Role | Select | Yes | admin, editor, viewer |

**ChangeStatusForm** (Suspend/Deactivate modal)

| Field | Type | Required | Notes |
|---|---|---|---|
| New Status | Select | Yes | active, suspended, deactivated |
| Reason | Textarea | No | Audit note, max 500 chars |

### Modals

| Modal | Trigger | Content |
|---|---|---|
| `InviteUserModal` | Invite User button | InviteUserForm |
| `EditUserModal` | Edit action | EditUserForm |
| `ChangeRoleModal` | Change Role action | ChangeRoleForm |
| `ChangeStatusModal` | Suspend/Deactivate | ChangeStatusForm |
| `DeactivateUserModal` | Deactivate | Stronger warning; cannot deactivate self |
| `UserDetailDrawer` | View action | Slide-over with full profile, activity log |

### Navigation

| Source | Destination |
|---|---|
| Sidebar → Users | `/users` |
| UserDetailDrawer → Activity | Filtered activity for user |
| Breadcrumb | Dashboard → Users |

### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile | Table becomes card list (avatar, name, role, status, actions menu); modals full-screen; UserDetailDrawer full-screen |
| Tablet | Reduced columns (name, role, status, actions); drawer 80% width |
| Desktop | Full table; drawer 480px slide-over |
| Wide | Full table with all columns; optional activity preview column |

---

## 9. Page: Analytics

**Route:** `/analytics`  
**Layout:** `AdminLayout`

### Purpose

Visualize catalog and platform metrics — movie distribution, user growth, upload trends, and category breakdowns. Supports data-driven content strategy decisions.

### Components

| Component | Description |
|---|---|
| `PageHeader` | Title "Analytics" + date range picker + export button |
| `AnalyticsTabBar` | Tabs: Overview, Content, Users, Uploads |
| `StatCardRow` | Summary KPI cards for active tab |
| `CategoryBreakdownChart` | Donut/bar chart — movies per category |
| `UploadTrendChart` | Bar chart — monthly uploads |
| `StatusDistributionChart` | Pie chart — movies by status |
| `UserGrowthChart` | Line chart — user count over time (Admin only) |
| `TopMoviesTable` | Most viewed movies (from statistics) |
| `ChartLegend` | Interactive legend to toggle series |
| `DateRangePicker` | Preset ranges: 7d, 30d, 90d, 12m, custom |
| `ExportButton` | Download chart data as CSV |
| `EmptyState` | "Not enough data" for new tenants |

### Buttons

| Button | Location | Action | Role |
|---|---|---|---|
| Export CSV | PageHeader | Download current tab data | All |
| Date range presets | DateRangePicker | Filter all charts | All |
| Chart legend items | Chart area | Toggle data series | All |
| View Movie | TopMoviesTable row | Navigate `/movies/:id` | All |
| Refresh | PageHeader icon | Refetch analytics data | All |

### Tables

**TopMoviesTable**

| Column | Content |
|---|---|
| Rank | 1, 2, 3… |
| Poster | Thumbnail |
| Title | Movie title (link) |
| Views | viewCount |
| Completions | completionCount |
| Avg Rating | Star rating |
| Completion Rate | Percentage bar |

**MonthlyUploadsTable** (Uploads tab)

| Column | Content |
|---|---|
| Month | Label (e.g., January 2026) |
| Uploads | uploadCount |
| Published | publishedCount |
| Drafts | draftCount |
| Avg/Month | Running average |

### Forms

**DateRangePicker** (filter control)

| Control | Type | Options |
|---|---|---|
| Preset | Button group | 7d, 30d, 90d, 12m |
| Custom from | Date input | — |
| Custom to | Date input | — |

### Modals

| Modal | Trigger | Content |
|---|---|---|
| `ExportOptionsModal` | Export CSV | Format selection (CSV/JSON), date range confirm |

### Navigation

| Source | Destination |
|---|---|
| Sidebar → Analytics | `/analytics` |
| TopMoviesTable row | `/movies/:id` |
| Breadcrumb | Dashboard → Analytics |

### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile | Tabs become dropdown select; charts stack vertically full-width; tables become horizontal scroll or card summaries; stat cards 1-column |
| Tablet | Stat cards 2-column; charts stacked; tables scrollable |
| Desktop | Stat cards 4-column; charts 2-column grid; tables full width |
| Wide | Charts 2×2 grid; TopMoviesTable and upload table side-by-side |

---

## 10. Page: Settings

**Route:** `/settings`  
**Layout:** `AdminLayout`

### Purpose

Admin-only tenant configuration. Manage branding, content policies, AI feature toggles, notification preferences, security policies, and third-party integrations.

### Components

| Component | Description |
|---|---|
| `PageHeader` | Title "Settings" + Save button (global) |
| `SettingsSidebar` | Vertical tab nav for settings groups |
| `SettingsSection` | Content panel for active group |
| `SettingsForm` | Group-specific form fields |
| `ColorPickerField` | Brand color selection with preview |
| `LogoUploadZone` | Tenant logo and favicon upload |
| `ToggleField` | Feature flag switches with descriptions |
| `DangerZone` | Destructive settings (maintenance mode) |
| `IntegrationCard` | Card per integration with status indicator |
| `UnsavedChangesIndicator` | Dot on sidebar tab with dirty fields |
| `SettingsPreview` | Live preview of branding changes |

### Buttons

| Button | Location | Action | Role |
|---|---|---|---|
| Save Changes | PageHeader / section footer | PATCH settings group | Admin |
| Discard | Section footer | Revert unsaved changes | Admin |
| Upload Logo | Branding section | File picker | Admin |
| Upload Favicon | Branding section | File picker | Admin |
| Enable Maintenance Mode | DangerZone | Toggle with confirmation | Admin |
| Test Slack Webhook | Notifications | Send test notification | Admin |
| Reset to Defaults | Section footer | Reset group to defaults | Admin |

### Tables

**IntegrationsTable** (Integrations section)

| Column | Content |
|---|---|
| Service | Name + icon (CDN, Transcoding, Storage, Analytics) |
| Status | Connected / Not configured |
| Last Synced | Timestamp or "—" |
| Actions | Configure button |

### Forms

**GeneralSettingsForm**

| Field | Type | Notes |
|---|---|---|
| Platform Name | Text | Display name |
| Support Email | Email | — |
| Default Language | Select | — |
| Default Timezone | Select | IANA timezones |
| Date Format | Select | — |
| Maintenance Mode | Toggle | DangerZone |

**BrandingSettingsForm**

| Field | Type | Notes |
|---|---|---|
| Logo | File upload | Preview |
| Favicon | File upload | Preview |
| Primary Color | Color picker | Live preview |
| Secondary Color | Color picker | — |
| Custom CSS | Textarea | Admin only; sanitized |

**ContentSettingsForm**

| Field | Type | Notes |
|---|---|---|
| Default Content Rating | Select | — |
| Require QC Approval | Toggle | — |
| Auto Publish on Schedule | Toggle | — |
| Max Upload Size (MB) | Number | — |
| Allowed Video Formats | Multi-select | mp4, mov, mkv |

**AISettingsForm**

| Field | Type | Notes |
|---|---|---|
| AI Enabled | Toggle | Master switch |
| AI Provider | Select | openai, bedrock, azure |
| Auto Generate Metadata | Toggle | On upload |
| Require AI Approval | Toggle | Human-in-the-loop |
| Daily Budget (USD) | Number | Spend cap |
| Content Moderation | Toggle | — |

**NotificationSettingsForm**

| Field | Type | Notes |
|---|---|---|
| Email on Publish | Toggle | — |
| Email on QC Reject | Toggle | — |
| Slack Webhook URL | Password input | Encrypted |
| Alert Recipients | Tag input (emails) | — |

**SecuritySettingsForm**

| Field | Type | Notes |
|---|---|---|
| Session Timeout (min) | Number | 5–1440 |
| Max Login Attempts | Number | — |
| Lockout Duration (min) | Number | — |
| Password Min Length | Number | 8–128 |
| Require MFA | Toggle | — |
| IP Whitelist | Tag input | CIDR ranges |

### Modals

| Modal | Trigger | Content |
|---|---|---|
| `MaintenanceModeModal` | Enable maintenance | Warning + confirm |
| `ResetDefaultsModal` | Reset to defaults | Confirm which group |
| `TestNotificationModal` | Test Slack | Success/failure result |
| `UnsavedChangesModal` | Navigate away | Discard or stay |

### Navigation

| Source | Destination |
|---|---|
| Sidebar → Settings | `/settings` |
| UserMenu → Settings | `/settings` |
| SettingsSidebar tabs | `/settings?group=branding` (etc.) |
| Breadcrumb | Dashboard → Settings → [Group Name] |

### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile | SettingsSidebar becomes horizontal scrollable tabs at top; forms single column; preview below form |
| Tablet | Sidebar collapses to icon + label tabs; two-column form where appropriate |
| Desktop | Fixed left sidebar (200px) + form content area; branding preview side-by-side |
| Wide | Three-column layout for short fields; integration cards 2-column grid |

---

## 11. Page: Profile

**Route:** `/profile`  
**Layout:** `AdminLayout`

### Purpose

Allow any authenticated user to view and manage their own account — personal information, password, and UI preferences. Distinct from admin user management.

### Components

| Component | Description |
|---|---|
| `PageHeader` | Title "My Profile" |
| `ProfileCard` | Avatar, name, email, role badge, member since |
| `AvatarUpload` | Click-to-upload profile picture |
| `ProfileTabs` | Tabs: Personal Info, Security, Preferences |
| `PersonalInfoForm` | Name and display fields |
| `SecurityForm` | Change password section |
| `PreferencesForm` | Locale, timezone, theme |
| `ActivityLog` | Recent personal activity (last 10 actions) |
| `SessionInfo` | Last login time, IP, device |

### Buttons

| Button | Location | Action | Role |
|---|---|---|---|
| Save Profile | Personal Info tab | PATCH profile | All |
| Change Avatar | ProfileCard | Open file picker | All |
| Remove Avatar | ProfileCard | Clear avatar URL | All |
| Change Password | Security tab | Submit password form | All |
| Save Preferences | Preferences tab | PATCH preferences | All |
| View All Activity | ActivityLog header | Navigate to full audit (if permitted) | Admin |

### Tables

**PersonalActivityTable** (embedded, last 10 rows)

| Column | Content |
|---|---|
| Action | Action description |
| Entity | Entity label (link if movie) |
| Date | Relative timestamp |

### Forms

**PersonalInfoForm**

| Field | Type | Required | Notes |
|---|---|---|---|
| First Name | Text | Yes | — |
| Last Name | Text | Yes | — |
| Email | Email | Read-only | Cannot self-change |
| Display Name | Text | No | Auto-computed default |

**SecurityForm (Change Password)**

| Field | Type | Required | Notes |
|---|---|---|---|
| Current Password | Password | Yes | — |
| New Password | Password | Yes | Min 8 chars, complexity rules |
| Confirm Password | Password | Yes | Must match new |

**PreferencesForm**

| Field | Type | Notes |
|---|---|---|
| Language | Select | en, hi, etc. |
| Timezone | Select | IANA timezones |
| Theme | Radio group | Light, Dark, System |
| Email Notifications | Toggle | — |

### Modals

| Modal | Trigger | Content |
|---|---|---|
| `AvatarCropModal` | Avatar upload | Crop to square |
| `PasswordChangedModal` | Password success | "Log in again on other devices" info |

### Navigation

| Source | Destination |
|---|---|
| UserMenu → Profile | `/profile` |
| Activity entity link | `/movies/:id` |
| Breadcrumb | Dashboard → Profile |

### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile | ProfileCard full-width; tabs as accordion; forms single column |
| Tablet | ProfileCard + tabs side layout; two-column form for name fields |
| Desktop | ProfileCard left (280px) + tab content right; activity log below |
| Wide | Same as desktop with activity log in right column |

---

## 12. Page: 404

**Route:** `*` (catch-all)  
**Layout:** `ErrorLayout` (minimal, no sidebar)

### Purpose

Inform users that the requested route does not exist. Provide clear navigation back to the application. Maintains brand consistency without exposing internal navigation to unauthenticated users.

### Components

| Component | Description |
|---|---|
| `ErrorLayout` | Centered minimal layout (no sidebar) |
| `ErrorIllustration` | 404 graphic or branded illustration |
| `ErrorCode` | Large "404" display |
| `ErrorMessage` | "Page not found" heading + description |
| `SearchSuggestion` | Optional: "Were you looking for…?" with links |
| `AuthAwareNav` | Shows Dashboard link if authenticated; Login link if not |

### Buttons

| Button | Type | Action |
|---|---|---|
| Go to Dashboard | Primary | Navigate `/dashboard` (if auth) or `/login` |
| Go Back | Secondary | `history.back()` |
| Contact Support | Link/Ghost | Open support email (from settings) |

### Tables

None.

### Forms

None.

### Modals

None.

### Navigation

| State | Available Links |
|---|---|
| Authenticated | Dashboard, Movies, Go Back |
| Unauthenticated | Login, Go Back |

### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile | Illustration scaled down; text centered; buttons stack vertically full-width |
| Tablet | Centered card layout `max-w-md` |
| Desktop | Centered with larger illustration; optional split layout with illustration left, message right |
| Wide | Same as desktop |

---

## 13. Shared Components Library

Reusable components referenced across multiple pages.

### 13.1 Layout & Navigation

| Component | Used On |
|---|---|
| `AdminLayout` | All authenticated pages |
| `AuthLayout` | Login |
| `ErrorLayout` | 404 |
| `PageHeader` | All authenticated pages |
| `Sidebar` | AdminLayout |
| `TopBar` | AdminLayout |
| `Breadcrumb` | All authenticated pages |
| `Pagination` | Movies, Categories, Users |
| `EmptyState` | All list pages |

### 13.2 Data Display

| Component | Used On |
|---|---|
| `DataTable` | Movies, Categories, Users, Analytics |
| `StatusBadge` | Movies, Users |
| `RoleBadge` | Users |
| `KPICard` | Dashboard, Analytics |
| `PosterThumbnail` | Movies, Dashboard, Analytics |
| `FilterChip` | Movies, Users |
| `ActivityFeedItem` | Dashboard, Profile |

### 13.3 Forms & Input

| Component | Used On |
|---|---|
| `FormField` | All forms |
| `SearchBar` | Movies, Categories, Users |
| `FilterBar` | Movies, Users |
| `TagInput` | Movies, Settings |
| `CategoryMultiSelect` | Movies |
| `FileUploadZone` | Movies, Categories, Profile, Settings |
| `DateRangePicker` | Dashboard, Analytics |
| `ColorPickerField` | Categories, Settings |
| `ToggleField` | Settings, Movies, Categories |

### 13.4 Feedback & Overlays

| Component | Used On |
|---|---|
| `Modal` | All pages with modals |
| `ConfirmDialog` | Delete actions globally |
| `Drawer` | User detail |
| `Toast` | Global |
| `AlertBanner` | Login, forms |
| `Skeleton` | All pages during loading |
| `Spinner` | Buttons, AI generation |

### 13.5 AI Components

| Component | Used On |
|---|---|
| `AIAssistantPanel` | Movie create/edit |
| `AISuggestionCard` | Movie create/edit |
| `AIGeneratingOverlay` | Movie create/edit |

---

## 14. Role-Based UI Visibility Matrix

| UI Element | Admin | Editor | Viewer |
|---|---|---|---|
| Sidebar: Users | ✅ | ❌ | ❌ |
| Sidebar: Settings | ✅ | ❌ | ❌ |
| Add Movie button | ✅ | ✅ | ❌ |
| Edit Movie | ✅ | ✅ | ❌ |
| Delete Movie | ✅ | ❌ | ❌ |
| Publish / Unpublish | ✅ | ❌ | ❌ |
| AI Generate buttons | ✅ | ✅ | ❌ |
| Add Category | ✅ | ✅ | ❌ |
| Delete Category | ✅ | ❌ | ❌ |
| Invite User | ✅ | ❌ | ❌ |
| Analytics: User charts | ✅ | ❌ | ❌ |
| Settings page | ✅ | ❌ | ❌ |
| Profile page | ✅ | ✅ | ✅ |
| Export CSV | ✅ | ✅ | ❌ |
| Bulk actions | ✅ | ❌ | ❌ |

**Viewer experience:** All list and detail pages render in read-only mode — form fields disabled, action buttons hidden, status badges and data visible.

---

## 15. Responsive Breakpoints Summary

| Page | Mobile (`<640px`) | Tablet (`640–1023px`) | Desktop (`≥1024px`) |
|---|---|---|---|
| Login | Full-width card | Centered card | Split layout option |
| Dashboard | Stacked KPIs + charts | 2-col KPIs | 3-col KPIs + side feed |
| Movies List | Card list, filter drawer | Scroll table or 2-col grid | Full table |
| Movie Edit | Accordion tabs, bottom AI sheet | Tabbed + drawer AI | Tabs + sidebar AI |
| Categories | Card list, full-screen modals | Scroll table / tree | Table or tree |
| Users | Card list, full-screen drawer | Reduced table | Full table + drawer |
| Analytics | Stacked charts, tab dropdown | 2-col charts | 2×2 chart grid |
| Settings | Top tabs, single column | Icon sidebar tabs | Left sidebar + form |
| Profile | Accordion sections | 2-col name fields | Card + tabs layout |
| 404 | Stacked buttons | Centered card | Centered with illustration |

---

## Appendix A — Page Wireframe Index

| Page | Primary Layout Pattern |
|---|---|
| Login | Centered auth card |
| Dashboard | KPI grid + chart + feed |
| Movies List | Filter bar + data table |
| Movie Edit | Tabbed form + AI sidebar |
| Categories | Table or tree + modals |
| Users | Table + drawer detail |
| Analytics | Tabbed charts + tables |
| Settings | Sidebar nav + section forms |
| Profile | Profile card + tabbed forms |
| 404 | Centered error state |

---

*End of UI Structure Specification*
