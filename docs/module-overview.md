# Module Overview

## App Module

**Purpose:** Root module of the NestJS backend. Wires together every feature module and configures global infrastructure (BullMQ/Redis, rate limiting config, task scheduling).

**Endpoints:**
| Method | Path | Access |
|---|---|---|
| GET | `/` | Public — health check, returns "Hello World!" |
| GET | `/admin-only` | ADMIN only |
| GET | `/staff-only` | STAFF or ADMIN |
| GET | `/customer-only` | CUSTOMER only |

**Design decisions:**
- `lazyConnect: true` on the BullMQ/Redis connection — deliberately prevents the whole app from crashing on boot if Redis is briefly unavailable, prioritizing overall app availability over immediate queue readiness.
- The root controller doubles as an RBAC testbed — three role-gated dummy endpoints exist purely to prove `JwtAuthGuard`/`RolesGuard` work correctly, rather than housing real business logic.

**Known limitations:**

- Role-testbed endpoints (`/admin-only` etc.) are dummy placeholders left in the root controller rather than removed once RBAC was proven working.

---

## Prisma Module

**Purpose:** Global database provider. Wraps `PrismaClient` in an injectable `PrismaService`, manages connect/disconnect lifecycle hooks.

**Endpoints:** None — internal infrastructure only, no controller.

**Design decisions:**
- Uses `@prisma/adapter-pg` — explicit `pg` connection pool passed to Prisma via `PrismaPg`, rather than Prisma's default engine. Gives finer control over pooling.
- Custom Aiven SSL handling in the constructor — strips `sslmode` from `DATABASE_URL` and manually injects a CA cert from `AIVEN_CA_CERT`, working around a `pg` v8+ quirk with `sslmode=require`.

---

## Auth Module

**Purpose:** User identity and session management — registration, login, JWT issuance/verification, profile retrieval, and document-upload tracking for ID verification.

**Endpoints:**
| Method | Path | Access |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public  |
| POST | `/auth/refresh` | Public (requires valid refresh token) |
| POST | `/auth/forgot-password` | Public |
| GET | `/auth/me` | Authenticated |
| PATCH | `/auth/me/documents` | Authenticated |

**Design decisions:**
- Repository pattern via `UserRepository` — keeps `AuthService` focused on business logic (hashing, token signing), not direct Prisma calls.
- `updateDocuments` merges new documents into existing ones (`{ ...existing, ...newDocs }`) rather than overwriting, so partial updates don't wipe previously uploaded files.

**Known limitations:**
- Forgot-password is a mock: generates a reset token and logs it to the console, but there is no real email delivery and no `POST /reset-password` endpoint to actually consume the token and change the password.
- Refresh tokens are stateless — signed/verified mathematically, never stored server-side. No way to forcibly revoke a session (e.g. on logout-everywhere or a stolen device).

---

## Categories Module

**Purpose:** Manages equipment categories. Public read access, Admin-only writes.

**Endpoints:**
| Method | Path | Access |
|---|---|---|
| GET | `/categories` | Public |
| GET | `/categories/:id` | Public |
| POST | `/categories` | ADMIN |
| PATCH | `/categories/:id` | ADMIN |
| DELETE | `/categories/:id` | ADMIN |

**Design decisions:**
- Repository pattern, consistent with the rest of the codebase.
- "Pre-flight" existence checks — `update`/`remove` call `findOne(id)` first, producing a clean 404 instead of a raw Prisma error.

**Known limitations:**
- `findAll()` has no pagination — fine at current scale, would degrade with hundreds of categories

---

## Equipment Module

**Purpose:** Manages the rentable equipment catalog — CRUD, search/filter/pagination, and QR code generation per item.

**Endpoints:**
| Method | Path | Access |
|---|---|---|
| GET | `/equipment` | Public — supports `page`, `limit`, `categoryId`, `name`, `minPrice`, `maxPrice` |
| GET | `/equipment/:id` | Public |
| POST | `/equipment` | ADMIN, STAFF |
| PATCH | `/equipment/:id` | ADMIN, STAFF |
| DELETE | `/equipment/:id` | ADMIN |

**Design decisions:**
- Automatic QR code generation and upload on creation, bridging physical equipment to the digital system.
- `Promise.all` for concurrent `findMany` + `count` in pagination — halves query latency versus sequential calls.

---

## Reservations Module

**Purpose:** The core booking lifecycle — availability checking, reservation creation, status transitions, and detailed return/damage processing.

**Endpoints:**
| Method | Path | Access |
|---|---|---|
| POST | `/reservations` | Authenticated |
| GET | `/reservations/my-reservations` | Authenticated (own only) |
| GET | `/reservations` | ADMIN, STAFF |
| GET | `/reservations/:id` | Authenticated |
| PATCH | `/reservations/:id/cancel` | Authenticated (own only, checked) |
| PATCH | `/reservations/:id/status` | ADMIN, STAFF, WAREHOUSE_OPERATOR |
| PATCH | `/reservations/:id/release` | ADMIN, STAFF, WAREHOUSE_OPERATOR |
| POST | `/reservations/:id/return` | ADMIN, STAFF, WAREHOUSE_OPERATOR |
| DELETE | `/reservations/:id` | ADMIN, STAFF |

**Design decisions:**
- Strict state machine (`validTransitions` map) — prevents illegal jumps like `PENDING → RETURNED`.

**Known limitations:**
- **Race condition / double-booking risk** — the availability check and reservation creation are not wrapped in a locking transaction. Two simultaneous requests for the last unit could both pass the check. *(Already documented as an accepted, explained simplification in `design-decisions.md`.)*

---

## Payments Module

**Purpose:** Tracks mock payment state tied to reservations — no real payment gateway integration, as specified by the assessment brief.

**Endpoints:**
| Method | Path | Access |
|---|---|---|
| POST | `/payments/:reservationId/initiate` | Authenticated |
| PATCH | `/payments/:id/simulate` | Authenticated |
| PATCH | `/payments/:id/refund` | ADMIN, STAFF |

**Design decisions:**
- Decoupled workflow — even after a payment is simulated as `PAID`, the reservation stays `PENDING` until Staff/Admin explicitly approves it. Money moving doesn't auto-confirm a booking; human review is still required.
- Mock-first design — the `simulate` endpoint exists specifically to support frontend/mobile development and testing without needing real gateway integration.

**Known limitations:**
- **No real payment gateway** — by design, per the assessment brief ("Create a mock payment workflow... No real payment gateway required").
- **`initiate` and `simulate` have no `@Roles()` guard and no ownership check.** Any authenticated customer can call `PATCH /payments/:id/simulate` and mark any payment (not just their own) as `PAID`, bypassing intended controls. This should be restricted — at minimum, verify the payment's reservation belongs to the requesting user, or restrict `simulate` to Staff/Admin entirely if it's meant to represent a gateway webhook.

---

## Inventory Module

**Purpose:** Warehouse-side physical stock management — separate from and independent of the booking/reservation lifecycle. Manages stock receipt/release, damage tracking, and maintenance tracking.

**Endpoints:**
| Method | Path | Access |
|---|---|---|
| GET | `/inventory/stock` | ADMIN, STAFF, WAREHOUSE_OPERATOR |
| POST | `/inventory/:id/receive` | ADMIN, STAFF, WAREHOUSE_OPERATOR |
| POST | `/inventory/:id/release` | ADMIN, STAFF, WAREHOUSE_OPERATOR |
| POST | `/inventory/damages` | ADMIN, STAFF, WAREHOUSE_OPERATOR |
| GET | `/inventory/damages` | ADMIN, STAFF, WAREHOUSE_OPERATOR |
| PATCH | `/inventory/damages/:id/status` | ADMIN, STAFF, WAREHOUSE_OPERATOR |
| POST | `/inventory/maintenance` | ADMIN, STAFF, WAREHOUSE_OPERATOR |
| GET | `/inventory/maintenance` | ADMIN, STAFF, WAREHOUSE_OPERATOR |
| PATCH | `/inventory/maintenance/:id/status` | ADMIN, STAFF, WAREHOUSE_OPERATOR |

**Design decisions:**
- Atomic transactions (`$transaction`) wrap record creation + stock deduction together for damage/maintenance — guarantees an item is instantly pulled from the rentable pool, no race window where a customer could book a broken item.
- Clean separation between physical stock (this module) and booking demand (Reservations/Equipment modules) — `stockQuantity` represents current physical reality; the overlap query in Equipment subtracts active bookings from it independently.

---

## Notifications Module

**Purpose:** In-app alerts for reservation/status events, processed asynchronously via a Redis-backed queue, plus a daily scheduled reminder job.

**Endpoints:**
| Method | Path | Access |
|---|---|---|
| GET | `/notifications/my-notifications` | Authenticated |
| PATCH | `/notifications/:id/read` | Authenticated |
| PATCH | `/notifications/read-all` | Authenticated |

**Design decisions:**
- Asynchronous queueing via BullMQ — `queueNotification` pushes a job to Redis rather than writing directly to the database; a separate `NotificationsProcessor` consumes and persists it. Keeps the triggering request (e.g. approving a reservation) fast regardless of notification-processing time.
- Daily cron job (`EVERY_DAY_AT_9AM`) queries for `ACTIVE` reservations ending the next day and queues reminders automatically.
- Circular dependency between Reservations (triggers notifications) and the Scheduler (queries reservations) is resolved cleanly via `forwardRef()`.

**Known limitations:**
- Notifications are plain text strings only — no structured payload (type, related entity ID) for the frontend to deep-link or render differently by category.

---

## Uploads Module

**Purpose:** Handles file storage to Cloudflare R2 — ID documents, rental agreements, equipment images, and internally-generated QR codes.

**Endpoints:**
| Method | Path | Access |
|---|---|---|
| POST | `/uploads` | Authenticated — multipart file + `type` |
| GET | `/uploads/my-uploads` | Authenticated (own only) |

**Design decisions:**
- Cloudflare R2 via the S3-compatible AWS SDK — zero egress fees, a cost-effective choice for a platform serving image-heavy traffic.
- `getRequiredEnv()` fail-fast pattern for R2 credentials — the app refuses to boot with a clear error if credentials are missing, rather than failing silently on first upload attempt.
- Internal `uploadQRCode` method allows the Equipment module to reuse the same storage logic without going through an HTTP round-trip.
