"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { computeProfitability, formatCurrency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  BarChart3,
  Calendar,
  Users,
  Sun,
  CloudSun,
  Moon,
  RefreshCw,
  Package,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

// ─── Helpers ────────────────────────────────────────

function getGreeting(): { text: string; icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Buenos dias", icon: Sun };
  if (hour < 19) return { text: "Buenas tardes", icon: CloudSun };
  return { text: "Buenas noches", icon: Moon };
}

function isThisWeek(dateStr: string): boolean {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  const d = new Date(dateStr + "T00:00:00");
  return d >= monday && d <= sunday;
}

// ─── Dashboard ──────────────────────────────────────

type DateFilter = "hoy" | "semana" | "mes" | "todo" | "custom";

export default function DashboardPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("todo");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [, setRefreshTick] = useState(0);

  // ── Auto-refresh every 30 minutes ──
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      setRefreshTick((t) => t + 1);
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const minutesAgo = Math.floor((Date.now() - lastRefresh.getTime()) / 60000);

  // ── All projects ──
  const allProjects = useMemo(
    () =>
      MOCK_PROJECTS.map((p) => ({
        ...p,
        ...computeProfitability(p.financials),
      })),
    []
  );

  // ── Date-filtered projects ──
  const projects = useMemo(() => {
    const now = new Date();
    return allProjects.filter((p) => {
      const d = new Date(p.event_date + "T00:00:00");
      switch (dateFilter) {
        case "hoy": {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
          return d >= today && d < tomorrow;
        }
        case "semana":
          return isThisWeek(p.event_date);
        case "mes": {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        case "custom": {
          if (customFrom && d < new Date(customFrom + "T00:00:00")) return false;
          if (customTo && d > new Date(customTo + "T23:59:59")) return false;
          return true;
        }
        default:
          return true;
      }
    });
  }, [allProjects, dateFilter, customFrom, customTo]);

  // ── KPI calculations ──
  const totalVenta = projects.reduce(
    (sum, p) => sum + p.financials.venta_presupuesto,
    0
  );
  const totalDeals = projects.length;
  const ticketPromedio = totalDeals > 0 ? Math.round(totalVenta / totalDeals) : 0;
  const dealsEstaSemana = allProjects.filter((p) =>
    isThisWeek(p.created_at)
  ).length;

  // ── Revenue by vendedor ──
  const vendedorMap = useMemo(() => {
    const map: Record<
      string,
      { name: string; deals: number; revenue: number }
    > = {};
    for (const p of projects) {
      const key = p.vendedor_name || "Sin asignar";
      if (!map[key]) map[key] = { name: key, deals: 0, revenue: 0 };
      map[key].deals += 1;
      map[key].revenue += p.financials.venta_presupuesto;
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [projects]);

  // ── Product type breakdown ──
  const productMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of projects) {
      map[p.product_type] = (map[p.product_type] || 0) + 1;
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));
  }, [projects]);

  // ── Recent deals (latest 10 by created_at) ──
  const recentDeals = useMemo(
    () =>
      [...projects]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 10),
    [projects]
  );

  // ── Status breakdown ──
  const statusMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of projects) {
      map[p.status] = (map[p.status] || 0) + 1;
    }
    return map;
  }, [projects]);

  // ── Sync handler ──
  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/hubspot/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.result) {
        const { created = 0, updated = 0, totalDeals = 0 } = data.result;
        setSyncResult(`OK - ${totalDeals} deals procesados (${created} nuevos, ${updated} actualizados)`);
        // Refresh the view after successful sync
        setLastRefresh(new Date());
        setRefreshTick((t) => t + 1);
      } else if (res.status === 401) {
        setSyncResult("Falta configurar HUBSPOT_ACCESS_TOKEN en Vercel");
      } else if (res.status === 500 && data.error?.includes("HUBSPOT_ACCESS_TOKEN")) {
        setSyncResult("Falta configurar HUBSPOT_ACCESS_TOKEN en Vercel");
      } else if (res.status === 500 && data.error?.includes("supabase")) {
        setSyncResult("Falta configurar Supabase (correr schema.sql)");
      } else {
        setSyncResult(data.error || "Error al sincronizar");
      }
    } catch {
      setSyncResult("Error de conexion");
    } finally {
      setSyncing(false);
      // Clear message after 10 seconds
      setTimeout(() => setSyncResult(null), 10000);
    }
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const STATUS_LABELS: Record<string, string> = {
    pendiente: "Pendiente",
    presupuesto_confirmado: "Presupuesto Confirmado",
    en_operacion: "En Operacion",
    operado: "Operado",
    finalizado: "Finalizado",
    cancelado: "Cancelado",
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <GreetingIcon className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting.text}, Daniel
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            &middot; Pixel Factory
          &middot; <span className="text-green-600">Actualizado {minutesAgo === 0 ? "ahora" : `hace ${minutesAgo} min`}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {syncResult && (
            <span
              className={`text-xs font-medium px-3 py-1.5 rounded-lg max-w-md ${
                syncResult.startsWith("OK")
                  ? "bg-green-100 text-green-700"
                  : syncResult.includes("Falta")
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {syncResult}
            </span>
          )}
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Sincronizando..." : "Sincronizar HubSpot"}
          </Button>
        </div>
      </div>

      {/* ─── Date Filter Bar ─── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500 mr-1">Filtrar por:</span>
        {(["todo", "hoy", "semana", "mes", "custom"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setDateFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              dateFilter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "todo" ? "Todo Abril" : f === "hoy" ? "Hoy" : f === "semana" ? "Esta Semana" : f === "mes" ? "Este Mes" : "Rango"}
          </button>
        ))}
        {dateFilter === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-2 py-1 text-xs border rounded-lg"
            />
            <span className="text-xs text-gray-400">a</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-2 py-1 text-xs border rounded-lg"
            />
          </div>
        )}
        <div className="flex-1" />
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Auto-refresh cada 30 min
        </span>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Venta */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0 shadow-lg">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">
                  Total Venta
                </p>
                <p className="text-3xl font-black mt-1">
                  {formatCurrency(totalVenta)}
                </p>
                <p className="text-blue-200 text-xs mt-1">Abril 2026</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* # Deals */}
        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white border-0 shadow-lg">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium uppercase tracking-wide">
                  Deals Cerrados
                </p>
                <p className="text-3xl font-black mt-1">{totalDeals}</p>
                <p className="text-green-200 text-xs mt-1">Abril 2026</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Promedio */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white border-0 shadow-lg">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium uppercase tracking-wide">
                  Ticket Promedio
                </p>
                <p className="text-3xl font-black mt-1">
                  {formatCurrency(ticketPromedio)}
                </p>
                <p className="text-purple-200 text-xs mt-1">Por deal</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals esta semana */}
        <Card className="bg-gradient-to-br from-amber-500 to-amber-700 text-white border-0 shadow-lg">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs font-medium uppercase tracking-wide">
                  Deals esta semana
                </p>
                <p className="text-3xl font-black mt-1">{dealsEstaSemana}</p>
                <p className="text-amber-200 text-xs mt-1">Semana actual</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Two Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Vendedor — takes 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-blue-500" />
              Revenue por Vendedor - Abril 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">
                    Vendedor
                  </th>
                  <th className="px-3 py-2.5 text-center font-medium text-gray-500">
                    Deals
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500">
                    Revenue
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500">
                    % del Total
                  </th>
                  <th className="px-4 py-2.5 text-center font-medium text-gray-500 w-40">
                    Participacion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendedorMap.map((v, idx) => {
                  const pct =
                    totalVenta > 0
                      ? Math.round((v.revenue / totalVenta) * 10000) / 100
                      : 0;
                  const barColors = [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-amber-500",
                    "bg-rose-500",
                    "bg-cyan-500",
                  ];
                  return (
                    <tr key={v.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-6 rounded-full ${
                              barColors[idx % barColors.length]
                            }`}
                          />
                          <span className="font-medium text-gray-900">
                            {v.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-bold">
                        {v.deals}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        {formatCurrency(v.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-600">
                        {pct}%
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              barColors[idx % barColors.length]
                            } transition-all`}
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-900 text-white font-bold">
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-3 py-3 text-center">{totalDeals}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatCurrency(totalVenta)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">100%</td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Right column: Status + Product breakdown */}
        <div className="space-y-6">
          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-5 h-5 text-amber-500" />
                Estado de Deals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(statusMap).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <Badge
                      variant="outline"
                      className="text-xs font-medium capitalize"
                    >
                      {STATUS_LABELS[status] || status}
                    </Badge>
                    <span className="text-sm font-bold text-gray-900">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="w-5 h-5 text-purple-500" />
                Por Tipo de Producto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {productMap.map(({ type, count }) => (
                  <div
                    key={type}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-gray-700 truncate mr-2">
                      {type}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs font-bold shrink-0"
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Recent Deals ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-green-500" />
              Deals Recientes - Abril 2026
            </CardTitle>
            <Link
              href="/projects"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Ver todos
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2.5 text-left font-medium text-gray-500">
                  Deal
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-500">
                  Producto
                </th>
                <th className="px-3 py-2.5 text-left font-medium text-gray-500">
                  Vendedor
                </th>
                <th className="px-3 py-2.5 text-right font-medium text-gray-500">
                  Monto
                </th>
                <th className="px-3 py-2.5 text-center font-medium text-gray-500">
                  Fecha
                </th>
                <th className="px-3 py-2.5 text-center font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${deal.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 hover:underline truncate block max-w-xs"
                      title={deal.deal_name}
                    >
                      {deal.deal_name.length > 50
                        ? deal.deal_name.substring(0, 50) + "..."
                        : deal.deal_name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    {deal.product_type}
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    {deal.vendedor_name}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold">
                    {formatCurrency(deal.financials.venta_presupuesto)}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {new Date(deal.created_at + "T00:00:00").toLocaleDateString(
                      "es-MX",
                      { day: "numeric", month: "short" }
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Badge
                      variant="outline"
                      className="text-xs capitalize"
                    >
                      {STATUS_LABELS[deal.status] || deal.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
