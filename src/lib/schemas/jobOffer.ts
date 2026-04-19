import { JOB_OFFER_STATUSES, type JobOfferDraft, type JobOfferPayload, type JobOfferStatus } from '../../types/job-offer'

export type ValidationErrors = Partial<Record<keyof JobOfferDraft, string>>

const statusSet = new Set<JobOfferStatus>(JOB_OFFER_STATUSES)

const requiredText = (value: string) => value.trim().length > 0

const parseOptionalNumber = (value: string) => {
  if (!value.trim()) {
    return null
  }

  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    return NaN
  }

  return parsed
}

const parseOptionalDate = (value: string) => {
  if (!value.trim()) {
    return null
  }

  return value
}

const parseOptionalText = (value: string) => {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export const createEmptyJobOfferDraft = (): JobOfferDraft => ({
  external_offer_id: '',
  company: '',
  job_title: '',
  job_functions: '',
  description: '',
  salary_raw: '',
  salary_min: '',
  salary_max: '',
  currency: '',
  date_found: new Date().toISOString().slice(0, 10),
  closing_date: '',
  url: '',
  source_site: '',
  offer_status: 'new',
  notes: '',
  import_confidence: '',
  imported_from_url: false,
})

export const validateJobOfferDraft = (draft: JobOfferDraft): ValidationErrors => {
  const errors: ValidationErrors = {}

  if (!requiredText(draft.company)) {
    errors.company = 'Company is required.'
  }

  if (!requiredText(draft.job_title)) {
    errors.job_title = 'Job title is required.'
  }

  if (!requiredText(draft.date_found)) {
    errors.date_found = 'Date found is required.'
  }

  if (!statusSet.has(draft.offer_status)) {
    errors.offer_status = 'Status is invalid.'
  }

  const salaryMin = parseOptionalNumber(draft.salary_min)
  const salaryMax = parseOptionalNumber(draft.salary_max)
  const importConfidence = parseOptionalNumber(draft.import_confidence)

  if (Number.isNaN(salaryMin)) {
    errors.salary_min = 'Salary min must be a number.'
  }

  if (Number.isNaN(salaryMax)) {
    errors.salary_max = 'Salary max must be a number.'
  }

  if (
    typeof salaryMin === 'number' &&
    typeof salaryMax === 'number' &&
    !Number.isNaN(salaryMin) &&
    !Number.isNaN(salaryMax) &&
    salaryMax < salaryMin
  ) {
    errors.salary_max = 'Salary max must be greater than or equal to salary min.'
  }

  if (Number.isNaN(importConfidence)) {
    errors.import_confidence = 'Import confidence must be a number.'
  } else if (typeof importConfidence === 'number' && (importConfidence < 0 || importConfidence > 1)) {
    errors.import_confidence = 'Import confidence must be between 0 and 1.'
  }

  if (draft.url.trim().length > 0) {
    try {
      new URL(draft.url)
    } catch {
      errors.url = 'URL must be valid.'
    }
  }

  return errors
}

export const toJobOfferPayload = (draft: JobOfferDraft): JobOfferPayload => ({
  external_offer_id: parseOptionalText(draft.external_offer_id),
  company: draft.company.trim(),
  job_title: draft.job_title.trim(),
  job_functions: parseOptionalText(draft.job_functions),
  description: parseOptionalText(draft.description),
  salary_raw: parseOptionalText(draft.salary_raw),
  salary_min: parseOptionalNumber(draft.salary_min),
  salary_max: parseOptionalNumber(draft.salary_max),
  currency: parseOptionalText(draft.currency),
  date_found: draft.date_found,
  closing_date: parseOptionalDate(draft.closing_date),
  url: parseOptionalText(draft.url),
  source_site: parseOptionalText(draft.source_site),
  offer_status: draft.offer_status,
  notes: parseOptionalText(draft.notes),
  import_confidence: parseOptionalNumber(draft.import_confidence),
  imported_from_url: draft.imported_from_url,
})
