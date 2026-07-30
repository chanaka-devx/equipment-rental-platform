# Design Decisions

This document records key architectural and design decisions made during development, along with the reasoning behind them. It exists so decisions made under time pressure don't have to be reconstructed from memory when writing the final README.

---

## Technology Stack

| Layer    | Choice               | Reasoning                                                                                                                                                                                                 |
| ----------| ----------------------| -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Backend  | NestJS               | Native module/DI/Guard system directly satisfies "Clean Architecture, SOLID, Repository Pattern" requirements from the assessment rubric, without needing to hand-roll structure on top of plain Express. |
| ORM      | Prisma               | Fast schema iteration, generates type-safe queries, migrations double as the "Database Script" deliverable.                                                                                               |
| Frontend | Next.js + TypeScript | Required by assessment; component reuse and routing well suited to role-based dashboards.                                                                                                                 |
| Queue    | BullMQ + Redis       | Simpler to stand up solo, satisfies the "asynchronous processing" requirement for notifications.                                                                                                          |
| Storage  | Cloudflare R2        | S3-compatible API without AWS account/billing friction.                                                                                                                                                   |
| Mobile   | Flutter              | Required by assessment.                                                                                                                                                                                   |

---

## Equipment Availability Strategy

**Decision:** Availability is determined by checking date-range overlaps against existing `ReservationItem` records (via their parent `Reservation.status`), rather than by maintaining a live-decrementing stock counter on the `Equipment` table.

**How it works:**
- `Equipment.stockQuantity` is a **static total** — how many units of this item are owned. It is never incremented or decremented by reservation activity.
- When checking availability for a date range, the system sums the `quantity` of all `ReservationItem` rows for that equipment where the parent `Reservation.status` is `PENDING`, `APPROVED`, or `ACTIVE`, and where the reservation's date range overlaps the requested range.
- Overlap condition: `existing.startDate <= requested.endDate AND existing.endDate >= requested.startDate`
- Available quantity = `stockQuantity - overlappingBookedQuantity`

**Why this approach instead of a simple counter:**
A simple "decrement on approve, increment on return" counter cannot correctly handle two customers booking the same physical item for non-overlapping date ranges (e.g. Jan 1–5 and Jan 10–15 for the same drone) — a counter would incorrectly treat the item as unavailable for the whole month after the first booking. The overlap-query approach treats `reservation_items` + `reservations` as the source of truth, so availability is always calculated correctly per date range, and cancelling/returning a reservation requires **no additional code** to "give back" stock — it's implicit in the query, since a cancelled/returned reservation's status simply falls outside the blocking set.

**Known limitation:** This check-then-create flow is not currently wrapped in a database-level transaction lock. In a high-concurrency scenario, two customers could theoretically both pass the availability check for the last unit before either reservation commits. Acceptable for this assessment's scope; noted here as a known simplification rather than an oversight. A production fix would use a `SELECT ... FOR UPDATE` row lock or a Prisma `$transaction` with serializable isolation around the check-and-create.

---

## Equipment.available Field

**Decision:** The `available` boolean on `Equipment` is **not** used to represent booking availability (that's handled entirely by the date-overlap query described above). It is reserved as an admin-only override — e.g. marking an item temporarily out of service for maintenance or repair — independent of date-based booking status. An item can have `available = true` but still show as booked for specific dates via the overlap query, and vice versa: `available = false` overrides booking entirely regardless of date-range availability, since it's out of service.

This distinction is documented here specifically to avoid the field being misread as a live booking-availability flag, which would contradict the overlap-based strategy.

---

## ReservationItem Historical Retention

**Decision:** `ReservationItem` rows are never deleted, including after the associated equipment is returned or the reservation is cancelled.

**Reasoning:** These rows serve as the permanent historical record needed for:
- Customer-facing reservation history
- Admin dashboard metrics (equipment utilization, most-rented equipment, revenue)
- Activity log cross-referencing

Current availability is derived from active-status reservations only (see above); historical rows from completed/cancelled reservations are simply excluded from that calculation, not deleted from the table.

---

## Indexing Strategy

| Table | Index | Purpose |
|---|---|---|
| `equipment` | `category_id` | Speeds up filtering equipment by category |
| `reservations` | `user_id` | Speeds up "my reservations" / customer history lookups |
| `reservations` | `status` | Speeds up staff dashboards filtering by reservation status |
| `reservations` | `start_date, end_date` (composite) | Speeds up the date-overlap availability query, which is the most frequently run query in the system |
| `reservation_items` | `reservation_id` | Speeds up joins back to parent reservation |
| `reservation_items` | `equipment_id` | Speeds up the availability overlap query and per-equipment history lookups |
| `notifications` | `user_id` | Speeds up per-user notification fetch |
| `uploads` | `user_id` | Speeds up per-user document lookup |
| `activity_logs` | `user_id` | Speeds up audit trail queries per user |

Indexes are intentionally not shown on the ER diagram itself (ER diagrams represent structure/relationships, not performance tuning) — they're documented here instead, alongside the reasoning for each.

---

## Database Constraints

- All status fields (`role`, `reservation.status`, `payment.status`) use native Postgres/Prisma enums rather than free-text strings, preventing invalid values at the database level.
- Foreign keys enforce referential integrity across all relationship tables (`equipment→category`, `reservation→user`, `reservation_item→reservation/equipment`, `payment→reservation`, etc.).
- Decimal fields (`rentalPrice`, `deposit`, `amount`, `unitPrice`) use explicit `@db.Decimal(12,2)` precision rather than default precision, appropriate for currency values.

---

## Architecture Pattern (Backend)

Every backend module follows a consistent layered structure:

```
Controller  →  Service  →  Repository  →  Prisma  →  PostgreSQL
```

- **Controller**: routing, `@Roles()` guards, DTO validation only — no business logic or direct database access.
- **Service**: business rules and state transitions (e.g. valid reservation status transitions, availability checks).
- **Repository**: the only layer that calls Prisma directly — isolates the ORM from business logic (Repository Pattern).
- Cross-cutting concerns (activity logging via interceptors, global exception filters, rate limiting) wrap around this stack rather than living inside any individual module.

---