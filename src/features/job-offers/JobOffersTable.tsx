import { formatIsoDate, formatJobOfferStatus } from '../../lib/utils/job-offer-format'
import type { JobOffer } from '../../types/job-offer'

type JobOffersTableProps = {
  offers: JobOffer[]
  isLoading: boolean
  errorMessage: string | null
  hasActiveFilters: boolean
  onRetry: () => void
  onEdit: (offer: JobOffer) => void
  onDelete: (offer: JobOffer) => void
}

const statusStyles: Record<string, string> = {
  new: 'bg-sky-100 text-sky-700',
  reviewing: 'bg-amber-100 text-amber-700',
  applied: 'bg-indigo-100 text-indigo-700',
  interview: 'bg-violet-100 text-violet-700',
  rejected: 'bg-rose-100 text-rose-700',
  closed: 'bg-slate-200 text-slate-700',
  archived: 'bg-slate-100 text-slate-600',
}

export function JobOffersTable({ offers, isLoading, errorMessage, hasActiveFilters, onRetry, onEdit, onDelete }: JobOffersTableProps) {
  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">Loading offers...</div>
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
        <p>{errorMessage}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-rose-300 px-3 py-1.5 font-medium hover:border-rose-400"
        >
          Retry
        </button>
      </div>
    )
  }

  if (offers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm font-semibold text-slate-700">No offers found</p>
        <p className="mt-1 text-sm text-slate-500">
          {hasActiveFilters ? 'Try clearing or adjusting your filters.' : 'Create your first offer or import one from a URL to get started.'}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date found</th>
            <th className="px-4 py-3">Salary</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {offers.map((offer, index) => (
            <tr key={offer.id} className={`align-top ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
              <td className="px-4 py-3 font-medium text-slate-900">
                {offer.company}
                {offer.url ? (
                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-xs font-normal text-brand-600 hover:text-brand-700"
                  >
                    Open job post
                  </a>
                ) : null}
              </td>
              <td className="px-4 py-3 text-slate-700">
                <p className="font-medium text-slate-800">{offer.job_title}</p>
                {offer.description ? <p className="mt-1 line-clamp-2 max-w-sm text-xs text-slate-500">{offer.description}</p> : null}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[offer.offer_status] ?? 'bg-slate-100 text-slate-700'}`}>
                  {formatJobOfferStatus(offer.offer_status)}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">{formatIsoDate(offer.date_found)}</td>
              <td className="px-4 py-3 text-slate-700">{offer.salary_raw ?? '-'}</td>
              <td className="px-4 py-3 text-slate-700">{offer.source_site ?? '-'}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(offer)}
                    className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-400"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(offer)}
                    className="rounded-md border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-700 hover:border-rose-400"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
