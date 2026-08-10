# Client Applications Documentation

The Equipment Rental Platform consists of two main client applications: a **Web Frontend** built with Next.js and a **Mobile App** built with Flutter.

---

## 1. Web Frontend (Next.js)

Located in `frontend/`, this application uses the Next.js App Router paradigm (`src/app/`) to organize its pages. It serves both the end-customers and the administrative staff.

### Core Modules & Pages

#### Authentication & Account
- `/login` — User authentication portal.
- `/register` — New customer onboarding.
- `/settings` — User profile and preference management.

#### Public Catalog & Discovery
- `/search` — Main catalog search and filtering page.
- `/category` — Browse equipment by specific categories.
- `/equipment` — Master equipment listing.
- `/details` — Individual equipment details view (likely dynamic like `/details/[id]`).

#### Booking Flow
- `/checkout` — The cart and reservation confirmation flow, integrating payments.

#### Administrative & Staff Portals
- `/dashboard` — High-level analytics, revenue, and recent activities for Admins/Staff.
- `/reservations` — Comprehensive view of all bookings to manage statuses (Approve, Reject, Complete).
- `/inventory` — Stock management interface.
- `/warehouse` — Dedicated view for warehouse operators handling damages, maintenance, and returns.

---

## 2. Mobile App (Flutter)

Located in `mobile/`, this is a cross-platform application (iOS & Android) designed primarily for customers on the go, with some staff functionality.

### Key Screens (from `lib/screens/`)

#### Authentication
- `login_screen.dart` / `register_screen.dart` — Authentication flows.
- `account_screen.dart` — Profile and document upload management.

#### Catalog & Shopping
- `main_screen.dart` — The home dashboard for the mobile user.
- `equipment_list_screen.dart` — Browsing the rental catalog.
- `equipment_detail_screen.dart` — Deep dive into specific equipment specs.
- `cart_screen.dart` — Managing items before checkout.

#### Bookings & Checkout
- `checkout_screen.dart` — Finalizing the booking and payment.
- `create_reservation_screen.dart` — Explicit reservation creation flow.
- `my_reservations_screen.dart` — Customer's booking history and active rentals.
- `reservation_Item_screen.dart` — Detailed view of a specific reserved item.

#### Specialized Features
- `notifications_screen.dart` — In-app notification center.
- `qr_scanner_screen.dart` — Used for quickly scanning equipment QR codes to view details or process warehouse operations (check-in/check-out).
- `staff_reservations_screen.dart` — A specialized screen allowing staff members to manage bookings directly from their mobile devices.