/**
 * POST /api/hubspot/seed
 *
 * One-time endpoint to seed the 15 team users into Supabase,
 * then run a full HubSpot deal sync.
 *
 * Protected by CRON_SECRET only (no session needed for initial setup).
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncDealsToSupabase } from "@/lib/hubspot/sync";

// ─── User Seed Data ──────────────────────────────────

const SEED_USERS = [
  { email: "daniel@digitalpixel.studio", full_name: "Daniel Cebada", role: "admin", is_active: true, hubspot_owner_id: "26405238" },
  { email: "pris@digitalpixel.studio", full_name: "Pricila Dominguez", role: "vendedor", is_active: true, hubspot_owner_id: "26395721" },
  { email: "gaby@digitalpixel.studio", full_name: "Gabriela Gutierrez", role: "vendedor", is_active: true, hubspot_owner_id: "414692018" },
  { email: "mar@digitalpixel.studio", full_name: "Maria Gaytan", role: "vendedor", is_active: true, hubspot_owner_id: "618845046" },
  { email: "samuel@digitalpixel.studio", full_name: "Samuel Hernandez", role: "vendedor", is_active: false, hubspot_owner_id: null },
  { email: "joyce@digitalpixel.studio", full_name: "Joyce Perez", role: "pm", is_active: true, hubspot_owner_id: null },
  { email: "oscar@digitalpixel.studio", full_name: "Oscar Andrade", role: "pm", is_active: true, hubspot_owner_id: null },
  { email: "alvaro@pixelplay.mx", full_name: "Alvaro Solis", role: "pm", is_active: true, hubspot_owner_id: null },
  { email: "joel@digitalpixel.studio", full_name: "Joel Rivera", role: "pm", is_active: true, hubspot_owner_id: null },
  { email: "lalo@digitalpixel.studio", full_name: "Eduardo Martinez", role: "pm", is_active: true, hubspot_owner_id: null },
  { email: "marlene@digitalpixel.studio", full_name: "Marlene Rosas", role: "finance", is_active: true, hubspot_owner_id: null },
  { email: "diana@digitalpixel.studio", full_name: "Diana Lopez", role: "pm", is_active: true, hubspot_owner_id: null },
  { email: "ivan@digitalpixel.studio", full_name: "Ivan Torres", role: "pm", is_active: true, hubspot_owner_id: null },
  { email: "harol@digitalpixel.studio", full_name: "Harol Sanchez", role: "vendedor", is_active: true, hubspot_owner_id: "88208161" },
  { email: "erick@digitalpixel.studio", full_name: "Erick Ramirez", role: "vendedor", is_active: true, hubspot_owner_id: "80956812" },
];

export async function POST(request: NextRequest) {
  // Auth: CRON_SECRET only
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized. Provide Authorization: Bearer {CRON_SECRET}" },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();
  const seeded: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  // Seed users (skip if email already exists)
  for (const user of SEED_USERS) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (existing) {
      // Update hubspot_owner_id if it was missing
      if (user.hubspot_owner_id) {
        await supabase
          .from("users")
          .update({ hubspot_owner_id: user.hubspot_owner_id })
          .eq("id", existing.id);
      }
      skipped.push(user.email);
      continue;
    }

    const { error: insertError } = await supabase.from("users").insert(user);

    if (insertError) {
      errors.push(`${user.email}: ${insertError.message}`);
    } else {
      seeded.push(user.email);
    }
  }

  // Run HubSpot sync
  let syncResult = null;
  let syncError = null;

  try {
    syncResult = await syncDealsToSupabase(supabase);
  } catch (err) {
    syncError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    users: {
      seeded,
      skipped,
      errors,
      total: SEED_USERS.length,
    },
    sync: syncError ? { error: syncError } : syncResult,
  });
}
