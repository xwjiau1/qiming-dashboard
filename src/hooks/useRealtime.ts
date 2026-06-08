import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export function useRealtime(
  table: string,
  callback: (payload: any) => void,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  filter?: string
) {
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes' as any,
        { event, schema: 'public', table, filter },
        callback
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [table, callback, event, filter])
}
