import crypto from "crypto";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

// ---------------------------------------------------------------------------
// Rate limiter — 5 requests per minute per IP
// ---------------------------------------------------------------------------
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60, // seconds
});

// ---------------------------------------------------------------------------
// POST /api/payments/verify
// ---------------------------------------------------------------------------
export async function POST(request: Request): Promise<Response> {
  // -------------------------------------------------------------------------
  // 1. Rate limiting
  // -------------------------------------------------------------------------
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  try {
    await rateLimiter.consume(ip);
  } catch {
    return Response.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // -------------------------------------------------------------------------
  // 2. Authenticate user
  // -------------------------------------------------------------------------
  let userId: string;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    userId = user.id;
  } catch (err) {
    console.error("[verify] Auth check failed:", err);
    return Response.json(
      { success: false, error: "Authentication error." },
      { status: 500 }
    );
  }

  // -------------------------------------------------------------------------
  // 3. Check payment_mode from site_settings
  // -------------------------------------------------------------------------
  try {
    const { data: siteSetting, error: settingError } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "payment_mode")
      .single();

    if (!settingError && siteSetting?.value === "interest") {
      return Response.json(
        {
          success: false,
          error: "Payment verification not available in interest mode.",
        },
        { status: 400 }
      );
    }
  } catch (err) {
    // Non-fatal: if site_settings is unreachable, continue with verification.
    console.warn("[verify] Could not fetch site_settings:", err);
  }

  // -------------------------------------------------------------------------
  // 4. Check RAZORPAY_KEY_SECRET is configured
  // -------------------------------------------------------------------------
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

  if (!razorpaySecret || razorpaySecret === "PLACEHOLDER_FILL_WHEN_READY") {
    return Response.json(
      { success: false, error: "Payment system not configured." },
      { status: 503 }
    );
  }

  // -------------------------------------------------------------------------
  // 5. Parse & validate request body
  // -------------------------------------------------------------------------
  let razorpay_order_id: string;
  let razorpay_payment_id: string;
  let razorpay_signature: string;

  try {
    const body = await request.json();

    razorpay_order_id = body?.razorpay_order_id;
    razorpay_payment_id = body?.razorpay_payment_id;
    razorpay_signature = body?.razorpay_signature;
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (
    !razorpay_order_id ||
    typeof razorpay_order_id !== "string" ||
    !razorpay_order_id.trim() ||
    !razorpay_payment_id ||
    typeof razorpay_payment_id !== "string" ||
    !razorpay_payment_id.trim() ||
    !razorpay_signature ||
    typeof razorpay_signature !== "string" ||
    !razorpay_signature.trim()
  ) {
    return Response.json(
      { success: false, error: "Missing required payment fields." },
      { status: 400 }
    );
  }

  // -------------------------------------------------------------------------
  // 6. Verify Razorpay HMAC SHA256 signature
  // -------------------------------------------------------------------------
  const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac("sha256", razorpaySecret)
    .update(signaturePayload)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const signaturesMatch =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(razorpay_signature, "hex")
    );

  if (!signaturesMatch) {
    return Response.json(
      {
        success: false,
        error: "Payment verification failed. Invalid signature.",
      },
      { status: 400 }
    );
  }

  // -------------------------------------------------------------------------
  // 7. Fetch order from DB
  // -------------------------------------------------------------------------
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, tier_purchased, amount_paise, status")
    .eq("id", razorpay_order_id)
    .single();

  if (orderError || !order) {
    return Response.json(
      { success: false, error: "Order not found." },
      { status: 404 }
    );
  }

  if (order.user_id !== userId) {
    return Response.json(
      { success: false, error: "Order does not belong to this account." },
      { status: 403 }
    );
  }

  // Idempotency — already processed by this route or the webhook
  if (order.status === "paid") {
    return Response.json(
      {
        success: true,
        already_verified: true,
        message: "Payment already confirmed.",
      },
      { status: 200 }
    );
  }

  // -------------------------------------------------------------------------
  // 8. Mark order as paid
  // -------------------------------------------------------------------------
  const { error: orderUpdateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id,
      razorpay_signature,
      paid_at: new Date().toISOString(),
    })
    .eq("id", razorpay_order_id);

  if (orderUpdateError) {
    console.error("[verify] Failed to update order:", orderUpdateError);
    return Response.json(
      { success: false, error: "Failed to record payment. Please contact support." },
      { status: 500 }
    );
  }

  // -------------------------------------------------------------------------
  // 9. Upgrade user profile
  // -------------------------------------------------------------------------
  const { error: profileUpdateError } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: true,
      tier: order.tier_purchased,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileUpdateError) {
    // Order is already marked paid — log the error but don't fail the request.
    // The webhook will re-attempt the profile upgrade as the authoritative source.
    console.error(
      "[verify] Order paid but profile upgrade failed — webhook will reconcile:",
      profileUpdateError
    );
  }

  // -------------------------------------------------------------------------
  // 10. Success
  // -------------------------------------------------------------------------
  return Response.json(
    {
      success: true,
      already_verified: false,
      tier: order.tier_purchased,
      message: "Payment verified successfully. Your plan has been activated.",
      redirect_to: "/dashboard",
    },
    { status: 200 }
  );
}