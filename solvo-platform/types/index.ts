// =============================================================================
// SOLVO — Global TypeScript Types
// Import from anywhere: import type { Profile, Promotion } from '@/types'
// =============================================================================


// ─── Tier & Role Enums ────────────────────────────────────────────────────────

export type UserTier = 'explorer' | 'achiever' | 'accelerator'

export type AdminRole = 'super_admin' | 'admin' | 'content_manager' | 'marketing'

export type AdminPermission =
  | 'manage_promotions'
  | 'manage_blog'
  | 'manage_banners'
  | 'view_users'
  | 'manage_users'
  | 'view_revenue'
  | 'manage_settings'
  | 'manage_feature_flags'
  | 'manage_team'


// ─── User / Profile ───────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  city: string | null
  education_level: 'high_school' | 'undergraduate' | 'postgraduate' | 'working' | null
  is_premium: boolean
  tier: UserTier
  admin_role: AdminRole | null
  utm_source: string | null
  utm_medium: string | null
  referral_code: string | null
  avatar_url: string | null
  is_suspended: boolean
  suspended_at: string | null
  suspended_reason: string | null
  suspended_by: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string
}


// ─── Assessment ───────────────────────────────────────────────────────────────

export type AssessmentModule = 'personality' | 'interest' | 'aptitude'

export interface PsychResult {
  id: string
  user_id: string
  module: AssessmentModule
  version: number
  raw_answers: Record<string, number> | null
  scores: Record<string, number>
  primary_type: string | null
  secondary_type: string | null
  completed_at: string
}

export interface AssessmentSession {
  id: string
  user_id: string
  personality_done: boolean
  interest_done: boolean
  aptitude_done: boolean
  pdf_generated: boolean
  pdf_url: string | null
  recommended_careers: string[] | null
  started_at: string
  completed_at: string | null
}

export interface PersonalityScores {
  Openness: number
  Conscientiousness: number
  Extraversion: number
  Agreeableness: number
  Neuroticism: number
}

export interface InterestScores {
  Realistic: number
  Investigative: number
  Artistic: number
  Social: number
  Enterprising: number
  Conventional: number
}

export interface AptitudeScores {
  total: number
  numerical: number
  verbal: number
  logical: number
}

export interface AssessmentQuestion {
  id: number
  text_en: string
  text_hi?: string
  trait: string
  polarity: 1 | -1
  category?: string   // For aptitude: 'numerical' | 'verbal' | 'logical'
  options?: AptitudeOption[]
}

export interface AptitudeOption {
  id: string
  text: string
  is_correct: boolean
}


// ─── Career Roadmap ───────────────────────────────────────────────────────────

export interface RoadmapNode {
  id: string
  type?: 'input' | 'output' | 'default'
  data: {
    label: string
    description?: string
    duration?: string
    resource_url?: string
    is_free_preview: boolean
    is_premium_locked?: boolean
  }
  position: { x: number; y: number }
}

export interface RoadmapEdge {
  id: string
  source: string
  target: string
  animated?: boolean
}

export interface Roadmap {
  nodes: RoadmapNode[]
  edges: RoadmapEdge[]
}

export type CareerSlug =
  | 'data_science'
  | 'ui_ux'
  | 'digital_marketing'
  | 'finance'
  | 'software_engineering'


// ─── Payments & Orders ────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Order {
  id: string                    // Razorpay Order ID
  user_id: string
  tier_purchased: UserTier
  amount_paise: number
  currency: string
  status: OrderStatus
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  plan_duration_months: number
  metadata: Record<string, unknown> | null
  created_at: string
  paid_at: string | null
}

export interface Subscription {
  id: string
  user_id: string
  order_id: string | null
  coach_name: string | null
  coach_calendly_link: string | null
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  starts_at: string
  expires_at: string
  created_at: string
}


// ─── CMS — Promotions ─────────────────────────────────────────────────────────

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_upgrade' | 'bundle'
export type PromotionStatus = 'disabled' | 'scheduled' | 'live' | 'expired'

export interface Promotion {
  id: string
  name: string
  slug: string
  discount_type: DiscountType
  discount_value: number | null
  applies_to_tier: 'achiever' | 'accelerator' | 'all' | null
  original_price_paise: number | null
  sale_price_paise: number | null
  banner_message: string | null
  banner_colour: string
  badge_text: string | null
  show_countdown_timer: boolean
  auto_apply: boolean
  coupon_code: string | null
  starts_at: string
  ends_at: string
  is_active: boolean
  status: PromotionStatus
  requires_approval: boolean
  approved_by: string | null
  approval_note: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}


// ─── CMS — Banners ────────────────────────────────────────────────────────────

export type BannerType = 'info' | 'warning' | 'success' | 'promotion'

export interface SiteBanner {
  id: string
  message: string
  link_text: string | null
  link_url: string | null
  banner_type: BannerType
  background_colour: string | null
  text_colour: string | null
  is_dismissible: boolean
  show_on_pages: string[]
  position: 'top' | 'below_nav'
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  created_at: string
}


// ─── CMS — Blog ───────────────────────────────────────────────────────────────

export type BlogStatus = 'draft' | 'pending_review' | 'published' | 'archived'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  author_name: string
  author_avatar_url: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string[] | null
  og_image_url: string | null
  category: string | null
  tags: string[] | null
  related_career: CareerSlug | null
  status: BlogStatus
  is_featured: boolean
  published_at: string | null
  view_count: number
  read_time_minutes: number | null
  created_at: string
  updated_at: string
}


// ─── CMS — Site Settings ──────────────────────────────────────────────────────

export type SettingValueType = 'string' | 'number' | 'boolean' | 'json'

export interface SiteSetting {
  key: string
  value: string
  description: string | null
  value_type: SettingValueType
  updated_at: string
  updated_by: string | null
}


// ─── Admin Audit Log ──────────────────────────────────────────────────────────

export type AuditActionType =
  | 'view_account'
  | 'view_test_results'
  | 'view_payment_history'
  | 'impersonate_start'
  | 'impersonate_end'
  | 'upgrade_tier'
  | 'downgrade_tier'
  | 'edit_profile'
  | 'reset_assessment'
  | 'suspend_account'
  | 'unsuspend_account'
  | 'delete_account'
  | 'add_note'

export interface AuditLog {
  id: string
  admin_id: string
  admin_email: string
  admin_role: AdminRole
  action_type: AuditActionType
  target_user_id: string | null
  target_user_email: string | null
  changed_fields: Record<string, [unknown, unknown]> | null
  previous_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  reason: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}


// ─── Admin Invitations ────────────────────────────────────────────────────────

export interface AdminInvitation {
  id: string
  email: string
  role: Exclude<AdminRole, 'super_admin'>
  token: string
  invited_by: string | null
  accepted: boolean
  expires_at: string
  created_at: string
}


// ─── Blocked Identifiers ─────────────────────────────────────────────────────

export type BlockedIdentifierType = 'email' | 'ip_address' | 'device_fingerprint'

export interface BlockedIdentifier {
  id: string
  identifier_type: BlockedIdentifierType
  identifier_value: string
  reason: string
  blocked_by: string | null
  is_permanent: boolean
  expires_at: string | null
  created_at: string
}


// ─── Skill Library ────────────────────────────────────────────────────────────

export interface Skill {
  id: number
  skill_name: string
  category: string
  subcategory: string | null
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  platform: string
  course_name: string
  duration_weeks: number | null
  duration_hours: number | null
  is_free: boolean
  has_certificate: boolean
  url: string
  career_tags: string[]
  language: string
  rating: number | null
}


// ─── Job Market Data ──────────────────────────────────────────────────────────

export interface JobTrend {
  id: number
  month: string                  // Format: "2024-01"
  job_title: string
  industry: string
  city: string
  experience_level: string
  avg_salary_lpa: number
  median_salary_lpa: number
  job_count_estimate: number
  top_skills_required: string[]
  growth_rate_yoy: number
  source: string
}


// ─── Site Config (loaded by useSiteConfig hook) ───────────────────────────────

export interface SiteConfig {
  activePromotion: Promotion | null
  activeBanners: SiteBanner[]
  settings: Record<string, string>
}


// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError


// ─── Impersonation ────────────────────────────────────────────────────────────

export interface ImpersonationSession {
  id: string
  admin_id: string
  target_user_id: string
  session_token: string
  is_active: boolean
  started_at: string
  ended_at: string | null
  actions_taken: string[]
}