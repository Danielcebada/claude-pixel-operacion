"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { computeProfitability, formatCurrency, getMarginColor, getAnticipoStatus } from "@/lib/types";
import { Search, AlertCircle } from "lucide-react";

type FilterTab = "todos" | "pendiente" | "presupuesto_confirmado" | "en_operacion" | "operado" | "finalizado";

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

const statusColors: Record<string, string> = {
  pendiente: "bg-gray-100 text-gray-600",
  presupuesto_confirmado: "bg-orange-50 text-orange-600",
  en_operacion: "bg-blue-50 text-blue-600",
  operado: "bg-green-50 text-green-600",
  finalizado: "bg-gray-200 text-gray-500",
  cancelado: "bg-red-50 text-red-600",
};

const paymentLabels: Record<string, string> = {
  pagado_100: "Pagado",
  parcial: "Parcial",
  pendiente: "Pendiente",
};

const paymentColors: Record<string, string> = {
  pagado_100: "bg-green-50 text-green-600",
  parcial: "bg-yellow-50 text-yellow-600",
  pendiente: "bg-yellow-50 text-yellow-600",
};

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("todos");
  const [search, setSearch] = useState("");

  const projects = useMemo(() => {
    return MOCK_PROJECTS
      .map((p) => ({
        ...p,
        profit: computeProfitability(p.financials),
        anticipoStatus: getAnticipoStatus(p.anticipo_pagado),
      }))
      .sort((a, b) => {
        // Unpaid anticipo first (soft sort, not alarming)
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
    return result;
  }, [projects, activeTab, search]);

  // Projects with pending anticipo (alert, not block)
  const pendingAnticipoProjects = projects.filter((p) => !p.anticipo_pagado && p.presupuesto_confirmado);
  const totalPendienteAnticipo = pendingAnticipoProjects.reduce((s, p) => s + p.anticipo_requerido, 0);

  // Summary stats from filtered results
  const operados = filtered.filter((p) => p.financials.venta_real > 0);
  const totalVentaPresupuesto = filtered.reduce((s, p) => s + p.financials.venta_presupuesto, 0);
  const totalVentaReal = operados.reduce((s, p) => s + p.financials.venta_real, 0);
  const totalUtilidad = operados.reduce((s, p) => s + p.profit.utilidad_total, 0);

  // Tab counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: projects.length };
    for (const p of projects) {
      c[p.status] = (c[p.status] || 0) + 1;
    }
    return c;
  }, [projects]);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Proyectos</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {filtered.length} proyecto{filtered.length !== 1 ? "s" : ""}
          {activeTab !== "todos" ? ` ${TAB_CONFIG.find((t) => t.key === activeTab)?.label.toLowerCase()}` : ""}
        </p>
      </div>

      {/* Filter tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-gray-400">
                {counts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Buscar proyecto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Anticipo Pending Info Bar (soft alert, not blocking) */}
      {pendingAnticipoProjects.length > 0 && (
        <Link href="#" className="block">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-amber-100 transition-colors cursor-pointer">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                {pendingAnticipoProjects.length} proyecto{pendingAnticipoProjects.length !== 1 ? "s" : ""} con anticipo pendiente
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Total pendiente: {formatCurrency(totalPendienteAnticipo)} — Se notifico a Ventas y Administracion
              </p>
            </div>
            <span className="text-xs text-amber-500 font-medium">Ver detalle &rarr;</span>
          </div>
        </Link>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[280px]">Proyecto</th>
                <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Producto</th>
                <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Vendedor</th>
                <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">PM</th>
                <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-3 py-3 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">Venta</th>
                <th className="px-3 py-3 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-3 py-3 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">Pago</th>
                <th className="px-3 py-3 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">Anticipo</th>
                <th className="px-3 py-3 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const hasReal = p.financials.venta_real > 0;
                const anticipoBadge = p.anticipo_pagado
                  ? { label: "Pagado", color: "bg-green-50 text-green-600", dot: "bg-green-500" }
                  : { label: "Pendiente", color: "bg-amber-50 text-amber-600", dot: "bg-amber-400" };
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-2.5">
                      <Link href={`/projects/${p.id}`} className="block">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {p.deal_name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{p.product_type}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{p.vendedor_name}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{p.pm_name}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-400 tabular-nums">{p.event_date}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-sm font-mono text-gray-700">
                        {formatCurrency(p.financials.venta_presupuesto)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${statusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${paymentColors[p.payment_status]}`}>
                        {paymentLabels[p.payment_status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full ${anticipoBadge.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${anticipoBadge.dot}`} />
                        {anticipoBadge.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {hasReal ? (
                        <span className={`text-sm font-mono font-semibold ${getMarginColor(p.profit.pct_utilidad)}`}>
                          {p.profit.pct_utilidad}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300">&mdash;</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        {filtered.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-gray-400">Venta Presupuesto:</span>{" "}
                <span className="font-mono font-medium text-gray-700">{formatCurrency(totalVentaPresupuesto)}</span>
              </div>
              {totalVentaReal > 0 && (
                <>
                  <div>
                    <span className="text-gray-400">Venta Real:</span>{" "}
                    <span className="font-mono font-medium text-gray-700">{formatCurrency(totalVentaReal)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Utilidad:</span>{" "}
                    <span className={`font-mono font-medium ${totalUtilidad >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(totalUtilidad)}
                    </span>
                  </div>
                </>
              )}
              <div>
                <span className="text-gray-400">Proyectos operados:</span>{" "}
                <span className="font-medium text-gray-700">{operados.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">No se encontraron proyectos</p>
          </div>
        )}
      </div>
    </div>
  );
}
