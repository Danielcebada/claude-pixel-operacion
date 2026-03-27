// ─── Eventos de Operacion del Google Calendar ───────────────────
// Fuente: contacto@digitalpixel.studio
// Formato: "Cliente | PM _ Producto"
// Cruzado con deals de HubSpot para proyeccion de cash operativo

export interface CalendarEvent {
  id: string;
  summary: string;
  cliente: string;
  pm: string;
  producto: string;
  startDate: string;
  endDate: string;
  dias: number;
  zona: "CDMX" | "Foraneo";
  description?: string;
  // Cruce con HubSpot
  dealAmount: number;
  costoOperativo20: number; // 20% del deal
  viaticosEstimado: number;
  cashNecesario: number;
}

function parseDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}

// Eventos extraidos del Google Calendar + cruzados con HubSpot deals
export const CALENDAR_EVENTS: CalendarEvent[] = [
  // ── Semana 25-29 Marzo ──
  {
    id: "ce1", summary: "Chipichape | Diana _ Varios CANCUN",
    cliente: "Chipichape", pm: "Diana", producto: "Live Streaming, Holograma, Sketch Booth, Tattoo Print, 360, VR, Meta Human, Chipp, Photo AI",
    startDate: "2026-03-24", endDate: "2026-03-30", dias: 6, zona: "Foraneo",
    description: "Activacion: 26 Marzo / AVA RESORT CANCUN",
    dealAmount: 380000, costoOperativo20: 76000, viaticosEstimado: 45000, cashNecesario: 121000,
  },
  {
    id: "ce2", summary: "JOURNEY | Diana _ Sketchbooth",
    cliente: "Journey", pm: "Diana", producto: "Sketch Booth",
    startDate: "2026-03-25", endDate: "2026-03-26", dias: 1, zona: "CDMX",
    dealAmount: 24600, costoOperativo20: 4920, viaticosEstimado: 0, cashNecesario: 4920,
  },
  {
    id: "ce3", summary: "Grupozima | Ivan _ Batak de Piso",
    cliente: "Grupozima", pm: "Ivan", producto: "Batak de Piso",
    startDate: "2026-03-25", endDate: "2026-03-26", dias: 1, zona: "CDMX",
    dealAmount: 15156, costoOperativo20: 3031, viaticosEstimado: 0, cashNecesario: 3031,
  },
  {
    id: "ce4", summary: "JOURNEY | Diana _ Salsa",
    cliente: "Journey", pm: "Diana", producto: "Salsa",
    startDate: "2026-03-25", endDate: "2026-03-26", dias: 1, zona: "CDMX",
    dealAmount: 12000, costoOperativo20: 2400, viaticosEstimado: 0, cashNecesario: 2400,
  },
  {
    id: "ce5", summary: "Igency | Ivan _ Cabina Cerrada con Impresion",
    cliente: "Igency", pm: "Ivan", producto: "Cabina Cerrada con Impresion",
    startDate: "2026-03-27", endDate: "2026-03-29", dias: 2, zona: "CDMX",
    dealAmount: 78900, costoOperativo20: 15780, viaticosEstimado: 0, cashNecesario: 15780,
  },
  {
    id: "ce6", summary: "Evento BONAFONT | Alex _ Varios",
    cliente: "Bonafont (innovacc)", pm: "Alex", producto: "Super Kick, Turbo Soccer, Subsoccer, Mega Futbolito, Caminadora, Photo AI, Juego de Reflejos",
    startDate: "2026-03-27", endDate: "2026-03-28", dias: 1, zona: "CDMX",
    description: "Super kick, Turbo soccer con cancha, Subsoccer, Mega Futbolito, Caminadora Magic Screen, Photo AI, Juego de Reflejos",
    dealAmount: 260880, costoOperativo20: 52176, viaticosEstimado: 0, cashNecesario: 52176,
  },
  {
    id: "ce7", summary: "DM Producciones | Ivan _ Mirror Booth y Football Balance",
    cliente: "DM Producciones", pm: "Ivan", producto: "Mirror Booth, Football Balance",
    startDate: "2026-03-28", endDate: "2026-03-29", dias: 1, zona: "CDMX",
    dealAmount: 109700, costoOperativo20: 21940, viaticosEstimado: 0, cashNecesario: 21940,
  },
  {
    id: "ce8", summary: "Naotravelco | Ivan _ Batak Tubular",
    cliente: "Naotravelco", pm: "Ivan", producto: "Batak Tubular, Fortuna",
    startDate: "2026-03-28", endDate: "2026-03-30", dias: 2, zona: "CDMX",
    dealAmount: 96840, costoOperativo20: 19368, viaticosEstimado: 0, cashNecesario: 19368,
  },
  {
    id: "ce9", summary: "Agencia Descorche | Diana _ Super Kick",
    cliente: "Agencia Descorche", pm: "Diana", producto: "Super Kick",
    startDate: "2026-03-28", endDate: "2026-03-29", dias: 1, zona: "CDMX",
    dealAmount: 23600, costoOperativo20: 4720, viaticosEstimado: 0, cashNecesario: 4720,
  },
  {
    id: "ce10", summary: "Team | Daniel _ Sensor de Velocidad (Proyectil)",
    cliente: "Team", pm: "Daniel", producto: "Sensor de Velocidad",
    startDate: "2026-03-28", endDate: "2026-03-30", dias: 2, zona: "CDMX",
    description: "Activacion: 28-29 CDMX Perisur",
    dealAmount: 45000, costoOperativo20: 9000, viaticosEstimado: 0, cashNecesario: 9000,
  },

  // ── Semana 30 Mar - 5 Abr ──
  {
    id: "ce11", summary: "Motorola | Desarrollo _ Juego para Liverpool - Web",
    cliente: "Motorola", pm: "Desarrollo", producto: "Juego Web Liverpool",
    startDate: "2026-04-01", endDate: "2026-04-02", dias: 1, zona: "CDMX",
    dealAmount: 165000, costoOperativo20: 33000, viaticosEstimado: 0, cashNecesario: 33000,
  },

  // ── Semana 7-12 Abr ──
  {
    id: "ce12", summary: "Tuspartners | Ivan _ FEMSA Meta Human",
    cliente: "FEMSA (tuspartners)", pm: "Ivan", producto: "Meta Human Atlas/Bit",
    startDate: "2026-04-08", endDate: "2026-04-09", dias: 1, zona: "CDMX",
    dealAmount: 27660, costoOperativo20: 5532, viaticosEstimado: 0, cashNecesario: 5532,
  },
  {
    id: "ce13", summary: "TKL | Harol _ Print sobre Bebidas",
    cliente: "TKL", pm: "Harol", producto: "Coffee Print (4 maquinas)",
    startDate: "2026-04-08", endDate: "2026-04-10", dias: 2, zona: "CDMX",
    description: "4 maquinas en simultaneo por dia, 2 dias de servicio",
    dealAmount: 35000, costoOperativo20: 7000, viaticosEstimado: 0, cashNecesario: 7000,
  },
  {
    id: "ce14", summary: "Tolka | Ivan _ Meta Humans Dax/Eddison",
    cliente: "Tolka Estudio", pm: "Ivan", producto: "Meta Humans Dax/Eddison",
    startDate: "2026-04-10", endDate: "2026-04-11", dias: 1, zona: "CDMX",
    dealAmount: 30200, costoOperativo20: 6040, viaticosEstimado: 0, cashNecesario: 6040,
  },

  // ── Semana 13-19 Abr ──
  {
    id: "ce15", summary: "Zeb | Ivan _ Desarrollo de VR + 10 VR",
    cliente: "Zeb.mx", pm: "Ivan", producto: "Desarrollo VR (10 lentes)",
    startDate: "2026-04-13", endDate: "2026-04-15", dias: 2, zona: "CDMX",
    description: "Activacion de 2 dias",
    dealAmount: 218820, costoOperativo20: 43764, viaticosEstimado: 0, cashNecesario: 43764,
  },
  {
    id: "ce16", summary: "Smile Pill | Ivan _ Garrita",
    cliente: "Smile Pill", pm: "Ivan", producto: "Pixel Claw (Garrita), Matcha",
    startDate: "2026-04-14", endDate: "2026-04-15", dias: 1, zona: "CDMX",
    dealAmount: 23100, costoOperativo20: 4620, viaticosEstimado: 0, cashNecesario: 4620,
  },
  {
    id: "ce17", summary: "Orange DCX | Ivan _ Credenciales IA",
    cliente: "Orange DCX", pm: "Ivan", producto: "Credenciales AI",
    startDate: "2026-04-15", endDate: "2026-04-16", dias: 1, zona: "CDMX",
    dealAmount: 28000, costoOperativo20: 5600, viaticosEstimado: 0, cashNecesario: 5600,
  },
  {
    id: "ce18", summary: "Artell | Ivan _ Desarrollo de VR con 4",
    cliente: "Artell", pm: "Ivan", producto: "Desarrollo VR (4 lentes)",
    startDate: "2026-04-15", endDate: "2026-04-16", dias: 1, zona: "CDMX",
    dealAmount: 45000, costoOperativo20: 9000, viaticosEstimado: 0, cashNecesario: 9000,
  },
  {
    id: "ce19", summary: "Brocoli | Diana _ Juego de Reflejos",
    cliente: "Brocoli", pm: "Diana", producto: "Juego de Reflejos",
    startDate: "2026-04-15", endDate: "2026-04-18", dias: 3, zona: "Foraneo",
    description: "Evento en Jalisco",
    dealAmount: 44040, costoOperativo20: 8808, viaticosEstimado: 18000, cashNecesario: 26808,
  },

  // ── Semana 20-26 Abr ──
  {
    id: "ce20", summary: "Grupo Match | Diana _ Ipadbooth 3 dias",
    cliente: "Grupo Match", pm: "Diana", producto: "iPad Booth",
    startDate: "2026-04-20", endDate: "2026-04-23", dias: 3, zona: "CDMX",
    description: "Concierto The Weeknd / Estadio GNP Seguros",
    dealAmount: 43270, costoOperativo20: 8654, viaticosEstimado: 0, cashNecesario: 8654,
  },
  {
    id: "ce21", summary: "Grupo Match | Ivan _ Ipadbooth 4 dias",
    cliente: "Grupo Match", pm: "Ivan", producto: "iPad Booth",
    startDate: "2026-04-23", endDate: "2026-04-27", dias: 4, zona: "CDMX",
    description: "Centro Banamex",
    dealAmount: 62644, costoOperativo20: 12529, viaticosEstimado: 0, cashNecesario: 12529,
  },
  {
    id: "ce22", summary: "Circulo | Ivan _ Bubblehead CDMX",
    cliente: "Circulo", pm: "Ivan", producto: "Bubblehead",
    startDate: "2026-04-25", endDate: "2026-04-26", dias: 1, zona: "CDMX",
    dealAmount: 65160, costoOperativo20: 13032, viaticosEstimado: 0, cashNecesario: 13032,
  },
  {
    id: "ce23", summary: "Circulo | Ivan _ Bubblehead GDL y MTY",
    cliente: "Circulo", pm: "Ivan", producto: "Bubblehead",
    startDate: "2026-04-26", endDate: "2026-05-01", dias: 5, zona: "Foraneo",
    description: "27 Abril en Guadalajara, 29 Abril en Monterrey. Cliente se lleva el producto.",
    dealAmount: 130320, costoOperativo20: 26064, viaticosEstimado: 28000, cashNecesario: 54064,
  },
];

// ─── Weekly Grouping ─────────────────────────────────
export interface WeekProjection {
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  events: CalendarEvent[];
  totalDealAmount: number;
  totalCostoOperativo: number;
  totalViaticos: number;
  totalCashNecesario: number;
  eventCount: number;
  foraneoCount: number;
}

export function getWeeklyProjection(): WeekProjection[] {
  const weeks = [
    { label: "Sem 25-29 Mar", start: "2026-03-24", end: "2026-03-30" },
    { label: "Sem 30 Mar - 5 Abr", start: "2026-03-30", end: "2026-04-06" },
    { label: "Sem 7-12 Abr", start: "2026-04-06", end: "2026-04-13" },
    { label: "Sem 13-19 Abr", start: "2026-04-13", end: "2026-04-20" },
    { label: "Sem 20-26 Abr", start: "2026-04-20", end: "2026-04-27" },
    { label: "Sem 27-30 Abr", start: "2026-04-27", end: "2026-05-01" },
  ];

  return weeks.map(w => {
    const events = CALENDAR_EVENTS.filter(e => e.startDate >= w.start && e.startDate < w.end);
    return {
      weekLabel: w.label,
      weekStart: w.start,
      weekEnd: w.end,
      events,
      totalDealAmount: events.reduce((s, e) => s + e.dealAmount, 0),
      totalCostoOperativo: events.reduce((s, e) => s + e.costoOperativo20, 0),
      totalViaticos: events.reduce((s, e) => s + e.viaticosEstimado, 0),
      totalCashNecesario: events.reduce((s, e) => s + e.cashNecesario, 0),
      eventCount: events.length,
      foraneoCount: events.filter(e => e.zona === "Foraneo").length,
    };
  }).filter(w => w.eventCount > 0);
}
