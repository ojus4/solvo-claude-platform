// =============================================================================
// SOLVO — useUser Hook
// Syncs Supabase auth state with the Zustand user store.
// Call once in the root layout Provider.
// =============================================================================
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/store/userStore'
import type { Profile } from '@/types'

export function useUser() {
  const { setProfile, setLoading, clearUser } = useUserStore()

  useEffect(() => {
    const supabase = createClient()

    // Fetch the current user profile from Supabase
    async function fetchProfile(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single<Profile>()

      if (error || !data) {
        clearUser()
        return
      }

      setProfile(data)
      setLoading(false)
    }

    // Get the initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchProfile(user.id)
      } else {
        clearUser()
      }
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          clearUser()
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          fetchProfile(session.user.id)
        }
      }
    )

    // Clean up the listener when component unmounts
    return () => {
      subscription.unsubscribe()
    }
  }, [setProfile, setLoading, clearUser])

  return useUserStore()
}