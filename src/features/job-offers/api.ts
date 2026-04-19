import { supabase } from '../../lib/supabase/client'
import type { JobOffer, JobOfferPayload, JobOfferStatus } from '../../types/job-offer'

type ListJobOffersOptions = {
  search: string
  status: 'all' | JobOfferStatus
}

const JOB_OFFERS_BASE_SELECT = `
  id,
  owner_id,
  external_offer_id,
  company,
  job_title,
  job_functions,
  description,
  salary_raw,
  salary_min,
  salary_max,
  currency,
  date_found,
  closing_date,
  url,
  source_site,
  offer_status,
  notes,
  import_confidence,
  imported_from_url,
  created_at,
  updated_at
`

export async function listJobOffers(options: ListJobOffersOptions): Promise<JobOffer[]> {
  let query = supabase.from('job_offers').select(JOB_OFFERS_BASE_SELECT).order('date_found', { ascending: false })

  if (options.status !== 'all') {
    query = query.eq('offer_status', options.status)
  }

  const normalizedSearch = options.search.trim()
  if (normalizedSearch) {
    const escaped = normalizedSearch.replace(/,/g, ' ').replace(/%/g, '').replace(/_/g, '')
    query = query.or(`job_title.ilike.%${escaped}%,company.ilike.%${escaped}%,description.ilike.%${escaped}%`)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data ?? []) as JobOffer[]
}

export async function listJobOffersForExport(): Promise<JobOffer[]> {
  const { data, error } = await supabase.from('job_offers').select(JOB_OFFERS_BASE_SELECT).order('date_found', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as JobOffer[]
}

export async function createJobOffer(payload: JobOfferPayload): Promise<JobOffer> {
  const { data, error } = await supabase
    .from('job_offers')
    .insert(payload)
    .select(JOB_OFFERS_BASE_SELECT)
    .single()

  if (error) {
    throw error
  }

  return data as JobOffer
}

export async function updateJobOffer(id: string, payload: JobOfferPayload): Promise<JobOffer> {
  const { data, error } = await supabase
    .from('job_offers')
    .update(payload)
    .eq('id', id)
    .select(JOB_OFFERS_BASE_SELECT)
    .single()

  if (error) {
    throw error
  }

  return data as JobOffer
}

export async function deleteJobOffer(id: string): Promise<void> {
  const { error } = await supabase.from('job_offers').delete().eq('id', id)

  if (error) {
    throw error
  }
}
