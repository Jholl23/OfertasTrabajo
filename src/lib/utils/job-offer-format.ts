import { JOB_OFFER_STATUS_LABELS, type JobOfferStatus } from '../../types/job-offer'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatJobOfferStatus(status: JobOfferStatus): string {
  return JOB_OFFER_STATUS_LABELS[status]
}

export function formatIsoDate(value: string | null | undefined): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return dateFormatter.format(date)
}
