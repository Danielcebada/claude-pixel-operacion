"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  CalendarDays,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  Plane,
  Clock,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/types";
import { CALENDAR_EVENTS, getWeeklyProjection, type CalendarEvent } from "@/lib/calendar-ops";

function EventRow({ event }: { event: CalendarEvent }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"
      >
        {expanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate">{event.cliente}</span>
            {event.zona === "Foraneo" && (
              <Badge className="bg-orange-100 text-orange-700 text-[9px] gap-0.5">
                <Plane className="w-2.5 h-2.5" /> Foraneo
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-gray-400 truncate">{event.producto}</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
          <Clock className="w-3 h-3" />
          {event.dias}d
        </div>
        <span className="text-xs font-mono text-gray-500 w-20 text-right shrink-0">{formatCurrency(event.dealAmount)}</span>
        <span className="text-xs font-mono text-red-600 font-bold w-20 text-right shrink-0">{formatCurrency(event.cashNecesario)}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 pl-10 space-y-2">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-gray-400">Venta Deal</p>
              <p className="font-mono font-bold">{formatCurrency(event.dealAmount)}</p>
            </div>
            <div className="bg-red-50 rounded-lg px-3 py-2">
              <p className="text-red-400">Costo Op. (20%)</p>
              <p className="font-mono font-bold text-red-600">{formatCurrency(event.costoOperativo20)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg px-3 py-2">
              <p className="text-orange-400">Viaticos Est.</p>
              <p className="font-mono font-bold text-orange-600">{formatCurrency(event.viaticosEstimado)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <Users className="w-3 h-3" /> PM: {event.pm}
            <span className="mx-1">•</span>
            <CalendarDays className="w-3 h-3" /> {event.startDate} → {event.endDate}
          </div>
          {event.description && (
            <p className="text-[11px] text-gray-400 italic">{event.description}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CashFlowPage() {
  const weeks = getWeeklyProjection();
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({ [weeks[0]?.weekLabel]: true });

  const toggleWeek = (label: string) => {
    setExpandedWeeks(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Totals
  const totalDeal = CALENDAR_EVENTS.reduce((s, e) => s + e.dealAmount, 0);
  const totalCosto = CALENDAR_EVENTS.reduce((s, e) => s + e.costoOperativo20, 0);
  const totalViaticos = CALENDAR_EVENTS.reduce((s, e) => s + e.viaticosEstimado, 0);
  const totalCash = CALENDAR_EVENTS.reduce((s, e) => s + e.cashNecesario, 0);
  const totalEventos = CALENDAR_EVENTS.length;
  const foraneos = CALENDAR_EVENTS.filter(e => e.zona === "Foraneo").length;

  // Find heaviest week
  const heaviestWeek = weeks.reduce((max, w) => w.totalCashNecesario > max.totalCashNecesario ? w : max, weeks[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Flow Operativo</h1>
          <p className="text-sm text-gray-500 mt-1">Proyeccion de efectivo necesario para operar - Google Calendar + HubSpot</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 gap-1 text-[10px]">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Google Calendar Live
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <CalendarDays className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase">Eventos</p>
            <p className="text-xl font-bold">{totalEventos}</p>
            <p className="text-[10px] text-gray-400">{foraneos} foraneos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase">Revenue Esperado</p>
            <p className="text-xl font-bold">{formatCurrency(totalDeal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <TrendingUp className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase">Costo Op. (20%)</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalCosto)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Plane className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase">Viaticos Est.</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(totalViaticos)}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-4 pb-3 text-center">
            <Wallet className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <p className="text-[10px] text-red-500 uppercase font-bold">Cash Necesario</p>
            <p className="text-xl font-bold text-red-700">{formatCurrency(totalCash)}</p>
            <p className="text-[10px] text-red-400">Proximas 5 semanas</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4 pb-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-[10px] text-green-500 uppercase">Utilidad Proy.</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalDeal - totalCash)}</p>
            <p className="text-[10px] text-green-400">{Math.round(((totalDeal - totalCash) / totalDeal) * 100)}% margen</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for heaviest week */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-800">Semana mas pesada: {heaviestWeek.weekLabel}</p>
          <p className="text-xs text-amber-700 mt-0.5">
            {heaviestWeek.eventCount} eventos, {heaviestWeek.foraneoCount} foraneos. Necesitas **{formatCurrency(heaviestWeek.totalCashNecesario)}** en efectivo para operar esa semana.
          </p>
        </div>
      </div>

      {/* Weekly Timeline */}
      <div className="space-y-3">
        {weeks.map((week) => {
          const isExpanded = expandedWeeks[week.weekLabel] ?? false;
          const cashPctOfMax = Math.round((week.totalCashNecesario / heaviestWeek.totalCashNecesario) * 100);

          return (
            <Card key={week.weekLabel} className="overflow-hidden">
              {/* Week Header */}
              <button
                onClick={() => toggleWeek(week.weekLabel)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{week.weekLabel}</span>
                    <Badge variant="secondary" className="text-[10px]">{week.eventCount} eventos</Badge>
                    {week.foraneoCount > 0 && (
                      <Badge className="bg-orange-100 text-orange-700 text-[10px] gap-0.5">
                        <Plane className="w-2.5 h-2.5" /> {week.foraneoCount} foraneo
                      </Badge>
                    )}
                  </div>
                  {/* Cash bar */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${cashPctOfMax >= 80 ? "bg-red-500" : cashPctOfMax >= 50 ? "bg-orange-400" : "bg-blue-400"}`}
                        style={{ width: `${cashPctOfMax}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">Revenue</p>
                  <p className="text-sm font-mono font-bold">{formatCurrency(week.totalDealAmount)}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-xs text-red-400">Cash necesario</p>
                  <p className="text-sm font-mono font-bold text-red-600">{formatCurrency(week.totalCashNecesario)}</p>
                </div>
              </button>

              {/* Week Events */}
              {isExpanded && (
                <div className="border-t">
                  {/* Column headers */}
                  <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-50 text-[10px] text-gray-400 font-medium uppercase">
                    <span className="w-3" />
                    <span className="flex-1">Evento</span>
                    <span className="w-8 text-center">Dias</span>
                    <span className="w-20 text-right">Deal</span>
                    <span className="w-20 text-right">Cash</span>
                  </div>
                  {week.events.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                  {/* Week totals */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 text-white text-xs font-bold">
                    <span className="w-3" />
                    <span className="flex-1">TOTAL SEMANA</span>
                    <span className="w-8" />
                    <span className="w-20 text-right font-mono">{formatCurrency(week.totalDealAmount)}</span>
                    <span className="w-20 text-right font-mono text-red-300">{formatCurrency(week.totalCashNecesario)}</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen de Cash Flow Operativo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Semana</th>
                <th className="px-4 py-2 text-center font-medium text-gray-500">Eventos</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Revenue</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Costo Op (20%)</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Viaticos</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Cash Necesario</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Utilidad Proy.</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {weeks.map((w) => (
                <tr key={w.weekLabel} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{w.weekLabel}</td>
                  <td className="px-4 py-2 text-center">
                    <Badge variant="secondary" className="font-mono">{w.eventCount}</Badge>
                  </td>
                  <td className="px-4 py-2 text-right font-mono">{formatCurrency(w.totalDealAmount)}</td>
                  <td className="px-4 py-2 text-right font-mono text-red-600">{formatCurrency(w.totalCostoOperativo)}</td>
                  <td className="px-4 py-2 text-right font-mono text-orange-600">{formatCurrency(w.totalViaticos)}</td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-red-700">{formatCurrency(w.totalCashNecesario)}</td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-green-600">{formatCurrency(w.totalDealAmount - w.totalCashNecesario)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-900 text-white font-bold">
                <td className="px-4 py-2">TOTAL</td>
                <td className="px-4 py-2 text-center">{totalEventos}</td>
                <td className="px-4 py-2 text-right font-mono">{formatCurrency(totalDeal)}</td>
                <td className="px-4 py-2 text-right font-mono">{formatCurrency(totalCosto)}</td>
                <td className="px-4 py-2 text-right font-mono">{formatCurrency(totalViaticos)}</td>
                <td className="px-4 py-2 text-right font-mono text-red-300">{formatCurrency(totalCash)}</td>
                <td className="px-4 py-2 text-right font-mono text-green-300">{formatCurrency(totalDeal - totalCash)}</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
