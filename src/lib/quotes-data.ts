import { type Product } from "./products-catalog";

export type QuoteStatus = "borrador" | "enviada" | "aceptada" | "rechazada" | "expirada";

export interface QuoteLineItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  days: number;
  unitPrice: number;
  unit: string;
  discountPct: number;
  lineTotal: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  clientName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  vendedor: string;
  projectName: string;
  createdAt: string;
  expiresAt: string;
  status: QuoteStatus;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  notes: string;
  termsPayment: string;
  termsCancellation: string;
  termsTechnical: string;
}

export const VENDEDORES = [
  { id: "pricila", name: "Pricila" },
  { id: "gabriela", name: "Gabriela" },
  { id: "maria", name: "Maria" },
  { id: "samuel", name: "Samuel" },
  { id: "daniel", name: "Daniel" },
];

export const DEFAULT_TERMS = {
  payment: "50% de anticipo para confirmar fecha. Pago restante una semana antes del evento.",
  cancellation: "En caso de cancelacion se retiene el 50% del monto total mas gastos incurridos en produccion de assets y materiales.",
  technical: "Espacio techado con altura minima de 2.5m, conexion electrica 110V dedicada, red WiFi de alta velocidad o enlace dedicado.",
};

function computeLineTotal(item: { quantity: number; days: number; unitPrice: number; discountPct: number; unit: string }): number {
  const base = item.unit === "dia" || item.unit === "hora"
    ? item.unitPrice * item.quantity * item.days
    : item.unitPrice * item.quantity;
  const discount = base * (item.discountPct / 100);
  return base - discount;
}

export const MOCK_QUOTES: Quote[] = [
  {
    id: "q-001",
    quoteNumber: "20260315-094516962",
    clientName: "Agencia Descorche",
    contactName: "Laura Martinez",
    contactEmail: "laura@descorche.mx",
    contactPhone: "+52 55 4123 8890",
    vendedor: "Pricila",
    projectName: "Activacion Corona Sunsets 2026",
    createdAt: "2026-03-15T09:45:00Z",
    expiresAt: "2026-04-14T09:45:00Z",
    status: "enviada",
    lineItems: [
      { id: "li-1", productId: "pb-glambot", productName: "Glambot", category: "Photo Booths", quantity: 1, days: 2, unitPrice: 22600, unit: "dia", discountPct: 0, lineTotal: 45200 },
      { id: "li-2", productId: "pb-neon", productName: "Neon Booth", category: "Photo Booths", quantity: 1, days: 2, unitPrice: 17500, unit: "dia", discountPct: 10, lineTotal: 31500 },
      { id: "li-3", productId: "fb-barra-cafe", productName: "Barra de Cafe Gourmet", category: "Food & Beverage", quantity: 1, days: 2, unitPrice: 22000, unit: "dia", discountPct: 0, lineTotal: 44000 },
      { id: "li-4", productId: "sv-personal", productName: "Personal Operativo", category: "Services", quantity: 4, days: 1, unitPrice: 3500, unit: "persona", discountPct: 0, lineTotal: 14000 },
      { id: "li-5", productId: "sv-montaje", productName: "Montaje y Desmontaje", category: "Services", quantity: 1, days: 1, unitPrice: 5500, unit: "paquete", discountPct: 0, lineTotal: 5500 },
      { id: "li-6", productId: "sv-transporte", productName: "PIXEL Transporte", category: "Services", quantity: 1, days: 1, unitPrice: 4500, unit: "paquete", discountPct: 0, lineTotal: 4500 },
    ],
    subtotal: 144700,
    discountTotal: 3500,
    total: 144700,
    notes: "El cliente requiere branding en todos los equipos con imagen de la campana. Se necesita acceso al venue desde las 8am para montaje.",
    termsPayment: DEFAULT_TERMS.payment,
    termsCancellation: DEFAULT_TERMS.cancellation,
    termsTechnical: DEFAULT_TERMS.technical,
  },
  {
    id: "q-002",
    quoteNumber: "20260318-112034521",
    clientName: "Igency",
    contactName: "Roberto Sanchez",
    contactEmail: "roberto@igency.com",
    contactPhone: "+52 55 7891 2345",
    vendedor: "Gabriela",
    projectName: "Lanzamiento BMW Serie 5",
    createdAt: "2026-03-18T11:20:00Z",
    expiresAt: "2026-04-17T11:20:00Z",
    status: "aceptada",
    lineItems: [
      { id: "li-7", productId: "vr-holograma-xl", productName: "Holograma XL", category: "VR/AR/AI", quantity: 1, days: 1, unitPrice: 45000, unit: "dia", discountPct: 0, lineTotal: 45000 },
      { id: "li-8", productId: "vr-meta-human-dax", productName: "Meta Human Dax", category: "VR/AR/AI", quantity: 1, days: 1, unitPrice: 35000, unit: "dia", discountPct: 5, lineTotal: 33250 },
      { id: "li-9", productId: "st-pantalla-led", productName: "Pantalla LED", category: "Screens & Tech", quantity: 2, days: 1, unitPrice: 18000, unit: "dia", discountPct: 0, lineTotal: 36000 },
      { id: "li-10", productId: "sv-assets", productName: "Desarrollo Assets", category: "Services", quantity: 1, days: 1, unitPrice: 8500, unit: "paquete", discountPct: 0, lineTotal: 8500 },
      { id: "li-11", productId: "sv-personal", productName: "Personal Operativo", category: "Services", quantity: 6, days: 1, unitPrice: 3500, unit: "persona", discountPct: 0, lineTotal: 21000 },
      { id: "li-12", productId: "sv-montaje", productName: "Montaje y Desmontaje", category: "Services", quantity: 1, days: 1, unitPrice: 5500, unit: "paquete", discountPct: 0, lineTotal: 5500 },
    ],
    subtotal: 149250,
    discountTotal: 1750,
    total: 149250,
    notes: "Evento exclusivo en World Trade Center. El holograma debe mostrar el modelo del auto en 3D. Requiere coordinacion con el equipo de produccion de BMW.",
    termsPayment: DEFAULT_TERMS.payment,
    termsCancellation: DEFAULT_TERMS.cancellation,
    termsTechnical: DEFAULT_TERMS.technical,
  },
  {
    id: "q-003",
    quoteNumber: "20260320-153201887",
    clientName: "Grupo Match",
    contactName: "Andrea Lopez",
    contactEmail: "andrea.lopez@grupomatch.mx",
    contactPhone: "+52 55 3456 7890",
    vendedor: "Samuel",
    projectName: "Convencion Bimbo Team Building",
    createdAt: "2026-03-20T15:32:00Z",
    expiresAt: "2026-04-19T15:32:00Z",
    status: "borrador",
    lineItems: [
      { id: "li-13", productId: "ig-batak-pared", productName: "Batak Pared", category: "Interactive Games", quantity: 2, days: 1, unitPrice: 18500, unit: "dia", discountPct: 10, lineTotal: 33300 },
      { id: "li-14", productId: "ig-super-kick", productName: "Super Kick", category: "Interactive Games", quantity: 1, days: 1, unitPrice: 22000, unit: "dia", discountPct: 0, lineTotal: 22000 },
      { id: "li-15", productId: "ig-mega-futbolito", productName: "Mega Futbolito", category: "Interactive Games", quantity: 1, days: 1, unitPrice: 28000, unit: "dia", discountPct: 0, lineTotal: 28000 },
      { id: "li-16", productId: "ig-jump-score", productName: "Jump Score", category: "Interactive Games", quantity: 1, days: 1, unitPrice: 19500, unit: "dia", discountPct: 0, lineTotal: 19500 },
      { id: "li-17", productId: "pb-ipad-digital", productName: "iPad Booth Digital", category: "Photo Booths", quantity: 2, days: 1, unitPrice: 14600, unit: "dia", discountPct: 5, lineTotal: 27740 },
      { id: "li-18", productId: "fb-cotton-candy", productName: "Cotton Candy", category: "Food & Beverage", quantity: 1, days: 1, unitPrice: 14600, unit: "dia", discountPct: 0, lineTotal: 14600 },
      { id: "li-19", productId: "sv-personal", productName: "Personal Operativo", category: "Services", quantity: 8, days: 1, unitPrice: 3500, unit: "persona", discountPct: 0, lineTotal: 28000 },
    ],
    subtotal: 173140,
    discountTotal: 5560,
    total: 173140,
    notes: "Convencion anual de 800 personas. Necesitan zona de team building con actividades competitivas. Considerar paquete de descuento por volumen.",
    termsPayment: DEFAULT_TERMS.payment,
    termsCancellation: DEFAULT_TERMS.cancellation,
    termsTechnical: "Espacio abierto de minimo 200m2, techado, conexion electrica 220V trifasica, acceso para vehiculo de carga.",
  },
  {
    id: "q-004",
    quoteNumber: "20260310-081245330",
    clientName: "Innovacc",
    contactName: "Carlos Fernandez",
    contactEmail: "carlos@innovacc.com",
    contactPhone: "+52 81 2345 6789",
    vendedor: "Maria",
    projectName: "Tech Summit MTY 2026",
    createdAt: "2026-03-10T08:12:00Z",
    expiresAt: "2026-04-09T08:12:00Z",
    status: "rechazada",
    lineItems: [
      { id: "li-20", productId: "vr-beat-saber", productName: "Beat Saber", category: "VR/AR/AI", quantity: 2, days: 3, unitPrice: 22000, unit: "dia", discountPct: 15, lineTotal: 112200 },
      { id: "li-21", productId: "vr-mixta", productName: "VR Mixta", category: "VR/AR/AI", quantity: 1, days: 3, unitPrice: 28000, unit: "dia", discountPct: 10, lineTotal: 75600 },
      { id: "li-22", productId: "st-mesa-interactiva", productName: "Mesa Interactiva", category: "Screens & Tech", quantity: 3, days: 3, unitPrice: 24000, unit: "dia", discountPct: 10, lineTotal: 194400 },
      { id: "li-23", productId: "sv-personal", productName: "Personal Operativo", category: "Services", quantity: 10, days: 1, unitPrice: 3500, unit: "persona", discountPct: 0, lineTotal: 35000 },
      { id: "li-24", productId: "vi-foraneo", productName: "Viaticos Foraneo", category: "Viaticos", quantity: 10, days: 1, unitPrice: 5500, unit: "persona", discountPct: 0, lineTotal: 55000 },
    ],
    subtotal: 472200,
    discountTotal: 61800,
    total: 472200,
    notes: "Evento de 3 dias en Monterrey. Precio resulto fuera de presupuesto del cliente. Posible renegociacion eliminando mesas interactivas.",
    termsPayment: DEFAULT_TERMS.payment,
    termsCancellation: DEFAULT_TERMS.cancellation,
    termsTechnical: DEFAULT_TERMS.technical,
  },
];

export function getQuoteById(id: string): Quote | undefined {
  return MOCK_QUOTES.find((q) => q.id === id);
}

export function getStatusColor(status: QuoteStatus): string {
  switch (status) {
    case "borrador": return "bg-gray-100 text-gray-700";
    case "enviada": return "bg-blue-100 text-blue-700";
    case "aceptada": return "bg-green-100 text-green-700";
    case "rechazada": return "bg-red-100 text-red-700";
    case "expirada": return "bg-orange-100 text-orange-700";
  }
}

export function getStatusLabel(status: QuoteStatus): string {
  switch (status) {
    case "borrador": return "Borrador";
    case "enviada": return "Enviada";
    case "aceptada": return "Aceptada";
    case "rechazada": return "Rechazada";
    case "expirada": return "Expirada";
  }
}

export function generateQuoteNumber(): string {
  const now = new Date();
  const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(now.getMilliseconds(), 3)}`;
}
