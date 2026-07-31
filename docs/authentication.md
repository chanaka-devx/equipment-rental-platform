# Authentication & Authorization

This document describes the authentication and role-based access control (RBAC) system implemented in the backend.

---

## Overview

Authentication is handled using **JWT (JSON Web Tokens)** with a dual-token strategy:
- A short-lived **access token** used to authorize API requests
- A longer-lived **refresh token** used to obtain a new access token without re-entering credentials

Role-based access is enforced via a custom `@Roles()` decorator and `RolesGuard`, checked on every protected route.

---

## Roles

| Role | Description |
|---|---|
| `ADMIN` | Full system access — user management, reporting, all CRUD operations |
| `STAFF` | Approves/rejects reservations, updates reservation status |
| `CUSTOMER` | Browses equipment, makes reservations, views own history |
| `WAREHOUSE_OPERATOR` | Manages inventory — receive/release equipment, record damage/maintenance |

Roles are stored on the `User` model (`role` column, backed by a Postgres enum) and included in the JWT payload at login.

---

## Endpoints

### `POST /auth/register`
Creates a new user account with the `CUSTOMER` role by default.

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "jane@example.com",
  "role": "CUSTOMER"
}
```
Passwords are hashed with bcrypt (cost factor 10) before being stored — the plain-text password is never persisted or returned.

---

### `POST /auth/login`
Authenticates a user and issues both tokens.

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

Invalid email and invalid password both return the same generic `401 Invalid credentials` response, to avoid revealing which emails are registered in the system.

---

### `POST /auth/refresh`
Issues a new access token given a valid, unexpired refresh token.

**Request body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response:**
```json
{
  "accessToken": "eyJ..."
}
```

---

### `POST /auth/forgot-password`
Initiates a password reset. Email delivery is **mocked by design** for this assessment — no real email is sent; instead, the reset link is logged to the server console.

**Request body:**
```json
{
  "email": "jane@example.com"
}
```

**Response (always the same, regardless of whether the email exists):**
```json
{
  "message": "If that email exists, a reset link was sent."
}
```
This response is intentionally identical whether or not the email is registered, to prevent user enumeration.

---

## Token Details

| Token | Secret | Expiry | Purpose |
|---|---|---|---|
| Access Token | `JWT_ACCESS_SECRET` | 15 minutes | Sent as `Authorization: Bearer <token>` on every protected request |
| Refresh Token | `JWT_REFRESH_SECRET` | 7 days | Used only to request a new access token via `/auth/refresh` |

Using separate secrets per token type means a compromised access token secret does not also compromise refresh tokens, and vice versa.

**Access token payload:**
```json
{
  "sub": "user-uuid",
  "role": "CUSTOMER",
  "iat": 1234567890,
  "exp": 1234568790
}
```

---

## Protecting Routes

Routes are protected using two guards stacked together:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@Delete(':id')
deleteEquipment(@Param('id') id: string) { ... }
```

- **`JwtAuthGuard`** — verifies the access token is present and valid; populates `req.user` with `{ userId, role }`.
- **`RolesGuard`** — reads the roles listed in `@Roles(...)` and compares against `req.user.role`; rejects with `403 Forbidden` if the user's role isn't included.

Routes with no `@Roles()` decorator are accessible to any authenticated user (still requires a valid token via `JwtAuthGuard`). Public routes (register, login, forgot-password) skip both guards entirely.

---

## Security Measures Implemented

| Requirement | Implementation |
|---|---|
| Password Hashing | bcrypt, cost factor 10 |
| JWT Authentication | Signed access + refresh tokens, verified on every protected request |
| RBAC | Custom decorator + guard checking role against JWT payload |
| Input Validation | `class-validator` DTOs + global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`) |
| SQL Injection Prevention | Prisma parameterizes all queries by default; no raw SQL used in auth flows |
| Rate Limiting | `@nestjs/throttler` applied globally, with stricter limits on `/auth/login` to slow brute-force attempts |
| No credential leakage | Generic error messages on login/forgot-password prevent user enumeration |

---

## Seed Users (Development/Testing Only)

The seed script (`prisma/seed.ts`) creates one account per role for local testing:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@test.com` | `Password123!` |
| Staff | `staff@test.com` | `Password123!` |
| Warehouse Operator | `warehouse@test.com` | `Password123!` |
| Customer | `customer@test.com` | `Password123!` |

Run with:
```bash
npx prisma db seed
```

**Note:** these are development-only credentials for demonstration and testing purposes, not intended for any production deployment.

---

## Known Simplifications

- **Forgot password** logs the reset link to the console instead of sending a real email, since no SMTP provider was required by the assessment scope.
- **Refresh token revocation** is not implemented (e.g. no server-side blacklist on logout) — a refresh token remains valid until it naturally expires. A production system would store issued refresh tokens (or their hashes) and invalidate them on logout or password change.