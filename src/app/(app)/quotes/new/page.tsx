"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PRODUCTS_CATALOG, PRODUCT_CATEGORIES, type Product, type ProductCategory } from "@/lib/products-catalog";
import { VENDEDORES, DEFAULT_TERMS, generateQuoteNumber } from "@/lib/quotes-data";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Eye,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface LineItem {
  id: string;
  product: Product;
  quantity: number;
  days: number;
  discountPct: number;
}

function computeLineTotal(item: LineItem): number {
  const base =
    item.product.unit === "dia" || item.product.unit === "hora"
      ? item.product.unitPrice * item.quantity * item.days
      : item.product.unitPrice * item.quantity;
  return base * (1 - item.discountPct / 100);
}

function computeLineSubtotal(item: LineItem): number {
  return item.product.unit === "dia" || item.product.unit === "hora"
    ? item.product.unitPrice * item.quantity * item.days
    : item.product.unitPrice * item.quantity;
}

const unitLabels: Record<string, string> = {
  dia: "/dia",
  hora: "/hora",
  pieza: "/pza",
  persona: "/persona",
  paquete: "/paq",
};

export default function NewQuotePage() {
  // Client info
  const [clientName, setClientName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [projectName, setProjectName] = useState("");
  const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [expiresAt, setExpiresAt] = useState(defaultExpiry);

  // Product selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "Todas">("Todas");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Terms
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsPayment, setTermsPayment] = useState(DEFAULT_TERMS.payment);
  const [termsCancellation, setTermsCancellation] = useState(DEFAULT_TERMS.cancellation);
  const [termsTechnical, setTermsTechnical] = useState(DEFAULT_TERMS.technical);
  const [notes, setNotes] = useState("");

  // Preview
  const [showPreview, setShowPreview] = useState(false);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let products = PRODUCTS_CATALOG;
    if (selectedCategory !== "Todas") {
      products = products.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return products;
  }, [searchQuery, selectedCategory]);

  // Add product to quote
  function addProduct(product: Product) {
    const existing = lineItems.find((li) => li.product.id === product.id);
    if (existing) {
      setLineItems((items) =>
        items.map((li) =>
          li.id === existing.id ? { ...li, quantity: li.quantity + 1 } : li
        )
      );
    } else {
      setLineItems((items) => [
        ...items,
        {
          id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          product,
          quantity: 1,
          days: product.unit === "dia" || product.unit === "hora" ? 1 : 1,
          discountPct: 0,
        },
      ]);
    }
  }

  function removeLineItem(id: string) {
    setLineItems((items) => items.filter((li) => li.id !== id));
  }

  function updateLineItem(id: string, field: "quantity" | "days" | "discountPct", value: number) {
    setLineItems((items) =>
      items.map((li) => (li.id === id ? { ...li, [field]: value } : li))
    );
  }

  // Totals
  const subtotal = lineItems.reduce((sum, li) => sum + computeLineSubtotal(li), 0);
  const discountTotal = lineItems.reduce(
    (sum, li) => sum + (computeLineSubtotal(li) - computeLineTotal(li)),
    0
  );
  const total = subtotal - discountTotal;

  const quoteNumber = useMemo(() => generateQuoteNumber(), []);

  if (showPreview) {
    return (
      <QuotePreview
        quoteNumber={quoteNumber}
        clientName={clientName}
        contactName={contactName}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        vendedor={vendedor}
        projectName={projectName}
        expiresAt={expiresAt}
        lineItems={lineItems}
        subtotal={subtotal}
        discountTotal={discountTotal}
        total={total}
        notes={notes}
        termsPayment={termsPayment}
        termsCancellation={termsCancellation}
        termsTechnical={termsTechnical}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/quotes">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Cotizacion</h1>
            <p className="text-xs text-gray-400 font-mono">#{quoteNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
            <Eye className="w-4 h-4" />
            Vista Previa
          </Button>
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            Guardar Borrador
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column: Client info + Product selection */}
        <div className="xl:col-span-2 space-y-6">
          {/* Step 1: Client Info */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre del Cliente / Empresa</label>
                  <Input
                    placeholder="Ej. Agencia Descorche"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre del Proyecto</label>
                  <Input
                    placeholder="Ej. Activacion Corona Sunsets 2026"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Contacto</label>
                  <Input
                    placeholder="Nombre del contacto"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                  <Input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Telefono</label>
                  <Input
                    placeholder="+52 55 1234 5678"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Vendedor</label>
                  <select
                    className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    value={vendedor}
                    onChange={(e) => setVendedor(e.target.value)}
                  >
                    <option value="">Seleccionar vendedor</option>
                    {VENDEDORES.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Fecha de Expiracion</label>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Product Selection */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Catalogo de Productos</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category tabs */}
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setSelectedCategory("Todas")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedCategory === "Todas"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Todas
                </button>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredProducts.map((product) => {
                  const isAdded = lineItems.some((li) => li.product.id === product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => addProduct(product)}
                      className={`text-left p-3 rounded-lg border transition-all hover:shadow-sm ${
                        isAdded
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(product.unitPrice)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {unitLabels[product.unit]}
                          </p>
                        </div>
                      </div>
                      {isAdded && (
                        <Badge variant="secondary" className="mt-1.5 bg-blue-100 text-blue-700 text-[10px]">
                          Agregado
                        </Badge>
                      )}
                    </button>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <p className="text-sm text-gray-400 col-span-2 text-center py-8">
                    No se encontraron productos.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line items table */}
          {lineItems.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Partidas de la Cotizacion ({lineItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="w-[80px] text-center">Cant.</TableHead>
                      <TableHead className="w-[80px] text-center">Dias</TableHead>
                      <TableHead className="w-[100px] text-right">Precio Unit.</TableHead>
                      <TableHead className="w-[90px] text-center">Desc. %</TableHead>
                      <TableHead className="w-[120px] text-right">Total</TableHead>
                      <TableHead className="w-[40px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((li) => {
                      const showDays = li.product.unit === "dia" || li.product.unit === "hora";
                      return (
                        <TableRow key={li.id}>
                          <TableCell>
                            <p className="text-sm font-medium">{li.product.name}</p>
                            <p className="text-[10px] text-gray-400">{li.product.category}</p>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              className="w-16 text-center mx-auto"
                              value={li.quantity}
                              onChange={(e) =>
                                updateLineItem(li.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {showDays ? (
                              <Input
                                type="number"
                                min={1}
                                className="w-16 text-center mx-auto"
                                value={li.days}
                                onChange={(e) =>
                                  updateLineItem(li.id, "days", Math.max(1, parseInt(e.target.value) || 1))
                                }
                              />
                            ) : (
                              <span className="text-xs text-gray-400 block text-center">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(li.product.unitPrice)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              className="w-16 text-center mx-auto"
                              value={li.discountPct}
                              onChange={(e) =>
                                updateLineItem(
                                  li.id,
                                  "discountPct",
                                  Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-medium">
                            {formatCurrency(computeLineTotal(li))}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => removeLineItem(li.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Terms */}
          <Card>
            <CardHeader
              className="border-b cursor-pointer"
              onClick={() => setTermsOpen(!termsOpen)}
            >
              <div className="flex items-center justify-between w-full">
                <CardTitle>Terminos y Condiciones</CardTitle>
                {termsOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </CardHeader>
            {termsOpen && (
              <CardContent className="pt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Condiciones de Pago
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm min-h-[60px] resize-none"
                    value={termsPayment}
                    onChange={(e) => setTermsPayment(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Politica de Cancelacion
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm min-h-[60px] resize-none"
                    value={termsCancellation}
                    onChange={(e) => setTermsCancellation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Requerimientos Tecnicos
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm min-h-[60px] resize-none"
                    value={termsTechnical}
                    onChange={(e) => setTermsTechnical(e.target.value)}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right column: Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="border-b">
              <CardTitle>Resumen de Cotizacion</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {lineItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Agrega productos del catalogo para comenzar.
                </p>
              ) : (
                <>
                  {/* Line items summary */}
                  <div className="space-y-2">
                    {lineItems.map((li) => (
                      <div key={li.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate mr-2">
                          {li.product.name}
                          {li.quantity > 1 && ` x${li.quantity}`}
                          {(li.product.unit === "dia" || li.product.unit === "hora") &&
                            li.days > 1 &&
                            ` (${li.days}d)`}
                        </span>
                        <span className="font-mono shrink-0">
                          {formatCurrency(computeLineTotal(li))}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-mono">{formatCurrency(subtotal)}</span>
                    </div>
                    {discountTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Descuento</span>
                        <span className="font-mono text-red-500">
                          -{formatCurrency(discountTotal)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold border-t pt-2">
                      <span>Total</span>
                      <span className="font-mono">{formatCurrency(total)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 text-right">+ IVA (16%)</p>
                    <div className="flex justify-between text-xs text-gray-400 pt-1">
                      <span>Total con IVA</span>
                      <span className="font-mono">{formatCurrency(total * 1.16)}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2">
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Notas / Comentarios
                </label>
                <textarea
                  className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm min-h-[80px] resize-none"
                  placeholder="Notas adicionales para el cliente..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Inline Preview Component ────────────────────────────────────────────────

function QuotePreview({
  quoteNumber,
  clientName,
  contactName,
  contactEmail,
  contactPhone,
  vendedor,
  projectName,
  expiresAt,
  lineItems,
  subtotal,
  discountTotal,
  total,
  notes,
  termsPayment,
  termsCancellation,
  termsTechnical,
  onBack,
}: {
  quoteNumber: string;
  clientName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  vendedor: string;
  projectName: string;
  expiresAt: string;
  lineItems: LineItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  notes: string;
  termsPayment: string;
  termsCancellation: string;
  termsTechnical: string;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver al Editor
        </Button>
        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Guardar Cotizacion
        </Button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden print:ring-0">
        {/* Header */}
        <div className="bg-gray-900 text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-lg font-bold">
                PF
              </div>
              <div>
                <h2 className="text-lg font-bold">PIXEL FACTORY</h2>
                <p className="text-xs text-gray-400">Tecnologia para Eventos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">COTIZACION</p>
              <p className="text-xs text-gray-400 font-mono">#{quoteNumber}</p>
            </div>
          </div>
        </div>

        {/* Client & Quote info */}
        <div className="px-8 py-6 grid grid-cols-2 gap-8 border-b">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Cliente</p>
            <p className="text-sm font-bold">{clientName || "---"}</p>
            <p className="text-sm text-gray-600">{contactName || "---"}</p>
            <p className="text-xs text-gray-400">{contactEmail}</p>
            <p className="text-xs text-gray-400">{contactPhone}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Detalles</p>
            <p className="text-sm"><span className="text-gray-400">Proyecto:</span> {projectName || "---"}</p>
            <p className="text-sm"><span className="text-gray-400">Vendedor:</span> {vendedor || "---"}</p>
            <p className="text-sm">
              <span className="text-gray-400">Fecha:</span>{" "}
              {new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Vigencia:</span>{" "}
              {expiresAt
                ? new Date(expiresAt + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })
                : "---"}
            </p>
          </div>
        </div>

        {/* Line items */}
        <div className="px-8 py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 font-medium text-gray-500">Concepto</th>
                <th className="text-center py-2 font-medium text-gray-500 w-16">Cant.</th>
                <th className="text-center py-2 font-medium text-gray-500 w-16">Dias</th>
                <th className="text-right py-2 font-medium text-gray-500 w-24">P. Unit.</th>
                <th className="text-center py-2 font-medium text-gray-500 w-16">Desc.</th>
                <th className="text-right py-2 font-medium text-gray-500 w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li) => {
                const showDays = li.product.unit === "dia" || li.product.unit === "hora";
                return (
                  <tr key={li.id} className="border-b border-gray-100">
                    <td className="py-2.5">
                      <p className="font-medium">{li.product.name}</p>
                      <p className="text-[10px] text-gray-400">{li.product.category}</p>
                    </td>
                    <td className="text-center">{li.quantity}</td>
                    <td className="text-center">{showDays ? li.days : "-"}</td>
                    <td className="text-right font-mono">{formatCurrency(li.product.unitPrice)}</td>
                    <td className="text-center">
                      {li.discountPct > 0 ? `${li.discountPct}%` : "-"}
                    </td>
                    <td className="text-right font-mono font-medium">
                      {formatCurrency(computeLineTotal(li))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-8 py-4 bg-gray-50 border-t">
          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Descuento</span>
                  <span className="font-mono text-red-500">-{formatCurrency(discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total</span>
                <span className="font-mono">{formatCurrency(total)}</span>
              </div>
              <p className="text-[10px] text-gray-400 text-right">Precios en MXN + IVA (16%)</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="px-8 py-4 border-t">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Notas</p>
            <p className="text-sm text-gray-600">{notes}</p>
          </div>
        )}

        {/* Terms */}
        <div className="px-8 py-6 bg-gray-50 border-t space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Terminos y Condiciones</p>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Condiciones de Pago</p>
            <p className="text-xs text-gray-600">{termsPayment}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Cancelacion</p>
            <p className="text-xs text-gray-600">{termsCancellation}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Requerimientos Tecnicos</p>
            <p className="text-xs text-gray-600">{termsTechnical}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-900 text-center">
          <p className="text-[10px] text-gray-400">
            PIXEL FACTORY | contacto@pixelfactory.mx | pixelfactory.mx | +52 55 1234 5678
          </p>
        </div>
      </div>
    </div>
  );
}
