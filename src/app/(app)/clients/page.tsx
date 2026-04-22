"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/types";
import {
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  Crown,
  UserPlus,
  BarChart3,
  DollarSign,
  Hash,
  ArrowUpDown,
  ShieldAlert,
  Activity,
  Globe,
  ExternalLink,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type ClientType = "Nuevo" | "Recurrente" | "VIP";
type HealthScore = "green" | "yellow" | "red";
type SortField = "revenue" | "deals" | "contacts" | "ticketPromedio";

interface Client {
  id: string;
  company: string;
  domain: string;
  deals: number;
  contacts: number;
  revenue: number;
  owner: string;
}

// ─── Real HubSpot Data (Top 50 by num_associated_deals) ─────────────────────

const CLIENTS: Client[] = [
  { id: "742026656", company: "Primacía", domain: "primacia.com.mx", deals: 177, contacts: 17, revenue: 196000, owner: "Pricila Dominguez" },
  { id: "354406268", company: "ifahto", domain: "ifahto.com", deals: 152, contacts: 89, revenue: 202280, owner: "Pricila Dominguez" },
  { id: "755096115", company: "We Are Other People", domain: "otherpeople.com.mx", deals: 123, contacts: 45, revenue: 94300, owner: "Gabriela Gutierrez" },
  { id: "9482074431", company: "Wolfxp", domain: "wolfxp.mx", deals: 117, contacts: 31, revenue: 533468, owner: "Gabriela Gutierrez" },
  { id: "11054924961", company: "somospuntoyaparte.mx", domain: "somospuntoyaparte.mx", deals: 106, contacts: 11, revenue: 492300, owner: "Pricila Dominguez" },
  { id: "717370544", company: "Boxer TTL", domain: "boxerttl.com", deals: 104, contacts: 28, revenue: 0, owner: "Gabriela Gutierrez" },
  { id: "4177977187", company: "Epik Events", domain: "epik.com.mx", deals: 93, contacts: 46, revenue: 584850, owner: "Pricila Dominguez" },
  { id: "911099393", company: "Smile Pill", domain: "smilepill.mx", deals: 87, contacts: 30, revenue: 368900, owner: "Pricila Dominguez" },
  { id: "407893027", company: "Creatividad", domain: "creatividad.com", deals: 85, contacts: 33, revenue: 411600, owner: "Gabriela Gutierrez" },
  { id: "755461213", company: "IMC Comunicacion", domain: "imc-latam.com", deals: 80, contacts: 26, revenue: 131100, owner: "Gabriela Gutierrez" },
  { id: "403673405", company: "TOLKA Estudio", domain: "tolkaestudio.com", deals: 71, contacts: 5, revenue: 116500, owner: "Gabriela Gutierrez" },
  { id: "3862052419", company: "Grupo A+B", domain: "grupoamasb.mx", deals: 70, contacts: 49, revenue: 524910, owner: "Samuel Hernandez" },
  { id: "736377394", company: "TAO Publicidad", domain: "taopublicidad.com", deals: 60, contacts: 32, revenue: 293195, owner: "Gabriela Gutierrez" },
  { id: "510366450", company: "Desarrollos Creativos", domain: "desarrolloscreativos.com", deals: 59, contacts: 12, revenue: 170100, owner: "Pricila Dominguez" },
  { id: "4514257365", company: "Donostia", domain: "agenciadonostia.com", deals: 57, contacts: 11, revenue: 150500, owner: "Samuel Hernandez" },
  { id: "474547036", company: "Drive 360", domain: "drive-mx.com", deals: 56, contacts: 37, revenue: 378020, owner: "Pricila Dominguez" },
  { id: "3856639871", company: "Avanna", domain: "avanna.com.mx", deals: 56, contacts: 52, revenue: 60400, owner: "Gabriela Gutierrez" },
  { id: "704215761", company: "TwoEvento", domain: "twoevento.mx", deals: 54, contacts: 5, revenue: 116500, owner: "Pricila Dominguez" },
  { id: "1099275843", company: "Matraka", domain: "matraka.com.mx", deals: 52, contacts: 46, revenue: 201000, owner: "Pricila Dominguez" },
  { id: "3005122731", company: "FotoFlip", domain: "fotoflipmexico.com", deals: 51, contacts: 2, revenue: 36000, owner: "Pricila Dominguez" },
  { id: "482523673", company: "Global Corporations", domain: "global-corporations.com", deals: 49, contacts: 12, revenue: 436330, owner: "Maria Gaytan" },
  { id: "290844074", company: "Makken", domain: "makken.com.mx", deals: 49, contacts: 36, revenue: 81855, owner: "Pricila Dominguez" },
  { id: "846833518", company: "BACKYARD -WeMake-", domain: "backyard.com.mx", deals: 48, contacts: 11, revenue: 264933, owner: "Gabriela Gutierrez" },
  { id: "2032755959", company: "MKTPAGE", domain: "mktpage.com", deals: 48, contacts: 17, revenue: 156100, owner: "Pricila Dominguez" },
  { id: "10307895983", company: "Condé Nast México", domain: "condenast.com.mx", deals: 47, contacts: 22, revenue: 95400, owner: "Gabriela Gutierrez" },
  { id: "889353811", company: "CATORCE DÍAS", domain: "catorcedias.com", deals: 43, contacts: 30, revenue: 353400, owner: "Maria Gaytan" },
  { id: "454742673", company: "Gideas", domain: "gideas.com.mx", deals: 42, contacts: 47, revenue: 18800, owner: "Pricila Dominguez" },
  { id: "574721729", company: "KeySolutions", domain: "keysolutions.mx", deals: 40, contacts: 10, revenue: 56600, owner: "Gabriela Gutierrez" },
  { id: "2281945583", company: "Central Buzz", domain: "centralbuzz.com.mx", deals: 39, contacts: 25, revenue: 308800, owner: "Pricila Dominguez" },
  { id: "7792264597", company: "cheetahds.co", domain: "cheetahds.co", deals: 38, contacts: 2, revenue: 186590, owner: "Gabriela Gutierrez" },
  { id: "447436236", company: "Tierra de Ideas", domain: "tierradeideas.mx", deals: 36, contacts: 34, revenue: 136900, owner: "Pricila Dominguez" },
  { id: "16700852992", company: "Matatena Producciones", domain: "matatena.com", deals: 35, contacts: 21, revenue: 1878130, owner: "Gabriela Gutierrez" },
  { id: "730908489", company: "DOSHA", domain: "dosha.com.mx", deals: 35, contacts: 23, revenue: 0, owner: "Pricila Dominguez" },
  { id: "454986070", company: "ACHE", domain: "ache.ooo", deals: 35, contacts: 19, revenue: 26200, owner: "Pricila Dominguez" },
  { id: "461066262", company: "Keep In Touch", domain: "keepintouch.mx", deals: 34, contacts: 21, revenue: 187030, owner: "Pricila Dominguez" },
  { id: "8061683471", company: "colectivohype.com", domain: "colectivohype.com", deals: 34, contacts: 17, revenue: 374720, owner: "Pricila Dominguez" },
  { id: "904003328", company: "Monstermarketing", domain: "monstermarketing.com.mx", deals: 34, contacts: 10, revenue: 102455, owner: "Pricila Dominguez" },
  { id: "482649775", company: "NINJA*", domain: "ninja.com.mx", deals: 33, contacts: 27, revenue: 45000, owner: "Gabriela Gutierrez" },
  { id: "676324612", company: "Licuadora Group", domain: "licuadoragroup.com", deals: 32, contacts: 20, revenue: 0, owner: "Pricila Dominguez" },
  { id: "6330267008", company: "dalecandela.mx", domain: "dalecandela.mx", deals: 31, contacts: 17, revenue: 68000, owner: "Daniel Cebada" },
  { id: "8767000968", company: "CORAD Event Strategic", domain: "corad.com.mx", deals: 29, contacts: 23, revenue: 583350, owner: "Gabriela Gutierrez" },
  { id: "15121459523", company: "COLOüRS", domain: "colours.mx", deals: 29, contacts: 38, revenue: 145800, owner: "Gabriela Gutierrez" },
  { id: "15790419624", company: "tuspartners.mx", domain: "tuspartners.mx", deals: 28, contacts: 14, revenue: 240800, owner: "Samuel Hernandez" },
  { id: "474605659", company: "Igency", domain: "igency.mx", deals: 24, contacts: 23, revenue: 0, owner: "Gabriela Gutierrez" },
  { id: "729212771", company: "Totem", domain: "totem.mx", deals: 23, contacts: 14, revenue: 0, owner: "Maria Gaytan" },
  { id: "408801577", company: "Plot", domain: "plot.mx", deals: 21, contacts: 36, revenue: 0, owner: "Pricila Dominguez" },
  { id: "773854612", company: "Team", domain: "team.lat", deals: 16, contacts: 4, revenue: 0, owner: "Maria Gaytan" },
  { id: "620362166", company: "Business Travel Consulting", domain: "btcamericas.com", deals: 8, contacts: 12, revenue: 0, owner: "Gabriela Gutierrez" },
  { id: "22537681978", company: "MDM", domain: "maquinademercadotecnia.com", deals: 6, contacts: 7, revenue: 0, owner: "Maria Gaytan" },
  { id: "21749923186", company: "AstraZeneca", domain: "astrazeneca.com", deals: 5, contacts: 31, revenue: 0, owner: "Pricila Dominguez" },
];

// ─── Computed Helpers ─────────────────────────────────────────────────────────

function getClientType(client: Client): ClientType {
  if (client.deals >= 30 || client.revenue > 500_000) return "VIP";
  if (client.deals >= 10) return "Recurrente";
  return "Nuevo";
}

function getHealthScore(_client: Client): HealthScore {
  // All clients marked as "Activo" since we don't have lastActivityDate yet
  return "green";
}

function getTicketPromedio(client: Client): number {
  if (client.revenue <= 0 || client.deals <= 0) return 0;
  return Math.round(client.revenue / client.deals);
}

function getLTVScore(client: Client): number {
  const health = getHealthScore(client);
  const healthMultiplier = health === "green" ? 1.2 : health === "yellow" ? 1.0 : 0.7;
  const frequencyBonus = Math.min(client.deals * 2, 50);
  const revenueScore = Math.min(Math.round(client.revenue / 10_000), 50);
  return Math.round((revenueScore + frequencyBonus) * healthMultiplier);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ClientType, { color: string; bg: string; icon: typeof Star }> = {
  Nuevo: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: UserPlus },
  Recurrente: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Star },
  VIP: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Crown },
};

const HEALTH_CONFIG: Record<HealthScore, { label: string; color: string; bg: string; dot: string }> = {
  green: { label: "Activo", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  yellow: { label: "En riesgo", color: "text-yellow-700", bg: "bg-yellow-50", dot: "bg-yellow-500" },
  red: { label: "Inactivo", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
};

function ClientDetail({ client }: { client: Client }) {
  const ticketProm = getTicketPromedio(client);
  const health = getHealthScore(client);
  const healthCfg = HEALTH_CONFIG[health];
  const ltv = getLTVScore(client);
  const type = getClientType(client);
  const typeCfg = TYPE_CONFIG[type];
  const TypeIcon = typeCfg.icon;

  return (
    <div className="px-6 py-5 bg-gray-50 border-t space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Company Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Informacion de la Empresa
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="w-3.5 h-3.5" />
              <a
                href={`https://${client.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {client.domain}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-3.5 h-3.5" />
              <span>Vendedor: <strong>{client.owner}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-3.5 h-3.5" />
              <span>Contactos asociados: <strong>{client.contacts}</strong></span>
            </div>
          </div>
          {/* Health Score */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${healthCfg.bg}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${healthCfg.dot}`} />
            <span className={`text-xs font-medium ${healthCfg.color}`}>
              {healthCfg.label}
            </span>
          </div>
          {/* Type badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-lg border ${typeCfg.bg}`}>
            <TypeIcon className="w-3.5 h-3.5" />
            <span className={`text-xs font-medium ${typeCfg.color}`}>{type}</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Revenue Total</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(client.revenue)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide"># Deals</p>
            <p className="text-lg font-bold text-gray-900">{client.deals}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Ticket Promedio</p>
            <p className="text-lg font-bold text-gray-900">{ticketProm > 0 ? formatCurrency(ticketProm) : "-"}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">LTV Score</p>
            <p className="text-lg font-bold text-gray-900">{ltv}</p>
          </div>
        </div>

        {/* Contacts info */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Metricas
          </h4>
          <div className="bg-white rounded-lg p-4 border space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Deals totales</span>
              <span className="text-sm font-bold">{client.deals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Contactos asociados</span>
              <span className="text-sm font-bold">{client.contacts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Revenue total</span>
              <span className="text-sm font-bold">{formatCurrency(client.revenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Ticket promedio</span>
              <span className="text-sm font-bold">{ticketProm > 0 ? formatCurrency(ticketProm) : "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">HubSpot ID</span>
              <span className="text-xs font-mono text-gray-400">{client.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics ───────────────────────────────────────────────────────────────

function AnalyticsSection({ clients }: { clients: Client[] }) {
  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0);

  // Top 10 by revenue
  const top10 = [...clients]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  const top10MaxRevenue = top10.length > 0 ? top10[0].revenue : 1;

  // Distribution
  const byType = clients.reduce(
    (acc, c) => {
      const type = getClientType(c);
      acc[type].count += 1;
      acc[type].revenue += c.revenue;
      return acc;
    },
    {
      Nuevo: { count: 0, revenue: 0 },
      Recurrente: { count: 0, revenue: 0 },
      VIP: { count: 0, revenue: 0 },
    } as Record<ClientType, { count: number; revenue: number }>
  );

  // Concentration risk
  const concentrationAlerts = clients
    .filter((c) => totalRevenue > 0 && c.revenue / totalRevenue > 0.15)
    .sort((a, b) => b.revenue - a.revenue);

  // By owner
  const byOwner = clients.reduce(
    (acc, c) => {
      if (!acc[c.owner]) acc[c.owner] = { count: 0, revenue: 0, deals: 0 };
      acc[c.owner].count += 1;
      acc[c.owner].revenue += c.revenue;
      acc[c.owner].deals += c.deals;
      return acc;
    },
    {} as Record<string, { count: number; revenue: number; deals: number }>
  );
  const ownerEntries = Object.entries(byOwner).sort((a, b) => b[1].revenue - a[1].revenue);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" /> Analiticas de Clientes
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Revenue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Top 10 Clientes por Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {top10.map((c, i) => {
              const pct = top10MaxRevenue > 0 ? (c.revenue / top10MaxRevenue) * 100 : 0;
              const colors = [
                "bg-blue-500", "bg-blue-400", "bg-indigo-500", "bg-indigo-400", "bg-purple-500",
                "bg-purple-400", "bg-violet-500", "bg-violet-400", "bg-sky-500", "bg-sky-400",
              ];
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-5 text-right">{i + 1}</span>
                  <span className="text-sm font-medium text-gray-900 w-36 truncate">{c.company}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[i]} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-medium text-gray-700 w-24 text-right">
                    {formatCurrency(c.revenue)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" /> Distribucion por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["VIP", "Recurrente", "Nuevo"] as ClientType[]).map((type) => {
              const data = byType[type];
              const revPct = totalRevenue > 0 ? ((data.revenue / totalRevenue) * 100).toFixed(1) : "0";
              const countPct = clients.length > 0 ? ((data.count / clients.length) * 100).toFixed(0) : "0";
              const typeColors = { VIP: "bg-purple-500", Recurrente: "bg-amber-500", Nuevo: "bg-blue-500" };
              const TypeIcon = TYPE_CONFIG[type].icon;
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{type}</span>
                      <span className="text-xs text-gray-400">({data.count} clientes, {countPct}%)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{formatCurrency(data.revenue)}</span>
                      <span className="text-xs text-gray-400 ml-1">({revPct}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${typeColors[type]} rounded-full`}
                      style={{ width: `${revPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {/* Summary */}
            <div className="pt-3 border-t flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">{formatCurrency(totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Concentration Risk */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-600" /> Riesgo de Concentracion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {concentrationAlerts.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-orange-800">
                    {concentrationAlerts.length} cliente{concentrationAlerts.length > 1 ? "s" : ""} representa{concentrationAlerts.length > 1 ? "n" : ""} mas
                    del 15% del revenue total. Alta dependencia.
                  </p>
                </div>
                {concentrationAlerts.map((c) => {
                  const pct = totalRevenue > 0 ? ((c.revenue / totalRevenue) * 100).toFixed(1) : "0";
                  return (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{c.company}</span>
                      <div className="text-right">
                        <span className="font-mono font-medium text-orange-700">{pct}%</span>
                        <span className="text-gray-400 ml-2">{formatCurrency(c.revenue)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Activity className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-800">
                  No hay clientes que representen mas del 15% del revenue. Buena diversificacion.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Owner */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-indigo-600" /> Revenue por Vendedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ownerEntries.map(([owner, data]) => {
                const revPct = totalRevenue > 0 ? ((data.revenue / totalRevenue) * 100).toFixed(1) : "0";
                return (
                  <div key={owner} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{owner}</span>
                        <span className="text-xs text-gray-400">({data.count} clientes, {data.deals} deals)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{formatCurrency(data.revenue)}</span>
                        <span className="text-xs text-gray-400 ml-1">({revPct}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${revPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const VENDEDORES = ["Todos", "Pricila Dominguez", "Gabriela Gutierrez", "Samuel Hernandez", "Maria Gaytan", "Daniel Cebada"];

export default function ClientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"Todos" | ClientType>("Todos");
  const [filterVendedor, setFilterVendedor] = useState("Todos");
  const [sortField, setSortField] = useState<SortField>("deals");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = CLIENTS;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.company.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q) ||
          c.owner.toLowerCase().includes(q)
      );
    }

    // Filter by type
    if (filterType !== "Todos") {
      result = result.filter((c) => getClientType(c) === filterType);
    }

    // Filter by vendedor
    if (filterVendedor !== "Todos") {
      result = result.filter((c) => c.owner === filterVendedor);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let valA: number, valB: number;
      switch (sortField) {
        case "revenue":
          valA = a.revenue;
          valB = b.revenue;
          break;
        case "deals":
          valA = a.deals;
          valB = b.deals;
          break;
        case "contacts":
          valA = a.contacts;
          valB = b.contacts;
          break;
        case "ticketPromedio":
          valA = getTicketPromedio(a);
          valB = getTicketPromedio(b);
          break;
        default:
          valA = a.deals;
          valB = b.deals;
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return result;
  }, [search, filterType, filterVendedor, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Summary KPIs
  const totalClients = CLIENTS.length;
  const totalRevenue = CLIENTS.reduce((sum, c) => sum + c.revenue, 0);
  const totalDeals = CLIENTS.reduce((sum, c) => sum + c.deals, 0);
  const vipCount = CLIENTS.filter((c) => getClientType(c) === "VIP").length;
  const avgTicket = totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6" /> Clientes
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Datos reales de HubSpot - Top 50 empresas por numero de deals
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Revenue Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Clientes VIP</p>
                <p className="text-2xl font-bold text-gray-900">{vipCount}</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Ticket Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgTicket)}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar empresa, dominio o vendedor..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Tipo:</span>
              {(["Todos", "Nuevo", "Recurrente", "VIP"] as const).map((t) => (
                <Button
                  key={t}
                  variant={filterType === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(t)}
                  className="text-xs h-8"
                >
                  {t}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Vendedor:</span>
              <select
                value={filterVendedor}
                onChange={(e) => setFilterVendedor(e.target.value)}
                className="text-xs border rounded-md px-2 py-1.5 bg-white"
              >
                {VENDEDORES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Empresa</TableHead>
                <TableHead>Dominio</TableHead>
                <TableHead
                  className="text-center cursor-pointer select-none"
                  onClick={() => handleSort("deals")}
                >
                  <span className="inline-flex items-center gap-1">
                    Deals
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer select-none"
                  onClick={() => handleSort("contacts")}
                >
                  <span className="inline-flex items-center gap-1">
                    Contactos
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer select-none"
                  onClick={() => handleSort("revenue")}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    Revenue
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer select-none"
                  onClick={() => handleSort("ticketPromedio")}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    Ticket Prom.
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </TableHead>
                <TableHead className="text-center">LTV</TableHead>
                <TableHead className="text-center">Tipo</TableHead>
                <TableHead className="text-center">Salud</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => {
                const isExpanded = expandedId === client.id;
                const ticketProm = getTicketPromedio(client);
                const ltv = getLTVScore(client);
                const type = getClientType(client);
                const health = getHealthScore(client);
                const typeCfg = TYPE_CONFIG[type];
                const healthCfg = HEALTH_CONFIG[health];
                const TypeIcon = typeCfg.icon;

                return (
                  <TableRow
                    key={client.id}
                    className={`cursor-pointer transition-colors ${isExpanded ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                    onClick={() => router.push(`/clients/${encodeURIComponent(client.company)}`)}
                  >
                    <TableCell
                      className="w-8 pr-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : client.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium text-gray-900">{client.company}</span>
                        <p className="text-[11px] text-gray-400">{client.owner}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">{client.domain}</span>
                    </TableCell>
                    <TableCell className="text-center font-mono">{client.deals}</TableCell>
                    <TableCell className="text-center font-mono">{client.contacts}</TableCell>
                    <TableCell className="text-right font-mono font-medium">{formatCurrency(client.revenue)}</TableCell>
                    <TableCell className="text-right font-mono text-gray-500">
                      {ticketProm > 0 ? formatCurrency(ticketProm) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold text-gray-700">{ltv}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium ${typeCfg.bg}`}>
                        <TypeIcon className="w-3 h-3" />
                        {type}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${healthCfg.bg} ${healthCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${healthCfg.dot}`} />
                        {healthCfg.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-gray-400">
                    No se encontraron clientes con los filtros seleccionados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Expanded Detail - rendered outside table for proper layout */}
          {expandedId && (
            <ClientDetail client={CLIENTS.find((c) => c.id === expandedId)!} />
          )}
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <AnalyticsSection clients={CLIENTS} />
    </div>
  );
}
