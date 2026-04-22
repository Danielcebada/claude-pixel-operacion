"use client";

import { use, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Hash,
  Calendar,
  Briefcase,
  FileText,
  Receipt,
  Activity,
  Plus,
  FilePlus2,
  Download,
  Save,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  FileSignature,
  CircleDollarSign,
} from "lucide-react";
import * as XLSX from "xlsx";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractEmpresa(dealName: string): string {
  // Split by " - " first, then by " | "
  const bySep1 = dealName.split(" - ")[0];
  const bySep2 = bySep1.split(" | ")[0];
  return bySep2.trim();
}

function fmtDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClientSettings {
  diasCredito: string;
  numFacturasDefault: number;
  anticipoDefault: number;
  formaPago: string;
  condicionesEspeciales: string;
  ivaDesglosado: boolean;
}

interface StoredContract {
  id: string;
  contractNumber?: string;
  clientName?: string;
  projectName?: string;
  status?: string;
  total?: number;
  subtotal?: number;
  createdAt?: string;
  numFactura?: string;
  fechaEvento?: string;
}

interface ActivityEvent {
  id: string;
  date: string;
  type: "proyecto_creado" | "contrato_firmado" | "factura_emitida" | "pago_recibido";
  title: string;
  description: string;
  amount?: number;
}

const DEFAULT_SETTINGS: ClientSettings = {
  diasCredito: "contado",
  numFacturasDefault: 1,
  anticipoDefault: 50,
  formaPago: "transferencia",
  condicionesEspeciales: "",
  ivaDesglosado: true,
};

const PROJECT_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  pendiente: { label: "Pendiente", bg: "bg-yellow-100", text: "text-yellow-700" },
  presupuesto_confirmado: {
    label: "Confirmado",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  en_operacion: { label: "En operacion", bg: "bg-indigo-100", text: "text-indigo-700" },
  operado: { label: "Operado", bg: "bg-purple-100", text: "text-purple-700" },
  finalizado: { label: "Finalizado", bg: "bg-green-100", text: "text-green-700" },
  cancelado: { label: "Cancelado", bg: "bg-red-100", text: "text-red-700" },
};

const CONTRACT_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  borrador: { label: "Borrador", bg: "bg-gray-100", text: "text-gray-700" },
  en_revision: { label: "En Revision", bg: "bg-yellow-100", text: "text-yellow-700" },
  enviado: { label: "Enviado", bg: "bg-blue-100", text: "text-blue-700" },
  firmado: { label: "Firmado", bg: "bg-emerald-100", text: "text-emerald-700" },
  activo: { label: "Activo", bg: "bg-green-100", text: "text-green-700" },
  vencido: { label: "Vencido", bg: "bg-orange-100", text: "text-orange-700" },
  cancelado: { label: "Cancelado", bg: "bg-red-100", text: "text-red-700" },
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ClientHistoryPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: rawCompany } = use(params);
  const company = decodeURIComponent(rawCompany);
  const companyLower = company.toLowerCase();

  // ─── Filter projects for this company ──────────────────────────────────
  const projects = useMemo(() => {
    return MOCK_PROJECTS.filter(
      (p) => extractEmpresa(p.deal_name).toLowerCase() === companyLower
    );
  }, [companyLower]);

  // ─── Load contracts from localStorage ──────────────────────────────────
  const [contracts, setContracts] = useState<StoredContract[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pixel_contracts");
      if (raw) {
        const parsed: StoredContract[] = JSON.parse(raw);
        const filtered = parsed.filter((c) => {
          const name = (c.clientName || "").toLowerCase();
          const projectName = (c.projectName || "").toLowerCase();
          return (
            name.includes(companyLower) || projectName.includes(companyLower)
          );
        });
        setContracts(filtered);
      }
    } catch {
      setContracts([]);
    }
  }, [companyLower]);

  // ─── Client settings (localStorage) ────────────────────────────────────
  const [settings, setSettings] = useState<ClientSettings>(DEFAULT_SETTINGS);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pixel_client_settings");
      if (raw) {
        const all: Record<string, ClientSettings> = JSON.parse(raw);
        if (all[company]) {
          setSettings({ ...DEFAULT_SETTINGS, ...all[company] });
        }
      }
    } catch {
      // ignore
    }
  }, [company]);

  const saveSettings = () => {
    try {
      const raw = localStorage.getItem("pixel_client_settings");
      const all: Record<string, ClientSettings> = raw ? JSON.parse(raw) : {};
      all[company] = settings;
      localStorage.setItem("pixel_client_settings", JSON.stringify(all));
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch {
      // ignore
    }
  };

  // ─── KPIs ──────────────────────────────────────────────────────────────
  const totalIngresos = useMemo(
    () => projects.reduce((s, p) => s + p.financials.venta_presupuesto, 0),
    [projects]
  );
  const totalProyectos = projects.length;
  const ticketPromedio = totalProyectos > 0 ? totalIngresos / totalProyectos : 0;
  const ultimoProyecto = useMemo(() => {
    if (projects.length === 0) return null;
    return [...projects].sort(
      (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    )[0];
  }, [projects]);

  // ─── Activity timeline ─────────────────────────────────────────────────
  const activity = useMemo<ActivityEvent[]>(() => {
    const events: ActivityEvent[] = [];

    projects.forEach((p) => {
      events.push({
        id: `proj-${p.id}`,
        date: p.created_at,
        type: "proyecto_creado",
        title: "Proyecto creado",
        description: p.deal_name,
        amount: p.financials.venta_presupuesto,
      });
      if (p.anticipo_pagado) {
        events.push({
          id: `pay-${p.id}`,
          date: p.created_at,
          type: "pago_recibido",
          title: "Anticipo recibido",
          description: `${p.deal_name} - 50% anticipo`,
          amount: p.anticipo_requerido,
        });
      }
    });

    contracts.forEach((c) => {
      if (c.status === "firmado" || c.status === "activo") {
        events.push({
          id: `contract-${c.id}`,
          date: c.createdAt || new Date().toISOString(),
          type: "contrato_firmado",
          title: "Contrato firmado",
          description: c.contractNumber || c.projectName || "Contrato",
          amount: c.total || c.subtotal,
        });
      }
    });

    return events.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [projects, contracts]);

  // ─── Projected invoicing (mock) ────────────────────────────────────────
  const projectedInvoices = useMemo(() => {
    return projects.map((p, i) => ({
      id: `inv-${p.id}`,
      folio: `PROY-${String(i + 1).padStart(4, "0")}`,
      projectName: p.deal_name,
      monto: p.financials.venta_presupuesto,
      fecha: p.event_date,
      status: p.anticipo_pagado ? "parcial" : "pendiente",
    }));
  }, [projects]);

  // ─── Export XLSX ───────────────────────────────────────────────────────
  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Projects
    const projRows = projects.map((p) => ({
      deal: p.deal_name,
      producto: p.product_type,
      fecha: p.event_date,
      monto: p.financials.venta_presupuesto,
      vendedor: p.vendedor_name,
      pm: p.pm_name,
      status: p.status,
      anticipo_pagado: p.anticipo_pagado ? "Si" : "No",
    }));
    const wsP = XLSX.utils.json_to_sheet(
      projRows.length ? projRows : [{ info: "Sin proyectos" }]
    );
    XLSX.utils.book_append_sheet(wb, wsP, "Proyectos");

    // Contracts
    const contractRows = contracts.map((c) => ({
      numero: c.contractNumber,
      cliente: c.clientName,
      proyecto: c.projectName,
      status: c.status,
      monto: c.total || c.subtotal,
      fecha: c.createdAt,
      numFactura: c.numFactura,
    }));
    const wsC = XLSX.utils.json_to_sheet(
      contractRows.length ? contractRows : [{ info: "Sin contratos" }]
    );
    XLSX.utils.book_append_sheet(wb, wsC, "Contratos");

    // Invoices
    const invRows = projectedInvoices.map((i) => ({
      folio: i.folio,
      proyecto: i.projectName,
      monto: i.monto,
      fecha: i.fecha,
      status: i.status,
    }));
    const wsI = XLSX.utils.json_to_sheet(
      invRows.length ? invRows : [{ info: "Sin facturas" }]
    );
    XLSX.utils.book_append_sheet(wb, wsI, "Facturas");

    // Activity
    const actRows = activity.map((a) => ({
      fecha: a.date,
      tipo: a.type,
      titulo: a.title,
      descripcion: a.description,
      monto: a.amount ?? "",
    }));
    const wsA = XLSX.utils.json_to_sheet(
      actRows.length ? actRows : [{ info: "Sin actividad" }]
    );
    XLSX.utils.book_append_sheet(wb, wsA, "Actividad");

    const safeName = company.replace(/[^a-z0-9]/gi, "_");
    const today = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `historial_${safeName}_${today}.xlsx`);
  };

  // ─── Derived status ────────────────────────────────────────────────────
  const clientStatus: "activo" | "inactivo" = projects.length > 0 ? "activo" : "inactivo";

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <Link
            href="/clients"
            className="mt-1 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6" /> {company}
              </h1>
              <Badge
                variant="secondary"
                className={
                  clientStatus === "activo"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }
              >
                {clientStatus === "activo" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <CircleDollarSign className="w-4 h-4" />
                LTV total: <strong className="text-gray-900">{formatCurrency(totalIngresos)}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                {totalProyectos} proyecto{totalProyectos !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/projects">
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Nuevo proyecto
            </Button>
          </Link>
          <Link href={`/contracts?company=${encodeURIComponent(company)}`}>
            <Button variant="outline" className="gap-2">
              <FilePlus2 className="w-4 h-4" /> Nuevo contrato
            </Button>
          </Link>
          <Button className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" /> Exportar historial
          </Button>
        </div>
      </div>

      {/* ─── KPI cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total ingresos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalIngresos)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Proyectos totales</p>
                <p className="text-2xl font-bold text-gray-900">{totalProyectos}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Ticket promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(Math.round(ticketPromedio))}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Ultimo proyecto</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {ultimoProyecto ? fmtDate(ultimoProyecto.event_date) : "-"}
                </p>
                {ultimoProyecto && (
                  <p className="text-[11px] text-gray-400 truncate max-w-[150px]">
                    {ultimoProyecto.product_type}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Client settings card ────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-gray-600" /> Configuracion de facturacion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Dias de credito
              </label>
              <select
                value={settings.diasCredito}
                onChange={(e) => setSettings({ ...settings, diasCredito: e.target.value })}
                className="w-full text-sm border rounded-md px-3 py-1.5 bg-white"
              >
                <option value="contado">Contado</option>
                <option value="30">30 dias</option>
                <option value="45">45 dias</option>
                <option value="60">60 dias</option>
                <option value="90">90 dias</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Numero de facturas por defecto
              </label>
              <Input
                type="number"
                min={1}
                value={settings.numFacturasDefault}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    numFacturasDefault: Number(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                % anticipo default
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={settings.anticipoDefault}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    anticipoDefault: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Forma de pago preferida
              </label>
              <select
                value={settings.formaPago}
                onChange={(e) => setSettings({ ...settings, formaPago: e.target.value })}
                className="w-full text-sm border rounded-md px-3 py-1.5 bg-white"
              >
                <option value="transferencia">Transferencia SPEI</option>
                <option value="cheque">Cheque</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta credito/debito</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Condiciones especiales
              </label>
              <textarea
                value={settings.condicionesEspeciales}
                onChange={(e) =>
                  setSettings({ ...settings, condicionesEspeciales: e.target.value })
                }
                rows={2}
                className="w-full text-sm border rounded-md px-3 py-2 bg-white resize-none"
                placeholder="Condiciones comerciales, requerimientos especiales, notas internas..."
              />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input
                id="iva-desglosado"
                type="checkbox"
                checked={settings.ivaDesglosado}
                onChange={(e) =>
                  setSettings({ ...settings, ivaDesglosado: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <label
                htmlFor="iva-desglosado"
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                Incluye IVA desglosado
              </label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-4">
            {settingsSaved && (
              <span className="text-xs text-green-600 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Guardado
              </span>
            )}
            <Button className="gap-2" onClick={saveSettings}>
              <Save className="w-4 h-4" /> Guardar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Tabs ───────────────────────────────────────────── */}
      <Tabs defaultValue="proyectos">
        <TabsList>
          <TabsTrigger value="proyectos">
            <Briefcase className="w-3.5 h-3.5" /> Proyectos ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="contratos">
            <FileText className="w-3.5 h-3.5" /> Contratos ({contracts.length})
          </TabsTrigger>
          <TabsTrigger value="facturas">
            <Receipt className="w-3.5 h-3.5" /> Facturas
          </TabsTrigger>
          <TabsTrigger value="actividad">
            <Activity className="w-3.5 h-3.5" /> Actividad
          </TabsTrigger>
        </TabsList>

        {/* ─── Proyectos ─── */}
        <TabsContent value="proyectos">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>PM</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-gray-400">
                        Sin proyectos registrados para este cliente.
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((p) => {
                      const cfg = PROJECT_STATUS_CONFIG[p.status] ?? {
                        label: p.status,
                        bg: "bg-gray-100",
                        text: "text-gray-700",
                      };
                      return (
                        <TableRow key={p.id} className="hover:bg-gray-50">
                          <TableCell className="max-w-[280px]">
                            <Link
                              href={`/projects/${p.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline line-clamp-2"
                            >
                              {p.deal_name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {p.product_type}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {fmtDate(p.event_date)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-medium">
                            {formatCurrency(p.financials.venta_presupuesto)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {p.vendedor_name}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{p.pm_name}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className={`${cfg.bg} ${cfg.text}`}
                            >
                              {cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/projects/${p.id}`}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 text-gray-500"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Contratos ─── */}
        <TabsContent value="contratos">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead># Contrato</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead># Factura</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-center">Descarga</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                        Sin contratos guardados para este cliente. Crea uno desde{" "}
                        <Link
                          href="/contracts"
                          className="text-blue-600 hover:underline"
                        >
                          Contratos
                        </Link>
                        .
                      </TableCell>
                    </TableRow>
                  ) : (
                    contracts.map((c) => {
                      const statusKey = c.status || "borrador";
                      const cfg = CONTRACT_STATUS_CONFIG[statusKey] ?? {
                        label: statusKey,
                        bg: "bg-gray-100",
                        text: "text-gray-700",
                      };
                      return (
                        <TableRow key={c.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs text-gray-500">
                            {c.contractNumber || c.id}
                          </TableCell>
                          <TableCell className="text-sm">
                            {c.projectName || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`${cfg.bg} ${cfg.text}`}
                            >
                              {cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 font-mono">
                            {c.numFactura || "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-medium">
                            {formatCurrency(c.total || c.subtotal || 0)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {c.createdAt ? fmtDate(c.createdAt) : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="icon-sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Facturas ─── */}
        <TabsContent value="facturas">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Proximamente integracion con Odoo
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Las facturas mostradas a continuacion son una proyeccion basada en los proyectos
                  existentes. La integracion con Odoo ERP traera los CFDI, fechas reales de emision
                  y estatus de pago.
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Folio (proyectado)</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Fecha estimada</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectedInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                          Sin proyeccion de facturacion.
                        </TableCell>
                      </TableRow>
                    ) : (
                      projectedInvoices.map((i) => (
                        <TableRow key={i.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs text-gray-500">
                            {i.folio}
                          </TableCell>
                          <TableCell className="text-sm max-w-[320px] truncate">
                            {i.projectName}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-medium">
                            {formatCurrency(i.monto)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {fmtDate(i.fecha)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className={
                                i.status === "parcial"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {i.status === "parcial" ? "Parcial" : "Pendiente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Actividad ─── */}
        <TabsContent value="actividad">
          <Card>
            <CardContent className="pt-6">
              {activity.length === 0 ? (
                <p className="text-center py-10 text-sm text-gray-400">
                  Sin actividad registrada.
                </p>
              ) : (
                <ol className="relative border-l border-gray-200 space-y-5 ml-3">
                  {activity.map((ev) => {
                    const cfg = activityConfig(ev.type);
                    const Icon = cfg.icon;
                    return (
                      <li key={ev.id} className="ml-6">
                        <span
                          className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ${cfg.bg}`}
                        >
                          <Icon className={`w-3 h-3 ${cfg.text}`} />
                        </span>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {ev.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {ev.description}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              {fmtDateTime(ev.date)}
                            </p>
                          </div>
                          {ev.amount !== undefined && (
                            <span className="text-sm font-mono font-medium text-gray-900 shrink-0">
                              {formatCurrency(ev.amount)}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function activityConfig(type: ActivityEvent["type"]): {
  icon: typeof Briefcase;
  bg: string;
  text: string;
} {
  switch (type) {
    case "proyecto_creado":
      return { icon: Briefcase, bg: "bg-blue-100", text: "text-blue-700" };
    case "contrato_firmado":
      return { icon: FileText, bg: "bg-emerald-100", text: "text-emerald-700" };
    case "factura_emitida":
      return { icon: Receipt, bg: "bg-amber-100", text: "text-amber-700" };
    case "pago_recibido":
      return { icon: CheckCircle2, bg: "bg-green-100", text: "text-green-700" };
    default:
      return { icon: Clock, bg: "bg-gray-100", text: "text-gray-700" };
  }
}
