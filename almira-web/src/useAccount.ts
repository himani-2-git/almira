import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export function useAccount() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  useEffect(() => {
    if (!supabase) return
    let active = true
    let authEventReceived = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Keep this callback synchronous; SDK calls here can deadlock token refresh.
      authEventReceived = true
      if (active) { setUser(session?.user ?? null); setLoading(false) }
    })
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && !authEventReceived) { setUser(session?.user ?? null); setLoading(false) }
    }).catch(() => { if (active) setLoading(false) })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  return { user, loading, configured: Boolean(supabase) }
}
