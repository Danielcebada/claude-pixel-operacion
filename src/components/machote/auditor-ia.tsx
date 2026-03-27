"use client";

import { useState, useEffect } from "react";
import { formatCurrency, getMarginColor } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot, AlertTriangle, CheckCircle, TrendingDown, TrendingUp,
  DollarSign, Clock, Shield, RefreshCw, ChevronDown, ChevronRight,
} from "lucide-react";

type AlertLevel = "critical" | "warning" | "info" | "ok";

interface AuditAlert {
  id: string;
  level: AlertLevel;
  category: string;
  title: string;
  detail: string;
  recommendation: string;
  metric?: string;
}

interface AuditorProps {
  projectName: string;
  ventaPresupuesto: number;
  ventaReal: number;
  costosPresupuesto: number;
  costosReal: number;
  gastosPresupuesto: number;
  gastosReal: number;
  viaticosVenta: number;
  viaticosGasto: number;
  utilidadBruta: number;
  utilidadNeta: number;
  utilidadTotal: number;
  pctUtilidad: number;
  totalFacturado: number;
  totalCobrado: number;
  totalPendiente: number;
  comisionesTotal: number;
  eventDate: string;
  status: string;
}

const LEVEL_CONFIG: Record<AlertLevel, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  critical: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  info: {
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  ok: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
};

function analyzeProject(props: AuditorProps): AuditAlert[] {
  const alerts: AuditAlert[] = [];
  const {
    ventaPresupuesto, ventaReal, costosPresupuesto, costosReal,
    gastosPresupuesto, gastosReal, viaticosVenta, viaticosGasto,
    utilidadBruta, utilidadNeta, utilidadTotal, pctUtilidad,
    totalFacturado, totalCobrado, totalPendiente, comisionesTotal,
    eventDate, status,
  } = props;

  // 1. Margin analysis
  if (pctUtilidad < 0) {
    alerts.push({
      id: "margin-negative", level: "critical", category: "Rentabilidad",
      title: "Proyecto con perdida",
      detail: `El margen es ${pctUtilidad}%. Este proyecto esta generando perdida neta de ${formatCurrency(Math.abs(utilidadTotal))}.`,
      recommendation: "Revisar inmediatamente los costos y gastos. Considerar renegociar con el cliente o reducir scope.",
      metric: `${pctUtilidad}%`,
    });
  } else if (pctUtilidad < 15) {
    alerts.push({
      id: "margin-low", level: "critical", category: "Rentabilidad",
      title: "Margen criticamente bajo",
      detail: `El margen de ${pctUtilidad}% esta por debajo del minimo aceptable (15%). Despues de comisiones la utilidad real sera minima.`,
      recommendation: "Auditar cada linea de costo. Verificar si se pueden eliminar gastos extras o renegociar costos con proveedores.",
      metric: `${pctUtilidad}%`,
    });
  } else if (pctUtilidad < 30) {
    alerts.push({
      id: "margin-medium", level: "warning", category: "Rentabilidad",
      title: "Margen por debajo del objetivo",
      detail: `El margen de ${pctUtilidad}% esta por debajo del objetivo de 30%. El proyecto es rentable pero no alcanza el estandar.`,
      recommendation: "Para futuros proyectos similares, considerar ajustar el pricing o reducir costos operativos.",
      metric: `${pctUtilidad}%`,
    });
  } else {
    alerts.push({
      id: "margin-ok", level: "ok", category: "Rentabilidad",
      title: "Margen saludable",
      detail: `El margen de ${pctUtilidad}% esta dentro o por encima del rango objetivo (30%+).`,
      recommendation: "Mantener esta estructura de costos como referencia para proyectos similares.",
      metric: `${pctUtilidad}%`,
    });
  }

  // 2. Cost overrun analysis
  const costOverrun = (costosReal + gastosReal) - (costosPresupuesto + gastosPresupuesto);
  const costOverrunPct = (costosPresupuesto + gastosPresupuesto) > 0
    ? Math.round((costOverrun / (costosPresupuesto + gastosPresupuesto)) * 100)
    : 0;

  if (costOverrunPct > 20) {
    alerts.push({
      id: "cost-overrun-high", level: "critical", category: "Control de Costos",
      title: `Sobrecosto del ${costOverrunPct}%`,
      detail: `Los costos reales exceden el presupuesto por ${formatCurrency(costOverrun)} (${costOverrunPct}% sobre presupuesto).`,
      recommendation: "Identificar las lineas con mayor desviacion. Implementar controles de aprobacion para gastos que excedan el 10% del presupuesto.",
      metric: `+${costOverrunPct}%`,
    });
  } else if (costOverrunPct > 10) {
    alerts.push({
      id: "cost-overrun-medium", level: "warning", category: "Control de Costos",
      title: `Costos ${costOverrunPct}% sobre presupuesto`,
      detail: `Hay una desviacion de ${formatCurrency(costOverrun)} entre lo presupuestado y lo real.`,
      recommendation: "Revisar las lineas de gasto con mayor varianza. Ajustar presupuestos futuros basandose en datos reales.",
      metric: `+${costOverrunPct}%`,
    });
  } else if (costOverrun < 0) {
    alerts.push({
      id: "cost-savings", level: "ok", category: "Control de Costos",
      title: `Ahorro de ${formatCurrency(Math.abs(costOverrun))}`,
      detail: `Los costos reales fueron ${Math.abs(costOverrunPct)}% menor al presupuesto. Buena gestion de recursos.`,
      recommendation: "Documentar las practicas que generaron este ahorro para replicar en futuros proyectos.",
      metric: `${costOverrunPct}%`,
    });
  }

  // 3. Viaticos analysis
  if (viaticosVenta > 0) {
    const viaticosMargin = viaticosVenta - viaticosGasto;
    if (viaticosMargin < 0) {
      alerts.push({
        id: "viaticos-loss", level: "warning", category: "Viaticos",
        title: "Perdida en viaticos",
        detail: `Se cobro ${formatCurrency(viaticosVenta)} pero se gasto ${formatCurrency(viaticosGasto)}. Perdida de ${formatCurrency(Math.abs(viaticosMargin))}.`,
        recommendation: "Revisar la cotizacion de viaticos. Ajustar el markup para cubrir gastos reales + margen.",
        metric: formatCurrency(viaticosMargin),
      });
    }
  }

  // 4. Payment/collection analysis
  if (totalPendiente > 0 && ventaReal > 0) {
    const pctPendiente = Math.round((totalPendiente / totalFacturado) * 100);
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    const daysSinceEvent = Math.floor((today.getTime() - eventDateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceEvent > 45 && pctPendiente > 30) {
      alerts.push({
        id: "collection-overdue", level: "critical", category: "Cobranza",
        title: `${pctPendiente}% pendiente de cobro (${daysSinceEvent} dias)`,
        detail: `Han pasado ${daysSinceEvent} dias desde el evento y aun se tiene ${formatCurrency(totalPendiente)} pendiente de cobro.`,
        recommendation: "Escalar a finanzas. Verificar en Odoo el estatus de las facturas y contactar al cliente para aclarar el pago.",
        metric: `${daysSinceEvent}d`,
      });
    } else if (pctPendiente > 50) {
      alerts.push({
        id: "collection-pending", level: "warning", category: "Cobranza",
        title: `${pctPendiente}% del monto pendiente de cobro`,
        detail: `Se ha cobrado ${formatCurrency(totalCobrado)} de ${formatCurrency(totalFacturado)}. Faltan ${formatCurrency(totalPendiente)}.`,
        recommendation: "Dar seguimiento al calendario de pagos en Odoo.",
        metric: `${pctPendiente}%`,
      });
    }
  }

  // 5. Commission vs profit check
  if (comisionesTotal > 0 && utilidadTotal > 0) {
    const comisionPct = Math.round((comisionesTotal / utilidadTotal) * 100);
    if (comisionPct > 50) {
      alerts.push({
        id: "commission-high", level: "warning", category: "Comisiones",
        title: `Comisiones representan ${comisionPct}% de la utilidad`,
        detail: `Las comisiones de ${formatCurrency(comisionesTotal)} consumen mas de la mitad de la utilidad total (${formatCurrency(utilidadTotal)}).`,
        recommendation: "Revisar las reglas de comision para este tipo de proyecto. Considerar ajustar porcentajes o bases de calculo.",
        metric: `${comisionPct}%`,
      });
    }
  }

  // 6. Revenue vs budget
  if (ventaReal > 0 && ventaPresupuesto > 0) {
    const revVariance = ventaReal - ventaPresupuesto;
    const revVariancePct = Math.round((revVariance / ventaPresupuesto) * 100);
    if (revVariancePct > 5) {
      alerts.push({
        id: "revenue-up", level: "info", category: "Ingresos",
        title: `Venta ${revVariancePct}% arriba del presupuesto`,
        detail: `Se vendio ${formatCurrency(revVariance)} mas de lo presupuestado. Buen upsell o negociacion.`,
        recommendation: "Documentar que se vendio adicional para replicar en proyectos futuros.",
        metric: `+${revVariancePct}%`,
      });
    }
  }

  // 7. Missing data check
  if (status === "operado" && ventaReal === 0) {
    alerts.push({
      id: "missing-real", level: "critical", category: "Datos Incompletos",
      title: "Proyecto operado sin datos reales",
      detail: "El proyecto esta marcado como operado pero no se han capturado los montos reales.",
      recommendation: "El PM debe capturar los datos reales de venta, costos y gastos lo antes posible.",
    });
  }

  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2, ok: 3 };
    return order[a.level] - order[b.level];
  });
}

export function AuditorIA(props: AuditorProps) {
  const [alerts, setAlerts] = useState<AuditAlert[]>([]);
  const [analyzing, setAnalyzing] = useState(true);
  const [expandedAlerts, setExpandedAlerts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setAlerts(analyzeProject(props));
      setAnalyzing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleAlert = (id: string) => {
    setExpandedAlerts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const criticals = alerts.filter((a) => a.level === "critical").length;
  const warnings = alerts.filter((a) => a.level === "warning").length;
  const oks = alerts.filter((a) => a.level === "ok").length;

  const overallScore = criticals > 0 ? "Requiere Atencion" : warnings > 0 ? "Revisar" : "Saludable";
  const overallColor = criticals > 0 ? "text-red-600" : warnings > 0 ? "text-yellow-600" : "text-green-600";
  const overallBg = criticals > 0 ? "bg-red-500" : warnings > 0 ? "bg-yellow-500" : "bg-green-500";

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">Auditor IA</CardTitle>
              <p className="text-xs text-gray-500">Analisis automatico de rentabilidad y riesgos</p>
            </div>
          </div>
          {!analyzing && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {criticals > 0 && <Badge variant="secondary" className="bg-red-100 text-red-700">{criticals} criticos</Badge>}
                {warnings > 0 && <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">{warnings} alertas</Badge>}
                {oks > 0 && <Badge variant="secondary" className="bg-green-100 text-green-700">{oks} ok</Badge>}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${overallBg}`}>
                {overallScore}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {analyzing ? (
          <div className="flex items-center justify-center py-8 gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">Analizando proyecto {props.projectName}...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => {
              const config = LEVEL_CONFIG[alert.level];
              const isExpanded = expandedAlerts[alert.id];
              return (
                <div
                  key={alert.id}
                  className={`border rounded-lg ${config.border} ${config.bg} cursor-pointer transition-all`}
                  onClick={() => toggleAlert(alert.id)}
                >
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <span className={config.color}>{config.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${config.color}`}>{alert.title}</span>
                        <Badge variant="secondary" className="text-[10px] bg-white/60">{alert.category}</Badge>
                      </div>
                    </div>
                    {alert.metric && (
                      <span className={`text-sm font-mono font-bold ${config.color}`}>{alert.metric}</span>
                    )}
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-3 pt-0 border-t border-white/50">
                      <p className="text-sm text-gray-700 mt-2">{alert.detail}</p>
                      <div className="mt-2 flex items-start gap-2 bg-white/60 rounded p-2">
                        <Shield className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-600"><strong>Recomendacion:</strong> {alert.recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
