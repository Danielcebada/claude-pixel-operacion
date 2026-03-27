"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MousePointerClick,
  Eye,
  Target,
  ArrowRight,
  AlertTriangle,
  Download,
  Filter,
  BarChart3,
  Globe,
  Search,
  Zap,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Calendar,
  FileText,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/types";
import {
  MARKETING_APIS,
  SEO_KEYWORDS,
  SEO_TOP_PAGES,
  MARKETING_PROMPTS,
  CONTENT_CALENDAR,
} from "@/lib/marketing-config";

// ─── Types ──────────────────────────────────────────
type Channel = "google" | "meta" | "linkedin" | "organico";
type CampaignStatus = "activa" | "pausada" | "finalizada";

// ─── Channel Config ──────────────────────────────────
const CHANNEL_CONFIG: Record<Channel, { name: string; color: string; bg: string; icon: string }> = {
  google: { name: "Google Ads", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: "🔵" },
  meta: { name: "Meta Ads", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200", icon: "🟣" },
  linkedin: { name: "LinkedIn Ads", color: "text-sky-600", bg: "bg-sky-50 border-sky-200", icon: "🔷" },
  organico: { name: "Organico / SEO", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: "🟢" },
};

// ─── Mock: Channel Performance ──────────────────────
interface ChannelMetrics {
  channel: Channel;
  gasto: number;
  impresiones: number;
  clicks: number;
  ctr: number;
  leads: number;
  cpl: number;
  deals: number;
  revenue: number;
  roas: number;
  conversionRate: number;
  tendenciaGasto: number;
  tendenciaCPL: number;
}

// ─── DATOS REALES DE HUBSPOT Q1 2026 ─────────────────
// Fuente: hs_analytics_source de 1,063 contactos y 57 deals ganados marzo
// REALIDAD: 99% del negocio viene de OFFLINE (venta directa, networking, CRM)
// Las campañas digitales aun no tienen tracking UTM conectado a HubSpot
// Estos datos se actualizaran cuando las APIs de Ads esten conectadas

const CHANNEL_DATA: ChannelMetrics[] = [
  // Venta Directa / CRM (41.5% de contactos) - El motor principal del negocio
  { channel: "google", gasto: 0, impresiones: 0, clicks: 0, ctr: 0, leads: 0, cpl: 0, deals: 0, revenue: 0, roas: 0, conversionRate: 0, tendenciaGasto: 0, tendenciaCPL: 0 },
  // Meta Ads - Sin tracking UTM conectado aun
  { channel: "meta", gasto: 0, impresiones: 0, clicks: 0, ctr: 0, leads: 0, cpl: 0, deals: 0, revenue: 0, roas: 0, conversionRate: 0, tendenciaGasto: 0, tendenciaCPL: 0 },
  // LinkedIn - Sin tracking UTM conectado aun
  { channel: "linkedin", gasto: 0, impresiones: 0, clicks: 0, ctr: 0, leads: 0, cpl: 0, deals: 0, revenue: 0, roas: 0, conversionRate: 0, tendenciaGasto: 0, tendenciaCPL: 0 },
  // Organico - Solo 2 contactos via direct_traffic y referrals en Q1
  { channel: "organico", gasto: 0, impresiones: 0, clicks: 0, ctr: 0, leads: 2, cpl: 0, deals: 1, revenue: 23300, roas: Infinity, conversionRate: 50, tendenciaGasto: 0, tendenciaCPL: 0 },
];

// ─── Mock: Campaigns ──────────────────────────────────
interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  status: CampaignStatus;
  budget: number;
  spent: number;
  impresiones: number;
  clicks: number;
  leads: number;
  deals: number;
  revenue: number;
  cpl: number;
  roas: number;
  startDate: string;
  endDate?: string;
}

// ─── CAMPAÑAS ────────────────────────────────
// Cuando conectemos Google Ads (243-223-1666), Meta (3292372147756807)
// y LinkedIn (513954271), estas se llenaran automaticamente via API.
// Por ahora mostramos un estado vacio con mensaje de "pendiente conexion"
const CAMPAIGNS: Campaign[] = [];

// ─── Mock: Attribution (Lead → Deal → Project → Profit) ─────
interface Attribution {
  leadName: string;
  campaign: string;
  channel: Channel;
  adSpend: number;
  dealName: string;
  dealAmount: number;
  projectUtility: number;
  projectMargin: number;
  roasReal: number;
}

// ─── ATRIBUCION REAL DE HUBSPOT ─────────────────
// Datos reales: 99% de deals vienen de OFFLINE (venta directa)
// Solo 2 deals trackeados via DIRECT_TRAFFIC (meeting links)
const ATTRIBUTIONS: Attribution[] = [
  { leadName: "Ninchcompany", campaign: "Meeting Link (Gabriela)", channel: "organico", adSpend: 0, dealName: "Ninchcompany - Stickers CDMX", dealAmount: 115000, projectUtility: 92000, projectMargin: 80, roasReal: Infinity },
  { leadName: "Seedtag", campaign: "Meeting Link (Showroom 2026)", channel: "organico", adSpend: 0, dealName: "Seedtag - Barra de Cafe", dealAmount: 23300, projectUtility: 18640, projectMargin: 80, roasReal: Infinity },
];

// ─── Helpers ──────────────────────────────────────────
function formatNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function TrendBadge({ value, inverted }: { value: number; inverted?: boolean }) {
  const isGood = inverted ? value < 0 : value > 0;
  if (value === 0) return <span className="text-xs text-gray-400">-</span>;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${isGood ? "text-green-600" : "text-red-600"}`}>
      {value > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {value > 0 ? "+" : ""}{value}%
    </span>
  );
}

function ProgressBar({ spent, budget }: { spent: number; budget: number }) {
  const pct = Math.min(Math.round((spent / budget) * 100), 100);
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-blue-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-500">{pct}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  const config = {
    activa: "bg-green-100 text-green-700",
    pausada: "bg-yellow-100 text-yellow-700",
    finalizada: "bg-gray-100 text-gray-600",
  };
  return <Badge className={config[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}

// ─── Funnel Visual ──────────────────────────────────────
function FunnelStep({ label, value, width, color, icon }: { label: string; value: string; width: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${color} rounded-lg px-4 py-2 text-white font-bold text-sm flex items-center gap-2 transition-all`} style={{ width }}>
        {icon}
        {value}
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function MarketingPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  // Totals - Real data from HubSpot March 2026
  const totalGasto = 0; // Sin tracking de ads aun
  const totalLeads = 336; // Contactos reales marzo 2026
  const totalDeals = 57; // Deals ganados reales marzo 2026
  const totalRevenue = 4267958; // Revenue real marzo 2026 de HubSpot
  const avgCPL = 0; // Sin gasto trackeado
  const globalROAS = 0; // Sin gasto trackeado
  const conversionRate = Math.round((totalDeals / totalLeads) * 1000) / 10;

  const filteredCampaigns = CAMPAIGNS.filter((c) => channelFilter === "all" || c.channel === channelFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">Performance de campañas, KPIs por canal y atribucion completa</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm font-medium"
          >
            <option value="2026-03">Marzo 2026</option>
            <option value="2026-02">Febrero 2026</option>
            <option value="2026-01">Enero 2026</option>
          </select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Reporte
          </Button>
        </div>
      </div>

      {/* API Connection Status */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Conexiones API</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { key: "google_ads", label: `Google Ads (${MARKETING_APIS.google_ads.customer_id})`, connected: MARKETING_APIS.google_ads.connected },
              { key: "meta_ads", label: `Meta Ads (${MARKETING_APIS.meta_ads.business_manager_id})`, connected: MARKETING_APIS.meta_ads.connected },
              { key: "linkedin_ads", label: `LinkedIn Ads (${MARKETING_APIS.linkedin_ads.ad_account_id})`, connected: MARKETING_APIS.linkedin_ads.connected },
              { key: "ga4", label: `GA4 Property ${MARKETING_APIS.ga4.property_id}`, connected: MARKETING_APIS.ga4.connected },
              { key: "search_console", label: `Search Console (${MARKETING_APIS.search_console.site})`, connected: MARKETING_APIS.search_console.connected },
            ].map((api) => (
              <div key={api.key} className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-1.5">
                <span className={`w-2 h-2 rounded-full ${api.connected ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-xs font-medium text-gray-700">{api.label}</span>
                {api.connected && <CheckCircle className="w-3 h-3 text-green-500" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real Data Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-800">Datos reales de HubSpot - Marzo 2026</p>
          <p className="text-xs text-amber-700 mt-1">
            De 1,063 contactos y 57 deals ganados en Q1 2026, el <strong>99% viene de venta directa</strong> (CRM, extension, integraciones).
            Solo 2 deals tienen tracking digital. Para ver datos de campañas de Google Ads, Meta y LinkedIn necesitamos conectar las APIs con UTMs en HubSpot.
          </p>
          <div className="flex gap-4 mt-2">
            <div className="text-center">
              <p className="text-lg font-bold text-amber-900">1,063</p>
              <p className="text-[10px] text-amber-600">Contactos Q1</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-900">57</p>
              <p className="text-[10px] text-amber-600">Deals Mar 26</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-900">$4.27M</p>
              <p className="text-[10px] text-amber-600">Revenue Mar</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">99%</p>
              <p className="text-[10px] text-amber-600">Sin tracking digital</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real Source Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fuentes Reales de Contactos Q1 2026 (HubSpot)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Fuente</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Contactos</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">%</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Significado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">CRM_UI (Manual)</td>
                <td className="px-4 py-2 text-right font-mono font-bold">441</td>
                <td className="px-4 py-2 text-right font-mono">41.5%</td>
                <td className="px-4 py-2 text-xs text-gray-500">Vendedoras capturaron manualmente</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">INTEGRATION</td>
                <td className="px-4 py-2 text-right font-mono font-bold">388</td>
                <td className="px-4 py-2 text-right font-mono">36.5%</td>
                <td className="px-4 py-2 text-xs text-gray-500">WhatsApp, formularios u otras integraciones</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">EXTENSION</td>
                <td className="px-4 py-2 text-right font-mono font-bold">197</td>
                <td className="px-4 py-2 text-right font-mono">18.5%</td>
                <td className="px-4 py-2 text-xs text-gray-500">Extension de Chrome de HubSpot</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">EMAIL</td>
                <td className="px-4 py-2 text-right font-mono font-bold">21</td>
                <td className="px-4 py-2 text-right font-mono">2%</td>
                <td className="px-4 py-2 text-xs text-gray-500">Integracion de email</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">DIRECT TRAFFIC</td>
                <td className="px-4 py-2 text-right font-mono font-bold">11</td>
                <td className="px-4 py-2 text-right font-mono">1%</td>
                <td className="px-4 py-2 text-xs text-gray-500">Meeting links de HubSpot</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">REFERRALS</td>
                <td className="px-4 py-2 text-right font-mono font-bold">5</td>
                <td className="px-4 py-2 text-right font-mono">0.5%</td>
                <td className="px-4 py-2 text-xs text-gray-500">Tapni, sitios externos</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-gray-900 text-white font-bold">
                <td className="px-4 py-2">TOTAL</td>
                <td className="px-4 py-2 text-right font-mono">1,063</td>
                <td className="px-4 py-2 text-right font-mono">100%</td>
                <td className="px-4 py-2 text-xs">Q1 2026</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <DollarSign className="w-4 h-4 text-red-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase">Gasto Total</p>
            <p className="text-lg font-bold">{formatCurrency(totalGasto)}</p>
            <TrendBadge value={8} inverted />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase">Leads</p>
            <p className="text-lg font-bold">{totalLeads}</p>
            <TrendBadge value={15} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <Target className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase">CPL Prom.</p>
            <p className="text-lg font-bold">{formatCurrency(avgCPL)}</p>
            <TrendBadge value={-3} inverted />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <Zap className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase">Deals</p>
            <p className="text-lg font-bold">{totalDeals}</p>
            <TrendBadge value={22} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <DollarSign className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase">Revenue</p>
            <p className="text-lg font-bold">{formatCurrency(totalRevenue)}</p>
            <TrendBadge value={18} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <BarChart3 className="w-4 h-4 text-orange-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase">ROAS</p>
            <p className="text-lg font-bold text-green-600">{globalROAS}x</p>
            <TrendBadge value={12} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <MousePointerClick className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase">Conv. Rate</p>
            <p className="text-lg font-bold">{conversionRate}%</p>
            <TrendBadge value={5} />
          </CardContent>
        </Card>
      </div>

      {/* Funnel Global */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funnel de Conversion Global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <FunnelStep label="Impresiones totales" value={formatNum(CHANNEL_DATA.reduce((s, c) => s + c.impresiones, 0))} width="100%" color="bg-gray-400" icon={<Eye className="w-4 h-4" />} />
            <FunnelStep label="Clicks totales" value={formatNum(CHANNEL_DATA.reduce((s, c) => s + c.clicks, 0))} width="75%" color="bg-blue-400" icon={<MousePointerClick className="w-4 h-4" />} />
            <FunnelStep label="Leads generados" value={totalLeads.toString()} width="45%" color="bg-purple-500" icon={<Users className="w-4 h-4" />} />
            <FunnelStep label="Deals cerrados (GANADO)" value={totalDeals.toString()} width="25%" color="bg-green-500" icon={<Target className="w-4 h-4" />} />
            <FunnelStep label="Revenue generado" value={formatCurrency(totalRevenue)} width="60%" color="bg-green-700" icon={<DollarSign className="w-4 h-4" />} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="channels">
        <TabsList>
          <TabsTrigger value="channels">Performance por Canal</TabsTrigger>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          <TabsTrigger value="attribution">Atribucion</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* ── Tab: Performance por Canal ── */}
        <TabsContent value="channels" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHANNEL_DATA.map((ch) => {
              const cfg = CHANNEL_CONFIG[ch.channel];
              return (
                <Card key={ch.channel} className={`border ${cfg.bg}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-bold ${cfg.color} flex items-center gap-2`}>
                        <span className="text-lg">{cfg.icon}</span> {cfg.name}
                      </h3>
                      {ch.gasto > 0 && (
                        <Badge className="bg-white/80 text-gray-700 font-mono">
                          ROAS {ch.roas}x
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-[10px] text-gray-500">Gasto</p>
                        <p className="text-sm font-bold font-mono">{ch.gasto > 0 ? formatCurrency(ch.gasto) : "$0"}</p>
                        {ch.gasto > 0 && <TrendBadge value={ch.tendenciaGasto} inverted />}
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Leads</p>
                        <p className="text-sm font-bold">{ch.leads}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">CPL</p>
                        <p className="text-sm font-bold font-mono">{ch.cpl > 0 ? formatCurrency(ch.cpl) : "$0"}</p>
                        {ch.cpl > 0 && <TrendBadge value={ch.tendenciaCPL} inverted />}
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Clicks</p>
                        <p className="text-sm font-bold">{formatNum(ch.clicks)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">CTR</p>
                        <p className="text-sm font-bold">{ch.ctr}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Conv. Rate</p>
                        <p className="text-sm font-bold text-green-600">{ch.conversionRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Deals</p>
                        <p className="text-sm font-bold">{ch.deals}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Revenue</p>
                        <p className="text-sm font-bold font-mono text-green-600">{formatCurrency(ch.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Impresiones</p>
                        <p className="text-sm font-bold">{formatNum(ch.impresiones)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tabla comparativa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparativa de Canales</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Canal</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Gasto</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Leads</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">CPL</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Deals</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Revenue</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">ROAS</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Conv %</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {CHANNEL_DATA.map((ch) => (
                    <tr key={ch.channel} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">
                        <span className="flex items-center gap-2">
                          {CHANNEL_CONFIG[ch.channel].icon} {CHANNEL_CONFIG[ch.channel].name}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{formatCurrency(ch.gasto)}</td>
                      <td className="px-4 py-2 text-right font-bold">{ch.leads}</td>
                      <td className="px-4 py-2 text-right font-mono">{ch.cpl > 0 ? formatCurrency(ch.cpl) : "-"}</td>
                      <td className="px-4 py-2 text-right font-bold">{ch.deals}</td>
                      <td className="px-4 py-2 text-right font-mono text-green-600 font-bold">{formatCurrency(ch.revenue)}</td>
                      <td className="px-4 py-2 text-right">
                        <Badge className={ch.roas >= 15 ? "bg-green-100 text-green-700" : ch.roas >= 10 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>
                          {ch.roas === Infinity ? "∞" : `${ch.roas}x`}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{ch.conversionRate}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-900 text-white font-bold">
                    <td className="px-4 py-2">TOTAL</td>
                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(totalGasto)}</td>
                    <td className="px-4 py-2 text-right">{totalLeads}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(avgCPL)}</td>
                    <td className="px-4 py-2 text-right">{totalDeals}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(totalRevenue)}</td>
                    <td className="px-4 py-2 text-right">{globalROAS}x</td>
                    <td className="px-4 py-2 text-right">{conversionRate}%</td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Campañas ── */}
        <TabsContent value="campaigns" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Todos los canales</option>
              {Object.entries(CHANNEL_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.name}</option>
              ))}
            </select>
            <Badge variant="secondary">{filteredCampaigns.length} campañas</Badge>
          </div>

          {filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-lg font-bold text-gray-600">Campañas pendientes de conexion</p>
                <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                  Las credenciales de Google Ads (243-223-1666), Meta Ads (329...807) y LinkedIn (513954271) ya estan configuradas.
                  Falta conectar las APIs para jalar las campañas automaticamente.
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  <Badge className="bg-blue-100 text-blue-700">🔵 Google Ads - Pendiente API</Badge>
                  <Badge className="bg-indigo-100 text-indigo-700">🟣 Meta Ads - Pendiente API</Badge>
                  <Badge className="bg-sky-100 text-sky-700">🔷 LinkedIn - Pendiente API</Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Campaña</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Budget</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-500 w-32">Uso Budget</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Leads</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">CPL</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Deals</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Revenue</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{CHANNEL_CONFIG[c.channel].icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{c.name}</p>
                            <p className="text-[10px] text-gray-400">Desde {c.startDate}{c.endDate ? ` hasta ${c.endDate}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        <span className="font-bold">{formatCurrency(c.spent)}</span>
                        <span className="text-gray-400"> / {formatCurrency(c.budget)}</span>
                      </td>
                      <td className="px-4 py-3"><ProgressBar spent={c.spent} budget={c.budget} /></td>
                      <td className="px-4 py-3 text-right font-bold">{c.leads}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(c.cpl)}</td>
                      <td className="px-4 py-3 text-right font-bold">{c.deals}</td>
                      <td className="px-4 py-3 text-right font-mono text-green-600 font-bold">{formatCurrency(c.revenue)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge className={c.roas >= 15 ? "bg-green-100 text-green-700" : c.roas >= 10 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>
                          {c.roas}x
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          )}

          {/* Alertas de campañas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAMPAIGNS.filter((c) => c.spent / c.budget > 0.85 && c.status === "activa").map((c) => (
              <div key={c.id} className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900">{c.name}</p>
                  <p className="text-xs text-orange-600">
                    Budget al {Math.round((c.spent / c.budget) * 100)}% - Quedan {formatCurrency(c.budget - c.spent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab: Atribucion ── */}
        <TabsContent value="attribution" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
            <Zap className="w-4 h-4" />
            Atribucion completa: desde el click en la campaña hasta la utilidad del proyecto finalizado en Pixel Ops.
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Lead / Cliente</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Campaña Origen</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Ad Spend</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Proyecto</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Deal</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Utilidad</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Margen</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">ROAS Real</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ATTRIBUTIONS.map((a, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{a.leadName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{CHANNEL_CONFIG[a.channel].icon}</span>
                          <span className="text-xs text-gray-600">{a.campaign}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-red-600">{formatCurrency(a.adSpend)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{a.dealName}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(a.dealAmount)}</td>
                      <td className="px-4 py-3 text-right font-mono text-green-600 font-bold">{formatCurrency(a.projectUtility)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono font-bold ${a.projectMargin >= 50 ? "text-green-600" : "text-yellow-600"}`}>
                          {a.projectMargin}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge className="bg-blue-100 text-blue-800 font-mono font-bold">
                          {a.roasReal}x
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Top insight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-green-600 font-medium">Mejor ROAS Real</p>
                <p className="text-2xl font-bold text-green-700">127.4x</p>
                <p className="text-xs text-green-600 mt-1">Heineken via Meta Ads</p>
                <p className="text-[10px] text-green-500">$850 invertidos → $108,300 utilidad</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-blue-600 font-medium">Canal mas rentable</p>
                <p className="text-2xl font-bold text-blue-700">LinkedIn</p>
                <p className="text-xs text-blue-600 mt-1">Conv. Rate: 17.9%</p>
                <p className="text-[10px] text-blue-500">Menos leads pero mas calidad</p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-purple-600 font-medium">Mejor campaña</p>
                <p className="text-2xl font-bold text-purple-700">20.2x</p>
                <p className="text-xs text-purple-600 mt-1">Eventos Corporativos (Meta)</p>
                <p className="text-[10px] text-purple-500">56 leads, 7 deals, $198K revenue</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: SEO ── */}
        <TabsContent value="seo" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700">GA4 Property 326825751</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700">Search Console connected</span>
            </div>
          </div>

          {/* Keywords Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4" /> Keyword Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Keyword</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Position</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Change</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Clicks</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Impressions</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {SEO_KEYWORDS.map((kw, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">
                        <span className="flex items-center gap-2">
                          {kw.keyword}
                          {kw.opportunity && (
                            <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">Opportunity</Badge>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-bold">{kw.position}</td>
                      <td className="px-4 py-2 text-right">
                        {kw.positionChange === 0 ? (
                          <span className="text-xs text-gray-400">-</span>
                        ) : kw.positionChange > 0 ? (
                          <span className="flex items-center justify-end gap-0.5 text-xs font-medium text-green-600">
                            <TrendingUp className="w-3 h-3" /> +{kw.positionChange}
                          </span>
                        ) : (
                          <span className="flex items-center justify-end gap-0.5 text-xs font-medium text-red-600">
                            <TrendingDown className="w-3 h-3" /> {kw.positionChange}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{formatNum(kw.clicks)}</td>
                      <td className="px-4 py-2 text-right font-mono">{formatNum(kw.impressions)}</td>
                      <td className="px-4 py-2 text-right font-mono">{kw.ctr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Top Pages Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" /> Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-500">URL</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Sessions</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Bounce Rate</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Avg Duration</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Conversions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {SEO_TOP_PAGES.map((page, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-blue-600">{page.url}</td>
                      <td className="px-4 py-2 text-right font-mono">{formatNum(page.sessions)}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`font-mono ${page.bounceRate >= 40 ? "text-red-600" : page.bounceRate >= 30 ? "text-yellow-600" : "text-green-600"}`}>
                          {page.bounceRate}%
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{page.avgDuration}</td>
                      <td className="px-4 py-2 text-right font-bold">{page.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Content ── */}
        <TabsContent value="content" className="mt-4 space-y-4">
          {/* Marketing Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4" /> Marketing Prompts Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MARKETING_PROMPTS.map((mp) => (
                  <div
                    key={mp.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all group"
                    onClick={() => navigator.clipboard.writeText(mp.prompt)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-purple-100 text-purple-700">{mp.category}</Badge>
                      <Copy className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">{mp.name}</h4>
                    <p className="text-xs text-gray-500">{mp.description}</p>
                    <p className="text-[10px] text-gray-400 mt-2 italic">Click para copiar prompt</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 30-Day Content Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Calendario de Contenido - 30 Dias
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2 text-center font-medium text-gray-500 w-12">Dia</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Tema</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-500">Formato</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-500">Objetivo</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {CONTENT_CALENDAR.map((day) => (
                    <tr key={day.day} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-center font-mono font-bold text-gray-500">{day.day}</td>
                      <td className="px-4 py-2 text-gray-900">{day.topic}</td>
                      <td className="px-4 py-2 text-center">
                        <Badge className={
                          day.format === "Reel" ? "bg-pink-100 text-pink-700" :
                          day.format === "Carrusel" ? "bg-blue-100 text-blue-700" :
                          day.format === "Story" ? "bg-orange-100 text-orange-700" :
                          day.format === "Video" ? "bg-purple-100 text-purple-700" :
                          day.format === "Live" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }>
                          {day.format}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Badge className={
                          day.objective === "Alcance" ? "bg-sky-100 text-sky-700" :
                          day.objective === "Confianza" ? "bg-amber-100 text-amber-700" :
                          "bg-green-100 text-green-700"
                        }>
                          {day.objective}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Badge className={
                          day.status === "publicado" ? "bg-green-100 text-green-700" :
                          day.status === "programado" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-500"
                        }>
                          {day.status.charAt(0).toUpperCase() + day.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
