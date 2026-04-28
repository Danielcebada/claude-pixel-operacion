"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  DragEvent,
  ChangeEvent,
} from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  Info,
  X,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/types";
import {
  loadPersistedFinancials,
  savePersistedFinancials,
} from "@/lib/project-financials-store";

// ─── Categories aligned with ProjectFinancials ───
type CostCategory =
  | "gasolina"
  | "internet"
  | "operacion"
  | "instalacion"
  | "ubers"
  | "extras"
  | "viaticos"
  | "costos";

const CATEGORY_LABEL: Record<CostCategory, string> = {
  costos: "Costos directos",
  gasolina: "Gasolina",
  internet: "Internet",
  operacion: "Operacion",
  instalacion: "Instalacion",
  ubers: "Ubers",
  extras: "Extras",
  viaticos: "Viaticos",
};

const CATEGORY_TONE: Record<CostCategory, string> = {
  costos: "bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-400/30",
  gasolina: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
  internet: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/30",
  operacion: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/30",
  instalacion: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/30",
  ubers: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
  extras: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30",
  viaticos: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/30",
};

const CATEGORY_ALIASES: Record<string, CostCategory> = {
  gasolina: "gasolina",
  combustible: "gasolina",
  gas: "gasolina",
  internet: "internet",
  conectividad: "internet",
  wifi: "internet",
  operacion: "operacion",
  operación: "operacion",
  staff: "operacion",
  personal: "operacion",
  instalacion: "instalacion",
  instalación: "instalacion",
  montaje: "instalacion",
  uber: "ubers",
  ubers: "ubers",
  taxi: "ubers",
  transporte: "ubers",
  extras: "extras",
  extra: "extras",
  imprevistos: "extras",
  viaticos: "viaticos",
  viáticos: "viaticos",
  alimentos: "viaticos",
  hospedaje: "viaticos",
  costos: "costos",
  costo: "costos",
  equipo: "costos",
};

const REQUIRED_COLUMNS = [
  "concepto",
  "categoria",
  "monto",
  "fecha",
  "proveedor",
] as const;

interface ParsedRow {
  concepto: string;
  categoria: CostCategory;
  monto: number;
  fecha: string;
  proveedor: string;
  rawCategoria: string;
  valid: boolean;
  error?: string;
}

function buildBaselineFin(project: (typeof MOCK_PROJECTS)[number]): Record<string, number> {
  const f = project.financials;
  return {
    venta_presupuesto: f.venta_presupuesto,
    venta_real: f.venta_real,
    costos_presupuesto: f.costos_presupuesto,
    costos_real: f.costos_real,
    gasolina_presupuesto: f.gasolina_presupuesto,
    gasolina_real: f.gasolina_real,
    internet_presupuesto: f.internet_presupuesto,
    internet_real: f.internet_real,
    operacion_presupuesto: f.operacion_presupuesto,
    operacion_real: f.operacion_real,
    instalacion_presupuesto: f.instalacion_presupuesto,
    instalacion_real: f.instalacion_real,
    ubers_presupuesto: f.ubers_presupuesto,
    ubers_real: f.ubers_real,
    extras_presupuesto: f.extras_presupuesto,
    extras_real: f.extras_real,
    viaticos_venta: f.viaticos_venta,
    viaticos_gasto: f.viaticos_gasto,
    viaticos_uber: f.viaticos_uber,
  };
}

function categoryToFinKey(cat: CostCategory): string {
  if (cat === "viaticos") return "viaticos_gasto";
  return `${cat}_real`;
}

// ─── Toast ───
type ToastTone = "success" | "error" | "info";
interface ToastMsg {
  tone: ToastTone;
  text: string;
}

// ─── Helpers ───
function normalizeText(s: string): string {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function parseCategory(raw: string): CostCategory | null {
  const key = normalizeText(raw);
  return CATEGORY_ALIASES[key] ?? null;
}

function parseAmount(raw: unknown): number {
  if (typeof raw === "number") return Math.round(raw);
  const s = String(raw ?? "").replace(/[\s,$]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.round(n);
}

function parseDate(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "number") {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(raw);
    if (d) {
      const yyyy = String(d.y).padStart(4, "0");
      const mm = String(d.m).padStart(2, "0");
      const dd = String(d.d).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  const s = String(raw).trim();
  // already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // try Date parse
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

function downloadTemplate() {
  const header = REQUIRED_COLUMNS.join(",");
  const example = [
    `Renta de luminaria,instalacion,4500,${new Date().toISOString().slice(0, 10)},Renta AV Solutions`,
    `Gasolina traslado MTY,gasolina,2200,${new Date().toISOString().slice(0, 10)},Pemex`,
    `Hospedaje crew,viaticos,3800,${new Date().toISOString().slice(0, 10)},Hotel Fiesta`,
    `Internet evento,internet,1200,${new Date().toISOString().slice(0, 10)},Telcel Empresarial`,
    `Operador 360,operacion,1800,${new Date().toISOString().slice(0, 10)},Staff Pro Events`,
    `Uber crew,ubers,650,${new Date().toISOString().slice(0, 10)},Uber MX`,
  ];
  const csv = `${header}\n${example.join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_costos_proyecto.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Component ───
export interface ProjectCostUploaderProps {
  initialProjectId?: string;
  onClose?: () => void;
  onApplied?: (projectId: string, totalAdded: number, count: number) => void;
}

export default function ProjectCostUploader({
  initialProjectId,
  onClose,
  onApplied,
}: ProjectCostUploaderProps) {
  const [projectId, setProjectId] = useState<string>(initialProjectId ?? "");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProject = useMemo(
    () => MOCK_PROJECTS.find((p) => p.id === projectId) ?? null,
    [projectId],
  );

  const filteredProjects = useMemo(() => {
    const q = normalizeText(search);
    if (!q) return MOCK_PROJECTS.slice(0, 12);
    return MOCK_PROJECTS.filter((p) => normalizeText(p.deal_name).includes(q)).slice(0, 12);
  }, [search]);

  // Auto-clear toasts
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const resetFile = useCallback(() => {
    setRows(null);
    setFileName("");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!projectId) {
        setToast({ tone: "error", text: "Selecciona un proyecto antes de subir el archivo." });
        return;
      }
      const validExt = /\.(csv|xlsx|xls)$/i.test(file.name);
      if (!validExt) {
        setToast({ tone: "error", text: "Formato no soportado. Usa .csv o .xlsx" });
        return;
      }

      setParsing(true);
      setProgress(15);
      setFileName(file.name);

      try {
        const buf = await file.arrayBuffer();
        setProgress(40);
        const wb = XLSX.read(buf, { type: "array", cellDates: false });
        setProgress(60);
        const wsName = wb.SheetNames[0];
        if (!wsName) throw new Error("El archivo no contiene hojas");
        const ws = wb.Sheets[wsName];
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
        setProgress(80);

        if (raw.length === 0) {
          throw new Error("El archivo no contiene filas");
        }

        const parsed: ParsedRow[] = raw.map((r) => {
          // case-insensitive column lookup
          const lookup = (col: string) => {
            const direct = r[col];
            if (direct !== undefined && direct !== "") return direct;
            const keys = Object.keys(r);
            const match = keys.find(
              (k) => normalizeText(k).replace(/\s+/g, "_") === col,
            );
            return match ? r[match] : "";
          };
          const concepto = String(lookup("concepto") ?? "").trim();
          const rawCategoria = String(lookup("categoria") ?? "").trim();
          const monto = parseAmount(lookup("monto"));
          const fecha = parseDate(lookup("fecha"));
          const proveedor = String(lookup("proveedor") ?? "").trim();
          const cat = parseCategory(rawCategoria);

          let error: string | undefined;
          if (!concepto) error = "Falta concepto";
          else if (!cat) error = `Categoria invalida: "${rawCategoria}"`;
          else if (monto <= 0) error = "Monto invalido";

          return {
            concepto: concepto || "(sin concepto)",
            categoria: cat ?? "extras",
            monto,
            fecha: fecha || "",
            proveedor,
            rawCategoria,
            valid: !error,
            error,
          };
        });

        setProgress(100);
        setRows(parsed);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error procesando archivo";
        setToast({ tone: "error", text: msg });
        resetFile();
      } finally {
        setTimeout(() => setParsing(false), 200);
      }
    },
    [projectId, resetFile],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Aggregate totals by category
  const aggregates = useMemo(() => {
    if (!rows) return null;
    const agg = new Map<CostCategory, { total: number; count: number }>();
    let totalValid = 0;
    let validCount = 0;
    rows.forEach((r) => {
      if (!r.valid) return;
      const prev = agg.get(r.categoria) ?? { total: 0, count: 0 };
      prev.total += r.monto;
      prev.count += 1;
      agg.set(r.categoria, prev);
      totalValid += r.monto;
      validCount += 1;
    });
    return {
      byCat: Array.from(agg.entries())
        .map(([cat, v]) => ({ cat, ...v }))
        .sort((a, b) => b.total - a.total),
      totalValid,
      validCount,
      invalidCount: rows.length - validCount,
    };
  }, [rows]);

  const handleApply = useCallback(() => {
    if (!rows || !selectedProject) return;
    const validRows = rows.filter((r) => r.valid);
    if (validRows.length === 0) {
      setToast({ tone: "error", text: "No hay filas validas para importar" });
      return;
    }

    const baseline = buildBaselineFin(selectedProject);
    const persisted = loadPersistedFinancials(selectedProject.id);
    const currentFin: Record<string, number> = {
      ...baseline,
      ...((persisted?.fin as Record<string, number>) ?? {}),
    };

    let totalAdded = 0;
    validRows.forEach((r) => {
      const finKey = categoryToFinKey(r.categoria);
      currentFin[finKey] = (currentFin[finKey] ?? 0) + r.monto;
      totalAdded += r.monto;
    });

    savePersistedFinancials(selectedProject.id, {
      fin: currentFin as unknown as Partial<import("@/lib/types").ProjectFinancials>,
      status: persisted?.status,
      presupuestoConfirmado: persisted?.presupuestoConfirmado,
      savedAt: Date.now(),
    });

    setToast({
      tone: "success",
      text: `${validRows.length} conceptos cargados, ${formatCurrency(totalAdded)} agregados a ${selectedProject.deal_name.slice(0, 50)}${selectedProject.deal_name.length > 50 ? "..." : ""}`,
    });

    onApplied?.(selectedProject.id, totalAdded, validRows.length);
    resetFile();
  }, [rows, selectedProject, onApplied, resetFile]);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 ring-1 ring-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-white/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-violet-300/80">
                Carga masiva de costos
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">Costos por proyecto</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sube un Excel de gastos. Los montos se suman a las categorias del proyecto seleccionado.
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Toast */}
        {toast && (
          <div
            className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs ring-1 ${
              toast.tone === "success"
                ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30"
                : toast.tone === "error"
                ? "bg-rose-500/10 text-rose-300 ring-rose-400/30"
                : "bg-blue-500/10 text-blue-300 ring-blue-400/30"
            }`}
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            ) : toast.tone === "error" ? (
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <span className="flex-1">{toast.text}</span>
            <button
              onClick={() => setToast(null)}
              className="text-xs opacity-60 hover:opacity-100"
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        )}

        {/* Step 1: Project picker */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80">
            1. Selecciona el proyecto
          </label>
          {selectedProject ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-violet-500/10 ring-1 ring-violet-400/30 px-3 py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                  {(selectedProject.vendedor_name ?? "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{selectedProject.deal_name}</p>
                  <p className="text-[11px] text-slate-400">
                    {selectedProject.vendedor_name} · {selectedProject.event_date} ·{" "}
                    {formatCurrency(selectedProject.financials.venta_presupuesto)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setProjectId("");
                  setSearchOpen(true);
                  resetFile();
                }}
                className="text-[11px] text-violet-300 hover:text-white px-2 py-1 rounded-md hover:bg-white/5 transition flex-shrink-0"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nombre del deal..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white/5 ring-1 ring-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
              />
              {searchOpen && (
                <div className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-xl bg-slate-900 ring-1 ring-white/10 shadow-2xl">
                  {filteredProjects.length === 0 && (
                    <p className="text-xs text-slate-400 px-3 py-2">Sin resultados</p>
                  )}
                  {filteredProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setProjectId(p.id);
                        setSearch("");
                        setSearchOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-violet-500/10 border-b border-white/5 last:border-b-0 transition"
                    >
                      <p className="text-sm text-white truncate">{p.deal_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {p.vendedor_name} · {p.event_date} ·{" "}
                        {formatCurrency(p.financials.venta_presupuesto)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: File */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80">
              2. Sube el archivo de costos
            </label>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 h-7 text-[11px] bg-white/5 border-white/10 text-slate-200 hover:bg-white/10"
              onClick={downloadTemplate}
            >
              <Download className="w-3 h-3" /> Plantilla CSV
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-white/[0.02] ring-1 ring-white/5 px-3 py-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 mt-0.5 text-slate-500 shrink-0" />
            <span>
              Columnas requeridas: <code className="text-violet-300">{REQUIRED_COLUMNS.join(", ")}</code>.
              Categorias validas: <code className="text-violet-300">gasolina · internet · operacion · instalacion · ubers · extras · viaticos</code>.
            </span>
          </div>

          {!rows && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!projectId) return;
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => projectId && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                !projectId
                  ? "border-white/10 bg-white/[0.02] opacity-50 cursor-not-allowed"
                  : isDragging
                  ? "border-violet-400 bg-violet-500/10 cursor-pointer"
                  : "border-white/10 hover:border-violet-400/50 hover:bg-white/[0.03] cursor-pointer"
              }`}
            >
              <Upload
                className={`w-8 h-8 mx-auto mb-2 ${isDragging ? "text-violet-400" : "text-slate-500"}`}
              />
              <p className="text-sm font-medium text-slate-200">
                {!projectId
                  ? "Selecciona un proyecto primero"
                  : "Arrastra tu Excel o CSV aqui"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {projectId ? "o haz click para seleccionar archivo" : ""}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={onSelectFile}
                className="hidden"
              />
            </div>
          )}

          {parsing && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Procesando {fileName}...
                </span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Preview */}
        {rows && aggregates && !parsing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">{fileName}</span>
                <Badge className="bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30 border-0">
                  {aggregates.validCount} validas
                </Badge>
                {aggregates.invalidCount > 0 && (
                  <Badge className="bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30 border-0">
                    {aggregates.invalidCount} con error
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-slate-200 hover:bg-white/10"
                  onClick={resetFile}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="gap-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-900/40 border-0"
                  onClick={handleApply}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Aplicar al proyecto
                </Button>
              </div>
            </div>

            {/* Totals by category */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {aggregates.byCat.map(({ cat, total, count }) => (
                <div
                  key={cat}
                  className="rounded-xl bg-white/[0.03] ring-1 ring-white/5 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={`${CATEGORY_TONE[cat]} border-0 text-[10px]`}>
                      {CATEGORY_LABEL[cat]}
                    </Badge>
                    <span className="text-[10px] text-slate-500">{count} reg.</span>
                  </div>
                  <p className="mt-1.5 text-base font-bold text-white tabular-nums">
                    {formatCurrency(total)}
                  </p>
                </div>
              ))}
              <div className="rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 ring-1 ring-violet-400/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                    Total
                  </span>
                  <span className="text-[10px] text-violet-300/80">{aggregates.validCount} reg.</span>
                </div>
                <p className="mt-1.5 text-base font-bold text-white tabular-nums">
                  {formatCurrency(aggregates.totalValid)}
                </p>
              </div>
            </div>

            {/* Rows preview */}
            <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/5 overflow-hidden">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-900/80 backdrop-blur">
                    <tr className="border-b border-white/5">
                      <th className="px-3 py-2 text-left font-medium text-slate-400">Concepto</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-400">Categoria</th>
                      <th className="px-3 py-2 text-right font-medium text-slate-400">Monto</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-400">Fecha</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-400">Proveedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr
                        key={i}
                        className={`border-b border-white/5 last:border-b-0 ${
                          !r.valid ? "bg-rose-500/5" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="px-3 py-1.5 text-slate-200">
                          {r.concepto}
                          {!r.valid && (
                            <span className="block text-[10px] text-rose-400 mt-0.5">
                              {r.error}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5">
                          {r.valid ? (
                            <Badge
                              className={`${CATEGORY_TONE[r.categoria]} border-0 text-[10px]`}
                            >
                              {CATEGORY_LABEL[r.categoria]}
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-rose-400">{r.rawCategoria || "-"}</span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-slate-300">
                          {r.monto > 0 ? formatCurrency(r.monto) : "-"}
                        </td>
                        <td className="px-3 py-1.5 text-slate-400">{r.fecha || "-"}</td>
                        <td className="px-3 py-1.5 text-slate-400">{r.proveedor || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
