"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Monitor,
  Gamepad2,
  Glasses,
  Tv,
  Coffee,
} from "lucide-react";
import { formatCurrency } from "@/lib/types";
import { CALENDAR_EVENTS, type CalendarEvent } from "@/lib/calendar-ops";

// ─── Equipment Categories ──────────────────────────────────
interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  status: "disponible" | "reservado" | "en_uso" | "mantenimiento";
}

type EquipmentCategory = "photo_booths" | "interactive_games" | "vr_ar" | "screens" | "food_bev";

const CATEGORIES: { key: EquipmentCategory; label: string; icon: typeof Monitor }[] = [
  { key: "photo_booths", label: "Photo Booths", icon: Monitor },
  { key: "interactive_games", label: "Interactive Games", icon: Gamepad2 },
  { key: "vr_ar", label: "VR / AR", icon: Glasses },
  { key: "screens", label: "Pantallas", icon: Tv },
  { key: "food_bev", label: "Food & Bev", icon: Coffee },
];

// ─── PM Colors ─────────────────────────────────────────────
const PM_COLORS: Record<string, string> = {
  Diana: "bg-purple-500",
  Ivan: "bg-blue-500",
  Alex: "bg-green-500",
  Daniel: "bg-orange-500",
  Desarrollo: "bg-gray-500",
  Harol: "bg-pink-500",
  Oscar: "bg-cyan-500",
  Joyce: "bg-rose-500",
  Alvaro: "bg-teal-500",
  Joel: "bg-indigo-500",
  Eduardo: "bg-amber-500",
};

// ─── Map products to categories ────────────────────────────
function getCategory(producto: string): EquipmentCategory {
  const lower = producto.toLowerCase();
  if (
    lower.includes("booth") ||
    lower.includes("mirror") ||
    lower.includes("glam") ||
    lower.includes("sketch") ||
    lower.includes("tattoo") ||
    lower.includes("360") ||
    lower.includes("photo ai") ||
    lower.includes("bubblehead") ||
    lower.includes("totem") ||
    lower.includes("sticker") ||
    lower.includes("ipad") ||
    lower.includes("cabina") ||
    lower.includes("credencial")
  ) return "photo_booths";
  if (
    lower.includes("batak") ||
    lower.includes("kick") ||
    lower.includes("soccer") ||
    lower.includes("futbolito") ||
    lower.includes("garrita") ||
    lower.includes("claw") ||
    lower.includes("caminadora") ||
    lower.includes("reflejo") ||
    lower.includes("football") ||
    lower.includes("fortuna") ||
    lower.includes("sensor") ||
    lower.includes("juego")
  ) return "interactive_games";
  if (
    lower.includes("vr") ||
    lower.includes("ar") ||
    lower.includes("meta human") ||
    lower.includes("holograma") ||
    lower.includes("robot")
  ) return "vr_ar";
  if (
    lower.includes("pantalla") ||
    lower.includes("screen") ||
    lower.includes("streaming") ||
    lower.includes("web") ||
    lower.includes("neon") ||
    lower.includes("mosaico")
  ) return "screens";
  if (
    lower.includes("coffee") ||
    lower.includes("matcha") ||
    lower.includes("barra") ||
    lower.includes("cotton") ||
    lower.includes("bebida")
  ) return "food_bev";
  return "photo_booths";
}

// ─── Equipment Inventory (mock) ────────────────────────────
const EQUIPMENT: Equipment[] = [
  { id: "eq1", name: "Photo Booth 360 #1", category: "photo_booths", status: "en_uso" },
  { id: "eq2", name: "Photo Booth 360 #2", category: "photo_booths", status: "disponible" },
  { id: "eq3", name: "iPad Booth #1", category: "photo_booths", status: "en_uso" },
  { id: "eq4", name: "iPad Booth #2", category: "photo_booths", status: "reservado" },
  { id: "eq5", name: "Glam Bot", category: "photo_booths", status: "disponible" },
  { id: "eq6", name: "Sketch Booth", category: "photo_booths", status: "en_uso" },
  { id: "eq7", name: "Mirror Booth", category: "photo_booths", status: "en_uso" },
  { id: "eq8", name: "Tattoo Print", category: "photo_booths", status: "en_uso" },
  { id: "eq9", name: "Cabina Cerrada", category: "photo_booths", status: "en_uso" },
  { id: "eq10", name: "Totem Interactivo", category: "photo_booths", status: "disponible" },
  { id: "eq11", name: "Batak Piso", category: "interactive_games", status: "en_uso" },
  { id: "eq12", name: "Batak Tubular", category: "interactive_games", status: "en_uso" },
  { id: "eq13", name: "Super Kick", category: "interactive_games", status: "reservado" },
  { id: "eq14", name: "Turbo Soccer + Cancha", category: "interactive_games", status: "reservado" },
  { id: "eq15", name: "Mega Futbolito", category: "interactive_games", status: "disponible" },
  { id: "eq16", name: "Garrita / Claw", category: "interactive_games", status: "disponible" },
  { id: "eq17", name: "Caminadora Magic Screen", category: "interactive_games", status: "reservado" },
  { id: "eq18", name: "Football Balance", category: "interactive_games", status: "en_uso" },
  { id: "eq19", name: "Juego de Reflejos", category: "interactive_games", status: "disponible" },
  { id: "eq20", name: "Sensor de Velocidad", category: "interactive_games", status: "en_uso" },
  { id: "eq21", name: "VR Kit (10 lentes)", category: "vr_ar", status: "disponible" },
  { id: "eq22", name: "Meta Human Atlas", category: "vr_ar", status: "reservado" },
  { id: "eq23", name: "Meta Human Bit", category: "vr_ar", status: "disponible" },
  { id: "eq24", name: "Holograma", category: "vr_ar", status: "en_uso" },
  { id: "eq25", name: "Robot Sketch", category: "vr_ar", status: "disponible" },
  { id: "eq26", name: "Pantalla Interactiva", category: "screens", status: "disponible" },
  { id: "eq27", name: "Live Streaming Kit", category: "screens", status: "en_uso" },
  { id: "eq28", name: "Neon Room", category: "screens", status: "mantenimiento" },
  { id: "eq29", name: "Coffee Print #1", category: "food_bev", status: "disponible" },
  { id: "eq30", name: "Coffee Print #2", category: "food_bev", status: "disponible" },
  { id: "eq31", name: "Barra de Matcha", category: "food_bev", status: "disponible" },
  { id: "eq32", name: "Cotton Candy Machine", category: "food_bev", status: "mantenimiento" },
];

const STATUS_CONFIG = {
  disponible: { emoji: "\u{1F7E2}", label: "Disponible", color: "bg-green-100 text-green-700" },
  reservado: { emoji: "\u{1F7E1}", label: "Reservado", color: "bg-yellow-100 text-yellow-700" },
  en_uso: { emoji: "\u{1F534}", label: "En uso", color: "bg-red-100 text-red-700" },
  mantenimiento: { emoji: "\u26AB", label: "Mantenimiento", color: "bg-gray-100 text-gray-700" },
};

// ─── Date Helpers ──────────────────────────────────────────
function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatShort(d: Date): string {
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function getDayName(d: Date): string {
  return d.toLocaleDateString("es-MX", { weekday: "short" }).toUpperCase();
}

// ─── Main Component ────────────────────────────────────────
export default function ResourcesPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const today = new Date();
  const currentMonday = useMemo(() => {
    const monday = getMonday(today);
    return addDays(monday, weekOffset * 7);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentMonday, i));
  }, [currentMonday]);

  const weekLabel = `${formatShort(weekDays[0])} - ${formatShort(weekDays[6])}`;

  // Get bookings for the current week grouped by category
  const bookingsByCategory = useMemo(() => {
    const weekStart = formatDate(weekDays[0]);
    const weekEnd = formatDate(addDays(weekDays[6], 1));

    const result: Record<EquipmentCategory, { event: CalendarEvent; category: EquipmentCategory; dayStart: number; daySpan: number }[]> = {
      photo_booths: [],
      interactive_games: [],
      vr_ar: [],
      screens: [],
      food_bev: [],
    };

    CALENDAR_EVENTS.forEach((event) => {
      if (event.endDate < weekStart || event.startDate > weekEnd) return;

      const cat = getCategory(event.producto);
      const eventStart = new Date(event.startDate + "T00:00:00");
      const eventEnd = new Date(event.endDate + "T00:00:00");
      const wStart = weekDays[0];
      const wEnd = addDays(weekDays[6], 1);

      const clampStart = eventStart < wStart ? wStart : eventStart;
      const clampEnd = eventEnd > wEnd ? wEnd : eventEnd;

      const dayStart = Math.floor((clampStart.getTime() - wStart.getTime()) / (1000 * 60 * 60 * 24));
      const daySpan = Math.max(1, Math.ceil((clampEnd.getTime() - clampStart.getTime()) / (1000 * 60 * 60 * 24)));

      result[cat].push({ event, category: cat, dayStart, daySpan });
    });

    return result;
  }, [weekDays]);

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 min-w-0 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarRange className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Calendario de Recursos</h1>
              <p className="text-xs text-gray-500">Disponibilidad de equipos y asignaciones</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between bg-white rounded-lg border px-4 py-2">
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </Button>
          <div className="text-center">
            <span className="text-sm font-semibold text-gray-900">{weekLabel}</span>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="ml-2 text-xs text-blue-600 hover:underline"
              >
                Hoy
              </button>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
            Siguiente <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 border-r">
                    Categoria
                  </th>
                  {weekDays.map((day, i) => {
                    const isToday = formatDate(day) === formatDate(today);
                    return (
                      <th
                        key={i}
                        className={`px-2 py-2 text-center text-xs font-medium border-r last:border-r-0 ${
                          isToday ? "bg-blue-50 text-blue-700" : "text-gray-500"
                        } ${i >= 5 ? "bg-gray-100/50" : ""}`}
                      >
                        <div>{getDayName(day)}</div>
                        <div className={`text-sm font-bold ${isToday ? "text-blue-700" : "text-gray-700"}`}>
                          {day.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat) => {
                  const bookings = bookingsByCategory[cat.key];
                  const hasBookings = bookings.length > 0;
                  const Icon = cat.icon;
                  return (
                    <tr key={cat.key} className="border-b last:border-b-0 hover:bg-gray-50/50">
                      <td className="px-3 py-3 border-r">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                        </div>
                      </td>
                      {/* 7 day cells */}
                      {weekDays.map((_, dayIndex) => {
                        const isToday = formatDate(weekDays[dayIndex]) === formatDate(today);
                        const dayBookings = bookings.filter(
                          (b) => dayIndex >= b.dayStart && dayIndex < b.dayStart + b.daySpan
                        );
                        return (
                          <td
                            key={dayIndex}
                            className={`px-1 py-1 border-r last:border-r-0 align-top h-16 ${
                              isToday ? "bg-blue-50/30" : ""
                            } ${dayIndex >= 5 ? "bg-gray-50/30" : ""}`}
                          >
                            {dayBookings.map((b, bi) => {
                              const pmColor = PM_COLORS[b.event.pm] || "bg-gray-400";
                              const isStart = dayIndex === b.dayStart;
                              return (
                                <div
                                  key={`${b.event.id}-${bi}`}
                                  className={`${pmColor} text-white text-[9px] leading-tight px-1 py-0.5 mb-0.5 ${
                                    isStart ? "rounded-l" : ""
                                  } ${dayIndex === b.dayStart + b.daySpan - 1 ? "rounded-r" : ""}`}
                                  title={`${b.event.cliente} | ${b.event.pm} - ${b.event.producto}\n${formatCurrency(b.event.dealAmount)}`}
                                >
                                  {isStart && (
                                    <span className="font-medium truncate block">
                                      {b.event.cliente}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {!hasBookings && dayIndex === 0 && (
                              <span className="text-[9px] text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* PM Color Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="font-medium">PM:</span>
          {Object.entries(PM_COLORS).map(([pm, color]) => (
            <div key={pm} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
              <span>{pm}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Sidebar */}
      {sidebarOpen && (
        <div className="w-72 border-l bg-gray-50 p-4 space-y-4 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Inventario</h2>
            <div className="flex items-center gap-1.5 text-[10px]">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <span key={key} title={cfg.label}>{cfg.emoji}</span>
              ))}
            </div>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((status) => {
              const cfg = STATUS_CONFIG[status];
              const count = EQUIPMENT.filter((e) => e.status === status).length;
              return (
                <div key={status} className={`rounded-lg px-2 py-1.5 ${cfg.color}`}>
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-[10px]">{cfg.emoji} {cfg.label}</div>
                </div>
              );
            })}
          </div>

          {/* Equipment List by Category */}
          {CATEGORIES.map((cat) => {
            const items = EQUIPMENT.filter((e) => e.category === cat.key);
            if (items.length === 0) return null;
            return (
              <div key={cat.key}>
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  {cat.label}
                </h3>
                <div className="space-y-0.5">
                  {items.map((eq) => {
                    const cfg = STATUS_CONFIG[eq.status];
                    return (
                      <div
                        key={eq.id}
                        className="flex items-center justify-between px-2 py-1 rounded bg-white text-xs"
                      >
                        <span className="text-gray-700 truncate">{eq.name}</span>
                        <Badge className={`${cfg.color} text-[9px] shrink-0`}>
                          {cfg.emoji} {cfg.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
