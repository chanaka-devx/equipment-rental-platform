# Equipment Rental Platform (RentForge)

A full-stack platform designed to allow customers to easily rent professional equipment while providing robust tools for staff to manage inventory, reservations, and warehouse operations.

## Project Overview

The system is broken down into three main applications supported by a unified backend API:

*   **Backend** (`/backend`): A scalable REST API built with NestJS. Handles business logic, role-based access control (Admin, Staff, Customer), inventory tracking, reservation lifecycles, and background jobs.
*   **Web Dashboard** (`/frontend`): A Next.js web application serving as the back-office management tool. Features dedicated interfaces for managing inventory, tracking reservations, and handling warehouse returns and damages.
*   **Mobile App** (`/mobile`): A cross-platform Flutter application named **RentForge**. This is the primary customer-facing portal where users can browse the equipment catalog, manage their shopping cart, place reservations, and view their order history.

## Tech Stack

**Backend:**
*   **Framework:** [NestJS](https://nestjs.com/)
*   **Database:** PostgreSQL with [Prisma ORM](https://www.prisma.io/)
*   **Caching / Queues:** Redis & [BullMQ](https://docs.bullmq.io/)
*   **Authentication:** JWT with Role-Based Access Control (RBAC)

**Frontend (Web):**
*   **Framework:** [Next.js](https://nextjs.org/) (React)
*   **Styling:** Tailwind CSS

**Frontend (Mobile):**
*   **Framework:** [Flutter](https://flutter.dev/) (Dart)

## Repository Structure

```text
equipment-rental-platform/
├── backend/            # NestJS API source code
├── frontend/           # Next.js web dashboard
├── mobile/             # Flutter mobile application
├── docs/               # System architecture and design documentation
├── bruno-collection/   # Bruno API testing collections (with environment vars)
└── docker-compose.yml  # Docker configuration for local services (Postgres, Redis)
```

## Documentation

For an in-depth look at how this platform operates under the hood, please refer to the markdown files in the `/docs` directory:
*   `ERD.md` & `ERD.png`: Database schema and Entity Relationship Diagrams.
*   `module-overview.md`: Detailed breakdown of backend NestJS modules.
*   `authentication.md`: Auth flow and security decisions.
*   `client-application.md`: Overview of the frontend and mobile app routing/structure.
*   `design-decisions.md`: Key architectural decisions made during development.

## Local Development Setup

To run this platform locally, follow these steps:

### 1. Start Infrastructure
Run the required services (PostgreSQL and Redis) using Docker:
```bash
docker-compose up -d
```

### 2. Run Backend (NestJS)
```bash
cd backend
npm install
cp .env.example .env    # Configure your environment variables
npx prisma migrate dev  # Initialize the database
npm run start:dev
```


### 3. Run Web Dashboard (Next.js)
```bash
cd frontend
npm install
cp .env.example .env 
npm run dev
```

### 4. Run Mobile App (Flutter)
```bash
cd mobile
flutter pub get
flutter run
```

## API Testing

This repository includes a [Bruno](https://www.usebruno.com/) collection (`/bruno-collection`) which contains requests for testing all API endpoints. 

To use the collection:
1. Open Bruno and choose **Open Collection**.
2. Select the `bruno-collection` directory.
3. Select the `Local` environment (which provides the `{{base_url}}`).
4. Ensure you generate an `access_token` via the `/auth/login` endpoint to successfully hit protected routes.
