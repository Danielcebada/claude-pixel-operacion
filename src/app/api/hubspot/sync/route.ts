/**
 * POST /api/hubspot/sync
 *
 * Syncs won HubSpot deals (2026+) into the Supabase projects table.
 *
 * Required env vars:
 *   - HUBSPOT_ACCESS_TOKEN  — HubSpot Private App token (Settings > Integrations > Private Apps)
 *   - CRON_SECRET           — Shared secret for cron/manual triggering
 *   - SUPABASE_SERVICE_ROLE_KEY — Already in .env.local
 *
 * Auth: Either of:
 *   1. Header `Authorization: Bearer {CRON_SECRET}` (for cron jobs / external triggers)
 *   2. Authenticated Supabase session with admin role
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { syncDealsToSupabase } from "@/lib/hubspot/sync";

async function isAuthorized(request: NextRequest): Promise<boolean> {
  // Check CRON_SECRET bearer token
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Check authenticated admin user via Supabase session
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // Look up role in users table
    const adminClient = createAdminClient();
    const { data: dbUser } = await adminClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    return dbUser?.role === "admin";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Auth check
  const authorized = await isAuthorized(request);
  if (!authorized) {
    return NextResponse.json(
      { error: "Unauthorized. Provide a valid CRON_SECRET or admin session." },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();
  const startedAt = new Date().toISOString();

  // Create sync log entry
  const { data: logEntry, error: logError } = await supabase
    .from("hubspot_sync_log")
    .insert({
      started_at: startedAt,
      status: "running",
    })
    .select("id")
    .single();

  if (logError) {
    console.error("Failed to create sync log:", logError);
    // Continue anyway - sync is more important than logging
  }

  try {
    const result = await syncDealsToSupabase(supabase);

    const finishedAt = new Date().toISOString();

    // Update sync log with results
    if (logEntry) {
      await supabase
        .from("hubspot_sync_log")
        .update({
          finished_at: finishedAt,
          status: result.errors.length > 0 ? "completed_with_errors" : "success",
          total_deals: result.totalDeals,
          created: result.created,
          updated: result.updated,
          skipped: result.skipped,
          errors: result.errors.length > 0 ? result.errors : null,
        })
        .eq("id", logEntry.id);
    }

    return NextResponse.json({
      success: true,
      started_at: startedAt,
      finished_at: finishedAt,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const finishedAt = new Date().toISOString();

    // Update sync log with error
    if (logEntry) {
      await supabase
        .from("hubspot_sync_log")
        .update({
          finished_at: finishedAt,
          status: "failed",
          errors: [message],
        })
        .eq("id", logEntry.id);
    }

    console.error("HubSpot sync failed:", message);

    return NextResponse.json(
      {
        success: false,
        error: message,
        started_at: startedAt,
        finished_at: finishedAt,
      },
      { status: 500 }
    );
  }
}
