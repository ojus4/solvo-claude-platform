import crypto from "crypto"
import { supabaseAdmin } from "@/lib/supabase/admin-client"

export async function POST(request: Request): Promise<Response> {
  // ─── Step 1: Read raw body and signature ────────────────────────────────────
  const rawBody = await request.text()
  const signature = request.headers.get("x-razorpay-signature") ?? ""

  // ─── Step 2: Check payment_mode from site_settings ──────────────────────────
  // site_settings is a key-value table: rows have `key` and `value` columns.
  // payment_mode is a ROW where key = "payment_mode", not a column.
  try {
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "payment_mode")
      .single()
 
    if (settingsError) {
      console.error("[Webhook] Failed to fetch site_settings:", settingsError.message)
      // Do not block processing — fall through if settings unavailable
    } else if (settings?.value === "interest") {
      console.log("[Webhook] payment_mode is 'interest' — skipping processing.")
      return Response.json(
        { received: true, processed: false, reason: "interest_mode" },
        { status: 200 }
      )
    }
  } catch (err) {
    console.error("[Webhook] Unexpected error reading site_settings:", err)
    // Fall through — do not block webhook processing
  }

  // ─── Step 3: Guard — webhook secret must be configured ──────────────────────
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? ""

  if (!webhookSecret || webhookSecret === "PLACEHOLDER_FILL_WHEN_READY") {
    console.warn(
      "[Webhook] RAZORPAY_WEBHOOK_SECRET is not configured. " +
        "Skipping webhook processing until secret is set."
    )
    return Response.json(
      { received: true, processed: false, reason: "webhook_not_configured" },
      { status: 200 }
    )
  }

  // ─── Step 4: Verify HMAC SHA256 signature ───────────────────────────────────
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex")

  if (expectedSignature !== signature) {
    // NEVER return 4xx — Razorpay would retry indefinitely
    console.log(
      "[Webhook] Invalid webhook signature — ignoring event. " +
        `Received: ${signature.slice(0, 8)}... Expected: ${expectedSignature.slice(0, 8)}...`
    )
    return Response.json(
      { received: true, processed: false, reason: "invalid_signature" },
      { status: 200 }
    )
  }

  // ─── Step 5: Parse verified body and filter event type ──────────────────────
  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>
  } catch (parseErr) {
    console.error("[Webhook] Failed to parse JSON body:", parseErr)
    return Response.json(
      { received: true, processed: false, reason: "invalid_json" },
      { status: 200 }
    )
  }

  if (event.event !== "payment.captured") {
    console.log(`[Webhook] Event '${event.event}' acknowledged but not handled.`)
    return Response.json(
      { received: true, processed: false, reason: "event_not_handled" },
      { status: 200 }
    )
  }

  // ─── Step 6: Extract and validate order details ──────────────────────────────
  const payload = event.payload as Record<string, unknown> | undefined
  const paymentWrapper = payload?.payment as Record<string, unknown> | undefined
  const payment = paymentWrapper?.entity as Record<string, unknown> | undefined

  const razorpayOrderId = payment?.order_id as string | undefined
  const razorpayPaymentId = payment?.id as string | undefined
  const amountPaise = payment?.amount as number | undefined

  if (!razorpayOrderId || !razorpayPaymentId || amountPaise === undefined) {
    console.error(
      "[Webhook] Missing required payment fields.",
      { razorpayOrderId, razorpayPaymentId, amountPaise }
    )
    return Response.json(
      { received: true, processed: false, reason: "missing_payment_data" },
      { status: 200 }
    )
  }

  // ─── Step 7: Fetch order from database ──────────────────────────────────────
  const { data: order, error: orderFetchError } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, tier_purchased, status")
    .eq("id", razorpayOrderId)
    .single()

  if (orderFetchError || !order) {
    console.error(
      "[Webhook] Order not found in database.",
      { razorpayOrderId, error: orderFetchError?.message }
    )
    return Response.json(
      { received: true, processed: false, reason: "order_not_found" },
      { status: 200 }
    )
  }

  // Idempotency guard — already processed by the client-side verify route
  if (order.status === "paid") {
    console.log(
      `[Webhook] Order ${razorpayOrderId} already marked as paid — skipping duplicate processing.`
    )
    return Response.json(
      { received: true, processed: false, reason: "already_processed" },
      { status: 200 }
    )
  }

  // ─── Step 8: Update order status ────────────────────────────────────────────
  const { error: orderUpdateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", razorpayOrderId)

  if (orderUpdateError) {
    console.error(
      "[Webhook] Failed to update order status.",
      { razorpayOrderId, error: orderUpdateError.message }
    )
    // Do not return — continue attempting profile upgrade
  } else {
    console.log(`[Webhook] Order ${razorpayOrderId} marked as paid.`)
  }

  // ─── Step 9: Upgrade user profile (MOST CRITICAL OPERATION) ─────────────────
  const { error: profileUpdateError } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: true,
      tier: order.tier_purchased,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.user_id)

  if (profileUpdateError) {
    console.error(
      "[Webhook] CRITICAL — Failed to upgrade user profile. Manual intervention required.",
      {
        user_id: order.user_id,
        order_id: razorpayOrderId,
        tier: order.tier_purchased,
        error: profileUpdateError.message,
      }
    )
    // Still return 200 to Razorpay — do not trigger retries
  } else {
    console.log(
      `[Webhook] Profile upgraded for user ${order.user_id} → tier '${order.tier_purchased}'.`
    )
  }

  // ─── Step 10: Insert subscription record for 'accelerator' tier ─────────────
  if (order.tier_purchased === "accelerator") {
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { error: subscriptionError } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: order.user_id,
        order_id: razorpayOrderId,
        status: "active",
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })

    if (subscriptionError) {
      console.error(
        "[Webhook] Failed to insert subscription record.",
        {
          user_id: order.user_id,
          order_id: razorpayOrderId,
          error: subscriptionError.message,
        }
      )
    } else {
      console.log(
        `[Webhook] Subscription created for user ${order.user_id}, expires ${expiresAt.toISOString()}.`
      )
    }
  }

  // ─── Step 11: Always return 200 ─────────────────────────────────────────────
  console.log(`[Webhook] Successfully processed payment.captured for order ${razorpayOrderId}.`)
  return Response.json(
    { received: true, processed: true, order_id: razorpayOrderId },
    { status: 200 }
  )
}