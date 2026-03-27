"use client";

import { useState } from "react";
import { CostoLinea } from "@/lib/types-detail";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Paperclip, FileText } from "lucide-react";

const INITIAL_COSTOS: CostoLinea[] = [
  { id: "c1", project_id: "p3", concepto: "Equipo iPad Booth (3 unidades)", proveedor: "Interno", presupuesto: 15000, real: 14500, odc_status: "aprobada", odc_file: "ODC-001.pdf", observaciones: "" },
  { id: "c2", project_id: "p3", concepto: "Pantallas LED 55\"", proveedor: "RentaVisual MX", presupuesto: 8000, real: 7200, odc_status: "aprobada", odc_file: "ODC-002.pdf", observaciones: "" },
  { id: "c3", project_id: "p3", concepto: "Impresora termica + insumos", proveedor: "Interno", presupuesto: 4000, real: 3800, odc_status: "enviada", observaciones: "Toner extra" },
  { id: "c4", project_id: "p3", concepto: "Estructura metalica booth", proveedor: "MetalEvent", presupuesto: 3000, real: 3000, odc_status: "aprobada", odc_file: "ODC-003.pdf", observaciones: "" },
];

export function CostosTable({ projectId }: { projectId: string }) {
  const [costos, setCostos] = useState<CostoLinea[]>(INITIAL_COSTOS);

  const addRow = () => {
    setCostos([...costos, {
      id: `c-new-${Date.now()}`,
      project_id: projectId,
      concepto: "",
      proveedor: "",
      presupuesto: 0,
      real: 0,
      odc_status: "pendiente",
      observaciones: "",
    }]);
  };

  const updateRow = (id: string, field: keyof CostoLinea, value: string | number) => {
    setCostos(costos.map((c) => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeRow = (id: string) => {
    setCostos(costos.filter((c) => c.id !== id));
  };

  const totalPresupuesto = costos.reduce((s, c) => s + c.presupuesto, 0);
  const totalReal = costos.reduce((s, c) => s + c.real, 0);

  const odcStatusColors: Record<string, string> = {
    pendiente: "bg-gray-100 text-gray-600",
    enviada: "bg-yellow-100 text-yellow-700",
    aprobada: "bg-green-100 text-green-700",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Costos Directos (con ODC)</CardTitle>
          <p className="text-xs text-gray-500 mt-1">Cada linea de costo puede tener su Orden de Compra anexa</p>
        </div>
        <Button size="sm" variant="outline" onClick={addRow} className="gap-1">
          <Plus className="w-4 h-4" /> Agregar Costo
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-[200px]">Concepto</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-[120px]">Proveedor</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 w-[110px]">Presupuesto</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 w-[110px]">Real</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 w-[100px]">ODC</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 w-[90px]">Status ODC</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-[140px]">Observaciones</th>
                <th className="px-3 py-2 w-[40px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {costos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 py-1.5">
                    <Input
                      value={c.concepto}
                      onChange={(e) => updateRow(c.id, "concepto", e.target.value)}
                      placeholder="Descripcion del costo"
                      className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      value={c.proveedor || ""}
                      onChange={(e) => updateRow(c.id, "proveedor", e.target.value)}
                      placeholder="Proveedor"
                      className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      type="number"
                      value={c.presupuesto || ""}
                      onChange={(e) => updateRow(c.id, "presupuesto", parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm text-right font-mono border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      type="number"
                      value={c.real || ""}
                      onChange={(e) => updateRow(c.id, "real", parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm text-right font-mono border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                    />
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    {c.odc_file ? (
                      <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs">
                        <FileText className="w-3.5 h-3.5" />
                        {c.odc_file}
                      </button>
                    ) : (
                      <button className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 text-xs border border-dashed border-gray-300 rounded px-2 py-1">
                        <Paperclip className="w-3.5 h-3.5" />
                        Anexar
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <select
                      value={c.odc_status}
                      onChange={(e) => updateRow(c.id, "odc_status", e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${odcStatusColors[c.odc_status]}`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="enviada">Enviada</option>
                      <option value="aprobada">Aprobada</option>
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      value={c.observaciones || ""}
                      onChange={(e) => updateRow(c.id, "observaciones", e.target.value)}
                      placeholder="Notas"
                      className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <button onClick={() => removeRow(c.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="px-3 py-2" colSpan={2}>TOTAL COSTOS</td>
                <td className="px-3 py-2 text-right font-mono">{formatCurrency(totalPresupuesto)}</td>
                <td className="px-3 py-2 text-right font-mono">{formatCurrency(totalReal)}</td>
                <td colSpan={4} className="px-3 py-2 text-right">
                  <span className={`text-sm ${totalReal <= totalPresupuesto ? "text-green-600" : "text-red-600"}`}>
                    Varianza: {formatCurrency(totalReal - totalPresupuesto)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
