import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { RateLimiterMemory } from "rate-limiter-flexible";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIER_AMOUNTS: Record<string, number> = {
  achiever: 9900,
  accelerator: 99900,
};

const VALID_TIERS = new Set(Object.keys(TIER_AMOUNTS));

const RAZORPAY_API_URL = "https://api.razorpay.com/v1/orders";

// ---------------------------------------------------------------------------
// Rate limiter — 5 requests per minute per IP
// ---------------------------------------------------------------------------

const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60, // seconds
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRazorpayConfigured(): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  return (
    secret.length > 0 && secret !== "PLACEHOLDER_FILL_WHEN_READY"
  );
}

async function createRazorpayOrder(
  amountPaise: number,
  receiptId: string
): Promise<{
  id: string;
  amount: number;
  currency: string;
}> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch(RAZORPAY_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: receiptId,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Razorpay order creation failed [${response.status}]: ${errorBody}`
    );
  }

  const data = (await response.json()) as {
    id: string;
    amount: number;
    currency: string;
  };

  return data;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  // 1. Rate limiting
  const ip = getClientIp(request);
  try {
    await rateLimiter.consume(ip);
  } catch {
    return Response.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // 2. Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json(
      { success: false, error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  // 3. Parse & validate request body
  let tier: string;
  try {
    const body = (await request.json()) as { tier?: unknown };
    tier = String(body.tier ?? "");
  } catch {
    return Response.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!VALID_TIERS.has(tier)) {
    return Response.json(
      {
        success: false,
        error: `Invalid tier. Must be one of: ${[...VALID_TIERS].join(", ")}.`,
      },
      { status: 400 }
    );
  }

  // 4. Fetch profile via admin client (bypasses RLS)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, is_premium, is_suspended")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return Response.json(
      { success: false, error: "User profile not found." },
      { status: 404 }
    );
  }

  if (profile.is_suspended) {
    return Response.json(
      { success: false, error: "Your account has been suspended." },
      { status: 403 }
    );
  }

  if (profile.is_premium) {
    return Response.json(
      { success: false, error: "Already subscribed." },
      { status: 400 }
    );
  }

  // 5. Read payment_mode from site_settings
  const { data: settingsRow, error: settingsError } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "payment_mode")
    .single();

  if (settingsError || !settingsRow) {
    return Response.json(
      {
        success: false,
        error: "Payment configuration unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }

  const paymentMode = String(settingsRow.value ?? "interest");

  const amountPaise = TIER_AMOUNTS[tier]!;

  // ---------------------------------------------------------------------------
  // INTEREST MODE
  // ---------------------------------------------------------------------------
  if (paymentMode === "interest") {
    return Response.json(
      {
        success: true,
        mode: "interest",
        tier,
        redirect_to: "apply",
      },
      { status: 200 }
    );
  }

  // ---------------------------------------------------------------------------
  // TEST / LIVE MODE — shared flow
  // ---------------------------------------------------------------------------
  if (paymentMode === "test" || paymentMode === "live") {
    // Guard: Razorpay keys must be configured
    if (!isRazorpayConfigured()) {
      return Response.json(
        {
          success: false,
          error: "Payment system not configured. Please contact support.",
          mode: "unconfigured",
        },
        { status: 503 }
      );
    }

    // Generate a short receipt ID (Razorpay limit: 40 chars)
    const receiptId = `rcpt_${user.id.replace(/-/g, "").slice(0, 16)}_${Date.now()}`.slice(
      0,
      40
    );

    // Create Razorpay order
    let rzpOrder: { id: string; amount: number; currency: string };
    try {
      rzpOrder = await createRazorpayOrder(amountPaise, receiptId);
    } catch (err) {
      console.error("[create-order] Razorpay error:", err);
      return Response.json(
        {
          success: false,
          error: "Failed to create payment order. Please try again.",
        },
        { status: 502 }
      );
    }

    // Persist pending order in DB
    const { error: insertError } = await supabaseAdmin.from("orders").insert({
      user_id: user.id,
      tier_purchased: tier,
      amount_paise: amountPaise,
      status: "pending",
      razorpay_order_id: rzpOrder.id,
    });

    if (insertError) {
      console.error("[create-order] DB insert error:", insertError);
      return Response.json(
        {
          success: false,
          error: "Failed to save order. Please try again.",
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        mode: paymentMode,
        order_id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        tier,
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
      },
      { status: 200 }
    );
  }

  // ---------------------------------------------------------------------------
  // Unknown payment_mode — fail safe
  // ---------------------------------------------------------------------------
  return Response.json(
    {
      success: false,
      error: "Unknown payment mode. Please contact support.",
    },
    { status: 503 }
  );
}