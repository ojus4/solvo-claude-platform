// =============================================================================
// SOLVO — Auth Callback Route
// Handles redirects from:
//   - Google OAuth (after user approves)
//   - Email confirmation links (after user clicks email link)
// Route: /auth/callback
// =============================================================================
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Validate the 'next' param to prevent open redirect attacks
  // Only allow relative paths that start with /
  const safeNext = next.startsWith('/') ? next : '/dashboard'

  if (code) {
    const supabase = await createClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful authentication — redirect to intended destination
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${safeNext}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safeNext}`)
      } else {
        return NextResponse.redirect(`${origin}${safeNext}`)
      }
    }
  }

  // Auth failed — redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-error`)
}