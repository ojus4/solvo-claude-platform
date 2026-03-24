// =============================================================================
// SOLVO — Middleware
// Runs on every request before the page renders.
// Handles: session refresh, route protection, admin access, hidden entry point.
// =============================================================================
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the auth session — keeps the user logged in across page loads
  // IMPORTANT: Do not write any logic between createServerClient and
  // supabase.auth.getUser(). A seemingly innocuous action like a console.log
  // will break session refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user, supabase }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── Step 1: Refresh the Supabase session ──────────────────────────────
  // This MUST happen first — it refreshes the auth token so it doesn't expire
  const { supabaseResponse, user } = await updateSession(request)


  // ─── Step 2: Block direct access to /admin ─────────────────────────────
  // The real admin entry is through the hidden slug, not /admin/login
  // Unauthenticated users trying to reach /admin are redirected to home page
  // (no hint that /admin exists)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      // Silent redirect to homepage — no error message, no login page
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if the logged-in user has any admin role
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('admin_role, is_suspended')
      .eq('id', user.id)
      .single()

    // Suspended accounts cannot access admin
    if (profile?.is_suspended) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // No admin role — redirect to their dashboard, not an error page
    if (!profile?.admin_role) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Has admin role — allow through
    return supabaseResponse
  }


  // ─── Step 3: Protect dashboard routes ─────────────────────────────────
  // User must be logged in to access these pages
  const protectedRoutes = ['/dashboard', '/results', '/roadmap', '/checkout', '/success']
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    // Save where they were trying to go so we can redirect back after login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }


  // ─── Step 4: Redirect logged-in users away from auth pages ────────────
  // If already logged in, don't show login/signup pages
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }


  // ─── Step 5: Validate the hidden admin entry slug ──────────────────────
  // The /access/[slug] route is the only way to reach admin login
  // We validate the slug matches the env variable
  if (pathname.startsWith('/access/')) {
    const slugFromUrl = pathname.replace('/access/', '').split('/')[0]
    const validSlug = process.env.ADMIN_ACCESS_SLUG

    if (!slugFromUrl || slugFromUrl !== validSlug) {
      // Wrong slug — silent redirect to home, no hint that this route matters
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Valid slug — allow through to the page handler
    return supabaseResponse
  }

  // ─── Step 6: Default case ─────────────────────────────────────────────
  // For all other routes, just return the supabase response (with refreshed session)
  return supabaseResponse
}