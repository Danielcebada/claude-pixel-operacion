import { Project, ProjectFinancials, User, computeDiasParaEvento } from "./types";

export const MOCK_USERS: User[] = [
  { id: "u1", email: "daniel@digitalpixel.studio", full_name: "Daniel Cebada", role: "admin", is_active: true },
  { id: "u2", email: "pris@digitalpixel.studio", full_name: "Pricila Dominguez", role: "vendedor", is_active: true },
  { id: "u3", email: "gaby@digitalpixel.studio", full_name: "Gabriela Gutierrez", role: "vendedor", is_active: true },
  { id: "u4", email: "mar@digitalpixel.studio", full_name: "Maria Gaytan", role: "vendedor", is_active: true },
  { id: "u5", email: "samuel@digitalpixel.studio", full_name: "Samuel Hernandez", role: "vendedor", is_active: false },
  { id: "u6", email: "joyce@digitalpixel.studio", full_name: "Joyce Perez", role: "pm", is_active: true },
  { id: "u7", email: "oscar@digitalpixel.studio", full_name: "Oscar Andrade", role: "pm", is_active: true },
  { id: "u8", email: "alvaro@pixelplay.mx", full_name: "Alvaro Solis", role: "pm", is_active: true },
  { id: "u9", email: "joel@digitalpixel.studio", full_name: "Joel Rivera", role: "pm", is_active: true },
  { id: "u10", email: "lalo@digitalpixel.studio", full_name: "Eduardo Martinez", role: "pm", is_active: true },
  { id: "u11", email: "marlene@digitalpixel.studio", full_name: "Marlene Rosas", role: "finance", is_active: true },
  { id: "u12", email: "diana@digitalpixel.studio", full_name: "Diana Lopez", role: "pm", is_active: true },
  { id: "u13", email: "ivan@digitalpixel.studio", full_name: "Ivan Torres", role: "pm", is_active: true },
  { id: "u14", email: "harol@digitalpixel.studio", full_name: "Harol Sanchez", role: "vendedor", is_active: true },
  { id: "u15", email: "erick@digitalpixel.studio", full_name: "Erick Ramirez", role: "vendedor", is_active: true },
];

// ─── VENDEDORES DE HUBSPOT ──────────────
const OWNER_TO_USER: Record<string, { id: string; name: string }> = {
  "26395721": { id: "u2", name: "Pricila Dominguez" },
  "618845046": { id: "u4", name: "Maria Gaytan" },
  "414692018": { id: "u3", name: "Gabriela Gutierrez" },
  "80956812": { id: "u15", name: "Erick Ramirez" },
  "26405238": { id: "u1", name: "Daniel Cebada" },
  "88208161": { id: "u14", name: "Harol Sanchez" },
};

// PMs asignados por proyecto (simulando lo que vendria de Odoo)
const PM_POOL = [
  { id: "u6", name: "Joyce Perez" },
  { id: "u7", name: "Oscar Andrade" },
  { id: "u8", name: "Alvaro Solis" },
  { id: "u9", name: "Joel Rivera" },
  { id: "u10", name: "Eduardo Martinez" },
  { id: "u12", name: "Diana Lopez" },
  { id: "u13", name: "Ivan Torres" },
];

function extractProduct(dealName: string): string {
  const lower = dealName.toLowerCase();
  if (lower.includes("photobooth") || lower.includes("photo booth") || lower.includes("booth con impresion")) return "Photobooth";
  if (lower.includes("ipad booth") || lower.includes("ipadbooth")) return "iPad Booth";
  if (lower.includes("mirror booth") || lower.includes("mirror")) return "Mirror Booth";
  if (lower.includes("coffee print") || lower.includes("barra de café") || lower.includes("barra de cafe") || lower.includes("barra de matcha") || lower.includes("cafe gourmet")) return "Coffee Print";
  if (lower.includes("sketchbooth") || lower.includes("sketch booth") || lower.includes("robot sketch")) return "Sketch Booth";
  if (lower.includes("360")) return "360 Booth";
  if (lower.includes("green screen")) return "Green Screen";
  if (lower.includes("glambot") || lower.includes("glam bot")) return "Glambot";
  if (lower.includes("bubblehead") || lower.includes("cabezones")) return "Bubblehead AI";
  if (lower.includes("batak")) return "Batak";
  if (lower.includes("vr") || lower.includes("beat saber")) return "VR Experience";
  if (lower.includes("meta human")) return "Meta Human";
  if (lower.includes("holograma")) return "Holograma";
  if (lower.includes("arcade") || lower.includes("maquinit")) return "Arcade";
  if (lower.includes("mesa interactiva")) return "Mesa Interactiva";
  if (lower.includes("riel booth")) return "Riel Booth";
  if (lower.includes("juego interactivo") || lower.includes("juego en pantalla")) return "Juego Interactivo";
  if (lower.includes("laser") || lower.includes("láser")) return "Laser Machine";
  if (lower.includes("sticker") || lower.includes("plancha")) return "Sticker Station";
  if (lower.includes("cabina cerrada")) return "Cabina Cerrada";
  if (lower.includes("surface") || lower.includes("sensores")) return "Superficie Sensores";
  if (lower.includes("kit de actividad")) return "Kit Actividad";
  if (lower.includes("garrita") || lower.includes("claw")) return "Pixel Claw";
  if (lower.includes("filtro ia") || lower.includes("ai") || lower.includes("sistema de ai")) return "Photo AI";
  if (lower.includes("multiball")) return "Multiball";
  if (lower.includes("credencial")) return "Credenciales AI";
  if (lower.includes("super kick") || lower.includes("soccer") || lower.includes("futbolito")) return "Sports Games";
  if (lower.includes("tatto print") || lower.includes("tattoo")) return "Tatto Print";
  if (lower.includes("fortuna") || lower.includes("ruleta")) return "Rueda de la Fortuna";
  if (lower.includes("sense step") || lower.includes("sensestep")) return "Sense Step";
  if (lower.includes("pulse") || lower.includes("speed test") || lower.includes("reflejos")) return "Pulse Challenge";
  if (lower.includes("robot")) return "Robots";
  if (lower.includes("totem")) return "Totem Interactivo";
  return "Experiencia Custom";
}

function detectZone(dealName: string): "CDMX" | "Foraneo" {
  const lower = dealName.toLowerCase();
  if (lower.includes("gdl") || lower.includes("guadalajara") || lower.includes("mty") || lower.includes("monterrey")
    || lower.includes("cancun") || lower.includes("cun") || lower.includes("acapulco") || lower.includes("cuernavaca")
    || lower.includes("jalisco") || lower.includes("forane") || lower.includes("leon") || lower.includes("toluca")
    || lower.includes("chihuahua") || lower.includes("merida") || lower.includes("houston") || lower.includes("puebla")
    || lower.includes("san miguel") || lower.includes("atizapan") || lower.includes("qro") || lower.includes("queretaro")
    || lower.includes("gto")) return "Foraneo";
  return "CDMX";
}

// ─── 5 EXAMPLE PROJECTS WITH COMPLETE FINANCIAL DATA ─────────────
// These simulate projects where the PM already filled in all the real costs.
// Key: HubSpot deal ID -> complete financials
interface ExampleFinancials {
  vendedor_id: string;
  vendedor_name: string;
  pm_id: string;
  pm_name: string;
  status: "operado" | "en_operacion" | "presupuesto_confirmado";
  payment_status: "pagado_100" | "parcial" | "pendiente";
  financials: Omit<ProjectFinancials, "id" | "project_id">;
  // Payment gate
  anticipo_requerido: number;
  anticipo_pagado: boolean;
  fecha_limite_pago: string;
}

const EXAMPLE_PROJECTS: Record<string, ExampleFinancials> = {
  // 1. innovacc.com.mx - Super kick, Turbo soccer, etc CDMX
  "58136130890": {
    vendedor_id: "u4", vendedor_name: "Maria Gaytan",
    pm_id: "u12", pm_name: "Diana Lopez",
    status: "operado", payment_status: "parcial",
    anticipo_requerido: 130440, anticipo_pagado: true, fecha_limite_pago: "2026-03-21",
    financials: {
      venta_presupuesto: 260880, venta_real: 260880,
      costos_presupuesto: 35000, costos_real: 32500,
      gasolina_presupuesto: 1200, gasolina_real: 1450,
      internet_presupuesto: 500, internet_real: 500,
      operacion_presupuesto: 8000, operacion_real: 7200,
      instalacion_presupuesto: 3500, instalacion_real: 4100,
      ubers_presupuesto: 1800, ubers_real: 2300,
      extras_presupuesto: 500, extras_real: 800,
      viaticos_venta: 0, viaticos_gasto: 0, viaticos_uber: 0,
    },
  },
  // 2. Chipichape - Cancun
  "51831980852": {
    vendedor_id: "u15", vendedor_name: "Erick Ramirez",
    pm_id: "u13", pm_name: "Ivan Torres",
    status: "operado", payment_status: "pagado_100",
    anticipo_requerido: 197738, anticipo_pagado: true, fecha_limite_pago: "2026-03-21",
    financials: {
      venta_presupuesto: 395476, venta_real: 395476,
      costos_presupuesto: 52000, costos_real: 48700,
      gasolina_presupuesto: 2500, gasolina_real: 3100,
      internet_presupuesto: 1200, internet_real: 1200,
      operacion_presupuesto: 15000, operacion_real: 14200,
      instalacion_presupuesto: 5000, instalacion_real: 5800,
      ubers_presupuesto: 3000, ubers_real: 4500,
      extras_presupuesto: 2000, extras_real: 1500,
      viaticos_venta: 45000, viaticos_gasto: 38500, viaticos_uber: 4200,
    },
  },
  // 3. DM Producciones - Mirror Booth + Football Balance CDMX — BLOCKED
  "58025430424": {
    vendedor_id: "u2", vendedor_name: "Pricila Dominguez",
    pm_id: "u6", pm_name: "Joyce Perez",
    status: "operado", payment_status: "pendiente",
    anticipo_requerido: 54850, anticipo_pagado: false, fecha_limite_pago: "2026-03-23",
    financials: {
      venta_presupuesto: 109700, venta_real: 109700,
      costos_presupuesto: 14000, costos_real: 13200,
      gasolina_presupuesto: 800, gasolina_real: 750,
      internet_presupuesto: 400, internet_real: 400,
      operacion_presupuesto: 4500, operacion_real: 4800,
      instalacion_presupuesto: 2000, instalacion_real: 1900,
      ubers_presupuesto: 1000, ubers_real: 1200,
      extras_presupuesto: 300, extras_real: 0,
      viaticos_venta: 0, viaticos_gasto: 0, viaticos_uber: 0,
    },
  },
  // 4. Jogo Bonito 7 marzo
  "57553442739": {
    vendedor_id: "u1", vendedor_name: "Daniel Cebada",
    pm_id: "u7", pm_name: "Oscar Andrade",
    status: "operado", payment_status: "parcial",
    anticipo_requerido: 186915, anticipo_pagado: true, fecha_limite_pago: "2026-03-02",
    financials: {
      venta_presupuesto: 373830, venta_real: 373830,
      costos_presupuesto: 45000, costos_real: 42000,
      gasolina_presupuesto: 3000, gasolina_real: 2800,
      internet_presupuesto: 1500, internet_real: 1500,
      operacion_presupuesto: 12000, operacion_real: 11500,
      instalacion_presupuesto: 4000, instalacion_real: 3800,
      ubers_presupuesto: 2500, ubers_real: 2200,
      extras_presupuesto: 1000, extras_real: 600,
      viaticos_venta: 0, viaticos_gasto: 0, viaticos_uber: 0,
    },
  },
  // 5. Motorola - Juego Web Liverpool — BLOCKED
  "56136046130": {
    vendedor_id: "u3", vendedor_name: "Gabriela Gutierrez",
    pm_id: "u8", pm_name: "Alvaro Solis",
    status: "presupuesto_confirmado", payment_status: "pendiente",
    anticipo_requerido: 82500, anticipo_pagado: false, fecha_limite_pago: "2026-03-27",
    financials: {
      venta_presupuesto: 165000, venta_real: 0,
      costos_presupuesto: 22000, costos_real: 0,
      gasolina_presupuesto: 1000, gasolina_real: 0,
      internet_presupuesto: 500, internet_real: 0,
      operacion_presupuesto: 6000, operacion_real: 0,
      instalacion_presupuesto: 2500, instalacion_real: 0,
      ubers_presupuesto: 1200, ubers_real: 0,
      extras_presupuesto: 500, extras_real: 0,
      viaticos_venta: 0, viaticos_gasto: 0, viaticos_uber: 0,
    },
  },
};

// For non-example projects: only venta_presupuesto = deal amount, everything else = 0
function generateEmptyFinancials(dealId: string, amount: number): ProjectFinancials {
  return {
    id: `f-${dealId}`,
    project_id: `p-${dealId}`,
    venta_presupuesto: amount,
    venta_real: 0,
    costos_presupuesto: 0, costos_real: 0,
    gasolina_presupuesto: 0, gasolina_real: 0,
    internet_presupuesto: 0, internet_real: 0,
    operacion_presupuesto: 0, operacion_real: 0,
    instalacion_presupuesto: 0, instalacion_real: 0,
    ubers_presupuesto: 0, ubers_real: 0,
    extras_presupuesto: 0, extras_real: 0,
    viaticos_venta: 0, viaticos_gasto: 0, viaticos_uber: 0,
  };
}

// ─── DEALS REALES DE HUBSPOT Q1 2026 (Enero + Febrero + Marzo) ────────
interface HubSpotDeal {
  id: string;
  dealname: string;
  amount: number;
  closedate: string;
  hubspot_owner_id: string;
}

const HUBSPOT_DEALS_Q1_2026: HubSpotDeal[] = [
  // ═══ ENERO 2026 (35 deals) ═══
  { id: "55035067540", dealname: "CHECKLIST Event agency - Cabina de gritos", amount: 68900, closedate: "2026-01-30", hubspot_owner_id: "618845046" },
  { id: "55031262392", dealname: "GRUPO INMOBILIARIO ALHEL - Batak Tubular, Magic Sensor, Jump Score y Super Kick", amount: 187380, closedate: "2026-01-30", hubspot_owner_id: "414692018" },
  { id: "54964289030", dealname: "pixelplay.mx - VENTA JOYCE 2.0", amount: 17160, closedate: "2026-01-28", hubspot_owner_id: "618845046" },
  { id: "49594530367", dealname: "Guanajuato Gobierno del Estado - Dibujo IA, Credencial IA, Graffiti IA | Leon", amount: 154700, closedate: "2026-01-28", hubspot_owner_id: "26395721" },
  { id: "53695373599", dealname: "Changan Perinorte - Juego de reflejos", amount: 25300, closedate: "2026-01-28", hubspot_owner_id: "80956812" },
  { id: "54943446831", dealname: "pixelplay.mx - venta joyce", amount: 15400, closedate: "2026-01-28", hubspot_owner_id: "618845046" },
  { id: "54403808941", dealname: "Totems Senado", amount: 36000, closedate: "2026-01-27", hubspot_owner_id: "26405238" },
  { id: "54616298526", dealname: "Keep In Touch - Ipad Booth con Impresion | CDMX", amount: 21490, closedate: "2026-01-27", hubspot_owner_id: "26395721" },
  { id: "53696613743", dealname: "Universidad Humanitas - Atlas o Bit | CDMX", amount: 25780, closedate: "2026-01-27", hubspot_owner_id: "414692018" },
  { id: "53696720789", dealname: "Meetings Factory - Sketch booth | Monterrey", amount: 61520, closedate: "2026-01-26", hubspot_owner_id: "80956812" },
  { id: "53444030065", dealname: "TRENDSETERA - Glambot | Puebla", amount: 43400, closedate: "2026-01-26", hubspot_owner_id: "414692018" },
  { id: "54421290654", dealname: "Sketch 29 de enero", amount: 25000, closedate: "2026-01-23", hubspot_owner_id: "26405238" },
  { id: "51673897642", dealname: "Morbido group - Meta Human Dax o Edison | CDMX", amount: 34220, closedate: "2026-01-22", hubspot_owner_id: "80956812" },
  { id: "52218488612", dealname: "Sidetrack - Totem interactivo y holograma 11 dias | Trophy Tour", amount: 464000, closedate: "2026-01-18", hubspot_owner_id: "618845046" },
  { id: "53266875011", dealname: "iEvents - Cotton candy | CDMX", amount: 22560, closedate: "2026-01-15", hubspot_owner_id: "618845046" },
  { id: "53886914351", dealname: "iEvents - Mirror booth fintech | CDMX", amount: 19560, closedate: "2026-01-15", hubspot_owner_id: "618845046" },
  { id: "53887217996", dealname: "Keep In Touch - Video 360 | CDMX", amount: 18000, closedate: "2026-01-15", hubspot_owner_id: "414692018" },
  { id: "51829970739", dealname: "Montagge - Sketch booth 3 dias | Guadalajara", amount: 97800, closedate: "2026-01-14", hubspot_owner_id: "80956812" },
  { id: "53822019131", dealname: "Epik Events - Simulador Snowboarding | CDMX", amount: 36600, closedate: "2026-01-14", hubspot_owner_id: "26395721" },
  { id: "53451545648", dealname: "Fase2 SKANDIA - Meta human Atlas o Bit Y Chipp | Papalote", amount: 42360, closedate: "2026-01-14", hubspot_owner_id: "80956812" },
  { id: "53466542476", dealname: "Raudal Consultoria NOMAD - Sub soccer | CDMX", amount: 23940, closedate: "2026-01-14", hubspot_owner_id: "80956812" },
  { id: "53500299667", dealname: "Mankuerna - Batak tubular | CDMX", amount: 18600, closedate: "2026-01-12", hubspot_owner_id: "618845046" },
  { id: "53550547791", dealname: "Privado - Photobooth con impresiones | CDMX", amount: 13910, closedate: "2026-01-12", hubspot_owner_id: "414692018" },
  { id: "53393785012", dealname: "Keep In Touch - Ipad Booth con Impresion | CDMX", amount: 21490, closedate: "2026-01-09", hubspot_owner_id: "414692018" },
  { id: "53351477056", dealname: "sivale.com.mx - Credenciales AI | CDMX", amount: 50000, closedate: "2026-01-09", hubspot_owner_id: "414692018" },
  { id: "53500413238", dealname: "Mattel - Season Bookings 2026 | CDMX", amount: 353000, closedate: "2026-01-09", hubspot_owner_id: "26405238" },
  { id: "53451102885", dealname: "Privado - Totem interactivo | CDMX", amount: 22600, closedate: "2026-01-08", hubspot_owner_id: "618845046" },
  { id: "53393722242", dealname: "colectivohype.com - Ipad Booth con impresion | CDMX", amount: 14400, closedate: "2026-01-07", hubspot_owner_id: "26395721" },
  { id: "53265166947", dealname: "cheetahds.co - Ipad Booth + Garrita | CDMX", amount: 16900, closedate: "2026-01-06", hubspot_owner_id: "414692018" },
  { id: "51084033329", dealname: "Netflix - Impresoras de tarjetas", amount: 37020, closedate: "2026-01-05", hubspot_owner_id: "26405238" },
  { id: "51790294694", dealname: "ACHE - Pixel Claw (Garrita) 2 dias | CDMX", amount: 43720, closedate: "2026-01-05", hubspot_owner_id: "26395721" },
  { id: "52994207848", dealname: "iEvents - VR atrapa objetos | CDMX", amount: 29656, closedate: "2026-01-05", hubspot_owner_id: "618845046" },
  { id: "53265127500", dealname: "BACKYARD WeMake - Mirrorbooth / Meta Human | CDMX", amount: 1800, closedate: "2026-01-05", hubspot_owner_id: "618845046" },
  { id: "51829999523", dealname: "Leaper360 - Walk screen | CDMX", amount: 38380, closedate: "2026-01-05", hubspot_owner_id: "618845046" },
  { id: "51016100768", dealname: "heybigsur.com - Cabina Cerrada con Ipad Booth | CDMX", amount: 38400, closedate: "2026-01-01", hubspot_owner_id: "26395721" },

  // ═══ FEBRERO 2026 (50 deals) ═══
  { id: "57177745224", dealname: "360media - Glambot | CDMX", amount: 41560, closedate: "2026-02-27", hubspot_owner_id: "618845046" },
  { id: "55639793587", dealname: "Privado - 2 totems a renta | CDMX", amount: 19788, closedate: "2026-02-27", hubspot_owner_id: "618845046" },
  { id: "57140982090", dealname: "colectivohype.com - Superkick y Atrapa balones", amount: 444300, closedate: "2026-02-26", hubspot_owner_id: "26395721" },
  { id: "56214591887", dealname: "Privado - 1 dia de servicio | Mty", amount: 16000, closedate: "2026-02-26", hubspot_owner_id: "618845046" },
  { id: "57021777268", dealname: "iEvents - Esfera LED | CDMX", amount: 7500, closedate: "2026-02-26", hubspot_owner_id: "618845046" },
  { id: "57021716382", dealname: "playergroupmx.com - Quiz interactivo 2 dias | CDMX", amount: 70600, closedate: "2026-02-26", hubspot_owner_id: "26395721" },
  { id: "56935804689", dealname: "Tres60o Estrategia - Juego Interactivo Personalizado | CDMX", amount: 88820, closedate: "2026-02-25", hubspot_owner_id: "414692018" },
  { id: "56889340996", dealname: "Fase2 - Barra Refresh 400 personas 2 dias | Campo Marte", amount: 102080, closedate: "2026-02-25", hubspot_owner_id: "80956812" },
  { id: "55827633178", dealname: "fbworkers.com - Cabina Cerrada con Impresiones | CDMX", amount: 39560, closedate: "2026-02-24", hubspot_owner_id: "414692018" },
  { id: "56611822253", dealname: "Live Agency - Totem Slim y Juego interactivo 3 dias | CDMX", amount: 114369, closedate: "2026-02-24", hubspot_owner_id: "26395721" },
  { id: "56896658182", dealname: "Federacion Mexicana de Futbol - Femenil 2026", amount: 1660500, closedate: "2026-02-24", hubspot_owner_id: "26405238" },
  { id: "46638039052", dealname: "Software Logicia", amount: 12000, closedate: "2026-02-23", hubspot_owner_id: "26405238" },
  { id: "56706724786", dealname: "lettuce.mx - Multicam 180 2 dias | CDMX", amount: 90320, closedate: "2026-02-20", hubspot_owner_id: "618845046" },
  { id: "56443262097", dealname: "Orange Digital CX", amount: 36130, closedate: "2026-02-19", hubspot_owner_id: "88208161" },
  { id: "56443073201", dealname: "Vinter - Bicicleta digital 2 dias | CDMX", amount: 87360, closedate: "2026-02-19", hubspot_owner_id: "26395721" },
  { id: "56175396645", dealname: "Plesk - Sketch booth y Pixel Claw | Leon", amount: 83080, closedate: "2026-02-19", hubspot_owner_id: "80956812" },
  { id: "56135953331", dealname: "DOSHA - Simulador de camiones 3 dias", amount: 79300, closedate: "2026-02-19", hubspot_owner_id: "26405238" },
  { id: "56549455262", dealname: "kaktus.mx - Super Kick y Sub Soccer | CDMX", amount: 36600, closedate: "2026-02-18", hubspot_owner_id: "414692018" },
  { id: "56611002882", dealname: "FollowmeHealthcare - Batak Tubular | CDMX", amount: 1800, closedate: "2026-02-18", hubspot_owner_id: "26395721" },
  { id: "56549339190", dealname: "Habitant Productions - Barra de Cafe 50 personas | CDMX", amount: 32700, closedate: "2026-02-18", hubspot_owner_id: "26395721" },
  { id: "55624234055", dealname: "VR", amount: 105000, closedate: "2026-02-18", hubspot_owner_id: "26405238" },
  { id: "56443323795", dealname: "Mankuerna - Batak Tubular | CDMX", amount: 18600, closedate: "2026-02-17", hubspot_owner_id: "26395721" },
  { id: "56127406885", dealname: "NEXTYA - Superficie sensores, VR, Sketch booth | Puebla", amount: 51200, closedate: "2026-02-17", hubspot_owner_id: "80956812" },
  { id: "55978799988", dealname: "Agencia Descorche - Super Kick | CDMX", amount: 25100, closedate: "2026-02-17", hubspot_owner_id: "414692018" },
  { id: "54956813446", dealname: "Ninja - Glambot | 27 febrero", amount: 39980, closedate: "2026-02-17", hubspot_owner_id: "26405238" },
  { id: "54421290858", dealname: "Wolfxp - Esferas LED, Medidor Fuerza, Multiball, Futbolito VR | CDMX", amount: 193080, closedate: "2026-02-17", hubspot_owner_id: "414692018" },
  { id: "56549265795", dealname: "Modulos AI - Tresetera", amount: 55000, closedate: "2026-02-17", hubspot_owner_id: "26405238" },
  { id: "53696364304", dealname: "TKL - Coffee Print 370 personas y Print sobre bebidas 2 dias", amount: 183160, closedate: "2026-02-12", hubspot_owner_id: "26395721" },
  { id: "55389473585", dealname: "DM Producciones - Batak Tubular, Super kick y Sub soccer | QRO", amount: 30600, closedate: "2026-02-12", hubspot_owner_id: "26395721" },
  { id: "56122058800", dealname: "iEvents - Totem interactivo | CDMX", amount: 32400, closedate: "2026-02-12", hubspot_owner_id: "618845046" },
  { id: "55031259217", dealname: "3.1416r.com - Writing art y Photo AR | CDMX", amount: 59260, closedate: "2026-02-11", hubspot_owner_id: "414692018" },
  { id: "54396664704", dealname: "xy.inc - Meta Human, Photo AI, Holograma | San Miguel Allende", amount: 101920, closedate: "2026-02-10", hubspot_owner_id: "618845046" },
  { id: "55827760003", dealname: "Team - Papalote museo del nino (batak, sensor velocidad, totem)", amount: 1652000, closedate: "2026-02-10", hubspot_owner_id: "618845046" },
  { id: "55881972246", dealname: "Team - Sensor de velocidad GDL/MTY/CDMX 6 dias", amount: 306000, closedate: "2026-02-10", hubspot_owner_id: "618845046" },
  { id: "51831980852", dealname: "Chipichape - Sketch booth, Meta human, Holograma XL | Cancun", amount: 395476, closedate: "2026-02-10", hubspot_owner_id: "80956812" },
  { id: "55117177962", dealname: "Plot - Claw Machine | CDMX", amount: 21600, closedate: "2026-02-09", hubspot_owner_id: "618845046" },
  { id: "55682498680", dealname: "conqr - Cabina Cerrada con Ipad Booth 2 dias | CDMX", amount: 178800, closedate: "2026-02-06", hubspot_owner_id: "26395721" },
  { id: "54615865642", dealname: "Connector - Photo booth 2 dias | Estadio GNP", amount: 38820, closedate: "2026-02-06", hubspot_owner_id: "80956812" },
  { id: "55663278621", dealname: "Tanque Group - Activaciones BTL 70 fechas", amount: 420000, closedate: "2026-02-06", hubspot_owner_id: "26395721" },
  { id: "55478523259", dealname: "DSLR", amount: 19034, closedate: "2026-02-06", hubspot_owner_id: "26405238" },
  { id: "55663276613", dealname: "dalecandela.mx - Netflix Ipad booth", amount: 20580, closedate: "2026-02-06", hubspot_owner_id: "26405238" },
  { id: "54609992575", dealname: "Venta Sketch", amount: 152000, closedate: "2026-02-06", hubspot_owner_id: "26405238" },
  { id: "55478368037", dealname: "globalskin - Meta Human | CDMX", amount: 26160, closedate: "2026-02-05", hubspot_owner_id: "618845046" },
  { id: "55478339204", dealname: "Privado - Totem, Batak, Fortuna | CDMX", amount: 37940, closedate: "2026-02-05", hubspot_owner_id: "618845046" },
  { id: "55475469911", dealname: "helloagency.mx - Magic Mirror | CDMX", amount: 22600, closedate: "2026-02-05", hubspot_owner_id: "26395721" },
  { id: "55586037806", dealname: "momentos.com.mx - Mirrorbooth | CDMX", amount: 21560, closedate: "2026-02-05", hubspot_owner_id: "618845046" },
  { id: "54128050854", dealname: "Foto y poster", amount: 175440, closedate: "2026-02-04", hubspot_owner_id: "26405238" },
  { id: "55035048249", dealname: "Igency - VR Mixta y Bubble Head | MTY", amount: 269770, closedate: "2026-02-03", hubspot_owner_id: "414692018" },
  { id: "54609926149", dealname: "entretenimiento.eco - Cabina MDF", amount: 38400, closedate: "2026-02-03", hubspot_owner_id: "26405238" },
  { id: "54740059560", dealname: "playergroupmx.com - Totem, VR futbolito, Ruleta, Super kick", amount: 22200, closedate: "2026-02-03", hubspot_owner_id: "618845046" },

  // ═══ MARZO 2026 (59 deals) ═══
  { id: "58332226873", dealname: "FRND - Cabina Cerrada con Ipad Booth | CDMX", amount: 44200, closedate: "2026-03-26", hubspot_owner_id: "26395721" },
  { id: "58406472810", dealname: "innovacc.com.mx - Trivia 2 botones | CDMX", amount: 32080, closedate: "2026-03-26", hubspot_owner_id: "618845046" },
  { id: "58254365982", dealname: "Potenttial Group - Dax | CDMX", amount: 26800, closedate: "2026-03-26", hubspot_owner_id: "414692018" },
  { id: "57452279467", dealname: "Privado - Digital Print 2 dias | CDMX", amount: 25896, closedate: "2026-03-26", hubspot_owner_id: "414692018" },
  { id: "56987585565", dealname: "arquitectoma.com.mx - Photo booth | CDMX", amount: 9800, closedate: "2026-03-26", hubspot_owner_id: "26395721" },
  { id: "56709280942", dealname: "Itera Process - Fortuna 2 dias | CDMX", amount: 59280, closedate: "2026-03-25", hubspot_owner_id: "414692018" },
  { id: "54314033209", dealname: "Circulo - Bubblehead CDMX/GDL/MTY 3 dias", amount: 195480, closedate: "2026-03-24", hubspot_owner_id: "80956812" },
  { id: "58254433940", dealname: "Epik Events - Speed Test 2 dias | CDMX", amount: 50280, closedate: "2026-03-24", hubspot_owner_id: "26395721" },
  { id: "56889245827", dealname: "tuspartners FEMSA - Meta human | Santa Fe", amount: 27660, closedate: "2026-03-23", hubspot_owner_id: "80956812" },
  { id: "58136130890", dealname: "innovacc.com.mx - Super kick, Turbo soccer, Subsoccer, Photo AI | CDMX", amount: 260880, closedate: "2026-03-23", hubspot_owner_id: "618845046" },
  { id: "57865678966", dealname: "LBN - Cabina cerrada con impresion | CDMX", amount: 38220, closedate: "2026-03-23", hubspot_owner_id: "80956812" },
  { id: "56896777906", dealname: "ifahto - Tatto print | CDMX", amount: 106240, closedate: "2026-03-23", hubspot_owner_id: "618845046" },
  { id: "58208811448", dealname: "Ninchcompany - Impresion de Stickers | CDMX", amount: 115000, closedate: "2026-03-23", hubspot_owner_id: "414692018" },
  { id: "58025430424", dealname: "DM Producciones - Mirror Booth y Football Balance | CDMX", amount: 109700, closedate: "2026-03-20", hubspot_owner_id: "26395721" },
  { id: "58208813447", dealname: "Mankuerna - Batak tubular | CDMX", amount: 18600, closedate: "2026-03-20", hubspot_owner_id: "26395721" },
  { id: "57941098299", dealname: "TOLKA Estudio - Robots", amount: 30200, closedate: "2026-03-20", hubspot_owner_id: "26405238" },
  { id: "58208318642", dealname: "Egoz.mx - Varias 20 de marzo", amount: 91920, closedate: "2026-03-20", hubspot_owner_id: "26405238" },
  { id: "58136065325", dealname: "ROYAL FOKER - Ipad Booth con Impresion | CDMX", amount: 14600, closedate: "2026-03-19", hubspot_owner_id: "414692018" },
  { id: "56709745153", dealname: "Grupo Match - Ipadbooth 4 dias", amount: 62644, closedate: "2026-03-18", hubspot_owner_id: "618845046" },
  { id: "56611845653", dealname: "Grupo Match - Ipadbooth 1 dia | CDMX", amount: 43270, closedate: "2026-03-18", hubspot_owner_id: "618845046" },
  { id: "57100464698", dealname: "Seedtag - Barra de cafe 100 personas | CDMX", amount: 23300, closedate: "2026-03-18", hubspot_owner_id: "26395721" },
  { id: "57855715648", dealname: "zeb.mx - Desarrollo de VR | CDMX", amount: 218820, closedate: "2026-03-17", hubspot_owner_id: "414692018" },
  { id: "58025322287", dealname: "innovacc.com.mx - Super kick, Turbo soccer, Green Screen + caminadora | CDMX", amount: 228780, closedate: "2026-03-17", hubspot_owner_id: "618845046" },
  { id: "57865651882", dealname: "Proyectos Publicos - Ipad booth + Impresiones | CDMX", amount: 12600, closedate: "2026-03-17", hubspot_owner_id: "414692018" },
  { id: "58029861797", dealname: "NINJA - 24 de marzo", amount: 42140, closedate: "2026-03-17", hubspot_owner_id: "26405238" },
  { id: "57610393475", dealname: "gsglogistica - Meta human | CDMX", amount: 26160, closedate: "2026-03-17", hubspot_owner_id: "618845046" },
  { id: "57938963876", dealname: "grupozima.net - INICIAL", amount: 15156, closedate: "2026-03-13", hubspot_owner_id: "618845046" },
  { id: "55624234640", dealname: "Bio Pappel - Sketch booth 4 dias | Guadalajara", amount: 152584, closedate: "2026-03-12", hubspot_owner_id: "80956812" },
  { id: "57938994437", dealname: "pixelplay.com.mx", amount: 38600, closedate: "2026-03-12", hubspot_owner_id: "26395721" },
  { id: "57856035933", dealname: "Chihuahua March 2026", amount: 140000, closedate: "2026-03-12", hubspot_owner_id: "26405238" },
  { id: "57856244888", dealname: "19 de marzo Glam bot | CDMX", amount: 38200, closedate: "2026-03-12", hubspot_owner_id: "26395721" },
  { id: "57093692590", dealname: "Elitegroups - Coffee Print | CDMX", amount: 29880, closedate: "2026-03-11", hubspot_owner_id: "88208161" },
  { id: "57865670792", dealname: "Smile Pill - Garrita y Barra de Matcha | CDMX", amount: 23100, closedate: "2026-03-11", hubspot_owner_id: "26395721" },
  { id: "57539048276", dealname: "iEvents - Totem interactivo | CDMX", amount: 32140, closedate: "2026-03-11", hubspot_owner_id: "618845046" },
  { id: "56574872744", dealname: "OMA Media - Tatto print | CDMX", amount: 30980, closedate: "2026-03-10", hubspot_owner_id: "618845046" },
  { id: "57539473565", dealname: "Sense Step | Toluca", amount: 24100, closedate: "2026-03-09", hubspot_owner_id: "26395721" },
  { id: "54609971621", dealname: "JOURNEY - Glam bot y Sketch booth | CDMX", amount: 24600, closedate: "2026-03-09", hubspot_owner_id: "80956812" },
  { id: "57030417698", dealname: "Naotravelco - Batak tubular y Fortuna 4 dias | Atizapan", amount: 96840, closedate: "2026-03-06", hubspot_owner_id: "80956812" },
  { id: "57030476625", dealname: "Brocoli - INICIAL", amount: 44040, closedate: "2026-03-05", hubspot_owner_id: "618845046" },
  { id: "57553442739", dealname: "Jogo Bonito 7 de marzo", amount: 373830, closedate: "2026-03-05", hubspot_owner_id: "26405238" },
  { id: "55454969165", dealname: "Privado - Claw Machine | CDMX", amount: 21600, closedate: "2026-03-05", hubspot_owner_id: "618845046" },
  { id: "57601792364", dealname: "Donostia Chevrolet - Pulse Challenge | Cuernavaca", amount: 25920, closedate: "2026-03-05", hubspot_owner_id: "80956812" },
  { id: "57030417047", dealname: "AstraZeneca - Houston Merida Holo", amount: 365240, closedate: "2026-03-04", hubspot_owner_id: "26405238" },
  { id: "51663034929", dealname: "cuatrof.mx - Holograma 3 dias | Cancun", amount: 138936, closedate: "2026-03-04", hubspot_owner_id: "618845046" },
  { id: "56136046130", dealname: "Motorola - Juego para Liverpool Web", amount: 165000, closedate: "2026-03-04", hubspot_owner_id: "414692018" },
  { id: "57030515108", dealname: "Agencia Descorche - Subsoccer y Super Kicker | CDMX", amount: 23600, closedate: "2026-03-04", hubspot_owner_id: "26395721" },
  { id: "56574887564", dealname: "crs21.com - Atlas | CDMX", amount: 39980, closedate: "2026-03-03", hubspot_owner_id: "414692018" },
  { id: "57451847205", dealname: "Donostia - Coffee print con barra 2 dias | Leon GTO", amount: 74240, closedate: "2026-03-03", hubspot_owner_id: "80956812" },
  { id: "51317341074", dealname: "ifahto - Tatto Print 3 dias | CDMX", amount: 50080, closedate: "2026-03-03", hubspot_owner_id: "618845046" },
  { id: "57200825877", dealname: "Igency - Cabina Cerrada con Impresion 2 dias | CDMX", amount: 78900, closedate: "2026-03-03", hubspot_owner_id: "414692018" },
  { id: "57019222064", dealname: "dalecandela.mx - Laser y cabina MDF", amount: 103702, closedate: "2026-03-03", hubspot_owner_id: "26405238" },
  { id: "57351005472", dealname: "FollowmeHealthcare - Batak Tubular hora extra | CDMX", amount: 1800, closedate: "2026-03-02", hubspot_owner_id: "26395721" },
  { id: "57350998309", dealname: "Freelance - Sense Step | CDMX", amount: 20000, closedate: "2026-03-02", hubspot_owner_id: "414692018" },
  { id: "32728209440", dealname: "Podcaste Endevour", amount: 100000, closedate: "2026-03-02", hubspot_owner_id: "26405238" },
  { id: "57021643907", dealname: "Igency - Mirror Booth, Set Neon y Caminadora Green Screen | CDMX", amount: 113860, closedate: "2026-03-02", hubspot_owner_id: "414692018" },
  { id: "57347328077", dealname: "Gonzalezhelfon - Ipad booth con Impresion | CDMX", amount: 16600, closedate: "2026-03-02", hubspot_owner_id: "414692018" },
  { id: "56460953449", dealname: "Marketen - Coffee Print y Ipad Booth | CDMX", amount: 38400, closedate: "2026-03-02", hubspot_owner_id: "414692018" },
  { id: "56289501812", dealname: "somospuntoyaparte.mx - Credenciales AI 5 dias | CDMX", amount: 162310, closedate: "2026-03-02", hubspot_owner_id: "618845046" },
];

// ─── GENERAR PROYECTOS DESDE HUBSPOT Q1 2026 ─────────────
// Projects come from HubSpot with only the sale amount.
// Only the 5 example projects have complete financial data (PM already filled them in).
// All other projects are "pendiente" with $0 costs - waiting for PM input.

export const MOCK_PROJECTS: (Project & { financials: ProjectFinancials })[] = HUBSPOT_DEALS_Q1_2026.map((deal, idx) => {
  const example = EXAMPLE_PROJECTS[deal.id];

  // Use example overrides if available
  const vendedor = example
    ? { id: example.vendedor_id, name: example.vendedor_name }
    : OWNER_TO_USER[deal.hubspot_owner_id] || { id: "u2", name: "Pricila Dominguez" };
  const pm = example
    ? { id: example.pm_id, name: example.pm_name }
    : PM_POOL[idx % PM_POOL.length];
  const product = extractProduct(deal.dealname);

  // Status and payment
  const status = example ? example.status : "pendiente";
  const paymentStatus = example ? example.payment_status : "pendiente";

  // Financials
  const financials: ProjectFinancials = example
    ? { id: `f-${deal.id}`, project_id: `p-${deal.id}`, ...example.financials }
    : generateEmptyFinancials(deal.id, deal.amount);

  // Payment gate
  const anticipo_requerido = example ? example.anticipo_requerido : Math.round(deal.amount * 0.5);
  const anticipo_pagado = example ? example.anticipo_pagado : false;
  const fecha_limite_pago = example ? example.fecha_limite_pago : (() => {
    const d = new Date(deal.closedate + "T00:00:00");
    d.setDate(d.getDate() - 5);
    return d.toISOString().split("T")[0];
  })();
  const dias_para_evento = computeDiasParaEvento(deal.closedate);
  // presupuesto_confirmado: true for example projects (they have budgets filled in)
  const presupuesto_confirmado = !!example;

  return {
    id: `p-${deal.id}`,
    deal_name: deal.dealname,
    business_unit: "pixel-factory" as const,
    vendedor_id: vendedor.id,
    vendedor_name: vendedor.name,
    pm_id: pm.id,
    pm_name: pm.name,
    product_type: product,
    event_date: deal.closedate,
    currency: "MXN" as const,
    status,
    payment_status: paymentStatus,
    created_at: deal.closedate,
    hubspot_deal_id: deal.id,
    financials,
    anticipo_requerido,
    anticipo_pagado,
    fecha_limite_pago,
    presupuesto_confirmado,
    dias_para_evento,
  };
});

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getProjectsWithProfitability() {
  const { computeProfitability } = require("./types");
  return MOCK_PROJECTS.map((p) => ({
    ...p,
    ...computeProfitability(p.financials),
  }));
}
