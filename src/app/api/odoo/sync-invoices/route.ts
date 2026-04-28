/**
 * POST /api/odoo/sync-invoices
 *
 * Pulls sale orders from the last 6 months, fetches invoice/payment status
 * for each, and aggregates totals. Optionally matches each Odoo SO to a
 * project from MOCK_PROJECTS by name similarity.
 *
 * Returns 200 on every path so the frontend can render the result cleanly.
 */

import { NextResponse } from "next/server";
import {
  getInvoices,
  type OdooInvoice,
  type OdooSaleOrder,
} from "@/lib/odoo/client";
import { MOCK_PROJECTS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

// Re-export the model executor through a thin wrapper. The client.ts file
// keeps `execute` private, so we re-implement the needed search here using
// the public API surface (search_read via getInvoices for invoices and a
// dedicated search for sale orders below).
async function odooSearchSaleOrders(domain: unknown[]): Promise<OdooSaleOrder[]> {
  // We need a sale.order search_read but client.ts doesn't expose it for
  // arbitrary domains. Use the same JSON-RPC pattern inline.
  const ODOO_URL = process.env.ODOO_URL || "https://odoo.pixelplay.mx/odoo";
  const ODOO_DB = process.env.ODOO_DB || "pixelplay";
  const ODOO_USERNAME = process.env.ODOO_USERNAME || "";
  const ODOO_API_KEY = process.env.ODOO_API_KEY || "";

  // Authenticate
  const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "call",
      params: {
        service: "common",
        method: "authenticate",
        args: [ODOO_DB, ODOO_USERNAME, ODOO_API_KEY, {}],
      },
    }),
  });
  const authJson = await authRes.json();
  if (authJson.error) {
    throw new Error(authJson.error.data?.message || authJson.error.message);
  }
  const uid = authJson.result as number;
  if (!uid) throw new Error("Autenticacion Odoo fallida (uid invalido)");

  // search_read sale.order
  const callRes = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          ODOO_DB,
          uid,
          ODOO_API_KEY,
          "sale.order",
          "search_read",
          [domain],
          {
            fields: [
              "name",
              "state",
              "amount_total",
              "user_id",
              "partner_id",
              "invoice_ids",
              "create_date",
              "client_order_ref",
              "invoice_status",
            ],
            limit: 200,
            order: "create_date desc",
          },
        ],
      },
    }),
  });
  const callJson = await callRes.json();
  if (callJson.error) {
    throw new Error(callJson.error.data?.message || callJson.error.message);
  }
  return callJson.result as OdooSaleOrder[];
}

interface OrderRow {
  id: number;
  name: string;
  client_order_ref: string | false;
  state: string;
  invoice_status: string;
  partner: string;
  amount_total: number;
  invoiced: number;
  paid: number;
  pending: number;
  payment_status: "pagado_100" | "parcial" | "pendiente" | "sin_factura";
  invoices_count: number;
  matched_project?: { id: string; deal_name: string; similarity: number };
}

// Simple normalized similarity between two strings.
// Returns 0..1 — uses token Jaccard on lowercased alphanumeric tokens.
function similarity(a: string, b: string): number {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1);

  const ta = new Set(norm(a));
  const tb = new Set(norm(b));
  if (ta.size === 0 || tb.size === 0) return 0;

  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

function matchProject(
  orderName: string,
  clientRef: string | false
): OrderRow["matched_project"] | undefined {
  const haystack = `${orderName} ${clientRef || ""}`.trim();
  let best: { id: string; deal_name: string; similarity: number } | undefined;

  for (const p of MOCK_PROJECTS) {
    const sim = similarity(haystack, p.deal_name);
    if (sim >= 0.35 && (!best || sim > best.similarity)) {
      best = { id: p.id, deal_name: p.deal_name, similarity: sim };
    }
  }
  return best;
}

export async function POST() {
  // Quick env check
  if (!process.env.ODOO_USERNAME || !process.env.ODOO_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error: "Odoo no configurado (faltan ODOO_USERNAME / ODOO_API_KEY)",
      },
      { status: 200 }
    );
  }

  // Cutoff: last 6 months
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - 6);
  const cutoffStr = cutoff.toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    // Open sale orders in the last 6 months. We exclude fully-invoiced ones
    // ("invoiced") and cancelled ones to focus on pending money.
    const orders = await odooSearchSaleOrders([
      ["create_date", ">=", cutoffStr],
      ["state", "in", ["sale", "done"]],
      ["invoice_status", "in", ["to invoice", "no"]],
    ]);

    // For each order, fetch invoices (if any) and compute payment status.
    const rows: OrderRow[] = [];
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalInvoicesCount = 0;

    for (const order of orders) {
      let invoices: OdooInvoice[] = [];
      if (Array.isArray(order.invoice_ids) && order.invoice_ids.length > 0) {
        try {
          invoices = await getInvoices([["id", "in", order.invoice_ids]]);
        } catch {
          invoices = [];
        }
      }

      // Only count posted invoices for the totals; drafts/cancels don't move money.
      const posted = invoices.filter((inv) => inv.state === "posted");
      const invoiced = posted.reduce((s, inv) => s + inv.amount_total, 0);
      const pending = posted.reduce((s, inv) => s + inv.amount_residual, 0);
      const paid = invoiced - pending;

      let payment_status: OrderRow["payment_status"] = "sin_factura";
      if (posted.length > 0) {
        if (pending <= 0.01 && invoiced > 0) payment_status = "pagado_100";
        else if (paid > 0.01) payment_status = "parcial";
        else payment_status = "pendiente";
      }

      const partnerName = Array.isArray(order.partner_id)
        ? (order.partner_id[1] as string)
        : "";

      rows.push({
        id: order.id,
        name: order.name,
        client_order_ref:
          (order as OdooSaleOrder & { client_order_ref?: string | false })
            .client_order_ref ?? false,
        state: order.state,
        invoice_status:
          (order as OdooSaleOrder & { invoice_status?: string }).invoice_status ||
          "",
        partner: partnerName,
        amount_total: order.amount_total,
        invoiced,
        paid,
        pending,
        payment_status,
        invoices_count: invoices.length,
        matched_project: matchProject(
          order.name,
          (order as OdooSaleOrder & { client_order_ref?: string | false })
            .client_order_ref ?? false
        ),
      });

      totalInvoiced += invoiced;
      totalPaid += paid;
      totalPending += pending;
      totalInvoicesCount += invoices.length;
    }

    return NextResponse.json(
      {
        ok: true,
        cutoff: cutoffStr,
        total_orders: orders.length,
        total_invoices: totalInvoicesCount,
        total_invoiced: Math.round(totalInvoiced * 100) / 100,
        total_paid: Math.round(totalPaid * 100) / 100,
        total_pending: Math.round(totalPending * 100) / 100,
        orders: rows,
      },
      { status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
