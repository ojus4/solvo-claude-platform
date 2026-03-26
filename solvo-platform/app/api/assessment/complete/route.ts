import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { RateLimiterMemory } from "rate-limiter-flexible";

// ---------------------------------------------------------------------------
// Rate limiter — max 3 requests / minute per IP
// ---------------------------------------------------------------------------
const rateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60, // seconds
});

// ---------------------------------------------------------------------------
// POST /api/assessment/complete
// ---------------------------------------------------------------------------
export async function POST(request: Request): Promise<Response> {
  // ── 0. Rate limiting ───────────────────────────────────────────────────
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
        error: "Too many requests. Please wait a moment before trying again.",
      },
      { status: 429 }
    );
  }

  // ── 1. Auth check ──────────────────────────────────────────────────────
  let userId: string;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { success: false, error: "Unauthorized. Please log in to continue." },
        { status: 401 }
      );
    }

    userId = user.id;
  } catch (err) {
    console.error("[assessment/complete] Auth error:", err);
    return Response.json(
      { success: false, error: "Authentication check failed." },
      { status: 500 }
    );
  }

  // ── 2. Parse & validate request body ──────────────────────────────────
  let recommended_careers: string[];

  try {
    const body = await request.json();

    if (
      !Array.isArray(body?.recommended_careers) ||
      body.recommended_careers.length === 0 ||
      body.recommended_careers.some((c: unknown) => typeof c !== "string")
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Invalid request body. 'recommended_careers' must be a non-empty array of strings.",
        },
        { status: 400 }
      );
    }

    recommended_careers = body.recommended_careers as string[];
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  // ── 3. Fetch the user's assessment session ─────────────────────────────
  let sessionId: string;
  let sessionRow: {
    id: string;
    personality_done: boolean;
    interest_done: boolean;
    aptitude_done: boolean;
  };

  try {
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("assessment_sessions")
      .select("id, personality_done, interest_done, aptitude_done")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionError) {
      console.error("[assessment/complete] Session fetch error:", sessionError);
      return Response.json(
        { success: false, error: "Failed to retrieve assessment session." },
        { status: 500 }
      );
    }

    if (!session) {
      return Response.json(
        {
          success: false,
          error:
            "No assessment session found. Complete all three modules first.",
        },
        { status: 400 }
      );
    }

    sessionRow = session;
    sessionId = session.id;
  } catch (err) {
    console.error("[assessment/complete] Unexpected session error:", err);
    return Response.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }

  // ── 4. Verify all three modules are complete ───────────────────────────
  if (
    !sessionRow.personality_done ||
    !sessionRow.interest_done ||
    !sessionRow.aptitude_done
  ) {
    return Response.json(
      {
        success: false,
        error:
          "Assessment incomplete. All three modules must be finished before calling this endpoint.",
      },
      { status: 400 }
    );
  }

  // ── 5. Update assessment_sessions ─────────────────────────────────────
  const completedAt = new Date().toISOString();

  try {
    const { error: sessionUpdateError } = await supabaseAdmin
      .from("assessment_sessions")
      .update({
        recommended_careers,
        completed_at: completedAt,
        pdf_generated: false,
      })
      .eq("id", sessionId);

    if (sessionUpdateError) {
      console.error(
        "[assessment/complete] Session update error:",
        sessionUpdateError
      );
      return Response.json(
        { success: false, error: "Failed to save assessment results." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[assessment/complete] Unexpected session update error:", err);
    return Response.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }

  // ── 6. Touch profiles.updated_at ──────────────────────────────────────
  try {
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({ updated_at: completedAt })
      .eq("id", userId);

    if (profileUpdateError) {
      // Non-fatal — log and continue; the core operation already succeeded.
      console.warn(
        "[assessment/complete] Profile touch failed (non-fatal):",
        profileUpdateError
      );
    }
  } catch (err) {
    // Non-fatal
    console.warn(
      "[assessment/complete] Unexpected profile touch error (non-fatal):",
      err
    );
  }

  // ── 7. Success response ────────────────────────────────────────────────
  return Response.json(
    {
      success: true,
      recommended_careers,
      completed_at: completedAt,
      message: "Assessment complete. Your career recommendations have been saved.",
    },
    { status: 200 }
  );
}