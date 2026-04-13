"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  CreditCard,
  Receipt,
  AlertTriangle,
  Clock,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/types";
import { MOCK_PROJECTS } from "@/lib/mock-data";

// ─── Helpers ──────────────────────────────────────────
function AgingBar({ pendiente, pagado, total }: { pendiente: number; pagado: number; total: number }) {
  if (total === 0) return <div className="h-3 bg-gray-100 rounded-full" />;
  return (
    <div className="flex h-3 rounded-full overflow-hidden w-full">
      {pagado > 0 && <div className="bg-green-400" style={{ width: `${(pagado / total) * 100}%` }} />}
      {pendiente > 0 && <div className="bg-amber-400" style={{ width: `${(pendiente / total) * 100}%` }} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────
export default function FinancePage() {
  const stats = useMemo(() => {
    const projects = MOCK_PROJECTS;
    const totalVenta = projects.reduce((s, p) => s + p.financials.venta_presupuesto, 0);
    const totalDeals = projects.length;
    const totalAnticipo = projects.reduce((s, p) => s + p.anticipo_requerido, 0);
    const anticiposPagados = projects.filter((p) => p.anticipo_pagado).length;
    const anticiposPendientes = totalDeals - anticiposPagados;
    const montoAnticipoPagado = projects
      .filter((p) => p.anticipo_pagado)
      .reduce((s, p) => s + p.anticipo_requerido, 0);
    const montoAnticipoPendiente = totalAnticipo - montoAnticipoPagado;

    // Payment status breakdown
    const pagados100 = projects.filter((p) => p.payment_status === "pagado_100");
    const parciales = projects.filter((p) => p.payment_status === "parcial");
    const pendientes = projects.filter((p) => p.payment_status === "pendiente");

    const montoPagado = pagados100.reduce((s, p) => s + p.financials.venta_presupuesto, 0);
    const montoParcial = parciales.reduce((s, p) => s + p.financials.venta_presupuesto, 0);
    const montoPendiente = pendientes.reduce((s, p) => s + p.financials.venta_presupuesto, 0);

    // AR aging approximation based on event dates
    // Deals with past event dates and still pendiente = overdue
    const today = new Date("2026-04-13");
    const arItems = projects.map((p) => {
      const eventDate = new Date(p.event_date + "T00:00:00");
      const limiteDate = new Date(p.fecha_limite_pago + "T00:00:00");
      const diffDays = Math.floor((today.getTime() - limiteDate.getTime()) / (1000 * 60 * 60 * 24));
      const clientName = p.deal_name.split(" - ")[0].split(" | ")[0].trim();

      return {
        id: p.id,
        cliente: clientName,
        monto: p.financials.venta_presupuesto,
        eventDate: p.event_date,
        fechaLimite: p.fecha_limite_pago,
        paymentStatus: p.payment_status,
        anticipo_pagado: p.anticipo_pagado,
        diasVencido: diffDays,
        // Classification
        estatus: p.payment_status === "pagado_100"
          ? "pagado"
          : diffDays > 0
          ? "vencido"
          : "por_cobrar",
      };
    });

    const arPorCobrar = arItems.filter((a) => a.estatus === "por_cobrar");
    const arVencidos = arItems.filter((a) => a.estatus === "vencido");

    // Top deals by value
    const topDeals = [...projects]
      .sort((a, b) => b.financials.venta_presupuesto - a.financials.venta_presupuesto)
      .slice(0, 10);

    // Revenue by vendedor
    const byVendedor: Record<string, { name: string; revenue: number; deals: number }> = {};
    for (const p of projects) {
      if (!byVendedor[p.vendedor_id]) {
        byVendedor[p.vendedor_id] = { name: p.vendedor_name || "Desconocido", revenue: 0, deals: 0 };
      }
      byVendedor[p.vendedor_id].revenue += p.financials.venta_presupuesto;
      byVendedor[p.vendedor_id].deals += 1;
    }
    const vendedorRanking = Object.values(byVendedor).sort((a, b) => b.revenue - a.revenue);

    return {
      totalVenta,
      totalDeals,
      totalAnticipo,
      anticiposPagados,
      anticiposPendientes,
      montoAnticipoPagado,
      montoAnticipoPendiente,
      pagados100: pagados100.length,
      parciales: parciales.length,
      pendientesCount: pendientes.length,
      montoPagado,
      montoParcial,
      montoPendiente,
      arItems,
      arPorCobrar,
      arVencidos,
      topDeals,
      vendedorRanking,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Dashboard financiero - Abril 2026 (datos reales de {stats.totalDeals} deals HubSpot)
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-50">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Venta Total Abril</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalVenta)}</p>
            <p className="text-[10px] text-gray-400 mt-1">{stats.totalDeals} deals cerrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-50">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Anticipos Requeridos</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalAnticipo)}</p>
            <p className="text-[10px] text-gray-400 mt-1">50% de venta total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-50">
                <Receipt className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Pendiente de Cobro</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.montoPendiente)}</p>
            <p className="text-[10px] text-gray-400 mt-1">{stats.pendientesCount} proyectos pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Anticipos Sin Pagar</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.montoAnticipoPendiente)}</p>
            <p className="text-[10px] text-gray-400 mt-1">{stats.anticiposPendientes} de {stats.totalDeals} proyectos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-purple-50">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Ticket Promedio</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(stats.totalDeals > 0 ? Math.round(stats.totalVenta / stats.totalDeals) : 0)}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">por deal cerrado</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cobranza">
        <TabsList>
          <TabsTrigger value="cobranza">Cobranza</TabsTrigger>
          <TabsTrigger value="deals">Top Deals</TabsTrigger>
          <TabsTrigger value="vendedores">Revenue por Vendedor</TabsTrigger>
        </TabsList>

        {/* TAB 1: Cobranza / AR */}
        <TabsContent value="cobranza">
          <div className="space-y-6 mt-4">
            {/* Payment Status Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="inline-block w-3 h-3 rounded-full bg-green-400 mb-2" />
                  <p className="text-xs text-gray-500">Pagado 100%</p>
                  <p className="text-lg font-bold font-mono text-green-700">{formatCurrency(stats.montoPagado)}</p>
                  <p className="text-[10px] text-gray-400">{stats.pagados100} proyectos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="inline-block w-3 h-3 rounded-full bg-yellow-400 mb-2" />
                  <p className="text-xs text-gray-500">Parcial</p>
                  <p className="text-lg font-bold font-mono text-yellow-700">{formatCurrency(stats.montoParcial)}</p>
                  <p className="text-[10px] text-gray-400">{stats.parciales} proyectos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="inline-block w-3 h-3 rounded-full bg-amber-400 mb-2" />
                  <p className="text-xs text-gray-500">Pendiente</p>
                  <p className="text-lg font-bold font-mono text-amber-700">{formatCurrency(stats.montoPendiente)}</p>
                  <p className="text-[10px] text-gray-400">{stats.pendientesCount} proyectos</p>
                </CardContent>
              </Card>
            </div>

            {/* Aging Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribucion de Cobranza</CardTitle>
              </CardHeader>
              <CardContent>
                <AgingBar
                  pendiente={stats.montoPendiente + stats.montoParcial}
                  pagado={stats.montoPagado}
                  total={stats.totalVenta}
                />
                <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                  <span>Pagado: {stats.totalVenta > 0 ? Math.round((stats.montoPagado / stats.totalVenta) * 100) : 0}%</span>
                  <span>Pendiente: {stats.totalVenta > 0 ? Math.round(((stats.montoPendiente + stats.montoParcial) / stats.totalVenta) * 100) : 0}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Projects with upcoming payment deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Fechas Limite de Pago - Proyectos Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Proyecto</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Monto</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Anticipo (50%)</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Fecha Limite</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Evento</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Estatus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...MOCK_PROJECTS]
                        .filter((p) => p.payment_status === "pendiente")
                        .sort((a, b) => a.fecha_limite_pago.localeCompare(b.fecha_limite_pago))
                        .slice(0, 15)
                        .map((p) => {
                          const today = new Date("2026-04-13");
                          const limite = new Date(p.fecha_limite_pago + "T00:00:00");
                          const diasRestantes = Math.floor((limite.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          const vencido = diasRestantes < 0;

                          return (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2.5">
                                <p className="font-medium text-gray-900 text-xs truncate max-w-[280px]">{p.deal_name}</p>
                                <p className="text-[10px] text-gray-400">{p.vendedor_name}</p>
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono text-sm">{formatCurrency(p.financials.venta_presupuesto)}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-xs text-blue-600">{formatCurrency(p.anticipo_requerido)}</td>
                              <td className="px-4 py-2.5 text-center text-xs">
                                <span className={vencido ? "text-red-600 font-bold" : "text-gray-700"}>
                                  {p.fecha_limite_pago}
                                </span>
                                {vencido && (
                                  <p className="text-[10px] text-red-500">{Math.abs(diasRestantes)}d vencido</p>
                                )}
                                {!vencido && diasRestantes <= 3 && (
                                  <p className="text-[10px] text-amber-500">{diasRestantes}d restantes</p>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-center text-xs text-gray-500">{p.event_date}</td>
                              <td className="px-4 py-2.5 text-center">
                                <Badge
                                  className={
                                    vencido
                                      ? "bg-red-100 text-red-700"
                                      : diasRestantes <= 3
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-gray-100 text-gray-700"
                                  }
                                >
                                  {vencido ? "Vencido" : diasRestantes <= 3 ? "Urgente" : "Pendiente"}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: Top Deals */}
        <TabsContent value="deals">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Top 10 Deals por Monto - Abril 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-2 text-left font-medium text-gray-500">#</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Deal</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Vendedor</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">PM</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Producto</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500">Monto</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-500">Evento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topDeals.map((p, i) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-gray-900 text-xs truncate max-w-[250px]">{p.deal_name}</p>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{p.vendedor_name}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{p.pm_name}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className="text-[10px]">{p.product_type}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-sm font-medium">{formatCurrency(p.financials.venta_presupuesto)}</td>
                        <td className="px-4 py-2.5 text-center text-xs text-gray-500">{p.event_date}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={5} className="px-4 py-2.5 text-sm">Total (top 10)</td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">
                        {formatCurrency(stats.topDeals.reduce((s, p) => s + p.financials.venta_presupuesto, 0))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Revenue por Vendedor */}
        <TabsContent value="vendedores">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-500" />
                Revenue por Vendedor - Abril 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.vendedorRanking.map((v) => {
                const pct = stats.totalVenta > 0 ? Math.round((v.revenue / stats.totalVenta) * 100) : 0;
                return (
                  <div key={v.name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-700 w-36 shrink-0 truncate font-medium">{v.name}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono w-28 text-right">{formatCurrency(v.revenue)}</span>
                    <span className="text-[10px] text-gray-400 w-16 text-right">{v.deals} deals</span>
                    <span className="text-[10px] font-bold text-blue-600 w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
              <div className="border-t pt-3 flex items-center gap-3">
                <span className="text-xs text-gray-900 w-36 font-bold">TOTAL</span>
                <div className="flex-1" />
                <span className="text-xs font-mono font-bold w-28 text-right">{formatCurrency(stats.totalVenta)}</span>
                <span className="text-[10px] text-gray-400 w-16 text-right">{stats.totalDeals} deals</span>
                <span className="text-[10px] font-bold text-blue-600 w-10 text-right">100%</span>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              Nota: No se muestran datos de P&L ni utilidad porque los proyectos aun no tienen costos capturados.
              Una vez que los PMs llenen presupuestos y gastos reales, se habilitara el estado de resultados.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
