"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  FileText,
  BarChart3,
  Search,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, computeProfitability } from "@/lib/types";
import { MOCK_PROJECTS, MOCK_USERS } from "@/lib/mock-data";
import { PRODUCTS_CATALOG } from "@/lib/products-catalog";
import { CALENDAR_EVENTS, getWeeklyProjection } from "@/lib/calendar-ops";
import { INVENTORY, searchInventory, type InventoryItem } from "@/lib/inventory-data";

// ─── Mock HubSpot data (replaces removed hubspot-deals / hubspot-products imports) ──

interface HubspotDeal {
  id: string;
  dealname: string;
  amount: number;
  closedate: string;
  owner_name: string;
}

const MARZO_DEALS: HubspotDeal[] = [];

function getMarzoAnalytics() {
  return {
    totalRevenue: 0,
    totalDeals: 0,
    avgTicket: 0,
    byVendor: [] as { name: string; deals: number; revenue: number; avg: number; pct: number }[],
    byWeek: [] as { week: string; deals: number; revenue: number }[],
    topDeals: [] as HubspotDeal[],
  };
}

// ─── Types ───────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  table?: TableData;
}

interface TableData {
  headers: string[];
  rows: string[][];
  footer?: string[];
}

// ─── Helpers ─────────────────────────────────────────────────

const fmt = (n: number) => formatCurrency(n, "MXN");

function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q)) return true;
  // Also match partial segments
  const parts = q.split(/\s+/);
  return parts.every((p) => t.includes(p));
}

function fuzzyNameMatch(name: string, query: string): boolean {
  const n = name.toLowerCase();
  const q = query.toLowerCase();
  if (n.includes(q)) return true;
  // Match first part of each name
  const nameParts = n.split(/\s+/);
  return nameParts.some((p) => p.startsWith(q));
}

function getMonthProjects(month: number, year: number) {
  return MOCK_PROJECTS.filter((p) => {
    const d = new Date(p.event_date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
}

function getProjectsWithProfit() {
  return MOCK_PROJECTS.map((p) => {
    const prof = computeProfitability(p.financials);
    return { ...p, ...prof };
  });
}

// Find which vendedor name a query refers to
function findVendedor(q: string): string | null {
  const map: Record<string, string> = {
    pris: "Pricila Dominguez",
    pricila: "Pricila Dominguez",
    gabriela: "Gabriela Gutierrez",
    gaby: "Gabriela Gutierrez",
    daniel: "Daniel Cebada",
    maria: "Maria Gaytan",
    mar: "Maria Gaytan",
    gaytan: "Maria Gaytan",
    roxana: "Roxana Mendoza",
    erick: "Erick Jimenez",
    harol: "Harol Sanchez",
  };
  for (const [key, val] of Object.entries(map)) {
    if (q.includes(key)) return val;
  }
  return null;
}

// Find PM by query
function findPM(q: string): string | null {
  const map: Record<string, string> = {
    joyce: "Joyce Perez",
    oscar: "Oscar Andrade",
    alvaro: "Alvaro Solis",
    joel: "Joel Rivera",
    eduardo: "Eduardo Martinez",
    lalo: "Eduardo Martinez",
    diana: "Diana Lopez",
    ivan: "Ivan Torres",
  };
  for (const [key, val] of Object.entries(map)) {
    if (q.includes(key)) return val;
  }
  return null;
}

// ─── Main AI Engine ──────────────────────────────────────────

// ─── Inventory helpers ───────────────────────────────────────

// Specific product keywords (should trigger inventory lookup)
const INVENTORY_KEYWORDS = [
  "booth",
  "mdf",
  "mirror booth",
  "airmirror",
  "glambot",
  "pixel claw",
  "garrita",
  "holograma",
  "impresora",
  "batak",
  "oculus",
  "multiball",
  "salsa booth",
  "sketch",
  "drawme",
  "cotton candy",
  "snowboard",
  "simulador",
  "totem",
  "mesa interactiva",
  "mosaico",
  "multicamara",
  "starlink",
  "sense step",
  "vogue",
  "neon room",
  "graffiti wall",
  "tattoo machine",
  "reconocimiento facial",
  "inventario",
  "stock",
];

// Context words that, COMBINED with a product hint, trigger inventory
const INVENTORY_CONTEXT = [
  "disponibilidad",
  "disponible",
  "cuantos tenemos",
  "cuanto tenemos",
  "hay de",
  "cuantos hay",
];

// Product hints for combined context matching
const PRODUCT_HINTS = [
  "booth", "360", "mdf", "glambot", "photobooth", "photo booth",
  "vr", "mirror", "holograma", "impresora", "batak", "multiball",
  "pantalla", "totem", "mesa interactiva", "simulador", "oculus",
  "sketch", "drawme", "cotton candy", "snowboard", "starlink",
  "graffiti", "tattoo", "mosaico", "claw", "garrita",
];

function isInventoryQuery(q: string): boolean {
  // Direct product keyword hit
  if (INVENTORY_KEYWORDS.some((kw) => q.includes(kw))) return true;
  // Context word + product hint combination
  if (INVENTORY_CONTEXT.some((c) => q.includes(c))) {
    return PRODUCT_HINTS.some((p) => q.includes(p));
  }
  return false;
}

function inventoryStatusEmoji(estado: string): string {
  const e = estado.toLowerCase();
  if (!estado) return "";
  if (e.includes("optimo") || e.includes("óptimo")) return "✅";
  if (e.includes("mantenimiento")) return "🛠️";
  if (e.includes("fuera")) return "❌";
  if (e.includes("pendiente")) return "⏳";
  if (e.includes("funcional")) return "🟡";
  if (e.includes("mejora")) return "🟢";
  return "ℹ️";
}

function extractInventorySearchTerm(q: string): string {
  const noiseWords = [
    "cuantos",
    "cuanto",
    "tenemos",
    "hay",
    "de",
    "disponibilidad",
    "disponible",
    "disponibles",
    "stock",
    "inventario",
    "equipo",
    "equipos",
    "el",
    "la",
    "los",
    "las",
    "un",
    "una",
    "unos",
    "unas",
    "que",
    "cual",
    "cuales",
    "existen",
    "existe",
    "quedan",
    "queda",
    "?",
    "¿",
    "!",
    "¡",
    ".",
    ",",
  ];
  let s = q;
  for (const w of noiseWords) {
    s = s.replace(new RegExp(`\\b${w}\\b`, "g"), " ");
  }
  return s.replace(/\s+/g, " ").trim();
}

function findInventoryMatches(q: string): InventoryItem[] {
  const term = extractInventorySearchTerm(q);
  // Try multi-token search first
  if (term.length > 1) {
    const direct = searchInventory(term);
    if (direct.length > 0) return direct;
  }
  // Fall back to token-by-token matching, aggregating unique results
  const tokens = term.split(/\s+/).filter((t) => t.length >= 3);
  const seen = new Set<string>();
  const results: InventoryItem[] = [];
  for (const tk of tokens) {
    const hits = searchInventory(tk);
    for (const item of hits) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        results.push(item);
      }
    }
  }
  // Also try keyword-based matches like "photo" -> "Photobooth"
  if (results.length === 0) {
    const keywordMap: Record<string, string> = {
      booth: "booth",
      photo: "photobooth",
      mdf: "mdf",
      mirror: "mirror",
      glambot: "glambot",
      glam: "glambot",
      claw: "pixel claw",
      garrita: "pixel claw",
      holograma: "holograma",
      impresora: "impresora",
      batak: "batak",
      oculus: "oculus",
      vr: "vr",
      "360": "360",
      tattoo: "tattoo",
      coffee: "coffee",
      totem: "totem",
      robot: "robot",
    };
    for (const [kw, mapped] of Object.entries(keywordMap)) {
      if (q.includes(kw)) {
        const hits = searchInventory(mapped);
        for (const item of hits) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            results.push(item);
          }
        }
      }
    }
  }
  return results;
}

function handleInventoryQuery(
  input: string,
  q: string
): { content: string; table?: TableData } {
  const matches = findInventoryMatches(q);
  const term = extractInventorySearchTerm(q) || input.trim();

  if (matches.length === 0) {
    // Suggest similar types
    const availableTypes = Array.from(
      new Set(INVENTORY.map((i) => i.type).filter((t) => t && t.length > 0 && !t.startsWith("{")))
    ).slice(0, 12);
    return {
      content:
        `No encontre equipos que coincidan con "${term}".\n\n` +
        `**Tipos de equipo disponibles:**\n` +
        availableTypes.map((t) => `- ${t}`).join("\n") +
        `\n\nIntenta: "photobooth MDF", "360 XL", "glambot", "holograma", "batak", "impresora".`,
    };
  }

  // Build a rich textual response (cap at 8 items to keep it readable)
  const top = matches.slice(0, 8);
  const totalExistentes = matches.reduce((s, m) => s + m.existentes, 0);
  const totalDisponibles = matches.reduce((s, m) => s + m.disponibles, 0);
  const totalMantenimiento = matches.reduce((s, m) => s + m.mantenimiento, 0);
  const totalFuera = matches.reduce((s, m) => s + m.fuera_servicio, 0);

  const lines: string[] = [];
  lines.push(`Encontre **${matches.length}** resultado(s) para "${term}":`);
  lines.push("");

  for (const item of top) {
    const emoji = inventoryStatusEmoji(item.estado);
    const estadoLine = item.estado ? `Estado: ${emoji} ${item.estado}` : "Estado: (sin datos)";
    lines.push(`📦 **${item.name} (x${item.existentes})**`);
    const typeLine = item.type && !item.type.startsWith("{") ? `   Tipo: ${item.type}` : "";
    if (typeLine) lines.push(typeLine);
    lines.push(
      `   Existentes: ${item.existentes} | Disponibles: ${item.disponibles} | Mantenimiento: ${item.mantenimiento} | Fuera: ${item.fuera_servicio}`
    );
    lines.push(`   ${estadoLine}`);
    if (item.ultima_revision) {
      lines.push(`   Ultima revision: ${item.ultima_revision}`);
    }
    if (item.imagen) {
      const firstImg = item.imagen.split(",")[0].trim();
      lines.push(`   Imagen: ${firstImg}`);
    }
    lines.push(`   [Ver en Monday](${item.monday_url})`);
    lines.push("");
  }

  if (matches.length > top.length) {
    lines.push(`_...y ${matches.length - top.length} resultado(s) mas en la tabla._`);
    lines.push("");
  }

  lines.push(
    `**Totales:** Existentes ${totalExistentes} | Disponibles ${totalDisponibles} | Mantenimiento ${totalMantenimiento} | Fuera ${totalFuera}`
  );

  const table: TableData = {
    headers: ["Equipo", "Tipo", "Exist.", "Disp.", "Mant.", "Fuera", "Estado", "Monday"],
    rows: matches.map((m) => [
      m.name,
      m.type && !m.type.startsWith("{") ? m.type : "-",
      m.existentes.toString(),
      m.disponibles.toString(),
      m.mantenimiento.toString(),
      m.fuera_servicio.toString(),
      m.estado || "-",
      m.monday_url,
    ]),
    footer: [
      "TOTAL",
      `${matches.length} equipo(s)`,
      totalExistentes.toString(),
      totalDisponibles.toString(),
      totalMantenimiento.toString(),
      totalFuera.toString(),
      "",
      "",
    ],
  };

  return { content: lines.join("\n"), table };
}

function processMessage(input: string): { content: string; table?: TableData } {
  const q = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const allProjects = getProjectsWithProfit();
  const marzoProjects = getMonthProjects(3, 2026);
  const analytics = getMarzoAnalytics();

  // ──────────────────────────────────────────────────────────
  // INVENTORY LOOKUP (priority handler)
  // ──────────────────────────────────────────────────────────
  if (isInventoryQuery(q)) {
    return handleInventoryQuery(input, q);
  }

  // ──────────────────────────────────────────────────────────
  // GREETINGS & HELP
  // ──────────────────────────────────────────────────────────
  if (/^(hola|hey|hi|buenas|que tal|buenos dias|buenas tardes|saludos)/.test(q)) {
    return {
      content:
        "Hola! Soy **Pixel Ops AI**, tu asistente inteligente. Puedo ayudarte con:\n\n" +
        "- **Proyectos**: cuantos hay, por PM, status, rentabilidad\n" +
        "- **Finanzas**: utilidad, gastos, viaticos, comisiones\n" +
        "- **Ventas/HubSpot**: deals ganados, por vendedor, fuentes\n" +
        "- **Productos**: precios, busqueda, cotizaciones\n" +
        "- **Calendario**: eventos de la semana, cash necesario\n" +
        "- **Cotizaciones**: suma de productos por dias\n\n" +
        "Preguntame lo que necesites!",
    };
  }

  if (/^(ayuda|help|que puedes|que sabes|commands|comandos)/.test(q)) {
    return {
      content:
        "Aqui van algunos ejemplos de lo que puedo responder:\n\n" +
        "**Proyectos:** cuantos proyectos tenemos en marzo? / cual es el mas rentable? / proyectos de Joyce / proyectos pendientes\n" +
        "**Finanzas:** utilidad total del mes / cuanto gastamos en viaticos / ticket promedio / cuanto debemos cobrar\n" +
        "**Ventas:** cuanto vendio Pricila / cuantos deals ganamos / mejor vendedor / de donde vienen los deals\n" +
        "**Productos:** cuanto cuesta iPad Booth / productos mas vendidos / buscar [nombre]\n" +
        "**Calendario:** eventos esta semana / cash necesario / eventos foraneos\n" +
        "**Cotizar:** cotizacion de 360 + Coffee Print para 2 dias",
    };
  }

  // ──────────────────────────────────────────────────────────
  // PROJECTS - Count by month
  // ──────────────────────────────────────────────────────────
  if ((q.includes("cuantos proyecto") || q.includes("numero de proyecto") || q.includes("total de proyecto")) &&
    (q.includes("mes") || q.includes("marzo") || q.includes("este"))) {
    const mar = getMonthProjects(3, 2026);
    const feb = getMonthProjects(2, 2026);
    const ene = getMonthProjects(1, 2026);
    const byStatus = {
      operado: mar.filter((p) => p.status === "operado").length,
      en_produccion: mar.filter((p) => p.status === "en_operacion").length,
      pendiente: mar.filter((p) => p.status === "pendiente").length,
    };
    return {
      content:
        `**Proyectos Q1 2026:**\n\n` +
        `- Enero: **${ene.length}** proyectos\n` +
        `- Febrero: **${feb.length}** proyectos\n` +
        `- Marzo: **${mar.length}** proyectos\n\n` +
        `**Marzo por status:**\n` +
        `- Operados: ${byStatus.operado}\n` +
        `- En produccion: ${byStatus.en_produccion}\n` +
        `- Pendientes: ${byStatus.pendiente}`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // PROJECTS - Most profitable
  // ──────────────────────────────────────────────────────────
  if ((q.includes("mas rentable") || q.includes("mejor margen") || q.includes("mayor utilidad")) && (q.includes("proyecto") || q.includes("deal"))) {
    const sorted = allProjects
      .filter((p) => p.utilidad_total > 0)
      .sort((a, b) => b.pct_utilidad - a.pct_utilidad)
      .slice(0, 10);
    return {
      content: "**Top 10 proyectos mas rentables (Q1 2026):**",
      table: {
        headers: ["Proyecto", "Venta", "Utilidad", "Margen"],
        rows: sorted.map((p) => [
          p.deal_name.substring(0, 40),
          fmt(p.financials.venta_real || p.financials.venta_presupuesto),
          fmt(p.utilidad_total),
          `${p.pct_utilidad}%`,
        ]),
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // PROJECTS - By PM
  // ──────────────────────────────────────────────────────────
  const pmQuery = findPM(q);
  if (pmQuery && (q.includes("proyecto") || q.includes("cuantos") || q.includes("tiene") || q.includes("asignado"))) {
    const pmProjects = allProjects.filter((p) => p.pm_name === pmQuery);
    const marPm = pmProjects.filter((p) => {
      const d = new Date(p.event_date);
      return d.getMonth() + 1 === 3 && d.getFullYear() === 2026;
    });
    return {
      content:
        `**${pmQuery}** tiene **${pmProjects.length}** proyectos en total (Q1 2026).\n` +
        `En marzo: **${marPm.length}** proyectos.\n\n` +
        `Por status en marzo:` +
        `\n- Operados: ${marPm.filter((p) => p.status === "operado").length}` +
        `\n- En produccion: ${marPm.filter((p) => p.status === "en_operacion").length}` +
        `\n- Pendientes: ${marPm.filter((p) => p.status === "pendiente").length}`,
      table: {
        headers: ["Proyecto", "Producto", "Status", "Venta"],
        rows: marPm.slice(0, 15).map((p) => [
          p.deal_name.substring(0, 35),
          p.product_type,
          p.status,
          fmt(p.financials.venta_presupuesto),
        ]),
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // PROJECTS - By status
  // ──────────────────────────────────────────────────────────
  if (q.includes("pendiente") && (q.includes("proyecto") || q.includes("cuales") || q.includes("cuantos"))) {
    const pending = allProjects.filter((p) => p.status === "pendiente");
    const totalVenta = pending.reduce((s, p) => s + p.financials.venta_presupuesto, 0);
    return {
      content: `Hay **${pending.length}** proyectos pendientes con venta presupuestada total de **${fmt(totalVenta)}**.`,
      table: {
        headers: ["Proyecto", "Vendedor", "PM", "Venta"],
        rows: pending.slice(0, 15).map((p) => [
          p.deal_name.substring(0, 35),
          p.vendedor_name || "",
          p.pm_name || "",
          fmt(p.financials.venta_presupuesto),
        ]),
        footer: ["TOTAL", `${pending.length} proyectos`, "", fmt(totalVenta)],
      },
    };
  }

  if (q.includes("produccion") && (q.includes("proyecto") || q.includes("cuales") || q.includes("cuantos") || q.includes("estan en"))) {
    const inProd = allProjects.filter((p) => p.status === "en_operacion");
    const totalVenta = inProd.reduce((s, p) => s + p.financials.venta_presupuesto, 0);
    return {
      content: `Hay **${inProd.length}** proyectos en produccion con venta presupuestada total de **${fmt(totalVenta)}**.`,
      table: {
        headers: ["Proyecto", "Vendedor", "PM", "Venta"],
        rows: inProd.slice(0, 15).map((p) => [
          p.deal_name.substring(0, 35),
          p.vendedor_name || "",
          p.pm_name || "",
          fmt(p.financials.venta_presupuesto),
        ]),
        footer: ["TOTAL", `${inProd.length} proyectos`, "", fmt(totalVenta)],
      },
    };
  }

  if ((q.includes("operado") || q.includes("terminado") || q.includes("cerrado")) && (q.includes("proyecto") || q.includes("cuales") || q.includes("cuantos"))) {
    const operated = allProjects.filter((p) => p.status === "operado");
    return {
      content: `Hay **${operated.length}** proyectos operados en Q1 2026.`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // PROJECTS - Average margin
  // ──────────────────────────────────────────────────────────
  if (q.includes("margen promedio") || q.includes("margen medio")) {
    const marOps = allProjects.filter((p) => {
      const d = new Date(p.event_date);
      return d.getMonth() + 1 === 3 && d.getFullYear() === 2026 && p.pct_utilidad > 0;
    });
    const avgMargin = marOps.length > 0 ? Math.round(marOps.reduce((s, p) => s + p.pct_utilidad, 0) / marOps.length * 100) / 100 : 0;
    return {
      content: `El **margen promedio en marzo** (proyectos operados) es de **${avgMargin}%**.`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // PROJECTS - By payment status (por cobrar)
  // ──────────────────────────────────────────────────────────
  if (q.includes("cobrar") || q.includes("por cobrar") || (q.includes("pago") && q.includes("pendiente"))) {
    const unpaid = allProjects.filter((p) => p.payment_status === "pendiente");
    const partial = allProjects.filter((p) => p.payment_status === "parcial");
    const unpaidTotal = unpaid.reduce((s, p) => s + p.financials.venta_presupuesto, 0);
    const partialTotal = partial.reduce((s, p) => s + Math.round(p.financials.venta_presupuesto * 0.5), 0);
    return {
      content:
        `**Cuentas por cobrar Q1 2026:**\n\n` +
        `- Pendientes de pago: **${unpaid.length}** proyectos = **${fmt(unpaidTotal)}**\n` +
        `- Pagos parciales: **${partial.length}** proyectos = ~**${fmt(partialTotal)}** restante\n` +
        `- **Total por cobrar: ${fmt(unpaidTotal + partialTotal)}**`,
      table: {
        headers: ["Proyecto", "Monto", "Status Pago"],
        rows: unpaid.slice(0, 12).map((p) => [
          p.deal_name.substring(0, 40),
          fmt(p.financials.venta_presupuesto),
          "Pendiente",
        ]),
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // PROJECT - Detail / resumen de proyecto
  // ──────────────────────────────────────────────────────────
  if (q.includes("resumen del proyecto") || q.includes("detalle del proyecto") || q.includes("dame el proyecto")) {
    const searchTerm = q.replace(/resumen del proyecto|detalle del proyecto|dame el proyecto/g, "").trim();
    if (searchTerm.length > 1) {
      const found = allProjects.find((p) => fuzzyMatch(p.deal_name, searchTerm));
      if (found) {
        const venta = found.financials.venta_real || found.financials.venta_presupuesto;
        return {
          content:
            `**${found.deal_name}**\n\n` +
            `- Vendedor: ${found.vendedor_name}\n` +
            `- PM: ${found.pm_name}\n` +
            `- Producto: ${found.product_type}\n` +
            `- Status: ${found.status}\n` +
            `- Pago: ${found.payment_status}\n` +
            `- Fecha: ${found.event_date}\n\n` +
            `**Financieros:**\n` +
            `- Venta: **${fmt(venta)}**\n` +
            `- Costos: ${fmt(found.financials.costos_real || found.financials.costos_presupuesto)}\n` +
            `- Gastos operativos: ${fmt(found.total_gastos_real || found.total_gastos_presupuesto)}\n` +
            `- Utilidad total: **${fmt(found.utilidad_total)}**\n` +
            `- Margen: **${found.pct_utilidad}%**`,
        };
      }
    }
  }

  // ──────────────────────────────────────────────────────────
  // FINANCIAL - Utilidad total del mes
  // ──────────────────────────────────────────────────────────
  if ((q.includes("utilidad") && (q.includes("total") || q.includes("mes") || q.includes("marzo"))) ||
    (q.includes("ganancia") && q.includes("mes"))) {
    const marProf = allProjects.filter((p) => {
      const d = new Date(p.event_date);
      return d.getMonth() + 1 === 3 && d.getFullYear() === 2026 && p.status === "operado";
    });
    const totalUtilidad = marProf.reduce((s, p) => s + p.utilidad_total, 0);
    const totalVenta = marProf.reduce((s, p) => s + (p.financials.venta_real || p.financials.venta_presupuesto), 0);
    const avgMargin = totalVenta > 0 ? Math.round((totalUtilidad / totalVenta) * 10000) / 100 : 0;
    return {
      content:
        `**Utilidad Marzo 2026** (proyectos operados):\n\n` +
        `- Proyectos operados: **${marProf.length}**\n` +
        `- Venta total: **${fmt(totalVenta)}**\n` +
        `- Utilidad total: **${fmt(totalUtilidad)}**\n` +
        `- Margen promedio: **${avgMargin}%**`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // FINANCIAL - Viaticos
  // ──────────────────────────────────────────────────────────
  if (q.includes("viatico") || q.includes("viaticos")) {
    const withViaticos = allProjects.filter((p) => p.financials.viaticos_venta > 0 || p.financials.viaticos_gasto > 0);
    const totalVenta = withViaticos.reduce((s, p) => s + p.financials.viaticos_venta, 0);
    const totalGasto = withViaticos.reduce((s, p) => s + p.financials.viaticos_gasto + p.financials.viaticos_uber, 0);
    const utilidad = totalVenta - totalGasto;
    return {
      content:
        `**Resumen de Viaticos Q1 2026:**\n\n` +
        `- Proyectos con viaticos: **${withViaticos.length}**\n` +
        `- Venta por viaticos: **${fmt(totalVenta)}**\n` +
        `- Gasto real: **${fmt(totalGasto)}**\n` +
        `- Utilidad viaticos: **${fmt(utilidad)}**`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // FINANCIAL - Ticket promedio
  // ──────────────────────────────────────────────────────────
  if (q.includes("ticket promedio") || q.includes("ticket medio")) {
    return {
      content:
        `**Ticket promedio Marzo 2026:**\n\n` +
        `- General: **${fmt(analytics.avgTicket)}**\n\n` +
        `**Por vendedor:**`,
      table: {
        headers: ["Vendedor", "Ticket Prom.", "Deals", "Revenue"],
        rows: analytics.byVendor.map((v) => [
          v.name,
          fmt(v.avg),
          v.deals.toString(),
          fmt(v.revenue),
        ]),
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // FINANCIAL - Comisiones
  // ──────────────────────────────────────────────────────────
  if (q.includes("comision") || q.includes("comisiones")) {
    const comisionRate = 0.05;
    const byVendor = analytics.byVendor.map((v) => ({
      name: v.name,
      revenue: v.revenue,
      comision: Math.round(v.revenue * comisionRate),
    }));
    const totalComisiones = byVendor.reduce((s, v) => s + v.comision, 0);
    return {
      content: `**Comisiones estimadas Marzo 2026** (5% sobre venta):`,
      table: {
        headers: ["Vendedor", "Venta", "Comision (5%)"],
        rows: byVendor.map((v) => [v.name, fmt(v.revenue), fmt(v.comision)]),
        footer: ["TOTAL", fmt(analytics.totalRevenue), fmt(totalComisiones)],
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // SALES - Cuanto vendio [vendedor]
  // ──────────────────────────────────────────────────────────
  const vendedorName = findVendedor(q);
  if (vendedorName && (q.includes("vend") || q.includes("cuanto") || q.includes("cerro") || q.includes("deals"))) {
    const vendor = analytics.byVendor.find((v) => v.name === vendedorName);
    if (vendor) {
      const deals = MARZO_DEALS.filter((d) => d.owner_name === vendedorName && d.amount > 100);
      return {
        content:
          `**${vendedorName}** en Marzo 2026:\n\n` +
          `- Deals ganados: **${vendor.deals}**\n` +
          `- Revenue total: **${fmt(vendor.revenue)}**\n` +
          `- Ticket promedio: **${fmt(vendor.avg)}**\n` +
          `- % del total: **${vendor.pct}%**`,
        table: {
          headers: ["Deal", "Monto", "Fecha"],
          rows: deals.map((d) => [
            d.dealname.substring(0, 42),
            fmt(d.amount),
            d.closedate,
          ]),
          footer: ["TOTAL", fmt(vendor.revenue), `${vendor.deals} deals`],
        },
      };
    }
  }

  // ──────────────────────────────────────────────────────────
  // SALES - Resumen ventas / resumen del mes
  // ──────────────────────────────────────────────────────────
  if ((q.includes("resumen") && (q.includes("venta") || q.includes("mes") || q.includes("marzo"))) ||
    (q.includes("ventas") && q.includes("marzo"))) {
    return {
      content:
        `**Resumen de Ventas - Marzo 2026**\n\n` +
        `- Revenue total: **${fmt(analytics.totalRevenue)}**\n` +
        `- Deals ganados: **${analytics.totalDeals}**\n` +
        `- Ticket promedio: **${fmt(analytics.avgTicket)}**\n\n` +
        `**Por vendedor:**`,
      table: {
        headers: ["Vendedor", "Deals", "Revenue", "%"],
        rows: analytics.byVendor.map((v) => [
          v.name,
          v.deals.toString(),
          fmt(v.revenue),
          `${v.pct}%`,
        ]),
        footer: ["TOTAL", analytics.totalDeals.toString(), fmt(analytics.totalRevenue), "100%"],
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // SALES - Deals ganados / esta semana
  // ──────────────────────────────────────────────────────────
  if ((q.includes("deal") || q.includes("ganamos") || q.includes("cerramos")) && (q.includes("marzo") || q.includes("mes"))) {
    return {
      content:
        `**Deals ganados Marzo 2026: ${analytics.totalDeals}**\n` +
        `Revenue total: **${fmt(analytics.totalRevenue)}**\n\n` +
        `**Por semana:**`,
      table: {
        headers: ["Semana", "Deals", "Revenue"],
        rows: analytics.byWeek.map((w) => [w.week, w.deals.toString(), fmt(w.revenue)]),
        footer: ["TOTAL", analytics.totalDeals.toString(), fmt(analytics.totalRevenue)],
      },
    };
  }

  if (q.includes("semana") && (q.includes("deal") || q.includes("ganamos") || q.includes("cerramos") || q.includes("ventas"))) {
    const thisWeek = MARZO_DEALS.filter((d) => d.closedate >= "2026-03-22" && d.amount > 100);
    const revenue = thisWeek.reduce((s, d) => s + d.amount, 0);
    return {
      content: `**Esta semana (22-26 marzo):** ${thisWeek.length} deals por **${fmt(revenue)}**`,
      table: {
        headers: ["Deal", "Vendedor", "Monto"],
        rows: thisWeek.map((d) => [d.dealname.substring(0, 40), d.owner_name, fmt(d.amount)]),
        footer: ["TOTAL", "", fmt(revenue)],
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // SALES - Best seller / mejor vendedor
  // ──────────────────────────────────────────────────────────
  if (q.includes("mejor vendedor") || q.includes("top vendedor") || q.includes("quien vende mas") || q.includes("ranking vendedor")) {
    const sorted = [...analytics.byVendor].sort((a, b) => b.revenue - a.revenue);
    return {
      content: `**Ranking de vendedores Marzo 2026:**\n\nEl mejor vendedor es **${sorted[0].name}** con **${fmt(sorted[0].revenue)}** (${sorted[0].deals} deals).`,
      table: {
        headers: ["#", "Vendedor", "Deals", "Revenue", "Ticket Prom."],
        rows: sorted.map((v, i) => [
          `${i + 1}`,
          v.name,
          v.deals.toString(),
          fmt(v.revenue),
          fmt(v.avg),
        ]),
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // SALES - New clients
  // ──────────────────────────────────────────────────────────
  if (q.includes("cliente") && (q.includes("nuevo") || q.includes("cuantos") || q.includes("unico"))) {
    const clients = new Set(MARZO_DEALS.filter((d) => d.amount > 100).map((d) => {
      const name = d.dealname.split(" - ")[0].split(" | ")[0].trim();
      return name;
    }));
    return {
      content: `En marzo 2026 tuvimos **${clients.size}** clientes unicos de ${analytics.totalDeals} deals ganados.`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // SALES - Source analysis
  // ──────────────────────────────────────────────────────────
  if (q.includes("fuente") || q.includes("source") || q.includes("de donde vienen") || q.includes("origen")) {
    return {
      content: "Los datos de fuentes de deals no estan disponibles en este momento. Consulta directamente HubSpot para ver el origen de los deals.",
    };
  }

  // ──────────────────────────────────────────────────────────
  // PRODUCTS - Price lookup
  // ──────────────────────────────────────────────────────────
  if (q.includes("cuanto cuesta") || q.includes("precio de") || q.includes("precio del")) {
    const searchTerm = q
      .replace(/cuanto cuesta|precio de|precio del|el|la|un|una|\?/g, "")
      .trim();
    if (searchTerm.length > 1) {
      const found = PRODUCTS_CATALOG.find((p) => fuzzyMatch(p.name, searchTerm));
      if (found) {
        return {
          content:
            `**${found.name}**\n\n` +
            `- Precio: **${fmt(found.unitPrice)}** / ${found.unit}\n` +
            `- Costo base: ${fmt(found.costBase)}\n` +
            `- Setup: ${found.hasSetup ? fmt(found.setupCost) : "N/A"}\n` +
            `- Categoria: ${found.category}\n` +
            `- ${found.description}`,
        };
      }
      return { content: `No encontre un producto con "${searchTerm}". Intenta con otro nombre.` };
    }
  }

  // ──────────────────────────────────────────────────────────
  // PRODUCTS - Most sold
  // ──────────────────────────────────────────────────────────
  if ((q.includes("producto") && (q.includes("vendido") || q.includes("popular") || q.includes("comun"))) ||
    q.includes("mas vendido")) {
    const productCount: Record<string, number> = {};
    MOCK_PROJECTS.forEach((p) => {
      productCount[p.product_type] = (productCount[p.product_type] || 0) + 1;
    });
    const sorted = Object.entries(productCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12);
    return {
      content: "**Productos mas vendidos Q1 2026:**",
      table: {
        headers: ["#", "Producto", "Proyectos"],
        rows: sorted.map(([name, count], i) => [`${i + 1}`, name, count.toString()]),
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // PRODUCTS - Search
  // ──────────────────────────────────────────────────────────
  if (q.includes("buscar producto") || q.includes("busca producto") || q.includes("producto llamado")) {
    const searchTerm = q.replace(/buscar producto|busca producto|producto llamado/g, "").trim();
    if (searchTerm.length > 1) {
      const results = PRODUCTS_CATALOG.filter((p) => fuzzyMatch(p.name, searchTerm)).slice(0, 10);
      if (results.length > 0) {
        return {
          content: `Encontre **${results.length}** productos con "${searchTerm}":`,
          table: {
            headers: ["Producto", "Precio/dia", "Costo", "Categoria"],
            rows: results.map((p) => [p.name, fmt(p.unitPrice), fmt(p.costBase), p.category]),
          },
        };
      }
      return { content: `No encontre productos con "${searchTerm}".` };
    }
  }

  // ──────────────────────────────────────────────────────────
  // PRODUCTS - Cost of high cost products
  // ──────────────────────────────────────────────────────────
  if (q.includes("producto") && (q.includes("costo") || q.includes("caro") || q.includes("alto"))) {
    const withCost = PRODUCTS_CATALOG.filter((p) => p.costBase > 0).sort((a, b) => b.costBase - a.costBase).slice(0, 10);
    return {
      content: "**Top 10 productos con mayor costo base:**",
      table: {
        headers: ["Producto", "Categoria", "Costo Base"],
        rows: withCost.map((p) => [
          p.name,
          p.category,
          fmt(p.costBase),
        ]),
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // COTIZACION - Generate quote
  // ──────────────────────────────────────────────────────────
  if (q.includes("cotiza") || q.includes("cotizacion") || q.includes("quote") ||
    (q.includes("cuanto sale") && q.includes("rentar"))) {
    const products: { name: string; price: number }[] = [];
    const diasMatch = q.match(/(\d+)\s*dia/);
    const numDias = diasMatch ? parseInt(diasMatch[1]) : 1;

    // Match products from the catalog
    const productKeywords: Record<string, string> = {
      "360": "Video 360",
      "green screen": "Green Screen",
      "ipad booth": "Ipad Booth Digital",
      "coffee print": "Coffee Print",
      "glam bot": "Glambot",
      "glambot": "Glambot",
      "mirror booth": "Mirror Booth",
      "photo booth": "Photo Booth",
      "sketch booth": "Sketch Booth",
      "batak": "Batak Tubular",
      "holograma": "Holograma",
      "meta human": "Meta Human",
      "vr": "VR Experience",
      "claw": "Pixel Claw",
      "garrita": "Pixel Claw",
      "tattoo": "Tattoo Print",
      "tatto": "Tattoo Print",
      "sense step": "Sense Step",
      "robot": "Robot Humanoide",
      "fortuna": "Rueda de la Fortuna",
      "speed test": "Pulse Challenge",
      "subsoccer": "Subsoccer",
      "totem": "Totem Interactivo",
      "cabina cerrada": "Cabina Cerrada con Ipad Booth",
      "bubblehead": "Bubblehead AI",
      "super kick": "Super Kick",
      "cotton candy": "Barra de Algodon",
      "credencial": "Credenciales AI",
    };

    for (const [keyword, productName] of Object.entries(productKeywords)) {
      if (q.includes(keyword)) {
        const catalogProduct = PRODUCTS_CATALOG.find((p) => fuzzyMatch(p.name, productName));
        if (catalogProduct) {
          products.push({
            name: catalogProduct.name,
            price: catalogProduct.unitPrice * numDias,
          });
        } else {
          // Fallback prices
          const fallbackPrices: Record<string, number> = {
            "Glambot": 18500, "Mirror Booth": 18500, "Photo Booth": 14600,
            "Green Screen": 22000, "Video 360": 14000, "Ipad Booth Digital": 14600,
            "Coffee Print": 16000, "Sketch Booth": 12000, "Batak Tubular": 8500,
            "Holograma": 45000, "Meta Human": 18000, "VR Experience": 25000,
            "Pixel Claw": 8000, "Tattoo Print": 12000, "Sense Step": 9000,
            "Robot Humanoide": 15000, "Rueda de la Fortuna": 8500,
            "Pulse Challenge": 9000, "Subsoccer": 6500, "Totem Interactivo": 15000,
            "Cabina Cerrada con Ipad Booth": 19200, "Bubblehead AI": 18000,
            "Super Kick": 9500, "Barra de Algodon": 12000, "Credenciales AI": 20000,
          };
          products.push({
            name: productName,
            price: (fallbackPrices[productName] || 15000) * numDias,
          });
        }
      }
    }

    if (products.length === 0) {
      return {
        content:
          "No encontre productos en tu mensaje. Puedes decirme que necesitas?\n\n" +
          "Ejemplo: **\"Cotizame Glam Bot + Mirror Booth para 3 dias\"**\n\n" +
          "Productos disponibles: Glam Bot, Mirror Booth, Photo Booth, Green Screen, 360, iPad Booth, " +
          "Coffee Print, Sketch Booth, Batak, Holograma, Meta Human, VR, Claw/Garrita, Tattoo Print, y mas.",
      };
    }

    const isForaneo = q.includes("gdl") || q.includes("mty") || q.includes("cancun") || q.includes("foraneo");
    const zona = isForaneo ? "Foraneo" : "CDMX";
    const subtotalProductos = products.reduce((s, p) => s + p.price, 0);
    const montaje = products.length * 2500;
    const transporte = isForaneo ? 12000 : 3500;
    const personal = 1800 * 2 * numDias;
    const internet = 125 * numDias;
    const subtotalOp = montaje + transporte + personal + internet;
    const total = subtotalProductos + subtotalOp;
    const costoEst = Math.round(total * 0.30);
    const utilidad = total - costoEst;
    const margen = Math.round((utilidad / total) * 100);

    const rows = products.map((p) => [p.name, `${numDias} dia(s)`, fmt(p.price)]);
    rows.push(["Montaje/Desmontaje", `${products.length} equipo(s)`, fmt(montaje)]);
    rows.push(["Transporte", zona, fmt(transporte)]);
    rows.push(["Personal (x2)", `${numDias} dia(s)`, fmt(personal)]);
    rows.push(["Internet", `${numDias} dia(s)`, fmt(internet)]);

    return {
      content:
        `**Cotizacion** - ${zona}, ${numDias} dia(s):\n\n` +
        `Precio sugerido: **${fmt(total)}** + IVA\n` +
        `Costo estimado: ${fmt(costoEst)}\n` +
        `Utilidad: **${fmt(utilidad)}** (${margen}%)`,
      table: {
        headers: ["Concepto", "Detalle", "Precio"],
        rows,
        footer: ["TOTAL", "", fmt(total)],
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // CALENDAR - Events this week
  // ──────────────────────────────────────────────────────────
  if ((q.includes("evento") || q.includes("calendario") || q.includes("agenda")) &&
    (q.includes("semana") || q.includes("esta") || q.includes("proxim"))) {
    const thisWeekEvents = CALENDAR_EVENTS.filter(
      (e) => e.startDate >= "2026-03-24" && e.startDate <= "2026-03-30"
    );
    const totalCash = thisWeekEvents.reduce((s, e) => s + e.cashNecesario, 0);
    return {
      content:
        `**Eventos esta semana (24-30 marzo):** ${thisWeekEvents.length} eventos\n` +
        `Cash necesario: **${fmt(totalCash)}**`,
      table: {
        headers: ["Evento", "PM", "Fecha", "Zona", "Cash"],
        rows: thisWeekEvents.map((e) => [
          e.cliente,
          e.pm,
          e.startDate,
          e.zona,
          fmt(e.cashNecesario),
        ]),
        footer: ["TOTAL", "", "", "", fmt(totalCash)],
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // CALENDAR - Cash necesario / proyeccion semanal
  // ──────────────────────────────────────────────────────────
  if (q.includes("cash") || q.includes("efectivo") || q.includes("proyeccion")) {
    const weeks = getWeeklyProjection();
    const totalCash = weeks.reduce((s, w) => s + w.totalCashNecesario, 0);
    return {
      content: `**Proyeccion de Cash Operativo:**\n\nTotal necesario: **${fmt(totalCash)}**`,
      table: {
        headers: ["Semana", "Eventos", "Deal Total", "Costo Op.", "Viaticos", "Cash"],
        rows: weeks.map((w) => [
          w.weekLabel,
          w.eventCount.toString(),
          fmt(w.totalDealAmount),
          fmt(w.totalCostoOperativo),
          fmt(w.totalViaticos),
          fmt(w.totalCashNecesario),
        ]),
        footer: [
          "TOTAL",
          weeks.reduce((s, w) => s + w.eventCount, 0).toString(),
          fmt(weeks.reduce((s, w) => s + w.totalDealAmount, 0)),
          fmt(weeks.reduce((s, w) => s + w.totalCostoOperativo, 0)),
          fmt(weeks.reduce((s, w) => s + w.totalViaticos, 0)),
          fmt(totalCash),
        ],
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // CALENDAR - Foraneo events
  // ──────────────────────────────────────────────────────────
  if (q.includes("foraneo") || q.includes("fuera de cdmx") || q.includes("evento foraneo")) {
    const foraneos = CALENDAR_EVENTS.filter((e) => e.zona === "Foraneo");
    const totalViaticos = foraneos.reduce((s, e) => s + e.viaticosEstimado, 0);
    return {
      content:
        `**Eventos foraneos:** ${foraneos.length} eventos\n` +
        `Viaticos estimados: **${fmt(totalViaticos)}**`,
      table: {
        headers: ["Cliente", "PM", "Producto", "Fecha", "Dias", "Viaticos"],
        rows: foraneos.map((e) => [
          e.cliente,
          e.pm,
          e.producto.substring(0, 25),
          e.startDate,
          e.dias.toString(),
          fmt(e.viaticosEstimado),
        ]),
        footer: ["TOTAL", "", "", "", "", fmt(totalViaticos)],
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // SALES - Top deals
  // ──────────────────────────────────────────────────────────
  if (q.includes("top deal") || q.includes("deal mas grande") || q.includes("deals mas grande")) {
    return {
      content: "**Top 10 deals mas grandes - Marzo 2026:**",
      table: {
        headers: ["Deal", "Vendedor", "Monto"],
        rows: analytics.topDeals.map((d) => [
          d.dealname.substring(0, 40),
          d.owner_name,
          fmt(d.amount),
        ]),
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // GLOBAL SEARCH - Fuzzy match across all data
  // ──────────────────────────────────────────────────────────
  const searchResults: { type: string; name: string; detail: string }[] = [];

  // Search projects
  allProjects.forEach((p) => {
    if (fuzzyMatch(p.deal_name, q) || fuzzyMatch(p.product_type, q)) {
      searchResults.push({
        type: "Proyecto",
        name: p.deal_name.substring(0, 45),
        detail: `${p.vendedor_name} | ${fmt(p.financials.venta_presupuesto)} | ${p.status}`,
      });
    }
  });

  // Search deals
  MARZO_DEALS.forEach((d) => {
    if (fuzzyMatch(d.dealname, q) && d.amount > 100) {
      if (!searchResults.some((r) => fuzzyMatch(r.name, d.dealname.substring(0, 30)))) {
        searchResults.push({
          type: "Deal HS",
          name: d.dealname.substring(0, 45),
          detail: `${d.owner_name} | ${fmt(d.amount)}`,
        });
      }
    }
  });

  // Search products
  PRODUCTS_CATALOG.forEach((p) => {
    if (fuzzyMatch(p.name, q)) {
      searchResults.push({
        type: "Producto",
        name: p.name,
        detail: `${fmt(p.unitPrice)}/${p.unit} | ${p.category}`,
      });
    }
  });

  // Search calendar
  CALENDAR_EVENTS.forEach((e) => {
    if (fuzzyMatch(e.cliente, q) || fuzzyMatch(e.producto, q) || fuzzyMatch(e.summary, q)) {
      searchResults.push({
        type: "Evento",
        name: `${e.cliente} - ${e.producto.substring(0, 25)}`,
        detail: `${e.startDate} | ${e.pm} | ${fmt(e.dealAmount)}`,
      });
    }
  });

  if (searchResults.length > 0) {
    return {
      content: `Encontre **${searchResults.length}** resultado(s) para "${input}":`,
      table: {
        headers: ["Tipo", "Nombre", "Detalle"],
        rows: searchResults.slice(0, 15).map((r) => [r.type, r.name, r.detail]),
      },
    };
  }

  // ──────────────────────────────────────────────────────────
  // DEFAULT FALLBACK
  // ──────────────────────────────────────────────────────────
  return {
    content:
      `No encontre resultados para "${input}".\n\n` +
      "Intenta preguntar sobre:\n" +
      "- **Proyectos**: cuantos, status, por PM, rentabilidad\n" +
      "- **Ventas**: cuanto vendio [nombre], resumen del mes, deals\n" +
      "- **Finanzas**: utilidad, viaticos, comisiones, ticket promedio\n" +
      "- **Productos**: cuanto cuesta [producto], mas vendidos\n" +
      "- **Calendario**: eventos esta semana, cash necesario\n" +
      "- **Cotizar**: cotizame [productos] para X dias",
  };
}

// ─── Quick Actions ───────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Resumen del mes", icon: BarChart3 },
  { label: "Cash necesario", icon: DollarSign },
  { label: "Proyectos pendientes", icon: FileText },
  { label: "Cotizar producto", icon: TrendingUp },
];

const SUGGESTIONS = [
  "Cuantos proyectos tenemos en marzo?",
  "Cual es el proyecto mas rentable?",
  "Cuanto vendio Gabriela este mes?",
  "Que eventos hay esta semana?",
  "Quien es el mejor vendedor?",
  "Cuanto cuesta el iPad Booth?",
  "Productos mas vendidos",
  "De donde vienen los deals?",
];

// ─── Component ───────────────────────────────────────────────

export function PixelChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hola! Soy **Pixel Ops AI**. Puedo consultar proyectos, ventas, finanzas, productos, calendario y generar cotizaciones. Que necesitas?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        await new Promise((r) => setTimeout(r, 300));

        let response: { content: string; table?: TableData };
        try {
          response = processMessage(userMsg.content);
        } catch (err) {
          console.error("Chat error:", err);
          response = {
            content:
              "Ups, algo fallo procesando tu pregunta. Intenta reformularla o escribe **ayuda** para ver que puedo hacer.",
          };
        }

        const assistantMsg: Message = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
          table: response.table,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping]
  );

  const handleSend = () => sendMessage(input);

  const copyTable = (table: TableData) => {
    const text = [
      table.headers.join("\t"),
      ...table.rows.map((r) => r.join("\t")),
      ...(table.footer ? [table.footer.join("\t")] : []),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied("table");
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Floating Button ──
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>
    );
  }

  // ── Chat Panel ──
  return (
    <div className="fixed bottom-6 right-6 w-[450px] h-[620px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">Pixel Ops AI</p>
            <p className="text-[10px] text-gray-400">Proyectos, ventas, finanzas, calendario</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[92%] ${msg.role === "user" ? "order-2" : ""}`}>
              <div
                className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === "user"
                      ? "bg-blue-600"
                      : "bg-gradient-to-br from-gray-700 to-gray-900"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3 h-3 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 text-white" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-md"
                      : "bg-gray-100 text-gray-800 rounded-tl-md"
                  }`}
                >
                  {msg.content.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-1" : ""}>
                      {line.split("**").map((part, j) =>
                        j % 2 === 1 ? (
                          <strong key={j} className="font-semibold">
                            {part}
                          </strong>
                        ) : (
                          <span key={j}>{part}</span>
                        )
                      )}
                    </p>
                  ))}
                </div>
              </div>

              {/* Table */}
              {msg.table && (
                <div className="mt-2 ml-8 border border-gray-200 rounded-xl overflow-hidden text-xs shadow-sm">
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-1.5 border-b">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      Datos
                    </span>
                    <button
                      onClick={() => copyTable(msg.table!)}
                      className="text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                    >
                      {copied === "table" ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span className="text-[10px]">
                        {copied === "table" ? "Copiado" : "Copiar"}
                      </span>
                    </button>
                  </div>
                  <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 sticky top-0">
                          {msg.table.headers.map((h, i) => (
                            <th
                              key={i}
                              className="px-2.5 py-1.5 text-left font-semibold text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {msg.table.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className="px-2.5 py-1.5 text-[11px] text-gray-700 whitespace-nowrap"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                      {msg.table.footer && (
                        <tfoot>
                          <tr className="bg-gray-900 text-white font-bold sticky bottom-0">
                            {msg.table.footer.map((cell, j) => (
                              <td key={j} className="px-2.5 py-1.5 text-[11px]">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions - show when few messages */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => sendMessage(action.label)}
                  className="flex items-center gap-1.5 text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg transition-colors font-medium border border-blue-100"
                >
                  <Icon className="w-3 h-3" />
                  {action.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1">
            {SUGGESTIONS.slice(0, 4).map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md transition-colors"
              >
                {s.substring(0, 40)}{s.length > 40 ? "..." : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 px-4 py-3 shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Pregunta sobre proyectos, ventas, productos..."
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 transition-all"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all hover:shadow-lg disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
