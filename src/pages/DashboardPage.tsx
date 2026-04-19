import { useCallback, useEffect, useMemo, useState } from 'react'

import { JobOfferForm } from '../features/job-offers/JobOfferForm'
import { JobOffersTable } from '../features/job-offers/JobOffersTable'
import { createJobOffer, deleteJobOffer, listJobOffers, listJobOffersForExport, updateJobOffer } from '../features/job-offers/api'
import { downloadJobOffersCsv } from '../lib/utils/csv'
import { JOB_OFFER_STATUSES, type JobOffer, type JobOfferPayload, type JobOfferStatus } from '../types/job-offer'

type EditorState =
  | { mode: 'create' }
  | {
      mode: 'edit'
      offer: JobOffer
    }
  | null

export function DashboardPage() {
  const [offers, setOffers] = useState<JobOffer[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | JobOfferStatus>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [editorState, setEditorState] = useState<EditorState>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const loadOffers = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await listJobOffers({ search, status: statusFilter })
      setOffers(data)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Unable to load offers. Please refresh and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOffers()
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [loadOffers])

  const stats = useMemo(() => {
    const total = offers.length
    const active = offers.filter((offer) => ['new', 'reviewing', 'applied', 'interview'].includes(offer.offer_status)).length
    const applied = offers.filter((offer) => offer.offer_status === 'applied').length
    const rejected = offers.filter((offer) => offer.offer_status === 'rejected').length

    return { total, active, applied, rejected }
  }, [offers])

  const onCreate = async (payload: JobOfferPayload) => {
    setIsSaving(true)
    try {
      await createJobOffer(payload)
      setEditorState(null)
      await loadOffers()
    } finally {
      setIsSaving(false)
    }
  }

  const onEdit = async (id: string, payload: JobOfferPayload) => {
    setIsSaving(true)
    try {
      await updateJobOffer(id, payload)
      setEditorState(null)
      await loadOffers()
    } finally {
      setIsSaving(false)
    }
  }

  const onDelete = async (offer: JobOffer) => {
    const confirmed = window.confirm(`Delete offer \"${offer.job_title}\" from ${offer.company}?`)
    if (!confirmed) {
      return
    }

    try {
      await deleteJobOffer(offer.id)
      await loadOffers()
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Unable to delete offer. Please try again.')
      }
    }
  }

  const onExportCsv = async () => {
    setIsExporting(true)
    setErrorMessage(null)

    try {
      const exportOffers = await listJobOffersForExport()
      downloadJobOffersCsv(exportOffers)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Unable to export CSV. Please try again.')
      }
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Dashboard</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Job Offers Overview</h2>
        <p className="mt-2 text-sm text-slate-600">Track your opportunities, update status quickly, and keep your pipeline organized.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total offers" value={stats.total} />
        <StatCard title="Active offers" value={stats.active} />
        <StatCard title="Applied" value={stats.applied} />
        <StatCard title="Rejected" value={stats.rejected} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Offers</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void onExportCsv()}
              disabled={isExporting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              type="button"
              onClick={() => setEditorState({ mode: 'create' })}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              New offer
            </button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, company, or description"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 focus:border-brand-500 focus:ring-2"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | JobOfferStatus)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 focus:border-brand-500 focus:ring-2"
          >
            <option value="all">All statuses</option>
            {JOB_OFFER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <JobOffersTable
          offers={offers}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={() => void loadOffers()}
          onEdit={(offer) => setEditorState({ mode: 'edit', offer })}
          onDelete={(offer) => void onDelete(offer)}
        />
      </div>

      {editorState?.mode === 'create' ? (
        <JobOfferForm mode="create" isSubmitting={isSaving} onCancel={() => setEditorState(null)} onSubmit={onCreate} />
      ) : null}

      {editorState?.mode === 'edit' ? (
        <JobOfferForm
          mode="edit"
          initialValue={editorState.offer}
          isSubmitting={isSaving}
          onCancel={() => setEditorState(null)}
          onSubmit={(payload) => onEdit(editorState.offer.id, payload)}
        />
      ) : null}
    </section>
  )
}

type StatCardProps = {
  title: string
  value: number
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-panel">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </article>
  )
}
