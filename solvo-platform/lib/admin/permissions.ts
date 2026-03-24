// =============================================================================
// SOLVO — Admin Role-Based Access Control (RBAC)
// =============================================================================
import type { AdminRole, AdminPermission } from '@/types'
import { createClient } from '@/lib/supabase/server'


// ─── Permission Matrix ────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'manage_promotions',
    'manage_blog',
    'manage_banners',
    'view_users',
    'manage_users',
    'view_revenue',
    'manage_settings',
    'manage_feature_flags',
    'manage_team',
  ],
  admin: [
    'manage_promotions',
    'manage_blog',
    'manage_banners',
    'view_users',
    'manage_users',
    'view_revenue',
    'manage_settings',
  ],
  content_manager: [
    'manage_blog',
    'manage_banners',
  ],
  marketing: [
    'manage_promotions',
    'manage_banners',
  ],
}


// ─── Navigation Config (role-specific sidebar) ────────────────────────────────

export interface NavItem {
  label: string
  href: string
  permission: AdminPermission
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Promotions',    href: '/admin/promotions', permission: 'manage_promotions' },
  { label: 'Banners',       href: '/admin/banners',    permission: 'manage_banners' },
  { label: 'Blog',          href: '/admin/blog',       permission: 'manage_blog' },
  { label: 'Settings',      href: '/admin/settings',   permission: 'manage_settings' },
  { label: 'Users',         href: '/admin/users',      permission: 'view_users' },
  { label: 'Revenue',       href: '/admin/revenue',    permission: 'view_revenue' },
  { label: 'Feature Flags', href: '/admin/flags',      permission: 'manage_feature_flags' },
  { label: 'Audit Log',     href: '/admin/audit-log',  permission: 'manage_team' }, // super_admin only
  { label: 'Team',          href: '/admin/team',       permission: 'manage_team' }, // super_admin only
]

export function getNavItemsForRole(role: AdminRole): NavItem[] {
  return ADMIN_NAV_ITEMS.filter(item =>
    ROLE_PERMISSIONS[role]?.includes(item.permission)
  )
}


// ─── Permission Checks ────────────────────────────────────────────────────────

// Pure function — use anywhere
export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function isAdminRole(role: string | null): role is AdminRole {
  return ['super_admin', 'admin', 'content_manager', 'marketing'].includes(role ?? '')
}


// ─── Server-side Auth Helper ──────────────────────────────────────────────────

interface AuthResult {
  allowed: boolean
  status: number
  adminId?: string
  adminEmail?: string
  adminRole?: AdminRole
  error?: string
}

// Use this at the top of every admin API route
export async function requireAdminPermission(
  permission: AdminPermission
): Promise<AuthResult> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { allowed: false, status: 401, error: 'Unauthorized' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('admin_role, email')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { allowed: false, status: 403, error: 'Profile not found' }
  }

  if (!isAdminRole(profile.admin_role)) {
    return { allowed: false, status: 403, error: 'Not an admin account' }
  }

  if (!hasPermission(profile.admin_role, permission)) {
    return {
      allowed: false,
      status: 403,
      error: `Your role (${profile.admin_role}) does not have the '${permission}' permission`
    }
  }

  return {
    allowed: true,
    status: 200,
    adminId: user.id,
    adminEmail: profile.email ?? user.email ?? '',
    adminRole: profile.admin_role,
  }
}


// ─── Audit Log Helper ─────────────────────────────────────────────────────────

import { supabaseAdmin } from '@/lib/supabase/admin-client'
import type { AuditActionType } from '@/types'

interface LogActionParams {
  adminId: string
  adminEmail: string
  adminRole: AdminRole
  action: AuditActionType
  targetUserId?: string
  targetEmail?: string
  changedFields?: Record<string, [unknown, unknown]>
  previousValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  reason?: string
  request?: Request
}

// Fires on every admin action that touches user data
// Audit logs are immutable — no UPDATE or DELETE policy on this table
export async function logAdminAction(params: LogActionParams): Promise<void> {
  const {
    adminId, adminEmail, adminRole, action,
    targetUserId, targetEmail,
    changedFields, previousValues, newValues,
    reason, request
  } = params

  await supabaseAdmin
    .from('admin_audit_log')
    .insert({
      admin_id:          adminId,
      admin_email:       adminEmail,
      admin_role:        adminRole,
      action_type:       action,
      target_user_id:    targetUserId ?? null,
      target_user_email: targetEmail ?? null,
      changed_fields:    changedFields ?? null,
      previous_values:   previousValues ?? null,
      new_values:        newValues ?? null,
      reason:            reason ?? null,
      ip_address:        request?.headers.get('x-forwarded-for') ?? null,
      user_agent:        request?.headers.get('user-agent') ?? null,
    })
  // Intentionally not throwing on failure — audit log write failure
  // should never block the actual admin action from completing.
  // Errors are caught by Sentry via the global error handler.
}