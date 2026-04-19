# AGENTS.md

## Project
Job Offers Tracker

## Goal
Build a static web application with Supabase as backend to manage job offers.
The app must allow the user to:
- authenticate securely
- store and edit job offers
- import a job offer from a pasted URL
- review and correct imported fields manually
- filter and search offers
- export data for Excel usage
- prepare the system for future Excel-to-database sync

## Product Vision
This is a personal job tracking system, not a public job board.
The product must prioritize:
- simplicity
- low cost
- maintainability
- clean UX
- safe backend design
- easy future extension

## Tech Stack
- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Backend: Supabase
- Database: Supabase Postgres
- Auth: Supabase Auth
- Server logic: Supabase Edge Functions
- Deployment: static frontend + Supabase backend
- State management: lightweight, prefer Zustand or React Query only if needed
- Forms: React Hook Form + Zod preferred
- Tables: TanStack Table preferred
- Dates: date-fns
- HTTP: fetch or a very small wrapper
- Parsing/import pipeline: start with HTML metadata extraction and text extraction, keep architecture ready for future AI-assisted extraction

## Core Constraints
- The frontend is static and must not contain secrets.
- Never expose service_role keys in the browser.
- Use Row Level Security in Supabase.
- The authenticated user must only access their own rows.
- Keep the first version minimal and robust.
- Do not overengineer Excel sync in v1.
- Excel export is required in v1.
- URL import with manual review is required in v1.

## v1 Features
1. Login page
2. Dashboard with offers table
3. Create, edit, delete offer
4. Filters by status, company, date_found
5. Search by title, company, description
6. Import offer by URL
7. Manual correction form after import
8. Export CSV
9. Basic stats cards:
   - total offers
   - active offers
   - applied offers
   - rejected offers
10. Responsive UI

## Non-Goals for v1
- Full automatic scraping for every job site
- Headless browser infrastructure
- Bi-directional live Excel sync
- Multi-user collaboration
- Browser extension
- AI ranking of offers
- Notifications and cron automation

## Recommended Data Model
Main table: public.job_offers

Important fields:
- id
- owner_id
- external_offer_id
- company
- job_title
- job_functions
- description
- salary_raw
- salary_min
- salary_max
- currency
- date_found
- closing_date
- url
- source_site
- offer_status
- notes
- import_confidence
- imported_from_url
- created_at
- updated_at

## Offer Statuses
Use a database enum with these values:
- new
- reviewing
- applied
- interview
- rejected
- closed
- archived

## URL Import Strategy
Implement a backend function called `import-job-from-url`.

### Required behavior
Input:
- url

Output:
- normalized JSON object ready to insert or review

Expected extracted fields:
- external_offer_id
- company
- job_title
- job_functions
- description
- salary_raw
- date_found
- closing_date
- url
- source_site
- offer_status
- import_confidence

### Extraction approach
Phase 1:
- fetch page HTML
- extract title
- extract meta tags
- extract Open Graph tags
- extract JSON-LD if available
- extract visible text summary
- normalize whitespace
- infer fields using deterministic parsing rules

Phase 2:
- add source-specific parsers if needed

Phase 3:
- optional AI-assisted extraction behind backend only

### Important rule
The function should never directly auto-publish dirty imported data without review.
The UI must show a review form before final save.

## Security Rules
- All reads and writes must be scoped to the authenticated user.
- RLS must be enabled.
- The frontend uses only public anon credentials.
- Privileged operations stay in Edge Functions.

## File Structure
Use a structure similar to:

src/
  app/
  components/
  features/
    auth/
    dashboard/
    job-offers/
    import-job/
  lib/
    supabase/
    utils/
    schemas/
  pages/
  hooks/
  types/

supabase/
  functions/
    import-job-from-url/
  migrations/

## Coding Rules
- Use TypeScript everywhere.
- Prefer small, focused files.
- Avoid giant components.
- Validate all form inputs with Zod.
- Keep domain types centralized.
- Keep API mapping code separated from UI components.
- Use explicit naming.
- No magic strings for statuses.
- Add comments only where they clarify intent.
- Favor readability over cleverness.

## UX Rules
- Clean and professional layout
- Very clear table
- Fast filtering
- Easy inline editing or modal editing
- Obvious status colors
- Visible imported-data confidence marker
- Review step after URL import
- Empty states must be friendly and useful

## CSV Export Rules
- Export only user-owned rows
- Export human-readable column names
- Preserve dates in ISO format
- Include salary_raw in addition to parsed numeric fields

## Testing Priorities
- Auth flow
- CRUD flow
- RLS behavior
- URL import normalization
- Form validation
- CSV export correctness

## Implementation Order
1. Bootstrap app
2. Set up Supabase client
3. Authentication
4. Database types and schemas
5. Offers table UI
6. CRUD operations
7. Filters and search
8. CSV export
9. Edge Function for URL import
10. Review form for imported offers
11. Polish UI and error handling

## Definition of Done
A version is done when:
- the user can log in
- create/edit/delete offers
- import from URL
- review imported fields
- filter/search data
- export CSV for Excel
- all data access is protected by RLS
- the codebase is clean enough for future Excel sync

## Agent Behavior for Codex
When modifying this repository:
- do not rewrite unrelated parts
- keep diffs small and logical
- explain each major change in a concise summary
- update README when architecture or commands change
- prefer incremental deliverables
- when adding a feature, also add minimal docs for how it works

## Required Documentation Updates
Every major task must update:
- README.md
- changelog section or progress notes
- environment variable documentation if changed

## Environment Variables
Expected variables:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Backend-only secrets must never be exposed to frontend code.

## Final Principle
Build the boring version first.
Reliable beats clever.
