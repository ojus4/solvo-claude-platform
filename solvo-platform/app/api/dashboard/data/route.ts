import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

// ---------------------------------------------------------------------------
// Rate limiter — 30 requests per 60 seconds per IP
// ---------------------------------------------------------------------------
const rateLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60, // seconds
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Tier = "explorer" | "achiever" | "accelerator";
type AssessmentStatus = "not_started" | "in_progress" | "complete";

interface ModuleResult {
  scores: object;
  primary_type: string;
  completed_at: string;
}

interface DashboardResponse {
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    is_premium: boolean;
    tier: Tier;
    avatar_url: string | null;
    created_at: string;
  };
  assessment: {
    status: AssessmentStatus;
    personality_done: boolean;
    interest_done: boolean;
    aptitude_done: boolean;
    recommended_careers: string[] | null;
    completed_at: string | null;
    pdf_generated: boolean;
    pdf_url: string | null;
  };
  results: {
    personality: ModuleResult | null;
    interest: ModuleResult | null;
    aptitude: ModuleResult | null;
  };
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/data
// ---------------------------------------------------------------------------
export async function GET(request: Request): Promise<Response> {
  // ── 1. Rate limiting ──────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  try {
    await rateLimiter.consume(ip);
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      return Response.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(err.msBeforeNext / 1000)),
            "X-RateLimit-Limit": "30",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
    // Unexpected rate-limiter error — fail open so users aren't blocked
    console.error("[dashboard/data] Rate limiter error:", err);
  }

  // ── 2. Auth ───────────────────────────────────────────────────────────────
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = user.id;

    // ── 3. Parallel DB fetches (admin client bypasses RLS) ─────────────────
    // Destructure immediately so each variable has a stable type — accessing
    // .error / .data through an intermediate Result variable causes TS to
    // narrow the discriminated union to `never` inside subsequent if-blocks.
    const [
      { data: profileData, error: profileError },
      { data: sessionData, error: sessionError },
      { data: psychData,   error: psychError   },
    ] = await Promise.all([
      // Profile
      supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, is_premium, tier, avatar_url, created_at")
        .eq("id", userId)
        .single(),

      // Most recent assessment session
      supabaseAdmin
.from("assessment_sessions")
      .select(
        "personality_done, interest_done, aptitude_done, recommended_careers, completed_at, pdf_generated, pdf_url"
      )
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

      // All psych_results rows for this user
      supabaseAdmin
        .from("psych_results")
        .select("module, scores, primary_type, completed_at")
        .eq("user_id", userId),
    ]);

    // ── 4. Profile — 404 guard ─────────────────────────────────────────────
    if (profileError || !profileData) {
      // PGRST116 = no rows returned by .single()
      const isNotFound =
        !profileData ||
        (profileError as { code?: string } | null)?.code === "PGRST116";

      if (isNotFound) {
        return Response.json(
          { error: "Profile not found." },
          { status: 404 }
        );
      }

      console.error("[dashboard/data] Profile fetch error:", profileError);
      return Response.json(
        { error: "Failed to fetch profile." },
        { status: 500 }
      );
    }

    if (sessionError) {
      console.error("[dashboard/data] Session fetch error:", sessionError);
      return Response.json(
        { error: "Failed to fetch assessment session." },
        { status: 500 }
      );
    }

    if (psychError) {
      console.error("[dashboard/data] Psych results fetch error:", psychError);
      return Response.json(
        { error: "Failed to fetch assessment results." },
        { status: 500 }
      );
    }

    // ── 5. Shape profile ───────────────────────────────────────────────────
    const rawProfile = profileData;
    const profile: DashboardResponse["profile"] = {
      id: rawProfile.id,
      email: rawProfile.email,
      full_name: rawProfile.full_name ?? null,
      is_premium: rawProfile.is_premium ?? false,
      tier: (rawProfile.tier as Tier) ?? "explorer",
      avatar_url: rawProfile.avatar_url ?? null,
      created_at: rawProfile.created_at,
    };

    // ── 6. Shape assessment session ────────────────────────────────────────
    const session = sessionData;

    const personalityDone: boolean = session?.personality_done ?? false;
    const interestDone: boolean = session?.interest_done ?? false;
    const aptitudeDone: boolean = session?.aptitude_done ?? false;

    let assessmentStatus: AssessmentStatus;
    if (!session) {
      assessmentStatus = "not_started";
    } else if (personalityDone && interestDone && aptitudeDone) {
      assessmentStatus = "complete";
    } else {
      assessmentStatus = "in_progress";
    }

    const assessment: DashboardResponse["assessment"] = {
      status: assessmentStatus,
      personality_done: personalityDone,
      interest_done: interestDone,
      aptitude_done: aptitudeDone,
      recommended_careers:
        (session?.recommended_careers as string[] | null) ?? null,
      completed_at: session?.completed_at ?? null,
      pdf_generated: session?.pdf_generated ?? false,
      pdf_url: session?.pdf_url ?? null,
    };

    // ── 7. Shape psych_results into { personality, interest, aptitude } ────
    const toModuleResult = (
      row: { scores: object; primary_type: string; completed_at: string } | undefined
    ): ModuleResult | null => {
      if (!row) return null;
      return {
        scores: row.scores,
        primary_type: row.primary_type,
        completed_at: row.completed_at,
      };
    };

    const psychRows = psychData ?? [];

    // Use the most recent row per module (rows ordered by DB default; we pick
    // the last inserted by sorting on completed_at descending in JS)
    const byModule = (module: string) =>
      psychRows
        .filter((r) => r.module === module)
        .sort(
          (a, b) =>
            new Date(b.completed_at).getTime() -
            new Date(a.completed_at).getTime()
        )[0];

    const results: DashboardResponse["results"] = {
      personality: toModuleResult(byModule("personality")),
      interest: toModuleResult(byModule("interest")),
      aptitude: toModuleResult(byModule("aptitude")),
    };

    // ── 8. Return combined payload ─────────────────────────────────────────
    const payload: DashboardResponse = { profile, assessment, results };

    return Response.json(payload, { status: 200 });
  } catch (err) {
    console.error("[dashboard/data] Unhandled error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}