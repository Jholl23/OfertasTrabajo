# Job Offers Tracker (Scaffold)

A static React + Vite + TypeScript starter for a personal job offers tracker. This scaffold now includes a Supabase client foundation and a secure authentication flow using Supabase Auth.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Supabase JavaScript client (`@supabase/supabase-js`)

## Project Structure

```txt
src/
  app/
  components/
    layout/
  features/
    auth/
    dashboard/
    job-offers/
    import-job/
  hooks/
  lib/
    schemas/
    supabase/
    utils/
  pages/
  types/
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

5. Preview production build:

   ```bash
   npm run preview
   ```

## Environment Variables

Required frontend environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The app validates these variables at startup and fails fast if they are missing.

> Only use the public anon key in frontend code. Never place service role keys or backend-only secrets in Vite environment variables.

## Authentication Flow

- Login page authenticates with Supabase email/password credentials.
- Session is restored on refresh using Supabase auth persistence.
- Protected routes redirect unauthenticated users to `/login`.
- Authenticated users are redirected away from `/login` to `/dashboard`.
- Top navigation includes a logout action and shows active user email.

## Current UI Scope

- Supabase-backed login page
- Route-protected dashboard shell
- Session-aware layout with active user email
- Full job offers CRUD dashboard (list, create, edit, delete)
- Search by title/company/description and status filtering
- CSV export button to download all authenticated user job offers
- Dashboard stats cards plus loading/empty/error states for offers
- Logout action in top navigation

## CSV Export

- The dashboard includes an **Export CSV** button in the offers section.
- Export is generated from the authenticated user's rows only (via Supabase auth + RLS policies).
- The CSV uses human-friendly column names and keeps ISO date fields unchanged.
- Salary columns include `salary_raw`, `salary_min`, and `salary_max`.


## URL Import Edge Function

A Supabase Edge Function is available at `supabase/functions/import-job-from-url` for phase 1 URL-based offer extraction.

What it does:

- Fetches raw HTML from a provided URL (`POST` body: `{ "url": "..." }`).
- Extracts title, meta tags, Open Graph tags, JSON-LD (if available), and visible text summary.
- Normalizes whitespace and infers normalized job fields deterministically.
- Returns `import_confidence` and `requires_review: true` to enforce a frontend review step before any save.

Run locally:

```bash
supabase functions serve import-job-from-url
```

See `supabase/functions/import-job-from-url/README.md` for usage details.

## Progress Notes

### 2026-04-19

- Initialized frontend scaffold with routing and modular folders.
- Added Tailwind CSS base configuration and professional default theme.
- Added placeholder pages and layout components for login and dashboard.
- Prepared feature folders for future incremental implementation.
- Added Supabase client initialization with validated Vite environment variables.
- Implemented Supabase Auth flow (login, session restore, logout).
- Added modular auth provider/hooks and route guards for protected pages.
- Updated layout and navigation to reflect session-aware UI behavior.
- Implemented job offer domain types and validation schema helpers.
- Added Supabase-backed job offers CRUD API layer with search and status filtering.
- Built professional dashboard table UI with loading, empty, and error states.
- Added create/edit forms covering all v1 job offer fields and validation messages.
- Added CSV export flow with a dashboard action and client-side CSV generation.
- Added `import-job-from-url` Supabase Edge Function with phase 1 deterministic extraction and review-only response behavior.
