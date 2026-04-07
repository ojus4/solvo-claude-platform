import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin-client';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Rate limiter — 5 requests per 60 seconds, keyed by IP
// ---------------------------------------------------------------------------
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60, // seconds
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type PsychModule = 'personality' | 'interest' | 'aptitude' | 'eq';

const VALID_MODULES: PsychModule[] = ['personality', 'interest', 'aptitude', 'eq'];

interface SubmitBody {
  module: PsychModule;
  raw_answers: Record<string, unknown>;
  scores: Record<string, unknown>;
  primary_type: string;
}

// Map each module to its boolean column in assessment_sessions
const MODULE_COLUMN: Record<PsychModule, keyof AssessmentSessionFlags> = {
  personality: 'personality_done',
  interest: 'interest_done',
  aptitude: 'aptitude_done',
  eq: 'eq_done', // added new module 'eq' with corresponding column
};

interface AssessmentSessionFlags {
  personality_done: boolean;
  interest_done: boolean;
  aptitude_done: boolean;
  eq_done: boolean; // added new flag for 'eq' module
}

// ---------------------------------------------------------------------------
// Helper — derive client IP from various Next.js / proxy headers
// ---------------------------------------------------------------------------
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

// ---------------------------------------------------------------------------
// POST /api/psychometric/submit
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // ── 1. Rate limiting ──────────────────────────────────────────────────────
  const ip = getClientIp(request);

  try {
    await rateLimiter.consume(ip);
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      return Response.json(
        { success: false, error: 'Too many requests. Please wait a moment and try again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(err.msBeforeNext / 1000)),
          },
        },
      );
    }
    // Unexpected rate-limiter error — fail open with a warning log
    console.error('[psychometric/submit] Rate limiter unexpected error:', err);
  }

  // ── 2. Authentication ─────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json(
      { success: false, error: 'Unauthorized. Please sign in to continue.' },
      { status: 401 },
    );
  }

  const userId = user.id;

  // ── 3. Parse & validate body ──────────────────────────────────────────────
  let body: Partial<SubmitBody>;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const { module: psychModule, raw_answers, scores, primary_type } = body;

  if (!psychModule || !(VALID_MODULES as string[]).includes(psychModule)) {
    return Response.json(
      {
        success: false,
        error: `Invalid module. Must be one of: ${VALID_MODULES.join(', ')}.`,
      },
      { status: 400 },
    );
  }

  if (
    !raw_answers ||
    typeof raw_answers !== 'object' ||
    Array.isArray(raw_answers)
  ) {
    return Response.json(
      { success: false, error: 'raw_answers must be a non-array object.' },
      { status: 400 },
    );
  }

  if (!scores || typeof scores !== 'object' || Array.isArray(scores)) {
    return Response.json(
      { success: false, error: 'scores must be a non-array object.' },
      { status: 400 },
    );
  }

  if (!primary_type || typeof primary_type !== 'string' || !primary_type.trim()) {
    return Response.json(
      { success: false, error: 'primary_type must be a non-empty string.' },
      { status: 400 },
    );
  }

  // ── 4. Use admin client for all DB writes (bypasses RLS) ──────────────────
  const admin = supabaseAdmin;

  try {
    // ── 5. Insert into psych_results ────────────────────────────────────────
    const { data: resultRow, error: insertError } = await admin
      .from('psych_results')
      .insert({
        user_id: userId,
        module: psychModule,
        raw_answers,
        scores,
        primary_type: primary_type.trim(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[psychometric/submit] psych_results insert error:', insertError);
      return Response.json(
        { success: false, error: 'Failed to save psychometric result.' },
        { status: 500 },
      );
    }

    const resultId: string = resultRow.id;

    // ── 6. Check if this is the first submission for this module ─────────────
    //    (count existing rows for this user + module, excluding the one we
    //     just inserted — if count is now exactly 1 it's the first ever)
    const { count: moduleCount, error: countError } = await admin
      .from('psych_results')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('module', psychModule);

    if (countError) {
      console.error('[psychometric/submit] module count error:', countError);
      // Non-fatal — we still return the resultId but skip session update
      return Response.json({ success: true, resultId });
    }

    const isFirstForModule = (moduleCount ?? 0) === 1;

    if (isFirstForModule) {
      // ── 7. Upsert assessment_sessions — mark this module done ─────────────
      const sessionPatch: Partial<AssessmentSessionFlags> & { user_id: string } = {
        user_id: userId,
        [MODULE_COLUMN[psychModule]]: true,
      };

      const { error: upsertError } = await admin
        .from('assessment_sessions')
        .upsert(sessionPatch, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('[psychometric/submit] assessment_sessions upsert error:', upsertError);
        // Non-fatal — result is saved, session state just wasn't updated
        return Response.json({ success: true, resultId });
      }

      // ── 8. Check if all three modules are now complete ────────────────────
      const { data: sessionRow, error: sessionFetchError } = await admin
        .from('assessment_sessions')
        .select('personality_done, interest_done, aptitude_done, eq_done')
        .eq('user_id', userId)
        .single();

      if (sessionFetchError) {
        console.error('[psychometric/submit] session fetch error:', sessionFetchError);
        return Response.json({ success: true, resultId });
      }

      const allDone =
        sessionRow.personality_done === true &&
        sessionRow.interest_done === true &&
        sessionRow.aptitude_done === true &&
        sessionRow.eq_done === true; // include new module in completion check

      // ── 9. If all done, stamp completed_at ───────────────────────────────
      if (allDone) {
        const { error: completeError } = await admin
          .from('assessment_sessions')
          .update({ completed_at: new Date().toISOString() })
          .eq('user_id', userId);

        if (completeError) {
          console.error('[psychometric/submit] completed_at update error:', completeError);
          // Non-fatal — assessment is still logically complete
        }
      }
    }

    // ── 10. Success ──────────────────────────────────────────────────────────
    return Response.json({ success: true, resultId }, { status: 201 });
  } catch (err) {
    console.error('[psychometric/submit] Unhandled error:', err);
    return Response.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}