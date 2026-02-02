# Dakflo — Field Sample Collection & Lab Review (Next.js)

Dakflo is a role-based clinical sample collection and lab review web app built with Next.js. It helps field collectors capture samples and patient data, lets lab technicians review and approve samples, and provides administrators with user and system management tools.

Highlights:
- Clean, role-driven UI (Admin, Field Collector, Lab Tech, Patient, External Expert)
- Authentication & session management via NextAuth
- MongoDB-backed models for patients, users and sample collections
- Modular API routes for field collection, lab review, and patient results

Demo-ready features
- Register and manage users (seed script included)
- Collect samples, upload files, and list collections
- Lab review workflows with approvals and status tracking

## Key Concepts & Roles
- Admin: manage users and system settings.
- Field Collector: create patient records, collect samples, upload files.
- Lab Tech: review, approve, or reject submitted samples.
- Patient: view personal results and profile.
- External Expert: view or annotate samples (read-only or limited access).

## Tech Stack
- Framework: Next.js (App Router)
- Auth: NextAuth
- Database: MongoDB (connection helper in [lib/mongodb.ts](lib/mongodb.ts))
- Language: TypeScript

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file (see required variables below)

3. Run development server

```bash
npm run dev
# Open http://localhost:3000
```

4. Seed example users (optional)

```bash
node scripts/seed-users.js
```

## Important Environment Variables
Create a `.env` file at the project root and set at minimum:

- `MONGODB_URI` — MongoDB connection string
- `NEXTAUTH_SECRET` — a long random string for NextAuth
- `NEXTAUTH_URL` — base URL (e.g. `http://localhost:3000`)

Other environment variables may be required depending on your auth/provider setup.

## Scripts
- `npm run dev` — start dev server
- `npm run build` — build for production
- `npm run start` — run production server

## Project Structure (high level)
- [app](app) — Next.js App Router pages and layouts
- [api](app/api) — serverless API routes (auth, admin, field_collector, lab_tech, patient)
- [components](components) — UI components organized by role
- [lib](lib) — helpers and database connection ([lib/mongodb.ts](lib/mongodb.ts))
- [models](models) — Mongoose/ODM schemas for `user`, `patient`, `sampleCollection`
- [scripts/seed-users.js](scripts/seed-users.js) — simple seed utility

## Authentication & Authorization
Authentication is handled via NextAuth with session-based access. Role checks are performed on server API routes and client components to show/hide features based on the user's role.

## APIs & Data Flow (overview)
- Field collectors POST samples to `/api/field_collector/sample-collection` routes, including file uploads where applicable.
- Lab techs review samples via `/api/lab_tech/review-sample` endpoints.
- Admin endpoints exist under `/api/admin/*` for user management.

Refer to the `app/api` tree for exact route names and implementations.

## Deployment
This app works well on Vercel and other Node.js platforms. For production:

```bash
npm run build
npm run start
```

Make sure your production environment sets `MONGODB_URI` and `NEXTAUTH_SECRET`.

## Contributing
Found an issue or want to add a feature? Open an issue or submit a PR. Keep changes minimal, document behavior, and add tests when applicable.

## Where to look in the code
- Entry UI: [app/page.tsx](app/page.tsx)
- Admin pages: [app/admin](app/admin)
- Field collector pages: [app/field_collector](app/field_collector)
- Lab tech pages: [app/lab_tech](app/lab_tech)
- Auth provider: [providers/AuthProvider.tsx](providers/AuthProvider.tsx)

## License & Contact
This repository does not include an explicit license file. Add `LICENSE` if you want to make reuse terms clear.

Questions or want help extending Dakflo? Open an issue in the repository.

---
Updated README for clarity, developer onboarding, and role-focused feature explanation.
