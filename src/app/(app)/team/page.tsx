"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Trophy,
  Users,
  TrendingUp,
  Award,
  Target,
  DollarSign,
  BarChart3,
  Crown,
  Medal,
} from "lucide-react";
import { formatCurrency } from "@/lib/types";
import { MOCK_PROJECTS, MOCK_USERS } from "@/lib/mock-data";

// ─── Compute vendedor stats from real data ─────────
interface VendedorStats {
  id: string;
  name: string;
  initials: string;
  color: string;
  dealsCerrados: number;
  revenue: number;
  ticketPromedio: number;
  productos: string[];
}

const VENDEDOR_COLORS: Record<string, string> = {
  u1: "bg-blue-500",
  u2: "bg-purple-500",
  u3: "bg-pink-500",
  u4: "bg-amber-500",
  u5: "bg-gray-500",
  u14: "bg-emerald-500",
  u15: "bg-red-500",
};

function computeVendedorStats(): VendedorStats[] {
  const grouped: Record<string, typeof MOCK_PROJECTS> = {};
  for (const p of MOCK_PROJECTS) {
    if (!grouped[p.vendedor_id]) grouped[p.vendedor_id] = [];
    grouped[p.vendedor_id].push(p);
  }

  return Object.entries(grouped)
    .map(([vendedorId, projects]) => {
      const user = MOCK_USERS.find((u) => u.id === vendedorId);
      const name = user?.full_name || projects[0].vendedor_name || "Desconocido";
      const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const revenue = projects.reduce((sum, p) => sum + p.financials.venta_presupuesto, 0);
      const productos = [...new Set(projects.map((p) => p.product_type))];

      return {
        id: vendedorId,
        name,
        initials,
        color: VENDEDOR_COLORS[vendedorId] || "bg-gray-500",
        dealsCerrados: projects.length,
        revenue,
        ticketPromedio: projects.length > 0 ? Math.round(revenue / projects.length) : 0,
        productos,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

// ─── Compute PM stats from real data ───────────────
interface PMStats {
  id: string;
  name: string;
  initials: string;
  color: string;
  proyectosAsignados: number;
  revenueAsignado: number;
  ticketPromedio: number;
  productos: string[];
}

const PM_COLORS: Record<string, string> = {
  u6: "bg-rose-500",
  u7: "bg-cyan-500",
  u8: "bg-teal-500",
  u9: "bg-indigo-500",
  u10: "bg-amber-500",
  u12: "bg-purple-500",
  u13: "bg-blue-500",
};

function computePMStats(): PMStats[] {
  const grouped: Record<string, typeof MOCK_PROJECTS> = {};
  for (const p of MOCK_PROJECTS) {
    if (!grouped[p.pm_id]) grouped[p.pm_id] = [];
    grouped[p.pm_id].push(p);
  }

  return Object.entries(grouped)
    .map(([pmId, projects]) => {
      const user = MOCK_USERS.find((u) => u.id === pmId);
      const name = user?.full_name || projects[0].pm_name || "Desconocido";
      const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const revenue = projects.reduce((sum, p) => sum + p.financials.venta_presupuesto, 0);
      const productos = [...new Set(projects.map((p) => p.product_type))];

      return {
        id: pmId,
        name,
        initials,
        color: PM_COLORS[pmId] || "bg-gray-500",
        proyectosAsignados: projects.length,
        revenueAsignado: revenue,
        ticketPromedio: projects.length > 0 ? Math.round(revenue / projects.length) : 0,
        productos,
      };
    })
    .sort((a, b) => b.revenueAsignado - a.revenueAsignado);
}

// ─── Main Component ─────────────────────────────────
export default function TeamPage() {
  const vendedores = computeVendedorStats();
  const pms = computePMStats();

  const totalRevenue = MOCK_PROJECTS.reduce((s, p) => s + p.financials.venta_presupuesto, 0);
  const totalDeals = MOCK_PROJECTS.length;

  const topVendedor = vendedores[0];
  const topPM = pms[0];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Equipo</h1>
          <p className="text-xs text-gray-500">
            Performance de vendedores y PMs - Abril 2026 ({totalDeals} deals | {formatCurrency(totalRevenue)})
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="vendedores">
        <TabsList>
          <TabsTrigger value="vendedores">
            <DollarSign className="w-3.5 h-3.5" /> Vendedores
          </TabsTrigger>
          <TabsTrigger value="pms">
            <Users className="w-3.5 h-3.5" /> PMs
          </TabsTrigger>
          <TabsTrigger value="ranking">
            <Award className="w-3.5 h-3.5" /> Ranking
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Vendedores ──────────────────── */}
        <TabsContent value="vendedores">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-5 h-5 text-blue-500" />
                Vendedores - Abril 2026 (Datos reales HubSpot)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Vendedor</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Deals</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Revenue</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Ticket Prom.</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">% del Total</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Productos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendedores.map((v, i) => {
                      const pctTotal = totalRevenue > 0 ? Math.round((v.revenue / totalRevenue) * 100) : 0;
                      return (
                        <tr key={v.id} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full ${v.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                                {v.initials}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{v.name}</p>
                                <p className="text-[10px] text-gray-400">#{i + 1} en revenue</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-sm">{v.dealsCerrados}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-sm font-medium">{formatCurrency(v.revenue)}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs">{formatCurrency(v.ticketPromedio)}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-blue-500 transition-all"
                                  style={{ width: `${Math.min(pctTotal, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-blue-600">{pctTotal}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {v.productos.slice(0, 3).map((prod) => (
                                <Badge key={prod} variant="outline" className="text-[10px] px-1.5 py-0">
                                  {prod}
                                </Badge>
                              ))}
                              {v.productos.length > 3 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-400">
                                  +{v.productos.length - 3}
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold">
                      <td className="px-3 py-2.5 text-sm">TOTAL</td>
                      <td className="px-3 py-2.5 text-right font-mono text-sm">{totalDeals}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-sm">{formatCurrency(totalRevenue)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs">
                        {formatCurrency(totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0)}
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs font-bold">100%</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 2: PMs ─────────────────────────── */}
        <TabsContent value="pms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                PMs - Abril 2026 (Proyectos asignados)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[750px]">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">PM</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Proyectos</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Revenue Asignado</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Ticket Prom.</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">% del Total</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Productos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pms.map((pm, i) => {
                      const pctTotal = totalRevenue > 0 ? Math.round((pm.revenueAsignado / totalRevenue) * 100) : 0;
                      return (
                        <tr key={pm.id} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full ${pm.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                                {pm.initials}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{pm.name}</p>
                                <p className="text-[10px] text-gray-400">#{i + 1} en revenue asignado</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-sm">{pm.proyectosAsignados}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-sm font-medium">{formatCurrency(pm.revenueAsignado)}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs">{formatCurrency(pm.ticketPromedio)}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-purple-500 transition-all"
                                  style={{ width: `${Math.min(pctTotal, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-purple-600">{pctTotal}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {pm.productos.slice(0, 3).map((prod) => (
                                <Badge key={prod} variant="outline" className="text-[10px] px-1.5 py-0">
                                  {prod}
                                </Badge>
                              ))}
                              {pm.productos.length > 3 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-400">
                                  +{pm.productos.length - 3}
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              Nota: Los datos de margen, costos y comisiones no estan disponibles aun. Los PMs deben capturar presupuestos de costos en cada proyecto para habilitar estas metricas.
            </p>
          </div>
        </TabsContent>

        {/* ─── Tab 3: Ranking / Leaderboard ──────── */}
        <TabsContent value="ranking">
          <div className="space-y-6">
            {/* Podium */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendedor del Mes */}
              {topVendedor && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      Vendedor del Mes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-3">
                      <div className={`w-16 h-16 rounded-full ${topVendedor.color} flex items-center justify-center text-white text-xl font-bold mx-auto ring-4 ring-yellow-300`}>
                        {topVendedor.initials}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{topVendedor.name}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(topVendedor.revenue)} en revenue</p>
                        <p className="text-xs text-gray-400">{topVendedor.dealsCerrados} deals cerrados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* PM del Mes */}
              {topPM && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      PM con Mas Revenue Asignado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-3">
                      <div className={`w-16 h-16 rounded-full ${topPM.color} flex items-center justify-center text-white text-xl font-bold mx-auto ring-4 ring-yellow-300`}>
                        {topPM.initials}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{topPM.name}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(topPM.revenueAsignado)} asignado</p>
                        <p className="text-xs text-gray-400">{topPM.proyectosAsignados} proyectos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Vendedores Podium */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Medal className="w-5 h-5 text-amber-500" />
                  Top Vendedores por Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-center gap-4 pb-4">
                  {/* #2 */}
                  {vendedores[1] && (
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full ${vendedores[1].color} flex items-center justify-center text-white text-sm font-bold mx-auto mb-1`}>
                        {vendedores[1].initials}
                      </div>
                      <div className="bg-gray-200 rounded-t-lg w-20 h-20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-500">#2</span>
                      </div>
                      <p className="text-xs font-medium mt-1">{vendedores[1].name.split(" ")[0]}</p>
                      <p className="text-[10px] text-gray-500">{formatCurrency(vendedores[1].revenue)}</p>
                    </div>
                  )}
                  {/* #1 */}
                  {vendedores[0] && (
                    <div className="text-center">
                      <div className={`w-14 h-14 rounded-full ${vendedores[0].color} flex items-center justify-center text-white text-lg font-bold mx-auto mb-1 ring-2 ring-yellow-400`}>
                        {vendedores[0].initials}
                      </div>
                      <div className="bg-yellow-400 rounded-t-lg w-20 h-28 flex items-center justify-center">
                        <span className="text-3xl font-bold text-yellow-800">#1</span>
                      </div>
                      <p className="text-xs font-bold mt-1">{vendedores[0].name.split(" ")[0]}</p>
                      <p className="text-[10px] text-gray-500">{formatCurrency(vendedores[0].revenue)}</p>
                    </div>
                  )}
                  {/* #3 */}
                  {vendedores[2] && (
                    <div className="text-center">
                      <div className={`w-10 h-10 rounded-full ${vendedores[2].color} flex items-center justify-center text-white text-xs font-bold mx-auto mb-1`}>
                        {vendedores[2].initials}
                      </div>
                      <div className="bg-amber-700/20 rounded-t-lg w-20 h-14 flex items-center justify-center">
                        <span className="text-xl font-bold text-amber-700">#3</span>
                      </div>
                      <p className="text-xs font-medium mt-1">{vendedores[2].name.split(" ")[0]}</p>
                      <p className="text-[10px] text-gray-500">{formatCurrency(vendedores[2].revenue)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Mas Revenue</p>
                      <p className="text-sm font-bold text-gray-900">{topVendedor?.name.split(" ")[0]}</p>
                      <p className="text-xs text-blue-600 font-medium">{formatCurrency(topVendedor?.revenue || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Mas Deals</p>
                      {(() => {
                        const mostDeals = [...vendedores].sort((a, b) => b.dealsCerrados - a.dealsCerrados)[0];
                        return (
                          <>
                            <p className="text-sm font-bold text-gray-900">{mostDeals?.name.split(" ")[0]}</p>
                            <p className="text-xs text-green-600 font-medium">{mostDeals?.dealsCerrados} deals cerrados</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Mayor Ticket Prom.</p>
                      {(() => {
                        const bestTicket = [...vendedores].sort((a, b) => b.ticketPromedio - a.ticketPromedio)[0];
                        return (
                          <>
                            <p className="text-sm font-bold text-gray-900">{bestTicket?.name.split(" ")[0]}</p>
                            <p className="text-xs text-purple-600 font-medium">{formatCurrency(bestTicket?.ticketPromedio || 0)}</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
