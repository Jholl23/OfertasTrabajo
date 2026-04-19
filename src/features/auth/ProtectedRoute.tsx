import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { isLoading, session } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        Loading session...
      </main>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { isLoading, session } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        Loading session...
      </main>
    )
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
