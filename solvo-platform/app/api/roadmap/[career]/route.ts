import fs from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_CAREERS = [
  "data_science",
  "ui_ux",
  "digital_marketing",
  "finance",
  "software_engineering",
] as const;

type ValidCareer = (typeof VALID_CAREERS)[number];

function isValidCareer(value: string): value is ValidCareer {
  return (VALID_CAREERS as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Rate limiter — 10 requests / 60 s per IP
// ---------------------------------------------------------------------------

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60, // seconds
});

// ---------------------------------------------------------------------------
// GET /api/roadmap/[career]
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ career: string }> }
): Promise<Response> {
  // ── 1. Rate limiting ──────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  try {
    await rateLimiter.consume(ip);
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      return Response.json(
        {
          success: false,
          error: "Too many requests. Please slow down.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(err.msBeforeNext / 1000)),
          },
        }
      );
    }
    // Unexpected error from the limiter — fail open rather than block the user
    console.error("[roadmap] Rate limiter unexpected error:", err);
  }

  // ── 2. Authentication ─────────────────────────────────────────────────────
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }


    // ── 4. Career slug validation ─────────────────────────────────────────────
    const { career } = await params;

    if (!isValidCareer(career)) {
      return Response.json(
        { success: false, error: "Career roadmap not found." },
        { status: 404 }
      );
    }


    // ── 3. Premium check (via service-role client, bypasses RLS) ─────────────
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_premium, tier")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("[roadmap] Profile fetch error:", profileError);
      return Response.json(
        { success: false, error: "Unable to verify subscription status." },
        { status: 500 }
      );
    }

    if (!profile.is_premium) {
      return Response.json(
        {
          success: false,
          error: "Premium subscription required.",
          upgrade_url: "/checkout",
          message:
            "Unlock your full career roadmap with the Achiever Plan for ₹99.",
        },
        { status: 403 }
      );
    }


    // ── 5 & 6. Read roadmap JSON from filesystem ──────────────────────────────
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "roadmaps",
      `${career}.json`
    );

    let roadmapData: { nodes: unknown[]; edges: unknown[] };

    try {
      const raw = await fs.readFile(filePath, "utf-8");
      roadmapData = JSON.parse(raw) as { nodes: unknown[]; edges: unknown[] };
    } catch {
      // Covers both ENOENT (file missing) and JSON.parse failures
      return Response.json(
        { success: false, error: "Roadmap data not available yet." },
        { status: 404 }
      );
    }

    // ── 7. Success ────────────────────────────────────────────────────────────
    return Response.json(
      {
        success: true,
        career,
        data: {
          nodes: roadmapData.nodes,
          edges: roadmapData.edges,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[roadmap] Unhandled error:", err);
    return Response.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}