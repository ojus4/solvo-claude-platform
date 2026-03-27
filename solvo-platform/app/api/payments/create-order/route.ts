import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tier = "achiever" | "accelerator";

const TIER_AMOUNTS: Record<Tier, number> = {
  achiever: 9900,      // ₹99
  accelerator: 99900,  // ₹999
};

// ---------------------------------------------------------------------------
// Rate limiter — 5 requests per minute per IP
// ---------------------------------------------------------------------------

const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60, // seconds
});

// ---------------------------------------------------------------------------
// Razorpay singleton
// ---------------------------------------------------------------------------

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ---------------------------------------------------------------------------
// POST /api/payments/create-order
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
      { success: false, error: "Too many requests. Please try again in a minute." },
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
    console.error("[create-order] Auth error:", err);
    return Response.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 401 }
    );
  }

  // ── 3. Parse & validate request body ─────────────────────────────────────
  let tier: Tier;

  try {
    const body = await request.json();
    const rawTier = body?.tier;

    if (rawTier !== "achiever" && rawTier !== "accelerator") {
      return Response.json(
        {
          success: false,
          error: "Invalid tier. Must be 'achiever' or 'accelerator'.",
        },
        { status: 400 }
      );
    }

    tier = rawTier as Tier;
  } catch {
    return Response.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  // ── 4. Check existing premium status ──────────────────────────────────────
  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_premium, tier")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("[create-order] Profile fetch error:", profileError);
      return Response.json(
        { success: false, error: "Failed to fetch user profile." },
        { status: 500 }
      );
    }

    if (profile?.is_premium === true) {
      return Response.json(
        {
          success: false,
          error: "You already have an active premium subscription.",
        },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("[create-order] Profile check error:", err);
    return Response.json(
      { success: false, error: "Failed to verify subscription status." },
      { status: 500 }
    );
  }

  // ── 5. Determine amount ───────────────────────────────────────────────────
  const amountPaise = TIER_AMOUNTS[tier];

  // ── 6. Create Razorpay order ──────────────────────────────────────────────
  let razorpayOrder: Awaited<ReturnType<typeof razorpay.orders.create>>;

  try {
    razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `solvo_${userId.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: userId,
        tier: tier,
      },
    });
  } catch (err) {
    console.error("[create-order] Razorpay order creation failed:", err);
    return Response.json(
      {
        success: false,
        error: "Failed to create payment order. Please try again.",
      },
      { status: 500 }
    );
  }

  // ── 7. Persist order to DB (non-blocking on failure) ─────────────────────
  const { error: dbError } = await supabaseAdmin.from("orders").insert({
    id: razorpayOrder.id,
    user_id: userId,
    tier_purchased: tier,
    amount_paise: amountPaise,
    currency: "INR",
    status: "pending",
    metadata: { razorpay_receipt: razorpayOrder.receipt },
  });

  if (dbError) {
    // Log but do not block — the Razorpay webhook will re-sync the order.
    console.error(
      "[create-order] DB insert failed (webhook will sync):",
      dbError
    );
  }

  // ── 8. Return order details to frontend ───────────────────────────────────
  return Response.json(
    {
      success: true,
      order_id: razorpayOrder.id,
      amount: amountPaise,
      currency: "INR",
      tier: tier,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    },
    { status: 200 }
  );
}