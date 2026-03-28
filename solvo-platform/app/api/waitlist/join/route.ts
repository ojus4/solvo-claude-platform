import { NextRequest } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

// ---------------------------------------------------------------------------
// Rate limiter — 3 requests per minute per IP
// ---------------------------------------------------------------------------
const rateLimiter = new RateLimiterMemory({
  points: 3,       // max requests
  duration: 60,    // per 60 seconds
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// POST /api/waitlist/join
// Public endpoint — no auth required
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest): Promise<Response> {
  // ── 1. Rate limiting ─────────────────────────────────────────────────────
  const ip = getClientIp(request);

  try {
    await rateLimiter.consume(ip);
  } catch {
    return Response.json(
      {
        success: false,
        error: "Too many requests. Please wait a moment and try again.",
      },
      { status: 429 }
    );
  }

  // ── 2. Parse request body ────────────────────────────────────────────────
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return Response.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { email, name, source } = body as Record<string, unknown>;

  // ── 3. Validate email ────────────────────────────────────────────────────
  if (
    typeof email !== "string" ||
    !email.trim() ||
    !EMAIL_REGEX.test(email.trim())
  ) {
    return Response.json(
      { success: false, error: "A valid email address is required." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Sanitise optional fields
  const normalizedName =
    typeof name === "string" && name.trim()
      ? name.trim().slice(0, 100)
      : null;

  const normalizedSource =
    typeof source === "string" && source.trim()
      ? source.trim().slice(0, 100)
      : null;

  // ── 4. Check for duplicate ───────────────────────────────────────────────
  try {
    const { data: existing, error: selectError } = await supabaseAdmin
      .from("waitlist")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (selectError) {
      console.error("[waitlist/join] duplicate-check error:", selectError);
      return Response.json(
        { success: false, error: "Failed to join waitlist. Please try again." },
        { status: 500 }
      );
    }

    if (existing) {
      return Response.json(
        {
          success: true,
          already_registered: true,
          message: "You are already on the waitlist! We will be in touch soon.",
        },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error("[waitlist/join] unexpected error during duplicate check:", err);
    return Response.json(
      { success: false, error: "Failed to join waitlist. Please try again." },
      { status: 500 }
    );
  }

  // ── 5. Insert into waitlist ──────────────────────────────────────────────
  try {
    const { error: insertError } = await supabaseAdmin
      .from("waitlist")
      .insert({
        email: normalizedEmail,
        name: normalizedName,
        source: normalizedSource,
      });

    if (insertError) {
      // Unique-constraint violation (race condition) — treat as already registered
      // Postgres error code 23505 = unique_violation
      if (insertError.code === "23505") {
        return Response.json(
          {
            success: true,
            already_registered: true,
            message:
              "You are already on the waitlist! We will be in touch soon.",
          },
          { status: 200 }
        );
      }

      console.error("[waitlist/join] insert error:", insertError);
      return Response.json(
        { success: false, error: "Failed to join waitlist. Please try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[waitlist/join] unexpected error during insert:", err);
    return Response.json(
      { success: false, error: "Failed to join waitlist. Please try again." },
      { status: 500 }
    );
  }

  // ── 6. Success ───────────────────────────────────────────────────────────
  return Response.json(
    {
      success: true,
      already_registered: false,
      message: "You are on the list! We will contact you when SOLVO launches.",
    },
    { status: 200 }
  );
}