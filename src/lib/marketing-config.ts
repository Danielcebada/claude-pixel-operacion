// ─── API Credentials (stored server-side in production) ─────
export const MARKETING_APIS = {
  google_ads: {
    customer_id: "243-223-1666",
    oauth_client_id: "878036855440-joph9ssqi8rot7th999lpduf390emgqk.apps.googleusercontent.com",
    connected: true,
  },
  meta_ads: {
    business_manager_id: "3292372147756807",
    connected: true,
  },
  linkedin_ads: {
    ad_account_id: "513954271",
    connected: true,
  },
  ga4: {
    property_id: "326825751",
    connected: true,
  },
  search_console: {
    site: "digitalpixel.studio",
    connected: true,
  },
};

// ─── Marketing Prompts Library ──────────────────────
export interface MarketingPrompt {
  id: string;
  name: string;
  category: "contenido" | "copy" | "estrategia" | "ads" | "email";
  prompt: string;
  description: string;
}

export const MARKETING_PROMPTS: MarketingPrompt[] = [
  {
    id: "mp1",
    name: "Angulos de Contenido",
    category: "contenido",
    description: "Genera 10 angulos de contenido basados en dolor, deseo y curiosidad de tu audiencia",
    prompt: `Eres un experto en crecimiento en Redes. Mi nicho es tecnologia para los eventos de marketing. Dime exactamente con que lucha mi audiencia, que desea en secreto y que hace que se detengan a leer. Dame 10 angulos de contenido basados en eso. Se especifico, no generico.`,
  },
  {
    id: "mp2",
    name: "Ganchos para Scroll-Stop",
    category: "copy",
    description: "20 ganchos que detienen el scroll + ranking de los top 5",
    prompt: `Eres un copywriter experto en Redes. Mi tema es tecnologia en marketing, y presumir nuestra tech para que la rente. Escribe 20 ganchos que hagan que alguien se detenga mientras hace scroll. Sin clickbait. Sin relleno. Solo ganchos que generen curiosidad o desafien lo que la gente cree saber. Clasifica los 5 mejores y dime por que funcionan.`,
  },
  {
    id: "mp3",
    name: "Plan de Publicaciones 30 Dias",
    category: "estrategia",
    description: "Plan completo de 30 dias con tema, formato y objetivo por dia",
    prompt: `Eres un estratega de contenido para Redes. Crea un plan de publicaciones de 30 dias para mi nicho: marcas, agencias, tech, venta. Para cada dia dame el tema, el formato y un objetivo: alcance, confianza o ventas. Mantenlo lo suficientemente simple como para que cualquiera del equipo lo pueda ejecutar.`,
  },
];

// ─── SEO Mock Data ──────────────────────────────────
export interface SEOKeyword {
  keyword: string;
  position: number;
  positionChange: number;
  clicks: number;
  impressions: number;
  ctr: number;
  opportunity: boolean;
}

export const SEO_KEYWORDS: SEOKeyword[] = [
  { keyword: "renta de photobooth cdmx", position: 3, positionChange: 2, clicks: 245, impressions: 3200, ctr: 7.7, opportunity: false },
  { keyword: "photobooth para eventos", position: 5, positionChange: -1, clicks: 189, impressions: 4100, ctr: 4.6, opportunity: true },
  { keyword: "renta tecnologia eventos", position: 8, positionChange: 3, clicks: 112, impressions: 2800, ctr: 4.0, opportunity: true },
  { keyword: "360 booth mexico", position: 2, positionChange: 0, clicks: 320, impressions: 2100, ctr: 15.2, opportunity: false },
  { keyword: "holograma para eventos", position: 12, positionChange: -2, clicks: 45, impressions: 1900, ctr: 2.4, opportunity: true },
  { keyword: "coffee print evento", position: 4, positionChange: 1, clicks: 198, impressions: 2400, ctr: 8.3, opportunity: false },
  { keyword: "experiencias interactivas eventos", position: 6, positionChange: 4, clicks: 156, impressions: 3600, ctr: 4.3, opportunity: true },
  { keyword: "photo ai eventos", position: 15, positionChange: -3, clicks: 28, impressions: 1200, ctr: 2.3, opportunity: true },
  { keyword: "sketch booth renta", position: 1, positionChange: 0, clicks: 410, impressions: 1800, ctr: 22.8, opportunity: false },
  { keyword: "mirror booth cdmx", position: 4, positionChange: 1, clicks: 167, impressions: 2000, ctr: 8.4, opportunity: false },
  { keyword: "batak juego interactivo", position: 7, positionChange: 2, clicks: 89, impressions: 1500, ctr: 5.9, opportunity: true },
  { keyword: "vr para eventos corporativos", position: 18, positionChange: -5, clicks: 15, impressions: 980, ctr: 1.5, opportunity: true },
  { keyword: "activaciones btl tecnologia", position: 9, positionChange: 1, clicks: 78, impressions: 2200, ctr: 3.5, opportunity: true },
  { keyword: "pixel factory eventos", position: 1, positionChange: 0, clicks: 520, impressions: 1400, ctr: 37.1, opportunity: false },
  { keyword: "glambot renta", position: 3, positionChange: 2, clicks: 134, impressions: 900, ctr: 14.9, opportunity: false },
];

export interface SEOPage {
  url: string;
  sessions: number;
  bounceRate: number;
  avgDuration: string;
  conversions: number;
}

export const SEO_TOP_PAGES: SEOPage[] = [
  { url: "/", sessions: 4500, bounceRate: 35, avgDuration: "2:45", conversions: 89 },
  { url: "/productos/360-booth", sessions: 1200, bounceRate: 28, avgDuration: "3:12", conversions: 34 },
  { url: "/productos/photobooth", sessions: 980, bounceRate: 32, avgDuration: "2:58", conversions: 28 },
  { url: "/productos/sketch-booth", sessions: 870, bounceRate: 25, avgDuration: "3:45", conversions: 25 },
  { url: "/contacto", sessions: 750, bounceRate: 42, avgDuration: "1:30", conversions: 67 },
  { url: "/productos/coffee-print", sessions: 680, bounceRate: 30, avgDuration: "2:55", conversions: 19 },
  { url: "/productos/mirror-booth", sessions: 620, bounceRate: 29, avgDuration: "3:05", conversions: 18 },
  { url: "/blog", sessions: 550, bounceRate: 48, avgDuration: "4:20", conversions: 8 },
];

// ─── Content Calendar (30-day plan) ──────────────────
export interface ContentDay {
  day: number;
  topic: string;
  format: "Reel" | "Carrusel" | "Story" | "Post" | "Video" | "Live";
  objective: "Alcance" | "Confianza" | "Ventas";
  status: "publicado" | "programado" | "pendiente";
}

export const CONTENT_CALENDAR: ContentDay[] = [
  { day: 1, topic: "Behind the scenes: montaje de 360 Booth", format: "Reel", objective: "Alcance", status: "publicado" },
  { day: 2, topic: "3 errores al elegir tecnologia para tu evento", format: "Carrusel", objective: "Confianza", status: "publicado" },
  { day: 3, topic: "Caso de exito: Netflix con Green Screen", format: "Video", objective: "Ventas", status: "publicado" },
  { day: 4, topic: "Que es un Photo AI y por que lo necesitas", format: "Carrusel", objective: "Confianza", status: "publicado" },
  { day: 5, topic: "Timelapse de instalacion evento corporativo", format: "Reel", objective: "Alcance", status: "publicado" },
  { day: 6, topic: "Reaccion de invitados con Mirror Booth", format: "Reel", objective: "Alcance", status: "programado" },
  { day: 7, topic: "5 productos que transforman cualquier evento", format: "Carrusel", objective: "Ventas", status: "programado" },
  { day: 8, topic: "Preguntale a nuestro equipo (Q&A)", format: "Story", objective: "Confianza", status: "programado" },
  { day: 9, topic: "Antes vs Despues: evento sin tech vs con tech", format: "Reel", objective: "Ventas", status: "pendiente" },
  { day: 10, topic: "Tour por nuestro lab de innovacion", format: "Video", objective: "Confianza", status: "pendiente" },
  { day: 11, topic: "El ROI de la tecnologia en eventos (datos)", format: "Carrusel", objective: "Confianza", status: "pendiente" },
  { day: 12, topic: "Sketch Booth en accion: evento BMW", format: "Reel", objective: "Alcance", status: "pendiente" },
  { day: 13, topic: "Como elegir la tech correcta para tu evento", format: "Carrusel", objective: "Ventas", status: "pendiente" },
  { day: 14, topic: "Detras de camaras: equipo de produccion", format: "Story", objective: "Confianza", status: "pendiente" },
  { day: 15, topic: "Demo en vivo: Holograma XL", format: "Live", objective: "Alcance", status: "pendiente" },
  { day: 16, topic: "Tendencias tech para eventos 2026", format: "Carrusel", objective: "Confianza", status: "pendiente" },
  { day: 17, topic: "Reels compilado: mejores momentos del mes", format: "Reel", objective: "Alcance", status: "pendiente" },
  { day: 18, topic: "Caso de exito: AstraZeneca multi-tech", format: "Video", objective: "Ventas", status: "pendiente" },
  { day: 19, topic: "Mitos vs Realidad de activaciones BTL", format: "Carrusel", objective: "Confianza", status: "pendiente" },
  { day: 20, topic: "Packing y logistica para evento foraneo", format: "Reel", objective: "Alcance", status: "pendiente" },
  { day: 21, topic: "Cuanto cuesta rentar tecnologia? (transparencia)", format: "Post", objective: "Ventas", status: "pendiente" },
  { day: 22, topic: "Nuestros clientes opinan (testimoniales)", format: "Carrusel", objective: "Confianza", status: "pendiente" },
  { day: 23, topic: "Coffee Print: la experiencia mas instagrameable", format: "Reel", objective: "Alcance", status: "pendiente" },
  { day: 24, topic: "Guia: como presupuestar tech para tu evento", format: "Carrusel", objective: "Ventas", status: "pendiente" },
  { day: 25, topic: "Entrevista con PM: que pasa el dia del evento", format: "Video", objective: "Confianza", status: "pendiente" },
  { day: 26, topic: "Producto nuevo: revelacion", format: "Reel", objective: "Alcance", status: "pendiente" },
  { day: 27, topic: "Checklist para agencias antes de contratar", format: "Carrusel", objective: "Ventas", status: "pendiente" },
  { day: 28, topic: "Reel viral: reaccion con VR en evento", format: "Reel", objective: "Alcance", status: "pendiente" },
  { day: 29, topic: "Recap del mes: numeros y logros", format: "Carrusel", objective: "Confianza", status: "pendiente" },
  { day: 30, topic: "Que viene en abril: preview de innovacion", format: "Story", objective: "Alcance", status: "pendiente" },
];
