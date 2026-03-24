// =============================================================================
// SOLVO — Supabase Admin Client (Service Role)
// CRITICAL: NEVER import this file in any frontend component or client code.
//           This key bypasses ALL Row Level Security.
//           Only use inside API routes AFTER verifying the caller is an admin.
// =============================================================================
import { createClient } from '@supabase/supabase-js'

// This is a module-level singleton — created once, reused across requests
// The service role key is only available server-side (no NEXT_PUBLIC_ prefix)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      // Disable auto-refresh for server-side admin operations
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)