# Job Offers Tracker (v1)

A static React + Vite + TypeScript web app for managing your personal job search pipeline with Supabase.

## v1 Overview

Version 1 focuses on a reliable and maintainable flow for individual job tracking:

- Secure sign in with Supabase Auth.
- Auth-protected dashboard for job offer management.
- CRUD operations on offers with validation.
- Search and status filtering.
- URL import with mandatory manual review before save.
- CSV export for Excel usage.
- Lightweight stats and clean responsive UI.

This project intentionally prioritizes predictable UX, strong data scoping, and low operational complexity over advanced automation.

## v1 Feature List

- **Authentication**
  - Email/password sign-in and sign-out.
  - Session restore on refresh.
  - Route guards for public-only and protected views.
- **Dashboard**
  - Offer table with loading/error/empty states.
  - Status badges, readable dates, and direct job URL access.
  - Stats cards: total, active, applied, rejected.
- **Offers CRUD**
  - Create, edit, and delete offers.
  - Input validation and friendly inline errors.
- **Filtering & Search**
  - Search by title, company, and description.
  - Status filter with quick reset.
- **URL Import Review**
  - Supabase Edge Function extraction (`import-job-from-url`).
  - Confidence indicator.
  - Required “reviewed” confirmation before save.
- **CSV Export**
  - Human-readable headers.
  - ISO date preservation.
  - Includes `salary_raw`, `salary_min`, and `salary_max`.

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
    forms/
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
- Data operations enforce an active session before executing API calls.

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

- Polished v1 dashboard UX: clearer table rows, improved filter controls, richer stat cards, and stronger empty states.
- Unified duplicated form field/input styles into shared form components.
- Standardized status naming presentation across table and forms.
- Added explicit frontend session gating for all auth-protected data and import operations.
- Updated README to reflect the v1 release scope and current capabilities.
