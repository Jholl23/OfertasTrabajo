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
- Logout action in top navigation

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
