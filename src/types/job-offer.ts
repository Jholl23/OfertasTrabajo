export const JOB_OFFER_STATUSES = [
  'new',
  'reviewing',
  'applied',
  'interview',
  'rejected',
  'closed',
  'archived',
] as const

export type JobOfferStatus = (typeof JOB_OFFER_STATUSES)[number]

export type JobOffer = {
  id: string
  owner_id: string
  external_offer_id: string | null
  company: string
  job_title: string
  job_functions: string | null
  description: string | null
  salary_raw: string | null
  salary_min: number | null
  salary_max: number | null
  currency: string | null
  date_found: string
  closing_date: string | null
  url: string | null
  source_site: string | null
  offer_status: JobOfferStatus
  notes: string | null
  import_confidence: number | null
  imported_from_url: boolean
  created_at: string
  updated_at: string
}

export type JobOfferDraft = {
  external_offer_id: string
  company: string
  job_title: string
  job_functions: string
  description: string
  salary_raw: string
  salary_min: string
  salary_max: string
  currency: string
  date_found: string
  closing_date: string
  url: string
  source_site: string
  offer_status: JobOfferStatus
  notes: string
  import_confidence: string
  imported_from_url: boolean
}

export type JobOfferPayload = {
  external_offer_id?: string | null
  company: string
  job_title: string
  job_functions?: string | null
  description?: string | null
  salary_raw?: string | null
  salary_min?: number | null
  salary_max?: number | null
  currency?: string | null
  date_found: string
  closing_date?: string | null
  url?: string | null
  source_site?: string | null
  offer_status: JobOfferStatus
  notes?: string | null
  import_confidence?: number | null
  imported_from_url?: boolean
}
