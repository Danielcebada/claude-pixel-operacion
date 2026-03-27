"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HUBSPOT_PRODUCTS, PRODUCT_CATEGORIES } from "@/lib/hubspot-products";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  ArrowUpDown,
  Download,
  Plus,
  History,
  Tag,
  Calculator,
  Eye,
} from "lucide-react";
import { formatCurrency } from "@/lib/types";

// ─── Mock Data: Productos/Servicios ─────────────────────────────────
interface ProductCost {
  id: string;
  name: string;
  category: "booth" | "tech" | "produccion" | "logistica" | "creativo";
  costoPromedio: number;
  costoMin: number;
  costoMax: number;
  precioVentaSugerido: number;
  margenPromedio: number;
  proyectosUsado: number;
  ultimaActualizacion: string;
  tendencia: "up" | "down" | "stable";
  variacion: number;
}

const PRODUCTS: ProductCost[] = [
  { id: "s1", name: "360 Photo Booth", category: "booth", costoPromedio: 12500, costoMin: 9000, costoMax: 18000, precioVentaSugerido: 35000, margenPromedio: 64.3, proyectosUsado: 28, ultimaActualizacion: "2026-03-20", tendencia: "stable", variacion: 2 },
  { id: "s2", name: "iPad Booth (3 unidades)", category: "booth", costoPromedio: 15000, costoMin: 12000, costoMax: 20000, precioVentaSugerido: 42000, margenPromedio: 64.3, proyectosUsado: 15, ultimaActualizacion: "2026-03-18", tendencia: "up", variacion: 8 },
  { id: "s3", name: "Green Screen Studio", category: "booth", costoPromedio: 22000, costoMin: 18000, costoMax: 28000, precioVentaSugerido: 55000, margenPromedio: 60.0, proyectosUsado: 12, ultimaActualizacion: "2026-03-15", tendencia: "down", variacion: -5 },
  { id: "s4", name: "Glam Bot", category: "booth", costoPromedio: 18000, costoMin: 15000, costoMax: 22000, precioVentaSugerido: 48000, margenPromedio: 62.5, proyectosUsado: 9, ultimaActualizacion: "2026-03-12", tendencia: "stable", variacion: 1 },
  { id: "s5", name: "Mapping / Projection", category: "tech", costoPromedio: 45000, costoMin: 30000, costoMax: 65000, precioVentaSugerido: 95000, margenPromedio: 52.6, proyectosUsado: 6, ultimaActualizacion: "2026-02-28", tendencia: "up", variacion: 12 },
  { id: "s6", name: "LED Wall (por m2)", category: "tech", costoPromedio: 8500, costoMin: 6000, costoMax: 12000, precioVentaSugerido: 18000, margenPromedio: 52.8, proyectosUsado: 11, ultimaActualizacion: "2026-03-10", tendencia: "down", variacion: -3 },
  { id: "s7", name: "Instalacion CDMX", category: "logistica", costoPromedio: 3500, costoMin: 2000, costoMax: 6000, precioVentaSugerido: 0, margenPromedio: 0, proyectosUsado: 35, ultimaActualizacion: "2026-03-22", tendencia: "up", variacion: 15 },
  { id: "s8", name: "Instalacion Foranea", category: "logistica", costoPromedio: 8500, costoMin: 5000, costoMax: 15000, precioVentaSugerido: 0, margenPromedio: 0, proyectosUsado: 18, ultimaActualizacion: "2026-03-19", tendencia: "up", variacion: 10 },
  { id: "s9", name: "Personal Operacion (por persona/dia)", category: "produccion", costoPromedio: 1800, costoMin: 1200, costoMax: 2500, precioVentaSugerido: 0, margenPromedio: 0, proyectosUsado: 42, ultimaActualizacion: "2026-03-21", tendencia: "stable", variacion: 3 },
  { id: "s10", name: "Diseño Personalizado", category: "creativo", costoPromedio: 5500, costoMin: 3000, costoMax: 12000, precioVentaSugerido: 15000, margenPromedio: 63.3, proyectosUsado: 22, ultimaActualizacion: "2026-03-17", tendencia: "stable", variacion: 0 },
];

// ─── Mock Data: Proveedores ─────────────────────────────────
interface Proveedor {
  id: string;
  nombre: string;
  servicio: string;
  costoPromedio: number;
  calificacion: number; // 1-5
  proyectos: number;
  tiempoEntrega: string;
  ultimoPrecio: number;
  ultimaFecha: string;
  tendencia: "up" | "down" | "stable";
  variacion: number;
  contacto: string;
}

const PROVEEDORES: Proveedor[] = [
  { id: "pv1", nombre: "Renta AV Solutions", servicio: "LED Wall / Pantallas", costoPromedio: 7800, calificacion: 4.5, proyectos: 11, tiempoEntrega: "3 dias", ultimoPrecio: 8200, ultimaFecha: "2026-03-10", tendencia: "up", variacion: 5, contacto: "carlos@rentaav.com" },
  { id: "pv2", nombre: "Foto Booths MX", servicio: "Equipo 360 / Booths", costoPromedio: 9500, calificacion: 4.8, proyectos: 22, tiempoEntrega: "2 dias", ultimoPrecio: 9500, ultimaFecha: "2026-03-18", tendencia: "stable", variacion: 0, contacto: "ventas@fotobooths.mx" },
  { id: "pv3", nombre: "Transportes Rapidos", servicio: "Logistica / Fletes", costoPromedio: 4200, calificacion: 3.8, proyectos: 30, tiempoEntrega: "1 dia", ultimoPrecio: 4800, ultimaFecha: "2026-03-20", tendencia: "up", variacion: 14, contacto: "ops@transportes.com" },
  { id: "pv4", nombre: "Staff Pro Events", servicio: "Personal Operacion", costoPromedio: 1600, calificacion: 4.2, proyectos: 35, tiempoEntrega: "2 dias", ultimoPrecio: 1800, ultimaFecha: "2026-03-21", tendencia: "up", variacion: 12, contacto: "rh@staffpro.mx" },
  { id: "pv5", nombre: "PrintLab Digital", servicio: "Impresion / Branding", costoPromedio: 3800, calificacion: 4.0, proyectos: 18, tiempoEntrega: "5 dias", ultimoPrecio: 3500, ultimaFecha: "2026-03-15", tendencia: "down", variacion: -8, contacto: "info@printlab.mx" },
  { id: "pv6", nombre: "Creativa Studio", servicio: "Diseño / Motion", costoPromedio: 6200, calificacion: 4.7, proyectos: 14, tiempoEntrega: "4 dias", ultimoPrecio: 6000, ultimaFecha: "2026-03-12", tendencia: "stable", variacion: -3, contacto: "hola@creativa.studio" },
  { id: "pv7", nombre: "MX Catering Co", servicio: "Viaticos / Alimentos", costoPromedio: 280, calificacion: 4.1, proyectos: 25, tiempoEntrega: "1 dia", ultimoPrecio: 300, ultimaFecha: "2026-03-22", tendencia: "up", variacion: 7, contacto: "pedidos@mxcatering.com" },
];

// ─── Mock Data: Tarifario ─────────────────────────────────
interface TarifaRow {
  producto: string;
  costoBase: number;
  margenMinimo: number;
  precioMinVenta: number;
  precioSugerido: number;
  precioMaxVisto: number;
  notas: string;
}

const TARIFARIO: TarifaRow[] = [
  { producto: "360 Photo Booth", costoBase: 12500, margenMinimo: 50, precioMinVenta: 25000, precioSugerido: 35000, precioMaxVisto: 55000, notas: "Incluye operador + equipo" },
  { producto: "iPad Booth x3", costoBase: 15000, margenMinimo: 50, precioMinVenta: 30000, precioSugerido: 42000, precioMaxVisto: 65000, notas: "3 iPads + stands + software" },
  { producto: "Green Screen", costoBase: 22000, margenMinimo: 45, precioMinVenta: 40000, precioSugerido: 55000, precioMaxVisto: 85000, notas: "Incluye iluminacion + chroma" },
  { producto: "Glam Bot", costoBase: 18000, margenMinimo: 50, precioMinVenta: 36000, precioSugerido: 48000, precioMaxVisto: 72000, notas: "Robot + operador + edicion" },
  { producto: "LED Wall (m2)", costoBase: 8500, margenMinimo: 40, precioMinVenta: 14200, precioSugerido: 18000, precioMaxVisto: 25000, notas: "Precio por m2, minimo 4m2" },
  { producto: "Mapping", costoBase: 45000, margenMinimo: 40, precioMinVenta: 75000, precioSugerido: 95000, precioMaxVisto: 180000, notas: "Depende de superficie y contenido" },
  { producto: "Diseño Custom", costoBase: 5500, margenMinimo: 50, precioMinVenta: 11000, precioSugerido: 15000, precioMaxVisto: 25000, notas: "Templates + personalizacion marca" },
];

const CATEGORIES: Record<string, string> = {
  booth: "Booths & Experiencias",
  tech: "Tecnologia",
  produccion: "Produccion",
  logistica: "Logistica",
  creativo: "Creativo",
};

const CAT_COLORS: Record<string, string> = {
  booth: "bg-blue-100 text-blue-700",
  tech: "bg-purple-100 text-purple-700",
  produccion: "bg-orange-100 text-orange-700",
  logistica: "bg-yellow-100 text-yellow-700",
  creativo: "bg-pink-100 text-pink-700",
};

function TrendIcon({ trend, variacion }: { trend: string; variacion: number }) {
  if (trend === "up") return <span className="flex items-center gap-1 text-red-600 text-xs font-medium"><TrendingUp className="w-3 h-3" />+{variacion}%</span>;
  if (trend === "down") return <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><TrendingDown className="w-3 h-3" />{variacion}%</span>;
  return <span className="text-gray-400 text-xs">={variacion}%</span>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-sm ${i <= Math.floor(rating) ? "bg-yellow-400" : i - 0.5 <= rating ? "bg-yellow-200" : "bg-gray-200"}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

// ─── Simulador de Cotizacion ─────────────────────────────────
function CotizadorRapido() {
  const [items, setItems] = useState<{ productId: string; qty: number }[]>([
    { productId: "s1", qty: 1 },
  ]);

  const addItem = () => setItems([...items, { productId: "s1", qty: 1 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const totalCosto = items.reduce((sum, item) => {
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    return sum + (prod ? prod.costoPromedio * item.qty : 0);
  }, 0);

  const totalVenta = items.reduce((sum, item) => {
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    return sum + (prod ? prod.precioVentaSugerido * item.qty : 0);
  }, 0);

  const margen = totalVenta > 0 ? Math.round(((totalVenta - totalCosto) / totalVenta) * 10000) / 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="w-5 h-5 text-blue-600" />
          Cotizador Rapido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-500">Arma una cotizacion rapida con costos promedio actualizados de proyectos reales.</p>

        <div className="space-y-2">
          {items.map((item, idx) => {
            const prod = PRODUCTS.find((p) => p.id === item.productId);
            return (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={item.productId}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].productId = e.target.value;
                    setItems(newItems);
                  }}
                  className="flex-1 border rounded-md px-2 py-1.5 text-sm"
                >
                  {PRODUCTS.filter((p) => p.precioVentaSugerido > 0).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.qty}
                  min={1}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].qty = parseInt(e.target.value) || 1;
                    setItems(newItems);
                  }}
                  className="w-16 border rounded-md px-2 py-1.5 text-sm text-center"
                />
                <span className="text-sm font-mono w-24 text-right">
                  {formatCurrency((prod?.precioVentaSugerido || 0) * item.qty)}
                </span>
                <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            );
          })}
        </div>

        <Button variant="outline" size="sm" onClick={addItem} className="gap-1 text-xs">
          <Plus className="w-3 h-3" /> Agregar linea
        </Button>

        <div className="border-t pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Costo estimado:</span>
            <span className="font-mono">{formatCurrency(totalCosto)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Precio venta sugerido:</span>
            <span className="font-mono font-bold">{formatCurrency(totalVenta)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Utilidad estimada:</span>
            <span className="font-mono text-green-600 font-bold">{formatCurrency(totalVenta - totalCosto)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Margen:</span>
            <span className={`font-mono font-bold ${margen >= 50 ? "text-green-600" : margen >= 30 ? "text-yellow-600" : "text-red-600"}`}>
              {margen}%
            </span>
          </div>
        </div>

        {margen < 40 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            Margen por debajo del objetivo (40%). Revisa los precios.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────
export default function CostCenterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "cost" | "margin" | "usage">("usage");

  const filteredProducts = PRODUCTS
    .filter((p) => categoryFilter === "all" || p.category === categoryFilter)
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "cost") return b.costoPromedio - a.costoPromedio;
      if (sortBy === "margin") return b.margenPromedio - a.margenPromedio;
      return b.proyectosUsado - a.proyectosUsado;
    });

  const avgMargin = Math.round(PRODUCTS.filter((p) => p.margenPromedio > 0).reduce((s, p) => s + p.margenPromedio, 0) / PRODUCTS.filter((p) => p.margenPromedio > 0).length * 100) / 100;
  const costosSubiendo = PRODUCTS.filter((p) => p.tendencia === "up").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Costos</h1>
          <p className="text-sm text-gray-500 mt-1">Consulta de costos, proveedores y tarifario - alimentado automaticamente de proyectos reales</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700 border-green-200">
            <History className="w-3 h-3" /> Ultima actualizacion: hace 2 hrs
          </Badge>
          <Button variant="outline" className="gap-2" size="sm">
            <Download className="w-4 h-4" /> Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Package className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Productos/Servicios</p>
            <p className="text-2xl font-bold">{PRODUCTS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Proveedores</p>
            <p className="text-2xl font-bold">{PROVEEDORES.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Margen Promedio</p>
            <p className="text-2xl font-bold text-green-600">{avgMargin}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <AlertTriangle className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Costos subiendo</p>
            <p className="text-2xl font-bold text-orange-600">{costosSubiendo}</p>
            <p className="text-[10px] text-gray-400">requieren atencion</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="productos">
            <TabsList>
              <TabsTrigger value="productos">Productos & Servicios</TabsTrigger>
              <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
              <TabsTrigger value="tarifario">Tarifario Base</TabsTrigger>
            </TabsList>

            {/* ── Tab: Productos ── */}
            <TabsContent value="productos" className="mt-4 space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto o servicio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Todas las categorias</option>
                  {Object.entries(CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="usage">Mas usado</option>
                  <option value="cost">Mayor costo</option>
                  <option value="margin">Mayor margen</option>
                  <option value="name">Nombre A-Z</option>
                </select>
              </div>

              {/* Products table */}
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Producto/Servicio</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Costo Prom.</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Rango</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Venta Sugerida</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Margen</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Proyectos</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Tendencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 cursor-pointer group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{p.name}</span>
                              <Badge className={`text-[10px] ${CAT_COLORS[p.category]}`}>{CATEGORIES[p.category]}</Badge>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">Actualizado: {p.ultimaActualizacion}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold">{formatCurrency(p.costoPromedio)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-[11px] text-gray-400">{formatCurrency(p.costoMin)} - {formatCurrency(p.costoMax)}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {p.precioVentaSugerido > 0 ? formatCurrency(p.precioVentaSugerido) : <span className="text-gray-300">N/A</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {p.margenPromedio > 0 ? (
                              <span className={`font-mono font-bold ${p.margenPromedio >= 50 ? "text-green-600" : p.margenPromedio >= 30 ? "text-yellow-600" : "text-red-600"}`}>
                                {p.margenPromedio}%
                              </span>
                            ) : <span className="text-gray-300">-</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="secondary" className="font-mono">{p.proyectosUsado}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <TrendIcon trend={p.tendencia} variacion={p.variacion} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Tab: Proveedores ── */}
            <TabsContent value="proveedores" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Proveedor</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Servicio</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Costo Prom.</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Ultimo Precio</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Calificacion</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Proyectos</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Entrega</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Tendencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {PROVEEDORES.map((pv) => (
                        <tr key={pv.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{pv.nombre}</p>
                            <p className="text-[11px] text-gray-400">{pv.contacto}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{pv.servicio}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatCurrency(pv.costoPromedio)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-mono font-bold">{formatCurrency(pv.ultimoPrecio)}</span>
                            <p className="text-[10px] text-gray-400">{pv.ultimaFecha}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Stars rating={pv.calificacion} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="secondary" className="font-mono">{pv.proyectos}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-500">{pv.tiempoEntrega}</td>
                          <td className="px-4 py-3 text-right">
                            <TrendIcon trend={pv.tendencia} variacion={pv.variacion} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Tab: Tarifario ── */}
            <TabsContent value="tarifario" className="mt-4 space-y-4">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
                <Tag className="w-4 h-4" />
                Este tarifario se actualiza automaticamente con los costos promedio de proyectos finalizados. Los precios minimos de venta garantizan el margen objetivo.
              </div>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Producto</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Costo Base</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Margen Min.</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Precio Min. Venta</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Precio Sugerido</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">Max. Visto</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {TARIFARIO.map((t) => (
                        <tr key={t.producto} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{t.producto}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatCurrency(t.costoBase)}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-yellow-100 text-yellow-700">{t.margenMinimo}%</Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-red-600 font-bold">{formatCurrency(t.precioMinVenta)}</td>
                          <td className="px-4 py-3 text-right font-mono text-green-600 font-bold">{formatCurrency(t.precioSugerido)}</td>
                          <td className="px-4 py-3 text-right font-mono text-blue-600">{formatCurrency(t.precioMaxVisto)}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{t.notas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar - Cotizador */}
        <div className="space-y-4">
          <CotizadorRapido />

          {/* Alertas de costos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Alertas de Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PRODUCTS.filter((p) => p.tendencia === "up" && p.variacion > 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-orange-900">{p.name}</p>
                    <p className="text-[10px] text-orange-600">Subio {p.variacion}% vs promedio</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </div>
              ))}
              {PROVEEDORES.filter((pv) => pv.tendencia === "up" && pv.variacion > 10).map((pv) => (
                <div key={pv.id} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-red-900">{pv.nombre}</p>
                    <p className="text-[10px] text-red-600">Precio subio {pv.variacion}% - buscar alternativa?</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-red-500" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
