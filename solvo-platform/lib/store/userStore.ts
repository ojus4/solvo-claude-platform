// =============================================================================
// SOLVO — Global User State (Zustand)
// Import: import { useUserStore } from '@/lib/store/userStore'
// =============================================================================
import { create } from 'zustand'
import type { Profile, UserTier, AdminRole, SiteConfig } from '@/types'


// ─── User Store ───────────────────────────────────────────────────────────────

interface UserState {
  // Auth state
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean

  // Computed conveniences
  isPremium: boolean
  tier: UserTier
  isAdmin: boolean
  adminRole: AdminRole | null

  // Impersonation state (super admin only)
  isImpersonating: boolean
  impersonatedUser: Profile | null

  // Actions
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setImpersonating: (user: Profile | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  // Initial state
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isPremium: false,
  tier: 'explorer',
  isAdmin: false,
  adminRole: null,
  isImpersonating: false,
  impersonatedUser: null,

  // Set profile — derives all computed values automatically
  setProfile: (profile) => set({
    profile,
    isAuthenticated: !!profile,
    isPremium: profile?.is_premium ?? false,
    tier: profile?.tier ?? 'explorer',
    isAdmin: !!profile?.admin_role,
    adminRole: profile?.admin_role ?? null,
  }),

  setLoading: (isLoading) => set({ isLoading }),

  setImpersonating: (impersonatedUser) => set({
    isImpersonating: !!impersonatedUser,
    impersonatedUser,
  }),

  clearUser: () => set({
    profile: null,
    isAuthenticated: false,
    isPremium: false,
    tier: 'explorer',
    isAdmin: false,
    adminRole: null,
    isImpersonating: false,
    impersonatedUser: null,
    isLoading: false,
  }),
}))


// ─── Site Config Store ────────────────────────────────────────────────────────

interface SiteConfigState {
  config: SiteConfig
  isConfigLoaded: boolean
  setConfig: (config: SiteConfig) => void
}

export const useSiteConfigStore = create<SiteConfigState>((set) => ({
  config: {
    activePromotion: null,
    activeBanners: [],
    settings: {},
  },
  isConfigLoaded: false,
  setConfig: (config) => set({ config, isConfigLoaded: true }),
}))


// ─── Assessment Store (tracks test progress) ──────────────────────────────────

interface AssessmentState {
  personalityDone: boolean
  interestDone: boolean
  aptitudeDone: boolean
  personalityScores: Record<string, number> | null
  interestScores: Record<string, number> | null
  aptitudeScores: Record<string, number> | null
  setModuleDone: (module: 'personality' | 'interest' | 'aptitude', scores: Record<string, number>) => void
  resetAssessment: () => void
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  personalityDone: false,
  interestDone: false,
  aptitudeDone: false,
  personalityScores: null,
  interestScores: null,
  aptitudeScores: null,

  setModuleDone: (module, scores) => set((state) => ({
    ...state,
    [`${module}Done`]: true,
    [`${module}Scores`]: scores,
  })),

  resetAssessment: () => set({
    personalityDone: false,
    interestDone: false,
    aptitudeDone: false,
    personalityScores: null,
    interestScores: null,
    aptitudeScores: null,
  }),
}))