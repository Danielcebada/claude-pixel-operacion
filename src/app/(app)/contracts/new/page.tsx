"use client";

import { useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileText,
  Save,
  Search,
  Sparkles,
} from "lucide-react";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import {
  formatCurrency,
  DEFAULT_PAYMENT_TERMS,
  DIAS_CREDITO_OPTIONS,
  ESQUEMA_PAGO_OPTIONS,
  FORMA_PAGO_OPTIONS,
  type PaymentTerms,
  type ClientSettings,
} from "@/lib/types";
import {
  buildPaymentSchedule,
  Contract,
  generateContractNumber,
  loadClientSettings,
  saveClientSettings,
  saveStoredContract,
} from "@/lib/contracts-data";
import { ContractPreview } from "@/components/contracts/contract-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Helpers specific to the wizard
// ---------------------------------------------------------------------------

type Project = (typeof MOCK_PROJECTS)[number];

function extractClientName(dealName: string): string {
  // Heuristic: everything before the first " - "
  const parts = dealName.split(" - ");
  if (parts.length > 1) return parts[0].trim();
  return dealName.trim();
}

function addDaysISO(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Page (Next 16 — searchParams is a Promise; resolve with `use()`)
// ---------------------------------------------------------------------------

export default function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = use(searchParams);
  const projectIdParam =
    typeof resolvedParams.projectId === "string" ? resolvedParams.projectId : undefined;

  return <NewContractWizard initialProjectId={projectIdParam} />;
}

function NewContractWizard({ initialProjectId }: { initialProjectId?: string }) {
  const router = useRouter();

  // ── Wizard step ──────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Step 1: Project selection ─────────────────────────────────
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(
    initialProjectId,
  );

  const selectedProject = useMemo<Project | undefined>(
    () => MOCK_PROJECTS.find((p) => p.id === selectedProjectId),
    [selectedProjectId],
  );

  // ── Client-fill overrides — set from the project/settings snapshot,
  // then freely edited by the user. We use `undefined` to mean "use default".
  type ClientOverrides = {
    clientName?: string;
    clientRFC?: string;
    clientDomicilio?: string;
    clientRepresentante?: string;
    clientRepresentanteCargo?: string;
    clientContacto?: string;
    descripcionServicio?: string;
    ubicacionEvento?: string;
  };
  const [overrides, setOverrides] = useState<ClientOverrides>({});

  // ── Step 2: Terms — undefined = use client default or fallback ──
  const [termsOverride, setTermsOverride] = useState<PaymentTerms | null>(null);

  // ── Stable identity for the draft contract — computed once on mount ──
  const [draftMeta] = useState(() => ({
    id: `c-draft-${Date.now()}`,
    contractNumber: "DPS-DRAFT", // replaced on save
    createdAt: new Date().toISOString(),
  }));

  // ── Derived defaults for the selected project (no setState needed) ──
  const projectDefaults = useMemo(() => {
    if (!selectedProject) return null;
    const name = extractClientName(selectedProject.deal_name);
    const allSettings = loadClientSettings();
    const existing: ClientSettings | undefined = allSettings[name];
    return {
      name,
      clientRFC: existing?.rfc ?? "",
      clientDomicilio: existing?.domicilio ?? "",
      clientRepresentante: existing?.representante ?? "",
      clientRepresentanteCargo: existing?.representanteCargo ?? "Representante Legal",
      clientContacto: existing?.contacto ?? "",
      descripcionServicio: `Servicio integral de tecnologia interactiva y experiencias inmersivas para el evento "${selectedProject.deal_name}", incluyendo ${selectedProject.product_type}, personal operativo, montaje, desmontaje y logistica, conforme al Anexo A del presente contrato.`,
      ubicacionEvento: "Ciudad de Mexico",
      defaultTerms: existing?.defaultTerms ?? DEFAULT_PAYMENT_TERMS,
    };
  }, [selectedProject]);

  // ── Computed fields (defaults + overrides) ──
  const clientName = overrides.clientName ?? projectDefaults?.name ?? "";
  const clientNameCandidate = projectDefaults?.name ?? "";
  const clientRFC = overrides.clientRFC ?? projectDefaults?.clientRFC ?? "";
  const clientDomicilio = overrides.clientDomicilio ?? projectDefaults?.clientDomicilio ?? "";
  const clientRepresentante =
    overrides.clientRepresentante ?? projectDefaults?.clientRepresentante ?? "";
  const clientRepresentanteCargo =
    overrides.clientRepresentanteCargo ?? projectDefaults?.clientRepresentanteCargo ?? "Representante Legal";
  const clientContacto = overrides.clientContacto ?? projectDefaults?.clientContacto ?? "";
  const descripcionServicio =
    overrides.descripcionServicio ?? projectDefaults?.descripcionServicio ?? "";
  const ubicacionEvento =
    overrides.ubicacionEvento ?? projectDefaults?.ubicacionEvento ?? "Ciudad de Mexico";

  const terms: PaymentTerms =
    termsOverride ?? projectDefaults?.defaultTerms ?? DEFAULT_PAYMENT_TERMS;

  // Reset overrides when switching projects via a handler (no effect-driven setState)
  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setOverrides({});
    setTermsOverride(null);
  };

  // Convenience setters for individual fields (merge into overrides map).
  const setField = <K extends keyof ClientOverrides>(key: K) => (v: string) =>
    setOverrides((prev) => ({ ...prev, [key]: v }));
  const setClientName = setField("clientName");
  const setClientRFC = setField("clientRFC");
  const setClientDomicilio = setField("clientDomicilio");
  const setClientRepresentante = setField("clientRepresentante");
  const setClientRepresentanteCargo = setField("clientRepresentanteCargo");
  const setClientContacto = setField("clientContacto");
  const setDescripcionServicio = setField("descripcionServicio");
  const setUbicacionEvento = setField("ubicacionEvento");
  const setTerms = (updater: (prev: PaymentTerms) => PaymentTerms) =>
    setTermsOverride((prev) => updater(prev ?? projectDefaults?.defaultTerms ?? DEFAULT_PAYMENT_TERMS));

  // ── Filtered projects for the search box ──
  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    if (!q) return MOCK_PROJECTS.slice(0, 20);
    return MOCK_PROJECTS.filter(
      (p) =>
        p.deal_name.toLowerCase().includes(q) ||
        (p.vendedor_name ?? "").toLowerCase().includes(q) ||
        p.product_type.toLowerCase().includes(q),
    ).slice(0, 30);
  }, [projectSearch]);

  // ── Derived amounts ──
  const amounts = useMemo(() => {
    if (!selectedProject) {
      return { subtotal: 0, iva: 0, retISR: 0, retIVA: 0, total: 0 };
    }
    // Treat project venta_presupuesto as the IVA-inclusive deal amount (matches HubSpot).
    const totalConIva = selectedProject.financials.venta_presupuesto;
    const ivaPct = terms.ivaPct / 100;
    const subtotal = ivaPct > 0 ? totalConIva / (1 + ivaPct) : totalConIva;
    const iva = totalConIva - subtotal;
    const retISR = terms.retencionISR ? subtotal * 0.1 : 0;
    const retIVA = terms.retencionIVA ? iva * (10.67 / 16) : 0;
    const total = totalConIva - retISR - retIVA;
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      iva: Math.round(iva * 100) / 100,
      retISR: Math.round(retISR * 100) / 100,
      retIVA: Math.round(retIVA * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }, [selectedProject, terms.ivaPct, terms.retencionISR, terms.retencionIVA]);

  const paymentSchedule = useMemo(() => {
    if (!selectedProject) return [];
    return buildPaymentSchedule(amounts.total, selectedProject.event_date, terms);
  }, [selectedProject, amounts.total, terms]);

  // ── Full preview contract for Step 3 ──
  const previewContract: Contract | null = useMemo(() => {
    if (!selectedProject) return null;
    const vigenciaInicio = draftMeta.createdAt.split("T")[0];
    const vigenciaFin = addDaysISO(selectedProject.event_date, 60);

    return {
      id: draftMeta.id,
      contractNumber: draftMeta.contractNumber,
      clientName,
      clientRFC,
      clientDomicilio,
      clientRepresentante,
      clientRepresentanteCargo,
      clientContacto,
      projectName: selectedProject.deal_name,
      descripcionServicio,
      fechaEvento: selectedProject.event_date,
      ubicacionEvento,
      vendedor: selectedProject.vendedor_name ?? "",
      createdAt: draftMeta.createdAt,
      vigenciaInicio,
      vigenciaFin,
      status: "borrador",
      lineItems: [],
      subtotal: amounts.subtotal,
      iva: amounts.iva,
      total: amounts.total,
      paymentSchedule,
      terms,
      generatedFromProject: true,
    };
  }, [
    selectedProject,
    draftMeta,
    clientName,
    clientRFC,
    clientDomicilio,
    clientRepresentante,
    clientRepresentanteCargo,
    clientContacto,
    descripcionServicio,
    ubicacionEvento,
    amounts,
    paymentSchedule,
    terms,
  ]);

  // ── Save handler ──
  const handleSave = () => {
    if (!previewContract || !selectedProject) return;

    // Stamp a real contract number at save time (reads current stored count).
    const finalContract: Contract = {
      ...previewContract,
      contractNumber: generateContractNumber(),
    };
    saveStoredContract(finalContract);

    // Persist client settings so future contracts for the same client autofill.
    const settings: ClientSettings = {
      clientName,
      rfc: clientRFC,
      domicilio: clientDomicilio,
      representante: clientRepresentante,
      representanteCargo: clientRepresentanteCargo,
      contacto: clientContacto,
      defaultTerms: terms,
      updatedAt: new Date().toISOString(),
    };
    saveClientSettings(settings);

    router.push("/contracts");
  };

  // ── Step validation ──
  const canAdvanceFromStep1 = !!selectedProjectId && clientName.trim().length > 0;
  const canAdvanceFromStep2 =
    terms.porcentajeAnticipo >= 0 &&
    terms.porcentajeAnticipo <= 100 &&
    terms.numeroFacturas >= 1 &&
    terms.numeroFacturas <= 12 &&
    terms.ivaPct >= 0 &&
    terms.ivaPct <= 30;

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/contracts"
          className="mt-1 p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Nuevo Contrato
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generacion automatica desde un proyecto existente.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <Stepper step={step} />

      {/* Step 1 ─ Select project */}
      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Proyecto
                </label>
                <div className="mt-1 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Buscar por nombre, vendedor o producto..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {filteredProjects.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-400">
                    No hay proyectos que coincidan con tu busqueda.
                  </div>
                ) : (
                  filteredProjects.map((p) => {
                    const isSelected = p.id === selectedProjectId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProject(p.id)}
                        className={`w-full text-left p-3 transition-colors flex items-start justify-between gap-3 hover:bg-blue-50 ${
                          isSelected ? "bg-blue-50 ring-1 ring-blue-200" : ""
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {p.deal_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {p.vendedor_name} &middot; {p.product_type} &middot; {p.event_date}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-mono font-semibold text-gray-800">
                            {formatCurrency(p.financials.venta_presupuesto)}
                          </p>
                          {isSelected && (
                            <Badge
                              variant="secondary"
                              className="mt-1 text-[10px] bg-blue-100 text-blue-700"
                            >
                              Seleccionado
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Autofill preview + editable client fields */}
          {selectedProject && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <h3 className="text-sm font-semibold text-gray-800">
                    Informacion del cliente
                  </h3>
                  <span className="text-xs text-gray-400">
                    (Precargada desde el proyecto, editable)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Razon social / cliente">
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={clientNameCandidate}
                    />
                  </Field>
                  <Field label="RFC">
                    <Input
                      value={clientRFC}
                      onChange={(e) => setClientRFC(e.target.value.toUpperCase())}
                      placeholder="ABC010203XYZ"
                    />
                  </Field>
                  <Field label="Domicilio fiscal" className="sm:col-span-2">
                    <Input
                      value={clientDomicilio}
                      onChange={(e) => setClientDomicilio(e.target.value)}
                      placeholder="Calle, colonia, alcaldia, CP, CDMX"
                    />
                  </Field>
                  <Field label="Representante legal">
                    <Input
                      value={clientRepresentante}
                      onChange={(e) => setClientRepresentante(e.target.value)}
                      placeholder="Nombre completo"
                    />
                  </Field>
                  <Field label="Cargo">
                    <Input
                      value={clientRepresentanteCargo}
                      onChange={(e) => setClientRepresentanteCargo(e.target.value)}
                      placeholder="Director General"
                    />
                  </Field>
                  <Field label="Contacto" className="sm:col-span-2">
                    <Input
                      value={clientContacto}
                      onChange={(e) => setClientContacto(e.target.value)}
                      placeholder="email@cliente.mx | +52 55 ..."
                    />
                  </Field>
                  <Field label="Descripcion del servicio" className="sm:col-span-2">
                    <textarea
                      value={descripcionServicio}
                      onChange={(e) => setDescripcionServicio(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </Field>
                  <Field label="Ubicacion del evento" className="sm:col-span-2">
                    <Input
                      value={ubicacionEvento}
                      onChange={(e) => setUbicacionEvento(e.target.value)}
                    />
                  </Field>
                </div>

                <div className="border-t border-gray-100 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <Info label="Proyecto" value={selectedProject.deal_name} />
                  <Info
                    label="Monto (con IVA)"
                    value={formatCurrency(selectedProject.financials.venta_presupuesto)}
                  />
                  <Info label="Producto" value={selectedProject.product_type} />
                  <Info label="Fecha evento" value={selectedProject.event_date} />
                </div>
              </CardContent>
            </Card>
          )}

          <StepNav
            canAdvance={canAdvanceFromStep1}
            onNext={() => setStep(2)}
          />
        </div>
      )}

      {/* Step 2 ─ Configure terms */}
      {step === 2 && selectedProject && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-800">Configuracion de terminos</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dias de credito */}
                <Field label="Dias de credito">
                  <NativeSelect
                    value={terms.diasCredito}
                    onChange={(v) =>
                      setTerms((t) => ({
                        ...t,
                        diasCredito: v as PaymentTerms["diasCredito"],
                      }))
                    }
                    options={DIAS_CREDITO_OPTIONS}
                  />
                </Field>

                {/* Forma de pago */}
                <Field label="Forma de pago">
                  <NativeSelect
                    value={terms.formaPago}
                    onChange={(v) =>
                      setTerms((t) => ({
                        ...t,
                        formaPago: v as PaymentTerms["formaPago"],
                      }))
                    }
                    options={FORMA_PAGO_OPTIONS}
                  />
                </Field>

                {/* Esquema de pago — radios */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Esquema de pago
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ESQUEMA_PAGO_OPTIONS.map((opt) => {
                      const active = terms.esquemaPago === opt.value;
                      return (
                        <label
                          key={opt.value}
                          className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                            active
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="esquemaPago"
                            className="mt-1"
                            checked={active}
                            onChange={() =>
                              setTerms((t) => ({
                                ...t,
                                esquemaPago: opt.value,
                                numeroFacturas:
                                  opt.value === "anticipo_unico" ||
                                  opt.value === "contra_entrega"
                                    ? 1
                                    : opt.value === "50_50"
                                    ? 2
                                    : 3,
                              }))
                            }
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <Field label="% Anticipo">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={terms.porcentajeAnticipo}
                    onChange={(e) =>
                      setTerms((t) => ({
                        ...t,
                        porcentajeAnticipo: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </Field>
                <Field label="Numero de facturas">
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={terms.numeroFacturas}
                    onChange={(e) =>
                      setTerms((t) => ({
                        ...t,
                        numeroFacturas: Math.max(
                          1,
                          Math.min(12, parseInt(e.target.value, 10) || 1),
                        ),
                      }))
                    }
                  />
                </Field>

                <Field label="IVA %">
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    step={0.01}
                    value={terms.ivaPct}
                    onChange={(e) =>
                      setTerms((t) => ({
                        ...t,
                        ivaPct: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </Field>

                <Field label="Penalidad cancelacion (%)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={terms.penalidadCancelacionPct}
                    onChange={(e) =>
                      setTerms((t) => ({
                        ...t,
                        penalidadCancelacionPct: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </Field>

                <Field label="Lugar de entrega" className="sm:col-span-2">
                  <Input
                    value={terms.lugarEntrega}
                    onChange={(e) => setTerms((t) => ({ ...t, lugarEntrega: e.target.value }))}
                  />
                </Field>

                <div className="sm:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={terms.retencionISR}
                      onChange={(e) =>
                        setTerms((t) => ({ ...t, retencionISR: e.target.checked }))
                      }
                    />
                    Aplicar retencion de ISR (10%)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={terms.retencionIVA}
                      onChange={(e) =>
                        setTerms((t) => ({ ...t, retencionIVA: e.target.checked }))
                      }
                    />
                    Aplicar retencion de IVA (10.67%)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={terms.incluyeViaticos}
                      onChange={(e) =>
                        setTerms((t) => ({ ...t, incluyeViaticos: e.target.checked }))
                      }
                    />
                    Incluye viaticos y transporte foraneo
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amounts preview */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Previsualizacion de montos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <Info label="Subtotal" value={formatCurrency(amounts.subtotal)} />
                <Info label={`IVA ${terms.ivaPct}%`} value={formatCurrency(amounts.iva)} />
                <Info
                  label="Ret. ISR"
                  value={terms.retencionISR ? `-${formatCurrency(amounts.retISR)}` : "—"}
                />
                <Info
                  label="Ret. IVA"
                  value={terms.retencionIVA ? `-${formatCurrency(amounts.retIVA)}` : "—"}
                />
                <Info label="Total a pagar" value={formatCurrency(amounts.total)} />
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Calendario de pagos</p>
                <table className="w-full text-xs border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2 px-2 text-gray-600">Concepto</th>
                      <th className="text-center py-2 px-2 text-gray-600 w-16">%</th>
                      <th className="text-right py-2 px-2 text-gray-600 w-28">Monto</th>
                      <th className="text-center py-2 px-2 text-gray-600 w-28">Fecha limite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentSchedule.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100">
                        <td className="py-1.5 px-2">{p.concepto}</td>
                        <td className="text-center px-2">{p.porcentaje}%</td>
                        <td className="text-right px-2 font-mono">{formatCurrency(p.monto)}</td>
                        <td className="text-center px-2 text-gray-500">{p.fechaLimite}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <StepNav
            canAdvance={canAdvanceFromStep2}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        </div>
      )}

      {/* Step 3 ─ Review & save */}
      {step === 3 && previewContract && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Revisa el contrato antes de guardar
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Los datos del cliente y los terminos se guardaran para uso futuro.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4" />
                Atras
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Generar contrato
              </Button>
            </div>
          </div>

          <ContractPreview contract={previewContract} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Seleccionar proyecto" },
    { n: 2, label: "Configurar terminos" },
    { n: 3, label: "Revisar y guardar" },
  ];
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        {steps.map((s, idx) => {
          const state = step === s.n ? "current" : step > s.n ? "done" : "upcoming";
          return (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    state === "done"
                      ? "bg-green-500 text-white"
                      : state === "current"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {state === "done" ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    state === "done"
                      ? "text-green-600"
                      : state === "current"
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 mx-1 rounded ${
                    step > s.n ? "bg-green-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepNav({
  canAdvance,
  onBack,
  onNext,
}: {
  canAdvance: boolean;
  onBack?: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex justify-between items-center">
      {onBack ? (
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Atras
        </Button>
      ) : (
        <span />
      )}
      <Button onClick={onNext} disabled={!canAdvance}>
        Siguiente
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5 break-words">{value}</p>
    </div>
  );
}

function NativeSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-8 w-full rounded-lg border border-input bg-transparent pl-2.5 pr-8 py-1 text-sm outline-none appearance-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
