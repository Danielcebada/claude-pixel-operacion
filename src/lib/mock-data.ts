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
  "320958987": { id: "u1", name: "Daniel Cebada" },
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
  if (lower.includes("photobooth") || lower.includes("photo booth") || lower.includes("booth con impresion") || lower.includes("cabina de fotos") || lower.includes("cabina mdf")) return "Photobooth";
  if (lower.includes("ipad booth") || lower.includes("ipadbooth")) return "iPad Booth";
  if (lower.includes("mirror booth") || lower.includes("mirrorbooth")) return "Mirror Booth";
  if (lower.includes("coffee print") || lower.includes("barra de café") || lower.includes("barra de cafe") || lower.includes("barra de matcha") || lower.includes("cafe gourmet")) return "Coffee Print";
  if (lower.includes("sketchbooth") || lower.includes("sketch booth") || lower.includes("robot sketch") || lower.includes("sketchbot")) return "Sketch Booth";
  if (lower.includes("360")) return "360 Booth";
  if (lower.includes("green screen") || lower.includes("caminadora")) return "Green Screen";
  if (lower.includes("glambot") || lower.includes("glam bot")) return "Glambot";
  if (lower.includes("bubblehead") || lower.includes("cabezones")) return "Bubblehead AI";
  if (lower.includes("batak")) return "Batak";
  if (lower.includes("vr") || lower.includes("beat saber")) return "VR Experience";
  if (lower.includes("meta human")) return "Meta Human";
  if (lower.includes("holograma")) return "Holograma";
  if (lower.includes("arcade") || lower.includes("maquinit")) return "Arcade";
  if (lower.includes("mesa interactiva")) return "Mesa Interactiva";
  if (lower.includes("riel booth")) return "Riel Booth";
  if (lower.includes("juego interactivo") || lower.includes("juego en pantalla") || lower.includes("juego de reflejos") || lower.includes("memorama") || lower.includes("atrapa")) return "Juego Interactivo";
  if (lower.includes("laser") || lower.includes("láser") || lower.includes("grabadora laser")) return "Laser Machine";
  if (lower.includes("sticker") || lower.includes("plancha")) return "Sticker Station";
  if (lower.includes("cabina cerrada") || lower.includes("cabina de gritos")) return "Cabina Cerrada";
  if (lower.includes("surface") || lower.includes("sensores") || lower.includes("magic sensor")) return "Magic Sensor";
  if (lower.includes("kit de actividad")) return "Kit Actividad";
  if (lower.includes("garrita") || lower.includes("claw")) return "Pixel Claw";
  if (lower.includes("filtro ia") || lower.includes("photo ai") || lower.includes("digital print")) return "Photo AI";
  if (lower.includes("multiball")) return "Multiball";
  if (lower.includes("credencial")) return "Credenciales AI";
  if (lower.includes("super kick") || lower.includes("soccer") || lower.includes("futbolito") || lower.includes("sub soccer") || lower.includes("subsoccer") || lower.includes("megafutbolito")) return "Sports Games";
  if (lower.includes("tatto print") || lower.includes("tattoo")) return "Tatto Print";
  if (lower.includes("fortuna") || lower.includes("ruleta")) return "Rueda de la Fortuna";
  if (lower.includes("sense step") || lower.includes("sensestep")) return "Sense Step";
  if (lower.includes("pulse") || lower.includes("speed test") || lower.includes("reflejos")) return "Pulse Challenge";
  if (lower.includes("robot")) return "Robots";
  if (lower.includes("totem")) return "Totem Interactivo";
  if (lower.includes("graffiti")) return "Graffiti Wall";
  if (lower.includes("video 180")) return "Video 180";
  if (lower.includes("calidoscopio")) return "Calidoscopio";
  if (lower.includes("audiobook")) return "Audiobook";
  if (lower.includes("stream")) return "Streaming";
  if (lower.includes("pantalla de led") || lower.includes("esferas")) return "Pantalla LED";
  if (lower.includes("atlas") || lower.includes("bit")) return "Atlas/Bit";
  return "Experiencia Custom";
}

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

// ─── DEALS GANADOS ABRIL 2026 (actualizado 2026-04-13 desde HubSpot) ────────
// Fuente: HubSpot CRM | hs_is_closed_won = true | abril 2026
// Total: 37 deals | $3,261,825 MXN
interface HubSpotDeal {
  id: string;
  dealname: string;
  amount: number;
  closedate: string;
  hubspot_owner_id: string;
}

const HUBSPOT_DEALS_ABRIL_2026: HubSpotDeal[] = [
  { id: "56645830576", dealname: "Primacía - Stream", amount: 101100, closedate: "2026-04-13", hubspot_owner_id: "414692018" },
  { id: "58900567142", dealname: "ColectivoSH - Colectivo 3er tiempo- mundial", amount: 945400, closedate: "2026-04-13", hubspot_owner_id: "618845046" },
  { id: "59153607271", dealname: "Primacía - Subscoocer 2 niños kof", amount: 29600, closedate: "2026-04-13", hubspot_owner_id: "26405238" },
  { id: "58136128648", dealname: "Tools for Humanity - Modificaciones Chihuahua", amount: 61817, closedate: "2026-04-13", hubspot_owner_id: "26405238" },
  { id: "58134806577", dealname: "Tools for Humanity - OP Chihuahua", amount: 420000, closedate: "2026-04-13", hubspot_owner_id: "26405238" },
  { id: "58332165977", dealname: "Tools for Humanity - Recolecciones", amount: 45200, closedate: "2026-04-13", hubspot_owner_id: "26405238" },
  { id: "59086436472", dealname: "wolfwcc.com - 14/marzo/2026 - Juego de Reflejos - 1 día de servicio - CDMX", amount: 26800, closedate: "2026-04-10", hubspot_owner_id: "414692018" },
  { id: "59086315828", dealname: "Epik Events - 24 al 26 de abril, 2026, Magic Sensor, 3 días en CDMX", amount: 50200, closedate: "2026-04-10", hubspot_owner_id: "26395721" },
  { id: "59086926232", dealname: "DM Producciones y Stands - 15 de abril 2026 - Mirrorbooth con impresiones - 1 día de servicio - CDMX", amount: 20750, closedate: "2026-04-10", hubspot_owner_id: "618845046" },
  { id: "58798249375", dealname: "Sketchbot", amount: 26800, closedate: "2026-04-10", hubspot_owner_id: "26405238" },
  { id: "58906166111", dealname: "Liverpool - Etam dia de las madres", amount: 313400, closedate: "2026-04-10", hubspot_owner_id: "26405238" },
  { id: "59021364629", dealname: "Prueba - inicial", amount: 0, closedate: "2026-04-09", hubspot_owner_id: "320958987" },
  { id: "58254621570", dealname: "Point Group - 24 al 26 de abril cabina de fotos - mesa interactiva - grabadora laser - 3 días de servicio - CDMX", amount: 163636, closedate: "2026-04-09", hubspot_owner_id: "618845046" },
  { id: "58902532166", dealname: "360media - Juego interactivo 18 y 19 de abril - 2 días de servicio - CDMX", amount: 55620, closedate: "2026-04-08", hubspot_owner_id: "618845046" },
  { id: "58798279812", dealname: "bungaloo - 23 y 24 de Abril, Meta Humans - Dax o Eddison, 2 días de servicio en Playa del Carmen", amount: 94040, closedate: "2026-04-08", hubspot_owner_id: "26395721" },
  { id: "58986164113", dealname: "playergroupmx.com - 23 de abril 2026 - graffiti wall - 1 día de servicio - CDMX", amount: 49560, closedate: "2026-04-08", hubspot_owner_id: "618845046" },
  { id: "58332183587", dealname: "eventoslum.com - 11 de abril 2026 - audiobook - 1 día de servicio - CDMX", amount: 7380, closedate: "2026-04-08", hubspot_owner_id: "618845046" },
  { id: "57021647489", dealname: "thequietagency - sin fecha definida - Cabina MDF y Ipadbooth - 1 día de servicio - CDMX", amount: 37320, closedate: "2026-04-08", hubspot_owner_id: "618845046" },
  { id: "58986229886", dealname: "bosch-hcgroup.com - 18/junio/2026 - Pantalla de LED, Esferas, Super Kick, Atrapa Balones, Digital Print, Photo AI, DJ Booth, Tarjetas - 1 día de servicio - GDL", amount: 333000, closedate: "2026-04-08", hubspot_owner_id: "414692018" },
  { id: "58638223127", dealname: "Point Group - Caminadora Magic Screen", amount: 58500, closedate: "2026-04-08", hubspot_owner_id: "618845046" },
  { id: "58295312676", dealname: "Taste MKT - 29 abril, 2026, Batak de Pared, 1 día de servicio en MTY", amount: 55180, closedate: "2026-04-08", hubspot_owner_id: "26395721" },
  { id: "57865212005", dealname: "Esmarketing México - 11 abril - batak - 1 día de servicio - CDMX", amount: 20680, closedate: "2026-04-08", hubspot_owner_id: "618845046" },
  { id: "58474783746", dealname: "sernaproducciones.com - 29 de abril - Futbolito virtual y futbol de carritos minis - 1 día de servicio - CDMX", amount: 62350, closedate: "2026-04-08", hubspot_owner_id: "618845046" },
  { id: "58902387275", dealname: "Imagic Group - 13/abril/2026 - Atlas - 1 día de servicio - CDMX", amount: 8000, closedate: "2026-04-08", hubspot_owner_id: "414692018" },
  { id: "58754571276", dealname: "bungaloo - 16, 21, 30 abril, 2026 y 05 al 06 de mayo, 2026, Juego de Reflejos, 5 días de servicio en CDMX", amount: 101000, closedate: "2026-04-08", hubspot_owner_id: "26395721" },
  { id: "58437593666", dealname: "MERCADORAMA - 16 de abril - holograma - 1 día de servicio - CDMX", amount: 41880, closedate: "2026-04-07", hubspot_owner_id: "618845046" },
  { id: "58798433321", dealname: "Parque Tepeyac - 10 abril - sub soccer - 1 día - Parque Tepeyac CDMX", amount: 15660, closedate: "2026-04-07", hubspot_owner_id: "80956812" },
  { id: "58798300481", dealname: "ACHE - DAY - Inicio: 22 de Abril, 2026, Desarrollo de juego interactivo online en landing page dedicada", amount: 111500, closedate: "2026-04-07", hubspot_owner_id: "26395721" },
  { id: "58630700456", dealname: "playergroupmx.com - Video 180, 1 día de servicio en CDMX", amount: 43820, closedate: "2026-04-07", hubspot_owner_id: "26395721" },
  { id: "56289630015", dealname: "FCO Group - 26/abril/2026 - Calidoscopio - 1 día de servicio - CDMX", amount: 21600, closedate: "2026-04-06", hubspot_owner_id: "414692018" },
  { id: "36153548866", dealname: "Photobooth | San Miguel Allende", amount: 15900, closedate: "2026-04-06", hubspot_owner_id: "618845046" },
  { id: "58630606623", dealname: "LKD - 15/abril/2026 - Sketch Booth - 1 día de servicio - CDMX", amount: 25980, closedate: "2026-04-06", hubspot_owner_id: "414692018" },
  { id: "47172416308", dealname: "La Ibero - Taller innovación educativa - 28 mayo - Meta Human y Sketchbooth - 1 día - Santa Fe CDMX", amount: 42900, closedate: "2026-04-06", hubspot_owner_id: "80956812" },
  { id: "58634266519", dealname: "PájaroPiedra | 8 y 9 mayo | 2 días | CDMX", amount: 62320, closedate: "2026-04-01", hubspot_owner_id: "88208161" },
  { id: "58630696761", dealname: "bungaloo - 17 y 18 de Abril, 2026, Robot Sketch Booth en Mazatlán por 2 días", amount: 99600, closedate: "2026-04-01", hubspot_owner_id: "26395721" },
  { id: "58599266836", dealname: "Privado - 04/abril/2026 - Photobooth con Impresión - 1 día de servicio - CDMX", amount: 12220, closedate: "2026-04-01", hubspot_owner_id: "414692018" },
  { id: "58630663547", dealname: "Instituto Ovalle Monday - 30/abril/2026 - Megafutbolito - 1 día de servicio - CDMX", amount: 12800, closedate: "2026-04-01", hubspot_owner_id: "414692018" },
];

// ─── GENERAR PROYECTOS DESDE HUBSPOT ABRIL 2026 ─────────────
// Todos los proyectos entran como "pendiente" con $0 costos — el PM los llena.

export const MOCK_PROJECTS: (Project & { financials: ProjectFinancials })[] = HUBSPOT_DEALS_ABRIL_2026.map((deal, idx) => {
  const vendedor = OWNER_TO_USER[deal.hubspot_owner_id] || { id: "u2", name: "Pricila Dominguez" };
  const pm = PM_POOL[idx % PM_POOL.length];
  const product = extractProduct(deal.dealname);
  const financials = generateEmptyFinancials(deal.id, deal.amount);
  const dias_para_evento = computeDiasParaEvento(deal.closedate);

  const fecha_limite_pago = (() => {
    const d = new Date(deal.closedate + "T00:00:00");
    d.setDate(d.getDate() - 5);
    return d.toISOString().split("T")[0];
  })();

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
    status: "pendiente" as const,
    payment_status: "pendiente" as const,
    created_at: deal.closedate,
    hubspot_deal_id: deal.id,
    financials,
    anticipo_requerido: Math.round(deal.amount * 0.5),
    anticipo_pagado: false,
    fecha_limite_pago,
    presupuesto_confirmado: false,
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
