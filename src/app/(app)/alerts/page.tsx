"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Zap,
  X,
  Eye,
  EyeOff,
  Filter,
  Clock,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Wrench,
  FileText,
  Target,
  Flame,
  Award,
  UserCheck,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/types";

// ─── TYPES ─────────────────────────────────────────
type AlertCategory = "critica" | "advertencia" | "informativa" | "auditor_ia";
type AlertStatus = "unread" | "read" | "dismissed";

interface Alert {
  id: string;
  category: AlertCategory;
  title: string;
  description: string;
  timestamp: string;
  status: AlertStatus;
  project?: string;
  amount?: number;
  actionLabel?: string;
}

// ─── CATEGORY CONFIG ───────────────────────────────
const CATEGORY_CONFIG: Record<AlertCategory, { label: string; icon: typeof AlertTriangle; color: string; bg: string; badgeBg: string }> = {
  critica: { label: "Criticas", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", badgeBg: "bg-red-100 text-red-700" },
  advertencia: { label: "Advertencias", icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50", badgeBg: "bg-yellow-100 text-yellow-700" },
  informativa: { label: "Informativas", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", badgeBg: "bg-green-100 text-green-700" },
  auditor_ia: { label: "Auditor IA", icon: Zap, color: "text-purple-600", bg: "bg-purple-50", badgeBg: "bg-purple-100 text-purple-700" },
};

const FILTER_OPTIONS: { value: "todas" | AlertCategory; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "critica", label: "Criticas" },
  { value: "advertencia", label: "Advertencias" },
  { value: "informativa", label: "Informativas" },
  { value: "auditor_ia", label: "Auditor IA" },
];

// ─── MOCK ALERTS (20 realistic Q1 2026 alerts) ────
const INITIAL_ALERTS: Alert[] = [
  // Criticas (4)
  {
    id: "c1",
    category: "critica",
    title: "Margen critico en proyecto Samsung Lanzamiento Galaxy",
    description: "El proyecto tiene un margen del 12.3%, por debajo del minimo del 15%. Costos de operacion excedieron presupuesto por materiales adicionales.",
    timestamp: "2026-03-26T09:15:00",
    status: "unread",
    project: "Samsung Lanzamiento Galaxy",
    amount: 180000,
  },
  {
    id: "c2",
    category: "critica",
    title: "Factura vencida > 90 dias - Samsung Mexico",
    description: "Factura #F-2025-1847 por $180,000 MXN tiene 97 dias de atraso. Ultimo contacto hace 15 dias sin respuesta.",
    timestamp: "2026-03-25T14:30:00",
    status: "unread",
    amount: 180000,
  },
  {
    id: "c3",
    category: "critica",
    title: "Gasto real > 130% presupuesto - Evento Chipichape Cancun",
    description: "Gastos reales del proyecto Chipichape alcanzaron $156,000 vs presupuesto de $115,000 (135.6%). Viaticos y ubers excedieron estimacion.",
    timestamp: "2026-03-24T11:00:00",
    status: "unread",
    project: "Chipichape Cancun",
    amount: 156000,
  },
  {
    id: "c4",
    category: "critica",
    title: "PepsiCo Mexico - factura vencida 90+ dias",
    description: "Factura #F-2025-1923 por $80,000 MXN vencida hace 105 dias. Cliente VIP sin actividad reciente. Escalar a direccion comercial.",
    timestamp: "2026-03-23T16:45:00",
    status: "read",
    amount: 80000,
  },
  // Advertencias (5)
  {
    id: "w1",
    category: "advertencia",
    title: "Presupuesto sin llenar - Evento Bimbo 2 de Abril",
    description: "El evento de Grupo Bimbo esta a 7 dias y no se ha llenado el presupuesto de costos. Se requiere completar antes de operar.",
    timestamp: "2026-03-26T08:00:00",
    status: "unread",
    project: "Bimbo Activacion Abril",
  },
  {
    id: "w2",
    category: "advertencia",
    title: "Comision pendiente de calcular - Maria Gaytan Febrero",
    description: "Las comisiones de Maria Gaytan para Febrero ($351,073 en deals cerrados) no se han calculado. Fecha limite de pago: 31 de Marzo.",
    timestamp: "2026-03-25T10:00:00",
    status: "unread",
    amount: 351073,
  },
  {
    id: "w3",
    category: "advertencia",
    title: "Cotizacion expirada sin respuesta - Heineken Summer Fest",
    description: "La cotizacion QT-2026-0089 para Heineken Summer Fest ($320,000) vencio hace 5 dias sin respuesta del cliente.",
    timestamp: "2026-03-24T09:30:00",
    status: "unread",
    amount: 320000,
  },
  {
    id: "w4",
    category: "advertencia",
    title: "Equipo sin mantenimiento programado - Glambot #3",
    description: "El Glambot #3 lleva 45 dias sin mantenimiento preventivo. Siguiente evento programado: 5 de Abril. Programar revision.",
    timestamp: "2026-03-23T15:00:00",
    status: "read",
  },
  {
    id: "w5",
    category: "advertencia",
    title: "Cerveceria Modelo - saldo atrasado 31-60 dias",
    description: "Cerveceria Modelo tiene $250,000 MXN en el bucket 31-60 dias. Contactar antes de que pase a 61-90.",
    timestamp: "2026-03-22T13:00:00",
    status: "read",
    amount: 250000,
  },
  // Informativas (5)
  {
    id: "i1",
    category: "informativa",
    title: "Proyecto finalizado exitosamente - Liverpool Fashion Week",
    description: "El evento Liverpool Fashion Week se cerro con margen del 78.4%. Cliente satisfecho, evaluo 9/10 en encuesta post-evento.",
    timestamp: "2026-03-25T18:00:00",
    status: "unread",
    project: "Liverpool Fashion Week",
  },
  {
    id: "i2",
    category: "informativa",
    title: "Meta de vendedora alcanzada - Pricila Vargas",
    description: "Pricila Vargas alcanzo el 112% de su meta mensual ($1,344,000 de $1,200,000 objetivo). Tercer mes consecutivo superando meta.",
    timestamp: "2026-03-24T17:00:00",
    status: "read",
    amount: 1344000,
  },
  {
    id: "i3",
    category: "informativa",
    title: "Nuevo cliente recurrente - Kimberly-Clark (2da compra)",
    description: "Kimberly-Clark realizo su segundo evento en 3 meses. Candidato a contrato preferencial. Vendedor: Daniel Cebada.",
    timestamp: "2026-03-23T12:00:00",
    status: "read",
  },
  {
    id: "i4",
    category: "informativa",
    title: "Margen del mes > objetivo 80% alcanzado",
    description: "El margen promedio de Marzo se ubica en 82.1%, superando el objetivo del 80%. 23 de 28 proyectos sobre el target.",
    timestamp: "2026-03-22T10:00:00",
    status: "read",
  },
  {
    id: "i5",
    category: "informativa",
    title: "Revenue Q1 supera $12.9M - record historico",
    description: "Con $12,916,548 en Q1 2026, se supero el record anterior de Q4 2025 ($8.2M) por un 57%. Febrero fue el mes mas fuerte.",
    timestamp: "2026-03-21T09:00:00",
    status: "read",
    amount: 12916548,
  },
  // Auditor IA (6)
  {
    id: "a1",
    category: "auditor_ia",
    title: "Viaticos anomalos - Proyecto Chipichape Cancun",
    description: "El proyecto Chipichape tiene viaticos 35% arriba del promedio para eventos en Cancun. Revisar rubros de alimentacion y transporte local.",
    timestamp: "2026-03-26T07:00:00",
    status: "unread",
    project: "Chipichape Cancun",
  },
  {
    id: "a2",
    category: "auditor_ia",
    title: "Top vendedora consistente - Maria Gaytan",
    description: "Maria Gaytan lleva 3 meses consecutivos como top vendedora en deals recurrentes. Considerar incentivo adicional o reconocimiento.",
    timestamp: "2026-03-25T07:00:00",
    status: "unread",
  },
  {
    id: "a3",
    category: "auditor_ia",
    title: "Margen promedio en descenso",
    description: "El margen promedio bajo de 82% a 76% este mes - revisar gastos de operacion. Los rubros con mayor incremento: gasolina (+22%) y ubers (+18%).",
    timestamp: "2026-03-24T07:00:00",
    status: "unread",
  },
  {
    id: "a4",
    category: "auditor_ia",
    title: "Candidato a contrato anual - TKL Group",
    description: "TKL es candidato a contrato anual - 4 eventos en 6 meses con ticket promedio de $285,000. Contactar para propuesta de volumen.",
    timestamp: "2026-03-23T07:00:00",
    status: "read",
    amount: 285000,
  },
  {
    id: "a5",
    category: "auditor_ia",
    title: "Patron de pagos detectado - Nestle Mexico",
    description: "Nestle Mexico paga consistentemente en dia 45-50. Ajustar terminos de pago a Net 45 para mejorar proyeccion de cashflow.",
    timestamp: "2026-03-22T07:00:00",
    status: "read",
  },
  {
    id: "a6",
    category: "auditor_ia",
    title: "Oportunidad de cross-sell detectada",
    description: "Coca-Cola FEMSA solo contrata 360 y Green Screen. Con base en su perfil, son candidatos para Glambot y Photo IA. Revenue potencial: +$180,000/evento.",
    timestamp: "2026-03-21T07:00:00",
    status: "read",
    amount: 180000,
  },
];

// ─── HELPERS ───────────────────────────────────────
function formatTimeAgo(timestamp: string): string {
  const now = new Date("2026-03-26T12:00:00");
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Hace minutos";
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function getCategoryIcon(category: AlertCategory) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  return <Icon className={`w-4 h-4 ${config.color}`} />;
}

// ─── MAIN PAGE ─────────────────────────────────────
export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [filter, setFilter] = useState<"todas" | AlertCategory>("todas");

  const filteredAlerts = filter === "todas" ? alerts.filter((a) => a.status !== "dismissed") : alerts.filter((a) => a.category === filter && a.status !== "dismissed");

  const unreadCount = alerts.filter((a) => a.status === "unread").length;
  const unreadByCategory = (cat: AlertCategory) => alerts.filter((a) => a.category === cat && a.status === "unread").length;

  const toggleRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === "unread" ? "read" : "unread" } : a))
    );
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "dismissed" as AlertStatus } : a)));
  };

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => (a.status === "unread" ? { ...a, status: "read" as AlertStatus } : a)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Centro de Alertas
          </h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard del Auditor IA - Q1 2026</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge className="bg-red-100 text-red-700 text-sm px-3 py-1">
              {unreadCount} sin leer
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs">
            <Eye className="w-3.5 h-3.5 mr-1" />
            Marcar todo leido
          </Button>
        </div>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.entries(CATEGORY_CONFIG) as [AlertCategory, typeof CATEGORY_CONFIG.critica][]).map(([key, config]) => {
          const count = alerts.filter((a) => a.category === key && a.status !== "dismissed").length;
          const unread = unreadByCategory(key);
          return (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? "todas" : key)}
              className={`text-left transition-all rounded-xl border-2 p-4 ${
                filter === key ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${config.bg}`}>
                  <config.icon className={`w-4 h-4 ${config.color}`} />
                </div>
                {unread > 0 && (
                  <Badge className={`${config.badgeBg} text-[10px] px-1.5`}>{unread}</Badge>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900">{config.label}</p>
              <p className="text-xs text-gray-500">{count} alertas</p>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === opt.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
            {opt.value !== "todas" && unreadByCategory(opt.value as AlertCategory) > 0 && (
              <span className="ml-1.5 bg-white/20 rounded-full px-1.5 text-[10px]">
                {unreadByCategory(opt.value as AlertCategory)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alert Timeline */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No hay alertas en esta categoria</p>
            </CardContent>
          </Card>
        )}

        {filteredAlerts.map((alert) => {
          const config = CATEGORY_CONFIG[alert.category];
          return (
            <Card
              key={alert.id}
              className={`transition-all ${
                alert.status === "unread" ? "border-l-4 shadow-sm" : "opacity-80"
              }`}
              style={alert.status === "unread" ? { borderLeftColor: alert.category === "critica" ? "#dc2626" : alert.category === "advertencia" ? "#d97706" : alert.category === "informativa" ? "#16a34a" : "#9333ea" } : undefined}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${config.bg} shrink-0 mt-0.5`}>
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${config.badgeBg} text-[10px]`}>{config.label}</Badge>
                      {alert.status === "unread" && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(alert.timestamp)}
                      </span>
                    </div>
                    <h3 className={`text-sm font-semibold text-gray-900 ${alert.status === "unread" ? "" : "font-medium"}`}>
                      {alert.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{alert.description}</p>

                    {/* Metadata row */}
                    <div className="flex items-center gap-3 mt-2">
                      {alert.project && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {alert.project}
                        </span>
                      )}
                      {alert.amount && (
                        <span className="text-[10px] font-mono text-gray-500">
                          {formatCurrency(alert.amount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleRead(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title={alert.status === "unread" ? "Marcar como leido" : "Marcar como no leido"}
                    >
                      {alert.status === "unread" ? (
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Descartar"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
