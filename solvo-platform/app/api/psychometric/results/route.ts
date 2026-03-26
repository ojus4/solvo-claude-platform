import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Rate limiter — 20 requests / minute per IP (in-process memory store).
// Swap to RateLimiterRedis in production if you run multiple instances.
// ---------------------------------------------------------------------------
const rateLimiter = new RateLimiterMemory({
  points: 20,       // max requests
  duration: 60,     // per 60 seconds
  keyPrefix: "psych_results",
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ModuleResult {
  scores: Record<string, unknown>;
  primary_type: string;
  completed_at: string;
}

interface ResultsPayload {
  personality: ModuleResult | null;
  interest: ModuleResult | null;
  aptitude: ModuleResult | null;
}

interface SessionPayload {
  personality_done: boolean;
  interest_done: boolean;
  aptitude_done: boolean;
  all_complete: boolean;
  recommended_careers: string[] | null;
  completed_at: string | null;
}

interface SuccessResponse {
  results: ResultsPayload;
  session: SessionPayload;
}

// Canonical empty state returned for users who have not started yet.
const EMPTY_RESPONSE: SuccessResponse = {
  results: {
    personality: null,
    interest: null,
    aptitude: null,
  },
  session: {
    personality_done: false,
    interest_done: false,
    aptitude_done: false,
    all_complete: false,
    recommended_careers: null,
    completed_at: null,
  },
};

// ---------------------------------------------------------------------------
// Helper — derive client IP from common forwarding headers
// ---------------------------------------------------------------------------
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// GET /api/psychometric/results
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest): Promise<Response> {
  // ------------------------------------------------------------------
  // 1. Rate limiting
  // ------------------------------------------------------------------
  const ip = getClientIp(request);

  try {
    await rateLimiter.consume(ip);
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      return Response.json(
        { error: "Too many requests. Please wait before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(err.msBeforeNext / 1000)),
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
    // Unexpected error from the limiter — fail open rather than block users.
    console.error("[rate-limiter] Unexpected error:", err);
  }

  // ------------------------------------------------------------------
  // 2. Authentication — user-scoped client (respects RLS, uses JWT)
  // ------------------------------------------------------------------
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "Unauthorized. Please sign in to view your results." },
        { status: 401 }
      );
    }

    const userId = user.id;

    // ------------------------------------------------------------------
    // 3. Fetch psych_results rows for this user (admin client → no RLS)
    // ------------------------------------------------------------------
    const { data: psychRows, error: psychError } = await supabaseAdmin
      .from("psych_results")
      .select("module, scores, primary_type, completed_at")
      .eq("user_id", userId);

    if (psychError) {
      console.error("[psych_results] DB error:", psychError);
      return Response.json(
        { error: "Failed to fetch psychometric results." },
        { status: 500 }
      );
    }

    // ------------------------------------------------------------------
    // 4. Fetch assessment_session for this user (most recent row)
    // ------------------------------------------------------------------
    const { data: sessionRow, error: sessionError } = await supabaseAdmin
      .from("assessment_sessions")
      .select(
        "personality_done, interest_done, aptitude_done, recommended_careers, completed_at"
      )
      .eq("user_id", userId)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();                 // returns null instead of error when no row exists

    if (sessionError) {
      console.error("[assessment_sessions] DB error:", sessionError);
      return Response.json(
        { error: "Failed to fetch assessment session." },
        { status: 500 }
      );
    }

    // ------------------------------------------------------------------
    // 5. Early-exit with empty state if the user has no data at all
    // ------------------------------------------------------------------
    if (!psychRows?.length && !sessionRow) {
      return Response.json(EMPTY_RESPONSE, { status: 200 });
    }

    // ------------------------------------------------------------------
    // 6. Map psych_results rows into the results shape
    //    Each module should appear at most once; if somehow duplicated,
    //    we take the most recently completed entry.
    // ------------------------------------------------------------------
    type PsychRow = {
      module: string;
      scores: Record<string, unknown>;
      primary_type: string;
      completed_at: string;
    };

    // Sort descending so the first hit per module key is the latest.
    const sorted = [...(psychRows as PsychRow[])].sort(
      (a, b) =>
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );

    const moduleMap = new Map<string, ModuleResult>();
    for (const row of sorted) {
      const key = row.module?.toLowerCase();       // normalise "Personality" → "personality"
      if (key && !moduleMap.has(key)) {
        moduleMap.set(key, {
          scores: row.scores ?? {},
          primary_type: row.primary_type ?? "",
          completed_at: row.completed_at,
        });
      }
    }

    const results: ResultsPayload = {
      personality: moduleMap.get("personality") ?? null,
      interest: moduleMap.get("interest") ?? null,
      aptitude: moduleMap.get("aptitude") ?? null,
    };

    // ------------------------------------------------------------------
    // 7. Build session payload
    // ------------------------------------------------------------------
    const personalityDone = Boolean(sessionRow?.personality_done);
    const interestDone = Boolean(sessionRow?.interest_done);
    const aptitudeDone = Boolean(sessionRow?.aptitude_done);

    const session: SessionPayload = {
      personality_done: personalityDone,
      interest_done: interestDone,
      aptitude_done: aptitudeDone,
      all_complete: personalityDone && interestDone && aptitudeDone,
      recommended_careers:
        (sessionRow?.recommended_careers as string[] | null) ?? null,
      completed_at: sessionRow?.completed_at ?? null,
    };

    // ------------------------------------------------------------------
    // 8. Return combined payload
    // ------------------------------------------------------------------
    const payload: SuccessResponse = { results, session };
    return Response.json(payload, { status: 200 });

  } catch (err) {
    console.error("[GET /api/psychometric/results] Unhandled error:", err);
    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}