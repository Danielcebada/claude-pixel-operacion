"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { formatCurrency, getMarginColor, getMarginLabel } from "@/lib/types";
import { ArrowLeft, ExternalLink, Trash2, AlertTriangle, BookCheck, Plus, X, RotateCcw, CheckCircle2, Clock, CircleDot, Circle, Database, FileText } from "lucide-react";
import Link from "next/link";
import { OdooStatusCard } from "@/components/machote/odoo-status-card";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FinancialState {
  venta_presupuesto: number;
  venta_real: number;
  costos_presupuesto: number;
  costos_real: number;
  gasolina_presupuesto: number;
  gasolina_real: number;
  internet_presupuesto: number;
  internet_real: number;
  operacion_presupuesto: number;
  operacion_real: number;
  instalacion_presupuesto: number;
  instalacion_real: number;
  ubers_presupuesto: number;
  ubers_real: number;
  extras_presupuesto: number;
  extras_real: number;
  viaticos_venta: number;
  viaticos_gasto: number;
  viaticos_uber: number;
}

interface Computed {
  utilidad_bruta_presupuesto: number;
  utilidad_bruta_real: number;
  total_gastos_presupuesto: number;
  total_gastos_real: number;
  utilidad_neta_presupuesto: number;
  utilidad_neta_real: number;
  utilidad_viaticos: number;
  utilidad_total: number;
  pct_margen: number;
}

interface CommissionRule {
  id: string;
  rol: string;
  persona: string;
  porcentaje: number;
}

type WorkflowStatus = "pendiente" | "presupuesto_confirmado" | "en_operacion" | "operado" | "finalizado";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  presupuesto_confirmado: "Presupuesto OK",
  en_operacion: "En Operacion",
  operado: "Operado",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pendiente: "bg-gray-100 text-gray-600",
  presupuesto_confirmado: "bg-orange-50 text-orange-600",
  en_operacion: "bg-blue-50 text-blue-600",
  operado: "bg-green-50 text-green-600",
  finalizado: "bg-gray-200 text-gray-500",
  cancelado: "bg-red-50 text-red-600",
};

const PAYMENT_LABELS: Record<string, string> = {
  pagado_100: "Pagado 100%",
  parcial: "Parcial",
  pendiente: "Pendiente",
};

const PAYMENT_COLORS: Record<string, string> = {
  pagado_100: "bg-green-50 text-green-600",
  parcial: "bg-yellow-50 text-yellow-600",
  pendiente: "bg-amber-50 text-amber-600",
};

// ─── LocalStorage Persistence ────────────────────────────────────────────────

interface PersistedState {
  fin: FinancialState;
  status: WorkflowStatus;
  presupuestoConfirmado: boolean;
  savedAt: number;
}

function storageKey(projectId: string): string {
  return `pixel_project_financials_${projectId}`;
}

function loadPersisted(projectId: string): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(projectId));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function savePersisted(projectId: string, state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(projectId), JSON.stringify(state));
  } catch {
    // Ignore quota errors / serialization errors
  }
}

function clearPersisted(projectId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(projectId));
  } catch {
    // Ignore
  }
}

function formatSecondsAgo(fromMs: number, nowMs: number): string {
  const diffSec = Math.max(0, Math.floor((nowMs - fromMs) / 1000));
  if (diffSec < 5) return "hace unos segundos";
  if (diffSec < 60) return `hace ${diffSec} segundos`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? "minuto" : "minutos"}`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} ${diffH === 1 ? "hora" : "horas"}`;
  const diffD = Math.floor(diffH / 24);
  return `hace ${diffD} ${diffD === 1 ? "dia" : "dias"}`;
}

function computeAll(f: FinancialState): Computed {
  const utilidad_bruta_presupuesto = f.venta_presupuesto - f.costos_presupuesto;
  const utilidad_bruta_real = f.venta_real - f.costos_real;

  const total_gastos_presupuesto =
    f.gasolina_presupuesto + f.internet_presupuesto + f.operacion_presupuesto +
    f.instalacion_presupuesto + f.ubers_presupuesto + f.extras_presupuesto;
  const total_gastos_real =
    f.gasolina_real + f.internet_real + f.operacion_real +
    f.instalacion_real + f.ubers_real + f.extras_real;

  const utilidad_neta_presupuesto = utilidad_bruta_presupuesto - total_gastos_presupuesto;
  const utilidad_neta_real = utilidad_bruta_real - total_gastos_real;

  const utilidad_viaticos = f.viaticos_venta - f.viaticos_gasto - f.viaticos_uber;
  const utilidad_total = utilidad_neta_real + utilidad_viaticos;
  const totalVenta = f.venta_real + f.viaticos_venta;
  const pct_margen = totalVenta > 0 ? Math.round((utilidad_total / totalVenta) * 10000) / 100 : 0;

  return {
    utilidad_bruta_presupuesto, utilidad_bruta_real,
    total_gastos_presupuesto, total_gastos_real,
    utilidad_neta_presupuesto, utilidad_neta_real,
    utilidad_viaticos, utilidad_total, pct_margen,
  };
}

// ─── Workflow Stepper ────────────────────────────────────────────────────────

const WORKFLOW_STEPS = [
  { key: "presupuesto", label: "Presupuesto" },
  { key: "pago", label: "Pago" },
  { key: "operacion", label: "Operacion" },
  { key: "cierre", label: "Cierre" },
] as const;

function getStepIndex(status: WorkflowStatus): number {
  switch (status) {
    case "pendiente": return 0;
    case "presupuesto_confirmado": return 1;
    case "en_operacion": return 2;
    case "operado":
    case "finalizado": return 3;
    default: return 0;
  }
}

function WorkflowStepper({ status, anticipoPagado }: { status: WorkflowStatus; anticipoPagado: boolean }) {
  const currentStep = getStepIndex(status);

  function getStepState(idx: number): "completed" | "current" | "upcoming" {
    if (idx < currentStep) return "completed";
    if (idx === currentStep) return "current";
    return "upcoming";
  }

  function getStepSubLabel(idx: number): string {
    const state = getStepState(idx);
    if (idx === 0) {
      return state === "completed" || currentStep > 0 ? "Confirmado" : "Pendiente";
    }
    if (idx === 1) {
      if (anticipoPagado) return "Pagado";
      if (currentStep >= 1) return "Pendiente";
      return "--";
    }
    if (idx === 2) {
      if (status === "en_operacion") return "En curso";
      if (currentStep > 2) return "Completado";
      return "Por ejecutar";
    }
    if (idx === 3) {
      if (status === "finalizado") return "Finalizado";
      if (status === "operado") return "Por revisar";
      return "--";
    }
    return "--";
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.map((step, idx) => {
          const state = getStepState(idx);
          // Special case: pago step shows warning if not paid but presupuesto is confirmed
          const isPaymentWarning = idx === 1 && !anticipoPagado && currentStep >= 1;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center gap-2">
                  {state === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : state === "current" ? (
                    isPaymentWarning ? (
                      <Clock className="w-5 h-5 text-amber-500" />
                    ) : (
                      <CircleDot className="w-5 h-5 text-blue-500" />
                    )
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                  <span className={`text-xs font-semibold uppercase tracking-wide ${
                    state === "completed" ? "text-green-600" :
                    state === "current" ? (isPaymentWarning ? "text-amber-600" : "text-blue-600") :
                    "text-gray-400"
                  }`}>
                    {step.label}
                  </span>
                </div>
                <span className={`text-[10px] mt-0.5 ${
                  state === "completed" ? "text-green-500" :
                  isPaymentWarning ? "text-amber-500" :
                  state === "current" ? "text-blue-500" :
                  "text-gray-300"
                }`}>
                  {getStepSubLabel(idx)}
                </span>
              </div>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div className={`h-0.5 w-8 mx-1 flex-shrink-0 rounded ${
                  idx < currentStep ? "bg-green-300" : "bg-gray-200"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Number Input ────────────────────────────────────────────────────────────

function NumInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState("");

  const handleFocus = () => {
    setFocused(true);
    setRaw(value === 0 ? "" : String(value));
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseFloat(raw) || 0;
    onChange(Math.round(parsed));
  };

  return (
    <input
      type={focused ? "number" : "text"}
      value={focused ? raw : (value === 0 ? "$0" : formatCurrency(value))}
      onChange={(e) => setRaw(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="w-full h-8 text-right font-mono text-sm bg-transparent border-0 hover:bg-gray-50 focus:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-2 transition-colors"
    />
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const project = MOCK_PROJECTS.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg text-gray-500">Proyecto no encontrado</p>
        <Link href="/projects" className="text-blue-600 hover:underline text-sm">Volver a proyectos</Link>
      </div>
    );
  }

  return <ProjectDetail project={project} />;
}

function ProjectDetail({ project }: { project: (typeof MOCK_PROJECTS)[number] }) {
  const router = useRouter();
  const f = project.financials;

  // ── Defaults pulled from MOCK_PROJECTS ──
  const defaultFin = useMemo<FinancialState>(() => ({
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
  }), [f]);

  const defaultStatus: WorkflowStatus =
    project.status === "cancelado" ? "pendiente" : (project.status as WorkflowStatus);

  // ── Financial state (defaults initially, hydrated from localStorage on mount) ──
  const [fin, setFin] = useState<FinancialState>(defaultFin);
  const [status, setStatus] = useState<WorkflowStatus>(defaultStatus);
  const [presupuestoConfirmado, setPresupuestoConfirmado] = useState(project.presupuesto_confirmado);

  // Non-persisted UI state (stays on the Project record for now)
  const [paymentStatus, setPaymentStatus] = useState(project.payment_status);
  const [anticipoPagado, setAnticipoPagado] = useState(project.anticipo_pagado);

  // Persistence tracking
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [, setNowTick] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── On mount: hydrate from localStorage merged with defaults ──
  useEffect(() => {
    const persisted = loadPersisted(project.id);
    if (persisted) {
      setFin({ ...defaultFin, ...persisted.fin });
      if (persisted.status) setStatus(persisted.status);
      if (typeof persisted.presupuestoConfirmado === "boolean") {
        setPresupuestoConfirmado(persisted.presupuestoConfirmado);
      }
      if (persisted.savedAt) setSavedAt(persisted.savedAt);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  // ── Debounced persist (500ms) whenever persisted slice changes ──
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const now = Date.now();
      savePersisted(project.id, {
        fin,
        status,
        presupuestoConfirmado,
        savedAt: now,
      });
      setSavedAt(now);
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [fin, status, presupuestoConfirmado, hydrated, project.id]);

  // ── Refresh "hace X segundos" label once per second ──
  useEffect(() => {
    if (!savedAt) return;
    const id = setInterval(() => setNowTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [savedAt]);

  const update = useCallback((key: keyof FinancialState, value: number) => {
    setFin((prev) => ({ ...prev, [key]: value }));
  }, []);

  const computed = useMemo(() => computeAll(fin), [fin]);

  // ── Restore originals ──
  const handleRestoreOriginals = useCallback(() => {
    clearPersisted(project.id);
    setFin(defaultFin);
    setStatus(defaultStatus);
    setPresupuestoConfirmado(project.presupuesto_confirmado);
    setSavedAt(null);
  }, [project.id, defaultFin, defaultStatus, project.presupuesto_confirmado]);

  // ── Mark as confirmed (persists via debounce effect) ──
  const handleMarcarConfirmado = useCallback(() => {
    setPresupuestoConfirmado(true);
    setStatus((prev) => (prev === "pendiente" ? "presupuesto_confirmado" : prev));
  }, []);

  // ── Commissions ──
  const isDanielVendedor = (project.vendedor_name || "").toLowerCase().includes("daniel");

  const defaultRules: CommissionRule[] = [
    { id: "cr1", rol: "Vendedor", persona: project.vendedor_name || "", porcentaje: 4.5 },
    { id: "cr2", rol: "PM", persona: project.pm_name || "", porcentaje: 3 },
    { id: "cr3", rol: "Productor", persona: "Alvaro Solis", porcentaje: 2 },
    { id: "cr4", rol: "Dir. Operaciones", persona: "Joyce Perez", porcentaje: 0.75 },
    ...(isDanielVendedor ? [] : [{ id: "cr5", rol: "Dir. Ventas", persona: "Pricila Dominguez", porcentaje: 0.75 }]),
  ];

  const [commissions, setCommissions] = useState<CommissionRule[]>(defaultRules);

  const commissionCalcs = useMemo(() => {
    return commissions.map((c) => ({
      ...c,
      monto: Math.round((computed.utilidad_total * c.porcentaje) / 100),
    }));
  }, [commissions, computed.utilidad_total]);

  const totalComisiones = commissionCalcs.reduce((s, c) => s + c.monto, 0);
  const totalPct = commissions.reduce((s, c) => s + c.porcentaje, 0);

  // ── Delete ──
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm1" | "confirm2" | "deleting" | "deleted">("idle");
  const [deleteText, setDeleteText] = useState("");
  const expectedDeleteText = project.deal_name.substring(0, 10).toUpperCase();

  const handleDelete = async () => {
    setDeleteStep("deleting");
    await new Promise((r) => setTimeout(r, 1500));
    setDeleteStep("deleted");
    setTimeout(() => router.push("/projects"), 1500);
  };

  // ── Workflow actions ──
  const handleConfirmarPresupuesto = () => {
    setPresupuestoConfirmado(true);
    setStatus("presupuesto_confirmado");
  };

  const handleEjecutarEvento = () => {
    setStatus("en_operacion");
  };

  const handleMarcarOperado = () => {
    setStatus("operado");
  };

  const handleFinalizar = () => {
    setStatus("finalizado");
  };

  // ── Variance helper ──
  function varianceCell(presupuesto: number, real: number, invertSign = false) {
    const diff = real - presupuesto;
    if (diff === 0) return <span className="text-gray-300">&mdash;</span>;
    const favorable = invertSign ? diff < 0 : diff > 0;
    const color = favorable ? "text-green-600" : "text-red-500";
    const label = (diff > 0 ? "+" : "") + formatCurrency(diff);
    return <span className={`${color}`}>{label}</span>;
  }

  // ── Row builders ──
  function EditableRow({
    label, presKey, realKey, invertVariance, indent,
  }: {
    label: string;
    presKey: keyof FinancialState;
    realKey: keyof FinancialState;
    invertVariance?: boolean;
    indent?: boolean;
  }) {
    return (
      <tr className="hover:bg-gray-50/50">
        <td className={`px-4 py-1.5 text-sm text-gray-600 ${indent ? "pl-8" : ""}`}>{label}</td>
        <td className="px-1 py-1"><NumInput value={fin[presKey]} onChange={(v) => update(presKey, v)} /></td>
        <td className="px-1 py-1"><NumInput value={fin[realKey]} onChange={(v) => update(realKey, v)} /></td>
        <td className="px-3 py-1.5 text-right font-mono text-sm">{varianceCell(fin[presKey], fin[realKey], invertVariance)}</td>
      </tr>
    );
  }

  function ComputedRow({ label, presupuesto, real, invertVariance, dark }: {
    label: string; presupuesto: number; real: number; invertVariance?: boolean; dark?: boolean;
  }) {
    return (
      <tr className={dark ? "bg-gray-900 text-white" : "bg-gray-100"}>
        <td className={`px-4 py-2 text-sm font-semibold ${dark ? "text-white" : "text-gray-700"}`}>{label}</td>
        <td className={`px-3 py-2 text-right font-mono text-sm ${dark ? "text-gray-200" : ""}`}>{formatCurrency(presupuesto)}</td>
        <td className={`px-3 py-2 text-right font-mono text-sm ${dark ? "text-white font-bold" : "font-semibold"}`}>{formatCurrency(real)}</td>
        <td className={`px-3 py-2 text-right font-mono text-sm ${dark ? (real - presupuesto >= 0 ? "text-green-400" : "text-red-400") : ""}`}>
          {dark ? varianceCell(presupuesto, real, invertVariance) : varianceCell(presupuesto, real, invertVariance)}
        </td>
      </tr>
    );
  }

  function SectionHeader({ label }: { label: string }) {
    return (
      <tr className="bg-gray-50 border-t border-gray-200">
        <td colSpan={4} className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</td>
      </tr>
    );
  }

  // ── Margin badge color ──
  const marginColor = computed.pct_margen >= 30 ? "bg-green-500" : computed.pct_margen >= 15 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="space-y-6 pb-12 max-w-5xl">

      {/* ═══ LOCAL STORAGE BANNER ═══ */}
      <div className="flex items-start gap-2 px-3 py-2 border border-blue-200 bg-blue-50 rounded-md text-xs text-blue-700">
        <Database className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
        <span>
          Datos guardados localmente. Para guardar en base de datos, configura Supabase.
        </span>
      </div>

      {/* ═══ HEADER ═══ */}
      <div className="flex items-start gap-3">
        <Link href="/projects" className="mt-1.5 p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-900 leading-tight flex-1 min-w-0">{project.deal_name}</h1>
            <Link
              href={`/contracts/new?projectId=${project.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors flex-shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              Generar Contrato
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[status] || status}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${PAYMENT_COLORS[paymentStatus]}`}>
              {PAYMENT_LABELS[paymentStatus]}
            </span>
            {computed.pct_margen > 0 && (
              <span className={`px-2.5 py-0.5 text-xs font-bold text-white rounded-full ${marginColor}`}>
                {computed.pct_margen}% {getMarginLabel(computed.pct_margen)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
            <span>Vendedor: <strong className="text-gray-600">{project.vendedor_name}</strong></span>
            <span>PM: <strong className="text-gray-600">{project.pm_name}</strong></span>
            <span>{project.event_date}</span>
            <span>{project.product_type}</span>
            {project.hubspot_deal_id && (
              <a
                href={`https://app.hubspot.com/contacts/26306830/deal/${project.hubspot_deal_id}`}
                target="_blank" rel="noopener"
                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
              >
                HubSpot <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ═══ WORKFLOW STEPPER ═══ */}
      <WorkflowStepper status={status} anticipoPagado={anticipoPagado} />

      {/* ═══ ODOO STATUS CARD ═══ */}
      <OdooStatusCard dealName={project.deal_name} />

      {/* ═══ CONTEXTUAL ACTION CARD ═══ */}
      {(() => {
        // Step 1: Presupuesto not confirmed yet
        if (!presupuestoConfirmado && status === "pendiente") {
          return (
            <div className="border border-gray-200 bg-gray-50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl">📋</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">Llena el presupuesto abajo y confirma</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Revisa los costos estimados en la tabla de abajo. Una vez listo, confirma el presupuesto para avanzar.
                  </p>
                  <button
                    onClick={handleConfirmarPresupuesto}
                    className="mt-3 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    CONFIRMAR PRESUPUESTO
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // Step 2a: Presupuesto confirmed, anticipo NOT paid
        if ((status === "presupuesto_confirmado") && !anticipoPagado) {
          return (
            <div className="border border-amber-300 bg-amber-50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-800">
                    Anticipo pendiente: {formatCurrency(project.anticipo_requerido)} (50%)
                  </h3>
                  <p className="text-xs text-amber-700 mt-1">
                    Se notifico a Ventas ({project.vendedor_name}) y Administracion
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Puedes ejecutar el evento, pero el pago sigue pendiente.
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={handleEjecutarEvento}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      EJECUTAR EVENTO
                    </button>
                    <button
                      onClick={() => setAnticipoPagado(true)}
                      className="px-4 py-2 border border-green-400 text-green-700 hover:bg-green-50 text-sm font-medium rounded-lg transition-colors"
                    >
                      Confirmar Pago
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Step 2b: Presupuesto confirmed AND anticipo paid
        if (status === "presupuesto_confirmado" && anticipoPagado) {
          return (
            <div className="border border-green-300 bg-green-50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-800">
                    Presupuesto confirmado y pago recibido
                  </h3>
                  <p className="text-xs text-green-600 mt-1">
                    Proyecto listo para operar
                  </p>
                  <button
                    onClick={handleEjecutarEvento}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    EJECUTAR EVENTO
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // Step 3: In operation
        if (status === "en_operacion") {
          return (
            <div className="border border-blue-300 bg-blue-50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl">🔵</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-800">
                    Evento en operacion
                  </h3>
                  <p className="text-xs text-blue-600 mt-1">
                    Llena los costos y gastos REALES en la tabla de abajo
                  </p>
                  {!anticipoPagado && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
                      <span className="text-xs">⚠️</span>
                      <span className="text-xs text-amber-700">Anticipo aun pendiente — {formatCurrency(project.anticipo_requerido)}</span>
                      <button
                        onClick={() => setAnticipoPagado(true)}
                        className="ml-auto text-xs text-green-700 font-medium hover:underline"
                      >
                        Confirmar pago
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleMarcarOperado}
                    className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    MARCAR COMO OPERADO
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // Step 4a: Operated, pending admin review
        if (status === "operado") {
          return (
            <div className="border border-green-300 bg-green-50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-800">
                    Evento operado — Pendiente revision admin
                  </h3>
                  {!anticipoPagado && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
                      <span className="text-xs">⚠️</span>
                      <span className="text-xs text-amber-700">Anticipo aun pendiente</span>
                    </div>
                  )}
                  <button
                    onClick={handleFinalizar}
                    className="mt-3 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    FINALIZAR PROYECTO
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // Step 4b: Finalized
        if (status === "finalizado") {
          return (
            <div className="border border-gray-200 bg-gray-50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Proyecto finalizado</h3>
                  <p className="text-xs text-gray-500 mt-1">Todos los pasos han sido completados.</p>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })()}

      {/* ═══ FINANCIAL TABLE (THE STAR) ═══ */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Estado de Resultados</h2>
            <p className="text-xs text-gray-400 mt-0.5">Edita cualquier celda. Todo se recalcula al instante.</p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              {savedAt ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden />
                  <span className="text-gray-500">Guardado {formatSecondsAgo(savedAt, Date.now())}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-gray-300" aria-hidden />
                  <span className="text-gray-400">Sin cambios guardados</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="uppercase tracking-wide font-medium">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkflowStatus)}
                className="border border-gray-200 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pendiente">Pendiente</option>
                <option value="presupuesto_confirmado">Presupuesto Confirmado</option>
                <option value="en_operacion">En Operacion</option>
                <option value="operado">Operado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </label>
            <button
              onClick={handleMarcarConfirmado}
              disabled={presupuestoConfirmado}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium rounded-md transition-colors"
              title={presupuestoConfirmado ? "Presupuesto ya confirmado" : "Marcar presupuesto como confirmado"}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marcar como confirmado
            </button>
            <button
              onClick={handleRestoreOriginals}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-md transition-colors"
              title="Descartar cambios locales y restaurar los valores originales"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar valores originales
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[220px]">Concepto</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[150px]">Presupuesto</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[150px]">Real</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider w-[130px]">Varianza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* INGRESOS */}
              <SectionHeader label="Ingresos" />
              <EditableRow label="Venta" presKey="venta_presupuesto" realKey="venta_real" />

              {/* COSTOS */}
              <SectionHeader label="Costos Directos" />
              <EditableRow label="Costos" presKey="costos_presupuesto" realKey="costos_real" invertVariance indent />
              <ComputedRow label="Utilidad Bruta" presupuesto={computed.utilidad_bruta_presupuesto} real={computed.utilidad_bruta_real} />

              {/* GASTOS */}
              <SectionHeader label="Gastos de Operacion" />
              <EditableRow label="Gasolina" presKey="gasolina_presupuesto" realKey="gasolina_real" invertVariance indent />
              <EditableRow label="Internet" presKey="internet_presupuesto" realKey="internet_real" invertVariance indent />
              <EditableRow label="Operacion" presKey="operacion_presupuesto" realKey="operacion_real" invertVariance indent />
              <EditableRow label="Instalacion" presKey="instalacion_presupuesto" realKey="instalacion_real" invertVariance indent />
              <EditableRow label="Ubers" presKey="ubers_presupuesto" realKey="ubers_real" invertVariance indent />
              <EditableRow label="Extras" presKey="extras_presupuesto" realKey="extras_real" invertVariance indent />
              <ComputedRow label="Total Gastos" presupuesto={computed.total_gastos_presupuesto} real={computed.total_gastos_real} invertVariance />

              {/* UTILIDAD NETA */}
              <ComputedRow label="Utilidad Neta" presupuesto={computed.utilidad_neta_presupuesto} real={computed.utilidad_neta_real} />

              {/* VIATICOS */}
              <SectionHeader label="Viaticos" />
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-1.5 text-sm text-gray-600 pl-8">Venta viaticos</td>
                <td className="px-3 py-1.5 text-right font-mono text-sm text-gray-500">{formatCurrency(fin.viaticos_venta)}</td>
                <td className="px-1 py-1"><NumInput value={fin.viaticos_venta} onChange={(v) => update("viaticos_venta", v)} /></td>
                <td className="px-3 py-1.5"></td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-1.5 text-sm text-gray-600 pl-8">Gasto viaticos</td>
                <td className="px-3 py-1.5"></td>
                <td className="px-1 py-1"><NumInput value={fin.viaticos_gasto} onChange={(v) => update("viaticos_gasto", v)} /></td>
                <td className="px-3 py-1.5"></td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-1.5 text-sm text-gray-600 pl-8">Uber viaticos</td>
                <td className="px-3 py-1.5"></td>
                <td className="px-1 py-1"><NumInput value={fin.viaticos_uber} onChange={(v) => update("viaticos_uber", v)} /></td>
                <td className="px-3 py-1.5"></td>
              </tr>
              <ComputedRow label="Utilidad Viaticos" presupuesto={0} real={computed.utilidad_viaticos} />

              {/* TOTAL */}
              <ComputedRow label="UTILIDAD TOTAL" presupuesto={computed.utilidad_neta_presupuesto} real={computed.utilidad_total} dark />

              {/* MARGEN % */}
              <tr className="bg-gray-100 border-t">
                <td className="px-4 py-2 text-sm font-semibold text-gray-700">% Margen</td>
                <td className="px-3 py-2 text-right font-mono text-sm text-gray-500">
                  {fin.venta_presupuesto > 0
                    ? `${Math.round((computed.utilidad_neta_presupuesto / fin.venta_presupuesto) * 10000) / 100}%`
                    : "0%"}
                </td>
                <td className={`px-3 py-2 text-right font-mono text-sm font-bold ${getMarginColor(computed.pct_margen)}`}>
                  {computed.pct_margen}%
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ COMMISSIONS ═══ */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Comisiones</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Base: <span className="font-mono">{formatCurrency(computed.utilidad_total)}</span>
              {isDanielVendedor && <span className="ml-2 text-orange-500">(Daniel vende: Dir. Ventas = 0%)</span>}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCommissions(defaultRules)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCommissions((prev) => [...prev, { id: `cr-${Date.now()}`, rol: "", persona: "", porcentaje: 0 }])}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Agregar"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-400 uppercase">Rol</th>
              <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-400 uppercase">Persona</th>
              <th className="px-4 py-2 text-center text-[11px] font-medium text-gray-400 uppercase w-[70px]">%</th>
              <th className="px-4 py-2 text-right text-[11px] font-medium text-gray-400 uppercase">Monto</th>
              <th className="w-[36px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {commissionCalcs.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-1.5">
                  <input
                    value={c.rol}
                    onChange={(e) => setCommissions((prev) => prev.map((x) => x.id === c.id ? { ...x, rol: e.target.value } : x))}
                    className="text-sm font-medium bg-transparent border-0 focus:outline-none focus:bg-blue-50 rounded px-1 py-0.5 w-full"
                  />
                </td>
                <td className="px-4 py-1.5">
                  <input
                    value={c.persona}
                    onChange={(e) => setCommissions((prev) => prev.map((x) => x.id === c.id ? { ...x, persona: e.target.value } : x))}
                    className="text-sm bg-transparent border-0 focus:outline-none focus:bg-blue-50 rounded px-1 py-0.5 w-full"
                    placeholder="Nombre"
                  />
                </td>
                <td className="px-4 py-1.5 text-center">
                  <input
                    type="number"
                    value={c.porcentaje}
                    onChange={(e) => setCommissions((prev) => prev.map((x) => x.id === c.id ? { ...x, porcentaje: parseFloat(e.target.value) || 0 } : x))}
                    className="w-14 h-7 text-center font-mono text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 mx-auto block"
                    step={0.25}
                  />
                </td>
                <td className="px-4 py-1.5 text-right font-mono font-semibold text-green-600">{formatCurrency(c.monto)}</td>
                <td className="px-1 py-1.5">
                  <button
                    onClick={() => setCommissions((prev) => prev.filter((x) => x.id !== c.id))}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-900 text-white">
              <td className="px-4 py-2.5 font-semibold" colSpan={2}>Total Comisiones</td>
              <td className="px-4 py-2.5 text-center font-mono font-semibold">{totalPct.toFixed(2)}%</td>
              <td className="px-4 py-2.5 text-right font-mono font-bold">{formatCurrency(totalComisiones)}</td>
              <td></td>
            </tr>
            {computed.utilidad_total > 0 && (
              <tr className="bg-gray-50">
                <td className="px-4 py-2 text-gray-400" colSpan={2}>Utilidad despues de comisiones</td>
                <td></td>
                <td className="px-4 py-2 text-right font-mono font-semibold">
                  <span className={computed.utilidad_total - totalComisiones >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(computed.utilidad_total - totalComisiones)}
                  </span>
                </td>
                <td></td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* ═══ STATUS CONTROLS ═══ */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Control del Proyecto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkflowStatus)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="pendiente">Pendiente</option>
              <option value="presupuesto_confirmado">Presupuesto Confirmado</option>
              <option value="en_operacion">En Operacion</option>
              <option value="operado">Operado</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">Pago</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as typeof paymentStatus)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="pendiente">Pendiente</option>
              <option value="parcial">Parcial</option>
              <option value="pagado_100">Pagado 100%</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            disabled={status === "finalizado"}
            onClick={handleFinalizar}
          >
            <BookCheck className="w-4 h-4" />
            Finalizar
          </button>

          {deleteStep === "idle" && (
            <button
              className="inline-flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
              onClick={() => setDeleteStep("confirm1")}
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          )}
        </div>

        {/* Delete confirmation */}
        {deleteStep === "confirm1" && (
          <div className="mt-4 border border-red-200 bg-red-50 rounded-lg p-4 max-w-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Eliminar proyecto?</p>
                <p className="text-xs text-red-600 mt-1">Esta accion es irreversible.</p>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md" onClick={() => setDeleteStep("confirm2")}>
                    Si, continuar
                  </button>
                  <button className="px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-md hover:bg-white" onClick={() => setDeleteStep("idle")}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteStep === "confirm2" && (
          <div className="mt-4 border border-red-300 bg-red-50 rounded-lg p-4 max-w-md">
            <p className="text-sm font-medium text-red-800 mb-2">Escribe <code className="bg-red-100 px-1 rounded font-mono text-xs">{expectedDeleteText}</code> para confirmar:</p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder={expectedDeleteText}
              className="w-full border border-red-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-red-400 bg-white"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md disabled:opacity-50"
                disabled={deleteText.toUpperCase() !== expectedDeleteText}
                onClick={handleDelete}
              >
                Eliminar definitivamente
              </button>
              <button className="px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-md hover:bg-white" onClick={() => { setDeleteStep("idle"); setDeleteText(""); }}>
                Cancelar
              </button>
            </div>
            {deleteText.length > 0 && deleteText.toUpperCase() !== expectedDeleteText && (
              <p className="text-xs text-red-500 mt-1">El texto no coincide</p>
            )}
          </div>
        )}

        {deleteStep === "deleting" && (
          <div className="mt-4 border border-red-200 bg-red-50 rounded-lg p-4 text-center max-w-md">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-red-600">Eliminando...</span>
            </div>
          </div>
        )}

        {deleteStep === "deleted" && (
          <div className="mt-4 border border-red-200 bg-red-50 rounded-lg p-4 text-center max-w-md">
            <p className="text-sm text-red-600 font-medium">Proyecto eliminado. Redirigiendo...</p>
          </div>
        )}
      </div>
    </div>
  );
}
