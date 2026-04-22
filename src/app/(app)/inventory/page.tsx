"use client";

import { useState, useMemo } from "react";
import { INVENTORY, type InventoryItem } from "@/lib/inventory-data";
import {
  Search,
  ExternalLink,
  Package,
  Boxes,
  CheckCircle2,
  Wrench,
  LayoutGrid,
  List,
  ImageOff,
} from "lucide-react";

type ViewMode = "table" | "grid";
type StatusFilter = "todos" | "Optimo" | "En mantenimiento" | "Fuera de servicio" | "PENDIENTE";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "Optimo", label: "Optimo" },
  { key: "En mantenimiento", label: "En mantenimiento" },
  { key: "Fuera de servicio", label: "Fuera de servicio" },
  { key: "PENDIENTE", label: "Pendiente" },
];

const MONDAY_BOARD_URL = "https://digitalpixel-company.monday.com/boards/8070931987";

/** Normalize the raw estado string into one of our canonical buckets (or "" for unknown). */
function normalizeEstado(estado: string): string {
  const e = (estado || "").trim().toLowerCase();
  if (!e) return "";
  if (e === "optimo" || e === "óptimo") return "Optimo";
  if (e.includes("mantenimiento") && !e.includes("solicitar")) return "En mantenimiento";
  if (e.includes("fuera")) return "Fuera de servicio";
  if (e === "pendiente") return "PENDIENTE";
  // Other soft statuses we pass through as-is (Solicitar mantenimiento, Funcional / Vinil, Mejora ...)
  return estado.trim();
}

/** Return a badge color class set based on normalized estado. */
function estadoColor(estado: string): { bg: string; text: string; dot: string } {
  const n = normalizeEstado(estado);
  switch (n) {
    case "Optimo":
      return { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" };
    case "En mantenimiento":
      return { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" };
    case "Fuera de servicio":
      return { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" };
    case "PENDIENTE":
      return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
    default:
      if (n.toLowerCase().includes("solicitar"))
        return { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400" };
      if (n.toLowerCase().includes("funcional"))
        return { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" };
      if (n.toLowerCase().includes("mejora"))
        return { bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-400" };
      return { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-300" };
  }
}

/** Clean up type labels that come as JSON-like strings or empty. */
function cleanType(type: string): string {
  if (!type || type.trim() === "") return "Sin categoria";
  if (type.trim().startsWith("{")) return "Sin categoria";
  return type.trim();
}

/** Return the first valid image URL from a comma-separated list. Filters out videos. */
function firstImageUrl(imagen?: string): string | null {
  if (!imagen) return null;
  const parts = imagen.split(",").map((s) => s.trim()).filter(Boolean);
  for (const p of parts) {
    const lower = p.toLowerCase();
    if (lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".webm")) continue;
    return p;
  }
  return null;
}

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string>("todos");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("todos");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Unique product types (cleaned, sorted)
  const allTypes = useMemo(() => {
    const set = new Set<string>();
    for (const item of INVENTORY) set.add(cleanType(item.type));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  // Filter pipeline
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INVENTORY.filter((item) => {
      if (q) {
        const hay = `${item.name} ${item.type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (activeType !== "todos") {
        if (cleanType(item.type) !== activeType) return false;
      }
      if (activeStatus !== "todos") {
        if (normalizeEstado(item.estado) !== activeStatus) return false;
      }
      return true;
    });
  }, [search, activeType, activeStatus]);

  // KPIs (computed over full inventory)
  const kpis = useMemo(() => {
    const totalEquipos = INVENTORY.length;
    const totalUnidades = INVENTORY.reduce((s, i) => s + i.existentes, 0);
    const totalDisponibles = INVENTORY.reduce((s, i) => s + i.disponibles, 0);
    const totalMantenimiento = INVENTORY.reduce((s, i) => s + i.mantenimiento, 0);
    return { totalEquipos, totalUnidades, totalDisponibles, totalMantenimiento };
  }, []);

  // Last updated - derived from most recent ultima_revision in the data
  const lastUpdated = useMemo(() => {
    const dates = INVENTORY.map((i) => i.ultima_revision).filter(Boolean) as string[];
    if (dates.length === 0) return "hoy";
    const max = dates.sort().at(-1)!;
    // Format YYYY-MM-DD to DD/MM/YYYY
    const [y, m, d] = max.split("-");
    return `${d}/${m}/${y}`;
  }, []);

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventario de Equipos</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Sincronizado con Monday.com &middot; Ultima actualizacion {lastUpdated}
          </p>
        </div>
        <a
          href={MONDAY_BOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver en Monday
        </a>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={<Package className="w-4 h-4" />}
          label="Total equipos"
          value={kpis.totalEquipos}
          tint="blue"
        />
        <KpiCard
          icon={<Boxes className="w-4 h-4" />}
          label="Total unidades"
          value={kpis.totalUnidades}
          tint="gray"
        />
        <KpiCard
          icon={<CheckCircle2 className="w-4 h-4" />}
          label="Disponibles"
          value={kpis.totalDisponibles}
          tint="green"
        />
        <KpiCard
          icon={<Wrench className="w-4 h-4" />}
          label="En mantenimiento"
          value={kpis.totalMantenimiento}
          tint="amber"
        />
      </div>

      {/* ─── Search + View toggle ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeStatus === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 ml-auto">
          <button
            onClick={() => setViewMode("table")}
            title="Vista tabla"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            title="Vista grid"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Type filter chips ─── */}
      <div className="flex flex-wrap gap-1.5">
        <TypeChip
          label="Todos"
          active={activeType === "todos"}
          onClick={() => setActiveType("todos")}
          count={INVENTORY.length}
        />
        {allTypes.map((t) => {
          const count = INVENTORY.filter((i) => cleanType(i.type) === t).length;
          return (
            <TypeChip
              key={t}
              label={t}
              active={activeType === t}
              onClick={() => setActiveType(t)}
              count={count}
            />
          );
        })}
      </div>

      {/* ─── Results count ─── */}
      <div className="text-xs text-gray-400">
        Mostrando {filtered.length} de {INVENTORY.length} equipos
      </div>

      {/* ─── Table or Grid view ─── */}
      {viewMode === "table" ? (
        <TableView items={filtered} />
      ) : (
        <GridView items={filtered} />
      )}

      {filtered.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-gray-400">
          <p className="text-sm">No se encontraron equipos con esos filtros</p>
        </div>
      )}
    </div>
  );
}

/* ─── Subcomponents ─── */

function KpiCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint: "blue" | "gray" | "green" | "amber";
}) {
  const tintClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    gray: "bg-gray-100 text-gray-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tintClasses[tint]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value.toLocaleString("es-MX")}</p>
    </div>
  );
}

function TypeChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
      <span className={active ? "text-blue-100" : "text-gray-400"}>{count}</span>
    </button>
  );
}

function StatusBadge({ estado }: { estado: string }) {
  const display = normalizeEstado(estado) || "Sin estado";
  const color = estadoColor(estado);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full ${color.bg} ${color.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
      {display}
    </span>
  );
}

function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-300">
        <ImageOff className="w-4 h-4" />
      </div>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className="w-10 h-10 rounded-md object-cover bg-gray-100 ring-1 ring-gray-200"
      loading="lazy"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function TableView({ items }: { items: InventoryItem[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[240px]">
                Equipo
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Existentes
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Manto.
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Fuera
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Disponibles
              </th>
              <th className="px-3 py-3 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Ult. revision
              </th>
              <th className="px-3 py-3 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Monday
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => {
              const img = firstImageUrl(item.imagen);
              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2">
                    <Thumbnail src={img} alt={item.name} />
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500">{cleanType(item.type)}</td>
                  <td className="px-3 py-2 text-right text-sm font-mono text-gray-700">
                    {item.existentes}
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-mono">
                    <span className={item.mantenimiento > 0 ? "text-amber-600" : "text-gray-300"}>
                      {item.mantenimiento}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-mono">
                    <span className={item.fuera_servicio > 0 ? "text-red-600" : "text-gray-300"}>
                      {item.fuera_servicio}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-mono font-semibold text-gray-900">
                    {item.disponibles}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <StatusBadge estado={item.estado} />
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-400 tabular-nums">
                    {item.ultima_revision || <span className="text-gray-300">&mdash;</span>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <a
                      href={item.monday_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir en Monday"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GridView({ items }: { items: InventoryItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const img = firstImageUrl(item.imagen);
        return (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all flex flex-col"
          >
            <div className="aspect-video bg-gray-50 relative overflow-hidden">
              {img ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={img}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement?.classList.add("flex", "items-center", "justify-center");
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageOff className="w-8 h-8" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <StatusBadge estado={item.estado} />
              </div>
            </div>
            <div className="p-3 flex flex-col gap-2 flex-1">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                  {item.name}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{cleanType(item.type)}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-2 mt-auto">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Existen</p>
                  <p className="text-sm font-semibold text-gray-900 tabular-nums">
                    {item.existentes}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Manto.</p>
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      item.mantenimiento > 0 ? "text-amber-600" : "text-gray-300"
                    }`}
                  >
                    {item.mantenimiento}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Dispon.</p>
                  <p className="text-sm font-semibold text-gray-900 tabular-nums">
                    {item.disponibles}
                  </p>
                </div>
              </div>

              <a
                href={item.monday_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-[11px] font-medium text-gray-500 hover:text-blue-600 transition-colors pt-1"
              >
                <ExternalLink className="w-3 h-3" />
                Ver en Monday
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
