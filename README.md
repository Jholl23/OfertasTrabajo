# Job Offers Tracker (Scaffold)

A static React + Vite + TypeScript starter for a personal job offers tracker. This scaffold prepares the project structure, baseline UI shell, and Tailwind styling without implementing business logic yet.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router

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

2. Start development server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

4. Preview production build:

   ```bash
   npm run preview
   ```

## Environment Variables

Create a `.env` file when Supabase integration begins:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> Do not expose backend-only secrets in frontend code.

## Current UI Scope

- Login page placeholder
- Dashboard placeholder
- Top navigation
- Offers table area placeholder

## Progress Notes

### 2026-04-19

- Initialized frontend scaffold with routing and modular folders.
- Added Tailwind CSS base configuration and professional default theme.
- Added placeholder pages and layout components for login and dashboard.
- Prepared feature folders for future incremental implementation.
