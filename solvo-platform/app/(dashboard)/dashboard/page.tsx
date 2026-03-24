// =============================================================================
// SOLVO — Dashboard Placeholder
// Route: /dashboard
// This is a protected route — middleware redirects unauthenticated users to /login.
// Replace with the full dashboard in Category K.
// =============================================================================
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-lg mx-auto">

        {/* Success banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 mb-6">
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-sm">Auth is working correctly</span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            You are logged in. Middleware protected this route successfully.
          </p>
        </div>

        {/* Profile debug card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Logged in as</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="text-gray-900 font-medium">{profile?.full_name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900">{profile?.email ?? user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tier</span>
              <span className="text-gray-900 capitalize">{profile?.tier ?? 'explorer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Admin role</span>
              <span className="text-gray-900">{profile?.admin_role ?? 'none'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">User ID</span>
              <span className="text-gray-400 font-mono text-xs">{user.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          This placeholder will be replaced by the full dashboard in Category K.
        </p>

        {/* Sign out */}
        <form action="/api/auth/signout" method="post" className="mt-4 text-center">
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}