"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Plus,
  CheckCircle2,
} from "lucide-react";

interface OdooSearchRow {
  id: number;
  name: string;
  state: string;
  amount_total: number;
  partner_id: [number, string];
  invoice_ids: number[];
}

interface SearchResponse {
  ok: boolean;
  results: OdooSearchRow[];
  error?: string;
}

interface TestResponse {
  ok: boolean;
  missing?: string[];
  error?: string;
}

type Status =
  | { kind: "loading" }
  | { kind: "not_configured" }
  | { kind: "error"; message: string }
  | { kind: "not_found" }
  | { kind: "found"; row: OdooSearchRow };

const ODOO_BASE_URL = "https://odoo.pixelplay.mx";

/**
 * Compact status card showing the project's Odoo Sale Order link.
 *
 * Behavior:
 *  1. On mount calls /api/odoo/test to detect configuration.
 *  2. If configured, calls /api/odoo/search?q=<first words of deal_name>.
 *  3. Renders connection state, found SO, or "create" placeholder.
 */
export function OdooStatusCard({ dealName }: { dealName: string }) {
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Step 1: configuration check
      try {
        const testRes = await fetch("/api/odoo/test", { cache: "no-store" });
        const testData: TestResponse = await testRes.json();
        if (cancelled) return;

        if (!testData.ok) {
          // If env vars are missing, show "not_configured". Otherwise, error.
          if (testData.missing && testData.missing.length > 0) {
            setStatus({ kind: "not_configured" });
          } else {
            setStatus({
              kind: "error",
              message: testData.error || "Error de Odoo",
            });
          }
          return;
        }
      } catch {
        if (!cancelled) {
          setStatus({
            kind: "error",
            message: "No se pudo contactar el endpoint de Odoo",
          });
        }
        return;
      }

      // Step 2: search by first 3 significant words of deal name
      const q = pickQuery(dealName);
      if (!q) {
        if (!cancelled) setStatus({ kind: "not_found" });
        return;
      }

      try {
        const res = await fetch(
          `/api/odoo/search?q=${encodeURIComponent(q)}`,
          { cache: "no-store" }
        );
        const data: SearchResponse = await res.json();
        if (cancelled) return;

        if (!data.ok) {
          setStatus({
            kind: "error",
            message: data.error || "Error al buscar en Odoo",
          });
          return;
        }
        if (data.results.length === 0) {
          setStatus({ kind: "not_found" });
          return;
        }
        // Pick the most recent (search is already ordered by create_date desc)
        setStatus({ kind: "found", row: data.results[0] });
      } catch (e) {
        if (!cancelled) {
          setStatus({
            kind: "error",
            message: e instanceof Error ? e.message : "Error de red",
          });
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [dealName]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Wallet className="w-4 h-4 text-purple-500" />
        <h2 className="text-sm font-semibold text-gray-700">Estado en Odoo</h2>
      </div>
      <div className="p-4 text-sm">
        {status.kind === "loading" && (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Consultando Odoo...</span>
          </div>
        )}

        {status.kind === "not_configured" && (
          <div className="flex items-start gap-2 px-3 py-2 border border-amber-200 bg-amber-50 rounded-md text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="font-medium">Odoo no configurado</p>
              <Link
                href="/admin/odoo"
                className="inline-flex items-center gap-1 mt-1 text-amber-700 underline-offset-2 hover:underline"
              >
                Configurar ahora
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {status.kind === "error" && (
          <div className="flex items-start gap-2 px-3 py-2 border border-red-200 bg-red-50 rounded-md text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="font-medium">Error al consultar Odoo</p>
              <p className="font-mono break-all mt-0.5">{status.message}</p>
              <Link
                href="/admin/odoo"
                className="inline-flex items-center gap-1 mt-1 text-red-700 underline-offset-2 hover:underline"
              >
                Ir a configuracion
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {status.kind === "not_found" && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Sin orden de venta en Odoo</p>
            <button
              type="button"
              disabled
              title="Funcionalidad pendiente"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-medium rounded-md cursor-not-allowed bg-gray-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear en Odoo
            </button>
          </div>
        )}

        {status.kind === "found" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-mono text-sm font-semibold">
                {status.row.name}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                {status.row.state}
              </span>
              <span className="text-gray-500">
                {status.row.invoice_ids.length} factura
                {status.row.invoice_ids.length === 1 ? "" : "s"}
              </span>
            </div>
            {Array.isArray(status.row.partner_id) && (
              <p className="text-xs text-gray-500">
                Cliente:{" "}
                <span className="text-gray-700">{status.row.partner_id[1]}</span>
              </p>
            )}
            <a
              href={`${ODOO_BASE_URL}/odoo/sales/${status.row.id}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              Abrir en Odoo
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Pick the first 3 significant tokens from the deal name to use as the search query.
function pickQuery(dealName: string): string {
  const STOP = new Set([
    "el",
    "la",
    "los",
    "las",
    "de",
    "del",
    "para",
    "con",
    "en",
    "y",
    "a",
    "un",
    "una",
    "the",
    "of",
    "for",
    "and",
  ]);
  const tokens = dealName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]+/g, ""))
    .filter((t) => t.length > 1 && !STOP.has(t));
  return tokens.slice(0, 3).join(" ").trim();
}
