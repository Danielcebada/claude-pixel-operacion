"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  FileText,
  Download,
  Send,
  Eye,
  Printer,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Filter,
  ArrowLeft,
  Scale,
  Sparkles,
} from "lucide-react";
import {
  Contract,
  ContractStatus,
  fmtDate,
  getStatusColor,
  getStatusLabel,
  loadStoredContracts,
} from "@/lib/contracts-data";
import { ContractPreview } from "@/components/contracts/contract-preview";

// ---------------------------------------------------------------------------
// Status icons (local — purely visual)
// ---------------------------------------------------------------------------

function getStatusIcon(status: ContractStatus) {
  switch (status) {
    case "borrador":
      return <FileText className="w-3.5 h-3.5" />;
    case "en_revision":
      return <Clock className="w-3.5 h-3.5" />;
    case "enviado":
      return <Send className="w-3.5 h-3.5" />;
    case "firmado":
    case "activo":
      return <CheckCircle className="w-3.5 h-3.5" />;
    case "vencido":
    case "cancelado":
      return <AlertTriangle className="w-3.5 h-3.5" />;
  }
}

// ---------------------------------------------------------------------------
// Mock Data — Q1 2026 real deals (seeded)
// ---------------------------------------------------------------------------

const MOCK_CONTRACTS: Contract[] = [
  {
    id: "c-001",
    contractNumber: "DPS-2026-0001",
    clientName: "Federacion Mexicana de Futbol, A.C.",
    clientRFC: "FMF6210196Z4",
    clientDomicilio:
      "Av. Insurgentes Sur 3483, Col. Pedregal de Santa Ursula, Alcaldia Coyoacan, Ciudad de Mexico, C.P. 04600",
    clientRepresentante: "Luis Enrique Palma Sanchez e Inigo Riestra Lopez",
    clientRepresentanteCargo: "Representantes Legales",
    clientContacto: "lpalma@fmf.mx | +52 55 5000 0000",
    projectName: "FMF - Activaciones Liga MX Femenil 2026",
    descripcionServicio:
      "Servicio integral de activaciones interactivas y experiencias tecnologicas para la Liga MX Femenil temporada 2026, incluyendo photo booths, realidad virtual, pantallas interactivas, personal operativo, montaje, desmontaje y logistica en multiples sedes a nivel nacional, conforme al Anexo A del presente contrato.",
    fechaEvento: "2026-02-15",
    ubicacionEvento: "Multiples sedes Liga MX Femenil a nivel nacional",
    vendedor: "Daniel",
    createdAt: "2026-01-20T10:00:00Z",
    vigenciaInicio: "2026-02-01",
    vigenciaFin: "2026-06-30",
    status: "activo",
    lineItems: [
      { id: "cl-1", productName: "Glambot Premium", category: "Photo Booths", quantity: 2, days: 20, unitPrice: 22600, lineTotal: 452000 },
      { id: "cl-2", productName: "360 Booth", category: "Photo Booths", quantity: 3, days: 20, unitPrice: 18500, lineTotal: 370000 },
      { id: "cl-3", productName: "Beat Saber VR", category: "VR/AR/AI", quantity: 4, days: 20, unitPrice: 22000, lineTotal: 440000 },
      { id: "cl-4", productName: "Pantalla Interactiva LED", category: "Screens & Tech", quantity: 2, days: 20, unitPrice: 15000, lineTotal: 300000 },
      { id: "cl-5", productName: "Personal Operativo", category: "Services", quantity: 15, days: 20, unitPrice: 3500, lineTotal: 105000 },
      { id: "cl-6", productName: "Logistica y Transporte Nacional", category: "Services", quantity: 1, days: 1, unitPrice: 126990, lineTotal: 126990 },
    ],
    subtotal: 1793990,
    iva: 287038.4,
    total: 2081028.4,
    paymentSchedule: [
      { id: "ps-1", concepto: "Anticipo (50%)", porcentaje: 50, monto: 898645, fechaLimite: "2026-02-01", pagado: true },
      { id: "ps-2", concepto: "Segundo pago (12.5%)", porcentaje: 12.5, monto: 224661.25, fechaLimite: "2026-03-15", pagado: true },
      { id: "ps-3", concepto: "Tercer pago (12.5%)", porcentaje: 12.5, monto: 224661.25, fechaLimite: "2026-04-15", pagado: false },
      { id: "ps-4", concepto: "Cuarto pago (12.5%)", porcentaje: 12.5, monto: 224661.25, fechaLimite: "2026-05-15", pagado: false },
      { id: "ps-5", concepto: "Liquidacion (12.5%)", porcentaje: 12.5, monto: 224661.25, fechaLimite: "2026-06-30", pagado: false },
    ],
  },
  {
    id: "c-002",
    contractNumber: "DPS-2026-0002",
    clientName: "Team Eventos y Producciones S.A. de C.V.",
    clientRFC: "TEP180523GH9",
    clientDomicilio:
      "Av. Chapultepec 540, Col. Roma Norte, Alcaldia Cuauhtemoc, Ciudad de Mexico, C.P. 06700",
    clientRepresentante: "Ricardo Montoya Gutierrez",
    clientRepresentanteCargo: "Director General",
    clientContacto: "ricardo@teameventos.mx | +52 55 4321 8765",
    projectName: "Team - Papalote Museo del Nino",
    descripcionServicio:
      "Servicio integral de tecnologia interactiva y experiencias inmersivas para la renovacion de la zona de tecnologia del Papalote Museo del Nino, incluyendo instalaciones permanentes de realidad virtual, mesas interactivas, pantallas touch, desarrollo de software personalizado, capacitacion al personal del museo y soporte tecnico por 6 meses, conforme al Anexo A del presente contrato.",
    fechaEvento: "2026-04-01",
    ubicacionEvento: "Papalote Museo del Nino, Av. Constituyentes 268, CDMX",
    vendedor: "Maria",
    createdAt: "2026-02-10T14:30:00Z",
    vigenciaInicio: "2026-02-15",
    vigenciaFin: "2026-08-15",
    status: "activo",
    lineItems: [
      { id: "cl-7", productName: "Estaciones VR Inmersivas", category: "VR/AR/AI", quantity: 6, days: 1, unitPrice: 85000, lineTotal: 510000 },
      { id: "cl-8", productName: "Mesas Interactivas Multitouch", category: "Screens & Tech", quantity: 4, days: 1, unitPrice: 120000, lineTotal: 480000 },
      { id: "cl-9", productName: "Desarrollo Software Personalizado", category: "Services", quantity: 1, days: 1, unitPrice: 350000, lineTotal: 350000 },
      { id: "cl-10", productName: "Capacitacion y Soporte 6 meses", category: "Services", quantity: 1, days: 1, unitPrice: 180000, lineTotal: 180000 },
      { id: "cl-11", productName: "Instalacion y Montaje Permanente", category: "Services", quantity: 1, days: 1, unitPrice: 132000, lineTotal: 132000 },
    ],
    subtotal: 1652000,
    iva: 264320,
    total: 1916320,
    paymentSchedule: [
      { id: "ps-6", concepto: "Anticipo (50%)", porcentaje: 50, monto: 826000, fechaLimite: "2026-02-20", pagado: true },
      { id: "ps-7", concepto: "Liquidacion (50%) a 30 dias", porcentaje: 50, monto: 826000, fechaLimite: "2026-05-01", pagado: false },
    ],
  },
  {
    id: "c-003",
    contractNumber: "DPS-2026-0003",
    clientName: "Tanque Group S.A. de C.V.",
    clientRFC: "TGR190815MK4",
    clientDomicilio:
      "Paseo de la Reforma 250 piso 12, Col. Juarez, Alcaldia Cuauhtemoc, Ciudad de Mexico, C.P. 06600",
    clientRepresentante: "Fernando Vazquez Rios",
    clientRepresentanteCargo: "Director de Operaciones",
    clientContacto: "fvazquez@tanquegroup.mx | +52 55 6789 0123",
    projectName: "Tanque Group - Activaciones BTL 70 fechas",
    descripcionServicio:
      "Servicio de activaciones BTL (Below The Line) en 70 fechas distribuidas a nivel nacional durante el periodo contractual, incluyendo renta de photo booths, equipos interactivos, personal operativo por fecha, logistica de transporte, montaje y desmontaje en cada ubicacion, conforme al calendario y especificaciones del Anexo A del presente contrato.",
    fechaEvento: "2026-04-01",
    ubicacionEvento: "70 ubicaciones a nivel nacional",
    vendedor: "Gabriela",
    createdAt: "2026-03-01T09:00:00Z",
    vigenciaInicio: "2026-04-01",
    vigenciaFin: "2026-12-31",
    status: "enviado",
    lineItems: [
      { id: "cl-12", productName: "iPad Booth Digital (por fecha)", category: "Photo Booths", quantity: 70, days: 1, unitPrice: 3000, lineTotal: 210000 },
      { id: "cl-13", productName: "Personal Operativo (por fecha)", category: "Services", quantity: 70, days: 1, unitPrice: 1500, lineTotal: 105000 },
      { id: "cl-14", productName: "Logistica Nacional (por fecha)", category: "Services", quantity: 70, days: 1, unitPrice: 1500, lineTotal: 105000 },
    ],
    subtotal: 420000,
    iva: 67200,
    total: 487200,
    paymentSchedule: [
      { id: "ps-8", concepto: "Anticipo (50%)", porcentaje: 50, monto: 210000, fechaLimite: "2026-03-20", pagado: false },
      { id: "ps-9", concepto: "Pago mensual Abril", porcentaje: 5.56, monto: 23333.33, fechaLimite: "2026-04-30", pagado: false },
      { id: "ps-10", concepto: "Pago mensual Mayo", porcentaje: 5.56, monto: 23333.33, fechaLimite: "2026-05-31", pagado: false },
      { id: "ps-11", concepto: "Pago mensual Junio", porcentaje: 5.56, monto: 23333.33, fechaLimite: "2026-06-30", pagado: false },
      { id: "ps-12", concepto: "Pagos restantes Jul-Dic", porcentaje: 33.33, monto: 140000, fechaLimite: "2026-12-31", pagado: false },
    ],
  },
  {
    id: "c-004",
    contractNumber: "DPS-2026-0004",
    clientName: "Chipichape Eventos S.A. de C.V.",
    clientRFC: "CHE210430QW5",
    clientDomicilio:
      "Blvd. Kukulcan Km 12.5, Zona Hotelera, Cancun, Quintana Roo, C.P. 77500",
    clientRepresentante: "Monica Villarreal Duran",
    clientRepresentanteCargo: "Directora Comercial",
    clientContacto: "monica@chipichape.mx | +52 998 123 4567",
    projectName: "Chipichape - Cancun",
    descripcionServicio:
      "Paquete integral de tecnologia interactiva para evento corporativo en Cancun, incluyendo photo booths (Glambot, 360 Booth), equipos de realidad virtual, juegos interactivos, personal operativo, montaje, desmontaje, transporte foraneo y viaticos del equipo, conforme al Anexo A del presente contrato.",
    fechaEvento: "2026-06-20",
    ubicacionEvento: "Moon Palace Resort, Cancun, Quintana Roo",
    vendedor: "Pricila",
    createdAt: "2026-03-22T09:15:00Z",
    vigenciaInicio: "2026-03-22",
    vigenciaFin: "2026-07-22",
    status: "en_revision",
    lineItems: [
      { id: "cl-15", productName: "Glambot", category: "Photo Booths", quantity: 1, days: 2, unitPrice: 22600, lineTotal: 45200 },
      { id: "cl-16", productName: "360 Booth", category: "Photo Booths", quantity: 2, days: 2, unitPrice: 18500, lineTotal: 74000 },
      { id: "cl-17", productName: "Beat Saber VR", category: "VR/AR/AI", quantity: 2, days: 2, unitPrice: 22000, lineTotal: 88000 },
      { id: "cl-18", productName: "Batak Pared", category: "Interactive Games", quantity: 1, days: 2, unitPrice: 18500, lineTotal: 37000 },
      { id: "cl-19", productName: "Personal Operativo", category: "Services", quantity: 8, days: 2, unitPrice: 3500, lineTotal: 56000 },
      { id: "cl-20", productName: "Montaje y Desmontaje", category: "Services", quantity: 1, days: 1, unitPrice: 12000, lineTotal: 12000 },
      { id: "cl-21", productName: "Transporte Foraneo", category: "Services", quantity: 1, days: 1, unitPrice: 35000, lineTotal: 35000 },
      { id: "cl-22", productName: "Viaticos Equipo (8 personas)", category: "Viaticos", quantity: 8, days: 3, unitPrice: 2011.5, lineTotal: 48276 },
    ],
    subtotal: 395476,
    iva: 63276.16,
    total: 458752.16,
    paymentSchedule: [
      { id: "ps-13", concepto: "Anticipo (50%)", porcentaje: 50, monto: 197738, fechaLimite: "2026-04-15", pagado: false },
      { id: "ps-14", concepto: "Liquidacion (50%) previo al evento", porcentaje: 50, monto: 197738, fechaLimite: "2026-06-10", pagado: false },
    ],
  },
  {
    id: "c-005",
    contractNumber: "DPS-2026-0005",
    clientName: "Innovacc S.A. de C.V.",
    clientRFC: "INN200305KL8",
    clientDomicilio:
      "Av. Revolucion 1234, Col. San Angel, Alcaldia Alvaro Obregon, Ciudad de Mexico, C.P. 01000",
    clientRepresentante: "Carlos Fernandez Morales",
    clientRepresentanteCargo: "Director de Marketing",
    clientContacto: "carlos@innovacc.com | +52 81 2345 6789",
    projectName: "Innovacc - Activacion CDMX",
    descripcionServicio:
      "Servicio integral de tecnologia interactiva para activacion de marca en Ciudad de Mexico, incluyendo equipos de realidad virtual, mesas interactivas, personal operativo y logistica local, conforme al Anexo A del presente contrato.",
    fechaEvento: "2026-05-15",
    ubicacionEvento: "Centro de Convenciones Santa Fe, Ciudad de Mexico",
    vendedor: "Maria",
    createdAt: "2026-03-12T10:00:00Z",
    vigenciaInicio: "2026-03-12",
    vigenciaFin: "2026-06-12",
    status: "borrador",
    lineItems: [
      { id: "cl-23", productName: "Beat Saber VR", category: "VR/AR/AI", quantity: 2, days: 3, unitPrice: 22000, lineTotal: 112200 },
      { id: "cl-24", productName: "VR Mixta", category: "VR/AR/AI", quantity: 1, days: 3, unitPrice: 28000, lineTotal: 75600 },
      { id: "cl-25", productName: "Mesa Interactiva", category: "Screens & Tech", quantity: 3, days: 3, unitPrice: 24000, lineTotal: 194400 },
      { id: "cl-26", productName: "Personal Operativo", category: "Services", quantity: 10, days: 1, unitPrice: 3500, lineTotal: 35000 },
    ],
    subtotal: 260880,
    iva: 41740.8,
    total: 302620.8,
    paymentSchedule: [
      { id: "ps-15", concepto: "Anticipo (50%)", porcentaje: 50, monto: 130440, fechaLimite: "2026-03-20", pagado: false },
      { id: "ps-16", concepto: "Liquidacion (50%)", porcentaje: 50, monto: 130440, fechaLimite: "2026-05-20", pagado: false },
    ],
  },
];

// ---------------------------------------------------------------------------
// Status filters
// ---------------------------------------------------------------------------

const STATUS_FILTERS: { value: ContractStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "borrador", label: "Borrador" },
  { value: "en_revision", label: "En Revision" },
  { value: "enviado", label: "Enviado" },
  { value: "firmado", label: "Firmado" },
  { value: "activo", label: "Activo" },
  { value: "vencido", label: "Vencido" },
  { value: "cancelado", label: "Cancelado" },
];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ContractsPage() {
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "todos">("todos");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [storedContracts, setStoredContracts] = useState<Contract[]>([]);

  // Load localStorage contracts on mount (client-only).
  // localStorage is only available in the browser, so we hydrate after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStoredContracts(loadStoredContracts());
  }, []);

  // Merge stored + mocks, newest first (stored contracts already prepended on save)
  const allContracts = useMemo<Contract[]>(() => {
    const merged = [...storedContracts, ...MOCK_CONTRACTS];
    // Sort by createdAt desc so latest always appears first.
    return merged.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [storedContracts]);

  const filteredContracts =
    statusFilter === "todos"
      ? allContracts
      : allContracts.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredContracts.length} contrato{filteredContracts.length !== 1 ? "s" : ""}
            {storedContracts.length > 0 && (
              <span className="ml-2 text-blue-500">
                ({storedContracts.length} generado{storedContracts.length !== 1 ? "s" : ""} localmente)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Scale className="w-4 h-4" />
            Generar desde Cotizacion
          </Button>
          <Link href="/contracts/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Contrato
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs: Lista / Vista Previa */}
      <Tabs defaultValue="lista">
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        {/* ---- TAB: Lista ---- */}
        <TabsContent value="lista">
          <div className="space-y-4">
            {/* Status filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="flex gap-1 flex-wrap">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      statusFilter === f.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]"># Contrato</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estatus</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="w-[80px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-gray-400"
                        >
                          No hay contratos con este filtro.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredContracts.map((c) => (
                        <TableRow
                          key={c.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedContract(c)}
                        >
                          <TableCell>
                            <span className="font-mono text-xs text-gray-500 flex items-center gap-1">
                              {c.contractNumber}
                              {c.generatedFromProject && (
                                <Sparkles className="w-3 h-3 text-blue-500" />
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{c.clientName}</p>
                              <p className="text-[11px] text-gray-400">
                                {c.clientRepresentante || "—"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{c.projectName}</TableCell>
                          <TableCell className="text-right font-mono text-sm font-medium">
                            {formatCurrency(c.subtotal)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {fmtDate(c.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`gap-1 ${getStatusColor(c.status)}`}
                            >
                              {getStatusIcon(c.status)}
                              {getStatusLabel(c.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{c.vendedor}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedContract(c);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon-sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Inline expanded preview */}
            {selectedContract && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setSelectedContract(null)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">
                          {selectedContract.projectName}
                        </h2>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(selectedContract.status)}
                        >
                          {getStatusLabel(selectedContract.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">
                        #{selectedContract.contractNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.print()}
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Send className="w-4 h-4" />
                      Enviar al Cliente
                    </Button>
                  </div>
                </div>

                <ContractPreview contract={selectedContract} />
              </div>
            )}
          </div>
        </TabsContent>

        {/* ---- TAB: Vista Previa ---- */}
        <TabsContent value="preview">
          {selectedContract ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSelectedContract(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        {selectedContract.projectName}
                      </h2>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(selectedContract.status)}
                      >
                        {getStatusLabel(selectedContract.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">
                      #{selectedContract.contractNumber}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.print()}
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Send className="w-4 h-4" />
                    Enviar al Cliente
                  </Button>
                </div>
              </div>
              <ContractPreview contract={selectedContract} />
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  Selecciona un contrato de la lista para ver su vista previa.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
