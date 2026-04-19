import { NavLink } from 'react-router-dom'

import { useAuth } from '../../features/auth/useAuth'

const links = [{ label: 'Dashboard', to: '/dashboard' }]

export function TopNav() {
  const { session, signOut } = useAuth()

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Job Offers Tracker</p>
          <h1 className="text-lg font-semibold text-slate-900">Personal Workspace</h1>
          <p className="text-xs text-slate-500">{session?.user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
