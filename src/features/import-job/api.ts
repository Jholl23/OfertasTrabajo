import { requireSession } from '../auth/requireSession'
import { supabase } from '../../lib/supabase/client'

type ImportJobFromUrlRequest = {
  url: string
}

export type ImportedOfferPayload = {
  external_offer_id: string | null
  company: string | null
  job_title: string | null
  job_functions: string | null
  description: string | null
  salary_raw: string | null
  date_found: string | null
  closing_date: string | null
  url: string
  source_site: string | null
  offer_status: 'new'
  import_confidence: number
}

type ImportJobFromUrlResponse = {
  data: ImportedOfferPayload
  requires_review: boolean
  note?: string
}

export async function importJobFromUrl(url: string): Promise<ImportJobFromUrlResponse> {
  await requireSession()

  const payload: ImportJobFromUrlRequest = { url }

  const { data, error } = await supabase.functions.invoke<ImportJobFromUrlResponse>('import-job-from-url', {
    body: payload,
  })

  if (error) {
    throw error
  }

  if (!data?.data) {
    throw new Error('Import function returned an empty payload.')
  }

  return data
}
