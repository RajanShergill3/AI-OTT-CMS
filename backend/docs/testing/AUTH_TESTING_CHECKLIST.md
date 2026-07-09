# Authentication — Testing Checklist

Manual verification checklist for Milestone M1 authentication APIs.

| Field | Value |
|---|---|
| **Base URL** | `http://localhost:5000/api/v1` |
| **Swagger UI** | `http://localhost:5000/api/docs` |
| **Postman** | `postman/collections/AI-OTT-CMS-Auth.postman_collection.json` |
| **Seeded admin** | `admin@aiottcms.com` / `Admin@123` |

---

## Prerequisites

- [ ] MongoDB is running and reachable at `MONGODB_URI`
- [ ] `.env` is configured (copy from `.env.example`)
- [ ] Dependencies installed: `npm install`
- [ ] Server running: `npm run dev`
- [ ] Admin seeded: `npm run seed`
- [ ] Postman collection imported (optional)
- [ ] API docs available at `/api/docs`

---

## 1. Registration

### 1.1 Successful registration

**Request**

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Editor",
  "email": "editor@ottcms.com",
  "password": "SecurePass123!",
  "role": "EDITOR"
}
```

| Check | Expected |
|---|---|
| [ ] HTTP status | `201 Created` |
| [ ] `success` | `true` |
| [ ] `message` | `"Registration successful"` |
| [ ] `data.accessToken` | Non-empty JWT string |
| [ ] `data.expiresIn` | Positive integer (seconds, e.g. `900`) |
| [ ] `data.tokenType` | `"Bearer"` |
| [ ] `data.user.email` | `editor@ottcms.com` |
| [ ] `data.user.role` | `"editor"` (lowercase in response) |
| [ ] `Set-Cookie` header | `refreshToken` HttpOnly cookie present |
| [ ] Password not in response | No `password` field in body |

### 1.2 Registration — default role

Register without `role` field.

| Check | Expected |
|---|---|
| [ ] `data.user.role` | `"viewer"` (default `VIEWER`) |

### 1.3 Registration — duplicate email

Repeat registration with the same email.

| Check | Expected |
|---|---|
| [ ] HTTP status | `409 Conflict` |
| [ ] `success` | `false` |
| [ ] `error.code` | `DUPLICATE_EMAIL` |
| [ ] `error.message` | `"Email already registered"` |
| [ ] `meta.timestamp` | ISO 8601 string present |

### 1.4 Registration — validation errors

| Test case | Expected |
|---|---|
| [ ] Missing `email` | `400`, `VALIDATION_ERROR`, details include `email` |
| [ ] Invalid email format | `400`, `VALIDATION_ERROR` |
| [ ] Password &lt; 8 characters | `400`, `VALIDATION_ERROR` |
| [ ] Missing `firstName` | `400`, `VALIDATION_ERROR` |
| [ ] Invalid `role` value | `400`, `VALIDATION_ERROR` |

---

## 2. Login

### 2.1 Successful login (seeded admin)

**Request**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@aiottcms.com",
  "password": "Admin@123"
}
```

| Check | Expected |
|---|---|
| [ ] HTTP status | `200 OK` |
| [ ] `success` | `true` |
| [ ] `message` | `"Login successful"` |
| [ ] `data.accessToken` | Valid JWT returned |
| [ ] `data.user.role` | `"admin"` |
| [ ] `Set-Cookie` | `refreshToken` cookie set |
| [ ] `data.user.lastLogin` | Not in login response (profile has `lastLogin`) |

### 2.2 Login — invalid credentials

| Test case | Expected |
|---|---|
| [ ] Wrong password | `401`, `INVALID_CREDENTIALS`, `"Invalid email or password"` |
| [ ] Unknown email | `401`, `INVALID_CREDENTIALS` (same message — no user enumeration) |
| [ ] Empty body | `400`, `VALIDATION_ERROR` |

### 2.3 Login — inactive user

Deactivate a user in MongoDB (`isActive: false`), then attempt login.

| Check | Expected |
|---|---|
| [ ] HTTP status | `403 Forbidden` |
| [ ] `error.code` | `ACCOUNT_INACTIVE` |
| [ ] `error.message` | Account deactivated message |

---

## 3. JWT Access Token

### 3.1 Token structure

Decode access token at [jwt.io](https://jwt.io) or via CLI.

| Check | Expected |
|---|---|
| [ ] Algorithm | `HS256` |
| [ ] `sub` | User MongoDB `_id` |
| [ ] `email` | User email |
| [ ] `role` | `ADMIN`, `EDITOR`, or `VIEWER` |
| [ ] `type` | `"access"` |
| [ ] `iss` | `ai-ott-cms` |
| [ ] `aud` | `ai-ott-cms-api` |
| [ ] `exp` − `iat` | Matches `JWT_EXPIRES_IN` (e.g. 900s for `15m`) |

### 3.2 Token usage

| Check | Expected |
|---|---|
| [ ] `Authorization: Bearer <token>` on `/auth/profile` | `200 OK` |
| [ ] Missing `Authorization` header | `401`, `UNAUTHORIZED` |
| [ ] Malformed header (no `Bearer`) | `401`, `UNAUTHORIZED` |
| [ ] Tampered token (edit payload) | `401`, `INVALID_TOKEN` |
| [ ] Expired token (wait or manually expire) | `401`, `TOKEN_EXPIRED` |
| [ ] Refresh token used as access token | `401`, `INVALID_TOKEN` |

---

## 4. Refresh Token

### 4.1 Refresh via request body

**Request** (use `refreshToken` from login `Set-Cookie` or Postman variable)

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

| Check | Expected |
|---|---|
| [ ] HTTP status | `200 OK` |
| [ ] `success` | `true` |
| [ ] `message` | `"Token refreshed successfully"` |
| [ ] `data.accessToken` | New JWT (different from previous) |
| [ ] `data.expiresIn` | Positive integer |
| [ ] `data.tokenType` | `"Bearer"` |
| [ ] `Set-Cookie` | New `refreshToken` cookie (rotation) |
| [ ] New access token works on `/auth/profile` | `200 OK` |

### 4.2 Refresh via cookie

Send `POST /auth/refresh` with empty body `{}` and `refreshToken` cookie from login.

| Check | Expected |
|---|---|
| [ ] HTTP status | `200 OK` |
| [ ] New tokens issued | Same as body flow |

### 4.3 Refresh — error cases

| Test case | Expected |
|---|---|
| [ ] No cookie and no body token | `401`, `INVALID_REFRESH_TOKEN` |
| [ ] Invalid refresh token string | `401`, `INVALID_REFRESH_TOKEN` |
| [ ] Expired refresh token | `401`, `TOKEN_EXPIRED` |
| [ ] Inactive user | `403`, `ACCOUNT_INACTIVE` |

### 4.4 Refresh token payload

| Check | Expected |
|---|---|
| [ ] `type` claim | `"refresh"` |
| [ ] `sub` | User ID |
| [ ] No `email`/`role` in refresh payload | Minimal claims (user ID only) |

---

## 5. Protected APIs

### 5.1 GET `/auth/profile`

```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

| Check | Expected |
|---|---|
| [ ] HTTP status | `200 OK` |
| [ ] `success` | `true` |
| [ ] `data.id` | Matches JWT `sub` |
| [ ] `data.email` | User email |
| [ ] `data.firstName`, `data.lastName` | Present |
| [ ] `data.displayName` | `firstName + lastName` |
| [ ] `data.role` | Lowercase role string |
| [ ] `data.isActive` | `true` for active users |
| [ ] `data.createdAt`, `data.updatedAt` | ISO 8601 dates |
| [ ] No `password` in response | Absent |

### 5.2 POST `/auth/logout`

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{}
```

| Check | Expected |
|---|---|
| [ ] HTTP status | `204 No Content` |
| [ ] Response body | Empty |
| [ ] `Set-Cookie` | `refreshToken` cleared/expired |
| [ ] Without `Authorization` | `401`, `UNAUTHORIZED` |

### 5.3 Protected route without token

| Endpoint | Expected |
|---|---|
| [ ] `GET /auth/profile` (no header) | `401`, `UNAUTHORIZED` |
| [ ] `POST /auth/logout` (no header) | `401`, `UNAUTHORIZED` |

---

## 6. Role Permissions

Auth routes (`/profile`, `/logout`) require authentication only — all roles (`ADMIN`, `EDITOR`, `VIEWER`) are allowed.

### 6.1 Role access on protected auth endpoints

| Role | `/auth/profile` | `/auth/logout` |
|---|---|---|
| [ ] `ADMIN` | `200` | `204` |
| [ ] `EDITOR` | `200` | `204` |
| [ ] `VIEWER` | `200` | `204` |

### 6.2 RBAC middleware (`requireRole` / `requireAnyRole`)

When role-restricted routes are added, verify:

| Test case | Expected |
|---|---|
| [ ] `requireRole('ADMIN')` with ADMIN token | `200` / success |
| [ ] `requireRole('ADMIN')` with EDITOR token | `403`, `FORBIDDEN` |
| [ ] `requireAnyRole('ADMIN','EDITOR')` with VIEWER | `403`, `FORBIDDEN` |
| [ ] RBAC without prior `authenticate` | `401`, `UNAUTHORIZED` |

### 6.3 JWT role claim matches database

| Check | Expected |
|---|---|
| [ ] Token `role` matches user document `role` | Same value (case may differ in API response) |

---

## 7. Password Hashing

### 7.1 MongoDB document inspection

```javascript
// MongoDB shell or Compass
db.users.findOne({ email: "admin@aiottcms.com" })
```

| Check | Expected |
|---|---|
| [ ] `password` field exists in DB | Yes (when using `+password` in query) |
| [ ] Password format | bcrypt hash (`$2b$12$...`) |
| [ ] Plaintext not stored | `Admin@123` is NOT the stored value |
| [ ] Same password → different hashes | N/A on update; hashes differ per user/salt |

### 7.2 API response exclusion

| Check | Expected |
|---|---|
| [ ] Register/login/profile responses | No `password` field |
| [ ] Default `User.find()` queries | Password not returned (`select: false`) |

### 7.3 Password verification

| Check | Expected |
|---|---|
| [ ] Login with correct password | Success |
| [ ] Login with wrong password | `401`, `INVALID_CREDENTIALS` |
| [ ] `comparePassword()` uses bcrypt | Wrong password never matches hash |

---

## 8. MongoDB Records

### 8.1 User document after registration

| Field | Expected |
|---|---|
| [ ] `_id` | ObjectId generated |
| [ ] `firstName`, `lastName` | Trimmed strings |
| [ ] `email` | Lowercase |
| [ ] `role` | `ADMIN`, `EDITOR`, or `VIEWER` |
| [ ] `isActive` | `true` (default) |
| [ ] `profileImage` | `null` (default) |
| [ ] `lastLogin` | `null` until first login |
| [ ] `createdAt`, `updatedAt` | Auto timestamps |
| [ ] Unique email index | Duplicate insert rejected |

### 8.2 User document after login

| Check | Expected |
|---|---|
| [ ] `lastLogin` | Updated to recent timestamp |
| [ ] `updatedAt` | Updated |

### 8.3 Admin seed

| Check | Expected |
|---|---|
| [ ] `npm run seed` (first run) | Admin user created |
| [ ] `npm run seed` (second run) | Skipped — no duplicate |
| [ ] Seeded email | `admin@aiottcms.com` |
| [ ] Seeded role | `ADMIN` |

### 8.4 Indexes

```javascript
db.users.getIndexes()
```

| Check | Expected |
|---|---|
| [ ] `idx_users_email` | Unique index on `email` |
| [ ] `idx_users_role` | Present |
| [ ] `idx_users_is_active` | Present |

---

## 9. Error Cases — Summary

| Scenario | Status | `error.code` |
|---|---|---|
| [ ] Validation failure | `400` | `VALIDATION_ERROR` |
| [ ] Invalid credentials | `401` | `INVALID_CREDENTIALS` |
| [ ] Missing access token | `401` | `UNAUTHORIZED` |
| [ ] Invalid access token | `401` | `INVALID_TOKEN` |
| [ ] Expired access token | `401` | `TOKEN_EXPIRED` |
| [ ] Missing/invalid refresh token | `401` | `INVALID_REFRESH_TOKEN` |
| [ ] Expired refresh token | `401` | `TOKEN_EXPIRED` |
| [ ] Inactive account | `403` | `ACCOUNT_INACTIVE` |
| [ ] Insufficient role | `403` | `FORBIDDEN` |
| [ ] User not found (profile) | `404` | `NOT_FOUND` |
| [ ] Duplicate email | `409` | `DUPLICATE_EMAIL` |

---

## 10. Expected Responses — Envelope Format

### 10.1 Success response

```json
{
  "success": true,
  "message": "Login successful",
  "data": { }
}
```

| Check | Expected |
|---|---|
| [ ] `success` always `true` | Yes |
| [ ] `data` contains payload | Yes |
| [ ] `message` present on auth endpoints | Yes |

### 10.2 Error response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  },
  "meta": {
    "timestamp": "2026-07-09T10:00:00.000Z"
  }
}
```

| Check | Expected |
|---|---|
| [ ] `success` always `false` | Yes |
| [ ] `error.code` machine-readable | Yes |
| [ ] `error.message` human-readable | Yes |
| [ ] `error.details` on validation errors | Array of `{ field, message }` |
| [ ] `meta.timestamp` on all errors | ISO 8601 |
| [ ] `meta.requestId` when `X-Request-Id` sent | Echoed if provided |

### 10.3 Logout exception

| Check | Expected |
|---|---|
| [ ] `POST /auth/logout` success | `204` with **no JSON body** |

---

## 11. End-to-End Flow

Complete session lifecycle in order:

- [ ] **1.** `npm run seed` — admin exists
- [ ] **2.** `POST /auth/login` — receive tokens
- [ ] **3.** `GET /auth/profile` — profile with access token
- [ ] **4.** `POST /auth/refresh` — new access token
- [ ] **5.** `GET /auth/profile` — works with new token
- [ ] **6.** `POST /auth/logout` — session ended
- [ ] **7.** `POST /auth/refresh` — fails after logout (cookie cleared)
- [ ] **8.** `GET /auth/profile` — fails with old access token after expiry

---

## 12. Tools Quick Reference

| Tool | Command / URL |
|---|---|
| Start server | `npm run dev` |
| Seed admin | `npm run seed` |
| Swagger UI | `http://localhost:5000/api/docs` |
| Health check | `GET http://localhost:5000/api/v1/health` |
| Lint | `npm run lint` |
| Build | `npm run build` |

---

## Sign-off

| Tester | Date | Environment | Result |
|---|---|---|---|
| | | Local / Staging | Pass / Fail |
| | | | |

**Notes:**

---

*Checklist version: M1 Authentication — aligned with `/api/v1/auth` implementation.*
