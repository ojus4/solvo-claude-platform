// =============================================================================
// SOLVO — Hidden Admin Entry Point
// Route: /access/[slug]
// The slug is validated in middleware.ts — if wrong, user sees homepage.
// This page only renders when the slug matches ADMIN_ACCESS_SLUG in .env.local
// =============================================================================
'use client'

import React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function AdminEntryPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (signInError) {
      setError('Invalid credentials.')
      setIsLoading(false)
      return
    }

    // Verify the logged-in user actually has an admin role
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Authentication failed.')
      setIsLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('admin_role')
      .eq('id', user.id)
      .single()

    if (!profile?.admin_role) {
      // Logged in but not admin — sign them out and show generic error
      await supabase.auth.signOut()
      setError('Invalid credentials.')
      setIsLoading(false)
      return
    }

    // Valid admin — redirect to admin panel
    router.push('/admin/promotions')
  }

  return (
    // Minimal, nondescript page — intentionally no SOLVO branding
    // This makes it harder for someone stumbling on this URL to know what it is
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <h1 className="text-lg font-semibold text-gray-900 mb-5">
            Sign in
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className={cn(
                'w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white',
                'bg-gray-900 hover:bg-gray-700 transition-colors',
                (isLoading || !email || !password) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? 'Signing in...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}