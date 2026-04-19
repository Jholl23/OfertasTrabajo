import { supabase } from '../../lib/supabase/client'

export async function requireSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    throw new Error('Your session expired. Please sign in again.')
  }

  return session
}
