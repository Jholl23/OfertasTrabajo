import type { JobOffer } from '../../types/job-offer'

type CsvColumn = {
  header: string
  value: (offer: JobOffer) => string | number | null | undefined
}

const EXPORT_COLUMNS: CsvColumn[] = [
  { header: 'Company', value: (offer) => offer.company },
  { header: 'Job Title', value: (offer) => offer.job_title },
  { header: 'Status', value: (offer) => offer.offer_status },
  { header: 'Date Found (ISO)', value: (offer) => offer.date_found },
  { header: 'Closing Date (ISO)', value: (offer) => offer.closing_date },
  { header: 'Salary (Raw)', value: (offer) => offer.salary_raw },
  { header: 'Salary Min', value: (offer) => offer.salary_min },
  { header: 'Salary Max', value: (offer) => offer.salary_max },
  { header: 'Currency', value: (offer) => offer.currency },
  { header: 'Source Site', value: (offer) => offer.source_site },
  { header: 'Job URL', value: (offer) => offer.url },
  { header: 'Functions', value: (offer) => offer.job_functions },
  { header: 'Description', value: (offer) => offer.description },
  { header: 'Notes', value: (offer) => offer.notes },
  { header: 'Imported from URL', value: (offer) => (offer.imported_from_url ? 'yes' : 'no') },
  { header: 'Import Confidence', value: (offer) => offer.import_confidence },
  { header: 'Created At (ISO)', value: (offer) => offer.created_at },
  { header: 'Updated At (ISO)', value: (offer) => offer.updated_at },
]

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }

  const normalized = String(value)
  const escaped = normalized.replace(/"/g, '""')
  return `"${escaped}"`
}

export function buildJobOffersCsv(offers: JobOffer[]): string {
  const headerRow = EXPORT_COLUMNS.map((column) => escapeCsvValue(column.header)).join(',')
  const dataRows = offers.map((offer) => EXPORT_COLUMNS.map((column) => escapeCsvValue(column.value(offer))).join(','))
  return [headerRow, ...dataRows].join('\n')
}

export function downloadJobOffersCsv(offers: JobOffer[]): void {
  const csvContent = buildJobOffersCsv(offers)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `job-offers-${timestamp}.csv`
  anchor.click()

  URL.revokeObjectURL(url)
}
