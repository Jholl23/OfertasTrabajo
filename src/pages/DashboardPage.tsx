export function DashboardPage() {
  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Dashboard</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Job Offers Overview</h2>
        <p className="mt-2 text-sm text-slate-600">
          This area will host stats, filters, and actions for your offers.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Offers Table</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Placeholder</span>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Table area placeholder (TanStack table to be integrated in future tasks)
        </div>
      </div>
    </section>
  )
}
