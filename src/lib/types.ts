export type UserRole = "admin" | "pm" | "vendedor" | "finance";
export type ProjectStatus = "pendiente" | "presupuesto_confirmado" | "en_operacion" | "operado" | "finalizado" | "cancelado";
export type PaymentStatus = "pagado_100" | "parcial" | "pendiente";
export type BusinessUnit = "pixel-factory" | "oromo" | "picbox";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  hubspot_owner_id?: string;
  is_active: boolean;
}

export interface Project {
  id: string;
  hubspot_deal_id?: string;
  deal_name: string;
  business_unit: BusinessUnit;
  vendedor_id: string;
  vendedor_name?: string;
  pm_id: string;
  pm_name?: string;
  product_type: string;
  event_date: string;
  close_date?: string;
  currency: "MXN" | "USD";
  status: ProjectStatus;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  drive_link?: string;
  // Payment & workflow fields
  anticipo_requerido: number;
  anticipo_pagado: boolean;
  fecha_limite_pago: string;
  presupuesto_confirmado: boolean;
  dias_para_evento: number;
}

export interface ProjectFinancials {
  id: string;
  project_id: string;
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

export interface ProjectProfitability extends ProjectFinancials {
  project: Project;
  total_gastos_presupuesto: number;
  total_gastos_real: number;
  utilidad_bruta_presupuesto: number;
  utilidad_bruta_real: number;
  utilidad_neta_presupuesto: number;
  utilidad_neta_real: number;
  utilidad_viaticos: number;
  utilidad_total: number;
  pct_utilidad: number;
}

export interface ViaticosDetail {
  id: string;
  project_id: string;
  concepto: string;
  presupuesto: number;
  real_amount: number;
  observacion?: string;
}

export interface OperacionDetail {
  id: string;
  project_id: string;
  concepto: string;
  operador?: string;
  observaciones?: string;
}

export interface InstalacionDetail {
  id: string;
  project_id: string;
  concepto: string;
  instalador?: string;
  observaciones?: string;
}

export interface UbersDetail {
  id: string;
  project_id: string;
  persona: string;
  fecha?: string;
  monto: number;
  observaciones?: string;
}

// Computed helpers
export function computeProfitability(f: ProjectFinancials): {
  total_gastos_presupuesto: number;
  total_gastos_real: number;
  utilidad_bruta_presupuesto: number;
  utilidad_bruta_real: number;
  utilidad_neta_presupuesto: number;
  utilidad_neta_real: number;
  utilidad_viaticos: number;
  utilidad_total: number;
  pct_utilidad: number;
} {
  const total_gastos_presupuesto =
    f.gasolina_presupuesto + f.internet_presupuesto + f.operacion_presupuesto +
    f.instalacion_presupuesto + f.ubers_presupuesto + f.extras_presupuesto;
  const total_gastos_real =
    f.gasolina_real + f.internet_real + f.operacion_real +
    f.instalacion_real + f.ubers_real + f.extras_real;
  const utilidad_bruta_presupuesto = f.venta_presupuesto - f.costos_presupuesto;
  const utilidad_bruta_real = f.venta_real - f.costos_real;
  const utilidad_neta_presupuesto = utilidad_bruta_presupuesto - total_gastos_presupuesto;
  const utilidad_neta_real = utilidad_bruta_real - total_gastos_real;
  const utilidad_viaticos = f.viaticos_venta - f.viaticos_gasto - f.viaticos_uber;
  const utilidad_total = utilidad_neta_real + utilidad_viaticos;
  const total_venta = f.venta_real + f.viaticos_venta;
  const pct_utilidad = total_venta > 0 ? Math.round((utilidad_total / total_venta) * 10000) / 100 : 0;

  return {
    total_gastos_presupuesto,
    total_gastos_real,
    utilidad_bruta_presupuesto,
    utilidad_bruta_real,
    utilidad_neta_presupuesto,
    utilidad_neta_real,
    utilidad_viaticos,
    utilidad_total,
    pct_utilidad,
  };
}

export function formatCurrency(amount: number, currency: "MXN" | "USD" = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMarginColor(pct: number): string {
  if (pct >= 50) return "text-blue-600";
  if (pct >= 30) return "text-green-600";
  if (pct >= 15) return "text-yellow-600";
  return "text-red-600";
}

export function getMarginBg(pct: number): string {
  if (pct >= 50) return "bg-blue-500";
  if (pct >= 30) return "bg-green-500";
  if (pct >= 15) return "bg-yellow-500";
  return "bg-red-500";
}

export function getMarginLabel(pct: number): string {
  if (pct >= 50) return "Excelente";
  if (pct >= 30) return "Bueno";
  if (pct >= 15) return "Regular";
  return "Critico";
}

// Payment helpers (alert-based, non-blocking)
export function computeDiasParaEvento(eventDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(eventDate + "T00:00:00");
  const diff = event.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export type AnticipoStatus = "pagado" | "pendiente";

export function getAnticipoStatus(anticipoPagado: boolean): AnticipoStatus {
  return anticipoPagado ? "pagado" : "pendiente";
}

export const BUSINESS_UNITS: Record<BusinessUnit, string> = {
  "pixel-factory": "Pixel Factory",
  oromo: "Oromo",
  picbox: "Picbox",
};

export const PRODUCT_TYPES = [
  "360", "Green Screen", "Ipad Booth", "Coffee Print", "Glambooth", "Glambot",
  "Tattoo Print", "Robot Sketch", "Photobooth", "Totem", "VR", "AR",
  "Filtro IG", "Espejo Magico", "Walk Green Screen", "Batak", "Garrita",
  "Claw Machine", "Simulador", "Neon Room", "Photo IA", "Bubblehead AI",
  "Dibujo AI", "Skin Lab AI", "Cotton Candy", "Mosaico", "Pantalla Interactiva",
  "Audio Guestbook", "Juego Interactivo", "Caminadora", "Holograma", "Otro",
];

export const ZONES = [
  "CDMX", "Area Metropolitana", "MTY", "GDL", "Cancun", "Queretaro",
  "Puebla", "Merida", "Acapulco", "Leon", "Torreon", "Cuernavaca", "Foraneo",
];

// ─── Contract Types ─────────────────────────────────────────────────────────
export type DiasCredito = "contado" | "30" | "45" | "60" | "90";
export type EsquemaPago = "anticipo_unico" | "50_50" | "tres_facturas" | "contra_entrega";
export type FormaPago = "transferencia" | "cheque" | "efectivo";

export interface PaymentTerms {
  diasCredito: DiasCredito;
  esquemaPago: EsquemaPago;
  porcentajeAnticipo: number; // 0-100
  numeroFacturas: number; // 1-12
  ivaPct: number; // default 16
  retencionISR: boolean; // 10%
  retencionIVA: boolean; // 10.67%
  incluyeViaticos: boolean;
  lugarEntrega: string;
  formaPago: FormaPago;
  penalidadCancelacionPct: number; // default 30
}

// Config captured by the wizard before producing a Contract record
export interface ContractConfig {
  projectId: string;
  terms: PaymentTerms;
}

// Per-client memorized settings (persists in pixel_client_settings)
export interface ClientSettings {
  clientName: string;
  rfc?: string;
  domicilio?: string;
  representante?: string;
  representanteCargo?: string;
  contacto?: string;
  defaultTerms?: PaymentTerms;
  updatedAt: string;
}

export const DEFAULT_PAYMENT_TERMS: PaymentTerms = {
  diasCredito: "contado",
  esquemaPago: "50_50",
  porcentajeAnticipo: 50,
  numeroFacturas: 1,
  ivaPct: 16,
  retencionISR: false,
  retencionIVA: false,
  incluyeViaticos: false,
  lugarEntrega: "CDMX",
  formaPago: "transferencia",
  penalidadCancelacionPct: 30,
};

export const DIAS_CREDITO_OPTIONS: { value: DiasCredito; label: string }[] = [
  { value: "contado", label: "Contado" },
  { value: "30", label: "30 dias" },
  { value: "45", label: "45 dias" },
  { value: "60", label: "60 dias" },
  { value: "90", label: "90 dias" },
];

export const ESQUEMA_PAGO_OPTIONS: { value: EsquemaPago; label: string; description: string }[] = [
  { value: "anticipo_unico", label: "Anticipo unico", description: "Un solo pago al inicio" },
  { value: "50_50", label: "2 facturas 50/50", description: "50% anticipo + 50% liquidacion" },
  { value: "tres_facturas", label: "3 facturas", description: "Anticipo + intermedio + liquidacion" },
  { value: "contra_entrega", label: "Pago contra entrega", description: "100% al entregar" },
];

export const FORMA_PAGO_OPTIONS: { value: FormaPago; label: string }[] = [
  { value: "transferencia", label: "Transferencia" },
  { value: "cheque", label: "Cheque" },
  { value: "efectivo", label: "Efectivo" },
];
