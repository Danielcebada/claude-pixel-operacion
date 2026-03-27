"use client";

import { useState } from "react";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { computeProfitability, formatCurrency, getMarginColor, getMarginBg, BUSINESS_UNITS, type BusinessUnit } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronRight, Filter } from "lucide-react";

type PaymentGroup = "pagado_100" | "parcial" | "pendiente";

const PAYMENT_LABELS: Record<PaymentGroup, string> = {
  pagado_100: "Pagado 100%",
  parcial: "Parcial (30-50%)",
  pendiente: "Por cobrar",
};

const MONTHS = [
  { value: "2026-02", label: "Febrero 2026" },
  { value: "2026-01", label: "Enero 2026" },
  { value: "2025-12", label: "Diciembre 2025" },
  { value: "2025-11", label: "Noviembre 2025" },
];

interface ConsolidatedRow {
  eventos: number;
  ventaReal: number;
  costosReal: number;
  utilidadBruta: number;
  gastosReal: number;
  utilidadNeta: number;
  viaticosVenta: number;
  viaticosGasto: number;
  utilidadViaticos: number;
  comisiones: number;
  comisionPagadora: number;
  utilidadTotal: number;
  pctUtilidad: number;
}

function consolidate(projects: typeof enriched): ConsolidatedRow {
  const eventos = projects.length;
  const ventaReal = projects.reduce((s, p) => s + p.financials.venta_real, 0);
  const costosReal = projects.reduce((s, p) => s + p.financials.costos_real, 0);
  const utilidadBruta = ventaReal - costosReal;
  const gastosReal = projects.reduce((s, p) => s + p.total_gastos_real, 0);
  const utilidadNeta = utilidadBruta - gastosReal;
  const viaticosVenta = projects.reduce((s, p) => s + p.financials.viaticos_venta, 0);
  const viaticosGasto = projects.reduce((s, p) => s + p.financials.viaticos_gasto, 0);
  const utilidadViaticos = viaticosVenta - viaticosGasto;
  const utilidadTotal = utilidadNeta + utilidadViaticos;
  const comisiones = Math.round(utilidadTotal * 0.11); // ~11% total
  const comisionPagadora = Math.round(comisiones * 0.10);
  const pctUtilidad = ventaReal > 0 ? Math.round((utilidadTotal / ventaReal) * 10000) / 100 : 0;

  return { eventos, ventaReal, costosReal, utilidadBruta, gastosReal, utilidadNeta, viaticosVenta, viaticosGasto, utilidadViaticos, comisiones, comisionPagadora, utilidadTotal, pctUtilidad };
}

const enriched = MOCK_PROJECTS.filter((p) => p.financials.venta_real > 0).map((p) => ({
  ...p,
  ...computeProfitability(p.financials),
}));

function ResultRow({ label, data, bold, highlight }: { label: string; data: ConsolidatedRow; bold?: boolean; highlight?: string }) {
  return null; // Replaced by table below
}

function ConsolidatedTable({ title, data, color }: { title: string; data: ConsolidatedRow; color: string }) {
  const [expanded, setExpanded] = useState(true);

  const rows: { label: string; value: number; format?: "currency" | "pct" | "number"; bold?: boolean; highlight?: string }[] = [
    { label: "Eventos", value: data.eventos, format: "number" },
    { label: "Operados (Venta Real)", value: data.ventaReal, format: "currency", bold: true },
    { label: "Costo Directo", value: data.costosReal, format: "currency" },
    { label: "Utilidad Bruta", value: data.utilidadBruta, format: "currency", bold: true, highlight: "green" },
    { label: "Gastos de Operacion", value: data.gastosReal, format: "currency" },
    { label: "Utilidad Neta", value: data.utilidadNeta, format: "currency", bold: true, highlight: "green" },
    { label: "Viaticos Venta", value: data.viaticosVenta, format: "currency" },
    { label: "Gastos Viaticos", value: data.viaticosGasto, format: "currency" },
    { label: "Utilidad Viaticos", value: data.utilidadViaticos, format: "currency", highlight: data.utilidadViaticos >= 0 ? "green" : "red" },
    { label: "Comisiones", value: data.comisiones, format: "currency" },
    { label: "Comision Pagadora", value: data.comisionPagadora, format: "currency" },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between px-4 py-3 ${color} text-white font-bold text-sm`}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {title}
        </div>
        <div className="flex items-center gap-4">
          <span>{data.eventos} eventos</span>
          <span className="font-mono">{formatCurrency(data.ventaReal)}</span>
          <Badge className="bg-white/20 text-white">{data.pctUtilidad}%</Badge>
        </div>
      </button>
      {expanded && (
        <table className="w-full text-sm">
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.label} className={row.highlight === "green" ? "bg-green-50" : row.highlight === "red" ? "bg-red-50" : ""}>
                <td className={`px-4 py-1.5 ${row.bold ? "font-bold" : ""} text-gray-700`}>{row.label}</td>
                <td className={`px-4 py-1.5 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "green" ? "text-green-600" : row.highlight === "red" ? "text-red-600" : ""}`}>
                  {row.format === "currency" ? formatCurrency(row.value) : row.format === "pct" ? `${row.value}%` : row.value}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-900 text-white">
              <td className="px-4 py-2 font-bold">Utilidad Total</td>
              <td className="px-4 py-2 text-right font-mono font-bold text-lg">{formatCurrency(data.utilidadTotal)}</td>
            </tr>
            <tr className="bg-gray-800 text-white">
              <td className="px-4 py-1.5">% Utilidad</td>
              <td className={`px-4 py-1.5 text-right font-mono font-bold ${data.pctUtilidad >= 30 ? "text-green-400" : data.pctUtilidad >= 15 ? "text-yellow-400" : "text-red-400"}`}>
                {data.pctUtilidad}%
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ConsolidationPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-02");
  const [filterUnit, setFilterUnit] = useState<string>("all");

  // Group by business unit
  const pixelProjects = enriched.filter((p) => p.business_unit === "pixel-factory");
  const oromoProjects = enriched.filter((p) => p.business_unit === "oromo");
  const picboxProjects = enriched.filter((p) => p.business_unit === "picbox");

  // Group by payment status
  const pixelPaid = pixelProjects.filter((p) => p.payment_status === "pagado_100");
  const pixelPartial = pixelProjects.filter((p) => p.payment_status === "parcial");
  const pixelPending = pixelProjects.filter((p) => p.payment_status === "pendiente");

  // Totals
  const totalAll = consolidate(enriched);
  const totalPixel = consolidate(pixelProjects);
  const totalPixelPaid = consolidate(pixelPaid);
  const totalPixelPartial = consolidate(pixelPartial);
  const totalPixelPending = consolidate(pixelPending);

  // Commission breakdown by person
  const comisionByPerson: Record<string, { name: string; vendedor: number; pm: number; productor: number }> = {};
  enriched.forEach((p) => {
    const util = p.utilidad_total;
    const vName = p.vendedor_name || "Sin vendedor";
    const pmName = p.pm_name || "Sin PM";
    if (!comisionByPerson[vName]) comisionByPerson[vName] = { name: vName, vendedor: 0, pm: 0, productor: 0 };
    if (!comisionByPerson[pmName]) comisionByPerson[pmName] = { name: pmName, vendedor: 0, pm: 0, productor: 0 };
    comisionByPerson[vName].vendedor += Math.round(util * 0.045);
    comisionByPerson[pmName].pm += Math.round(util * 0.03);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consolidacion Mensual</h1>
          <p className="text-sm text-gray-500 mt-1">Vista tipo RESULTADO - Rentabilidad por unidad y estatus de pago</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm font-medium"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Grand Total KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500">Eventos</p>
            <p className="text-2xl font-bold">{totalAll.eventos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500">Venta Total</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAll.ventaReal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500">Utilidad Total</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAll.utilidadTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500">Margen</p>
            <p className={`text-2xl font-bold ${getMarginColor(totalAll.pctUtilidad)}`}>{totalAll.pctUtilidad}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500">Comisiones</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAll.comisiones + totalAll.comisionPagadora)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pixel Factory */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">Pixel Factory</h2>

        <ConsolidatedTable
          title="Pixel - Pagado 100%"
          data={totalPixelPaid}
          color="bg-green-700"
        />
        <ConsolidatedTable
          title="Pixel - Parcial (30-50%)"
          data={totalPixelPartial}
          color="bg-yellow-600"
        />
        <ConsolidatedTable
          title="Pixel - Por Cobrar"
          data={totalPixelPending}
          color="bg-red-700"
        />

        {/* Pixel Total */}
        <Card className="border-2 border-gray-900">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Eventos</p>
                <p className="text-xl font-bold">{totalPixel.eventos}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Venta</p>
                <p className="text-xl font-bold">{formatCurrency(totalPixel.ventaReal)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Utilidad Neta</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalPixel.utilidadNeta)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Viaticos</p>
                <p className="text-xl font-bold">{formatCurrency(totalPixel.utilidadViaticos)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Comisiones</p>
                <p className="text-xl font-bold">{formatCurrency(totalPixel.comisiones)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">% Margen</p>
                <p className={`text-xl font-bold ${getMarginColor(totalPixel.pctUtilidad)}`}>{totalPixel.pctUtilidad}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comisiones por Persona */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comisiones por Persona</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Persona</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Vendedor (4.5%)</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">PM (3%)</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.values(comisionByPerson)
                .sort((a, b) => (b.vendedor + b.pm) - (a.vendedor + a.pm))
                .map((p) => (
                  <tr key={p.name} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2 text-right font-mono">{p.vendedor > 0 ? formatCurrency(p.vendedor) : "-"}</td>
                    <td className="px-4 py-2 text-right font-mono">{p.pm > 0 ? formatCurrency(p.pm) : "-"}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-green-600">{formatCurrency(p.vendedor + p.pm)}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-2">TOTAL</td>
                <td className="px-4 py-2 text-right font-mono">
                  {formatCurrency(Object.values(comisionByPerson).reduce((s, p) => s + p.vendedor, 0))}
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  {formatCurrency(Object.values(comisionByPerson).reduce((s, p) => s + p.pm, 0))}
                </td>
                <td className="px-4 py-2 text-right font-mono font-bold">
                  {formatCurrency(Object.values(comisionByPerson).reduce((s, p) => s + p.vendedor + p.pm, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
