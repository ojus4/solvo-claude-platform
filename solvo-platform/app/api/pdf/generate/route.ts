import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Rate limiter — 5 requests per minute per IP
// ---------------------------------------------------------------------------
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60, // seconds
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PsychResultRow {
  module: string;
  scores: Record<string, unknown>;
  primary_type: string;
  completed_at: string;
}

interface ModuleResult {
  scores: Record<string, unknown>;
  primary_type: string;
  completed_at: string;
}

interface ShapedResults {
  personality: ModuleResult | null;
  interest: ModuleResult | null;
  aptitude: ModuleResult | null;
  eq: ModuleResult | null; // added new 'eq' module to shaped results
}

interface AssessmentSession {
  id: string;
  personality_done: boolean;
  interest_done: boolean;
  aptitude_done: boolean;
  eq_done: boolean; // added new 'eq' module to assessment session
  recommended_careers: string[] | null;
  completed_at: string | null;
  pdf_generated: boolean;
  pdf_url: string | null;
}

interface Profile {
  full_name: string | null;
  email: string;
  tier: string;
  is_premium: boolean;
}

// ---------------------------------------------------------------------------
// Helper — shape raw psych_results rows into { personality, interest, aptitude }
// ---------------------------------------------------------------------------
function shapeResults(rows: PsychResultRow[]): ShapedResults {
  const map: Record<string, ModuleResult> = {};

  for (const row of rows) {
    map[row.module.toLowerCase()] = {
      scores: row.scores,
      primary_type: row.primary_type,
      completed_at: row.completed_at,
    };
  }

  return {
    personality: map["personality"] ?? null,
    interest: map["interest"] ?? null,
    aptitude: map["aptitude"] ?? null,
    eq: map["eq"] ?? null, // added new 'eq' module to shaped results
  };
}

// ---------------------------------------------------------------------------
// Helper — generate a short, readable report ID
// ---------------------------------------------------------------------------
function generateReportId(userId: string): string {
  return (
    "SOLVO-" +
    userId.slice(0, 6).toUpperCase() +
    "-" +
    Date.now().toString(36).toUpperCase()
  );
}

// ---------------------------------------------------------------------------
// POST /api/pdf/generate
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // ── 1. Rate limiting ──────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  try {
    await rateLimiter.consume(ip);
  } catch {
    return Response.json(
      {
        success: false,
        error: "Too many requests. Please wait before generating another report.",
      },
      { status: 429 }
    );
  }

  // ── 2. Auth check ─────────────────────────────────────────────────────────
  let userId: string;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { success: false, error: "Unauthorized. Please sign in to continue." },
        { status: 401 }
      );
    }

    userId = user.id;
  } catch (err) {
    console.error("[pdf/generate] Auth error:", err);
    return Response.json(
      { success: false, error: "Authentication failed." },
      { status: 401 }
    );
  }

  // ── 3. Parse request body ─────────────────────────────────────────────────
  let careerFocusInput: string | undefined;

  try {
    const body = await request.json().catch(() => ({}));
    if (
      body &&
      typeof body.career_focus === "string" &&
      body.career_focus.trim().length > 0
    ) {
      careerFocusInput = body.career_focus.trim();
    }
  } catch {
    // Non-fatal — career_focus is optional
  }

  try {
    // ── 4. Fetch the latest assessment session ────────────────────────────
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from("assessment_sessions")
      .select(
        "id, personality_done, interest_done, aptitude_done, eq_done, recommended_careers, completed_at, pdf_generated, pdf_url"
      )
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(1)
      .single<AssessmentSession>();

    if (sessionError || !sessionData) {
      return Response.json(
        {
          success: false,
          error: "No assessment session found. Complete the assessment first.",
        },
        { status: 400 }
      );
    }

    const session = sessionData;

    // ── 5. Verify all four modules are complete ──────────────────────────
    if (
      !session.personality_done ||
      !session.interest_done ||
      !session.aptitude_done ||
      !session.eq_done
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Assessment incomplete. Complete all four modules to generate your report.",
        },
        { status: 400 }
      );
    }

    // ── 6. Fetch psych_results ────────────────────────────────────────────
    const { data: psychRows, error: psychError } = await supabaseAdmin
      .from("psych_results")
      .select("module, scores, primary_type, completed_at")
      .eq("user_id", userId)
      .returns<PsychResultRow[]>();

    if (psychError) {
      console.error("[pdf/generate] Failed to fetch psych_results:", psychError);
      return Response.json(
        { success: false, error: "Failed to fetch assessment results." },
        { status: 500 }
      );
    }

    const results = shapeResults(psychRows ?? []);

    // ── 7. Fetch user profile ─────────────────────────────────────────────
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email, tier, is_premium")
      .eq("id", userId)
      .single<Profile>();

    if (profileError || !profileData) {
      console.error("[pdf/generate] Failed to fetch profile:", profileError);
      return Response.json(
        { success: false, error: "Failed to fetch user profile." },
        { status: 500 }
      );
    }

    const profile = profileData;

    // ── 8. Determine career_focus ─────────────────────────────────────────
    const recommendedCareers: string[] = session.recommended_careers ?? [];

    const careerFocus: string =
      careerFocusInput ??
      recommendedCareers[0] ??
      "General Career Guidance";

    // ── 9. Mark pdf_generated = true ─────────────────────────────────────
    const { error: updateError } = await supabaseAdmin
      .from("assessment_sessions")
      .update({ pdf_generated: true })
      .eq("user_id", userId)
      .eq("id", session.id);

    if (updateError) {
      // Non-fatal — log and proceed; the PDF data is still valid
      console.warn(
        "[pdf/generate] Failed to mark pdf_generated=true:",
        updateError
      );
    }

    // ── 10. Build and return the PDF data payload ─────────────────────────
    const pdfData = {
      user: {
        full_name: profile.full_name ?? "Student",
        email: profile.email,
        tier: profile.tier,
        report_id: generateReportId(userId),
        generated_at: new Date().toISOString(),
      },
      results: {
        personality: results.personality,
        interest: results.interest,
        aptitude: results.aptitude,
        eq: results.eq, // included 'eq' results in the PDF data payload
      },
      recommended_careers: recommendedCareers,
      career_focus: careerFocus,
      is_premium: profile.is_premium,
    };

    return Response.json(
      { success: true, pdf_data: pdfData },
      { status: 200 }
    );
  } catch (err) {
    console.error("[pdf/generate] Unexpected error:", err);
    return Response.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}