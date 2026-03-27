"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ExternalLink, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Mock Odoo data (will be replaced with real API calls)
interface Invoice {
  id: number;
  name: string;
  state: "draft" | "posted" | "cancel";
  payment_state: "not_paid" | "paid" | "partial" | "in_payment";
  amount_total: number;
  amount_residual: number;
  invoice_date: string;
  invoice_date_due: string;
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: 1001, name: "INV/2026/0045", state: "posted", payment_state: "paid",
    amount_total: 171100, amount_residual: 0,
    invoice_date: "2026-02-05", invoice_date_due: "2026-02-20",
  },
  {
    id: 1002, name: "INV/2026/0046", state: "posted", payment_state: "partial",
    amount_total: 171100, amount_residual: 85550,
    invoice_date: "2026-02-15", invoice_date_due: "2026-03-15",
  },
];

const paymentStateColors: Record<string, string> = {
  not_paid: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  in_payment: "bg-blue-100 text-blue-700",
};

const paymentStateLabels: Record<string, string> = {
  not_paid: "Sin pagar",
  paid: "Pagado",
  partial: "Parcial",
  in_payment: "En proceso",
};

const paymentStateIcons: Record<string, React.ReactNode> = {
  not_paid: <AlertCircle className="w-4 h-4 text-red-500" />,
  paid: <CheckCircle className="w-4 h-4 text-green-500" />,
  partial: <Clock className="w-4 h-4 text-yellow-500" />,
  in_payment: <RefreshCw className="w-4 h-4 text-blue-500" />,
};

interface Props {
  projectId: string;
  odooSaleOrderId?: number;
  ventaReal: number;
}

export function PaymentStatus({ projectId, odooSaleOrderId, ventaReal }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("Hace 2 horas");

  const invoices = MOCK_INVOICES;
  const totalFacturado = invoices.reduce((s, i) => s + i.amount_total, 0);
  const totalPendiente = invoices.reduce((s, i) => s + i.amount_residual, 0);
  const totalCobrado = totalFacturado - totalPendiente;
  const pctCobrado = totalFacturado > 0 ? Math.round((totalCobrado / totalFacturado) * 100) : 0;

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync("Justo ahora");
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <Card className="bg-gray-900 text-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Venta Real</p>
              <p className="text-lg font-bold font-mono">{formatCurrency(ventaReal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Facturado</p>
              <p className="text-lg font-bold font-mono text-blue-400">{formatCurrency(totalFacturado)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Cobrado</p>
              <p className="text-lg font-bold font-mono text-green-400">{formatCurrency(totalCobrado)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Pendiente</p>
              <p className="text-lg font-bold font-mono text-red-400">{formatCurrency(totalPendiente)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">% Cobrado</p>
              <p className={`text-2xl font-bold ${pctCobrado === 100 ? "text-green-400" : pctCobrado > 50 ? "text-yellow-400" : "text-red-400"}`}>
                {pctCobrado}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={pctCobrado} className="h-2 bg-gray-700" />
          </div>
        </CardContent>
      </Card>

      {/* Odoo sync info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Facturas desde Odoo</CardTitle>
            <p className="text-xs text-gray-400 mt-1">
              Datos sincronizados de odoo.pixelplay.mx &middot; Ultima sync: {lastSync}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {odooSaleOrderId && (
              <a
                href={`https://odoo.pixelplay.mx/odoo/sales/${odooSaleOrderId}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-xs border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver en Odoo
              </a>
            )}
            <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing} className="gap-1">
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Sincronizando..." : "Sync"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Factura</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Fecha</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Vencimiento</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Total</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Pendiente</th>
                <th className="px-4 py-2 text-center font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <a
                        href={`https://odoo.pixelplay.mx/odoo/accounting/invoices/${inv.id}`}
                        target="_blank"
                        rel="noopener"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {inv.name}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{inv.invoice_date}</td>
                  <td className="px-4 py-2.5 text-gray-500">{inv.invoice_date_due}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatCurrency(inv.amount_total)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    <span className={inv.amount_residual > 0 ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(inv.amount_residual)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {paymentStateIcons[inv.payment_state]}
                      <Badge variant="secondary" className={paymentStateColors[inv.payment_state]}>
                        {paymentStateLabels[inv.payment_state]}
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-2" colSpan={3}>TOTAL</td>
                <td className="px-4 py-2 text-right font-mono">{formatCurrency(totalFacturado)}</td>
                <td className="px-4 py-2 text-right font-mono text-red-600">{formatCurrency(totalPendiente)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* No Odoo connection notice */}
      {!odooSaleOrderId && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Sin conexion a Odoo</p>
            <p className="mt-1">Este proyecto no tiene un ID de orden de venta en Odoo asociado.
            Cuando se configure la integracion, las facturas y pagos se sincronizaran automaticamente.</p>
          </div>
        </div>
      )}
    </div>
  );
}
