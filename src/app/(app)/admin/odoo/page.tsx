"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Loader2,
  ExternalLink,
  AlertTriangle,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ─────────────────────────────────────────────────────────────────

interface TestResponse {
  ok: boolean;
  uid?: number;
  message?: string;
  error?: string;
  missing?: string[];
}

interface SearchResultRow {
  id: number;
  name: string;
  state: string;
  amount_total: number;
  partner_id: [number, string];
  user_id: [number, string];
  invoice_ids: number[];
}

interface SearchResponse {
  ok: boolean;
  q?: string;
  results: SearchResultRow[];
  error?: string;
}

interface SyncOrderRow {
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

interface SyncResponse {
  ok: boolean;
  cutoff?: string;
  total_orders?: number;
  total_invoices?: number;
  total_invoiced?: number;
  total_paid?: number;
  total_pending?: number;
  orders?: SyncOrderRow[];
  error?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);
}

const PAYMENT_LABEL: Record<SyncOrderRow["payment_status"], string> = {
  pagado_100: "Pagado 100%",
  parcial: "Parcial",
  pendiente: "Pendiente",
  sin_factura: "Sin factura",
};

const PAYMENT_VARIANT: Record<
  SyncOrderRow["payment_status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  pagado_100: "default",
  parcial: "secondary",
  pendiente: "destructive",
  sin_factura: "outline",
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function OdooAdminPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "loading"
  );
  const [statusData, setStatusData] = useState<TestResponse | null>(null);

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);

  // Sync
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncData, setSyncData] = useState<SyncResponse | null>(null);

  // Copy state for instructions
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ── Test connection on mount ──
  useEffect(() => {
    void runTest();
  }, []);

  async function runTest() {
    setStatus("loading");
    try {
      const res = await fetch("/api/odoo/test", { cache: "no-store" });
      const data: TestResponse = await res.json();
      setStatusData(data);
      setStatus(data.ok ? "ok" : "error");
    } catch (e) {
      setStatusData({
        ok: false,
        error: e instanceof Error ? e.message : "Error de red",
      });
      setStatus("error");
    }
  }

  async function runSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    setSearchData(null);
    try {
      const res = await fetch(
        `/api/odoo/search?q=${encodeURIComponent(searchTerm.trim())}`,
        { cache: "no-store" }
      );
      const data: SearchResponse = await res.json();
      setSearchData(data);
    } catch (e) {
      setSearchData({
        ok: false,
        results: [],
        error: e instanceof Error ? e.message : "Error de red",
      });
    } finally {
      setSearchLoading(false);
    }
  }

  async function runSync() {
    setSyncLoading(true);
    setSyncData(null);
    try {
      const res = await fetch("/api/odoo/sync-invoices", {
        method: "POST",
        cache: "no-store",
      });
      const data: SyncResponse = await res.json();
      setSyncData(data);
    } catch (e) {
      setSyncData({
        ok: false,
        error: e instanceof Error ? e.message : "Error de red",
      });
    } finally {
      setSyncLoading(false);
    }
  }

  function copy(label: string, value: string) {
    void navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  }

  // ── UI ──
  return (
    <div className="space-y-6 max-w-4xl">
      {/* ─── Header ─── */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuracion Odoo</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Conecta Odoo Online para sincronizar ordenes de venta, facturas y pagos.
          </p>
        </div>
      </div>

      {/* ─── Status Card ─── */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  status === "loading"
                    ? "bg-gray-300 animate-pulse"
                    : status === "ok"
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
                aria-hidden
              />
              Conexion a Odoo
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={runTest}
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Probar conexion
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {status === "loading" && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando conexion...
            </p>
          )}

          {status === "ok" && statusData?.ok && (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700">
                  {statusData.message || "Conectado a Odoo"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  UID autenticado: <code className="font-mono">{statusData.uid}</code>
                </p>
              </div>
            </div>
          )}

          {status === "error" && statusData && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-700">
                    No se pudo conectar a Odoo
                  </p>
                  {statusData.error && (
                    <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                      {statusData.error}
                    </p>
                  )}
                </div>
              </div>

              {/* Missing env vars */}
              {statusData.missing && statusData.missing.length > 0 && (
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Faltan variables de entorno
                  </p>
                  <ul className="mt-2 space-y-1">
                    {statusData.missing.map((k) => (
                      <li key={k} className="text-xs">
                        <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-800">
                          {k}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Configuration recommendation */}
              <EnvVarTable onCopy={copy} copiedKey={copiedKey} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── How to get API key (always visible) ─── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-500" />
            Como obtener tu API Key de Odoo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ol className="space-y-3">
            {[
              "Inicia sesion en Odoo (https://odoo.pixelplay.mx).",
              "Ve a tu perfil (esquina superior derecha).",
              "Mi perfil -> Cuenta -> Cuenta de seguridad.",
              'Click en "Nueva clave API". Dale un nombre como "Pixel Operations".',
              "Copia el valor mostrado (solo se muestra una vez) y pegalo en Vercel -> Settings -> Environment Variables como ODOO_API_KEY.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-gray-500">
            Las variables ODOO_USERNAME y ODOO_API_KEY deben configurarse en
            Vercel y en tu .env.local para desarrollo. Despues de cambiar las
            variables en Vercel, redespliega el proyecto.
          </p>
        </CardContent>
      </Card>

      {/* ─── Search ─── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            Buscar orden de venta
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <form onSubmit={runSearch} className="flex gap-2">
            <Input
              placeholder="Numero de orden o referencia (ej. S00123, deal name)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              disabled={status !== "ok" || searchLoading}
            />
            <Button
              type="submit"
              disabled={
                status !== "ok" || searchLoading || !searchTerm.trim()
              }
            >
              {searchLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              Buscar
            </Button>
          </form>

          {status !== "ok" && (
            <p className="text-xs text-gray-400">
              Conectate a Odoo arriba para habilitar la busqueda.
            </p>
          )}

          {searchData && (
            <div>
              {!searchData.ok && (
                <div className="text-sm text-red-600 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> {searchData.error}
                </div>
              )}
              {searchData.ok && searchData.results.length === 0 && (
                <p className="text-sm text-gray-500">
                  Sin resultados para &quot;{searchData.q}&quot;.
                </p>
              )}
              {searchData.ok && searchData.results.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Orden
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Facturas
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {searchData.results.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2 font-mono text-xs">
                            {r.name}
                          </td>
                          <td className="px-3 py-2 text-gray-700">
                            {Array.isArray(r.partner_id)
                              ? r.partner_id[1]
                              : "-"}
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline">{r.state}</Badge>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatMoney(r.amount_total)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-500">
                            {r.invoice_ids.length}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Sync ─── */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-gray-500" />
              Sincronizar facturas
            </CardTitle>
            <Button
              onClick={runSync}
              disabled={status !== "ok" || syncLoading}
              size="sm"
            >
              {syncLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Sincronizar ultimos 6 meses
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs text-gray-500">
            Trae todas las ordenes de venta abiertas (no facturadas o
            parcialmente facturadas) de los ultimos 6 meses, junto con su
            estado de pago. Tambien intenta hacer match con tus proyectos por
            similitud de nombre.
          </p>

          {status !== "ok" && (
            <p className="text-xs text-gray-400">
              Conectate a Odoo arriba para habilitar la sincronizacion.
            </p>
          )}

          {syncData && (
            <>
              {!syncData.ok && (
                <div className="text-sm text-red-600 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> {syncData.error}
                </div>
              )}

              {syncData.ok && (
                <div className="space-y-4">
                  {/* Aggregates */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <SummaryCell
                      label="Ordenes"
                      value={String(syncData.total_orders ?? 0)}
                    />
                    <SummaryCell
                      label="Facturas"
                      value={String(syncData.total_invoices ?? 0)}
                    />
                    <SummaryCell
                      label="Pagado"
                      value={formatMoney(syncData.total_paid ?? 0)}
                      tone="green"
                    />
                    <SummaryCell
                      label="Pendiente"
                      value={formatMoney(syncData.total_pending ?? 0)}
                      tone="amber"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Corte desde {syncData.cutoff}. Total facturado:{" "}
                    <span className="font-mono">
                      {formatMoney(syncData.total_invoiced ?? 0)}
                    </span>
                  </p>

                  {/* Orders table */}
                  {syncData.orders && syncData.orders.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                              Orden
                            </th>
                            <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                              Cliente
                            </th>
                            <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                              Match Proyecto
                            </th>
                            <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                              Pagado
                            </th>
                            <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                              Pendiente
                            </th>
                            <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                              Pago
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {syncData.orders.map((o) => (
                            <tr key={o.id} className="hover:bg-gray-50/50">
                              <td className="px-3 py-2 font-mono text-xs">
                                {o.name}
                              </td>
                              <td className="px-3 py-2 text-gray-700">
                                {o.partner || "-"}
                              </td>
                              <td className="px-3 py-2 text-xs">
                                {o.matched_project ? (
                                  <span title={`Similitud ${(o.matched_project.similarity * 100).toFixed(0)}%`}>
                                    {o.matched_project.deal_name}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                {formatMoney(o.amount_total)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-green-700">
                                {formatMoney(o.paid)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-amber-700">
                                {formatMoney(o.pending)}
                              </td>
                              <td className="px-3 py-2">
                                <Badge variant={PAYMENT_VARIANT[o.payment_status]}>
                                  {PAYMENT_LABEL[o.payment_status]}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No se encontraron ordenes en el periodo.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function EnvVarTable({
  onCopy,
  copiedKey,
}: {
  onCopy: (label: string, value: string) => void;
  copiedKey: string | null;
}) {
  const rows: Array<{ key: string; defaultValue?: string; required: boolean }> = [
    { key: "ODOO_URL", defaultValue: "https://odoo.pixelplay.mx/odoo", required: true },
    { key: "ODOO_DB", defaultValue: "pixelplay", required: true },
    { key: "ODOO_USERNAME", required: true },
    { key: "ODOO_API_KEY", required: true },
  ];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        Variables de entorno
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-gray-100 first:border-t-0">
              <td className="px-3 py-2 font-mono text-xs text-gray-700 align-top">
                {r.key}
                {r.required && (
                  <span className="ml-1 text-red-400">*</span>
                )}
              </td>
              <td className="px-3 py-2 text-xs text-gray-500 align-top">
                {r.defaultValue ? (
                  <span className="font-mono">
                    Default: {r.defaultValue}
                  </span>
                ) : (
                  <span className="italic">Requerido (sin default)</span>
                )}
              </td>
              <td className="px-3 py-2 align-top text-right">
                {r.defaultValue && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onCopy(r.key, r.defaultValue!)}
                  >
                    {copiedKey === r.key ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 bg-gray-50 border-t text-[11px] text-gray-500 flex items-center gap-1">
        <ExternalLink className="w-3 h-3" />
        <span>Configura estas variables en Vercel -&gt; Settings -&gt; Environment Variables.</span>
      </div>
    </div>
  );
}

function SummaryCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "amber";
}) {
  const colorClass =
    tone === "green"
      ? "text-green-700"
      : tone === "amber"
        ? "text-amber-700"
        : "text-gray-900";
  return (
    <div className="border border-gray-200 rounded-lg px-3 py-2 bg-white">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
        {label}
      </p>
      <p className={`text-base font-bold mt-0.5 ${colorClass}`}>{value}</p>
    </div>
  );
}
