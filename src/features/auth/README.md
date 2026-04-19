# Auth Feature

Supabase Auth integration for email/password sign-in.

## Included modules

- `AuthProvider.tsx`: loads session, subscribes to auth state changes, and exposes auth actions.
- `useAuth.ts`: typed hook for consuming auth context.
- `ProtectedRoute.tsx`: route guards for protected and public-only pages.

## Behavior

- Restores persisted session on app boot.
- Redirects unauthenticated users to `/login`.
- Redirects authenticated users away from `/login`.
- Exposes logout action for layout/navigation components.
