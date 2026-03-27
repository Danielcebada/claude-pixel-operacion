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
