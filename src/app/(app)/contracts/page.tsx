"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ContractStatus =
  | "borrador"
  | "en_revision"
  | "enviado"
  | "firmado"
  | "activo"
  | "vencido"
  | "cancelado";

interface ContractLineItem {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  days: number;
  unitPrice: number;
  lineTotal: number;
}

interface PaymentScheduleItem {
  id: string;
  concepto: string;
  porcentaje: number;
  monto: number;
  fechaLimite: string;
  pagado: boolean;
}

interface Contract {
  id: string;
  contractNumber: string;
  clientName: string;
  clientRFC: string;
  clientDomicilio: string;
  clientRepresentante: string;
  clientRepresentanteCargo: string;
  clientContacto: string;
  projectName: string;
  descripcionServicio: string;
  fechaEvento: string;
  ubicacionEvento: string;
  vendedor: string;
  createdAt: string;
  vigenciaInicio: string;
  vigenciaFin: string;
  status: ContractStatus;
  lineItems: ContractLineItem[];
  subtotal: number;
  iva: number;
  total: number;
  paymentSchedule: PaymentScheduleItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusColor(status: ContractStatus): string {
  switch (status) {
    case "borrador":
      return "bg-gray-100 text-gray-700";
    case "en_revision":
      return "bg-yellow-100 text-yellow-700";
    case "enviado":
      return "bg-blue-100 text-blue-700";
    case "firmado":
      return "bg-emerald-100 text-emerald-700";
    case "activo":
      return "bg-green-100 text-green-700";
    case "vencido":
      return "bg-orange-100 text-orange-700";
    case "cancelado":
      return "bg-red-100 text-red-700";
  }
}

function getStatusLabel(status: ContractStatus): string {
  switch (status) {
    case "borrador":
      return "Borrador";
    case "en_revision":
      return "En Revision";
    case "enviado":
      return "Enviado";
    case "firmado":
      return "Firmado";
    case "activo":
      return "Activo";
    case "vencido":
      return "Vencido";
    case "cancelado":
      return "Cancelado";
  }
}

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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Prestador Constants
// ---------------------------------------------------------------------------

const PRESTADOR = {
  razonSocial: "Digital Pixel Studios, S.A. de C.V.",
  rfc: "DPS091202K62",
  representante: "Daniel Cebada Echeverria",
  domicilio:
    "Culiacan 123 piso 1, Hipodromo Condesa, Cuauhtemoc, Ciudad de Mexico, C.P. 06100",
  banco: "BBVA",
  cuenta: "0170604186",
  clabe: "012180001706041869",
  titular: "Digital Pixel Studio, S.A. de C.V.",
};

// ---------------------------------------------------------------------------
// Mock Data — Q1 2026 real deals
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
// Contract Preview Component — Legal format
// ---------------------------------------------------------------------------

function ContractPreview({ contract }: { contract: Contract }) {
  const ciudadFecha = `Ciudad de Mexico, a ${fmtDateLong(contract.createdAt)}`;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden print:ring-0 print:max-w-none">
      {/* Header bar */}
      <div className="bg-gray-900 text-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-lg font-bold">
              DP
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">DIGITAL PIXEL STUDIOS</h2>
              <p className="text-[10px] text-gray-400">Tecnologia Interactiva para Eventos</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-mono">
              #{contract.contractNumber}
            </p>
            <Badge
              variant="secondary"
              className={`mt-1 text-[10px] ${getStatusColor(contract.status)}`}
            >
              {getStatusLabel(contract.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Contract body */}
      <div className="px-8 py-8 space-y-6 text-[13px] leading-relaxed text-gray-700">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-base font-bold uppercase tracking-wider text-gray-900">
            Contrato de Prestacion de Servicios
          </h1>
          <p className="text-xs text-gray-500">{ciudadFecha}</p>
        </div>

        {/* Intro paragraph */}
        <p className="text-justify">
          Contrato de Prestacion de Servicios que celebran, por una parte, <strong>{PRESTADOR.razonSocial}</strong>,
          representada en este acto por el <strong>C. {PRESTADOR.representante}</strong>, en su
          caracter de Director General, a quien en lo sucesivo se le denominara{" "}
          <strong>&quot;EL PRESTADOR&quot;</strong>; y por la otra parte,{" "}
          <strong>{contract.clientName}</strong>, representada por el{" "}
          <strong>C. {contract.clientRepresentante}</strong>, en su caracter de{" "}
          {contract.clientRepresentanteCargo}, a quien en lo sucesivo se le denominara{" "}
          <strong>&quot;EL CLIENTE&quot;</strong>; y de manera conjunta como{" "}
          <strong>&quot;LAS PARTES&quot;</strong>, al tenor de las siguientes declaraciones y
          clausulas:
        </p>

        {/* ---- DECLARACIONES ---- */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2">
            Declaraciones
          </h2>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">
              I. Declara EL PRESTADOR, a traves de su representante:
            </h3>
            <ol className="list-[lower-alpha] list-inside space-y-2 pl-2 text-justify">
              <li>
                Que es una sociedad mercantil legalmente constituida conforme a las leyes de los
                Estados Unidos Mexicanos, segun consta en la escritura publica correspondiente.
              </li>
              <li>
                Que su Registro Federal de Contribuyentes es <strong>{PRESTADOR.rfc}</strong>.
              </li>
              <li>
                Que el C. {PRESTADOR.representante} es su representante legal, con facultades
                suficientes para celebrar el presente contrato, las cuales no le han sido revocadas
                ni limitadas en forma alguna.
              </li>
              <li>
                Que tiene la capacidad tecnica, humana y material necesaria para prestar los
                servicios objeto del presente contrato.
              </li>
              <li>
                Que se encuentra al corriente en el cumplimiento de sus obligaciones fiscales.
              </li>
              <li>
                Que senala como su domicilio para todos los efectos legales del presente contrato
                el ubicado en: {PRESTADOR.domicilio}.
              </li>
            </ol>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">
              II. Declara EL CLIENTE, a traves de su representante:
            </h3>
            <ol className="list-[lower-alpha] list-inside space-y-2 pl-2 text-justify">
              <li>
                Que es una sociedad legalmente constituida conforme a las leyes de los Estados
                Unidos Mexicanos.
              </li>
              <li>
                Que su Registro Federal de Contribuyentes es{" "}
                <strong>{contract.clientRFC}</strong>.
              </li>
              <li>
                Que el C. {contract.clientRepresentante} cuenta con las facultades legales
                suficientes para obligarse en los terminos del presente contrato.
              </li>
              <li>
                Que es su deseo contratar los servicios de EL PRESTADOR en los terminos y
                condiciones que se establecen en el presente instrumento.
              </li>
              <li>
                Que senala como su domicilio para todos los efectos legales del presente contrato
                el ubicado en: {contract.clientDomicilio}.
              </li>
            </ol>
          </div>
        </div>

        {/* ---- CLAUSULAS ---- */}
        <div className="space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2">
            Clausulas
          </h2>

          {/* PRIMERA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              PRIMERA. &mdash; Objeto del Contrato
            </h3>
            <p className="text-justify">
              EL PRESTADOR se obliga a proporcionar a EL CLIENTE los servicios de tecnologia
              interactiva y experiencias inmersivas descritos a continuacion, mismos que se
              detallan con mayor precision en el Anexo A que forma parte integral del presente
              contrato:
            </p>
            <p className="text-justify italic text-gray-600">
              {contract.descripcionServicio}
            </p>
            <div className="grid grid-cols-2 gap-4 my-3 text-xs">
              <div>
                <span className="text-gray-400">Fecha(s) del Evento:</span>{" "}
                <span className="font-medium">{fmtDateLong(contract.fechaEvento)}</span>
              </div>
              <div>
                <span className="text-gray-400">Ubicacion:</span>{" "}
                <span className="font-medium">{contract.ubicacionEvento}</span>
              </div>
            </div>

            {/* Desglose / Anexo A */}
            <p className="text-xs font-semibold text-gray-600 mt-4 mb-2">
              Anexo A &mdash; Desglose de Servicios
            </p>
            <table className="w-full text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-semibold text-gray-600">#</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-600">Concepto</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 w-14">Cant.</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 w-14">Dias</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-600 w-24">P. Unitario</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-600 w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {contract.lineItems.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 px-2 text-gray-400">{idx + 1}</td>
                    <td className="py-2 px-2">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-[10px] text-gray-400">{item.category}</p>
                    </td>
                    <td className="text-center px-2">{item.quantity}</td>
                    <td className="text-center px-2">{item.days}</td>
                    <td className="text-right px-2 font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right px-2 font-mono font-medium">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SEGUNDA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              SEGUNDA. &mdash; Contraprestacion y Forma de Pago
            </h3>
            <p className="text-justify">
              Como contraprestacion por los servicios descritos en la clausula primera, EL CLIENTE
              se obliga a pagar a EL PRESTADOR la cantidad total de{" "}
              <strong>{formatCurrency(contract.subtotal)} (antes de IVA)</strong>, mas el
              Impuesto al Valor Agregado (IVA) correspondiente de{" "}
              <strong>{formatCurrency(contract.iva)}</strong>, resultando un total de{" "}
              <strong>{formatCurrency(contract.total)}</strong>, conforme al siguiente esquema de
              pagos:
            </p>

            <table className="w-full text-xs border border-gray-200 my-3">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-semibold text-gray-600">Concepto</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 w-16">%</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-600 w-28">Monto</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 w-28">Fecha Limite</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 w-20">Estado</th>
                </tr>
              </thead>
              <tbody>
                {contract.paymentSchedule.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-1.5 px-2">{p.concepto}</td>
                    <td className="text-center px-2">{p.porcentaje}%</td>
                    <td className="text-right px-2 font-mono">{formatCurrency(p.monto)}</td>
                    <td className="text-center px-2 text-gray-500">{fmtDate(p.fechaLimite)}</td>
                    <td className="text-center px-2">
                      {p.pagado ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px]">
                          Pagado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-[10px]">
                          Pendiente
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-justify">
              Los pagos deberan realizarse mediante transferencia electronica a la siguiente cuenta
              bancaria:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 space-y-1 border border-gray-200">
              <p className="font-semibold text-gray-800">Datos Bancarios para Transferencia:</p>
              <p>Banco: {PRESTADOR.banco}</p>
              <p>Titular: {PRESTADOR.titular}</p>
              <p>Cuenta: {PRESTADOR.cuenta}</p>
              <p>CLABE Interbancaria: {PRESTADOR.clabe}</p>
            </div>
          </div>

          {/* TERCERA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              TERCERA. &mdash; Obligaciones del Prestador
            </h3>
            <p className="text-justify">EL PRESTADOR se obliga a:</p>
            <ol className="list-[lower-alpha] list-inside space-y-2 pl-2 text-justify">
              <li>
                Prestar los servicios contratados de manera eficiente y profesional, con la
                calidad y en los tiempos acordados.
              </li>
              <li>
                Utilizar para la prestacion de los servicios a su propio personal, quien
                dependera exclusivamente de EL PRESTADOR, por lo que no se creara relacion laboral
                alguna entre dicho personal y EL CLIENTE.
              </li>
              <li>
                Entregar el equipo y tecnologia contratada en condiciones optimas de
                funcionamiento en la fecha y lugar acordados.
              </li>
              <li>
                Brindar soporte tecnico continuo durante el evento, incluyendo resolucion de
                fallas y contingencias.
              </li>
              <li>
                Responder por los danos y perjuicios que con motivo de los servicios cause a
                EL CLIENTE o a terceros, derivados de su negligencia o dolo.
              </li>
              <li>
                Realizar la entrega del material digital generado durante el evento en un plazo
                no mayor a 5 dias habiles posteriores al mismo.
              </li>
            </ol>
          </div>

          {/* CUARTA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              CUARTA. &mdash; Obligaciones del Cliente
            </h3>
            <p className="text-justify">EL CLIENTE se obliga a:</p>
            <ol className="list-[lower-alpha] list-inside space-y-2 pl-2 text-justify">
              <li>
                Realizar los pagos en tiempo y forma de acuerdo al esquema de pago establecido
                en la clausula segunda del presente contrato.
              </li>
              <li>
                Proporcionar acceso al venue o inmueble donde se realizara el evento con
                anticipacion minima de 4 horas para montaje, garantizando las condiciones tecnicas
                necesarias (conexion electrica dedicada de 110V/220V, espacio minimo requerido,
                area techada con altura minima de 2.5 metros).
              </li>
              <li>
                Designar un responsable de evento que sirva como punto de contacto con el equipo
                de EL PRESTADOR durante la vigencia del presente contrato.
              </li>
              <li>
                Facilitar toda la informacion y materiales necesarios para la correcta prestacion
                de los servicios.
              </li>
            </ol>
          </div>

          {/* QUINTA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              QUINTA. &mdash; Vigencia
            </h3>
            <p className="text-justify">
              El presente contrato tendra una vigencia del{" "}
              <strong>{fmtDateLong(contract.vigenciaInicio)}</strong> al{" "}
              <strong>{fmtDateLong(contract.vigenciaFin)}</strong>, pudiendo ser prorrogado por
              acuerdo escrito de LAS PARTES.
            </p>
          </div>

          {/* SEXTA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              SEXTA. &mdash; Confidencialidad
            </h3>
            <p className="text-justify">
              Ambas partes se comprometen a mantener estricta confidencialidad sobre la
              informacion comercial, tecnica y financiera intercambiada con motivo del presente
              contrato. Ninguna de las partes podra divulgar, reproducir o utilizar dicha
              informacion para fines distintos a los establecidos en este contrato, salvo
              autorizacion expresa por escrito de la otra parte. Esta obligacion subsistira aun
              despues de terminada la vigencia del contrato.
            </p>
          </div>

          {/* SEPTIMA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              SEPTIMA. &mdash; Propiedad Intelectual
            </h3>
            <p className="text-justify">
              Los derechos de propiedad intelectual sobre el software, disenos, desarrollos y
              material creativo generado por EL PRESTADOR en el marco del presente contrato seran
              propiedad de EL PRESTADOR, otorgando a EL CLIENTE una licencia de uso no exclusiva
              para los fines especificos del proyecto contratado. El material fotografico y
              audiovisual generado durante los eventos podra ser utilizado por ambas partes para
              fines promocionales, salvo acuerdo en contrario.
            </p>
          </div>

          {/* OCTAVA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              OCTAVA. &mdash; Terminacion Anticipada
            </h3>
            <p className="text-justify">
              Cualquiera de LAS PARTES podra dar por terminado anticipadamente el presente
              contrato mediante aviso por escrito dirigido a la otra parte con al menos 15
              (quince) dias naturales de anticipacion, sin responsabilidad alguna, salvo la
              obligacion de cubrir los pagos por servicios efectivamente prestados y los gastos
              comprometidos a la fecha de terminacion.
            </p>
          </div>

          {/* NOVENA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              NOVENA. &mdash; Penalizaciones por Cancelacion
            </h3>
            <p className="text-justify">
              En caso de que EL CLIENTE decida cancelar el presente contrato, se aplicaran las
              siguientes condiciones respecto del anticipo pagado:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-xs border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <p>
                  <span className="font-semibold">Cancelacion con mas de 15 dias naturales de anticipacion:</span>{" "}
                  Devolucion del 80% del anticipo pagado.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                <p>
                  <span className="font-semibold">Cancelacion con 8 a 15 dias naturales de anticipacion:</span>{" "}
                  Devolucion del 50% del anticipo pagado.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p>
                  <span className="font-semibold">Cancelacion con menos de 8 dias naturales de anticipacion:</span>{" "}
                  No aplica devolucion del anticipo.
                </p>
              </div>
            </div>
            <p className="text-justify">
              La reprogramacion del evento estara sujeta a disponibilidad de equipo y personal de
              EL PRESTADOR, sin costo adicional siempre que se notifique con al menos 10 dias
              habiles de anticipacion.
            </p>
          </div>

          {/* DECIMA */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              DECIMA. &mdash; Jurisdiccion
            </h3>
            <p className="text-justify">
              Para la interpretacion y cumplimiento del presente contrato, LAS PARTES se someten
              expresamente a la jurisdiccion de los tribunales competentes de la Ciudad de Mexico,
              renunciando a cualquier otro fuero que por razon de sus domicilios presentes o
              futuros pudiera corresponderles.
            </p>
          </div>
        </div>

        {/* ---- FIRMAS ---- */}
        <div className="pt-6">
          <p className="text-justify mb-8">
            Leido que fue el presente contrato por LAS PARTES y enteradas de su contenido y
            alcance legal, lo firman por duplicado en la Ciudad de Mexico, a{" "}
            {fmtDateLong(contract.createdAt)}.
          </p>

          <div className="grid grid-cols-2 gap-16 pt-4">
            <div className="text-center">
              <div className="border-b border-gray-300 mb-3 h-20" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                EL PRESTADOR
              </p>
              <p className="text-sm font-bold">{PRESTADOR.razonSocial}</p>
              <p className="text-xs text-gray-700 mt-1">
                {PRESTADOR.representante}
              </p>
              <p className="text-xs text-gray-500">Director General</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 mb-3 h-20" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                EL CLIENTE
              </p>
              <p className="text-sm font-bold">{contract.clientName}</p>
              <p className="text-xs text-gray-700 mt-1">
                {contract.clientRepresentante}
              </p>
              <p className="text-xs text-gray-500">{contract.clientRepresentanteCargo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-gray-900 text-center">
        <p className="text-[10px] text-gray-400">
          {PRESTADOR.razonSocial} | RFC: {PRESTADOR.rfc} | {PRESTADOR.domicilio}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ContractsPage() {
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "todos">("todos");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const filteredContracts =
    statusFilter === "todos"
      ? MOCK_CONTRACTS
      : MOCK_CONTRACTS.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredContracts.length} contrato{filteredContracts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Scale className="w-4 h-4" />
            Generar desde Cotizacion
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Contrato
          </Button>
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
                            <span className="font-mono text-xs text-gray-500">
                              {c.contractNumber}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{c.clientName}</p>
                              <p className="text-[11px] text-gray-400">
                                {c.clientRepresentante}
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
