// === COSTOS DETALLADOS (con ODC) ===
export interface CostoLinea {
  id: string;
  project_id: string;
  concepto: string;
  proveedor?: string;
  presupuesto: number;
  real: number;
  odc_file?: string; // filename or URL
  odc_status: "pendiente" | "enviada" | "aprobada";
  factura_proveedor?: string;
  observaciones?: string;
}

// === GASTOS DETALLADOS (operacion) ===
export type GastoCategoria = "gasolina" | "internet" | "operacion" | "instalacion" | "ubers" | "extras" | "otro";

export interface GastoLinea {
  id: string;
  project_id: string;
  categoria: GastoCategoria;
  concepto: string;
  responsable?: string;
  presupuesto: number;
  real: number;
  fecha?: string;
  observaciones?: string;
}

export const GASTO_CATEGORIAS: Record<GastoCategoria, string> = {
  gasolina: "Gasolina",
  internet: "Internet",
  operacion: "Operacion",
  instalacion: "Instalacion",
  ubers: "Ubers",
  extras: "Extras",
  otro: "Otro",
};

// === COMISIONES ===
export type ComisionRol = "vendedor" | "pm" | "productor" | "direccion_ventas" | "direccion_operacion";

export interface ComisionRegla {
  id: string;
  rol: ComisionRol;
  porcentaje: number; // e.g. 5 = 5%
  base_calculo: "venta_real" | "utilidad_bruta" | "utilidad_neta" | "utilidad_total";
  is_active: boolean;
}

export interface ComisionProyecto {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  rol: ComisionRol;
  porcentaje: number;
  base_amount: number;
  comision_amount: number;
  is_override: boolean;
}

export const COMISION_ROLES: Record<ComisionRol, string> = {
  vendedor: "Vendedor",
  pm: "Project Manager",
  productor: "Productor",
  direccion_ventas: "Direccion de Ventas",
  direccion_operacion: "Direccion de Operacion",
};

// Mock data
// Reglas reales Digital Pixel - todas sobre utilidad total
// Si Daniel Cebada es el vendedor, direccion_ventas NO gana comision
export const MOCK_COMISION_REGLAS: ComisionRegla[] = [
  { id: "cr1", rol: "vendedor", porcentaje: 4.5, base_calculo: "utilidad_total", is_active: true },
  { id: "cr2", rol: "pm", porcentaje: 3, base_calculo: "utilidad_total", is_active: true },
  { id: "cr3", rol: "productor", porcentaje: 2, base_calculo: "utilidad_total", is_active: true },
  { id: "cr4", rol: "direccion_operacion", porcentaje: 0.75, base_calculo: "utilidad_total", is_active: true },
  { id: "cr5", rol: "direccion_ventas", porcentaje: 0.75, base_calculo: "utilidad_total", is_active: true },
];
