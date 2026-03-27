"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Receipt,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Flame,
} from "lucide-react";
import { formatCurrency } from "@/lib/types";

// ─── KPI DATA ──────────────────────────────────────
const KPI_CARDS = [
  { label: "Cash Position (est.)", value: 4200000, icon: Wallet, color: "text-green-600", bg: "bg-green-50", delta: "+12% vs Feb" },
  { label: "Cuentas por Cobrar", value: 2850000, icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50", delta: "15 facturas activas" },
  { label: "Cuentas por Pagar", value: 890000, icon: Receipt, color: "text-red-600", bg: "bg-red-50", delta: "6 proveedores" },
  { label: "Revenue Q1 2026", value: 12916548, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", delta: "+240% vs Q1 2025" },
  { label: "Utilidad Estimada Q1", value: 9300000, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50", delta: "72% margen" },
  { label: "Burn Rate Mensual", value: 1200000, icon: Flame, color: "text-orange-600", bg: "bg-orange-50", delta: "3.5 meses runway" },
];

// ─── CASH FLOW DATA ────────────────────────────────
const MONTHLY_CASHFLOW = [
  { month: "Oct 2025", ingresos: 2100000, egresos: 980000 },
  { month: "Nov 2025", ingresos: 2450000, egresos: 1050000 },
  { month: "Dic 2025", ingresos: 1800000, egresos: 1320000 },
  { month: "Ene 2026", ingresos: 1627132, egresos: 1100000 },
  { month: "Feb 2026", ingresos: 7021458, egresos: 1350000 },
  { month: "Mar 2026", ingresos: 4267958, egresos: 1200000 },
];

const FORECAST_3M = [
  { month: "Abr 2026", ingresos: 3800000, egresos: 1250000, confidence: "Alta" },
  { month: "May 2026", ingresos: 4200000, egresos: 1300000, confidence: "Media" },
  { month: "Jun 2026", ingresos: 3500000, egresos: 1280000, confidence: "Baja" },
];

// ─── AR AGING DATA ─────────────────────────────────
const AR_CLIENTS = [
  { cliente: "Grupo Bimbo", total: 450000, corriente: 450000, d31_60: 0, d61_90: 0, d90plus: 0, estatus: "al_corriente" },
  { cliente: "Liverpool", total: 380000, corriente: 280000, d31_60: 100000, d61_90: 0, d90plus: 0, estatus: "al_corriente" },
  { cliente: "Coca-Cola FEMSA", total: 320000, corriente: 320000, d31_60: 0, d61_90: 0, d90plus: 0, estatus: "al_corriente" },
  { cliente: "TKL Group", total: 285000, corriente: 185000, d31_60: 100000, d61_90: 0, d90plus: 0, estatus: "al_corriente" },
  { cliente: "Cerveceria Modelo", total: 250000, corriente: 0, d31_60: 250000, d61_90: 0, d90plus: 0, estatus: "atrasado" },
  { cliente: "Nestl\u00e9 Mexico", total: 220000, corriente: 120000, d31_60: 0, d61_90: 100000, d90plus: 0, estatus: "atrasado" },
  { cliente: "Procter & Gamble", total: 195000, corriente: 195000, d31_60: 0, d61_90: 0, d90plus: 0, estatus: "al_corriente" },
  { cliente: "Samsung Mexico", total: 180000, corriente: 0, d31_60: 0, d61_90: 0, d90plus: 180000, estatus: "critico" },
  { cliente: "Heineken Mexico", total: 150000, corriente: 150000, d31_60: 0, d61_90: 0, d90plus: 0, estatus: "al_corriente" },
  { cliente: "Telcel / AT", total: 130000, corriente: 0, d31_60: 0, d61_90: 130000, d90plus: 0, estatus: "atrasado" },
  { cliente: "Kimberly-Clark", total: 95000, corriente: 95000, d31_60: 0, d61_90: 0, d90plus: 0, estatus: "al_corriente" },
  { cliente: "PepsiCo Mexico", total: 80000, corriente: 0, d31_60: 0, d61_90: 0, d90plus: 80000, estatus: "critico" },
  { cliente: "Walmart Mexico", total: 50000, corriente: 50000, d31_60: 0, d61_90: 0, d90plus: 0, estatus: "al_corriente" },
  { cliente: "BBVA Mexico", total: 40000, corriente: 0, d31_60: 40000, d61_90: 0, d90plus: 0, estatus: "atrasado" },
  { cliente: "Alpura", total: 25000, corriente: 25000, d31_60: 0, d61_90: 0, d90plus: 0, estatus: "al_corriente" },
];

// ─── P&L DATA ──────────────────────────────────────
const PL_DATA = {
  headers: ["Concepto", "Ene 2026", "Feb 2026", "Mar 2026", "Total Q1"],
  rows: [
    { concepto: "(+) Ingresos por Servicios", ene: 1627132, feb: 7021458, mar: 4267958, isRevenue: true },
    { concepto: "(-) Costo de Ventas (equipos, materiales)", ene: 325426, feb: 1404292, mar: 853592, isExpense: true },
    { concepto: "= Utilidad Bruta", ene: 1301706, feb: 5617166, mar: 3414366, isSubtotal: true },
    { concepto: "(-) Gastos de Operaci\u00f3n (personal, gasolina, internet)", ene: 180000, feb: 210000, mar: 195000, isExpense: true },
    { concepto: "(-) Vi\u00e1ticos", ene: 85000, feb: 120000, mar: 95000, isExpense: true },
    { concepto: "= Utilidad Operativa (EBIT)", ene: 1036706, feb: 5287166, mar: 3124366, isSubtotal: true },
    { concepto: "(-) Comisiones de Venta", ene: 81357, feb: 351073, mar: 213398, isExpense: true },
    { concepto: "(-) Gastos Administrativos", ene: 150000, feb: 150000, mar: 150000, isExpense: true },
    { concepto: "= Utilidad Neta", ene: 805349, feb: 4786093, mar: 2760968, isTotal: true },
    { concepto: "% Margen Neto", ene: 49.5, feb: 68.2, mar: 64.7, isPct: true },
  ],
};

// ─── FORECAST SCENARIOS ────────────────────────────
const SCENARIOS = [
  {
    nombre: "Optimista",
    color: "text-green-600",
    bg: "bg-green-50",
    months: [
      { month: "Abr", revenue: 5200000, expenses: 1250000, profit: 3950000 },
      { month: "May", revenue: 5800000, expenses: 1300000, profit: 4500000 },
      { month: "Jun", revenue: 5000000, expenses: 1280000, profit: 3720000 },
    ],
    assumption: "Pipeline actual se cierra al 80%, 3 contratos anuales nuevos",
  },
  {
    nombre: "Base",
    color: "text-blue-600",
    bg: "bg-blue-50",
    months: [
      { month: "Abr", revenue: 3800000, expenses: 1250000, profit: 2550000 },
      { month: "May", revenue: 4200000, expenses: 1300000, profit: 2900000 },
      { month: "Jun", revenue: 3500000, expenses: 1280000, profit: 2220000 },
    ],
    assumption: "Pipeline se cierra al 55%, crecimiento org\u00e1nico normal",
  },
  {
    nombre: "Conservador",
    color: "text-orange-600",
    bg: "bg-orange-50",
    months: [
      { month: "Abr", revenue: 2400000, expenses: 1250000, profit: 1150000 },
      { month: "May", revenue: 2800000, expenses: 1300000, profit: 1500000 },
      { month: "Jun", revenue: 2200000, expenses: 1280000, profit: 920000 },
    ],
    assumption: "Solo deals confirmados + renovaciones seguras",
  },
];

// ─── HELPERS ───────────────────────────────────────
function maxVal(arr: number[]) {
  return Math.max(...arr, 1);
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-20 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono w-24 text-right">{formatCurrency(value)}</span>
    </div>
  );
}

function AgingBar({ corriente, d31_60, d61_90, d90plus, total }: { corriente: number; d31_60: number; d61_90: number; d90plus: number; total: number }) {
  if (total === 0) return <div className="h-3 bg-gray-100 rounded-full" />;
  return (
    <div className="flex h-3 rounded-full overflow-hidden w-full">
      {corriente > 0 && <div className="bg-green-400" style={{ width: `${(corriente / total) * 100}%` }} />}
      {d31_60 > 0 && <div className="bg-yellow-400" style={{ width: `${(d31_60 / total) * 100}%` }} />}
      {d61_90 > 0 && <div className="bg-orange-400" style={{ width: `${(d61_90 / total) * 100}%` }} />}
      {d90plus > 0 && <div className="bg-red-500" style={{ width: `${(d90plus / total) * 100}%` }} />}
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────
export default function FinancePage() {
  const [activeScenario, setActiveScenario] = useState(1); // Base

  // AR totals
  const arTotals = AR_CLIENTS.reduce(
    (acc, c) => ({
      total: acc.total + c.total,
      corriente: acc.corriente + c.corriente,
      d31_60: acc.d31_60 + c.d31_60,
      d61_90: acc.d61_90 + c.d61_90,
      d90plus: acc.d90plus + c.d90plus,
    }),
    { total: 0, corriente: 0, d31_60: 0, d61_90: 0, d90plus: 0 }
  );

  // Cash flow max for bar chart
  const allCashValues = MONTHLY_CASHFLOW.map((m) => Math.max(m.ingresos, m.egresos));
  const cashMax = maxVal(allCashValues);

  // Burn rate runway
  const burnRate = 1200000;
  const cashPosition = 4200000;
  const runwayMonths = Math.round((cashPosition / burnRate) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard financiero ejecutivo - Q1 2026</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {KPI_CARDS.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(kpi.value)}</p>
              <p className="text-[10px] text-gray-400 mt-1">{kpi.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cash">
        <TabsList>
          <TabsTrigger value="cash">Cash Position</TabsTrigger>
          <TabsTrigger value="ar">Cuentas por Cobrar</TabsTrigger>
          <TabsTrigger value="pl">P&L Mensual</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        {/* TAB 1: Cash Position */}
        <TabsContent value="cash">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            {/* Monthly Cash Flow Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Flujo de Efectivo Mensual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MONTHLY_CASHFLOW.map((m) => {
                  const net = m.ingresos - m.egresos;
                  return (
                    <div key={m.month} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700 w-20">{m.month}</span>
                        <span className={`font-mono ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
                          Net: {formatCurrency(net)}
                        </span>
                      </div>
                      <BarRow label="Ingresos" value={m.ingresos} max={cashMax} color="bg-green-500" />
                      <BarRow label="Egresos" value={m.egresos} max={cashMax} color="bg-red-400" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Forecast + Runway */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Rolling 3-Month Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {FORECAST_3M.map((f) => {
                    const net = f.ingresos - f.egresos;
                    return (
                      <div key={f.month} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="text-sm font-medium">{f.month}</p>
                          <p className="text-[10px] text-gray-400">Confianza: {f.confidence}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-green-600">{formatCurrency(net)}</p>
                          <p className="text-[10px] text-gray-400">net cash flow</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Cash Runway
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-4xl font-bold text-gray-900">{runwayMonths}</p>
                    <p className="text-sm text-gray-500 mt-1">meses de runway</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 mt-2">
                    <p className="text-xs text-orange-700">
                      Con el burn rate actual de {formatCurrency(burnRate)}/mes, tienes {runwayMonths} meses de runway.
                      Sin contar ingresos futuros.
                    </p>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Cash Position</span>
                      <span className="font-mono">{formatCurrency(cashPosition)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Burn Rate</span>
                      <span className="font-mono text-red-600">{formatCurrency(burnRate)}/mes</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">AR Pendiente</span>
                      <span className="font-mono text-blue-600">{formatCurrency(arTotals.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Cuentas por Cobrar */}
        <TabsContent value="ar">
          <div className="space-y-6 mt-4">
            {/* Aging Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribucion de Aging</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {[
                    { label: "Corriente (0-30d)", value: arTotals.corriente, color: "bg-green-400", text: "text-green-700" },
                    { label: "31-60 dias", value: arTotals.d31_60, color: "bg-yellow-400", text: "text-yellow-700" },
                    { label: "61-90 dias", value: arTotals.d61_90, color: "bg-orange-400", text: "text-orange-700" },
                    { label: "90+ dias", value: arTotals.d90plus, color: "bg-red-500", text: "text-red-700" },
                  ].map((b) => (
                    <div key={b.label} className="text-center">
                      <div className={`inline-block w-3 h-3 rounded-full ${b.color} mb-1`} />
                      <p className="text-xs text-gray-500">{b.label}</p>
                      <p className={`text-sm font-bold font-mono ${b.text}`}>{formatCurrency(b.value)}</p>
                      <p className="text-[10px] text-gray-400">
                        {arTotals.total > 0 ? Math.round((b.value / arTotals.total) * 100) : 0}%
                      </p>
                    </div>
                  ))}
                </div>
                <AgingBar
                  corriente={arTotals.corriente}
                  d31_60={arTotals.d31_60}
                  d61_90={arTotals.d61_90}
                  d90plus={arTotals.d90plus}
                  total={arTotals.total}
                />
              </CardContent>
            </Card>

            {/* AR Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aging por Cliente</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Cliente</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Total</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Corriente (0-30d)</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">31-60 dias</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">61-90 dias</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">90+ dias</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Estatus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {AR_CLIENTS.map((c) => (
                        <tr key={c.cliente} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-900">
                            {c.cliente}
                            {c.d90plus > 0 && (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500 inline ml-1.5" />
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">{formatCurrency(c.total)}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-green-600">
                            {c.corriente > 0 ? formatCurrency(c.corriente) : "-"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-yellow-600">
                            {c.d31_60 > 0 ? formatCurrency(c.d31_60) : "-"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-orange-600">
                            {c.d61_90 > 0 ? formatCurrency(c.d61_90) : "-"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-red-600 font-bold">
                            {c.d90plus > 0 ? formatCurrency(c.d90plus) : "-"}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge
                              className={
                                c.estatus === "critico"
                                  ? "bg-red-100 text-red-700"
                                  : c.estatus === "atrasado"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }
                            >
                              {c.estatus === "critico" ? "Critico" : c.estatus === "atrasado" ? "Atrasado" : "Al corriente"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 font-bold">
                        <td className="px-4 py-2.5">TOTAL</td>
                        <td className="px-4 py-2.5 text-right font-mono">{formatCurrency(arTotals.total)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-green-600">{formatCurrency(arTotals.corriente)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-yellow-600">{formatCurrency(arTotals.d31_60)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-orange-600">{formatCurrency(arTotals.d61_90)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-red-600">{formatCurrency(arTotals.d90plus)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: P&L Mensual */}
        <TabsContent value="pl">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Estado de Resultados - Q1 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {PL_DATA.headers.map((h) => (
                        <th
                          key={h}
                          className={`px-4 py-2.5 font-medium text-gray-500 ${h === "Concepto" ? "text-left" : "text-right"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PL_DATA.rows.map((row) => {
                      const total = row.isPct
                        ? Math.round(((row.ene + row.feb + row.mar) / 3) * 10) / 10
                        : row.ene + row.feb + row.mar;
                      const rowClass = row.isTotal
                        ? "bg-blue-50 font-bold border-t-2 border-blue-200"
                        : row.isSubtotal
                        ? "bg-gray-50 font-semibold"
                        : row.isExpense
                        ? "text-red-600"
                        : row.isRevenue
                        ? "text-green-700 font-semibold"
                        : "";
                      return (
                        <tr key={row.concepto} className={`border-b ${rowClass}`}>
                          <td className="px-4 py-2.5 text-gray-900">{row.concepto}</td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            {row.isPct ? `${row.ene}%` : formatCurrency(row.ene)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            {row.isPct ? `${row.feb}%` : formatCurrency(row.feb)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            {row.isPct ? `${row.mar}%` : formatCurrency(row.mar)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold">
                            {row.isPct ? `${total}%` : formatCurrency(total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Forecast */}
        <TabsContent value="forecast">
          <div className="space-y-6 mt-4">
            {/* Scenario Selector */}
            <div className="grid grid-cols-3 gap-4">
              {SCENARIOS.map((s, i) => (
                <button
                  key={s.nombre}
                  onClick={() => setActiveScenario(i)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    activeScenario === i ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className={`text-sm font-bold ${s.color}`}>{s.nombre}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.assumption}</p>
                  <p className="text-lg font-bold font-mono mt-2">
                    {formatCurrency(s.months.reduce((sum, m) => sum + m.profit, 0))}
                  </p>
                  <p className="text-[10px] text-gray-400">utilidad estimada Q2</p>
                </button>
              ))}
            </div>

            {/* Forecast Detail */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Proyeccion Q2 2026 - Escenario {SCENARIOS[activeScenario].nombre}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Mes</th>
                      <th className="px-4 py-2.5 text-right font-medium text-gray-500">Revenue</th>
                      <th className="px-4 py-2.5 text-right font-medium text-gray-500">Gastos</th>
                      <th className="px-4 py-2.5 text-right font-medium text-gray-500">Utilidad</th>
                      <th className="px-4 py-2.5 text-right font-medium text-gray-500">Margen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCENARIOS[activeScenario].months.map((m) => {
                      const margin = Math.round((m.profit / m.revenue) * 100);
                      return (
                        <tr key={m.month} className="border-b">
                          <td className="px-4 py-2.5 font-medium">{m.month} 2026</td>
                          <td className="px-4 py-2.5 text-right font-mono text-green-600">{formatCurrency(m.revenue)}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-red-600">{formatCurrency(m.expenses)}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold">{formatCurrency(m.profit)}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge className={margin >= 60 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                              {margin}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold">
                      <td className="px-4 py-2.5">Total Q2</td>
                      <td className="px-4 py-2.5 text-right font-mono text-green-600">
                        {formatCurrency(SCENARIOS[activeScenario].months.reduce((s, m) => s + m.revenue, 0))}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-red-600">
                        {formatCurrency(SCENARIOS[activeScenario].months.reduce((s, m) => s + m.expenses, 0))}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {formatCurrency(SCENARIOS[activeScenario].months.reduce((s, m) => s + m.profit, 0))}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge className="bg-blue-100 text-blue-700">
                          {Math.round(
                            (SCENARIOS[activeScenario].months.reduce((s, m) => s + m.profit, 0) /
                              SCENARIOS[activeScenario].months.reduce((s, m) => s + m.revenue, 0)) *
                              100
                          )}
                          %
                        </Badge>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            {/* Break-even */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                  Analisis Break-Even
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Costos Fijos Mensuales</p>
                    <p className="text-xl font-bold font-mono">{formatCurrency(850000)}</p>
                    <p className="text-[10px] text-gray-400">nomina + renta + admin</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Margen Contribucion Prom.</p>
                    <p className="text-xl font-bold font-mono text-blue-600">72%</p>
                    <p className="text-[10px] text-gray-400">despues de costos variables</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Revenue Break-Even</p>
                    <p className="text-xl font-bold font-mono text-green-600">{formatCurrency(1180556)}</p>
                    <p className="text-[10px] text-gray-400">minimo mensual para cubrir costos</p>
                  </div>
                </div>
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    Con un revenue promedio Q1 de {formatCurrency(4305516)}/mes, operas a{" "}
                    <strong>3.6x</strong> del break-even. Incluso el escenario conservador ({formatCurrency(2466667)}/mes)
                    cubre costos fijos con holgura.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
