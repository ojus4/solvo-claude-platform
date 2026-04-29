import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin-client';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { NextRequest } from 'next/server';

// Scoring functions — server-side only, never trust client-supplied values
import { calculateBigFive } from '@/lib/scoring/calculate-big-five';
import { calculateRiasec } from '@/lib/scoring/calculate-riasec';
import { calculateAptitude } from '@/lib/scoring/calculate-aptitude';
import { calculateEq } from '@/lib/scoring/calculate-eq';

// Import types for casting
import type { BigFiveAnswers } from '@/lib/scoring/calculate-big-five';
import type { RiasecAnswers } from '@/lib/scoring/calculate-riasec';
import type { AptitudeAnswers } from '@/lib/scoring/calculate-aptitude';
import type { EqAnswers } from '@/lib/scoring/calculate-eq';

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
  // scores and primary_type are intentionally absent —
  // any values the client sends for these are silently ignored.
  // Both are computed server-side from raw_answers only.
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
// Server-side scoring dispatcher
// ---------------------------------------------------------------------------
interface ScoringResult {
  scores: Record<string, number>;
  primary_type: string;
}

function computeScores(
  psychModule: PsychModule,
  raw_answers: Record<string, unknown>,
): ScoringResult {
  switch (psychModule) {
    case 'personality': {
      const result = calculateBigFive(raw_answers as BigFiveAnswers);
      return { scores: result.percentage, primary_type: result.primaryTrait };
    }
    case 'interest': {
      const result = calculateRiasec(raw_answers as RiasecAnswers);
      return { scores: result.counts, primary_type: result.hollandCode };
    }
    case 'aptitude': {
      const result = calculateAptitude(raw_answers as AptitudeAnswers);
      return { scores: { Numerical: result.categories.Numerical.percentage, Verbal: result.categories.Verbal.percentage, Logical: result.categories.Logical.percentage }, primary_type: String(result.overallPercentage) };
    }
    case 'eq': {
      const result = calculateEq(raw_answers as EqAnswers);
      return { scores: result.categories, primary_type: String(result.overallEqScore) };
    }
    default: {
      // TypeScript exhaustiveness guard — never reached at runtime
      const _exhaustive: never = psychModule;
      throw new Error(`Unhandled module: ${_exhaustive}`);
    }
  }
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

  // scores and primary_type are NOT destructured — never read from the client.
  const { module: psychModule, raw_answers } = body;

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

  // ── 4. Server-side score calculation ──────────────────────────────────────
  let scores: Record<string, number>;
  let primary_type: string;

  try {
    const result = computeScores(psychModule, raw_answers);
    scores = result.scores;
    primary_type = result.primary_type;
  } catch (err) {
    console.error('[psychometric/submit] Scoring error:', err);
    return Response.json(
      {
        success: false,
        error: 'Score calculation failed. Please verify your answers and try again.',
      },
      { status: 422 },
    );
  }

  // ── 5. Use admin client for all DB writes (bypasses RLS) ──────────────────
  const admin = supabaseAdmin;

  // Check if already submitted this module
  const { data: existing, error: checkError } = await admin
    .from('psych_results')
    .select('id')
    .eq('user_id', userId)
    .eq('module', psychModule);

  if (checkError) {
    console.error('[psychometric/submit] Check existing error:', checkError);
    return Response.json(
      { success: false, error: 'Failed to check submission status.' },
      { status: 500 },
    );
  }

  if (existing && existing.length > 0) {
    return Response.json(
      { success: false, error: 'You have already submitted this module.' },
      { status: 400 },
    );
  }

  try {
    // ── 6. Insert into psych_results ────────────────────────────────────────
    const { data: resultRow, error: insertError } = await admin
      .from('psych_results')
      .insert({
        user_id: userId,
        module: psychModule,
        raw_answers,
        scores,        // server-calculated
        primary_type,  // server-calculated
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

    // ── 7. Check if this is the first submission for this module ─────────────
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
      // ── 8. Upsert assessment_sessions — mark this module done ─────────────
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

      // ── 9. Check if all 4 modules are now complete ────────────────────────
      const { data: sessionRow, error: sessionFetchError } = await supabaseAdmin
        .from('assessment_sessions')
        .select('personality_done, interest_done, aptitude_done, eq_done, completed_at')
        .eq('user_id', userId)
        .single();

      if (!sessionFetchError && sessionRow) {
        const allDone =
          sessionRow.personality_done &&
          sessionRow.interest_done &&
          sessionRow.aptitude_done &&
          sessionRow.eq_done;

        if (allDone && !sessionRow.completed_at) {
          // ── 9a. Fetch all psych_results to run career recommender ─────────────
          const { data: allResults } = await supabaseAdmin
            .from('psych_results')
            .select('module, scores, primary_type')
            .eq('user_id', userId);

          let recommendedCareers: string[] = [];

          if (allResults && allResults.length >= 3) {
            try {
              // Import scoring functions server-side
              const { calculateBigFive } = await import('@/lib/scoring/calculate-big-five');
              const { calculateRiasec } = await import('@/lib/scoring/calculate-riasec');
              const { calculateAptitude } = await import('@/lib/scoring/calculate-aptitude');
              const { generateRecommendations } = await import('@/lib/scoring/career-recommender');

              // Find each module's saved raw_answers
              const { data: rawResults } = await supabaseAdmin
                .from('psych_results')
                .select('module, raw_answers')
                .eq('user_id', userId);

              const rawMap: Record<string, Record<string, unknown>> = {};
              rawResults?.forEach((r) => {
                rawMap[r.module] = r.raw_answers as Record<string, unknown>;
              });

              // Re-calculate scores from raw_answers for the recommender
              const bigFiveScores = rawMap['personality']
                ? calculateBigFive(rawMap['personality'] as any)
                : null;

              const riasecScores = rawMap['interest']
                ? calculateRiasec(rawMap['interest'] as any)
                : null;

              const aptitudeScores = rawMap['aptitude']
                ? calculateAptitude(rawMap['aptitude'] as any)
                : null;

              if (bigFiveScores && riasecScores && aptitudeScores) {
                const recommendations = generateRecommendations(
                  bigFiveScores,
                  riasecScores,
                  aptitudeScores,
                );
                recommendedCareers = recommendations.map((r) => r.id);
              }
            } catch (err) {
              console.error('[psychometric/submit] Career recommender error:', err);
              // Non-fatal — stamp completion without careers
            }
          }

          // ── 9b. Stamp completed_at and save recommended_careers ───────────────
          await supabaseAdmin
            .from('assessment_sessions')
            .update({
              completed_at: new Date().toISOString(),
              recommended_careers: recommendedCareers,
            })
            .eq('user_id', userId);

          console.log(
            `[psychometric/submit] Assessment complete for ${userId}. ` +
            `Recommended careers: ${recommendedCareers.join(', ')}`
          );
        }
      }
    }

    // ── 11. Success ──────────────────────────────────────────────────────────
    return Response.json({ success: true, resultId }, { status: 201 });
  } catch (err) {
    console.error('[psychometric/submit] Unhandled error:', err);
    return Response.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}