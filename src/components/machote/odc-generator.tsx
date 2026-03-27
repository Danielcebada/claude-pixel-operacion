"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Send, FileDown, Loader2, CheckCircle, ExternalLink,
  Building, Calendar, CreditCard, FileText, Package,
} from "lucide-react";

interface LineaSeleccionada {
  id: string;
  tipo: string;
  concepto: string;
  proveedor_responsable: string;
  presupuesto: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineas: LineaSeleccionada[];
  projectName: string;
  projectId: string;
  onODCCreated: (odcNumber: string, lineaIds: string[]) => void;
}

export function ODCGeneratorDialog({ open, onOpenChange, lineas, projectName, projectId, onODCCreated }: Props) {
  const [step, setStep] = useState<"edit" | "preview" | "sending" | "done">("edit");
  const [odcNumber, setOdcNumber] = useState("");

  const [odcData, setOdcData] = useState({
    proveedor: lineas.length === 1 ? lineas[0].proveedor_responsable : "",
    proveedor_rfc: "",
    condiciones_pago: "Contado",
    fecha_requerida: "",
    notas: "",
    proyecto: projectName,
    solicitante: "Joyce Perez",
  });

  // Group by proveedor
  const proveedores = [...new Set(lineas.map((l) => l.proveedor_responsable).filter(Boolean))];
  const totalPresupuesto = lineas.reduce((s, l) => s + l.presupuesto, 0);
  const totalConIVA = Math.round(totalPresupuesto * 1.16);

  const handleSendToOdoo = () => {
    setStep("sending");
    setTimeout(() => {
      const num = `ODC-${projectId.toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
      setOdcNumber(num);
      setStep("done");
    }, 3000);
  };

  const handleDone = () => {
    onODCCreated(odcNumber, lineas.map((l) => l.id));
    onOpenChange(false);
    setStep("edit");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            {step === "done" ? "ODC Enviada a Odoo" : `Generar Orden de Compra (${lineas.length} conceptos)`}
          </DialogTitle>
        </DialogHeader>

        {step === "edit" && (
          <div className="space-y-4">
            {/* Conceptos seleccionados */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Conceptos incluidos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[200px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500">#</th>
                      <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500">Concepto</th>
                      <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500">Proveedor</th>
                      <th className="px-4 py-1.5 text-right text-xs font-medium text-gray-500">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {lineas.map((l, i) => (
                      <tr key={l.id}>
                        <td className="px-4 py-1.5 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-4 py-1.5 text-sm">{l.concepto}</td>
                        <td className="px-4 py-1.5 text-sm text-gray-500">{l.proveedor_responsable}</td>
                        <td className="px-4 py-1.5 text-right font-mono text-sm">{formatCurrency(l.presupuesto)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={3} className="px-4 py-2 text-sm">Subtotal</td>
                      <td className="px-4 py-2 text-right font-mono text-sm">{formatCurrency(totalPresupuesto)}</td>
                    </tr>
                    <tr className="bg-gray-50 text-xs">
                      <td colSpan={3} className="px-4 py-1 text-gray-500">IVA (16%)</td>
                      <td className="px-4 py-1 text-right font-mono text-gray-500">{formatCurrency(totalConIVA - totalPresupuesto)}</td>
                    </tr>
                    <tr className="bg-gray-900 text-white font-bold">
                      <td colSpan={3} className="px-4 py-2 text-sm">TOTAL</td>
                      <td className="px-4 py-2 text-right font-mono">{formatCurrency(totalConIVA)}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            {/* Datos del proveedor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs flex items-center gap-1"><Building className="w-3 h-3" /> Proveedor</Label>
                <Input
                  value={odcData.proveedor}
                  onChange={(e) => setOdcData({ ...odcData, proveedor: e.target.value })}
                  className="mt-1"
                  placeholder="Nombre o razon social"
                />
                {proveedores.length > 1 && (
                  <div className="flex gap-1 mt-1">
                    {proveedores.map((p) => (
                      <button key={p} onClick={() => setOdcData({ ...odcData, proveedor: p })}
                        className="text-[10px] px-2 py-0.5 bg-gray-100 rounded hover:bg-blue-100 text-gray-600">
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs">RFC Proveedor</Label>
                <Input
                  value={odcData.proveedor_rfc}
                  onChange={(e) => setOdcData({ ...odcData, proveedor_rfc: e.target.value })}
                  className="mt-1"
                  placeholder="XAXX010101000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha Requerida</Label>
                <Input
                  type="date"
                  value={odcData.fecha_requerida}
                  onChange={(e) => setOdcData({ ...odcData, fecha_requerida: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1"><CreditCard className="w-3 h-3" /> Condiciones de Pago</Label>
                <select
                  value={odcData.condiciones_pago}
                  onChange={(e) => setOdcData({ ...odcData, condiciones_pago: e.target.value })}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option>Contado</option>
                  <option>15 dias</option>
                  <option>30 dias</option>
                  <option>45 dias</option>
                  <option>60 dias</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Notas / Instrucciones especiales</Label>
              <Input
                value={odcData.notas}
                onChange={(e) => setOdcData({ ...odcData, notas: e.target.value })}
                className="mt-1"
                placeholder="Entregar en bodega antes de las 2pm..."
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
              <Send className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-blue-700">
                Al enviar, se creara una <strong>Orden de Compra en Odoo</strong> que el equipo de Admin podra revisar y confirmar desde su modulo de compras.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button
                onClick={handleSendToOdoo}
                disabled={!odcData.proveedor}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
                Enviar ODC a Odoo
              </Button>
            </div>
          </div>
        )}

        {step === "sending" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="font-medium">Creando Orden de Compra en Odoo...</p>
            <div className="w-full space-y-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Conectando con odoo.pixelplay.mx
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Creando orden de compra
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Agregando {lineas.length} lineas de producto
              </div>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-700">ODC Creada en Odoo</p>
              <p className="text-sm text-gray-500 mt-1">El equipo de Admin la recibira para confirmacion.</p>
            </div>

            <Card className="w-full">
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Numero ODC</span>
                  <Badge variant="secondary" className="font-mono">{odcNumber}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Proveedor</span>
                  <span className="font-medium">{odcData.proveedor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Conceptos</span>
                  <span>{lineas.length} lineas</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total con IVA</span>
                  <span className="font-mono font-bold">{formatCurrency(totalConIVA)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status en Odoo</span>
                  <Badge className="bg-yellow-100 text-yellow-700">Pendiente de confirmar</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <a
                href={`https://odoo.pixelplay.mx/odoo/purchase`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4" /> Ver en Odoo
              </a>
              <Button variant="outline" onClick={handleDone}>Cerrar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
