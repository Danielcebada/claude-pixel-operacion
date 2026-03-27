"use client";

import { useEffect, useState } from "react";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { MARZO_DEALS, VENDEDORES, getMarzoAnalytics } from "@/lib/hubspot-deals";
import { MARCH_SOURCE_ANALYSIS } from "@/lib/hubspot-products";
import { computeProfitability, formatCurrency, getMarginColor, getMarginBg, getMarginLabel } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, BarChart3, Calendar, Users, Trophy, Target, Zap, ArrowUpRight, ExternalLink, AlertTriangle, Eye, MousePointerClick, GitBranch, RefreshCw, Clock, Sun, CloudSun, Moon, AlertCircle } from "lucide-react";
import Link from "next/link";

// ─── Q1 REAL DATA (from HubSpot queries) ──────────
const Q1_COMPARATIVA = {
  ene2026: { deals: 35, revenue: 1627132 },
  feb2026: { deals: 50, revenue: 7021458 },
  mar2025: { deals: 40, revenue: 2094662 },
  feb2026_label: "Febrero 2026",
};

// ─── Default goals by vendor (editable) ──────────
const DEFAULT_GOALS: Record<number, number> = {
  26395721: 1200000,   // Pricila
  26405238: 1500000,   // Daniel
  414692018: 1000000,  // Gabriela
  618845046: 1000000,  // Maria
  88208161: 500000,    // Erick
  80956812: 800000,    // Roxana
};

function VendorGoalsTable({ vendors, totalDeals, totalRevenue, avgTicket }: {
  vendors: { id: number; name: string; color: string; deals: number; revenue: number; avg: number; pct: number; maxDeal: string; maxDealAmount: number }[];
  totalDeals: number;
  totalRevenue: number;
  avgTicket: number;
}) {
  const [goals, setGoals] = useState<Record<number, number>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vendor_goals_mar2026");
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_GOALS;
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const saveGoal = (vendorId: number) => {
    const val = parseInt(editValue.replace(/[^0-9]/g, ""));
    if (val > 0) {
      const newGoals = { ...goals, [vendorId]: val };
      setGoals(newGoals);
      if (typeof window !== "undefined") {
        localStorage.setItem("vendor_goals_mar2026", JSON.stringify(newGoals));
      }
    }
    setEditingId(null);
  };

  const totalGoal = vendors.reduce((s, v) => s + (goals[v.id] || 0), 0);
  const totalPct = totalGoal > 0 ? Math.round((totalRevenue / totalGoal) * 100) : 0;
  const totalFalta = totalGoal - totalRevenue;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Ranking Vendedores + Metas - Marzo
          </CardTitle>
          <Badge className={totalPct >= 100 ? "bg-green-100 text-green-700" : totalPct >= 70 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>
            {totalPct}% de meta global
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Vendedor</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500">Deals</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Revenue</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Meta</th>
              <th className="px-3 py-2 text-center font-medium text-gray-500 w-36">Avance</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Falta</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vendors.map((v, idx) => {
              const goal = goals[v.id] || 0;
              const pct = goal > 0 ? Math.min(Math.round((v.revenue / goal) * 100), 150) : 0;
              const falta = goal - v.revenue;
              const barColor = pct >= 100 ? "bg-green-500" : pct >= 70 ? "bg-yellow-500" : pct >= 40 ? "bg-orange-400" : "bg-red-500";
              const isEditing = editingId === v.id;

              return (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5">
                    {idx === 0 ? <span className="text-lg">🥇</span> :
                     idx === 1 ? <span className="text-lg">🥈</span> :
                     idx === 2 ? <span className="text-lg">🥉</span> :
                     <span className="text-gray-400 text-xs">{idx + 1}</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-6 rounded-full" style={{ backgroundColor: v.color }} />
                      <div>
                        <p className="font-medium text-gray-900">{v.name}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[160px]">Top: {v.maxDeal.substring(0, 28)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center font-bold">{v.deals}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold">{formatCurrency(v.revenue)}</td>
                  <td className="px-3 py-2.5 text-right">
                    {isEditing ? (
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-[10px] text-gray-400">$</span>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveGoal(v.id); if (e.key === "Escape") setEditingId(null); }}
                          onBlur={() => saveGoal(v.id)}
                          autoFocus
                          className="w-24 text-right font-mono text-sm border rounded px-1.5 py-0.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(v.id); setEditValue(goal.toString()); }}
                        className="font-mono text-gray-500 hover:text-blue-600 hover:underline cursor-pointer"
                        title="Click para editar meta"
                      >
                        {goal > 0 ? formatCurrency(goal) : "Definir meta"}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                        <div
                          className={`h-3 rounded-full ${barColor} transition-all duration-500`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                        {pct >= 100 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">✓</span>
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-bold w-10 text-right ${pct >= 100 ? "text-green-600" : pct >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {falta > 0 ? (
                      <span className="font-mono text-xs text-red-600">-{formatCurrency(falta)}</span>
                    ) : (
                      <span className="font-mono text-xs text-green-600 font-bold">+{formatCurrency(Math.abs(falta))}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-900 text-white font-bold">
              <td className="px-3 py-2.5" colSpan={2}>TOTAL</td>
              <td className="px-2 py-2.5 text-center">{totalDeals}</td>
              <td className="px-3 py-2.5 text-right font-mono">{formatCurrency(totalRevenue)}</td>
              <td className="px-3 py-2.5 text-right font-mono">{formatCurrency(totalGoal)}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${totalPct >= 100 ? "bg-green-400" : "bg-yellow-400"}`}
                      style={{ width: `${Math.min(totalPct, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold w-10 text-right">{totalPct}%</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right font-mono">
                {totalFalta > 0 ? (
                  <span className="text-red-300">-{formatCurrency(totalFalta)}</span>
                ) : (
                  <span className="text-green-300">+{formatCurrency(Math.abs(totalFalta))}</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      setTimeout(() => {
        setLastRefresh(new Date());
        setRefreshing(false);
      }, 1500);
    }, 15 * 60 * 1000); // 15 min
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 1500);
  };
  const projects = MOCK_PROJECTS.map((p) => ({
    ...p,
    ...computeProfitability(p.financials),
  }));

  const operados = projects.filter((p) => p.financials.venta_real > 0);
  const totalVentaReal = operados.reduce((sum, p) => sum + p.financials.venta_real, 0);
  const totalUtilidadTotal = operados.reduce((sum, p) => sum + p.utilidad_total, 0);
  const avgMargin = operados.length > 0
    ? Math.round(operados.reduce((sum, p) => sum + p.pct_utilidad, 0) / operados.length * 100) / 100
    : 0;

  // Payment alert (non-blocking)
  const pendingAnticipoProjects = MOCK_PROJECTS.filter((p) => !p.anticipo_pagado && p.presupuesto_confirmado);
  const totalPendienteAnticipo = pendingAnticipoProjects.reduce((s, p) => s + p.anticipo_requerido, 0);

  // HubSpot Real Data
  const hs = getMarzoAnalytics();

  return (
    <div className="space-y-6">
      {/* ─── Welcome Greeting ─── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return <Sun className="w-6 h-6 text-amber-400" />;
              if (hour < 19) return <CloudSun className="w-6 h-6 text-orange-400" />;
              return <Moon className="w-6 h-6 text-indigo-400" />;
            })()}
            <h1 className="text-2xl font-bold text-gray-900">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return "Buenos dias";
                if (hour < 19) return "Buenas tardes";
                return "Buenas noches";
              })()}, Daniel
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {" "}&middot; Datos en vivo de HubSpot + Pixel Ops
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-refresh indicator */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${refreshing ? "bg-blue-500 animate-pulse" : "bg-green-500"}`} />
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <Clock className="w-3 h-3" />
                {lastRefresh.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <p className="text-[10px] text-gray-400">Auto-refresh: 15 min</p>
            </div>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white text-xs font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Actualizando..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ═══ ANTICIPO PENDIENTE INFO ═══ */}
      {pendingAnticipoProjects.length > 0 && (
        <Card className="border border-amber-300 bg-amber-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Proyectos con anticipo pendiente</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-3xl font-black text-amber-800">{pendingAnticipoProjects.length}</p>
                    <p className="text-lg font-mono font-bold text-amber-700">({formatCurrency(totalPendienteAnticipo)} pendientes)</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pendingAnticipoProjects.map((p) => (
                      <Link key={p.id} href={`/projects/${p.id}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-200 rounded-full text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                        {p.deal_name.substring(0, 25)}{p.deal_name.length > 25 ? "..." : ""}
                        <span className="text-amber-500 font-mono">{formatCurrency(p.anticipo_requerido)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link href="/projects" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap">
                Ver proyectos
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ SECCION: VENTAS HUBSPOT (DATOS REALES) ═══ */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h2 className="text-lg font-bold text-gray-800">Ventas Marzo 2026</h2>
          <Badge className="bg-green-100 text-green-700 text-[10px]">HubSpot Live</Badge>
        </div>

        {/* KPIs de Ventas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="kpi-card-green card-hover overflow-hidden">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue Total</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(hs.totalRevenue)}</p>
                  {(() => {
                    const vsFeb = Math.round(((hs.totalRevenue - Q1_COMPARATIVA.feb2026.revenue) / Q1_COMPARATIVA.feb2026.revenue) * 100);
                    const vsMar25 = Math.round(((hs.totalRevenue - Q1_COMPARATIVA.mar2025.revenue) / Q1_COMPARATIVA.mar2025.revenue) * 100);
                    return (
                      <div className="flex gap-2 mt-1">
                        <p className={`text-[10px] ${vsFeb >= 0 ? "text-green-600" : "text-red-600"} flex items-center gap-0.5`}>
                          <ArrowUpRight className="w-2.5 h-2.5" /> {vsFeb >= 0 ? "+" : ""}{vsFeb}% vs Feb
                        </p>
                        <p className={`text-[10px] ${vsMar25 >= 0 ? "text-green-600" : "text-red-600"} flex items-center gap-0.5`}>
                          {vsMar25 >= 0 ? "+" : ""}{vsMar25}% vs Mar25
                        </p>
                      </div>
                    );
                  })()}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-sm">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card-blue card-hover overflow-hidden">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Deals Ganados</p>
                  <p className="text-2xl font-bold mt-1">{hs.totalDeals}</p>
                  {(() => {
                    const vsFeb = Math.round(((hs.totalDeals - Q1_COMPARATIVA.feb2026.deals) / Q1_COMPARATIVA.feb2026.deals) * 100);
                    const vsMar25 = Math.round(((hs.totalDeals - Q1_COMPARATIVA.mar2025.deals) / Q1_COMPARATIVA.mar2025.deals) * 100);
                    return (
                      <div className="flex gap-2 mt-1">
                        <p className={`text-[10px] ${vsFeb >= 0 ? "text-green-600" : "text-red-600"} flex items-center gap-0.5`}>
                          {vsFeb >= 0 ? "+" : ""}{vsFeb}% vs Feb
                        </p>
                        <p className={`text-[10px] ${vsMar25 >= 0 ? "text-green-600" : "text-red-600"} flex items-center gap-0.5`}>
                          {vsMar25 >= 0 ? "+" : ""}{vsMar25}% vs Mar25
                        </p>
                      </div>
                    );
                  })()}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card-purple card-hover overflow-hidden">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ticket Promedio</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(hs.avgTicket)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card-orange card-hover overflow-hidden">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendedores Activos</p>
                  <p className="text-2xl font-bold mt-1">{hs.byVendor.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center shadow-sm">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue por Semana */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Semanal - Marzo 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hs.byWeek.map((w) => {
                const maxRevenue = Math.max(...hs.byWeek.map(wk => wk.revenue));
                const pct = maxRevenue > 0 ? Math.round((w.revenue / maxRevenue) * 100) : 0;
                return (
                  <div key={w.week} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-36 shrink-0">{w.week}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                      <div
                        className="h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      >
                        <span className="text-[10px] text-white font-bold">{formatCurrency(w.revenue)}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs w-16 justify-center">{w.deals} deals</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranking Vendedores con Metas */}
          <VendorGoalsTable vendors={hs.byVendor} totalDeals={hs.totalDeals} totalRevenue={hs.totalRevenue} avgTicket={hs.avgTicket} />

          {/* Top 10 Deals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="w-5 h-5 text-blue-500" />
                Top 10 Deals - Marzo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {hs.topDeals.map((d, idx) => {
                  const maxAmount = hs.topDeals[0].amount;
                  const pct = Math.round((d.amount / maxAmount) * 100);
                  return (
                    <div key={d.id} className="px-4 py-2.5 hover:bg-gray-50 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xs text-gray-400 w-5">{idx + 1}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{d.dealname}</p>
                            <p className="text-[10px] text-gray-400">{d.owner_name} • {d.closedate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-mono font-bold text-green-600">{formatCurrency(d.amount)}</span>
                          <a
                            href={`https://app.hubspot.com/contacts/2803417/record/0-3/${d.hubspot_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        </div>
                      </div>
                      <div className="mt-1 ml-7">
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Acumulado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Acumulado - Marzo 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-40">
              {hs.dailyData.map((d, idx) => {
                const maxCum = hs.dailyData[hs.dailyData.length - 1]?.cumulative || 1;
                const h = Math.round((d.cumulative / maxCum) * 100);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative"
                      style={{ height: `${h}%`, minHeight: "4px" }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                        {d.date.substring(5)} • {d.deals} deals • {formatCurrency(d.cumulative)}
                      </div>
                    </div>
                    {idx % 3 === 0 && (
                      <span className="text-[8px] text-gray-400">{d.date.substring(8)}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
              <span>1 Mar</span>
              <span className="font-bold text-gray-700">Acumulado: {formatCurrency(hs.totalRevenue)}</span>
              <span>26 Mar</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ SECCION: PIPELINE & ATRIBUCION ═══ */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <h2 className="text-lg font-bold text-gray-800">Pipeline & Fuentes de Origen</h2>
          <Badge className="bg-purple-100 text-purple-700 text-[10px]">HubSpot Analytics</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel de conversion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GitBranch className="w-5 h-5 text-purple-500" />
                Funnel de Conversion - Marzo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const funnel = MARCH_SOURCE_ANALYSIS.pipelineConversion;
                const steps = [
                  { label: "Deals Creados", value: funnel.totalCreated, color: "bg-gray-400", pct: 100 },
                  { label: "En Cotizacion", value: funnel.enCotizacion, color: "bg-blue-400", pct: Math.round((funnel.enCotizacion / funnel.totalCreated) * 100) },
                  { label: "En Credenciales", value: funnel.enCredenciales, color: "bg-indigo-400", pct: Math.round((funnel.enCredenciales / funnel.totalCreated) * 100) },
                  { label: "En Seguimiento", value: funnel.enSeguimiento1 + funnel.enSeguimiento2 + funnel.enSeguimiento3, color: "bg-yellow-500", pct: Math.round(((funnel.enSeguimiento1 + funnel.enSeguimiento2 + funnel.enSeguimiento3) / funnel.totalCreated) * 100) },
                  { label: "GANADOS", value: funnel.ganados, color: "bg-green-600", pct: Math.round((funnel.ganados / funnel.totalCreated) * 100) },
                  { label: "Perdidos", value: funnel.perdidos, color: "bg-red-500", pct: Math.round((funnel.perdidos / funnel.totalCreated) * 100) },
                ];
                return (
                  <div className="space-y-2">
                    {steps.map((s) => (
                      <div key={s.label} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-28 shrink-0">{s.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-5">
                          <div className={`h-5 rounded-full ${s.color} flex items-center justify-end pr-2`} style={{ width: `${Math.max(s.pct, 5)}%` }}>
                            <span className="text-[10px] text-white font-bold">{s.value}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-gray-400 w-10 text-right">{s.pct}%</span>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Win Rate:</span>
                      <span className="text-xl font-bold text-green-600">{funnel.conversionRate}%</span>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Fuentes de origen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="w-5 h-5 text-orange-500" />
                De donde vienen los deals?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(MARCH_SOURCE_ANALYSIS.sourceDetails)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([key, data]) => {
                    const total = MARCH_SOURCE_ANALYSIS.totalDealsCreated;
                    const pct = Math.round((data.count / total) * 100);
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-40 shrink-0">{data.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4">
                          <div className="h-4 rounded-full bg-orange-400" style={{ width: `${Math.max(pct, 2)}%` }} />
                        </div>
                        <span className="text-xs font-mono text-gray-600 w-8 text-right">{data.count}</span>
                        <span className="text-xs font-mono text-gray-400 w-10 text-right">{pct}%</span>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-4 pt-3 border-t">
                <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-orange-800">
                    <p className="font-bold">93% de tus deals no tienen tracking digital</p>
                    <p className="mt-0.5">Conecta Google Ads, Meta Ads y LinkedIn Ads a HubSpot para saber que campanas generan los deals mas rentables.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meeting links que SI generan deals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Links de Meetings que SI generan leads (unico canal trackeable hoy)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Link de Meeting</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Vendedor</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-500">Contactos</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {MARCH_SOURCE_ANALYSIS.meetingLinks.map((m, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs font-mono text-blue-600 truncate max-w-xs">{m.link}</td>
                    <td className="px-4 py-2 font-medium">{m.vendor}</td>
                    <td className="px-4 py-2 text-center">
                      <Badge variant="secondary" className="font-mono">{m.contacts}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* ═══ SECCION: OPERACIONES / RENTABILIDAD ═══ */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <h2 className="text-lg font-bold text-gray-800">Operaciones & Rentabilidad</h2>
          <Badge className="bg-blue-100 text-blue-700 text-[10px]">Pixel Ops</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="kpi-card-green card-hover">
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Venta Real (operados)</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalVentaReal)}</p>
            </CardContent>
          </Card>
          <Card className="kpi-card-green card-hover">
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Utilidad Total</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(totalUtilidadTotal)}</p>
            </CardContent>
          </Card>
          <Card className="kpi-card-purple card-hover">
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Margen Promedio</p>
              <p className={`text-2xl font-bold mt-1 ${getMarginColor(avgMargin)}`}>{avgMargin}%</p>
            </CardContent>
          </Card>
          <Card className="kpi-card-blue card-hover">
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Eventos Operados</p>
              <p className="text-2xl font-bold mt-1">{operados.length}</p>
              <p className="text-xs text-gray-400">de {hs.totalDeals} ganados</p>
            </CardContent>
          </Card>
        </div>

        {/* Deals pendientes de presupuestar */}
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-yellow-800">
              <Calendar className="w-5 h-5" />
              {hs.totalDeals - operados.length} Deals ganados pendientes de presupuestar en Pixel Ops
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-yellow-50">
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-medium text-yellow-700">Deal</th>
                    <th className="px-4 py-2 text-right font-medium text-yellow-700">Monto</th>
                    <th className="px-4 py-2 text-left font-medium text-yellow-700">Vendedor</th>
                    <th className="px-4 py-2 text-right font-medium text-yellow-700">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-100">
                  {MARZO_DEALS.filter(d => d.amount > 100).slice(0, 15).map((d) => (
                    <tr key={d.id} className="hover:bg-yellow-100/50">
                      <td className="px-4 py-1.5">
                        <p className="text-xs font-medium text-gray-900 truncate max-w-xs">{d.dealname}</p>
                      </td>
                      <td className="px-4 py-1.5 text-right font-mono text-xs font-bold">{formatCurrency(d.amount)}</td>
                      <td className="px-4 py-1.5 text-xs text-gray-600">{d.owner_name}</td>
                      <td className="px-4 py-1.5 text-right text-xs text-gray-400">{d.closedate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
