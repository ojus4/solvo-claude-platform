'use client'
// =============================================================================
// SOLVO — App Providers
// Wraps the entire app. Add all context providers here.
// This is a Client Component so Zustand and hooks can initialise.
// =============================================================================
import { type ReactNode } from 'react'
import { useUser } from '@/lib/hooks/useUser'
import { useSiteConfig } from '@/lib/hooks/useSiteConfig'

interface ProvidersProps {
  children: ReactNode
}

// Inner component — runs hooks that initialise global state
function AppInitialiser({ children }: ProvidersProps) {
  // Initialise auth state — syncs Supabase session to Zustand
  useUser()

  // Load promotions, banners, site settings from DB
  useSiteConfig()

  return <>{children}</>
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AppInitialiser>
      {children}
    </AppInitialiser>
  )
}