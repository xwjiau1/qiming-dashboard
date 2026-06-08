import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { DbUser } from '@/types/supabase'

export interface AuthState {
  session: any | null
  user: DbUser | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<DbUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    setUser(data || null)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session: s } }: { data: { session: any } }) => {
      setSession(s)
      if (s?.user?.id) fetchUser(s.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, s: any) => {
      setSession(s)
      if (s?.user?.id) fetchUser(s.user.id)
      else setUser(null)
    })

    return () => subscription.unsubscribe()
  }, [fetchUser])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) throw new Error('Supabase 未配置')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
  }

  return {
    session,
    user,
    loading,
    isAdmin: user?.role === 'founder' || user?.role === 'ceo',
    signIn,
    signOut,
  }
}
