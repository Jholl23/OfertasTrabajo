import { Outlet } from 'react-router-dom'

import { TopNav } from './TopNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 text-slate-900">
      <TopNav />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
