# Job Offers Feature

This module now includes the v1 frontend CRUD workflow for `job_offers`:

- Domain types and status constants (`src/types/job-offer.ts`)
- Validation and payload mapping schema helpers (`src/lib/schemas/jobOffer.ts`)
- Supabase CRUD + list/search/filter API client (`src/features/job-offers/api.ts`)
- Create/edit form with validation errors and save states (`src/features/job-offers/JobOfferForm.tsx`)
- Offers table with loading, empty, and error states (`src/features/job-offers/JobOffersTable.tsx`)

The dashboard page wires these pieces together with search and status filtering.
