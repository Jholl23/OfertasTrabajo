import { useMemo, useState, type FormEvent, type ReactNode } from 'react'

import {
  createEmptyJobOfferDraft,
  toJobOfferPayload,
  validateJobOfferDraft,
  type ValidationErrors,
} from '../../lib/schemas/jobOffer'
import { JOB_OFFER_STATUSES, type JobOffer, type JobOfferDraft, type JobOfferPayload } from '../../types/job-offer'

type JobOfferFormProps = {
  mode: 'create' | 'edit'
  initialValue?: JobOffer
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: JobOfferPayload) => Promise<void>
}

const toDraft = (offer: JobOffer): JobOfferDraft => ({
  external_offer_id: offer.external_offer_id ?? '',
  company: offer.company,
  job_title: offer.job_title,
  job_functions: offer.job_functions ?? '',
  description: offer.description ?? '',
  salary_raw: offer.salary_raw ?? '',
  salary_min: offer.salary_min?.toString() ?? '',
  salary_max: offer.salary_max?.toString() ?? '',
  currency: offer.currency ?? '',
  date_found: offer.date_found,
  closing_date: offer.closing_date ?? '',
  url: offer.url ?? '',
  source_site: offer.source_site ?? '',
  offer_status: offer.offer_status,
  notes: offer.notes ?? '',
  import_confidence: offer.import_confidence?.toString() ?? '',
  imported_from_url: offer.imported_from_url,
})

export function JobOfferForm({ mode, initialValue, isSubmitting, onCancel, onSubmit }: JobOfferFormProps) {
  const [draft, setDraft] = useState<JobOfferDraft>(() => (initialValue ? toDraft(initialValue) : createEmptyJobOfferDraft()))
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const title = useMemo(() => (mode === 'create' ? 'Create Offer' : 'Edit Offer'), [mode])

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const validationErrors = validateJobOfferDraft(draft)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    try {
      await onSubmit(toJobOfferPayload(draft))
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Unable to save offer. Please try again.')
      }
    }
  }

  const inputClassName =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-brand-500 transition focus:border-brand-500 focus:ring-2'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={onFormSubmit} className="grid gap-4 md:grid-cols-2">
        <Field label="Company *" error={errors.company}>
          <input
            value={draft.company}
            onChange={(event) => setDraft((previous) => ({ ...previous, company: event.target.value }))}
            className={inputClassName}
          />
        </Field>

        <Field label="Job title *" error={errors.job_title}>
          <input
            value={draft.job_title}
            onChange={(event) => setDraft((previous) => ({ ...previous, job_title: event.target.value }))}
            className={inputClassName}
          />
        </Field>

        <Field label="Status *" error={errors.offer_status}>
          <select
            value={draft.offer_status}
            onChange={(event) => setDraft((previous) => ({ ...previous, offer_status: event.target.value as JobOfferDraft['offer_status'] }))}
            className={inputClassName}
          >
            {JOB_OFFER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date found *" error={errors.date_found}>
          <input
            type="date"
            value={draft.date_found}
            onChange={(event) => setDraft((previous) => ({ ...previous, date_found: event.target.value }))}
            className={inputClassName}
          />
        </Field>

        <Field label="Closing date">
          <input
            type="date"
            value={draft.closing_date}
            onChange={(event) => setDraft((previous) => ({ ...previous, closing_date: event.target.value }))}
            className={inputClassName}
          />
        </Field>

        <Field label="URL" error={errors.url}>
          <input
            value={draft.url}
            onChange={(event) => setDraft((previous) => ({ ...previous, url: event.target.value }))}
            className={inputClassName}
            placeholder="https://..."
          />
        </Field>

        <Field label="External offer id">
          <input
            value={draft.external_offer_id}
            onChange={(event) => setDraft((previous) => ({ ...previous, external_offer_id: event.target.value }))}
            className={inputClassName}
          />
        </Field>

        <Field label="Source site">
          <input
            value={draft.source_site}
            onChange={(event) => setDraft((previous) => ({ ...previous, source_site: event.target.value }))}
            className={inputClassName}
          />
        </Field>

        <Field label="Currency">
          <input
            value={draft.currency}
            onChange={(event) => setDraft((previous) => ({ ...previous, currency: event.target.value }))}
            className={inputClassName}
            placeholder="USD"
          />
        </Field>

        <Field label="Salary raw">
          <input
            value={draft.salary_raw}
            onChange={(event) => setDraft((previous) => ({ ...previous, salary_raw: event.target.value }))}
            className={inputClassName}
          />
        </Field>

        <Field label="Salary min" error={errors.salary_min}>
          <input
            value={draft.salary_min}
            onChange={(event) => setDraft((previous) => ({ ...previous, salary_min: event.target.value }))}
            className={inputClassName}
          />
        </Field>

        <Field label="Salary max" error={errors.salary_max}>
          <input
            value={draft.salary_max}
            onChange={(event) => setDraft((previous) => ({ ...previous, salary_max: event.target.value }))}
            className={inputClassName}
          />
        </Field>

        <Field label="Import confidence" error={errors.import_confidence}>
          <input
            value={draft.import_confidence}
            onChange={(event) => setDraft((previous) => ({ ...previous, import_confidence: event.target.value }))}
            className={inputClassName}
            placeholder="0 - 1"
          />
        </Field>

        <Field label="Job functions">
          <input
            value={draft.job_functions}
            onChange={(event) => setDraft((previous) => ({ ...previous, job_functions: event.target.value }))}
            className={inputClassName}
          />
        </Field>

        <Field label="Description" className="md:col-span-2">
          <textarea
            value={draft.description}
            onChange={(event) => setDraft((previous) => ({ ...previous, description: event.target.value }))}
            className={inputClassName}
            rows={4}
          />
        </Field>

        <Field label="Notes" className="md:col-span-2">
          <textarea
            value={draft.notes}
            onChange={(event) => setDraft((previous) => ({ ...previous, notes: event.target.value }))}
            className={inputClassName}
            rows={3}
          />
        </Field>

        <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={draft.imported_from_url}
            onChange={(event) => setDraft((previous) => ({ ...previous, imported_from_url: event.target.checked }))}
          />
          Imported from URL
        </label>

        {submitError ? <p className="md:col-span-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p> : null}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create offer' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  )
}

type FieldProps = {
  label: string
  children: ReactNode
  error?: string
  className?: string
}

function Field({ label, children, error, className }: FieldProps) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}
