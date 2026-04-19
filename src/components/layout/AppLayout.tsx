import { Outlet } from 'react-router-dom'

import { useAuth } from '../../features/auth/useAuth'
import { TopNav } from './TopNav'

export function AppLayout() {
  const { session } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 text-slate-900">
      <TopNav />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="mb-4 text-sm text-slate-600">Signed in as {session?.user.email}</p>
        <Outlet />
      </main>
    </div>
  )
}
