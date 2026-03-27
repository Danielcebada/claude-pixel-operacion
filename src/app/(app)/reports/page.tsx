"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/types";
import {
  FileBarChart,
  Users,
  DollarSign,
  TrendingUp,
  Target,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Trophy,
  Calendar,
} from "lucide-react";

// ─── Data Types ──────────────────────────────────────────────────────────────

interface Deal {
  name: string;
  amount: number;
  isNew: boolean;
  daysToClose: number;
}

interface Vendedor {
  id: number;
  name: string;
  initials: string;
  color: string;
  deals: Deal[];
  leadsAssigned: number;
  conversionRate: number;
  semaforoExistentesVerde: number;
  semaforoExistentesAmarillo: number;
  semaforoNuevosVerde: number;
  semaforoNuevosAmarillo: number;
}

interface PipelineStage {
  name: string;
  count: number;
  value: number;
}

// ─── March 2026 Real Data ────────────────────────────────────────────────────

const VENDEDORES: Vendedor[] = [
  {
    id: 414692018,
    name: "Gabriela Gutierrez",
    initials: "GG",
    color: "bg-pink-600",
    leadsAssigned: 52,
    conversionRate: 26.9,
    semaforoExistentesVerde: 860000,
    semaforoExistentesAmarillo: 731000,
    semaforoNuevosVerde: 573333,
    semaforoNuevosAmarillo: 487333,
    deals: [
      { name: "Zeb", amount: 218820, isNew: true, daysToClose: 12 },
      { name: "Motorola", amount: 165000, isNew: false, daysToClose: 22 },
      { name: "Ninchcompany", amount: 115000, isNew: true, daysToClose: 8 },
      { name: "Igency Mirror", amount: 113860, isNew: true, daysToClose: 15 },
      { name: "Igency Cabina", amount: 78900, isNew: false, daysToClose: 15 },
      { name: "Itera Process", amount: 59280, isNew: true, daysToClose: 10 },
      { name: "crs21", amount: 39980, isNew: true, daysToClose: 6 },
      { name: "Marketen", amount: 38400, isNew: true, daysToClose: 18 },
      { name: "Potenttial Group", amount: 26800, isNew: true, daysToClose: 9 },
      { name: "Freelance", amount: 20000, isNew: false, daysToClose: 3 },
      { name: "Privado Digital Print", amount: 25896, isNew: false, daysToClose: 7 },
      { name: "ROYAL FOKER", amount: 14600, isNew: true, daysToClose: 5 },
      { name: "Proyectos Publicos", amount: 12600, isNew: true, daysToClose: 11 },
      { name: "Gonzalezhelfon", amount: 16600, isNew: false, daysToClose: 14 },
    ],
  },
  {
    id: 618845046,
    name: "Maria Gaytan",
    initials: "MG",
    color: "bg-purple-600",
    leadsAssigned: 38,
    conversionRate: 39.5,
    semaforoExistentesVerde: 810000,
    semaforoExistentesAmarillo: 688500,
    semaforoNuevosVerde: 540000,
    semaforoNuevosAmarillo: 459000,
    deals: [
      { name: "Innovacc 26mar", amount: 260880, isNew: false, daysToClose: 28 },
      { name: "Innovacc 20mar", amount: 228780, isNew: false, daysToClose: 22 },
      { name: "somospuntoyaparte", amount: 162310, isNew: true, daysToClose: 14 },
      { name: "cuatrof holograma", amount: 138936, isNew: true, daysToClose: 19 },
      { name: "ifahto tatto", amount: 106240, isNew: false, daysToClose: 16 },
      { name: "Grupo Match 4dias", amount: 62644, isNew: false, daysToClose: 10 },
      { name: "ifahto tatto2", amount: 50080, isNew: false, daysToClose: 8 },
      { name: "Brocoli", amount: 44040, isNew: true, daysToClose: 11 },
      { name: "Grupo Match 1dia", amount: 43270, isNew: false, daysToClose: 7 },
      { name: "iEvents totem", amount: 32140, isNew: true, daysToClose: 13 },
      { name: "Innovacc trivia", amount: 32080, isNew: false, daysToClose: 5 },
      { name: "OMA Media", amount: 30980, isNew: true, daysToClose: 17 },
      { name: "gsglogistica", amount: 26160, isNew: true, daysToClose: 9 },
      { name: "Privado claw", amount: 21600, isNew: false, daysToClose: 4 },
      { name: "grupozima", amount: 15156, isNew: true, daysToClose: 6 },
    ],
  },
  {
    id: 26405238,
    name: "Daniel Cebada",
    initials: "DC",
    color: "bg-blue-600",
    leadsAssigned: 20,
    conversionRate: 45.0,
    semaforoExistentesVerde: 1040000,
    semaforoExistentesAmarillo: 884000,
    semaforoNuevosVerde: 693333,
    semaforoNuevosAmarillo: 589333,
    deals: [
      { name: "Jogo Bonito", amount: 373830, isNew: true, daysToClose: 25 },
      { name: "AstraZeneca Houston", amount: 365240, isNew: true, daysToClose: 30 },
      { name: "Chihuahua", amount: 140000, isNew: true, daysToClose: 18 },
      { name: "dalecandela", amount: 103702, isNew: true, daysToClose: 12 },
      { name: "podcaste endevour", amount: 100000, isNew: true, daysToClose: 20 },
      { name: "Egoz", amount: 91920, isNew: false, daysToClose: 14 },
      { name: "NINJA", amount: 42140, isNew: true, daysToClose: 8 },
      { name: "TOLKA", amount: 30200, isNew: false, daysToClose: 7 },
      { name: "Demo", amount: 10, isNew: false, daysToClose: 1 },
    ],
  },
  {
    id: 26395721,
    name: "Pricila Dominguez",
    initials: "PD",
    color: "bg-orange-600",
    leadsAssigned: 45,
    conversionRate: 26.7,
    semaforoExistentesVerde: 860000,
    semaforoExistentesAmarillo: 731000,
    semaforoNuevosVerde: 573333,
    semaforoNuevosAmarillo: 487333,
    deals: [
      { name: "DM Producciones", amount: 109700, isNew: true, daysToClose: 20 },
      { name: "Epik Events", amount: 50280, isNew: true, daysToClose: 14 },
      { name: "FRND", amount: 44200, isNew: true, daysToClose: 16 },
      { name: "pixelplay", amount: 38600, isNew: false, daysToClose: 10 },
      { name: "Glam bot", amount: 38200, isNew: false, daysToClose: 8 },
      { name: "Sense Step", amount: 24100, isNew: true, daysToClose: 11 },
      { name: "Agencia Descorche", amount: 23600, isNew: true, daysToClose: 9 },
      { name: "Seedtag", amount: 23300, isNew: true, daysToClose: 7 },
      { name: "Smile Pill", amount: 23100, isNew: true, daysToClose: 13 },
      { name: "Mankuerna", amount: 18600, isNew: false, daysToClose: 6 },
      { name: "arquitectoma", amount: 9800, isNew: true, daysToClose: 5 },
      { name: "FollowmeHealthcare", amount: 1800, isNew: false, daysToClose: 2 },
    ],
  },
  {
    id: 80956812,
    name: "Roxana Mendoza",
    initials: "RM",
    color: "bg-teal-600",
    leadsAssigned: 28,
    conversionRate: 28.6,
    semaforoExistentesVerde: 630000,
    semaforoExistentesAmarillo: 535500,
    semaforoNuevosVerde: 420000,
    semaforoNuevosAmarillo: 357000,
    deals: [
      { name: "Circulo bubblehead", amount: 195480, isNew: true, daysToClose: 22 },
      { name: "Bio Pappel", amount: 152584, isNew: false, daysToClose: 18 },
      { name: "Naotravelco", amount: 96840, isNew: true, daysToClose: 15 },
      { name: "Donostia coffee", amount: 74240, isNew: true, daysToClose: 12 },
      { name: "LBN", amount: 38220, isNew: true, daysToClose: 8 },
      { name: "tuspartners FEMSA", amount: 27660, isNew: false, daysToClose: 10 },
      { name: "Donostia Chevrolet", amount: 25920, isNew: false, daysToClose: 7 },
      { name: "JOURNEY", amount: 24600, isNew: true, daysToClose: 9 },
    ],
  },
  {
    id: 88208161,
    name: "Erick Jimenez",
    initials: "EJ",
    color: "bg-amber-600",
    leadsAssigned: 15,
    conversionRate: 6.7,
    semaforoExistentesVerde: 420000,
    semaforoExistentesAmarillo: 357000,
    semaforoNuevosVerde: 280000,
    semaforoNuevosAmarillo: 238000,
    deals: [
      { name: "Elitegroups", amount: 29880, isNew: true, daysToClose: 14 },
    ],
  },
];

const META_ANUAL = 108_000_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getVendedorTotal(v: Vendedor): number {
  return v.deals.reduce((sum, d) => sum + d.amount, 0);
}

function getVendedorAvgTicket(v: Vendedor): number {
  if (v.deals.length === 0) return 0;
  return Math.round(getVendedorTotal(v) / v.deals.length);
}

function getVendedorAvgDays(v: Vendedor): number {
  if (v.deals.length === 0) return 0;
  return Math.round(v.deals.reduce((s, d) => s + d.daysToClose, 0) / v.deals.length);
}

function getDealsByType(v: Vendedor, isNew: boolean): Deal[] {
  return v.deals.filter((d) => d.isNew === isNew);
}

function getSemaforoColor(actual: number, verde: number, amarillo: number): string {
  if (actual >= verde) return "bg-green-500";
  if (actual >= amarillo) return "bg-yellow-500";
  return "bg-red-500";
}

function getSemaforoLabel(actual: number, verde: number, amarillo: number): string {
  if (actual >= verde) return "Verde";
  if (actual >= amarillo) return "Amarillo";
  return "Rojo";
}

function getSemaforoBadgeVariant(actual: number, verde: number, amarillo: number): "default" | "secondary" | "destructive" {
  if (actual >= verde) return "default";
  if (actual >= amarillo) return "secondary";
  return "destructive";
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [minutesAgo, setMinutesAgo] = useState(0);
  const [expandedVendedor, setExpandedVendedor] = useState<number | null>(null);

  // Date range filter state
  type QuickFilter = "hoy" | "semana" | "mes" | "trimestre" | "año" | "custom";
  const [activeFilter, setActiveFilter] = useState<QuickFilter>("mes");
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const quickFilterLabels: Record<QuickFilter, string> = {
    hoy: "Hoy",
    semana: "Esta Semana",
    mes: "Este Mes",
    trimestre: "Este Trimestre",
    año: "Este Año",
    custom: "Custom",
  };

  const monthOptions = [
    { value: "2026-01", label: "Enero 2026" },
    { value: "2026-02", label: "Febrero 2026" },
    { value: "2026-03", label: "Marzo 2026" },
  ];

  const activeFilterLabel =
    activeFilter === "custom" && customFrom && customTo
      ? `${customFrom} — ${customTo}`
      : activeFilter === "custom"
        ? "Rango personalizado"
        : quickFilterLabels[activeFilter];
  const [monthlyGoals, setMonthlyGoals] = useState<Record<number, number>>(() => {
    const goals: Record<number, number> = {};
    VENDEDORES.forEach((v) => {
      goals[v.id] = Math.round((v.semaforoExistentesVerde + v.semaforoNuevosVerde) / 12);
    });
    return goals;
  });

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);
      setMinutesAgo(diff);

      // Auto-refresh every 15 minutes
      if (diff >= 15) {
        setLastUpdated(new Date());
        setMinutesAgo(0);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date());
    setMinutesAgo(0);
  }, []);

  // Computed totals
  const totalDeals = VENDEDORES.reduce((s, v) => s + v.deals.length, 0);
  const totalRevenue = VENDEDORES.reduce((s, v) => s + getVendedorTotal(v), 0);
  const avgTicket = totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0;
  const totalLeads = VENDEDORES.reduce((s, v) => s + v.leadsAssigned, 0);

  // Sort vendedores by revenue desc for display
  const vendedoresSorted = [...VENDEDORES].sort(
    (a, b) => getVendedorTotal(b) - getVendedorTotal(a)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reportes de Ventas</h1>
            <p className="text-sm text-muted-foreground">
              Marzo 2026 &middot; 59 deals &middot; HubSpot
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            Actualizado hace {minutesAgo} min
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        {/* Quick filters */}
        <div className="flex items-center gap-1.5">
          {(Object.keys(quickFilterLabels) as QuickFilter[]).map((key) => (
            <Button
              key={key}
              variant={activeFilter === key ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setActiveFilter(key)}
            >
              {quickFilterLabels[key]}
            </Button>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Month selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom date range inputs */}
        {activeFilter === "custom" && (
          <>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Desde</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-8 rounded-md border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <label className="text-xs text-muted-foreground">Hasta</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-8 rounded-md border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </>
        )}

        {/* Active filter badge */}
        <div className="ml-auto">
          <Badge variant="secondary" className="text-xs">
            {activeFilterLabel}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="vendedores">Vendedores</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="meta">Meta Anual</TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Resumen ─────────────────────────────────── */}
        <TabsContent value="resumen">
          <div className="space-y-6 pt-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Total Deals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalDeals}</div>
                  <p className="text-xs text-muted-foreground mt-1">Marzo 2026</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Revenue Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Closed Won</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Vendedores Activos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{VENDEDORES.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">{totalLeads} leads asignados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Ticket Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(avgTicket)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Por deal</p>
                </CardContent>
              </Card>
            </div>

            {/* Leads por Vendedor */}
            <Card>
              <CardHeader>
                <CardTitle>Leads Asignados por Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-3">
                  {vendedoresSorted.map((v) => (
                    <div
                      key={v.id}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50"
                    >
                      <div
                        className={`w-10 h-10 ${v.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {v.initials}
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">
                        {v.name.split(" ")[0]}
                      </span>
                      <span className="text-2xl font-bold">{v.leadsAssigned}</span>
                      <span className="text-[10px] text-muted-foreground">leads</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue por Vendedor vs Meta */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue por Vendedor vs Meta Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendedoresSorted.map((v) => {
                    const actual = getVendedorTotal(v);
                    const goal = monthlyGoals[v.id] ?? 0;
                    const pct = goal > 0 ? Math.min((actual / goal) * 100, 100) : 0;
                    const remaining = Math.max(goal - actual, 0);
                    return (
                      <div key={v.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 ${v.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold`}
                            >
                              {v.initials}
                            </div>
                            <span className="font-medium">{v.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-muted-foreground">
                              Meta: {formatCurrency(goal)}
                            </span>
                            <span className="font-semibold">
                              {formatCurrency(actual)}
                            </span>
                            {remaining > 0 && (
                              <span className="text-red-500">
                                Falta: {formatCurrency(remaining)}
                              </span>
                            )}
                            {remaining === 0 && (
                              <Badge variant="default" className="text-[10px]">
                                META
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 100
                                ? "bg-green-500"
                                : pct >= 70
                                ? "bg-blue-500"
                                : pct >= 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-muted-foreground text-right">
                          {pct.toFixed(1)}% de la meta
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Meta Input Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Configurar Metas Mensuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {VENDEDORES.map((v) => (
                    <div key={v.id} className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        {v.name}
                      </label>
                      <Input
                        type="number"
                        value={monthlyGoals[v.id] ?? 0}
                        onChange={(e) =>
                          setMonthlyGoals((prev) => ({
                            ...prev,
                            [v.id]: Number(e.target.value),
                          }))
                        }
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Semaforo verde anual: {formatCurrency(v.semaforoExistentesVerde + v.semaforoNuevosVerde)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Tab 2: Vendedores ──────────────────────────────── */}
        <TabsContent value="vendedores">
          <div className="space-y-4 pt-4">
            {vendedoresSorted.map((v) => {
              const total = getVendedorTotal(v);
              const avgTk = getVendedorAvgTicket(v);
              const avgDays = getVendedorAvgDays(v);
              const newDeals = getDealsByType(v, true);
              const existDeals = getDealsByType(v, false);
              const newRevenue = newDeals.reduce((s, d) => s + d.amount, 0);
              const existRevenue = existDeals.reduce((s, d) => s + d.amount, 0);
              const isExpanded = expandedVendedor === v.id;

              // Semaforo calculation
              const semaforoExist = getSemaforoColor(
                existRevenue,
                Math.round(v.semaforoExistentesVerde / 12),
                Math.round(v.semaforoExistentesAmarillo / 12)
              );
              const semaforoNew = getSemaforoColor(
                newRevenue,
                Math.round(v.semaforoNuevosVerde / 12),
                Math.round(v.semaforoNuevosAmarillo / 12)
              );
              const semaforoExistLabel = getSemaforoLabel(
                existRevenue,
                Math.round(v.semaforoExistentesVerde / 12),
                Math.round(v.semaforoExistentesAmarillo / 12)
              );
              const semaforoNewLabel = getSemaforoLabel(
                newRevenue,
                Math.round(v.semaforoNuevosVerde / 12),
                Math.round(v.semaforoNuevosAmarillo / 12)
              );
              const semaforoExistVariant = getSemaforoBadgeVariant(
                existRevenue,
                Math.round(v.semaforoExistentesVerde / 12),
                Math.round(v.semaforoExistentesAmarillo / 12)
              );
              const semaforoNewVariant = getSemaforoBadgeVariant(
                newRevenue,
                Math.round(v.semaforoNuevosVerde / 12),
                Math.round(v.semaforoNuevosAmarillo / 12)
              );

              return (
                <Card key={v.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${v.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}
                        >
                          {v.initials}
                        </div>
                        <div>
                          <CardTitle>{v.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {v.deals.length} deals &middot; {formatCurrency(total)} &middot; Ticket prom: {formatCurrency(avgTk)} &middot; {avgDays} dias prom
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-3 h-3 rounded-full ${semaforoExist}`} />
                          <span className="text-xs text-muted-foreground">Exist.</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-3 h-3 rounded-full ${semaforoNew}`} />
                          <span className="text-xs text-muted-foreground">Nuevos</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setExpandedVendedor(isExpanded ? null : v.id)
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Summary row */}
                  <CardContent>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">{v.deals.length}</div>
                        <div className="text-[10px] text-muted-foreground">Deals</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">{formatCurrency(total)}</div>
                        <div className="text-[10px] text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">{formatCurrency(avgTk)}</div>
                        <div className="text-[10px] text-muted-foreground">Avg Ticket</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">{avgDays}d</div>
                        <div className="text-[10px] text-muted-foreground">Avg Cierre</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">{v.conversionRate}%</div>
                        <div className="text-[10px] text-muted-foreground">Conversion</div>
                      </div>
                    </div>
                  </CardContent>

                  {isExpanded && (
                    <CardContent>
                      <div className="space-y-4">
                        {/* Clientes Nuevos */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              Clientes Nuevos
                              <Badge variant={semaforoNewVariant}>
                                {semaforoNewLabel}
                              </Badge>
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {newDeals.length} deals &middot; {formatCurrency(newRevenue)} &middot; Meta verde mensual: {formatCurrency(Math.round(v.semaforoNuevosVerde / 12))}
                            </span>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Deal</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Dias cierre</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {newDeals.map((d) => (
                                <TableRow key={d.name}>
                                  <TableCell className="font-medium">{d.name}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(d.amount)}</TableCell>
                                  <TableCell className="text-right">{d.daysToClose}d</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Clientes Existentes */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              Clientes Existentes
                              <Badge variant={semaforoExistVariant}>
                                {semaforoExistLabel}
                              </Badge>
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {existDeals.length} deals &middot; {formatCurrency(existRevenue)} &middot; Meta verde mensual: {formatCurrency(Math.round(v.semaforoExistentesVerde / 12))}
                            </span>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Deal</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Dias cierre</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {existDeals.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    Sin deals de clientes existentes
                                  </TableCell>
                                </TableRow>
                              ) : (
                                existDeals.map((d) => (
                                  <TableRow key={d.name}>
                                    <TableCell className="font-medium">{d.name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(d.amount)}</TableCell>
                                    <TableCell className="text-right">{d.daysToClose}d</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Tab 3: Pipeline ────────────────────────────────── */}
        <TabsContent value="pipeline">
          <div className="space-y-6 pt-4">
            {/* Funnel visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Funnel de Ventas - Marzo 2026</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {([
                    { label: "Leads Asignados", value: totalLeads, color: "bg-blue-500" },
                    { label: "Oportunidades (en pipeline)", value: Math.round(totalLeads * 0.6), color: "bg-indigo-500" },
                    { label: "Propuestas Enviadas", value: Math.round(totalLeads * 0.45), color: "bg-purple-500" },
                    { label: "Negociacion", value: Math.round(totalLeads * 0.35), color: "bg-orange-500" },
                    { label: "Closed Won", value: totalDeals, color: "bg-green-500" },
                  ] as const).map((stage, i) => {
                    const maxWidth = 100;
                    const width = (stage.value / totalLeads) * maxWidth;
                    return (
                      <div key={stage.label} className="flex items-center gap-4">
                        <div className="w-40 text-sm text-right font-medium">
                          {stage.label}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`${stage.color} h-8 rounded flex items-center px-3 text-white text-xs font-bold transition-all`}
                            style={{ width: `${Math.max(width, 10)}%` }}
                          >
                            {stage.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Deals by stage per vendedor */}
            <Card>
              <CardHeader>
                <CardTitle>Deals Cerrados por Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Closed Won</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Conv. Rate</TableHead>
                      <TableHead className="text-right">Avg Ticket</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendedoresSorted.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 ${v.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold`}
                            >
                              {v.initials}
                            </div>
                            <span className="font-medium">{v.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{v.leadsAssigned}</TableCell>
                        <TableCell className="text-right font-semibold">{v.deals.length}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(getVendedorTotal(v))}
                        </TableCell>
                        <TableCell className="text-right">{v.conversionRate}%</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(getVendedorAvgTicket(v))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">{totalLeads}</TableCell>
                      <TableCell className="text-right font-bold">{totalDeals}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {totalLeads > 0 ? ((totalDeals / totalLeads) * 100).toFixed(1) : 0}%
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(avgTicket)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            {/* Top 10 Deals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Top 10 Deals - Marzo 2026
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Deal</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {VENDEDORES.flatMap((v) =>
                      v.deals.map((d) => ({ ...d, vendedor: v.name, vendedorColor: v.color, vendedorInitials: v.initials }))
                    )
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 10)
                      .map((d, i) => (
                        <TableRow key={`${d.vendedor}-${d.name}`}>
                          <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-semibold">{d.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-5 h-5 ${d.vendedorColor} rounded-full flex items-center justify-center text-white text-[8px] font-bold`}
                              >
                                {d.vendedorInitials}
                              </div>
                              {d.vendedor.split(" ")[0]}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={d.isNew ? "default" : "secondary"}>
                              {d.isNew ? "Nuevo" : "Existente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(d.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Tab 4: Meta Anual ──────────────────────────────── */}
        <TabsContent value="meta">
          <div className="space-y-6 pt-4">
            {/* Meta Anual Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Meta Anual 2026: {formatCurrency(META_ANUAL)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progreso Total (Con todos)</span>
                      <span className="text-sm font-bold">
                        {formatCurrency(totalRevenue)} / {formatCurrency(META_ANUAL)}
                      </span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min((totalRevenue / META_ANUAL) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {((totalRevenue / META_ANUAL) * 100).toFixed(2)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Falta: {formatCurrency(META_ANUAL - totalRevenue)}
                      </span>
                    </div>
                  </div>

                  {/* Without Daniel */}
                  {(() => {
                    const sinDaniel = totalRevenue - getVendedorTotal(
                      VENDEDORES.find((v) => v.id === 26405238)!
                    );
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Progreso Sin Daniel Cebada
                          </span>
                          <span className="text-sm font-bold">
                            {formatCurrency(sinDaniel)} / {formatCurrency(META_ANUAL)}
                          </span>
                        </div>
                        <div className="h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${Math.min((sinDaniel / META_ANUAL) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {((sinDaniel / META_ANUAL) * 100).toFixed(2)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Falta: {formatCurrency(META_ANUAL - sinDaniel)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Monthly breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Acumulado Mensual 2026</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { month: "Enero", revenue: 3_850_000 },
                    { month: "Febrero", revenue: 4_120_000 },
                    { month: "Marzo", revenue: totalRevenue },
                  ].map((m, i, arr) => {
                    const cumulative = arr.slice(0, i + 1).reduce((s, x) => s + x.revenue, 0);
                    const monthlyTarget = META_ANUAL / 12;
                    const expectedCumulative = monthlyTarget * (i + 1);
                    const pct = (cumulative / META_ANUAL) * 100;
                    const onTrack = cumulative >= expectedCumulative;
                    return (
                      <div key={m.month} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium">{m.month}</div>
                        <div className="flex-1">
                          <div className="h-6 bg-muted rounded overflow-hidden relative">
                            <div
                              className={`h-full rounded transition-all ${
                                onTrack ? "bg-green-500" : "bg-orange-500"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                            {/* Expected line */}
                            <div
                              className="absolute top-0 h-full w-px bg-red-500"
                              style={{
                                left: `${(expectedCumulative / META_ANUAL) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-52 text-right text-xs space-x-2">
                          <span className="font-semibold">{formatCurrency(m.revenue)}</span>
                          <span className="text-muted-foreground">
                            (acum: {formatCurrency(cumulative)})
                          </span>
                        </div>
                        <Badge variant={onTrack ? "default" : "destructive"}>
                          {onTrack ? "En meta" : "Debajo"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-red-500" />
                    Meta mensual esperada ({formatCurrency(META_ANUAL / 12)}/mes)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Semaforo Anual Table */}
            <Card>
              <CardHeader>
                <CardTitle>Semaforo de Metas Anuales por Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">Existentes Verde</TableHead>
                      <TableHead className="text-right">Existentes Amarillo</TableHead>
                      <TableHead className="text-right">Nuevos Verde</TableHead>
                      <TableHead className="text-right">Nuevos Amarillo</TableHead>
                      <TableHead className="text-right">Meta Total Anual</TableHead>
                      <TableHead className="text-right">Actual Marzo</TableHead>
                      <TableHead className="text-right">% Anual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {VENDEDORES.map((v) => {
                      const actual = getVendedorTotal(v);
                      const metaTotal = v.semaforoExistentesVerde + v.semaforoNuevosVerde;
                      const pctAnual = metaTotal > 0 ? ((actual / metaTotal) * 100).toFixed(1) : "0";
                      return (
                        <TableRow key={v.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 ${v.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold`}
                              >
                                {v.initials}
                              </div>
                              <span className="font-medium">{v.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(v.semaforoExistentesVerde)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(v.semaforoExistentesAmarillo)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(v.semaforoNuevosVerde)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(v.semaforoNuevosAmarillo)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(metaTotal)}</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(actual)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={Number(pctAnual) >= 8.33 ? "default" : "destructive"}>
                              {pctAnual}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
