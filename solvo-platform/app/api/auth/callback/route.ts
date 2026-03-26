import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  // Default redirect is to dashboard
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    // This is the catcher's mitt: it takes the Google code and securely creates the Next.js cookies
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Send the user to the dashboard
  return NextResponse.redirect(new URL(next, request.url));
}