// =============================================================================
// SOLVO — useSiteConfig Hook
// Loads active promotions, banners, and site settings from Supabase.
// Call once in the root layout — all children get config via the store.
// =============================================================================
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSiteConfigStore } from '@/lib/store/userStore'
import type { Promotion, SiteBanner, SiteSetting } from '@/types'

export function useSiteConfig() {
  const { config, setConfig, isConfigLoaded } = useSiteConfigStore()

  useEffect(() => {
    // Only load once per session
    if (isConfigLoaded) return

    async function loadConfig() {
      const supabase = createClient()

      const [promoResult, bannerResult, settingsResult] = await Promise.all([
        // active_promotion is a VIEW that returns the single live promotion
        supabase
          .from('active_promotion')
          .select('*')
          .maybeSingle<Promotion>(),

        // All banners that are active right now
        supabase
          .from('site_banners')
          .select('*')
          .eq('is_active', true)
          .returns<SiteBanner[]>(),

        // All site settings
        supabase
          .from('site_settings')
          .select('key, value')
          .returns<Pick<SiteSetting, 'key' | 'value'>[]>(),
      ])

      // Convert settings array to a key-value object for easy access
      const settings: Record<string, string> = {}
      settingsResult.data?.forEach((row) => {
        settings[row.key] = row.value
      })

      setConfig({
        activePromotion: promoResult.data ?? null,
        activeBanners: bannerResult.data ?? [],
        settings,
      })
    }

    loadConfig()
  }, [isConfigLoaded, setConfig])

  return config
}