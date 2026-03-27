"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_QUOTES, getStatusColor, getStatusLabel, type QuoteStatus } from "@/lib/quotes-data";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, FileText, Filter } from "lucide-react";

const STATUS_FILTERS: { value: QuoteStatus | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "borrador", label: "Borrador" },
  { value: "enviada", label: "Enviada" },
  { value: "aceptada", label: "Aceptada" },
  { value: "rechazada", label: "Rechazada" },
  { value: "expirada", label: "Expirada" },
];

export default function QuotesPage() {
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "todas">("todas");

  const filteredQuotes = statusFilter === "todas"
    ? MOCK_QUOTES
    : MOCK_QUOTES.filter((q) => q.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredQuotes.length} cotizacion{filteredQuotes.length !== 1 ? "es" : ""}
          </p>
        </div>
        <Link href="/quotes/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Cotizacion
          </Button>
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === f.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    No hay cotizaciones con este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((q) => (
                  <TableRow key={q.id} className="hover:bg-gray-50">
                    <TableCell>
                      <span className="font-mono text-xs text-gray-500">{q.quoteNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{q.clientName}</p>
                        <p className="text-[11px] text-gray-400">{q.contactName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{q.projectName}</TableCell>
                    <TableCell className="text-sm">{q.vendedor}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(q.createdAt).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">
                      {formatCurrency(q.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(q.status)}>
                        {getStatusLabel(q.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/quotes/${q.id}`}>
                        <Button variant="ghost" size="icon-sm">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
