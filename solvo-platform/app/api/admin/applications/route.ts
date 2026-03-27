import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Rate limiter — 30 requests per minute per IP
// ---------------------------------------------------------------------------
const rateLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60, // seconds
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ApplicationStatus = "pending" | "selected" | "converted" | "rejected";

interface TierStat {
  total: number;
  pending: number;
  selected: number;
  converted: number;
  rejected: number;
}

interface TierStats {
  achiever: TierStat;
  accelerator: TierStat;
}

interface RecentApplication {
  id: string;
  email: string;
  full_name: string | null;
  tier_applied: string;
  status: ApplicationStatus;
  message: string | null;
  source: string | null;
  created_at: string;
  admin_notes: string | null;
}

// Helper to produce a zero-value TierStat
function emptyTierStat(): TierStat {
  return { total: 0, pending: 0, selected: 0, converted: 0, rejected: 0 };
}

// ---------------------------------------------------------------------------
// GET /api/admin/applications
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest): Promise<Response> {
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
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(err.msBeforeNext / 1000)),
          },
        }
      );
    }
    console.error("[admin/applications] Rate limiter unexpected error:", err);
  }

  // ── 2. Auth — verify user is authenticated ────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json(
      { error: "Unauthorized. Please sign in to continue." },
      { status: 401 }
    );
  }

  const userId = user.id;

  // ── 3. Verify admin_role is set on the profile ────────────────────────────
  try {
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("admin_role")
      .eq("id", userId)
      .single();

    if (profileError || !profileData) {
      console.error(
        "[admin/applications] Profile fetch error:",
        profileError
      );
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!profileData.admin_role) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch (err) {
    console.error(
      "[admin/applications] Unexpected error verifying admin role:",
      err
    );
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }

  // ── 4a. Aggregated stats per tier ─────────────────────────────────────────
  let stats: TierStats = {
    achiever: emptyTierStat(),
    accelerator: emptyTierStat(),
  };

  try {
    // Supabase does not expose SQL FILTER aggregates through the PostgREST
    // client directly, so we use a raw RPC or pull all rows and aggregate
    // in-process. Here we use supabaseAdmin.rpc for the SQL aggregate query.
    // If the rpc function is not available, we fall back to in-process
    // aggregation.

    const { data: rawStats, error: statsError } = await supabaseAdmin.rpc(
      "get_tier_application_stats"
    );

    if (!statsError && rawStats) {
      // Expected shape: [{ tier_applied, total, pending, selected, converted, rejected }]
      for (const row of rawStats as Array<{
        tier_applied: "achiever" | "accelerator";
        total: number;
        pending: number;
        selected: number;
        converted: number;
        rejected: number;
      }>) {
        if (row.tier_applied === "achiever" || row.tier_applied === "accelerator") {
          stats[row.tier_applied] = {
            total: Number(row.total),
            pending: Number(row.pending),
            selected: Number(row.selected),
            converted: Number(row.converted),
            rejected: Number(row.rejected),
          };
        }
      }
    } else {
      // ── Fallback: in-process aggregation ──────────────────────────────────
      // Fetch only the two columns needed for aggregation
      const { data: allRows, error: allRowsError } = await supabaseAdmin
        .from("tier_applications")
        .select("tier_applied, status");

      if (allRowsError) {
        console.error(
          "[admin/applications] Aggregation fallback error:",
          allRowsError
        );
        return Response.json(
          { error: "Failed to fetch application stats." },
          { status: 500 }
        );
      }

      for (const row of allRows ?? []) {
        const t = row.tier_applied as "achiever" | "accelerator";
        if (t !== "achiever" && t !== "accelerator") continue;
        stats[t].total += 1;
        const s = row.status as ApplicationStatus;
        if (s === "pending") stats[t].pending += 1;
        else if (s === "selected") stats[t].selected += 1;
        else if (s === "converted") stats[t].converted += 1;
        else if (s === "rejected") stats[t].rejected += 1;
      }
    }
  } catch (err) {
    console.error(
      "[admin/applications] Unexpected error fetching stats:",
      err
    );
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }

  // ── 4b. Recent applications (last 50) ─────────────────────────────────────
  let recentApplications: RecentApplication[] = [];

  try {
    const { data: recent, error: recentError } = await supabaseAdmin
      .from("tier_applications")
      .select(
        "id, email, full_name, tier_applied, status, message, source, created_at, admin_notes"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (recentError) {
      console.error(
        "[admin/applications] Recent applications fetch error:",
        recentError
      );
      return Response.json(
        { error: "Failed to fetch recent applications." },
        { status: 500 }
      );
    }

    recentApplications = (recent ?? []) as RecentApplication[];
  } catch (err) {
    console.error(
      "[admin/applications] Unexpected error fetching recent applications:",
      err
    );
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }

  // ── 4c. Current payment_mode from site_settings ───────────────────────────
  let paymentMode: string = "unknown";

  try {
    const { data: siteSetting, error: settingError } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "payment_mode")
      .single();

    if (settingError) {
      console.warn(
        "[admin/applications] Could not read payment_mode:",
        settingError
      );
      // Non-fatal — return "unknown" rather than crashing the whole response
    } else {
      paymentMode = (siteSetting?.value as string) ?? "unknown";
    }
  } catch (err) {
    console.warn(
      "[admin/applications] Unexpected error reading payment_mode:",
      err
    );
  }

  // ── 5. Return consolidated response ───────────────────────────────────────
  return Response.json(
    {
      payment_mode: paymentMode,
      stats,
      recent_applications: recentApplications,
    },
    { status: 200 }
  );
}