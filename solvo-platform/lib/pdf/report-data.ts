// ─────────────────────────────────────────────────────────────────────────────
// SOLVO — PDF Report Data Types
// lib/pdf/report-data.ts
//
// Pure type definitions and helper constants consumed by every PDF page
// component. No runtime logic, no imports — types and const exports only.
// ─────────────────────────────────────────────────────────────────────────────

// ─── User / Report Metadata ──────────────────────────────────────────────────

export interface PdfUser {
  /** Student's display name pulled from profiles.full_name */
  full_name: string
  /** Account email pulled from profiles.email */
  email: string
  /** Subscription tier, e.g. "free" | "basic" | "premium" */
  tier: string
  /** Human-readable report identifier, e.g. "SOLVO-45BDE7-1K2M3N" */
  report_id: string
  /** ISO 8601 date string of when the PDF was generated */
  generated_at: string
}

// ─── Big-Five Personality (OCEAN) ────────────────────────────────────────────

export interface PdfPersonalityScores {
  /** Openness — 0 to 100 */
  O: number
  /** Conscientiousness — 0 to 100 */
  C: number
  /** Extraversion — 0 to 100 */
  E: number
  /** Agreeableness — 0 to 100 */
  A: number
  /** Neuroticism — 0 to 100 */
  N: number
  /** Single-character key of the highest-scoring trait, e.g. "O" */
  primary_trait: string
}

// ─── RIASEC Interest Profile ─────────────────────────────────────────────────

export interface PdfInterestScores {
  /** Realistic — 0 to 100 */
  R: number
  /** Investigative — 0 to 100 */
  I: number
  /** Artistic — 0 to 100 */
  A: number
  /** Social — 0 to 100 */
  S: number
  /** Enterprising — 0 to 100 */
  E: number
  /** Conventional — 0 to 100 */
  C: number
  /** Three-letter Holland code derived from top three scores, e.g. "IAS" */
  holland_code: string
}

// ─── Aptitude ────────────────────────────────────────────────────────────────

export interface PdfAptitudeScores {
  /** Numerical reasoning — percentage 0 to 100 */
  Numerical: number
  /** Verbal reasoning — percentage 0 to 100 */
  Verbal: number
  /** Logical reasoning — percentage 0 to 100 */
  Logical: number
  /** Weighted / averaged overall aptitude score — percentage 0 to 100 */
  overall: number
}

// ─── Emotional Intelligence (EQ) ─────────────────────────────────────────────

export interface PdfEqScores {
  /** Self-Awareness sub-score — percentage 0 to 100 */
  selfAwareness: number
  /** Emotional Regulation sub-score — percentage 0 to 100 */
  emotionalRegulation: number
  /** Communication sub-score — percentage 0 to 100 */
  communication: number
  /** Empathy sub-score — percentage 0 to 100 */
  empathy: number
  /** Adaptability sub-score — percentage 0 to 100 */
  adaptability: number
  /** Composite EQ score — percentage 0 to 100 */
  overall: number
}

// ─── Career Recommendation ───────────────────────────────────────────────────

export interface PdfCareer {
  /** Stable snake_case identifier, e.g. "data_science" */
  id: string
  /** Human-readable career title, e.g. "Data Scientist" */
  title: string
  /** Algorithm-derived match strength — percentage 0 to 100 */
  matchPercentage: number
  /** Two-to-three sentence description shown on the Career page */
  description: string
}

// ─── Root Report Payload ─────────────────────────────────────────────────────

/**
 * The single object passed down from the data-fetching layer into
 * <ReportDocument />. Nullable module scores reflect assessments that the
 * student has not yet completed; premium flag gates locked pages.
 */
export interface PdfReportData {
  user: PdfUser
  /** null when the personality module has not been completed */
  personality: PdfPersonalityScores | null
  /** null when the interest module has not been completed */
  interest: PdfInterestScores | null
  /** null when the aptitude module has not been completed */
  aptitude: PdfAptitudeScores | null
  /** null when the EQ module has not been completed */
  eq: PdfEqScores | null
  /** Ordered list; top three are shown on the Career page (up to all for premium) */
  recommended_careers: PdfCareer[]
  /** Mirrors profiles.is_premium; controls gating of premium-only pages */
  is_premium: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Constants
// Consumed by chart labels, legend text, and descriptive callouts across pages.
// ─────────────────────────────────────────────────────────────────────────────

/** Short display labels for each OCEAN trait key */
export const TRAIT_LABELS: Record<string, string> = {
  O: 'Openness',
  C: 'Conscientiousness',
  E: 'Extraversion',
  A: 'Agreeableness',
  N: 'Neuroticism',
}

/** One-line descriptor shown beneath each OCEAN bar / score */
export const TRAIT_DESCRIPTIONS: Record<string, string> = {
  O: 'Curiosity, creativity, and openness to new experiences',
  C: 'Organisation, dependability, and self-discipline',
  E: 'Sociability, assertiveness, and positive emotions',
  A: 'Cooperation, empathy, and trust in others',
  N: 'Emotional sensitivity and tendency to experience stress',
}

/** Short display labels for each RIASEC dimension key */
export const RIASEC_LABELS: Record<string, string> = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
}

/** One-line descriptor shown beneath each RIASEC bar / radar spoke */
export const RIASEC_DESCRIPTIONS: Record<string, string> = {
  R: 'Hands-on, practical, and mechanical',
  I: 'Analytical, intellectual, and research-oriented',
  A: 'Creative, expressive, and artistic',
  S: 'Helpful, empathetic, and people-oriented',
  E: 'Persuasive, leadership-oriented, and entrepreneurial',
  C: 'Organised, detail-oriented, and systematic',
}

/** Display labels for each EQ sub-dimension key */
export const EQ_LABELS: Record<string, string> = {
  selfAwareness: 'Self-Awareness',
  emotionalRegulation: 'Emotional Regulation',
  communication: 'Communication',
  empathy: 'Empathy',
  adaptability: 'Adaptability',
}

/**
 * Centralised brand palette used by every PDF page component.
 * Values are hex strings so they work identically in react-pdf (StyleSheet)
 * and plain HTML/Canvas fallback renderers.
 */
export const BRAND_COLORS = {
  /** Electric blue — primary CTAs, headings, progress bars */
  primary: '#1B4FFF',
  /** Warm orange — highlights, accent chips, match badges */
  secondary: '#FF6B35',
  /** Emerald green — positive scores, completion ticks */
  success: '#10B981',
  /** Amber — medium scores, cautionary indicators */
  warning: '#F59E0B',
  /** Near-black navy — body text, dark backgrounds */
  dark: '#0A0F1E',
  /** Mid-grey — secondary text, captions, muted labels */
  muted: '#6B7280',
  /** Off-white — section backgrounds, card fills */
  lightBg: '#F3F4F6',
  /** Pure white — page background, reversed text */
  white: '#FFFFFF',
} as const

/** Derive a strongly-typed union of BRAND_COLORS keys for prop validation */
export type BrandColorKey = keyof typeof BRAND_COLORS