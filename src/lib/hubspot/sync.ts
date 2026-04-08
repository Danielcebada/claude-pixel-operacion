import { SupabaseClient } from "@supabase/supabase-js";
import { searchAllDeals, HubSpotDeal } from "./client";

// ─── Product & Zone Detection (from mock-data.ts) ────

export function extractProduct(dealName: string): string {
  const lower = dealName.toLowerCase();
  if (lower.includes("photobooth") || lower.includes("photo booth") || lower.includes("booth con impresion")) return "Photobooth";
  if (lower.includes("ipad booth") || lower.includes("ipadbooth")) return "iPad Booth";
  if (lower.includes("mirror booth") || lower.includes("mirror")) return "Mirror Booth";
  if (lower.includes("coffee print") || lower.includes("barra de café") || lower.includes("barra de cafe") || lower.includes("barra de matcha") || lower.includes("cafe gourmet")) return "Coffee Print";
  if (lower.includes("sketchbooth") || lower.includes("sketch booth") || lower.includes("robot sketch")) return "Sketch Booth";
  if (lower.includes("360")) return "360 Booth";
  if (lower.includes("green screen")) return "Green Screen";
  if (lower.includes("glambot") || lower.includes("glam bot")) return "Glambot";
  if (lower.includes("bubblehead") || lower.includes("cabezones")) return "Bubblehead AI";
  if (lower.includes("batak")) return "Batak";
  if (lower.includes("vr") || lower.includes("beat saber")) return "VR Experience";
  if (lower.includes("meta human")) return "Meta Human";
  if (lower.includes("holograma")) return "Holograma";
  if (lower.includes("arcade") || lower.includes("maquinit")) return "Arcade";
  if (lower.includes("mesa interactiva")) return "Mesa Interactiva";
  if (lower.includes("riel booth")) return "Riel Booth";
  if (lower.includes("juego interactivo") || lower.includes("juego en pantalla")) return "Juego Interactivo";
  if (lower.includes("laser") || lower.includes("láser")) return "Laser Machine";
  if (lower.includes("sticker") || lower.includes("plancha")) return "Sticker Station";
  if (lower.includes("cabina cerrada")) return "Cabina Cerrada";
  if (lower.includes("surface") || lower.includes("sensores")) return "Superficie Sensores";
  if (lower.includes("kit de actividad")) return "Kit Actividad";
  if (lower.includes("garrita") || lower.includes("claw")) return "Pixel Claw";
  if (lower.includes("filtro ia") || lower.includes("ai") || lower.includes("sistema de ai")) return "Photo AI";
  if (lower.includes("multiball")) return "Multiball";
  if (lower.includes("credencial")) return "Credenciales AI";
  if (lower.includes("super kick") || lower.includes("soccer") || lower.includes("futbolito")) return "Sports Games";
  if (lower.includes("tatto print") || lower.includes("tattoo")) return "Tatto Print";
  if (lower.includes("fortuna") || lower.includes("ruleta")) return "Rueda de la Fortuna";
  if (lower.includes("sense step") || lower.includes("sensestep")) return "Sense Step";
  if (lower.includes("pulse") || lower.includes("speed test") || lower.includes("reflejos")) return "Pulse Challenge";
  if (lower.includes("robot")) return "Robots";
  if (lower.includes("totem")) return "Totem Interactivo";
  return "Experiencia Custom";
}

export function detectZone(dealName: string): "CDMX" | "Foraneo" {
  const lower = dealName.toLowerCase();
  if (
    lower.includes("gdl") || lower.includes("guadalajara") ||
    lower.includes("mty") || lower.includes("monterrey") ||
    lower.includes("cancun") || lower.includes("cun") ||
    lower.includes("acapulco") || lower.includes("cuernavaca") ||
    lower.includes("jalisco") || lower.includes("forane") ||
    lower.includes("leon") || lower.includes("toluca") ||
    lower.includes("chihuahua") || lower.includes("merida") ||
    lower.includes("houston") || lower.includes("puebla") ||
    lower.includes("san miguel") || lower.includes("atizapan") ||
    lower.includes("qro") || lower.includes("queretaro") ||
    lower.includes("gto")
  ) {
    return "Foraneo";
  }
  return "CDMX";
}

// ─── HubSpot Properties to Fetch ─────────────────────

const DEAL_PROPERTIES = [
  "dealname",
  "amount",
  "closedate",
  "hs_is_closed_won",
  "hubspot_owner_id",
  "dealstage",
  "pipeline",
  "hs_object_id",
  "deal_currency_code",
];

// ─── Sync Result Type ────────────────────────────────

export interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  totalDeals: number;
}

// ─── Core Sync Logic ─────────────────────────────────

/**
 * Fetches all won deals from 2026+ from HubSpot and upserts them into Supabase.
 * Uses the admin client (service role) for all DB operations.
 */
export async function syncDealsToSupabase(
  supabase: SupabaseClient
): Promise<SyncResult> {
  const result: SyncResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    totalDeals: 0,
  };

  // 1. Fetch all won deals from 2026+
  const deals = await searchAllDeals(
    [
      {
        filters: [
          {
            propertyName: "hs_is_closed_won",
            operator: "EQ",
            value: "true",
          },
          {
            propertyName: "closedate",
            operator: "GTE",
            value: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
    ],
    DEAL_PROPERTIES
  );

  result.totalDeals = deals.length;

  // 2. Build a map of hubspot_owner_id -> user from users table
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, hubspot_owner_id")
    .not("hubspot_owner_id", "is", null);

  if (usersError) {
    result.errors.push(`Failed to fetch users: ${usersError.message}`);
    return result;
  }

  const ownerToUser = new Map<string, string>();
  for (const u of users ?? []) {
    if (u.hubspot_owner_id) {
      ownerToUser.set(u.hubspot_owner_id, u.id);
    }
  }

  // 3. Check which deals already exist in projects
  const dealIds = deals.map((d) => d.id);
  const { data: existingProjects } = await supabase
    .from("projects")
    .select("id, hubspot_deal_id")
    .in("hubspot_deal_id", dealIds);

  const existingDealMap = new Map<string, string>();
  for (const p of existingProjects ?? []) {
    if (p.hubspot_deal_id) {
      existingDealMap.set(p.hubspot_deal_id, p.id);
    }
  }

  // 4. Process each deal
  for (const deal of deals) {
    try {
      await processDeal(deal, supabase, ownerToUser, existingDealMap, result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Deal ${deal.id} (${deal.properties.dealname}): ${msg}`);
      result.skipped++;
    }
  }

  return result;
}

async function processDeal(
  deal: HubSpotDeal,
  supabase: SupabaseClient,
  ownerToUser: Map<string, string>,
  existingDealMap: Map<string, string>,
  result: SyncResult
): Promise<void> {
  const props = deal.properties;
  const dealName = props.dealname ?? "Sin nombre";
  const amount = parseFloat(props.amount ?? "0") || 0;
  const closeDate = props.closedate ?? null;
  const ownerId = props.hubspot_owner_id ?? null;
  const currency = (props.deal_currency_code ?? "MXN") as "MXN" | "USD";

  // Look up vendedor
  const vendedorId = ownerId ? ownerToUser.get(ownerId) : null;
  if (!vendedorId) {
    result.errors.push(
      `Deal ${deal.id} "${dealName}": HubSpot owner ${ownerId} not found in users table. Skipping.`
    );
    result.skipped++;
    return;
  }

  const productType = extractProduct(dealName);
  const isExisting = existingDealMap.has(deal.id);

  if (isExisting) {
    // UPDATE existing project
    const projectId = existingDealMap.get(deal.id)!;
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        deal_name: dealName,
        product_type: productType,
        vendedor_id: vendedorId,
        currency,
        close_date: closeDate,
      })
      .eq("id", projectId);

    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`);
    }

    // Update venta_presupuesto in financials if it changed
    await supabase
      .from("project_financials")
      .update({ venta_presupuesto: amount })
      .eq("project_id", projectId);

    result.updated++;
  } else {
    // INSERT new project via upsert on hubspot_deal_id
    const zone = detectZone(dealName);
    const { data: inserted, error: insertError } = await supabase
      .from("projects")
      .upsert(
        {
          hubspot_deal_id: deal.id,
          deal_name: dealName,
          business_unit: "pixel-factory" as const,
          vendedor_id: vendedorId,
          product_type: productType,
          event_date: closeDate,
          close_date: closeDate,
          currency,
          status: "pendiente" as const,
          payment_status: "pendiente" as const,
          zone,
          anticipo_requerido: Math.round(amount * 0.5),
          anticipo_pagado: false,
          presupuesto_confirmado: false,
        },
        { onConflict: "hubspot_deal_id" }
      )
      .select("id")
      .single();

    if (insertError) {
      throw new Error(`Upsert failed: ${insertError.message}`);
    }

    // Create project_financials row if it doesn't exist
    if (inserted) {
      const { data: existingFinancials } = await supabase
        .from("project_financials")
        .select("id")
        .eq("project_id", inserted.id)
        .maybeSingle();

      if (!existingFinancials) {
        const { error: finError } = await supabase
          .from("project_financials")
          .insert({
            project_id: inserted.id,
            venta_presupuesto: amount,
            venta_real: 0,
            costos_presupuesto: 0,
            costos_real: 0,
            gasolina_presupuesto: 0,
            gasolina_real: 0,
            internet_presupuesto: 0,
            internet_real: 0,
            operacion_presupuesto: 0,
            operacion_real: 0,
            instalacion_presupuesto: 0,
            instalacion_real: 0,
            ubers_presupuesto: 0,
            ubers_real: 0,
            extras_presupuesto: 0,
            extras_real: 0,
            viaticos_venta: 0,
            viaticos_gasto: 0,
            viaticos_uber: 0,
          });

        if (finError) {
          result.errors.push(
            `Deal ${deal.id}: project created but financials insert failed: ${finError.message}`
          );
        }
      }
    }

    result.created++;
  }
}
