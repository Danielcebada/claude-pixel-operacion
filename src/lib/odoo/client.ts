// Odoo JSON-RPC Client for Odoo Online (SaaS)
// Docs: https://www.odoo.com/documentation/17.0/developer/reference/external_api.html

const ODOO_URL = process.env.ODOO_URL || "https://odoo.pixelplay.mx";
const ODOO_DB = process.env.ODOO_DB || "pixel_prod";
const ODOO_USERNAME = process.env.ODOO_USERNAME || "";
const ODOO_API_KEY = process.env.ODOO_API_KEY || "";

interface OdooRPCResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: { message: string; data: { message: string } };
}

async function jsonRPC(url: string, method: string, params: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });

  const data: OdooRPCResponse = await res.json();
  if (data.error) {
    throw new Error(`Odoo RPC Error: ${data.error.data?.message || data.error.message}`);
  }
  return data.result;
}

// Authenticate and get uid
async function authenticate(): Promise<number> {
  const result = await jsonRPC(`${ODOO_URL}/jsonrpc`, "call", {
    service: "common",
    method: "authenticate",
    args: [ODOO_DB, ODOO_USERNAME, ODOO_API_KEY, {}],
  });
  return result as number;
}

// Execute Odoo model methods
async function execute(
  model: string,
  method: string,
  args: unknown[],
  kwargs: Record<string, unknown> = {}
): Promise<unknown> {
  const uid = await authenticate();
  return jsonRPC(`${ODOO_URL}/jsonrpc`, "call", {
    service: "object",
    method: "execute_kw",
    args: [ODOO_DB, uid, ODOO_API_KEY, model, method, args, kwargs],
  });
}

// === PUBLIC API ===

export interface OdooInvoice {
  id: number;
  name: string; // Numero de factura
  state: "draft" | "posted" | "cancel";
  payment_state: "not_paid" | "in_payment" | "paid" | "partial" | "reversed" | "invoicing_legacy";
  amount_total: number;
  amount_residual: number; // Lo que falta por pagar
  currency_id: [number, string];
  invoice_date: string;
  invoice_date_due: string;
  partner_id: [number, string]; // Cliente
}

export interface OdooProject {
  id: number;
  name: string;
  user_id: [number, string]; // PM en Odoo
  partner_id: [number, string]; // Cliente
  stage_id: [number, string];
}

export interface OdooSaleOrder {
  id: number;
  name: string;
  state: string;
  amount_total: number;
  user_id: [number, string]; // Vendedor
  partner_id: [number, string];
  invoice_ids: number[];
}

// Get invoices by sale order or partner
export async function getInvoices(domain: [string, string, unknown][]): Promise<OdooInvoice[]> {
  const result = await execute("account.move", "search_read", [domain], {
    fields: [
      "name", "state", "payment_state", "amount_total", "amount_residual",
      "currency_id", "invoice_date", "invoice_date_due", "partner_id",
    ],
    limit: 50,
    order: "invoice_date desc",
  });
  return result as OdooInvoice[];
}

// Get sale order details
export async function getSaleOrder(orderId: number): Promise<OdooSaleOrder | null> {
  const result = await execute("sale.order", "search_read", [[["id", "=", orderId]]], {
    fields: ["name", "state", "amount_total", "user_id", "partner_id", "invoice_ids"],
    limit: 1,
  });
  const orders = result as OdooSaleOrder[];
  return orders[0] || null;
}

// Get project details (PM, team)
export async function getProject(projectId: number): Promise<OdooProject | null> {
  const result = await execute("project.project", "search_read", [[["id", "=", projectId]]], {
    fields: ["name", "user_id", "partner_id", "stage_id"],
    limit: 1,
  });
  const projects = result as OdooProject[];
  return projects[0] || null;
}

// Search sale orders by reference (deal name)
export async function searchSaleOrders(searchTerm: string): Promise<OdooSaleOrder[]> {
  const result = await execute("sale.order", "search_read", [
    ["|", ["name", "ilike", searchTerm], ["client_order_ref", "ilike", searchTerm]],
  ], {
    fields: ["name", "state", "amount_total", "user_id", "partner_id", "invoice_ids"],
    limit: 10,
    order: "create_date desc",
  });
  return result as OdooSaleOrder[];
}

// Get payment status summary for a sale order
export async function getPaymentStatus(saleOrderId: number): Promise<{
  total: number;
  paid: number;
  pending: number;
  status: "pagado_100" | "parcial" | "pendiente";
  invoices: OdooInvoice[];
}> {
  const order = await getSaleOrder(saleOrderId);
  if (!order || !order.invoice_ids.length) {
    return { total: 0, paid: 0, pending: 0, status: "pendiente", invoices: [] };
  }

  const invoices = await getInvoices([["id", "in", order.invoice_ids]]);
  const total = invoices.reduce((s, inv) => s + inv.amount_total, 0);
  const pending = invoices.reduce((s, inv) => s + inv.amount_residual, 0);
  const paid = total - pending;

  let status: "pagado_100" | "parcial" | "pendiente" = "pendiente";
  if (pending === 0 && total > 0) status = "pagado_100";
  else if (paid > 0) status = "parcial";

  return { total, paid, pending, status, invoices };
}

// Get team assignments from Odoo project
export async function getTeamAssignments(saleOrderId: number, projectId?: number): Promise<{
  vendedor?: { id: number; name: string };
  pm?: { id: number; name: string };
  productor?: { id: number; name: string };
}> {
  const result: {
    vendedor?: { id: number; name: string };
    pm?: { id: number; name: string };
    productor?: { id: number; name: string };
  } = {};

  // Vendedor from sale order
  const order = await getSaleOrder(saleOrderId);
  if (order?.user_id) {
    result.vendedor = { id: order.user_id[0], name: order.user_id[1] };
  }

  // PM from project
  if (projectId) {
    const project = await getProject(projectId);
    if (project?.user_id) {
      result.pm = { id: project.user_id[0], name: project.user_id[1] };
    }
  }

  return result;
}

// Check if Odoo connection is working
export async function testConnection(): Promise<{ ok: boolean; uid?: number; error?: string }> {
  try {
    const uid = await authenticate();
    return { ok: true, uid };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
