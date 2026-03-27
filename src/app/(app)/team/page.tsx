"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Trophy,
  Users,
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  Target,
  DollarSign,
  Clock,
  BarChart3,
  Crown,
  Medal,
} from "lucide-react";
import { formatCurrency } from "@/lib/types";

// ─── Mock Data: Vendedores ──────────────────────────────────
interface VendedorScore {
  name: string;
  initials: string;
  color: string;
  dealsCerrados: number;
  revenue: number;
  metaMensual: number;
  ticketPromedio: number;
  tiempoCierre: number; // days
  clientesNuevos: number;
  clientesExistentes: number;
  trendUp: boolean;
}

const VENDEDORES_DATA: VendedorScore[] = [
  {
    name: "Pricila Dominguez",
    initials: "PD",
    color: "bg-purple-500",
    dealsCerrados: 12,
    revenue: 482420,
    metaMensual: 1200000,
    ticketPromedio: 40202,
    tiempoCierre: 8,
    clientesNuevos: 9,
    clientesExistentes: 3,
    trendUp: true,
  },
  {
    name: "Gabriela Gutierrez",
    initials: "GG",
    color: "bg-pink-500",
    dealsCerrados: 8,
    revenue: 524124,
    metaMensual: 1000000,
    ticketPromedio: 65516,
    tiempoCierre: 12,
    clientesNuevos: 6,
    clientesExistentes: 2,
    trendUp: true,
  },
  {
    name: "Maria Gaytan",
    initials: "MG",
    color: "bg-amber-500",
    dealsCerrados: 14,
    revenue: 876210,
    metaMensual: 1000000,
    ticketPromedio: 62586,
    tiempoCierre: 6,
    clientesNuevos: 10,
    clientesExistentes: 4,
    trendUp: true,
  },
  {
    name: "Roxana Mendoza",
    initials: "RM",
    color: "bg-red-500",
    dealsCerrados: 7,
    revenue: 538424,
    metaMensual: 800000,
    ticketPromedio: 76918,
    tiempoCierre: 14,
    clientesNuevos: 5,
    clientesExistentes: 2,
    trendUp: false,
  },
  {
    name: "Daniel Cebada",
    initials: "DC",
    color: "bg-blue-500",
    dealsCerrados: 9,
    revenue: 754060,
    metaMensual: 1500000,
    ticketPromedio: 83784,
    tiempoCierre: 10,
    clientesNuevos: 4,
    clientesExistentes: 5,
    trendUp: true,
  },
  {
    name: "Erick Jimenez",
    initials: "EJ",
    color: "bg-green-500",
    dealsCerrados: 4,
    revenue: 192760,
    metaMensual: 500000,
    ticketPromedio: 48190,
    tiempoCierre: 18,
    clientesNuevos: 3,
    clientesExistentes: 1,
    trendUp: false,
  },
];

// ─── Mock Data: PMs ─────────────────────────────────────────
interface PMScore {
  name: string;
  initials: string;
  color: string;
  proyectosOperados: number;
  revenueOperado: number;
  margenPromedio: number;
  gastosVsPresupuesto: number; // % variance: negative = under budget (good)
  proyectosEnTiempo: number;
  proyectosRetrasados: number;
  ratingCalidad: number; // 1-5
  comisionesGanadas: number;
}

const PMS_DATA: PMScore[] = [
  {
    name: "Joyce",
    initials: "JO",
    color: "bg-rose-500",
    proyectosOperados: 8,
    revenueOperado: 620000,
    margenPromedio: 42,
    gastosVsPresupuesto: -5,
    proyectosEnTiempo: 7,
    proyectosRetrasados: 1,
    ratingCalidad: 4.5,
    comisionesGanadas: 31000,
  },
  {
    name: "Oscar",
    initials: "OS",
    color: "bg-cyan-500",
    proyectosOperados: 6,
    revenueOperado: 480000,
    margenPromedio: 38,
    gastosVsPresupuesto: 2,
    proyectosEnTiempo: 5,
    proyectosRetrasados: 1,
    ratingCalidad: 4.2,
    comisionesGanadas: 24000,
  },
  {
    name: "Alvaro",
    initials: "AL",
    color: "bg-teal-500",
    proyectosOperados: 5,
    revenueOperado: 340000,
    margenPromedio: 35,
    gastosVsPresupuesto: -8,
    proyectosEnTiempo: 5,
    proyectosRetrasados: 0,
    ratingCalidad: 4.8,
    comisionesGanadas: 17000,
  },
  {
    name: "Joel",
    initials: "JL",
    color: "bg-indigo-500",
    proyectosOperados: 7,
    revenueOperado: 510000,
    margenPromedio: 40,
    gastosVsPresupuesto: -3,
    proyectosEnTiempo: 6,
    proyectosRetrasados: 1,
    ratingCalidad: 4.0,
    comisionesGanadas: 25500,
  },
  {
    name: "Eduardo",
    initials: "ED",
    color: "bg-amber-500",
    proyectosOperados: 4,
    revenueOperado: 290000,
    margenPromedio: 32,
    gastosVsPresupuesto: 5,
    proyectosEnTiempo: 3,
    proyectosRetrasados: 1,
    ratingCalidad: 3.8,
    comisionesGanadas: 14500,
  },
  {
    name: "Diana",
    initials: "DI",
    color: "bg-purple-500",
    proyectosOperados: 10,
    revenueOperado: 820000,
    margenPromedio: 44,
    gastosVsPresupuesto: -6,
    proyectosEnTiempo: 9,
    proyectosRetrasados: 1,
    ratingCalidad: 4.6,
    comisionesGanadas: 41000,
  },
  {
    name: "Ivan",
    initials: "IV",
    color: "bg-blue-500",
    proyectosOperados: 12,
    revenueOperado: 950000,
    margenPromedio: 46,
    gastosVsPresupuesto: -4,
    proyectosEnTiempo: 11,
    proyectosRetrasados: 1,
    ratingCalidad: 4.7,
    comisionesGanadas: 47500,
  },
];

// ─── Helpers ────────────────────────────────────────────────
function getSemaforoBadge(pct: number) {
  if (pct >= 90) return <Badge className="bg-green-100 text-green-700">Verde</Badge>;
  if (pct >= 60) return <Badge className="bg-yellow-100 text-yellow-700">Amarillo</Badge>;
  return <Badge className="bg-red-100 text-red-700">Rojo</Badge>;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${
            s <= Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : s - 0.5 <= rating
              ? "text-yellow-400 fill-yellow-200"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-[10px] text-gray-500 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function TeamPage() {
  const sortedVendedores = [...VENDEDORES_DATA].sort((a, b) => b.revenue - a.revenue);
  const sortedPMs = [...PMS_DATA].sort((a, b) => b.revenueOperado - a.revenueOperado);

  // Rankings
  const topVendedor = sortedVendedores[0];
  const topPM = sortedPMs[0];
  const bestMarginPM = [...PMS_DATA].sort((a, b) => b.margenPromedio - a.margenPromedio)[0];
  const fastestClose = [...VENDEDORES_DATA].sort((a, b) => a.tiempoCierre - b.tiempoCierre)[0];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Equipo</h1>
          <p className="text-xs text-gray-500">Scorecards de vendedores y PMs - Marzo 2026</p>
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

        {/* ─── Tab 1: Vendedores Scorecard ──────────── */}
        <TabsContent value="vendedores">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-5 h-5 text-blue-500" />
                Scorecard Vendedores - Marzo 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1100px]">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Vendedor</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Deals</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Revenue</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Meta</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">% Cumplimiento</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Ticket Prom.</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">T. Cierre</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Nuevos/Exist.</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Semaforo</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedVendedores.map((v, i) => {
                      const pctCumplimiento = Math.round((v.revenue / v.metaMensual) * 100);
                      return (
                        <tr key={v.name} className="border-b last:border-b-0 hover:bg-gray-50">
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
                          <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-500">{formatCurrency(v.metaMensual)}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    pctCumplimiento >= 90 ? "bg-green-500" : pctCumplimiento >= 60 ? "bg-yellow-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${Math.min(pctCumplimiento, 100)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${
                                pctCumplimiento >= 90 ? "text-green-600" : pctCumplimiento >= 60 ? "text-yellow-600" : "text-red-600"
                              }`}>
                                {pctCumplimiento}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs">{formatCurrency(v.ticketPromedio)}</td>
                          <td className="px-3 py-2.5 text-right text-xs">
                            <span className="font-mono">{v.tiempoCierre}</span>
                            <span className="text-gray-400 ml-0.5">dias</span>
                          </td>
                          <td className="px-3 py-2.5 text-center text-xs">
                            <span className="text-blue-600 font-medium">{v.clientesNuevos}</span>
                            <span className="text-gray-400 mx-0.5">/</span>
                            <span className="text-gray-600">{v.clientesExistentes}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">{getSemaforoBadge(pctCumplimiento)}</td>
                          <td className="px-3 py-2.5 text-center">
                            {v.trendUp ? (
                              <TrendingUp className="w-4 h-4 text-green-500 inline" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500 inline" />
                            )}
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

        {/* ─── Tab 2: PMs Scorecard ─────────────────── */}
        <TabsContent value="pms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Scorecard PMs - Marzo 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">PM</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Proyectos</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Revenue Op.</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Margen %</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Gastos vs Ppto</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Tiempo / Retrasados</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Calidad</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Comisiones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPMs.map((pm, i) => (
                      <tr key={pm.name} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full ${pm.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                              {pm.initials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{pm.name}</p>
                              <p className="text-[10px] text-gray-400">#{i + 1} en revenue operado</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-sm">{pm.proyectosOperados}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-sm font-medium">{formatCurrency(pm.revenueOperado)}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={`font-mono text-sm font-bold ${
                            pm.margenPromedio >= 40 ? "text-blue-600" : pm.margenPromedio >= 30 ? "text-green-600" : "text-yellow-600"
                          }`}>
                            {pm.margenPromedio}%
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={`font-mono text-xs font-medium ${
                            pm.gastosVsPresupuesto <= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {pm.gastosVsPresupuesto > 0 ? "+" : ""}{pm.gastosVsPresupuesto}%
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center text-xs">
                          <span className="text-green-600 font-medium">{pm.proyectosEnTiempo}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-red-600 font-medium">{pm.proyectosRetrasados}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <StarRating rating={pm.ratingCalidad} />
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-sm text-green-700 font-medium">
                          {formatCurrency(pm.comisionesGanadas)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 3: Ranking / Leaderboard ──────────── */}
        <TabsContent value="ranking">
          <div className="space-y-6">
            {/* Podium */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendedor del Mes */}
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

              {/* PM del Mes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    PM del Mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-3">
                    <div className={`w-16 h-16 rounded-full ${topPM.color} flex items-center justify-center text-white text-xl font-bold mx-auto ring-4 ring-yellow-300`}>
                      {topPM.initials}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{topPM.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(topPM.revenueOperado)} operado</p>
                      <p className="text-xs text-gray-400">{topPM.proyectosOperados} proyectos | {topPM.margenPromedio}% margen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  {sortedVendedores[1] && (
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full ${sortedVendedores[1].color} flex items-center justify-center text-white text-sm font-bold mx-auto mb-1`}>
                        {sortedVendedores[1].initials}
                      </div>
                      <div className="bg-gray-200 rounded-t-lg w-20 h-20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-500">#2</span>
                      </div>
                      <p className="text-xs font-medium mt-1">{sortedVendedores[1].name.split(" ")[0]}</p>
                      <p className="text-[10px] text-gray-500">{formatCurrency(sortedVendedores[1].revenue)}</p>
                    </div>
                  )}
                  {/* #1 */}
                  <div className="text-center">
                    <div className={`w-14 h-14 rounded-full ${sortedVendedores[0].color} flex items-center justify-center text-white text-lg font-bold mx-auto mb-1 ring-2 ring-yellow-400`}>
                      {sortedVendedores[0].initials}
                    </div>
                    <div className="bg-yellow-400 rounded-t-lg w-20 h-28 flex items-center justify-center">
                      <span className="text-3xl font-bold text-yellow-800">#1</span>
                    </div>
                    <p className="text-xs font-bold mt-1">{sortedVendedores[0].name.split(" ")[0]}</p>
                    <p className="text-[10px] text-gray-500">{formatCurrency(sortedVendedores[0].revenue)}</p>
                  </div>
                  {/* #3 */}
                  {sortedVendedores[2] && (
                    <div className="text-center">
                      <div className={`w-10 h-10 rounded-full ${sortedVendedores[2].color} flex items-center justify-center text-white text-xs font-bold mx-auto mb-1`}>
                        {sortedVendedores[2].initials}
                      </div>
                      <div className="bg-amber-700/20 rounded-t-lg w-20 h-14 flex items-center justify-center">
                        <span className="text-xl font-bold text-amber-700">#3</span>
                      </div>
                      <p className="text-xs font-medium mt-1">{sortedVendedores[2].name.split(" ")[0]}</p>
                      <p className="text-[10px] text-gray-500">{formatCurrency(sortedVendedores[2].revenue)}</p>
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
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Mejor Margen (PM)</p>
                      <p className="text-sm font-bold text-gray-900">{bestMarginPM.name}</p>
                      <p className="text-xs text-green-600 font-medium">{bestMarginPM.margenPromedio}% promedio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Mas Revenue (Vendedor)</p>
                      <p className="text-sm font-bold text-gray-900">{topVendedor.name.split(" ")[0]}</p>
                      <p className="text-xs text-blue-600 font-medium">{formatCurrency(topVendedor.revenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cierre Mas Rapido</p>
                      <p className="text-sm font-bold text-gray-900">{fastestClose.name.split(" ")[0]}</p>
                      <p className="text-xs text-purple-600 font-medium">{fastestClose.tiempoCierre} dias promedio</p>
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
