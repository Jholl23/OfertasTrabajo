# Import Job Feature

Frontend URL import flow with mandatory manual review.

## Behavior

- User pastes a URL in the dashboard import panel.
- UI calls Supabase Edge Function `import-job-from-url`.
- Returned normalized fields are shown in an editable review form.
- Import confidence is visible and highlighted when confidence is low.
- User must confirm manual review before save is enabled.
- Save uses the same `job_offers` insert path as manual creation.

## Error handling

- Invalid URL validation before import request.
- Import request errors shown inline.
- Full draft validation before saving reviewed data.
- Save errors shown without discarding review state.
