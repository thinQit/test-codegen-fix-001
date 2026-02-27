# Task Manager (test-codegen-fix-001)

A simple task manager web application with user authentication, task CRUD, and a dashboard summary.

## Features
- User registration and login with JWT-based authentication
- Create, view, update, and delete tasks
- Task ownership enforcement per user
- Dashboard summary with task counts and upcoming/overdue tasks
- Responsive UI with Tailwind CSS
- Testing setup for unit, integration, and E2E tests

## Tech Stack
- Next.js 14 (App Router)
- React 18 + TypeScript
- Prisma ORM + SQLite (dev)
- Tailwind CSS
- Jest + Testing Library
- Playwright

## Prerequisites
- Node.js 18+
- npm

## Quick Start
```bash
./install.sh
# or on Windows
./install.ps1
```

Then run:
```bash
npm run dev
```

## Environment Variables
- `DATABASE_URL` - SQLite database URL
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_API_URL` - Base URL for API requests

Example:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-min-32-chars-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Project Structure
```
src/
  app/               # App Router pages and layouts
  app/api/           # REST API route handlers
  components/        # Reusable UI components
  lib/               # Utilities and shared logic
  providers/         # Context providers
  types/             # Shared TypeScript types
prisma/              # Prisma schema and migrations
public/              # Static assets
```

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login and receive JWT
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Task details
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id` - Partial update
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/dashboard/summary` - Dashboard summary

## Available Scripts
- `npm run dev` - Start dev server
- `npm run build` - Build for production (includes Prisma generate)
- `npm run start` - Start production server
- `npm run lint` - Lint
- `npm run test` - Run tests
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage report

## Testing
- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/`

Run all tests:
```bash
npm run test
```

Run E2E tests:
```bash
npx playwright test
```
