import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { NextRequest } from "next/server";
import {sendApplicationReceivedEmail,sendAdminNewApplicationAlert,} from "@/lib/email/send";
// ---------------------------------------------------------------------------
// Rate limiter — 3 requests per minute per IP
// ---------------------------------------------------------------------------
const rateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60, // seconds
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Tier = "achiever" | "accelerator";

interface ApplyRequestBody {
  tier: Tier;
  message?: string;
  source?: string;
}

// ---------------------------------------------------------------------------
// POST /api/payments/apply
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest): Promise<Response> {
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
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(err.msBeforeNext / 1000)),
          },
        }
      );
    }
    // Unexpected error from rate limiter — fail open with a warning log
    console.error("[apply] Rate limiter unexpected error:", err);
  }

  // ── 2. Auth — verify user is authenticated ────────────────────────────────
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

  const userId = user.id;

  // ── 3. Parse & validate request body ─────────────────────────────────────
  let body: ApplyRequestBody;
  try {
    body = (await request.json()) as ApplyRequestBody;
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const { tier, message, source } = body;

  // Validate tier
  const validTiers: Tier[] = ["achiever", "accelerator"];
  if (!tier || !validTiers.includes(tier)) {
    return Response.json(
      {
        success: false,
        error: 'Invalid tier. Must be "achiever" or "accelerator".',
      },
      { status: 400 }
    );
  }

  // Sanitise optional fields
  const sanitisedMessage =
    typeof message === "string" ? message.trim().slice(0, 500) : null;
  const sanitisedSource =
    typeof source === "string" ? source.trim().slice(0, 100) : null;

  // ── 4. Check payment_mode from site_settings ──────────────────────────────
  try {
    const { data: siteSetting, error: settingError } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "payment_mode")
      .single();

    if (settingError) {
      console.error("[apply] Failed to fetch site_settings:", settingError);
      return Response.json(
        { success: false, error: "Could not verify payment mode. Please try again later." },
        { status: 500 }
      );
    }

    const paymentMode = siteSetting?.value as string | undefined;

    if (paymentMode === "test" || paymentMode === "live") {
      return Response.json(
        {
          success: false,
          error: "Applications are closed. Please use the payment flow.",
        },
        { status: 400 }
      );
    }

    // Proceed only when payment_mode === 'interest'
    if (paymentMode !== "interest") {
      console.warn("[apply] Unknown payment_mode value:", paymentMode);
      return Response.json(
        { success: false, error: "Applications are not available at this time." },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("[apply] Unexpected error reading site_settings:", err);
    return Response.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }

  // ── 5. Fetch user profile via admin client ────────────────────────────────
  let profile: {
    email: string;
    full_name: string | null;
    is_premium: boolean;
    tier: string | null;
    utm_source: string | null;
  };

  try {
    const { data, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name, is_premium, tier, utm_source")
      .eq("id", userId)
      .single();

    if (profileError || !data) {
      console.error("[apply] Profile fetch error:", profileError);
      return Response.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    profile = data;
  } catch (err) {
    console.error("[apply] Unexpected error fetching profile:", err);
    return Response.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }

  // ── 6. Guard: user already premium ───────────────────────────────────────
  if (profile.is_premium) {
    return Response.json(
      {
        success: false,
        error: "You already have an active premium plan.",
      },
      { status: 400 }
    );
  }

  // ── 7. Check for an existing application for this tier ───────────────────
  try {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("tier_applications")
      .select("id, status")
      .eq("user_id", userId)
      .eq("tier_applied", tier)
      .maybeSingle();

    if (existingError) {
      console.error("[apply] Error checking existing application:", existingError);
      return Response.json(
        { success: false, error: "Internal server error." },
        { status: 500 }
      );
    }

    if (existing) {
      return Response.json(
        {
          success: true,
          already_applied: true,
          status: existing.status,
          message:
            "You have already applied for this plan. We will be in touch soon.",
        },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error("[apply] Unexpected error checking existing application:", err);
    return Response.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }

  // ── 8. Insert new application ─────────────────────────────────────────────
  try {
    const { error: insertError } = await supabaseAdmin
      .from("tier_applications")
      .insert({
        user_id: userId,
        email: profile.email,
        full_name: profile.full_name,
        tier_applied: tier,
        status: "pending",
        message: sanitisedMessage,
        source: sanitisedSource,
        utm_source: profile.utm_source,
      });

    if (insertError) {
      console.error("[apply] Insert error:", insertError);
      return Response.json(
        { success: false, error: "Failed to submit your application. Please try again." },
        { status: 500 }
      );
    }

    // ── 8B. Send confirmation emails (non-blocking) ───────────────────────────
    // Send confirmation to applicant and alert to admin (non-blocking)
    Promise.all([
    sendApplicationReceivedEmail({
      to: profile.email,
      fullName: profile.full_name ?? "",
      tier,
    }),
    sendAdminNewApplicationAlert({
      applicantEmail: profile.email,
      applicantName: profile.full_name ?? "Unknown",
      tier,
      message: sanitisedMessage ?? undefined,
      source: sanitisedSource ?? undefined,
    }),
  ]).catch(console.error);
 
  } catch (err) {
    console.error("[apply] Unexpected insert error:", err);
    return Response.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }

  // ── 9. Success ─────────────────────────────────────────────────────────────
  return Response.json(
    {
      success: true,
      already_applied: false,
      tier,
      message:
        "Your application has been received! We will review it and contact you within 48 hours.",
    },
    { status: 200 }
  );
}