"use client";

import { useState, useRef, useEffect, useMemo, useCallback, DragEvent, ChangeEvent } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  Download,
  Plus,
  History,
  Tag,
  Calculator,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Trash2,
  FileDown,
  Info,
  FolderKanban,
  ExternalLink,
  Sparkles,
  Wallet,
  Activity,
  TrendingUp as TrendingUpIcon,
  AlertOctagon,
} from "lucide-react";
import { formatCurrency, computeProfitability, type ProjectFinancials } from "@/lib/types";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { loadPersistedFinancials } from "@/lib/project-financials-store";
import ProjectCostUploader from "@/components/costs/project-cost-uploader";

// ─── Uploader: Types & Config ─────────────────────────────────
type UploadType = "productos" | "proveedores" | "tarifario";

interface UploadConfig {
  label: string;
  columns: string[];
  uniqueKey: string;
  templateFilename: string;
  exampleRow: Record<string, string | number>;
}

const UPLOAD_CONFIG: Record<UploadType, UploadConfig> = {
  productos: {
    label: "Catalogo de Productos",
    columns: ["codigo", "nombre", "categoria", "costo_base", "precio_venta", "stock"],
    uniqueKey: "codigo",
    templateFilename: "plantilla_productos.csv",
    exampleRow: {
      codigo: "PRD-001",
      nombre: "360 Photo Booth",
      categoria: "booth",
      costo_base: 12500,
      precio_venta: 35000,
      stock: 3,
    },
  },
  proveedores: {
    label: "Proveedores",
    columns: ["nombre", "tipo", "contacto", "telefono", "email", "productos"],
    uniqueKey: "nombre",
    templateFilename: "plantilla_proveedores.csv",
    exampleRow: {
      nombre: "Renta AV Solutions",
      tipo: "AV / Pantallas",
      contacto: "Carlos Ruiz",
      telefono: "55-1234-5678",
      email: "carlos@rentaav.com",
      productos: "LED Wall; Proyectores",
    },
  },
  tarifario: {
    label: "Tarifario",
    columns: ["producto", "modalidad", "precio_1dia", "precio_2dias", "precio_3dias", "precio_semana"],
    uniqueKey: "producto",
    templateFilename: "plantilla_tarifario.csv",
    exampleRow: {
      producto: "360 Photo Booth",
      modalidad: "renta_operada",
      precio_1dia: 35000,
      precio_2dias: 55000,
      precio_3dias: 72000,
      precio_semana: 120000,
    },
  },
};

interface StoredCostsData {
  productos: Record<string, string | number>[];
  proveedores: Record<string, string | number>[];
  tarifario: Record<string, string | number>[];
  updatedAt?: string;
}

const STORAGE_KEY = "pixel_costs_data";

// ─── Uploader: Helpers ─────────────────────────────────
function loadStoredCosts(): StoredCostsData {
  if (typeof window === "undefined") return { productos: [], proveedores: [], tarifario: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { productos: [], proveedores: [], tarifario: [] };
    const parsed = JSON.parse(raw) as StoredCostsData;
    return {
      productos: parsed.productos ?? [],
      proveedores: parsed.proveedores ?? [],
      tarifario: parsed.tarifario ?? [],
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return { productos: [], proveedores: [], tarifario: [] };
  }
}

function saveStoredCosts(data: StoredCostsData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }));
}

function downloadTemplate(type: UploadType) {
  const cfg = UPLOAD_CONFIG[type];
  const header = cfg.columns.join(",");
  const exampleVals = cfg.columns.map((c) => {
    const v = cfg.exampleRow[c];
    if (typeof v === "string" && v.includes(",")) return `"${v}"`;
    return v ?? "";
  }).join(",");
  const csv = `${header}\n${exampleVals}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = cfg.templateFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportAllData(data: StoredCostsData) {
  const wb = XLSX.utils.book_new();
  (Object.keys(UPLOAD_CONFIG) as UploadType[]).forEach((type) => {
    const rows = data[type] ?? [];
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [UPLOAD_CONFIG[type].exampleRow]);
    XLSX.utils.book_append_sheet(wb, ws, UPLOAD_CONFIG[type].label.slice(0, 31));
  });
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `pixel_costos_${today}.xlsx`);
}

function normalizeRows(raw: unknown[], cfg: UploadConfig): Record<string, string | number>[] {
  return raw.map((r) => {
    const row = r as Record<string, unknown>;
    const normalized: Record<string, string | number> = {};
    cfg.columns.forEach((col) => {
      // try exact, then case/space-insensitive match
      let val = row[col];
      if (val === undefined || val === null) {
        const keys = Object.keys(row);
        const match = keys.find((k) => k.trim().toLowerCase().replace(/\s+/g, "_") === col);
        if (match) val = row[match];
      }
      if (val === undefined || val === null || val === "") {
        normalized[col] = "";
      } else if (typeof val === "number") {
        normalized[col] = val;
      } else {
        const str = String(val).trim();
        // try numeric columns
        if (/^(costo|precio|stock)/i.test(col) && /^-?\d+(\.\d+)?$/.test(str.replace(/[,$]/g, ""))) {
          normalized[col] = Number(str.replace(/[,$]/g, ""));
        } else {
          normalized[col] = str;
        }
      }
    });
    return normalized;
  }).filter((r) => {
    const keyVal = r[cfg.uniqueKey];
    return keyVal !== "" && keyVal !== undefined && keyVal !== null;
  });
}

function mergeRows(
  existing: Record<string, string | number>[],
  incoming: Record<string, string | number>[],
  uniqueKey: string,
): { merged: Record<string, string | number>[]; added: number; updated: number } {
  const map = new Map<string, Record<string, string | number>>();
  existing.forEach((r) => {
    const key = String(r[uniqueKey]).trim().toLowerCase();
    if (key) map.set(key, r);
  });

  let added = 0;
  let updated = 0;
  incoming.forEach((r) => {
    const key = String(r[uniqueKey]).trim().toLowerCase();
    if (!key) return;
    if (map.has(key)) {
      map.set(key, { ...map.get(key)!, ...r });
      updated++;
    } else {
      map.set(key, r);
      added++;
    }
  });

  return { merged: Array.from(map.values()), added, updated };
}

// ─── Uploader: Component ─────────────────────────────────
interface UploaderFeedback {
  kind: "success" | "error";
  message: string;
}

function CostsUploader() {
  const [activeType, setActiveType] = useState<UploadType>("productos");
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<Record<string, string | number>[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [feedback, setFeedback] = useState<UploaderFeedback | null>(null);
  const [stored, setStored] = useState<StoredCostsData>({ productos: [], proveedores: [], tarifario: [] });
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStored(loadStoredCosts());
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(t);
  }, [feedback]);

  const cfg = UPLOAD_CONFIG[activeType];

  const resetFile = useCallback(() => {
    setPreview(null);
    setFileName("");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFile = useCallback(async (file: File) => {
    const validExt = /\.(csv|xlsx|xls)$/i.test(file.name);
    if (!validExt) {
      setFeedback({ kind: "error", message: "Formato no soportado. Usa archivos .csv o .xlsx." });
      return;
    }

    setParsing(true);
    setProgress(10);
    setFileName(file.name);
    setFeedback(null);

    try {
      const buf = await file.arrayBuffer();
      setProgress(45);
      const wb = XLSX.read(buf, { type: "array" });
      setProgress(70);
      const wsName = wb.SheetNames[0];
      if (!wsName) throw new Error("El archivo no contiene hojas");
      const ws = wb.Sheets[wsName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      setProgress(88);
      const normalized = normalizeRows(rawRows, UPLOAD_CONFIG[activeType]);
      if (normalized.length === 0) {
        throw new Error("No se encontraron filas validas. Revisa las columnas requeridas.");
      }
      setPreview(normalized);
      setProgress(100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al procesar el archivo";
      setFeedback({ kind: "error", message: msg });
      resetFile();
    } finally {
      setTimeout(() => setParsing(false), 250);
    }
  }, [activeType, resetFile]);

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

  const confirmImport = () => {
    if (!preview) return;
    const current = loadStoredCosts();
    const { merged, added, updated } = mergeRows(current[activeType], preview, cfg.uniqueKey);
    const next: StoredCostsData = { ...current, [activeType]: merged };
    saveStoredCosts(next);
    setStored(loadStoredCosts());
    setFeedback({
      kind: "success",
      message: `Importacion OK en ${cfg.label}: ${added} agregados, ${updated} actualizados.`,
    });
    resetFile();
  };

  const cancelImport = () => {
    resetFile();
    setFeedback(null);
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    setStored({ productos: [], proveedores: [], tarifario: [] });
    setConfirmClear(false);
    setFeedback({ kind: "success", message: "Datos locales eliminados." });
  };

  const counts = {
    productos: stored.productos.length,
    proveedores: stored.proveedores.length,
    tarifario: stored.tarifario.length,
  };
  const totalRows = counts.productos + counts.proveedores + counts.tarifario;

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="w-5 h-5 text-blue-600" />
              Importar datos de costos
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Sube un archivo .csv o .xlsx. Los datos se combinan con los existentes por llave unica y se guardan en tu navegador.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
              <FileSpreadsheet className="w-3 h-3" />
              {totalRows} registros locales
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => exportAllData(loadStoredCosts())}
              disabled={totalRows === 0}
            >
              <FileDown className="w-3.5 h-3.5" /> Exportar XLSX
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`gap-1 ${confirmClear ? "border-red-400 text-red-600" : ""}`}
              onClick={handleClear}
              disabled={totalRows === 0}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmClear ? "Confirmar borrar?" : "Limpiar datos"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {feedback && (
          <div
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
              feedback.kind === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {feedback.kind === "success" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <span className="flex-1">{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs opacity-60 hover:opacity-100"
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        )}

        <Tabs
          value={activeType}
          onValueChange={(v) => {
            setActiveType(v as UploadType);
            resetFile();
          }}
        >
          <TabsList>
            {(Object.keys(UPLOAD_CONFIG) as UploadType[]).map((k) => (
              <TabsTrigger key={k} value={k} className="gap-2">
                {UPLOAD_CONFIG[k].label}
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-mono">
                  {counts[k]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.keys(UPLOAD_CONFIG) as UploadType[]).map((k) => (
            <TabsContent key={k} value={k} className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border rounded-lg px-3 py-2 flex-1 min-w-[260px]">
                  <Info className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    <strong>Columnas esperadas:</strong> {UPLOAD_CONFIG[k].columns.join(", ")}
                    <span className="text-gray-400"> - llave unica: {UPLOAD_CONFIG[k].uniqueKey}</span>
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => downloadTemplate(k)}
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar plantilla
                </Button>
              </div>

              {/* Drag & drop zone */}
              {!preview && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                >
                  <Upload className={`w-10 h-10 mx-auto mb-2 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
                  <p className="text-sm font-medium text-gray-700">
                    Arrastra tu archivo aqui o <span className="text-blue-600 underline">selecciona</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Formatos: .csv, .xlsx (max 5 MB recomendado)
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
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Procesando {fileName}...
                    </span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {preview && !parsing && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-800">{fileName}</span>
                      <Badge variant="secondary">{preview.length} filas detectadas</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={cancelImport}>
                        Cancelar
                      </Button>
                      <Button size="sm" className="gap-1" onClick={confirmImport}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmar importacion
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          {UPLOAD_CONFIG[k].columns.map((c) => (
                            <th key={c} className="px-3 py-2 text-left font-medium text-gray-600">
                              {c}
                              {c === UPLOAD_CONFIG[k].uniqueKey && (
                                <Badge variant="secondary" className="ml-1 h-3.5 px-1 text-[9px]">
                                  llave
                                </Badge>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {preview.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {UPLOAD_CONFIG[k].columns.map((c) => (
                              <td key={c} className="px-3 py-1.5 font-mono text-gray-700">
                                {row[c] === "" ? (
                                  <span className="text-gray-300">-</span>
                                ) : (
                                  String(row[c])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {preview.length > 5 && (
                      <div className="text-center text-[11px] text-gray-400 py-1.5 bg-gray-50 border-t">
                        + {preview.length - 5} filas mas (se importaran todas)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ─── Mock Data: Productos/Servicios ─────────────────────────────────
interface ProductCost {
  id: string;
  name: string;
  category: "booth" | "tech" | "produccion" | "logistica" | "creativo";
  costoPromedio: number;
  costoMin: number;
  costoMax: number;
  precioVentaSugerido: number;
  margenPromedio: number;
  proyectosUsado: number;
  ultimaActualizacion: string;
  tendencia: "up" | "down" | "stable";
  variacion: number;
}

const PRODUCTS: ProductCost[] = [
  { id: "s1", name: "360 Photo Booth", category: "booth", costoPromedio: 12500, costoMin: 9000, costoMax: 18000, precioVentaSugerido: 35000, margenPromedio: 64.3, proyectosUsado: 28, ultimaActualizacion: "2026-03-20", tendencia: "stable", variacion: 2 },
  { id: "s2", name: "iPad Booth (3 unidades)", category: "booth", costoPromedio: 15000, costoMin: 12000, costoMax: 20000, precioVentaSugerido: 42000, margenPromedio: 64.3, proyectosUsado: 15, ultimaActualizacion: "2026-03-18", tendencia: "up", variacion: 8 },
  { id: "s3", name: "Green Screen Studio", category: "booth", costoPromedio: 22000, costoMin: 18000, costoMax: 28000, precioVentaSugerido: 55000, margenPromedio: 60.0, proyectosUsado: 12, ultimaActualizacion: "2026-03-15", tendencia: "down", variacion: -5 },
  { id: "s4", name: "Glam Bot", category: "booth", costoPromedio: 18000, costoMin: 15000, costoMax: 22000, precioVentaSugerido: 48000, margenPromedio: 62.5, proyectosUsado: 9, ultimaActualizacion: "2026-03-12", tendencia: "stable", variacion: 1 },
  { id: "s5", name: "Mapping / Projection", category: "tech", costoPromedio: 45000, costoMin: 30000, costoMax: 65000, precioVentaSugerido: 95000, margenPromedio: 52.6, proyectosUsado: 6, ultimaActualizacion: "2026-02-28", tendencia: "up", variacion: 12 },
  { id: "s6", name: "LED Wall (por m2)", category: "tech", costoPromedio: 8500, costoMin: 6000, costoMax: 12000, precioVentaSugerido: 18000, margenPromedio: 52.8, proyectosUsado: 11, ultimaActualizacion: "2026-03-10", tendencia: "down", variacion: -3 },
  { id: "s7", name: "Instalacion CDMX", category: "logistica", costoPromedio: 3500, costoMin: 2000, costoMax: 6000, precioVentaSugerido: 0, margenPromedio: 0, proyectosUsado: 35, ultimaActualizacion: "2026-03-22", tendencia: "up", variacion: 15 },
  { id: "s8", name: "Instalacion Foranea", category: "logistica", costoPromedio: 8500, costoMin: 5000, costoMax: 15000, precioVentaSugerido: 0, margenPromedio: 0, proyectosUsado: 18, ultimaActualizacion: "2026-03-19", tendencia: "up", variacion: 10 },
  { id: "s9", name: "Personal Operacion (por persona/dia)", category: "produccion", costoPromedio: 1800, costoMin: 1200, costoMax: 2500, precioVentaSugerido: 0, margenPromedio: 0, proyectosUsado: 42, ultimaActualizacion: "2026-03-21", tendencia: "stable", variacion: 3 },
  { id: "s10", name: "Diseño Personalizado", category: "creativo", costoPromedio: 5500, costoMin: 3000, costoMax: 12000, precioVentaSugerido: 15000, margenPromedio: 63.3, proyectosUsado: 22, ultimaActualizacion: "2026-03-17", tendencia: "stable", variacion: 0 },
];

// ─── Mock Data: Proveedores ─────────────────────────────────
interface Proveedor {
  id: string;
  nombre: string;
  servicio: string;
  costoPromedio: number;
  calificacion: number; // 1-5
  proyectos: number;
  tiempoEntrega: string;
  ultimoPrecio: number;
  ultimaFecha: string;
  tendencia: "up" | "down" | "stable";
  variacion: number;
  contacto: string;
}

const PROVEEDORES: Proveedor[] = [
  { id: "pv1", nombre: "Renta AV Solutions", servicio: "LED Wall / Pantallas", costoPromedio: 7800, calificacion: 4.5, proyectos: 11, tiempoEntrega: "3 dias", ultimoPrecio: 8200, ultimaFecha: "2026-03-10", tendencia: "up", variacion: 5, contacto: "carlos@rentaav.com" },
  { id: "pv2", nombre: "Foto Booths MX", servicio: "Equipo 360 / Booths", costoPromedio: 9500, calificacion: 4.8, proyectos: 22, tiempoEntrega: "2 dias", ultimoPrecio: 9500, ultimaFecha: "2026-03-18", tendencia: "stable", variacion: 0, contacto: "ventas@fotobooths.mx" },
  { id: "pv3", nombre: "Transportes Rapidos", servicio: "Logistica / Fletes", costoPromedio: 4200, calificacion: 3.8, proyectos: 30, tiempoEntrega: "1 dia", ultimoPrecio: 4800, ultimaFecha: "2026-03-20", tendencia: "up", variacion: 14, contacto: "ops@transportes.com" },
  { id: "pv4", nombre: "Staff Pro Events", servicio: "Personal Operacion", costoPromedio: 1600, calificacion: 4.2, proyectos: 35, tiempoEntrega: "2 dias", ultimoPrecio: 1800, ultimaFecha: "2026-03-21", tendencia: "up", variacion: 12, contacto: "rh@staffpro.mx" },
  { id: "pv5", nombre: "PrintLab Digital", servicio: "Impresion / Branding", costoPromedio: 3800, calificacion: 4.0, proyectos: 18, tiempoEntrega: "5 dias", ultimoPrecio: 3500, ultimaFecha: "2026-03-15", tendencia: "down", variacion: -8, contacto: "info@printlab.mx" },
  { id: "pv6", nombre: "Creativa Studio", servicio: "Diseño / Motion", costoPromedio: 6200, calificacion: 4.7, proyectos: 14, tiempoEntrega: "4 dias", ultimoPrecio: 6000, ultimaFecha: "2026-03-12", tendencia: "stable", variacion: -3, contacto: "hola@creativa.studio" },
  { id: "pv7", nombre: "MX Catering Co", servicio: "Viaticos / Alimentos", costoPromedio: 280, calificacion: 4.1, proyectos: 25, tiempoEntrega: "1 dia", ultimoPrecio: 300, ultimaFecha: "2026-03-22", tendencia: "up", variacion: 7, contacto: "pedidos@mxcatering.com" },
];

// ─── Mock Data: Tarifario ─────────────────────────────────
interface TarifaRow {
  producto: string;
  costoBase: number;
  margenMinimo: number;
  precioMinVenta: number;
  precioSugerido: number;
  precioMaxVisto: number;
  notas: string;
}

const TARIFARIO: TarifaRow[] = [
  { producto: "360 Photo Booth", costoBase: 12500, margenMinimo: 50, precioMinVenta: 25000, precioSugerido: 35000, precioMaxVisto: 55000, notas: "Incluye operador + equipo" },
  { producto: "iPad Booth x3", costoBase: 15000, margenMinimo: 50, precioMinVenta: 30000, precioSugerido: 42000, precioMaxVisto: 65000, notas: "3 iPads + stands + software" },
  { producto: "Green Screen", costoBase: 22000, margenMinimo: 45, precioMinVenta: 40000, precioSugerido: 55000, precioMaxVisto: 85000, notas: "Incluye iluminacion + chroma" },
  { producto: "Glam Bot", costoBase: 18000, margenMinimo: 50, precioMinVenta: 36000, precioSugerido: 48000, precioMaxVisto: 72000, notas: "Robot + operador + edicion" },
  { producto: "LED Wall (m2)", costoBase: 8500, margenMinimo: 40, precioMinVenta: 14200, precioSugerido: 18000, precioMaxVisto: 25000, notas: "Precio por m2, minimo 4m2" },
  { producto: "Mapping", costoBase: 45000, margenMinimo: 40, precioMinVenta: 75000, precioSugerido: 95000, precioMaxVisto: 180000, notas: "Depende de superficie y contenido" },
  { producto: "Diseño Custom", costoBase: 5500, margenMinimo: 50, precioMinVenta: 11000, precioSugerido: 15000, precioMaxVisto: 25000, notas: "Templates + personalizacion marca" },
];

const CATEGORIES: Record<string, string> = {
  booth: "Booths & Experiencias",
  tech: "Tecnologia",
  produccion: "Produccion",
  logistica: "Logistica",
  creativo: "Creativo",
};

const CAT_COLORS: Record<string, string> = {
  booth: "bg-blue-100 text-blue-700",
  tech: "bg-purple-100 text-purple-700",
  produccion: "bg-orange-100 text-orange-700",
  logistica: "bg-yellow-100 text-yellow-700",
  creativo: "bg-pink-100 text-pink-700",
};

function TrendIcon({ trend, variacion }: { trend: string; variacion: number }) {
  if (trend === "up") return <span className="flex items-center gap-1 text-red-600 text-xs font-medium"><TrendingUp className="w-3 h-3" />+{variacion}%</span>;
  if (trend === "down") return <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><TrendingDown className="w-3 h-3" />{variacion}%</span>;
  return <span className="text-gray-400 text-xs">={variacion}%</span>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-sm ${i <= Math.floor(rating) ? "bg-yellow-400" : i - 0.5 <= rating ? "bg-yellow-200" : "bg-gray-200"}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

// ─── Simulador de Cotizacion ─────────────────────────────────
function CotizadorRapido() {
  const [items, setItems] = useState<{ productId: string; qty: number }[]>([
    { productId: "s1", qty: 1 },
  ]);

  const addItem = () => setItems([...items, { productId: "s1", qty: 1 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const totalCosto = items.reduce((sum, item) => {
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    return sum + (prod ? prod.costoPromedio * item.qty : 0);
  }, 0);

  const totalVenta = items.reduce((sum, item) => {
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    return sum + (prod ? prod.precioVentaSugerido * item.qty : 0);
  }, 0);

  const margen = totalVenta > 0 ? Math.round(((totalVenta - totalCosto) / totalVenta) * 10000) / 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="w-5 h-5 text-blue-600" />
          Cotizador Rapido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-500">Arma una cotizacion rapida con costos promedio actualizados de proyectos reales.</p>

        <div className="space-y-2">
          {items.map((item, idx) => {
            const prod = PRODUCTS.find((p) => p.id === item.productId);
            return (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={item.productId}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].productId = e.target.value;
                    setItems(newItems);
                  }}
                  className="flex-1 border rounded-md px-2 py-1.5 text-sm"
                >
                  {PRODUCTS.filter((p) => p.precioVentaSugerido > 0).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.qty}
                  min={1}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].qty = parseInt(e.target.value) || 1;
                    setItems(newItems);
                  }}
                  className="w-16 border rounded-md px-2 py-1.5 text-sm text-center"
                />
                <span className="text-sm font-mono w-24 text-right">
                  {formatCurrency((prod?.precioVentaSugerido || 0) * item.qty)}
                </span>
                <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            );
          })}
        </div>

        <Button variant="outline" size="sm" onClick={addItem} className="gap-1 text-xs">
          <Plus className="w-3 h-3" /> Agregar linea
        </Button>

        <div className="border-t pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Costo estimado:</span>
            <span className="font-mono">{formatCurrency(totalCosto)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Precio venta sugerido:</span>
            <span className="font-mono font-bold">{formatCurrency(totalVenta)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Utilidad estimada:</span>
            <span className="font-mono text-green-600 font-bold">{formatCurrency(totalVenta - totalCosto)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Margen:</span>
            <span className={`font-mono font-bold ${margen >= 50 ? "text-green-600" : margen >= 30 ? "text-yellow-600" : "text-red-600"}`}>
              {margen}%
            </span>
          </div>
        </div>

        {margen < 40 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            Margen por debajo del objetivo (40%). Revisa los precios.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Costos por Proyecto ─────────────────────────────────
type ProjectCostStatusFilter = "all" | "bajo" | "sobre" | "sin_datos" | "saludable";

interface ProjectCostRow {
  id: string;
  deal_name: string;
  vendedor_name: string;
  pm_name: string;
  event_date: string;
  venta: number;
  costos_real: number;
  costos_presupuesto: number;
  total_gastos_real: number;
  total_gastos_presupuesto: number;
  total_ejecutado: number;
  total_estimado: number;
  margen: number;
  pct_ejecucion: number;
  status: ProjectCostStatusFilter;
  hubspot_deal_id?: string;
  presupuesto_confirmado: boolean;
  fin: ProjectFinancials;
}

function buildProjectCostRow(
  project: (typeof MOCK_PROJECTS)[number],
): ProjectCostRow {
  const persisted = loadPersistedFinancials(project.id);
  const fin: ProjectFinancials = {
    ...project.financials,
    ...((persisted?.fin as Partial<ProjectFinancials>) ?? {}),
  };
  const prof = computeProfitability(fin);
  const total_ejecutado = fin.costos_real + prof.total_gastos_real;
  const total_estimado = fin.costos_presupuesto + prof.total_gastos_presupuesto;
  const venta = fin.venta_presupuesto;
  const margen = venta > 0 ? Math.round(((venta - total_ejecutado) / venta) * 1000) / 10 : 0;
  const pct_ejecucion = total_estimado > 0 ? Math.round((total_ejecutado / total_estimado) * 1000) / 10 : 0;

  let status: ProjectCostStatusFilter = "sin_datos";
  if (total_ejecutado === 0) {
    status = "sin_datos";
  } else if (total_estimado > 0 && total_ejecutado > total_estimado * 1.0) {
    status = "sobre";
  } else if (total_estimado > 0 && total_ejecutado < total_estimado * 0.95) {
    status = "bajo";
  } else {
    status = "saludable";
  }

  return {
    id: project.id,
    deal_name: project.deal_name,
    vendedor_name: project.vendedor_name ?? "—",
    pm_name: project.pm_name ?? "—",
    event_date: project.event_date,
    venta,
    costos_real: fin.costos_real,
    costos_presupuesto: fin.costos_presupuesto,
    total_gastos_real: prof.total_gastos_real,
    total_gastos_presupuesto: prof.total_gastos_presupuesto,
    total_ejecutado,
    total_estimado,
    margen,
    pct_ejecucion,
    status,
    hubspot_deal_id: project.hubspot_deal_id,
    presupuesto_confirmado: project.presupuesto_confirmado,
    fin,
  };
}

const PROJECT_STATUS_LABELS: Record<ProjectCostStatusFilter, string> = {
  all: "Todos",
  bajo: "Bajo presupuesto",
  saludable: "En linea",
  sobre: "Sobre presupuesto",
  sin_datos: "Sin datos",
};

const PROJECT_STATUS_TONE: Record<ProjectCostStatusFilter, string> = {
  all: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/30",
  bajo: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
  saludable: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/30",
  sobre: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30",
  sin_datos: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-400/30",
};

function ProjectCostsTab({ refreshKey }: { refreshKey: number }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectCostStatusFilter>("all");
  const [detailRow, setDetailRow] = useState<ProjectCostRow | null>(null);
  const [uploaderProjectId, setUploaderProjectId] = useState<string | null>(null);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [internalRefresh, setInternalRefresh] = useState(0);

  // Recompute rows when localStorage changes / after upload
  const rows = useMemo<ProjectCostRow[]>(() => {
    if (typeof window === "undefined") return [];
    return MOCK_PROJECTS.map(buildProjectCostRow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, internalRefresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.deal_name.toLowerCase().includes(q) ||
        r.vendedor_name.toLowerCase().includes(q) ||
        r.pm_name.toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const kpis = useMemo(() => {
    const totalPresupuestado = rows.reduce((s, r) => s + r.total_estimado, 0);
    const totalEjecutado = rows.reduce((s, r) => s + r.total_ejecutado, 0);
    const withData = rows.filter((r) => r.total_estimado > 0 && r.total_ejecutado > 0);
    const avgPct =
      withData.length > 0
        ? Math.round(
            (withData.reduce((s, r) => s + r.pct_ejecucion, 0) / withData.length) * 10,
          ) / 10
        : 0;
    const sobre = rows.filter((r) => r.status === "sobre").length;
    return { totalPresupuestado, totalEjecutado, avgPct, sobre };
  }, [rows]);

  const handleUploaderApplied = useCallback(() => {
    setInternalRefresh((x) => x + 1);
    setUploaderOpen(false);
  }, []);

  function progressBarColor(pct: number): string {
    if (pct === 0) return "bg-slate-700";
    if (pct < 80) return "bg-gradient-to-r from-emerald-500 to-emerald-400";
    if (pct <= 100) return "bg-gradient-to-r from-amber-500 to-yellow-400";
    return "bg-gradient-to-r from-rose-500 to-pink-500";
  }

  return (
    <div className="space-y-6 -mx-6 -my-6 px-6 py-6 min-h-[80vh] bg-gradient-to-b from-slate-950 via-indigo-950/30 to-slate-950 rounded-2xl">
      {/* Hero */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-300/80">
              Centro de Operaciones de Costos
            </span>
          </div>
          <h2 className="text-2xl font-bold mt-1">
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Costos vinculados a proyectos
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Cada gasto cargado impacta la rentabilidad del proyecto al instante.
          </p>
        </div>
        <Button
          onClick={() => {
            setUploaderProjectId(null);
            setUploaderOpen(true);
          }}
          className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-900/40 border-0"
        >
          <Upload className="w-4 h-4" />
          Cargar costos
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative rounded-2xl p-4 overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-950 to-violet-950 ring-1 ring-violet-500/20 shadow-xl shadow-violet-900/20">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-violet-300/80">
              Total presupuestado
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center ring-1 ring-violet-400/30">
              <Wallet className="w-3.5 h-3.5 text-violet-300" />
            </div>
          </div>
          <p className="relative text-xl font-bold text-white tabular-nums">
            {formatCurrency(kpis.totalPresupuestado)}
          </p>
          <p className="relative text-[10px] text-violet-300/70 mt-0.5">
            {rows.length} proyectos abril 2026
          </p>
        </div>

        <div className="relative rounded-2xl p-4 overflow-hidden bg-gradient-to-br from-fuchsia-950 via-rose-950 to-purple-950 ring-1 ring-fuchsia-500/20 shadow-xl shadow-fuchsia-900/20">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-fuchsia-300/80">
              Total ejecutado
            </span>
            <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 flex items-center justify-center ring-1 ring-fuchsia-400/30">
              <Activity className="w-3.5 h-3.5 text-fuchsia-300" />
            </div>
          </div>
          <p className="relative text-xl font-bold text-white tabular-nums">
            {formatCurrency(kpis.totalEjecutado)}
          </p>
          <p className="relative text-[10px] text-fuchsia-300/70 mt-0.5">
            Gastos reales acumulados
          </p>
        </div>

        <div className="relative rounded-2xl p-4 overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 ring-1 ring-emerald-500/20 shadow-xl shadow-emerald-900/20">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-300/80">
              % Ejecucion promedio
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-400/30">
              <TrendingUpIcon className="w-3.5 h-3.5 text-emerald-300" />
            </div>
          </div>
          <p className="relative text-xl font-bold text-white tabular-nums">
            {kpis.avgPct}%
          </p>
          <p className="relative text-[10px] text-emerald-300/70 mt-0.5">
            Real / presupuesto
          </p>
        </div>

        <div className="relative rounded-2xl p-4 overflow-hidden bg-gradient-to-br from-rose-950 via-red-950 to-slate-900 ring-1 ring-rose-500/20 shadow-xl shadow-rose-900/20">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-rose-300/80">
              Sobre presupuesto
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center ring-1 ring-rose-400/30">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-300" />
            </div>
          </div>
          <p className="relative text-xl font-bold text-white tabular-nums">
            {kpis.sobre}
          </p>
          <p className="relative text-[10px] text-rose-300/70 mt-0.5">
            requieren atencion
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar proyecto, vendedor o PM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white/5 ring-1 ring-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(Object.keys(PROJECT_STATUS_LABELS) as ProjectCostStatusFilter[]).map((k) => {
            const isActive = statusFilter === k;
            const count = k === "all" ? rows.length : rows.filter((r) => r.status === k).length;
            return (
              <button
                key={k}
                onClick={() => setStatusFilter(k)}
                className={`text-[11px] px-2.5 py-1 rounded-full transition ${
                  isActive
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-900/40"
                    : "bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10"
                }`}
              >
                {PROJECT_STATUS_LABELS[k]}{" "}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 via-indigo-950/30 to-slate-900/80 ring-1 ring-white/10 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Proyecto
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Vendedor
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Venta
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 w-[260px]">
                  Costos real / presupuesto
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Margen
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    Sin proyectos que coincidan con el filtro
                  </td>
                </tr>
              )}
              {filtered.map((r) => {
                const pct = r.pct_ejecucion;
                const widthPct = Math.min(pct, 130);
                return (
                  <tr
                    key={r.id}
                    className="group border-b border-white/5 last:border-b-0 hover:bg-gradient-to-r hover:from-violet-500/[0.06] hover:via-fuchsia-500/[0.04] hover:to-transparent transition-colors cursor-pointer"
                    onClick={() => setDetailRow(r)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-100 group-hover:text-violet-300 transition-colors line-clamp-1">
                        {r.deal_name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {r.event_date} · PM {r.pm_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{r.vendedor_name}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-200 tabular-nums">
                      {formatCurrency(r.venta)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] tabular-nums">
                          <span className="text-slate-200 font-mono">
                            {formatCurrency(r.total_ejecutado)}
                          </span>
                          <span className="text-slate-500 font-mono">
                            / {formatCurrency(r.total_estimado || 0)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${progressBarColor(pct)} transition-all`}
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">
                            {r.total_estimado > 0 ? `${pct}%` : "Sin presupuesto"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.total_ejecutado > 0 ? (
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            r.margen >= 30
                              ? "text-emerald-400"
                              : r.margen >= 15
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {r.margen}%
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`${PROJECT_STATUS_TONE[r.status]} border-0 text-[10px]`}>
                        {PROJECT_STATUS_LABELS[r.status]}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog
        open={!!detailRow}
        onOpenChange={(open) => {
          if (!open) setDetailRow(null);
        }}
      >
        {detailRow && (
          <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 ring-1 ring-white/10 text-white p-0 overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-white/5">
              <DialogHeader>
                <DialogTitle className="text-base text-white">
                  {detailRow.deal_name}
                </DialogTitle>
                <p className="text-[11px] text-slate-400">
                  {detailRow.event_date} · {detailRow.vendedor_name} · PM {detailRow.pm_name}
                </p>
              </DialogHeader>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Totales */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Venta</p>
                  <p className="text-base font-bold text-white tabular-nums mt-1">
                    {formatCurrency(detailRow.venta)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Ejecutado</p>
                  <p className="text-base font-bold text-fuchsia-300 tabular-nums mt-1">
                    {formatCurrency(detailRow.total_ejecutado)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Margen</p>
                  <p
                    className={`text-base font-bold tabular-nums mt-1 ${
                      detailRow.margen >= 30
                        ? "text-emerald-400"
                        : detailRow.margen >= 15
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {detailRow.total_ejecutado > 0 ? `${detailRow.margen}%` : "—"}
                  </p>
                </div>
              </div>

              {/* Por concepto */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80 mb-2">
                  Detalle por concepto
                </p>
                <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/5 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400">
                        <th className="px-3 py-2 text-left font-medium">Concepto</th>
                        <th className="px-3 py-2 text-right font-medium">Presupuesto</th>
                        <th className="px-3 py-2 text-right font-medium">Real</th>
                        <th className="px-3 py-2 text-right font-medium">Var.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Costos directos", pres: detailRow.fin.costos_presupuesto, real: detailRow.fin.costos_real },
                        { label: "Gasolina", pres: detailRow.fin.gasolina_presupuesto, real: detailRow.fin.gasolina_real },
                        { label: "Internet", pres: detailRow.fin.internet_presupuesto, real: detailRow.fin.internet_real },
                        { label: "Operacion", pres: detailRow.fin.operacion_presupuesto, real: detailRow.fin.operacion_real },
                        { label: "Instalacion", pres: detailRow.fin.instalacion_presupuesto, real: detailRow.fin.instalacion_real },
                        { label: "Ubers", pres: detailRow.fin.ubers_presupuesto, real: detailRow.fin.ubers_real },
                        { label: "Extras", pres: detailRow.fin.extras_presupuesto, real: detailRow.fin.extras_real },
                        { label: "Viaticos (gasto)", pres: 0, real: detailRow.fin.viaticos_gasto },
                      ].map((row) => {
                        const variance = row.real - row.pres;
                        return (
                          <tr key={row.label} className="border-b border-white/5 last:border-b-0">
                            <td className="px-3 py-2 text-slate-200">{row.label}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-400">
                              {row.pres > 0 ? formatCurrency(row.pres) : "—"}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-white">
                              {row.real > 0 ? formatCurrency(row.real) : "—"}
                            </td>
                            <td className="px-3 py-2 text-right font-mono">
                              {row.pres === 0 && row.real === 0 ? (
                                <span className="text-slate-600">—</span>
                              ) : (
                                <span
                                  className={
                                    variance > 0 ? "text-rose-400" : variance < 0 ? "text-emerald-400" : "text-slate-500"
                                  }
                                >
                                  {variance > 0 ? "+" : ""}
                                  {formatCurrency(variance)}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  className="gap-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-900/40 border-0"
                  onClick={() => {
                    setUploaderProjectId(detailRow.id);
                    setUploaderOpen(true);
                    setDetailRow(null);
                  }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Cargar costos
                </Button>
                <Link
                  href={`/projects/${detailRow.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-white/5 ring-1 ring-white/10 text-slate-200 hover:bg-white/10 transition"
                >
                  Ver proyecto
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Uploader dialog */}
      <Dialog
        open={uploaderOpen}
        onOpenChange={(open) => {
          setUploaderOpen(open);
          if (!open) setUploaderProjectId(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl p-0 bg-transparent ring-0 border-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Cargar costos a proyecto</DialogTitle>
          </DialogHeader>
          <ProjectCostUploader
            initialProjectId={uploaderProjectId ?? undefined}
            onClose={() => setUploaderOpen(false)}
            onApplied={handleUploaderApplied}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────
export default function CostCenterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "cost" | "margin" | "usage">("usage");
  const [topTab, setTopTab] = useState<"proyectos" | "catalogo">("proyectos");
  const [refreshKey] = useState(0);

  const filteredProducts = PRODUCTS
    .filter((p) => categoryFilter === "all" || p.category === categoryFilter)
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "cost") return b.costoPromedio - a.costoPromedio;
      if (sortBy === "margin") return b.margenPromedio - a.margenPromedio;
      return b.proyectosUsado - a.proyectosUsado;
    });

  const avgMargin = Math.round(PRODUCTS.filter((p) => p.margenPromedio > 0).reduce((s, p) => s + p.margenPromedio, 0) / PRODUCTS.filter((p) => p.margenPromedio > 0).length * 100) / 100;
  const costosSubiendo = PRODUCTS.filter((p) => p.tendencia === "up").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Costos</h1>
          <p className="text-sm text-gray-500 mt-1">Costos vinculados a proyectos, catalogo de productos, proveedores y tarifario.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700 border-green-200">
            <History className="w-3 h-3" /> Ultima actualizacion: hace 2 hrs
          </Badge>
          <Button variant="outline" className="gap-2" size="sm">
            <Download className="w-4 h-4" /> Exportar
          </Button>
        </div>
      </div>

      {/* Top-level tab switch */}
      <Tabs value={topTab} onValueChange={(v) => setTopTab(v as "proyectos" | "catalogo")}>
        <TabsList>
          <TabsTrigger value="proyectos" className="gap-2">
            <FolderKanban className="w-4 h-4" />
            Costos por Proyecto
          </TabsTrigger>
          <TabsTrigger value="catalogo" className="gap-2">
            <Package className="w-4 h-4" />
            Catalogo & Tarifario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proyectos" className="mt-4">
          <ProjectCostsTab refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="catalogo" className="mt-4 space-y-6">
          {/* Uploader for catalog */}
          <CostsUploader />

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <Package className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Productos/Servicios</p>
                <p className="text-2xl font-bold">{PRODUCTS.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Proveedores</p>
                <p className="text-2xl font-bold">{PROVEEDORES.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Margen Promedio</p>
                <p className="text-2xl font-bold text-green-600">{avgMargin}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Costos subiendo</p>
                <p className="text-2xl font-bold text-orange-600">{costosSubiendo}</p>
                <p className="text-[10px] text-gray-400">requieren atencion</p>
              </CardContent>
            </Card>
          </div>

          {/* Catalog content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="productos">
                <TabsList>
                  <TabsTrigger value="productos">Productos & Servicios</TabsTrigger>
                  <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
                  <TabsTrigger value="tarifario">Tarifario Base</TabsTrigger>
                </TabsList>

            {/* ── Tab: Productos ── */}
            <TabsContent value="productos" className="mt-4 space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto o servicio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Todas las categorias</option>
                  {Object.entries(CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="usage">Mas usado</option>
                  <option value="cost">Mayor costo</option>
                  <option value="margin">Mayor margen</option>
                  <option value="name">Nombre A-Z</option>
                </select>
              </div>

              {/* Products table */}
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Producto/Servicio</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Costo Prom.</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Rango</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Venta Sugerida</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Margen</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Proyectos</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Tendencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 cursor-pointer group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{p.name}</span>
                              <Badge className={`text-[10px] ${CAT_COLORS[p.category]}`}>{CATEGORIES[p.category]}</Badge>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">Actualizado: {p.ultimaActualizacion}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold">{formatCurrency(p.costoPromedio)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-[11px] text-gray-400">{formatCurrency(p.costoMin)} - {formatCurrency(p.costoMax)}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {p.precioVentaSugerido > 0 ? formatCurrency(p.precioVentaSugerido) : <span className="text-gray-300">N/A</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {p.margenPromedio > 0 ? (
                              <span className={`font-mono font-bold ${p.margenPromedio >= 50 ? "text-green-600" : p.margenPromedio >= 30 ? "text-yellow-600" : "text-red-600"}`}>
                                {p.margenPromedio}%
                              </span>
                            ) : <span className="text-gray-300">-</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="secondary" className="font-mono">{p.proyectosUsado}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <TrendIcon trend={p.tendencia} variacion={p.variacion} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Tab: Proveedores ── */}
            <TabsContent value="proveedores" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Proveedor</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Servicio</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Costo Prom.</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Ultimo Precio</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Calificacion</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Proyectos</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Entrega</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Tendencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {PROVEEDORES.map((pv) => (
                        <tr key={pv.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{pv.nombre}</p>
                            <p className="text-[11px] text-gray-400">{pv.contacto}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{pv.servicio}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatCurrency(pv.costoPromedio)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-mono font-bold">{formatCurrency(pv.ultimoPrecio)}</span>
                            <p className="text-[10px] text-gray-400">{pv.ultimaFecha}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Stars rating={pv.calificacion} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="secondary" className="font-mono">{pv.proyectos}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-500">{pv.tiempoEntrega}</td>
                          <td className="px-4 py-3 text-right">
                            <TrendIcon trend={pv.tendencia} variacion={pv.variacion} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Tab: Tarifario ── */}
            <TabsContent value="tarifario" className="mt-4 space-y-4">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
                <Tag className="w-4 h-4" />
                Este tarifario se actualiza automaticamente con los costos promedio de proyectos finalizados. Los precios minimos de venta garantizan el margen objetivo.
              </div>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Producto</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Costo Base</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Margen Min.</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Precio Min. Venta</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Precio Sugerido</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Max. Visto</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {TARIFARIO.map((t) => (
                        <tr key={t.producto} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{t.producto}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatCurrency(t.costoBase)}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-yellow-100 text-yellow-700">{t.margenMinimo}%</Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-red-600 font-bold">{formatCurrency(t.precioMinVenta)}</td>
                          <td className="px-4 py-3 text-right font-mono text-green-600 font-bold">{formatCurrency(t.precioSugerido)}</td>
                          <td className="px-4 py-3 text-right font-mono text-blue-600">{formatCurrency(t.precioMaxVisto)}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{t.notas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar - Cotizador */}
        <div className="space-y-4">
          <CotizadorRapido />

          {/* Alertas de costos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Alertas de Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PRODUCTS.filter((p) => p.tendencia === "up" && p.variacion > 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-orange-900">{p.name}</p>
                    <p className="text-[10px] text-orange-600">Subio {p.variacion}% vs promedio</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </div>
              ))}
              {PROVEEDORES.filter((pv) => pv.tendencia === "up" && pv.variacion > 10).map((pv) => (
                <div key={pv.id} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-red-900">{pv.nombre}</p>
                    <p className="text-[10px] text-red-600">Precio subio {pv.variacion}% - buscar alternativa?</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-red-500" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
