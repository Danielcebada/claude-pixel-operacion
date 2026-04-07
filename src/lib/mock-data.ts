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

// ─── DEALS REALES DE HUBSPOT 2026 (actualizado 2026-04-07) ────────
// Fuente: HubSpot CRM | hs_is_closed_won = true | closedate >= 2026-01-01
// Total: 168 deals ganados | $16,819,796 MXN
interface HubSpotDeal {
  id: string;
  dealname: string;
  amount: number;
  closedate: string;
  hubspot_owner_id: string;
}

const HUBSPOT_DEALS_Q1_2026: HubSpotDeal[] = [
  // ═══ ENERO 2026 (35 deals | $2,140,946) ═══
  { id: "55035067540", dealname: "CHECKLIST Event agency - Cabina de gritos-", amount: 68900, closedate: "2026-01-30", hubspot_owner_id: "618845046" },
  { id: "55031262392", dealname: "GRUPO INMOBILIARIO ALHEL - 06/febrero/2026 - Batak Tubular, Magic Sensor, Jump Score y Super Kick - 2 días de servicio (6 y 7) - CDMX", amount: 187380, closedate: "2026-01-30", hubspot_owner_id: "414692018" },
  { id: "54964289030", dealname: "pixelplay.mx - VENTA JOYCE 2.0", amount: 17160, closedate: "2026-01-28", hubspot_owner_id: "618845046" },
  { id: "49594530367", dealname: "Guanajuato Gobierno del Estado -  4 de diciembre, 2025, Dibujo IA, Credencial IA, Graffiti IA, 1 día de servicio en LEÓN", amount: 154700, closedate: "2026-01-28", hubspot_owner_id: "26395721" },
  { id: "53695373599", dealname: "Changan Perinorte - 21 febrero - Juego de reflejos - 1 día - Perinorte Edo Mex.", amount: 25300, closedate: "2026-01-28", hubspot_owner_id: "80956812" },
  { id: "54943446831", dealname: "pixelplay.mx - venta joyce", amount: 15400, closedate: "2026-01-28", hubspot_owner_id: "618845046" },
  { id: "54403808941", dealname: "totems senado", amount: 36000, closedate: "2026-01-27", hubspot_owner_id: "26405238" },
  { id: "54616298526", dealname: "Keep In Touch - 28, enero de 2026 - Ipad Booth con Impresión, 1 día de servicio en CDMX", amount: 21490, closedate: "2026-01-27", hubspot_owner_id: "26395721" },
  { id: "53696613743", dealname: "Universidad Humanitas - POR 28/enero/2026 - Atlas o Bit - 1 día de servicio - CDMX", amount: 25780, closedate: "2026-01-27", hubspot_owner_id: "414692018" },
  { id: "53696720789", dealname: "Meetings Factory Convención Pabellón M - (montaje 3  febrero) 4 febrero -  Sketch booth - 1 día - Monterrey", amount: 61520, closedate: "2026-01-26", hubspot_owner_id: "80956812" },
  { id: "53444030065", dealname: "TRENDSÉTERA - 02/febrero/2026 - Glambot - 1 día de servicio - Puebla", amount: 43400, closedate: "2026-01-26", hubspot_owner_id: "414692018" },
  { id: "54421290654", dealname: "Sketch 29 de enero", amount: 25000, closedate: "2026-01-23", hubspot_owner_id: "26405238" },
  { id: "51673897642", dealname: "Morbido group - Enero - meta human Dax o Edison - 1 día - CDMX", amount: 34220, closedate: "2026-01-22", hubspot_owner_id: "80956812" },
  { id: "52218488612", dealname: "sidetrack.agency totem interactivo y holograma 11 días de servicio- Trophy Tour", amount: 464000, closedate: "2026-01-18", hubspot_owner_id: "618845046" },
  { id: "53266875011", dealname: "iEvents - 26 febrero 2026 - cotton candy- 1 día de servicio- CDMX", amount: 22560, closedate: "2026-01-15", hubspot_owner_id: "618845046" },
  { id: "53886914351", dealname: "iEvents - Mirror booth - 26 de febrero fintech- 1 día de servicio- CDMX", amount: 19560, closedate: "2026-01-15", hubspot_owner_id: "618845046" },
  { id: "53887217996", dealname: "Keep In Touch - 26/enero/2026 - Video 360° - 1 día de servicio - CDMX", amount: 18000, closedate: "2026-01-15", hubspot_owner_id: "414692018" },
  { id: "51829970739", dealname: "Montagge - 27 a 29 enero (montaje 26 enero) - sketch booth - 3 días - Guadalajara", amount: 97800, closedate: "2026-01-14", hubspot_owner_id: "80956812" },
  { id: "53822019131", dealname: "Epik Events - 23 de Febrero, 2026, Simulador Snowboarding, 1 día de servicio en CDMX", amount: 36600, closedate: "2026-01-14", hubspot_owner_id: "26395721" },
  { id: "53451545648", dealname: "fase2.com.mx SKANDIA - 05 Febrero - Meta human Atlas o Bit Y Chipp - 1 día - CDMX Papalote Museo del Niño.", amount: 42360, closedate: "2026-01-14", hubspot_owner_id: "80956812" },
  { id: "53466542476", dealname: "Raudal Consultoría NOMAD - Jueves 12 Febrero - Sub soccer - 1 día - Jardín Ambrosia CDMX", amount: 23940, closedate: "2026-01-14", hubspot_owner_id: "80956812" },
  { id: "53500299667", dealname: "Mankuerna - Batak tubular - 14 de enero  - 1 día de servicio - CDMX", amount: 18600, closedate: "2026-01-12", hubspot_owner_id: "618845046" },
  { id: "53550547791", dealname: "Privado - 17/enero/2026 - Photobooth con impresiones - 1 día de servicio - CDMX", amount: 13910, closedate: "2026-01-12", hubspot_owner_id: "414692018" },
  { id: "53393785012", dealname: "Keep In Touch - 28/enero/2026 - Ipad Booth con Impresión - 1 día de servicio - CDMX", amount: 21490, closedate: "2026-01-09", hubspot_owner_id: "414692018" },
  { id: "53351477056", dealname: "sivale.com.mx - 21/enero/2026 - Credenciales AI - 1 día de servicio - CDMX", amount: 50000, closedate: "2026-01-09", hubspot_owner_id: "414692018" },
  { id: "53500413238", dealname: "Mattel - Season Bookings 2026 - MATTEL, CDMX", amount: 353000, closedate: "2026-01-09", hubspot_owner_id: "26405238" },
  { id: "53451102885", dealname: "Privado- totem interactivo- 23 de enero 2026- 1 día de servicio- CDMX", amount: 22600, closedate: "2026-01-08", hubspot_owner_id: "618845046" },
  { id: "53393722242", dealname: "colectivohype.com - 10 de Enero, 2026, Ipad Booth con impresión, 1 día de servicio en CDMX", amount: 14400, closedate: "2026-01-07", hubspot_owner_id: "26395721" },
  { id: "53265166947", dealname: "cheetahds.co - 31/enero/2026 - Ipad Booth + Garrita - 1 día de servicio - CDMX", amount: 16900, closedate: "2026-01-06", hubspot_owner_id: "414692018" },
  { id: "51084033329", dealname: "Netlix impresoras de tarjetas", amount: 37020, closedate: "2026-01-05", hubspot_owner_id: "26405238" },
  { id: "51790294694", dealname: "ACHE - 11 y 12 de enero, 2026, Pixel Claw (Garrita), 2 días de servicio en CDMX", amount: 43720, closedate: "2026-01-05", hubspot_owner_id: "26395721" },
  { id: "52994207848", dealname: "iEvents - 26 de febrero 2025 -  Vr atrapa objetos - 1 día de servicio - CDMX", amount: 29656, closedate: "2026-01-05", hubspot_owner_id: "618845046" },
  { id: "53265127500", dealname: "BACKYARD -WeMake- -23 de enero de 2026 Mirrorbooth / meta human dax o edison- 1 día de servicio- CDMX", amount: 1800, closedate: "2026-01-05", hubspot_owner_id: "618845046" },
  { id: "51829999523", dealname: "Leaper360 - 30 enero 2026- walk screen- 1 día de servicio- CDMX", amount: 38380, closedate: "2026-01-05", hubspot_owner_id: "618845046" },
  { id: "51016100768", dealname: "heybigsur.com - 04 de diciembre, 2025, Cabina Cerrada con Ipad Booth Digital, 1 día de servicio, en CDMX", amount: 38400, closedate: "2026-01-01", hubspot_owner_id: "26395721" },
  // ═══ FEBRERO 2026 (51 deals | $7,779,847) ═══
  { id: "57093663357", dealname: "FotoFlip - 02 de Marzo, 2026, Mega Futbolito, 1 día de servicio en CDMX", amount: 13800, closedate: "2026-02-28", hubspot_owner_id: "26395721" },
  { id: "57177745224", dealname: "360media - Glambot- 1 día de servicio- 3 de marzo- CDMX", amount: 41560, closedate: "2026-02-27", hubspot_owner_id: "618845046" },
  { id: "55639793587", dealname: "Privado- 3 y 4 de marzo 2 totems a renta- 2 día de servicio- CDMX", amount: 19788, closedate: "2026-02-27", hubspot_owner_id: "618845046" },
  { id: "57140982090", dealname: "colectivohype.com - Superkick y Atrapa balones - 2026", amount: 444300, closedate: "2026-02-26", hubspot_owner_id: "26395721" },
  { id: "56214591887", dealname: "Privado. sin fecha definida- 1 día de servicio _ Mty", amount: 16000, closedate: "2026-02-26", hubspot_owner_id: "618845046" },
  { id: "57021777268", dealname: "iEvents - esfera led - 26 de febrero- 1 día de servicio- CDMX", amount: 7500, closedate: "2026-02-26", hubspot_owner_id: "618845046" },
  { id: "57021716382", dealname: "playergroupmx.com - 2 y 3 de marzo- Quiz interactivo- 2 días de servicio- CDMX", amount: 70600, closedate: "2026-02-26", hubspot_owner_id: "26395721" },
  { id: "56935804689", dealname: "Tres60o Estrategia - 10/marzo/2026 - Juego Interactivo en Pantalla con Tótem: PERSONALIZADO - 1 día de servicio - CDMX", amount: 88820, closedate: "2026-02-25", hubspot_owner_id: "414692018" },
  { id: "56889340996", dealname: "fase2.com.mx - 28 febrero y 1 de marzo - Barra Refresh 400 personas - 2 días - Campo Marte CDMX", amount: 102080, closedate: "2026-02-25", hubspot_owner_id: "80956812" },
  { id: "55827633178", dealname: "fbworkers.com - 15/marzo/2026 - Cabina Cerrada con Impresiones - 1 día de servicio - CDMX", amount: 39560, closedate: "2026-02-24", hubspot_owner_id: "414692018" },
  { id: "56611822253", dealname: "Live Agency - 10, 11 y 12 de marzo, 2026, Renta de Tótem Slim y Juego interactivo Personalizado, 3 días de servicio en CDMX.", amount: 114369, closedate: "2026-02-24", hubspot_owner_id: "26395721" },
  { id: "56896658182", dealname: "Federación Mexicana de Fútbol - Femenil 2026", amount: 1660500, closedate: "2026-02-24", hubspot_owner_id: "26405238" },
  { id: "46638039052", dealname: "software logicia", amount: 12000, closedate: "2026-02-23", hubspot_owner_id: "26405238" },
  { id: "56706724786", dealname: "lettuce.mx - 14 y 15 de marzo- multicam 180 - 2 días de servicio - CDMX", amount: 90320, closedate: "2026-02-20", hubspot_owner_id: "618845046" },
  { id: "56443262097", dealname: "Orange Digital CX - Nuevo tipo de objeto Deal", amount: 36130, closedate: "2026-02-19", hubspot_owner_id: "88208161" },
  { id: "56443073201", dealname: "Vinter - 2 y 3 de marzo, Bicicleta digital Test con sensores de velocidad, 2 días de servicio en CDMX", amount: 87360, closedate: "2026-02-19", hubspot_owner_id: "26395721" },
  { id: "56175396645", dealname: "Plesk - Jueves 5 y Sábado 7 de Marzo - sketch booth y Pixel Claw - 1 día - León", amount: 83080, closedate: "2026-02-19", hubspot_owner_id: "80956812" },
  { id: "56135953331", dealname: "DOSHA - 4 a 6 Marzo -  Simulador de camiones", amount: 79300, closedate: "2026-02-19", hubspot_owner_id: "26405238" },
  { id: "56549455262", dealname: "kaktus.mx - 03/marzo/2026 - Super Kick y Sub Soccer - 1 día de servicio - CDMX", amount: 36600, closedate: "2026-02-18", hubspot_owner_id: "414692018" },
  { id: "56611002882", dealname: "FollowmeHealthcare.MX - 28 de Febrero, 2026, Batak Tubular, 1 día de servicio en CDMX", amount: 1800, closedate: "2026-02-18", hubspot_owner_id: "26395721" },
  { id: "56549339190", dealname: "Habitant Productions - 19 de Febrero, Barra de Café para 50 personas por 10 hrs de servicio en CDMX", amount: 32700, closedate: "2026-02-18", hubspot_owner_id: "26395721" },
  { id: "55624234055", dealname: "VR", amount: 105000, closedate: "2026-02-18", hubspot_owner_id: "26405238" },
  { id: "56443323795", dealname: "Mankuerna - 20 de Febrero, 2026, Batak Tubular, 1 día de servicio en CDMX", amount: 18600, closedate: "2026-02-17", hubspot_owner_id: "26395721" },
  { id: "56127406885", dealname: "NEXTYA - 19 Febrero - Superficie por medio de sensores, pantalla led de piso, VR Game, Sketch booth - 1 día - Puebla", amount: 51200, closedate: "2026-02-17", hubspot_owner_id: "80956812" },
  { id: "55978799988", dealname: "Agencia Descorche - 28/marzo/2026 - Super Kick - 1 día de servicio - CDMX", amount: 27100, closedate: "2026-02-17", hubspot_owner_id: "414692018" },
  { id: "54956813446", dealname: "Ninja/Glambot/27 de febrero", amount: 39980, closedate: "2026-02-17", hubspot_owner_id: "26405238" },
  { id: "54421290858", dealname: "Wolfxp - 14/julio/2026 - Esferas LED, Medidor de Fuerza, Multiball, Futbolito VR - 2 días de servicio (14 y 15) - CDMX", amount: 193080, closedate: "2026-02-17", hubspot_owner_id: "414692018" },
  { id: "56549265795", dealname: "Modulos AI - Tresetera- MIercoles 18", amount: 55000, closedate: "2026-02-17", hubspot_owner_id: "26405238" },
  { id: "53696364304", dealname: "TKL - 05 y 06 de Marzo, Coffee Print para 370 personas y Print sobre bebidas, 2 días de servicio.", amount: 183160, closedate: "2026-02-12", hubspot_owner_id: "26395721" },
  { id: "55389473585", dealname: "DM Producciones y Stands - 25 de Febrero, 2026, Batak Tubular, Super kick y Sub soccer, en QRO 1 día de servicio.", amount: 30600, closedate: "2026-02-12", hubspot_owner_id: "26395721" },
  { id: "56122058800", dealname: "iEvents - 26 de febrero totem interactivo- 1 día de servicio- CDMX", amount: 32400, closedate: "2026-02-12", hubspot_owner_id: "618845046" },
  { id: "55031259217", dealname: "3.1416r.com - 19/febrero/2026 - Writing art y Photo AR - 1 día de servicio - CDMX", amount: 59260, closedate: "2026-02-11", hubspot_owner_id: "414692018" },
  { id: "54396664704", dealname: "xy.inc- Meta Human- Photo ai con credenciales - Holograma con AI- 26-28 febrero - San Miguel Allende", amount: 101920, closedate: "2026-02-10", hubspot_owner_id: "618845046" },
  { id: "55827760003", dealname: "Team - Papalote museo del niño- batak- sensor de velocidad- totem interacitvo", amount: 1638000, closedate: "2026-02-10", hubspot_owner_id: "618845046" },
  { id: "55881972246", dealname: "Team -sensor de velocidad-  14-15 marzo GDL- 21-22 marzo Mty- 28.29 marzo CDMX- 6 días de servicio-", amount: 306000, closedate: "2026-02-10", hubspot_owner_id: "618845046" },
  { id: "51831980852", dealname: "Chipichape - 26 Marzo - Sketch booth,  Meta human Dax o Edison, Chipp. Holograma XL - 1 día - Cancún o Riviera Maya", amount: 395476, closedate: "2026-02-10", hubspot_owner_id: "80956812" },
  { id: "55117177962", dealname: "Plot - 15 de febrero - claw machine- 1 dia de servicio- CDMX", amount: 21600, closedate: "2026-02-09", hubspot_owner_id: "618845046" },
  { id: "55682498680", dealname: "conqr - 13 y 14 de Febrero, Cabina Cerrada con Ipad Booth e impresiones, 2 días de servicio en CDMX", amount: 178800, closedate: "2026-02-06", hubspot_owner_id: "26395721" },
  { id: "54615865642", dealname: "Connector - 13 y 14 de febrero - Photo booth con impresión - 2 días - Estadio GNP CDMX", amount: 38820, closedate: "2026-02-06", hubspot_owner_id: "80956812" },
  { id: "55663278621", dealname: "Tanque Group - Activaciones (BTL) 2026 - 70 fechas", amount: 420000, closedate: "2026-02-06", hubspot_owner_id: "26395721" },
  { id: "55478523259", dealname: "DSLR", amount: 19034, closedate: "2026-02-06", hubspot_owner_id: "26405238" },
  { id: "55663276613", dealname: "dalecandela.mx - Netflix 11 de Febrero- Ipad booth", amount: 20580, closedate: "2026-02-06", hubspot_owner_id: "26405238" },
  { id: "54609992575", dealname: "Venta Sketch", amount: 152000, closedate: "2026-02-06", hubspot_owner_id: "26405238" },
  { id: "55478368037", dealname: "globalskin- sin fecha definida-Meta Human - 1 día de servicio- CDMX", amount: 26160, closedate: "2026-02-05", hubspot_owner_id: "618845046" },
  { id: "55478339204", dealname: "Privado-sin fecha definida-  totem- batak- fortuna- 1 día de servicio- CDMX", amount: 37940, closedate: "2026-02-05", hubspot_owner_id: "618845046" },
  { id: "55475469911", dealname: "helloagency.mx - 08 de Febrero, 2026, Magic Mirror, 1 día de servicio en CDMX", amount: 22600, closedate: "2026-02-05", hubspot_owner_id: "26395721" },
  { id: "55586037806", dealname: "momentos.com.mx - Mirrorbooth- 13 de febrero - 1 día de servicio. CDMX", amount: 21560, closedate: "2026-02-05", hubspot_owner_id: "618845046" },
  { id: "54128050854", dealname: "Foto y poster", amount: 175440, closedate: "2026-02-04", hubspot_owner_id: "26405238" },
  { id: "55035048249", dealname: "Igency - 08/febrero/2026 - VR Mixta y Bubble Head - MTY", amount: 269770, closedate: "2026-02-03", hubspot_owner_id: "414692018" },
  { id: "54609926149", dealname: "entretenimiento.eco - 6 de febrero -  cabina mdf", amount: 38400, closedate: "2026-02-03", hubspot_owner_id: "26405238" },
  { id: "54740059560", dealname: "playergroupmx.com - totem interactivo -vr futbolito- ruleta (juego interactivo) - Super kick", amount: 22200, closedate: "2026-02-03", hubspot_owner_id: "618845046" },
  // ═══ MARZO 2026 (68 deals | $5,790,783) ═══
  { id: "58634293628", dealname: "colectivohype.com - Juego Personalizado en pantalla- 22 de abril al 10 de mayo, en CDMX", amount: 400800, closedate: "2026-03-31", hubspot_owner_id: "26395721" },
  { id: "57553437001", dealname: "Marketen - 09/junio/2026 - Multicam 180° y Personalización de playeras - 5 fechas - CDMX y MTY", amount: 460175, closedate: "2026-03-31", hubspot_owner_id: "414692018" },
  { id: "58208858951", dealname: "Vinter - 15 de abril y 20 de abril, Bicicleta digital Test con sensores de velocidad dos bicicletas por fecha, 2 días de servicio en CDMX", amount: 74960, closedate: "2026-03-31", hubspot_owner_id: "26395721" },
  { id: "58135783841", dealname: "WeWork - endeavor day- abril", amount: 27580, closedate: "2026-03-31", hubspot_owner_id: "26405238" },
  { id: "58254560062", dealname: "Three Flame® The Marketing Company® - 7, 8 y 9 de abril VR video- 3 días de servicio- CDMX", amount: 125970, closedate: "2026-03-30", hubspot_owner_id: "618845046" },
  { id: "58519367487", dealname: "q4imagen.com.mx - 29 de Marzo, 2026, Mirror Booth en CDMX", amount: 23700, closedate: "2026-03-28", hubspot_owner_id: "26395721" },
  { id: "58025497412", dealname: "Black Belt Marketing Society - Gritometro", amount: 42280, closedate: "2026-03-27", hubspot_owner_id: "26405238" },
  { id: "58254427681", dealname: "AstraZeneca - Foto Libro", amount: 61420, closedate: "2026-03-27", hubspot_owner_id: "26405238" },
  { id: "58404376703", dealname: "Epik Events - 07 de Abril, 2026, Coffee print para 100 personas en CDMX", amount: 23320, closedate: "2026-03-27", hubspot_owner_id: "26395721" },
  { id: "57452279467", dealname: "Privado - 15/abril/2026 - Digital Print - 2 días de servicio (15 y 16) - CDMX", amount: 25896, closedate: "2026-03-26", hubspot_owner_id: "414692018" },
  { id: "58332226873", dealname: "FRND - 28 de abril, 2026, Cabina Cerrada con Ipad Booth, 1 día de servicio en CDMX", amount: 44200, closedate: "2026-03-26", hubspot_owner_id: "26395721" },
  { id: "58406472810", dealname: "innovacc.com.mx -27 de marzo -  Trivia- 2 botones- 1 día de servicio", amount: 32080, closedate: "2026-03-26", hubspot_owner_id: "618845046" },
  { id: "58254365982", dealname: "Potenttial Group - 01/junio/2026 - Dax - 1 día de servicio - CDMX", amount: 26800, closedate: "2026-03-26", hubspot_owner_id: "414692018" },
  { id: "56987585565", dealname: "arquitectoma.com.mx - 16 de abril, 2026, Photo booth, 1 día de servicio en CDMX", amount: 9800, closedate: "2026-03-26", hubspot_owner_id: "26395721" },
  { id: "56709280942", dealname: "Itera Process - 13/mayo/2026 - Fortuna - 2 días de servicio (13 y 14) - CDMX", amount: 59280, closedate: "2026-03-25", hubspot_owner_id: "414692018" },
  { id: "54314033209", dealname: "Círculo - bubblehead 25 Abril Cdmx, 27 Abril GDL, 29 Abril Mty- 3 días de servicio- CDMX- GDL-MTY", amount: 195480, closedate: "2026-03-24", hubspot_owner_id: "80956812" },
  { id: "58254433940", dealname: "Epik Events - 26 y 27 de Speed Test, 2 días de servicio en CDMX", amount: 50280, closedate: "2026-03-24", hubspot_owner_id: "26395721" },
  { id: "56889245827", dealname: "tuspartners.mx FEMSA - 8 de Abril - Meta human Atlas o Bit - 1 día  - Santa Fe CDMX", amount: 27660, closedate: "2026-03-23", hubspot_owner_id: "80956812" },
  { id: "58136130890", dealname: "innovacc.com.mx - 26 de marzo - Super kick, Turbo soccer con cancha , Subsoccer, Mega Futbolito, Caminadora Magic Screen | Set genérico, Photo AI, Batak de Piso,", amount: 260880, closedate: "2026-03-23", hubspot_owner_id: "618845046" },
  { id: "57865678966", dealname: "LBN - 24 de Marzo - Cabina cerrada con impresión - 1 día - CDMX", amount: 38220, closedate: "2026-03-23", hubspot_owner_id: "80956812" },
  { id: "56896777906", dealname: "ifahto -  22 marzo 2026- tatto print - 1 día de servicio - CDMX", amount: 106240, closedate: "2026-03-23", hubspot_owner_id: "618845046" },
  { id: "58208811448", dealname: "Ninchcompany - 06/mayo/2026 - Imprensión de Stickers - 1 día de servicio - CDMX", amount: 115000, closedate: "2026-03-23", hubspot_owner_id: "414692018" },
  { id: "58025430424", dealname: "DM Producciones y Stands - 28 de Marzo, Mirror Booth y Football Balance en CDMX", amount: 109700, closedate: "2026-03-20", hubspot_owner_id: "26395721" },
  { id: "58208813447", dealname: "Mankuerna - 23 de marzo- batak tubular- 1 día de servicio- CDMX", amount: 18600, closedate: "2026-03-20", hubspot_owner_id: "26395721" },
  { id: "57941098299", dealname: "TOLKA Estudio - Robots", amount: 60200, closedate: "2026-03-20", hubspot_owner_id: "26405238" },
  { id: "58208318642", dealname: "Egoz.mx - varias 20 de marzo", amount: 91920, closedate: "2026-03-20", hubspot_owner_id: "26405238" },
  { id: "58136065325", dealname: "ROYAL FOKER - 20/marzo/2026 - Ipad Booth con Impresión - 1 día de servicio - CDMX", amount: 14600, closedate: "2026-03-19", hubspot_owner_id: "414692018" },
  { id: "56709745153", dealname: "Grupo Match - Ipadbooth - 23-24-25-26 de abril - 4 días de servicio", amount: 62644, closedate: "2026-03-18", hubspot_owner_id: "618845046" },
  { id: "56611845653", dealname: "Grupo Match -20 de abril- ipadbooth- 1 día de servicio- CDMX", amount: 43270, closedate: "2026-03-18", hubspot_owner_id: "618845046" },
  { id: "57100464698", dealname: "Seedtag - *Sin especificar fecha*, Barra de café para 100 personas, 1 día de servicio en CDMX", amount: 23300, closedate: "2026-03-18", hubspot_owner_id: "26395721" },
  { id: "57855715648", dealname: "zeb.mx - 15/abril/2025 - Desarrollo de VR - 1 día de servicio - CDMX", amount: 218820, closedate: "2026-03-17", hubspot_owner_id: "414692018" },
  { id: "58025322287", dealname: "innovacc.com.mx - 20 de marzo- Super kickTurbo soccer con canchaSubsoccerFutbolito Batak de PisoMini RaceGreen Screen + caminadora - 1 día de servicio- CDMX", amount: 228780, closedate: "2026-03-17", hubspot_owner_id: "618845046" },
  { id: "57865651882", dealname: "Proyectos Públicos - 21/marzo/2026 - Ipad booth + Impresiones - 1 día de servicio - CDMX", amount: 12600, closedate: "2026-03-17", hubspot_owner_id: "414692018" },
  { id: "58029861797", dealname: "NINJA* - 24 de marzo", amount: 42140, closedate: "2026-03-17", hubspot_owner_id: "26405238" },
  { id: "57610393475", dealname: "gsglogistica- 19 marzo - metra human- 1 día de servicio. CDMX", amount: 26160, closedate: "2026-03-17", hubspot_owner_id: "618845046" },
  { id: "57938963876", dealname: "grupozima.net - INICIAL", amount: 15156, closedate: "2026-03-13", hubspot_owner_id: "618845046" },
  { id: "55624234640", dealname: "Bio Pappel - sin definir - sketch booth - 4 días - Guadalajara", amount: 152584, closedate: "2026-03-12", hubspot_owner_id: "80956812" },
  { id: "57938994437", dealname: "pixelplay.com.mx - Nuevo tipo de objeto Deal", amount: 38600, closedate: "2026-03-12", hubspot_owner_id: "26395721" },
  { id: "57939173808", dealname: "Demo", amount: 10, closedate: "2026-03-12", hubspot_owner_id: "26405238" },
  { id: "57856035933", dealname: "Chihuahua March 2026", amount: 140000, closedate: "2026-03-12", hubspot_owner_id: "26405238" },
  { id: "57856244888", dealname: "19 de marzo, Glam bot, 1 día de servicio en CDMX", amount: 38200, closedate: "2026-03-12", hubspot_owner_id: "26395721" },
  { id: "57093692590", dealname: "Elitegroups|PENDIENTE|COFFEE PRINT|1 DIA|CDMX", amount: 29880, closedate: "2026-03-11", hubspot_owner_id: "88208161" },
  { id: "57865670792", dealname: "Smile Pill - 14 de Abril, Garrita y Barra de Matcha con print en CDMX", amount: 23100, closedate: "2026-03-11", hubspot_owner_id: "26395721" },
  { id: "57539048276", dealname: "iEvents -  10marzo - totem interactivo - 1 día de renta - CDMX", amount: 32140, closedate: "2026-03-11", hubspot_owner_id: "618845046" },
  { id: "56574872744", dealname: "OMA Media - 19 de marzo 2026- tatto print- 1 día de servicio- CDMX", amount: 30980, closedate: "2026-03-10", hubspot_owner_id: "618845046" },
  { id: "57539473565", dealname: "*Sin espcificar fecha*, Sense Step, 1 día de servicio en Toluca", amount: 24100, closedate: "2026-03-09", hubspot_owner_id: "26395721" },
  { id: "54609971621", dealname: "JOURNEY - 25 Marzo - Glam bot Blanco y sketch booth - 1 día - CDMX", amount: 26400, closedate: "2026-03-09", hubspot_owner_id: "80956812" },
  { id: "57030417698", dealname: "Naotravelco - 21 y 22 /28 y 29 Marzo - batak tubular, fortuna  - 4 días -  Galerías Atizapán Edo Méx.", amount: 96840, closedate: "2026-03-06", hubspot_owner_id: "80956812" },
  { id: "57030476625", dealname: "Brocoli - INICIAL", amount: 44040, closedate: "2026-03-05", hubspot_owner_id: "618845046" },
  { id: "57553442739", dealname: "Jogo Bonito 7 de marzo", amount: 373830, closedate: "2026-03-05", hubspot_owner_id: "26405238" },
  { id: "55454969165", dealname: "Privado - 12 de febrero- Claw Machine- 1 día de servicio- CDMX", amount: 21600, closedate: "2026-03-05", hubspot_owner_id: "618845046" },
  { id: "57601792364", dealname: "Donostia Chevrolet - 7 de Marzo - Pulse Challenge - 1 día - Galerías Cuernavaca", amount: 25920, closedate: "2026-03-05", hubspot_owner_id: "80956812" },
  { id: "57030417047", dealname: "AstraZeneca - Houston Merida Holo", amount: 365240, closedate: "2026-03-04", hubspot_owner_id: "26405238" },
  { id: "51663034929", dealname: "cuatrof.mx - holograma- Mayo - 3 días de servicio- Cancun", amount: 138936, closedate: "2026-03-04", hubspot_owner_id: "618845046" },
  { id: "56136046130", dealname: "Motorola - 01/abril/2026 - Juego para Liverpool - Web", amount: 165000, closedate: "2026-03-04", hubspot_owner_id: "414692018" },
  { id: "57030515108", dealname: "Agencia Descorche - 09 de marzo, 2026, Subsoccer y Super Kicker, 1 día de servicio en CDMX", amount: 23600, closedate: "2026-03-04", hubspot_owner_id: "26395721" },
  { id: "56574887564", dealname: "crs21.com - 04/junio/2026 - Atlas - 1 día de servicio - CDMX", amount: 39980, closedate: "2026-03-03", hubspot_owner_id: "414692018" },
  { id: "57451847205", dealname: "Donostia - 7 y 8 de Marzo - Coffe print con barra de café 100 personas - 2 días - Plaza Mayor, León Guanajuato", amount: 74240, closedate: "2026-03-03", hubspot_owner_id: "80956812" },
  { id: "51317341074", dealname: "ifahto -Tatto Print - 4, 5 y 6 de Marzo 2026 - 1 día de servicio- CDMX", amount: 50080, closedate: "2026-03-03", hubspot_owner_id: "618845046" },
  { id: "57200825877", dealname: "Igency - 27/marzo/2026 - Cabina Cerrada con Impresión - 2 días de servicio (27 y 28) - CDMX", amount: 78900, closedate: "2026-03-03", hubspot_owner_id: "414692018" },
  { id: "57019222064", dealname: "dalecandela.mx - Laser y cabina mdf", amount: 103702, closedate: "2026-03-03", hubspot_owner_id: "26405238" },
  { id: "57351005472", dealname: "FollowmeHealthcare.MX - 28 de Febrero, 2026, Batak Tubular, Hora extra en CDMX", amount: 1800, closedate: "2026-03-02", hubspot_owner_id: "26395721" },
  { id: "57350998309", dealname: "Freelance - 06/marzo/2026 - Sense Step - 1 día de servicio - CDMX", amount: 20000, closedate: "2026-03-02", hubspot_owner_id: "414692018" },
  { id: "32728209440", dealname: "podcaste endevour", amount: 100000, closedate: "2026-03-02", hubspot_owner_id: "26405238" },
  { id: "57021643907", dealname: "Igency - 15/marzo/2026 - Mirror Booth con Estructura,  Set Neón y Caminadora Green Screen - 1 día de servicio - CDMX", amount: 113860, closedate: "2026-03-02", hubspot_owner_id: "414692018" },
  { id: "57347328077", dealname: "Gonzalezhelfon - 07/marzo/2026 - Ipad booth con Impresión - 1 día de servicio - CDMX", amount: 16600, closedate: "2026-03-02", hubspot_owner_id: "414692018" },
  { id: "56460953449", dealname: "Marketen - 12/marzo/2026 - Coffee Print y Ipad Booth con Impresión - 1 día de servicio - CDMX", amount: 38400, closedate: "2026-03-02", hubspot_owner_id: "414692018" },
  { id: "56289501812", dealname: "somospuntoyaparte.mx - 9 al 13 de marzo- Credenciales AI- 5 día de servicio- CDMX", amount: 162310, closedate: "2026-03-02", hubspot_owner_id: "618845046" },
  // ═══ ABRIL 2026 (13 deals | $556,460) ═══
  { id: "58437593666", dealname: "MERCADORAMA - 16 de abril- holograma- 1 día de servicio- CDMX", amount: 36980, closedate: "2026-04-07", hubspot_owner_id: "618845046" },
  { id: "58798433321", dealname: "Parque Tepeyac - 10 abril -  sub soccer - 1 día - Parque tepeyac CDMX", amount: 15660, closedate: "2026-04-07", hubspot_owner_id: "80956812" },
  { id: "58798300481", dealname: "ACHE - DAY -  Inicio: 22 de Abril, 2026, Desarrollo de juego interactivo online en landing page dedicada.", amount: 111500, closedate: "2026-04-07", hubspot_owner_id: "26395721" },
  { id: "58630700456", dealname: "playergroupmx.com - *Sin especificar fecha*, Video 180, 1 día de servicio en CDMX", amount: 43820, closedate: "2026-04-07", hubspot_owner_id: "26395721" },
  { id: "56289630015", dealname: "FCO Group - 26/abril/2026 - Calidoscopio - 1 día de servicio - CDMX", amount: 21600, closedate: "2026-04-06", hubspot_owner_id: "414692018" },
  { id: "36153548866", dealname: "Photobooth | 07 de Marzo 2026 | San Miguel Allende", amount: 15900, closedate: "2026-04-06", hubspot_owner_id: "618845046" },
  { id: "58630606623", dealname: "LKD - 15/abril/2025 - Sketch Booth - 1 día de servicio - CDMX", amount: 25980, closedate: "2026-04-06", hubspot_owner_id: "414692018" },
  { id: "47172416308", dealname: "La Ibero - Taller innovación educativa - 28  mayo - Meta humanoide Dax o Edison y sketchbooth - 1 día - Santa Fe CDMX", amount: 42900, closedate: "2026-04-06", hubspot_owner_id: "80956812" },
  { id: "58295312676", dealname: "Taste MKT - 29 abril, 2026, Batak de Pared, 1 día de servicio en MTY", amount: 55180, closedate: "2026-04-01", hubspot_owner_id: "26395721" },
  { id: "58634266519", dealname: "PájaroPiedra|8 y 9 mayo|2 DÍAS| CDMX", amount: 62320, closedate: "2026-04-01", hubspot_owner_id: "88208161" },
  { id: "58630696761", dealname: "bungaloo - 17 y 18 de Abril, 2026, Robot Sketch Booth en Mazatlán por 2 días.", amount: 99600, closedate: "2026-04-01", hubspot_owner_id: "26395721" },
  { id: "58599266836", dealname: "Privado - 04/abril/2026 - Photobooth con Impresión - 1 día de servicio - CDMX", amount: 12220, closedate: "2026-04-01", hubspot_owner_id: "414692018" },
  { id: "58630663547", dealname: "Instituto Ovalle Monday - 30/abril/2026 - Megafutbolito - 1 día de servicio - CDMX", amount: 12800, closedate: "2026-04-01", hubspot_owner_id: "414692018" },
  // ═══ MAYO 2026 (1 deals | $551,760) ═══
  { id: "55581049399", dealname: "bestsidesolutions.com -Memorama digital-Atrapa antojos-Juego de reflejos.- 15  día de servicio- CDMX", amount: 551760, closedate: "2026-05-07", hubspot_owner_id: "414692018" },
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
