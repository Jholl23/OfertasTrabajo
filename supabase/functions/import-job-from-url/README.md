# `import-job-from-url` Edge Function

Phase 1 importer that fetches a job posting URL and returns a **normalized, review-ready payload**.

## Input

```json
{
  "url": "https://example.com/jobs/senior-frontend-engineer"
}
```

## Output

```json
{
  "data": {
    "external_offer_id": "abc123",
    "company": "Example Inc",
    "job_title": "Senior Frontend Engineer",
    "job_functions": "FULL_TIME",
    "description": "...",
    "salary_raw": "$90,000 - $120,000",
    "date_found": "2026-04-19",
    "closing_date": "2026-05-01",
    "url": "https://example.com/jobs/senior-frontend-engineer",
    "source_site": "example.com",
    "offer_status": "new",
    "import_confidence": 0.72
  },
  "requires_review": true,
  "note": "This function only extracts and normalizes fields. Frontend review is required before persisting."
}
```

## Extraction covered in phase 1

- HTML page title
- Meta tags
- Open Graph tags
- JSON-LD (`application/ld+json`) when present
- Visible text summary extraction
- Whitespace normalization
- Deterministic field inference and confidence scoring

## Important behavior

- This function **does not write to the database**.
- Returned values are best-effort only and must be reviewed in the frontend before final save.

## Run locally

From repository root:

```bash
supabase functions serve import-job-from-url
```

Invoke with:

```bash
curl -i --location 'http://127.0.0.1:54321/functions/v1/import-job-from-url' \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com/jobs/123"}'
```
