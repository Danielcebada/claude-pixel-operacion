"use client";

import { use } from "react";
import Link from "next/link";
import { getQuoteById, getStatusColor, getStatusLabel } from "@/lib/quotes-data";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Send,
  Pencil,
  Copy,
  Printer,
} from "lucide-react";

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const quote = getQuoteById(id);

  if (!quote) {
    return (
      <div className="space-y-6">
        <Link href="/quotes">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </Link>
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">Cotizacion no encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/quotes">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{quote.projectName}</h1>
              <Badge variant="secondary" className={getStatusColor(quote.status)}>
                {getStatusLabel(quote.status)}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 font-mono">#{quote.quoteNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Descargar PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <Send className="w-4 h-4" />
            Enviar al Cliente
          </Button>
          <Link href={`/quotes/new`}>
            <Button variant="outline" className="gap-2">
              <Copy className="w-4 h-4" />
              Duplicar
            </Button>
          </Link>
          <Link href={`/quotes/new`}>
            <Button className="gap-2">
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Quote document */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden print:ring-0 print:max-w-none">
        {/* Header bar */}
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
              <p className="text-xs text-gray-400 font-mono">#{quote.quoteNumber}</p>
              <Badge
                variant="secondary"
                className={`mt-1 text-[10px] ${getStatusColor(quote.status)}`}
              >
                {getStatusLabel(quote.status)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Client & Quote info */}
        <div className="px-8 py-6 grid grid-cols-2 gap-8 border-b">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Cliente</p>
            <p className="text-sm font-bold">{quote.clientName}</p>
            <p className="text-sm text-gray-600">{quote.contactName}</p>
            <p className="text-xs text-gray-400">{quote.contactEmail}</p>
            <p className="text-xs text-gray-400">{quote.contactPhone}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Detalles</p>
            <p className="text-sm">
              <span className="text-gray-400">Proyecto:</span> {quote.projectName}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Vendedor:</span> {quote.vendedor}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Fecha:</span>{" "}
              {new Date(quote.createdAt).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Vigencia:</span>{" "}
              {new Date(quote.expiresAt).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Line items table */}
        <div className="px-8 py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 font-medium text-gray-500">#</th>
                <th className="text-left py-2 font-medium text-gray-500">Concepto</th>
                <th className="text-center py-2 font-medium text-gray-500 w-16">Cant.</th>
                <th className="text-center py-2 font-medium text-gray-500 w-16">Dias</th>
                <th className="text-right py-2 font-medium text-gray-500 w-24">P. Unitario</th>
                <th className="text-center py-2 font-medium text-gray-500 w-16">Desc.</th>
                <th className="text-right py-2 font-medium text-gray-500 w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2.5 text-gray-400">{idx + 1}</td>
                  <td className="py-2.5">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-[10px] text-gray-400">{item.category}</p>
                  </td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-center">
                    {item.unit === "dia" || item.unit === "hora" ? item.days : "-"}
                  </td>
                  <td className="text-right font-mono">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="text-center">
                    {item.discountPct > 0 ? `${item.discountPct}%` : "-"}
                  </td>
                  <td className="text-right font-mono font-medium">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-8 py-4 bg-gray-50 border-t">
          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-mono">{formatCurrency(quote.subtotal)}</span>
              </div>
              {quote.discountTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Descuento</span>
                  <span className="font-mono text-red-500">
                    -{formatCurrency(quote.discountTotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total</span>
                <span className="font-mono">{formatCurrency(quote.total)}</span>
              </div>
              <p className="text-[10px] text-gray-400 text-right">Precios en MXN + IVA (16%)</p>
              <div className="flex justify-between text-xs text-gray-400 pt-1">
                <span>Total con IVA</span>
                <span className="font-mono">{formatCurrency(quote.total * 1.16)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="px-8 py-4 border-t">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Notas</p>
            <p className="text-sm text-gray-600">{quote.notes}</p>
          </div>
        )}

        {/* Terms */}
        <div className="px-8 py-6 bg-gray-50 border-t space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Terminos y Condiciones
          </p>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
              Condiciones de Pago
            </p>
            <p className="text-xs text-gray-600">{quote.termsPayment}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
              Cancelacion
            </p>
            <p className="text-xs text-gray-600">{quote.termsCancellation}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
              Requerimientos Tecnicos
            </p>
            <p className="text-xs text-gray-600">{quote.termsTechnical}</p>
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
