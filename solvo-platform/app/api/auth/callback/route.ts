// =============================================================================
// SOLVO — Auth Callback Route
// Handles redirects from:
//   - Google OAuth (after user approves)
//   - Email confirmation links (after user clicks email link)
// Route: GET /auth/callback
// =============================================================================
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/send'

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
      // After successful session exchange, send welcome email for new users
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, created_at')
        .eq('id', user.id)
        .single()
  
  // Only send welcome email if account is less than 2 minutes old
  const isNewUser = profile?.created_at && 
    (Date.now() - new Date(profile.created_at).getTime()) < 120000
  
  if (isNewUser) {
    // Import and call sendWelcomeEmail (non-blocking)
    sendWelcomeEmail({ 
      to: user.email!, 
      fullName: profile?.full_name ?? '' 
    }).catch(console.error)
  }
}

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
// **Why this matters:**
// - Proper error handling ensures users get clear feedback when something goes wrong, instead of being confused by unexpected redirects or missing sessions.
// - Open redirect protection is crucial for security — without it, attackers could craft links that appear to come from your site but actually send users to malicious sites. 

// **What was wrong:**
// - No error handling on `exchangeCodeForSession` — if Google OAuth failed, the user was silently redirected to dashboard with no session
// - No open redirect protection on the `next` param — a malicious link like `/auth/callback?next=https://evil.com` would redirect users off your site

