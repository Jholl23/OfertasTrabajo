import { useMemo, useState, type FormEvent } from 'react'

import { FormField } from '../../components/forms/FormField'
import { formControlClassName } from '../../components/forms/styles'
import {
  createEmptyJobOfferDraft,
  toJobOfferPayload,
  validateJobOfferDraft,
  type ValidationErrors,
} from '../../lib/schemas/jobOffer'
import { formatJobOfferStatus } from '../../lib/utils/job-offer-format'
import type { JobOfferDraft, JobOfferPayload } from '../../types/job-offer'
import { importJobFromUrl, type ImportedOfferPayload } from './api'

type ImportJobFromUrlPanelProps = {
  isSaving: boolean
  onSave: (payload: JobOfferPayload) => Promise<void>
}

const LOW_CONFIDENCE_THRESHOLD = 0.6

const toReviewDraft = (imported: ImportedOfferPayload): JobOfferDraft => {
  const emptyDraft = createEmptyJobOfferDraft()

  return {
    ...emptyDraft,
    external_offer_id: imported.external_offer_id ?? '',
    company: imported.company ?? '',
    job_title: imported.job_title ?? '',
    job_functions: imported.job_functions ?? '',
    description: imported.description ?? '',
    salary_raw: imported.salary_raw ?? '',
    date_found: imported.date_found ?? emptyDraft.date_found,
    closing_date: imported.closing_date ?? '',
    url: imported.url,
    source_site: imported.source_site ?? '',
    offer_status: imported.offer_status,
    import_confidence: imported.import_confidence.toString(),
    imported_from_url: true,
  }
}

export function ImportJobFromUrlPanel({ isSaving, onSave }: ImportJobFromUrlPanelProps) {
  const [url, setUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [reviewDraft, setReviewDraft] = useState<JobOfferDraft | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isReviewed, setIsReviewed] = useState(false)

  const importConfidence = useMemo(() => {
    if (!reviewDraft?.import_confidence) {
      return null
    }

    const parsed = Number(reviewDraft.import_confidence)
    if (Number.isNaN(parsed)) {
      return null
    }

    return parsed
  }, [reviewDraft])

  const isLowConfidence = importConfidence !== null && importConfidence < LOW_CONFIDENCE_THRESHOLD

  const onImportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setImportError(null)
    setSubmitError(null)
    setValidationErrors({})

    const normalizedUrl = url.trim()

    if (!normalizedUrl) {
      setImportError('Please paste a job post URL to start importing.')
      return
    }

    try {
      new URL(normalizedUrl)
    } catch {
      setImportError('Please provide a valid URL.')
      return
    }

    setIsImporting(true)

    try {
      const response = await importJobFromUrl(normalizedUrl)
      setReviewDraft(toReviewDraft(response.data))
      setIsReviewed(false)
    } catch (error) {
      if (error instanceof Error) {
        setImportError(error.message)
      } else {
        setImportError('Unable to import this URL. Please try again.')
      }
    } finally {
      setIsImporting(false)
    }
  }

  const onReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!reviewDraft) {
      return
    }

    setSubmitError(null)

    const errors = validateJobOfferDraft(reviewDraft)
    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      setSubmitError('Please fix validation errors before saving.')
      return
    }

    if (!isReviewed) {
      setSubmitError('Please confirm that you reviewed the imported fields before saving.')
      return
    }

    try {
      await onSave(toJobOfferPayload(reviewDraft))
      setReviewDraft(null)
      setUrl('')
      setIsReviewed(false)
      setValidationErrors({})
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Unable to save imported offer. Please try again.')
      }
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">Import offer from URL</h3>
        <p className="text-sm text-slate-600">Paste a job URL, review extracted values, edit anything needed, and save only after confirmation.</p>
      </div>

      <form onSubmit={onImportSubmit} className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/jobs/frontend-engineer"
          className={`${formControlClassName} md:flex-1`}
          aria-label="Job URL"
        />
        <button
          type="submit"
          disabled={isImporting}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isImporting ? 'Importing...' : 'Import URL'}
        </button>
      </form>

      {importError ? <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{importError}</p> : null}

      {reviewDraft ? (
        <form onSubmit={onReviewSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-slate-800">Review extracted fields before saving</p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isLowConfidence ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              Import confidence: {importConfidence !== null ? importConfidence.toFixed(2) : 'N/A'}
            </span>
            {isLowConfidence ? <p className="text-xs font-medium text-amber-700">Low confidence detected. Review all fields carefully.</p> : null}
          </div>

          <FormField label="Company *" error={validationErrors.company}>
            <input
              value={reviewDraft.company}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, company: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Job title *" error={validationErrors.job_title}>
            <input
              value={reviewDraft.job_title}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, job_title: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Date found *" error={validationErrors.date_found}>
            <input
              type="date"
              value={reviewDraft.date_found}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, date_found: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Closing date">
            <input
              type="date"
              value={reviewDraft.closing_date}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, closing_date: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Status" error={validationErrors.offer_status}>
            <input value={formatJobOfferStatus(reviewDraft.offer_status)} disabled className={`${formControlClassName} bg-slate-100`} />
          </FormField>

          <FormField label="External offer ID">
            <input
              value={reviewDraft.external_offer_id}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, external_offer_id: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Source site">
            <input
              value={reviewDraft.source_site}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, source_site: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="URL" error={validationErrors.url}>
            <input
              value={reviewDraft.url}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, url: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Job functions">
            <input
              value={reviewDraft.job_functions}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, job_functions: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Salary raw">
            <input
              value={reviewDraft.salary_raw}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, salary_raw: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Currency">
            <input
              value={reviewDraft.currency}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, currency: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Salary min" error={validationErrors.salary_min}>
            <input
              value={reviewDraft.salary_min}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, salary_min: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Salary max" error={validationErrors.salary_max}>
            <input
              value={reviewDraft.salary_max}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, salary_max: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Import confidence" error={validationErrors.import_confidence}>
            <input
              value={reviewDraft.import_confidence}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, import_confidence: event.target.value } : previous))}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Description" className="md:col-span-2">
            <textarea
              value={reviewDraft.description}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, description: event.target.value } : previous))}
              className={formControlClassName}
              rows={4}
            />
          </FormField>

          <FormField label="Notes" className="md:col-span-2">
            <textarea
              value={reviewDraft.notes}
              onChange={(event) => setReviewDraft((previous) => (previous ? { ...previous, notes: event.target.value } : previous))}
              className={formControlClassName}
              rows={3}
            />
          </FormField>

          <label className="md:col-span-2 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <input type="checkbox" checked={isReviewed} onChange={(event) => setIsReviewed(event.target.checked)} className="mt-0.5" />
            <span>I reviewed and corrected the imported values. Save this offer now.</span>
          </label>

          {submitError ? <p className="md:col-span-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p> : null}

          <div className="md:col-span-2 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setReviewDraft(null)
                setValidationErrors({})
                setSubmitError(null)
                setIsReviewed(false)
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
            >
              Discard import
            </button>
            <button
              type="submit"
              disabled={isSaving || !isReviewed}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save imported offer'}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
