"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import {
  computeProfitability,
  formatCurrency,
  getMarginColor,
  getAnticipoStatus,
} from "@/lib/types";
import {
  Search,
  AlertCircle,
  TrendingUp,
  Calendar as CalendarIcon,
  Users,
  DollarSign,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type FilterTab =
  | "todos"
  | "pendiente"
  | "presupuesto_confirmado"
  | "en_operacion"
  | "operado"
  | "finalizado";

const TAB_CONFIG: { key: FilterTab; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendiente", label: "Pendientes" },
  { key: "presupuesto_confirmado", label: "Confirmados" },
  { key: "en_operacion", label: "En Operacion" },
  { key: "operado", label: "Operados" },
  { key: "finalizado", label: "Finalizados" },
];

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  presupuesto_confirmado: "Presupuesto OK",
  en_operacion: "En Operacion",
  operado: "Operado",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const statusPillColors: Record<string, string> = {
  pendiente: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
  presupuesto_confirmado:
    "bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/30",
  en_operacion: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30",
  operado: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
  finalizado: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/30",
  cancelado: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30",
};

const paymentLabels: Record<string, string> = {
  pagado_100: "Pagado",
  parcial: "Parcial",
  pendiente: "Pendiente",
};

const paymentPillColors: Record<string, string> = {
  pagado_100: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
  parcial: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
  pendiente: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
};

// Color palette per project (deterministic by index)
const PROJECT_COLORS = [
  "#a78bfa", // violet-400
  "#22d3ee", // cyan-400
  "#f472b6", // pink-400
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "#60a5fa", // blue-400
  "#f87171", // red-400
  "#c084fc", // purple-400
];

// Deterministic activity feed (mock)
const ACTIVITY_FEED: { who: string; what: string; when: string; tone: string }[] = [
  { who: "Joyce", what: "confirmo presupuesto en Liverpool Mundial 2026", when: "hace 12 min", tone: "emerald" },
  { who: "Daniel", what: "cerro deal con Liverpool Camion Galerias", when: "hace 1 h", tone: "violet" },
  { who: "Maria", what: "subio cotizacion en iEvents - caminadora green screen", when: "hace 2 h", tone: "sky" },
  { who: "Pricila", what: "confirmo anticipo de Bausch Health", when: "hace 3 h", tone: "emerald" },
  { who: "Oscar", what: "asigno PM a MADE GROUP - Batak tubular", when: "hace 4 h", tone: "amber" },
  { who: "Joel", what: "actualizo viaticos en Tools for Humanity OP Chihuahua", when: "ayer", tone: "violet" },
  { who: "Diana", what: "marco como operado Photobooth San Miguel Allende", when: "ayer", tone: "emerald" },
  { who: "Ivan", what: "creo presupuesto para FCO Group - Calidoscopio", when: "ayer", tone: "sky" },
  { who: "Gabriela", what: "cierre WEIL & CO Credenciales AI", when: "hace 2 dias", tone: "violet" },
  { who: "Alvaro", what: "envio reporte semanal a operacion", when: "hace 2 dias", tone: "amber" },
];

const TONE_DOT: Record<string, string> = {
  emerald: "bg-emerald-400",
  violet: "bg-violet-400",
  sky: "bg-sky-400",
  amber: "bg-amber-400",
};

// Helper to derive initials
function getInitials(name?: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

// Today / month config (April 2026 fixed in mock data)
const TODAY_ISO = "2026-04-28";

function parseISO(d: string): Date {
  return new Date(d + "T00:00:00");
}

function formatShortDate(d: string): string {
  const date = parseISO(d);
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" })
    .format(date)
    .replace(".", "");
}

function isSameISODay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("todos");
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<{ y: number; m: number }>({
    y: 2026,
    m: 3, // April (0-indexed)
  });

  const projects = useMemo(() => {
    return MOCK_PROJECTS.map((p) => ({
      ...p,
      profit: computeProfitability(p.financials),
      anticipoStatus: getAnticipoStatus(p.anticipo_pagado),
    })).sort((a, b) => {
      if (!a.anticipo_pagado && b.anticipo_pagado) return -1;
      if (a.anticipo_pagado && !b.anticipo_pagado) return 1;
      return b.event_date.localeCompare(a.event_date);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = projects;
    if (activeTab !== "todos") {
      result = result.filter((p) => p.status === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.deal_name.toLowerCase().includes(q) ||
          (p.vendedor_name || "").toLowerCase().includes(q) ||
          (p.pm_name || "").toLowerCase().includes(q)
      );
    }
    if (selectedDay) {
      result = result.filter((p) => isSameISODay(p.event_date, selectedDay));
    }
    return result;
  }, [projects, activeTab, search, selectedDay]);

  // Pending anticipo
  const pendingAnticipoProjects = projects.filter(
    (p) => !p.anticipo_pagado && p.presupuesto_confirmado
  );
  const totalPendienteAnticipo = pendingAnticipoProjects.reduce(
    (s, p) => s + p.anticipo_requerido,
    0
  );

  // Filtered summary
  const operados = filtered.filter((p) => p.financials.venta_real > 0);
  const totalVentaPresupuesto = filtered.reduce(
    (s, p) => s + p.financials.venta_presupuesto,
    0
  );
  const totalVentaReal = operados.reduce(
    (s, p) => s + p.financials.venta_real,
    0
  );
  const totalUtilidad = operados.reduce(
    (s, p) => s + p.profit.utilidad_total,
    0
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: projects.length };
    for (const p of projects) {
      c[p.status] = (c[p.status] || 0) + 1;
    }
    return c;
  }, [projects]);

  // ─── Donut: Project Progress (status breakdown) ──────────────
  const statusBreakdown = useMemo(() => {
    const buckets = {
      operado: 0,
      en_operacion: 0,
      presupuesto_confirmado: 0,
      pendiente: 0,
      finalizado: 0,
    } as Record<string, number>;
    for (const p of projects) {
      buckets[p.status] = (buckets[p.status] || 0) + 1;
    }
    return [
      { name: "Operados", value: buckets.operado || 0, color: "#34d399" },
      { name: "En produccion", value: buckets.en_operacion || 0, color: "#60a5fa" },
      { name: "Confirmados", value: buckets.presupuesto_confirmado || 0, color: "#a78bfa" },
      { name: "Pendientes", value: buckets.pendiente || 0, color: "#fbbf24" },
      { name: "Finalizados", value: buckets.finalizado || 0, color: "#94a3b8" },
    ].filter((d) => d.value > 0);
  }, [projects]);

  const finalizadosPct = useMemo(() => {
    if (projects.length === 0) return 0;
    const done =
      projects.filter(
        (p) => p.status === "operado" || p.status === "finalizado"
      ).length;
    return Math.round((done / projects.length) * 100);
  }, [projects]);

  // ─── Top KPIs ──────────────
  const totalVentaAll = projects.reduce(
    (s, p) => s + p.financials.venta_presupuesto,
    0
  );
  const ticketAvg = projects.length > 0 ? totalVentaAll / projects.length : 0;
  const operadosAll = projects.filter((p) => p.financials.venta_real > 0);
  const marginAvg =
    operadosAll.length > 0
      ? operadosAll.reduce((s, p) => s + p.profit.pct_utilidad, 0) /
        operadosAll.length
      : 0;
  const vendedoresActivos = new Set(
    projects.map((p) => p.vendedor_id).filter(Boolean)
  ).size;

  // ─── Proximos eventos (5 mas cercanos hacia el futuro) ──────────────
  const proximosEventos = useMemo(() => {
    return projects
      .filter((p) => p.event_date >= TODAY_ISO)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 5);
  }, [projects]);

  // ─── Bar: Deals por semana del mes ──────────────
  const dealsPorSemana = useMemo(() => {
    const weeks: Record<string, { semana: string; deals: number; venta: number }> = {
      "Sem 1": { semana: "Sem 1", deals: 0, venta: 0 },
      "Sem 2": { semana: "Sem 2", deals: 0, venta: 0 },
      "Sem 3": { semana: "Sem 3", deals: 0, venta: 0 },
      "Sem 4": { semana: "Sem 4", deals: 0, venta: 0 },
      "Sem 5": { semana: "Sem 5", deals: 0, venta: 0 },
    };
    for (const p of projects) {
      const day = parseISO(p.event_date).getDate();
      const key =
        day <= 7
          ? "Sem 1"
          : day <= 14
          ? "Sem 2"
          : day <= 21
          ? "Sem 3"
          : day <= 28
          ? "Sem 4"
          : "Sem 5";
      weeks[key].deals += 1;
      weeks[key].venta += p.financials.venta_presupuesto;
    }
    return Object.values(weeks);
  }, [projects]);

  // ─── Eventos de esta semana ──────────────
  const eventosEstaSemana = useMemo(() => {
    const today = parseISO(TODAY_ISO);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const startISO = weekStart.toISOString().slice(0, 10);
    const endISO = weekEnd.toISOString().slice(0, 10);
    return projects
      .filter((p) => p.event_date >= startISO && p.event_date <= endISO)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 6);
  }, [projects]);

  // ─── Gantt: proximos 14 dias ──────────────
  const ganttData = useMemo(() => {
    const today = parseISO(TODAY_ISO);
    const days: { date: string; label: string; dayNum: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      days.push({
        date: iso,
        label: new Intl.DateTimeFormat("es-MX", { weekday: "short" })
          .format(d)
          .replace(".", "")
          .slice(0, 2),
        dayNum: d.getDate(),
      });
    }
    const startISO = days[0].date;
    const endISO = days[13].date;
    const items = projects
      .filter((p) => p.event_date >= startISO && p.event_date <= endISO)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 8)
      .map((p, idx) => {
        const startIdx = days.findIndex((d) => d.date === p.event_date);
        const span = Math.max(1, Math.min(3, Math.ceil(p.financials.venta_presupuesto / 100000) || 1));
        return {
          project: p,
          startIdx,
          span,
          color: PROJECT_COLORS[idx % PROJECT_COLORS.length],
        };
      });
    return { days, items };
  }, [projects]);

  // ─── Calendar grid ──────────────
  const calendar = useMemo(() => {
    const { y, m } = calendarMonth;
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startWeekday = first.getDay();
    const daysInMonth = last.getDate();
    const cells: (
      | { day: number; iso: string; events: number; venta: number }
      | null
    )[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(
        2,
        "0"
      )}`;
      const dayProjects = projects.filter((p) => p.event_date === iso);
      cells.push({
        day: d,
        iso,
        events: dayProjects.length,
        venta: dayProjects.reduce((s, p) => s + p.financials.venta_presupuesto, 0),
      });
    }
    return cells;
  }, [calendarMonth, projects]);

  const monthLabel = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  }).format(new Date(calendarMonth.y, calendarMonth.m, 1));

  return (
    <div className="space-y-6 -mx-4 -my-4 px-4 py-4 min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950/40 to-slate-950">
      {/* ─── Header ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="text-xs font-medium uppercase tracking-wider text-violet-300/80">
              Dashboard de Operaciones
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">
            Proyectos{" "}
            <span className="text-slate-400 font-normal">·</span>{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Abril 2026
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {projects.length} proyectos activos · {formatCurrency(totalVentaAll)} en ventas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-300">
              Sistema en linea
            </span>
          </div>
        </div>
      </div>

      {/* ─── Row 1: 3 cards principales ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Project Progress (donut) */}
        <div className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-950 to-violet-950 ring-1 ring-violet-500/20 shadow-xl shadow-violet-900/20">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-violet-300/80">
                  Project Progress
                </p>
                <h3 className="text-lg font-semibold text-white mt-0.5">
                  Avance del mes
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center ring-1 ring-violet-400/30">
                <TrendingUp className="w-4 h-4 text-violet-300" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-36 h-36 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      innerRadius={42}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-white">
                    {finalizadosPct}%
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Completado
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                {statusBreakdown.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: s.color }}
                      />
                      <span className="text-slate-300 truncate">{s.name}</span>
                    </div>
                    <span className="font-semibold text-white tabular-nums ml-2">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 ring-1 ring-emerald-500/20 shadow-xl shadow-emerald-900/20">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-300/80">
                  Top KPIs
                </p>
                <h3 className="text-lg font-semibold text-white mt-0.5">
                  Indicadores clave
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-400/30">
                <DollarSign className="w-4 h-4 text-emerald-300" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Total Venta
                </p>
                <p className="text-lg font-bold text-white mt-1 tabular-nums">
                  {formatCurrency(totalVentaAll)}
                </p>
                <p className="text-[10px] text-emerald-400 mt-0.5">
                  {projects.length} proyectos
                </p>
              </div>
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Ticket Avg
                </p>
                <p className="text-lg font-bold text-white mt-1 tabular-nums">
                  {formatCurrency(ticketAvg)}
                </p>
                <p className="text-[10px] text-teal-400 mt-0.5">por deal</p>
              </div>
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Margen Avg
                </p>
                <p className="text-lg font-bold text-white mt-1 tabular-nums">
                  {operadosAll.length > 0 ? `${marginAvg.toFixed(1)}%` : "—"}
                </p>
                <p className="text-[10px] text-emerald-400 mt-0.5">
                  {operadosAll.length} operados
                </p>
              </div>
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Vendedores
                </p>
                <p className="text-lg font-bold text-white mt-1 tabular-nums">
                  {vendedoresActivos}
                </p>
                <p className="text-[10px] text-teal-400 mt-0.5">activos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Proximos Eventos */}
        <div className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-fuchsia-950 via-rose-950 to-purple-950 ring-1 ring-fuchsia-500/20 shadow-xl shadow-fuchsia-900/20">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-fuchsia-300/80">
                  Proximos Eventos
                </p>
                <h3 className="text-lg font-semibold text-white mt-0.5">
                  Por venir
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 flex items-center justify-center ring-1 ring-fuchsia-400/30">
                <CalendarIcon className="w-4 h-4 text-fuchsia-300" />
              </div>
            </div>

            <div className="space-y-2">
              {proximosEventos.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Sin eventos proximos
                </p>
              )}
              {proximosEventos.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block rounded-xl bg-white/5 ring-1 ring-white/10 p-2.5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                      {getInitials(p.pm_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {p.deal_name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {p.pm_name} · {formatShortDate(p.event_date)}
                      </p>
                    </div>
                    <p className="text-xs font-mono font-semibold text-fuchsia-300 tabular-nums flex-shrink-0">
                      {formatCurrency(p.financials.venta_presupuesto)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 2: Bar chart + Today's events + Timeline ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Task Progress Bar */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 ring-1 ring-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-sky-300/80">
                Task Progress
              </p>
              <h3 className="text-base font-semibold text-white mt-0.5">
                Deals por semana
              </h3>
            </div>
            <Activity className="w-4 h-4 text-sky-300" />
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealsPorSemana} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis
                  dataKey="semana"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(167, 139, 250, 0.1)" }}
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [String(value), "Deals"]}
                />
                <Bar dataKey="deals" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Meetings / Eventos */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 ring-1 ring-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-violet-300/80">
                Eventos esta semana
              </p>
              <h3 className="text-base font-semibold text-white mt-0.5">
                Agenda inmediata
              </h3>
            </div>
            <Clock className="w-4 h-4 text-violet-300" />
          </div>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {eventosEstaSemana.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">
                Sin eventos esta semana
              </p>
            )}
            {eventosEstaSemana.map((p) => {
              const pillKey = p.presupuesto_confirmado
                ? "presupuesto_confirmado"
                : p.status;
              const pillLabel = p.presupuesto_confirmado
                ? "Confirmado"
                : statusLabels[p.status] || "Pendiente";
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center gap-2.5 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 p-2 transition-colors"
                >
                  <div className="w-1 h-10 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {p.deal_name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatShortDate(p.event_date)} · {p.product_type}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                      statusPillColors[pillKey] || statusPillColors.pendiente
                    }`}
                  >
                    {pillLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Timeline (gantt 14 dias) */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 ring-1 ring-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-cyan-300/80">
                Timeline · 14 dias
              </p>
              <h3 className="text-base font-semibold text-white mt-0.5">
                Proximas operaciones
              </h3>
            </div>
            <CalendarIcon className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="relative">
            {/* Day headers */}
            <div className="grid grid-cols-14 gap-px mb-2" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
              {ganttData.days.map((d, i) => (
                <div
                  key={i}
                  className={`text-center text-[9px] ${
                    d.date === TODAY_ISO
                      ? "text-cyan-300 font-bold"
                      : "text-slate-500"
                  }`}
                >
                  <div>{d.label}</div>
                  <div className={`text-[10px] ${d.date === TODAY_ISO ? "text-white" : "text-slate-400"}`}>
                    {d.dayNum}
                  </div>
                </div>
              ))}
            </div>
            {/* Bars */}
            <div className="space-y-1.5">
              {ganttData.items.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Sin operaciones en los proximos 14 dias
                </p>
              )}
              {ganttData.items.map((item) => (
                <Link
                  key={item.project.id}
                  href={`/projects/${item.project.id}`}
                  className="grid gap-px relative h-6 group"
                  style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
                  title={item.project.deal_name}
                >
                  <div
                    className="rounded-md flex items-center px-2 text-[10px] font-medium text-white truncate group-hover:brightness-125 transition"
                    style={{
                      gridColumnStart: item.startIdx + 1,
                      gridColumnEnd: item.startIdx + 1 + item.span,
                      background: `linear-gradient(90deg, ${item.color}cc, ${item.color}77)`,
                      boxShadow: `0 0 12px ${item.color}55`,
                    }}
                  >
                    {item.project.deal_name.split(" - ")[0]}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 3: Calendar + Activity feed ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-violet-950/40 to-slate-900 ring-1 ring-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-violet-300/80">
                Calendario
              </p>
              <h3 className="text-base font-semibold text-white mt-0.5 capitalize">
                {monthLabel}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {selectedDay && (
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-[10px] px-2 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/30 ring-1 ring-fuchsia-400/30 transition"
                >
                  Limpiar filtro · {formatShortDate(selectedDay)}
                </button>
              )}
              <button
                onClick={() =>
                  setCalendarMonth((m) =>
                    m.m === 0
                      ? { y: m.y - 1, m: 11 }
                      : { y: m.y, m: m.m - 1 }
                  )
                }
                className="w-7 h-7 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 flex items-center justify-center text-slate-300 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCalendarMonth((m) =>
                    m.m === 11
                      ? { y: m.y + 1, m: 0 }
                      : { y: m.y, m: m.m + 1 }
                  )
                }
                className="w-7 h-7 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 flex items-center justify-center text-slate-300 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
              <div
                key={i}
                className="text-center text-[10px] uppercase tracking-wider text-slate-500 font-medium"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {calendar.map((cell, i) => {
              if (!cell) return <div key={i} />;
              const isToday = cell.iso === TODAY_ISO;
              const isSelected = cell.iso === selectedDay;
              const intensity = Math.min(cell.events, 4);
              const dotColors = [
                "bg-emerald-400",
                "bg-violet-400",
                "bg-fuchsia-400",
                "bg-sky-400",
                "bg-amber-400",
              ];
              return (
                <button
                  key={i}
                  onClick={() =>
                    setSelectedDay((s) => (s === cell.iso ? null : cell.iso))
                  }
                  className={`relative aspect-square rounded-lg p-1.5 text-left transition-all ${
                    isSelected
                      ? "bg-gradient-to-br from-violet-500/40 to-fuchsia-500/30 ring-2 ring-fuchsia-400"
                      : isToday
                      ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/10 ring-1 ring-cyan-400/50"
                      : cell.events > 0
                      ? "bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                      : "bg-white/[0.02] ring-1 ring-white/5 hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`text-xs font-semibold ${
                      isToday
                        ? "text-cyan-300"
                        : cell.events > 0
                        ? "text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {cell.day}
                  </div>
                  {cell.events > 0 && (
                    <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 flex-wrap">
                      {Array.from({ length: intensity }).map((_, j) => (
                        <span
                          key={j}
                          className={`w-1 h-1 rounded-full ${dotColors[j % dotColors.length]}`}
                        />
                      ))}
                      {cell.events > 4 && (
                        <span className="text-[8px] text-slate-400 leading-none">
                          +{cell.events - 4}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 ring-1 ring-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-300/80">
                Activity Feed
              </p>
              <h3 className="text-base font-semibold text-white mt-0.5">
                Ultimas actualizaciones
              </h3>
            </div>
            <Activity className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {ACTIVITY_FEED.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                  {a.who.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 leading-snug">
                    <span className="font-semibold text-white">{a.who}</span>{" "}
                    {a.what}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1 h-1 rounded-full ${TONE_DOT[a.tone]}`} />
                    <p className="text-[10px] text-slate-500">{a.when}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Filters + table ─────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-1 bg-white/5 ring-1 ring-white/10 rounded-xl p-1 flex-wrap">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-[10px] opacity-70">
                  {counts[tab.key] || 0}
                </span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar proyecto, vendedor, PM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white/5 ring-1 ring-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:bg-white/10 transition"
            />
          </div>
          <p className="text-xs text-slate-400">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Anticipo info bar */}
        {pendingAnticipoProjects.length > 0 && (
          <div className="rounded-xl bg-gradient-to-r from-amber-950/60 to-amber-900/30 ring-1 ring-amber-500/30 px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-200">
                {pendingAnticipoProjects.length} proyecto
                {pendingAnticipoProjects.length !== 1 ? "s" : ""} con anticipo pendiente
              </p>
              <p className="text-xs text-amber-300/70 mt-0.5">
                Total pendiente:{" "}
                {formatCurrency(totalPendienteAnticipo)} — Notificado a Ventas y Administracion
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 via-indigo-950/30 to-slate-900/80 ring-1 ring-white/10 overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-400 uppercase tracking-wider w-[280px]">
                    Proyecto
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    PM
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-3 py-3 text-right text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Venta
                  </th>
                  <th className="px-3 py-3 text-center text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-3 py-3 text-center text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-3 py-3 text-center text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Anticipo
                  </th>
                  <th className="px-3 py-3 text-right text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Margen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => {
                  const hasReal = p.financials.venta_real > 0;
                  const anticipoBadge = p.anticipo_pagado
                    ? {
                        label: "Pagado",
                        cls: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
                        dot: "bg-emerald-400",
                      }
                    : {
                        label: "Pendiente",
                        cls: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
                        dot: "bg-amber-400",
                      };
                  return (
                    <tr
                      key={p.id}
                      className="group hover:bg-gradient-to-r hover:from-violet-500/[0.06] hover:via-fuchsia-500/[0.04] hover:to-transparent transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <Link href={`/projects/${p.id}`} className="block">
                          <span className="text-sm font-medium text-slate-100 group-hover:text-violet-300 transition-colors line-clamp-1">
                            {p.deal_name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-slate-400">
                        {p.product_type}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-slate-400">
                        {p.vendedor_name}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-slate-400">
                        {p.pm_name}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-slate-500 tabular-nums">
                        {p.event_date}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-sm font-mono text-slate-200">
                          {formatCurrency(p.financials.venta_presupuesto)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${
                            statusPillColors[p.status] || statusPillColors.pendiente
                          }`}
                        >
                          {statusLabels[p.status] || p.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${paymentPillColors[p.payment_status]}`}
                        >
                          {paymentLabels[p.payment_status]}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full ${anticipoBadge.cls}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${anticipoBadge.dot}`}
                          />
                          {anticipoBadge.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {hasReal ? (
                          <span
                            className={`text-sm font-mono font-semibold ${getMarginColor(
                              p.profit.pct_utilidad
                            )}`}
                          >
                            {p.profit.pct_utilidad}%
                          </span>
                        ) : (
                          <span className="text-sm text-slate-600">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="border-t border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div>
                  <span className="text-slate-500">Venta Presupuesto:</span>{" "}
                  <span className="font-mono font-medium text-slate-200">
                    {formatCurrency(totalVentaPresupuesto)}
                  </span>
                </div>
                {totalVentaReal > 0 && (
                  <>
                    <div>
                      <span className="text-slate-500">Venta Real:</span>{" "}
                      <span className="font-mono font-medium text-slate-200">
                        {formatCurrency(totalVentaReal)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Utilidad:</span>{" "}
                      <span
                        className={`font-mono font-medium ${
                          totalUtilidad >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {formatCurrency(totalUtilidad)}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-500">Operados:</span>{" "}
                  <span className="font-medium text-slate-200">
                    {operados.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>{vendedoresActivos} vendedores</span>
                </div>
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">No se encontraron proyectos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
