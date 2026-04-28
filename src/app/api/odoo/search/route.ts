/**
 * GET /api/odoo/search?q=<term>
 *
 * Searches Odoo sale orders by reference / client_order_ref.
 * Returns 200 with { ok: true, results } on success or { ok: false, error } on failure.
 */

import { NextRequest, NextResponse } from "next/server";
import { searchSaleOrders } from "@/lib/odoo/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";

  if (!q) {
    return NextResponse.json(
      { ok: false, error: "Parametro 'q' requerido", results: [] },
      { status: 200 }
    );
  }

  // Quick env check before doing the round-trip
  if (!process.env.ODOO_USERNAME || !process.env.ODOO_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error: "Odoo no configurado (faltan ODOO_USERNAME / ODOO_API_KEY)",
        results: [],
      },
      { status: 200 }
    );
  }

  try {
    const results = await searchSaleOrders(q);
    return NextResponse.json({ ok: true, q, results }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: message, results: [] },
      { status: 200 }
    );
  }
}
