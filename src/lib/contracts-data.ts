import {
  PaymentTerms,
  ClientSettings,
  EsquemaPago,
  DiasCredito,
  FormaPago,
} from "./types";

// ---------------------------------------------------------------------------
// Contract domain types
// ---------------------------------------------------------------------------

export type ContractStatus =
  | "borrador"
  | "en_revision"
  | "enviado"
  | "firmado"
  | "activo"
  | "vencido"
  | "cancelado";

export interface ContractLineItem {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  days: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PaymentScheduleItem {
  id: string;
  concepto: string;
  porcentaje: number;
  monto: number;
  fechaLimite: string;
  pagado: boolean;
}

export interface Contract {
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
  /** Optional terms used to generate this contract (when created via the wizard). */
  terms?: PaymentTerms;
  /** Marker so the UI can distinguish generated contracts from seeded mocks. */
  generatedFromProject?: boolean;
}

// ---------------------------------------------------------------------------
// Prestador constants — shared across preview + wizard
// ---------------------------------------------------------------------------

export const PRESTADOR = {
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
// Status helpers
// ---------------------------------------------------------------------------

export function getStatusColor(status: ContractStatus): string {
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

export function getStatusLabel(status: ContractStatus): string {
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

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Label helpers for terms
// ---------------------------------------------------------------------------

export function diasCreditoLabel(v: DiasCredito): string {
  return v === "contado" ? "Contado" : `${v} dias`;
}

export function esquemaPagoLabel(v: EsquemaPago): string {
  switch (v) {
    case "anticipo_unico":
      return "Anticipo unico";
    case "50_50":
      return "2 facturas 50/50";
    case "tres_facturas":
      return "3 facturas";
    case "contra_entrega":
      return "Pago contra entrega";
  }
}

export function formaPagoLabel(v: FormaPago): string {
  switch (v) {
    case "transferencia":
      return "Transferencia electronica";
    case "cheque":
      return "Cheque";
    case "efectivo":
      return "Efectivo";
  }
}

// ---------------------------------------------------------------------------
// Payment schedule auto-builder
// ---------------------------------------------------------------------------

/**
 * Compute a payment schedule given a total (pre-IVA), the total (with IVA),
 * the event date, and the PaymentTerms chosen on the wizard.
 *
 * Amounts in the schedule are percentages of `totalConIva` so they reconcile
 * with the grand total displayed on the contract.
 */
export function buildPaymentSchedule(
  totalConIva: number,
  eventDate: string,
  terms: PaymentTerms,
): PaymentScheduleItem[] {
  const now = new Date();
  const event = new Date(eventDate + "T00:00:00");
  const items: PaymentScheduleItem[] = [];

  const addDays = (d: Date, n: number) => {
    const copy = new Date(d.getTime());
    copy.setDate(copy.getDate() + n);
    return copy.toISOString().split("T")[0];
  };

  const anticipoPct = clampPct(terms.porcentajeAnticipo);

  if (terms.esquemaPago === "contra_entrega") {
    items.push({
      id: `ps-${Date.now()}-1`,
      concepto: "Pago 100% contra entrega",
      porcentaje: 100,
      monto: round2(totalConIva),
      fechaLimite: addDays(event, 0),
      pagado: false,
    });
    return items;
  }

  if (terms.esquemaPago === "anticipo_unico") {
    items.push({
      id: `ps-${Date.now()}-1`,
      concepto: "Anticipo unico (100%)",
      porcentaje: 100,
      monto: round2(totalConIva),
      fechaLimite: addDays(now, 5),
      pagado: false,
    });
    return items;
  }

  if (terms.esquemaPago === "50_50") {
    const anticipoMonto = round2((totalConIva * anticipoPct) / 100);
    const liquidacionPct = 100 - anticipoPct;
    items.push({
      id: `ps-${Date.now()}-1`,
      concepto: `Anticipo (${anticipoPct}%)`,
      porcentaje: anticipoPct,
      monto: anticipoMonto,
      fechaLimite: addDays(now, 5),
      pagado: false,
    });
    items.push({
      id: `ps-${Date.now()}-2`,
      concepto: `Liquidacion (${liquidacionPct}%)${
        terms.diasCredito !== "contado" ? ` a ${terms.diasCredito} dias` : ""
      }`,
      porcentaje: liquidacionPct,
      monto: round2(totalConIva - anticipoMonto),
      fechaLimite:
        terms.diasCredito === "contado"
          ? addDays(event, 0)
          : addDays(event, parseInt(terms.diasCredito, 10)),
      pagado: false,
    });
    return items;
  }

  if (terms.esquemaPago === "tres_facturas") {
    const anticipoMonto = round2((totalConIva * anticipoPct) / 100);
    const restante = totalConIva - anticipoMonto;
    const intermedioMonto = round2(restante / 2);
    const liquidacionMonto = round2(totalConIva - anticipoMonto - intermedioMonto);
    const intermedioPct = round2((intermedioMonto / totalConIva) * 100);
    const liquidacionPct = round2((liquidacionMonto / totalConIva) * 100);

    items.push({
      id: `ps-${Date.now()}-1`,
      concepto: `Anticipo (${anticipoPct}%)`,
      porcentaje: anticipoPct,
      monto: anticipoMonto,
      fechaLimite: addDays(now, 5),
      pagado: false,
    });
    items.push({
      id: `ps-${Date.now()}-2`,
      concepto: `Pago intermedio (${intermedioPct}%)`,
      porcentaje: intermedioPct,
      monto: intermedioMonto,
      fechaLimite: addDays(event, -15),
      pagado: false,
    });
    items.push({
      id: `ps-${Date.now()}-3`,
      concepto: `Liquidacion (${liquidacionPct}%)${
        terms.diasCredito !== "contado" ? ` a ${terms.diasCredito} dias` : ""
      }`,
      porcentaje: liquidacionPct,
      monto: liquidacionMonto,
      fechaLimite:
        terms.diasCredito === "contado"
          ? addDays(event, 0)
          : addDays(event, parseInt(terms.diasCredito, 10)),
      pagado: false,
    });

    // If the user asked for more facturas, split the "intermedio" evenly.
    if (terms.numeroFacturas > 3) {
      // Replace the intermedio with N-2 equal installments between anticipo and liquidacion.
      const extraCount = terms.numeroFacturas - 2; // anticipo + liquidacion + extras
      const perPagoMonto = round2(restante / extraCount / 1); // keep liquidacion as last
      const perPagoPct = round2((perPagoMonto / totalConIva) * 100);

      // Remove the placeholder intermedio + liquidacion
      items.splice(1, 2);

      let running = anticipoMonto;
      for (let i = 0; i < extraCount - 1; i++) {
        running += perPagoMonto;
        items.push({
          id: `ps-${Date.now()}-mid-${i}`,
          concepto: `Pago ${i + 2} (${perPagoPct}%)`,
          porcentaje: perPagoPct,
          monto: perPagoMonto,
          fechaLimite: addDays(event, -((extraCount - 1 - i) * 15)),
          pagado: false,
        });
      }
      const finalMonto = round2(totalConIva - running);
      const finalPct = round2((finalMonto / totalConIva) * 100);
      items.push({
        id: `ps-${Date.now()}-final`,
        concepto: `Liquidacion (${finalPct}%)${
          terms.diasCredito !== "contado" ? ` a ${terms.diasCredito} dias` : ""
        }`,
        porcentaje: finalPct,
        monto: finalMonto,
        fechaLimite:
          terms.diasCredito === "contado"
            ? addDays(event, 0)
            : addDays(event, parseInt(terms.diasCredito, 10)),
        pagado: false,
      });
    }

    return items;
  }

  return items;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------

const LS_CONTRACTS_KEY = "pixel_contracts";
const LS_CLIENT_SETTINGS_KEY = "pixel_client_settings";

export function loadStoredContracts(): Contract[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_CONTRACTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Contract[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredContract(contract: Contract): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadStoredContracts();
    const next = [contract, ...existing];
    window.localStorage.setItem(LS_CONTRACTS_KEY, JSON.stringify(next));
  } catch {
    // ignore quota errors
  }
}

export function loadClientSettings(): Record<string, ClientSettings> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_CLIENT_SETTINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, ClientSettings>) : {};
  } catch {
    return {};
  }
}

export function saveClientSettings(settings: ClientSettings): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadClientSettings();
    all[settings.clientName] = settings;
    window.localStorage.setItem(LS_CLIENT_SETTINGS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Contract-number generator
// ---------------------------------------------------------------------------

export function generateContractNumber(): string {
  const year = new Date().getFullYear();
  const stored = loadStoredContracts().length;
  const base = 100 + stored; // start generated contracts at DPS-YYYY-0100 to avoid colliding with seeded mocks
  return `DPS-${year}-${String(base).padStart(4, "0")}`;
}
