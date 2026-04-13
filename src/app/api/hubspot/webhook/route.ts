/**
 * HubSpot Webhook Receiver
 *
 * Receives real-time notifications when a deal is marked as "GANADO" (closed won)
 * in HubSpot, and automatically creates the project in Supabase.
 *
 * Setup in HubSpot:
 * 1. Go to Settings → Integrations → Private Apps → your app
 * 2. Go to the "Webhooks" tab
 * 3. Create subscription:
 *    - Object: Deals
 *    - Event: Property changed → dealstage
 *    - Target URL: https://your-domain.vercel.app/api/hubspot/webhook
 * 4. Copy the "Client secret" from the app → set as HUBSPOT_WEBHOOK_SECRET in .env.local
 *
 * Alternatively, use HubSpot Workflows:
 * 1. Automation → Workflows → Create from scratch
 * 2. Trigger: Deal stage becomes "Ganado"
 * 3. Action: Send webhook → POST to this URL
 *    Body: { "dealId": "{{dealId}}" }
 *    Header: x-webhook-secret: your-secret
 *
 * Env vars: HUBSPOT_WEBHOOK_SECRET, HUBSPOT_ACCESS_TOKEN, SUPABASE_SERVICE_ROLE_KEY
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractProduct, detectZone } from "@/lib/hubspot/sync";
import crypto from "crypto";

// ─── HubSpot Webhook Signature Validation ───────────
function validateHubSpotSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return hash === signature;
}

// ─── Types for HubSpot webhook payloads ─────────────
interface HubSpotWebhookEvent {
  objectId: number;
  propertyName?: string;
  propertyValue?: string;
  changeSource?: string;
  eventId?: number;
  subscriptionId?: number;
  portalId?: number;
  occurredAt?: number;
  subscriptionType?: string;
  attemptNumber?: number;
  objectTypeId?: string;
}

interface WorkflowPayload {
  dealId: string;
}

// ─── Fetch a single deal from HubSpot API ───────────
async function fetchDeal(dealId: string): Promise<Record<string, string | null> | null> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) return null;

  const properties = [
    "dealname", "amount", "closedate", "hubspot_owner_id",
    "dealstage", "hs_is_closed_won", "deal_currency_code",
  ].join(",");

  const res = await fetch(
    `https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=${properties}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.properties ?? null;
}

// ─── Create project in Supabase from deal ───────────
async function createProjectFromDeal(
  dealId: string,
  props: Record<string, string | null>
) {
  const supabase = createAdminClient();

  const dealName = props.dealname ?? "Sin nombre";
  const amount = parseFloat(props.amount ?? "0") || 0;
  const closeDate = props.closedate ? props.closedate.substring(0, 10) : null;
  const ownerId = props.hubspot_owner_id ?? null;
  const currency = (props.deal_currency_code ?? "MXN") as "MXN" | "USD";

  // Look up vendedor by hubspot_owner_id
  let vendedorId: string | null = null;
  if (ownerId) {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("hubspot_owner_id", ownerId)
      .maybeSingle();
    vendedorId = user?.id ?? null;
  }

  const productType = extractProduct(dealName);
  const zone = detectZone(dealName);

  // Upsert project (won't duplicate if deal already exists)
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .upsert(
      {
        hubspot_deal_id: dealId,
        deal_name: dealName,
        business_unit: "pixel-factory",
        vendedor_id: vendedorId,
        product_type: productType,
        event_date: closeDate,
        close_date: closeDate,
        currency,
        status: "pendiente",
        payment_status: "pendiente",
        anticipo_requerido: Math.round(amount * 0.5),
        anticipo_pagado: false,
        presupuesto_confirmado: false,
      },
      { onConflict: "hubspot_deal_id" }
    )
    .select("id")
    .single();

  if (projectError) {
    console.error("Failed to upsert project:", projectError);
    return { success: false, error: projectError.message };
  }

  // Create financials row if it doesn't exist
  if (project) {
    const { data: existing } = await supabase
      .from("project_financials")
      .select("id")
      .eq("project_id", project.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("project_financials").insert({
        project_id: project.id,
        venta_presupuesto: amount,
      });
    }
  }

  return { success: true, projectId: project?.id, dealName, amount };
}

// ─── POST Handler ───────────────────────────────────
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Auth option 1: HubSpot webhook signature
  const hubspotSecret = process.env.HUBSPOT_WEBHOOK_SECRET;
  const hubspotSignature = request.headers.get("x-hubspot-signature-v3") ??
    request.headers.get("x-hubspot-signature");

  // Auth option 2: Simple shared secret (for Workflows)
  const webhookSecret = request.headers.get("x-webhook-secret");
  const cronSecret = process.env.CRON_SECRET;

  const isHubSpotAuth = hubspotSecret && hubspotSignature &&
    validateHubSpotSignature(rawBody, hubspotSignature, hubspotSecret);
  const isSimpleAuth = cronSecret && webhookSecret === cronSecret;

  if (!isHubSpotAuth && !isSimpleAuth) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const results: Array<{ dealId: string; result: unknown }> = [];

  // Handle HubSpot webhook format (array of events)
  if (Array.isArray(body)) {
    for (const event of body as HubSpotWebhookEvent[]) {
      const dealId = String(event.objectId);

      // Only process deal stage changes
      if (event.propertyName && event.propertyName !== "dealstage") {
        continue;
      }

      // Fetch full deal data from HubSpot
      const props = await fetchDeal(dealId);
      if (!props) {
        results.push({ dealId, result: { error: "Could not fetch deal" } });
        continue;
      }

      // Only process won deals
      if (props.hs_is_closed_won !== "true") {
        results.push({ dealId, result: { skipped: "Deal is not closed won" } });
        continue;
      }

      const result = await createProjectFromDeal(dealId, props);
      results.push({ dealId, result });
    }
  }

  // Handle Workflow format (single deal)
  else if (body && typeof body === "object" && "dealId" in body) {
    const { dealId } = body as WorkflowPayload;
    const props = await fetchDeal(dealId);

    if (!props) {
      return NextResponse.json(
        { error: `Could not fetch deal ${dealId}` },
        { status: 404 }
      );
    }

    const result = await createProjectFromDeal(dealId, props);
    results.push({ dealId, result });
  }

  // Unknown format
  else {
    return NextResponse.json(
      { error: "Unrecognized payload format" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    processed: results.length,
    results,
    timestamp: new Date().toISOString(),
  });
}

// HubSpot sends a GET to verify the webhook URL
export async function GET() {
  return NextResponse.json({ status: "ok", service: "pixel-ops-hubspot-webhook" });
}
