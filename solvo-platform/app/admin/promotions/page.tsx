// =============================================================================
// SOLVO — Admin Promotions Placeholder
// Route: /admin/promotions
// Protected by middleware — only admin roles can reach this page.
// Replace with full admin panel in Category V.
// =============================================================================
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPromotionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('admin_role, email')
    .eq('id', user.id)
    .single()

  if (!profile?.admin_role) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 mb-6">
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-sm">Admin access working</span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            Hidden entry slug validated. Admin role verified. Middleware allowed access.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Admin session</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="text-gray-900 font-medium capitalize">
                {profile.admin_role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Full admin panel UI will be built in Category V.
        </p>
      </div>
    </div>
  )
}