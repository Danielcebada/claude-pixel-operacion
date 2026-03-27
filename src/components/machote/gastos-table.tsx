"use client";

import { useState } from "react";
import { GastoLinea, GastoCategoria, GASTO_CATEGORIAS } from "@/lib/types-detail";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const INITIAL_GASTOS: GastoLinea[] = [
  { id: "g1", project_id: "p3", categoria: "gasolina", concepto: "Traslado equipo CDMX-Venue", responsable: "Eduardo", presupuesto: 2000, real: 1800, observaciones: "" },
  { id: "g2", project_id: "p3", categoria: "internet", concepto: "Renta MiFi 3 dias", responsable: "Oscar", presupuesto: 800, real: 800, observaciones: "" },
  { id: "g3", project_id: "p3", categoria: "operacion", concepto: "Staff operativo dia 1 (3 personas)", responsable: "Joyce", presupuesto: 3000, real: 2800, observaciones: "" },
  { id: "g4", project_id: "p3", categoria: "operacion", concepto: "Staff operativo dia 2 (3 personas)", responsable: "Joyce", presupuesto: 3000, real: 2500, observaciones: "" },
  { id: "g5", project_id: "p3", categoria: "operacion", concepto: "Staff operativo dia 3 (3 personas)", responsable: "Joyce", presupuesto: 2000, real: 2200, observaciones: "Hora extra" },
  { id: "g6", project_id: "p3", categoria: "instalacion", concepto: "Montaje estructura + calibracion", responsable: "Alvaro", presupuesto: 3000, real: 2800, observaciones: "" },
  { id: "g7", project_id: "p3", categoria: "ubers", concepto: "Uber Joyce ida/vuelta x3 dias", responsable: "Joyce", presupuesto: 1000, real: 900, observaciones: "" },
  { id: "g8", project_id: "p3", categoria: "ubers", concepto: "Uber Oscar montaje", responsable: "Oscar", presupuesto: 500, real: 500, observaciones: "" },
  { id: "g9", project_id: "p3", categoria: "extras", concepto: "Cables HDMI de respaldo", responsable: "Alvaro", presupuesto: 500, real: 400, observaciones: "" },
  { id: "g10", project_id: "p3", categoria: "extras", concepto: "Comida equipo dia 2", responsable: "Joyce", presupuesto: 500, real: 400, observaciones: "" },
];

const CATEGORIA_COLORS: Record<GastoCategoria, string> = {
  gasolina: "bg-orange-100 text-orange-700",
  internet: "bg-blue-100 text-blue-700",
  operacion: "bg-purple-100 text-purple-700",
  instalacion: "bg-cyan-100 text-cyan-700",
  ubers: "bg-yellow-100 text-yellow-700",
  extras: "bg-gray-100 text-gray-700",
  otro: "bg-pink-100 text-pink-700",
};

export function GastosTable({ projectId }: { projectId: string }) {
  const [gastos, setGastos] = useState<GastoLinea[]>(INITIAL_GASTOS);

  const addRow = () => {
    setGastos([...gastos, {
      id: `g-new-${Date.now()}`,
      project_id: projectId,
      categoria: "operacion",
      concepto: "",
      responsable: "",
      presupuesto: 0,
      real: 0,
      observaciones: "",
    }]);
  };

  const updateRow = (id: string, field: keyof GastoLinea, value: string | number) => {
    setGastos(gastos.map((g) => g.id === id ? { ...g, [field]: value } : g));
  };

  const removeRow = (id: string) => {
    setGastos(gastos.filter((g) => g.id !== id));
  };

  // Group totals by category
  const byCategoria: Record<string, { presupuesto: number; real: number }> = {};
  gastos.forEach((g) => {
    if (!byCategoria[g.categoria]) byCategoria[g.categoria] = { presupuesto: 0, real: 0 };
    byCategoria[g.categoria].presupuesto += g.presupuesto;
    byCategoria[g.categoria].real += g.real;
  });

  const totalPresupuesto = gastos.reduce((s, g) => s + g.presupuesto, 0);
  const totalReal = gastos.reduce((s, g) => s + g.real, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Gastos de Operacion (Detalle)</CardTitle>
          <p className="text-xs text-gray-500 mt-1">Desglose por concepto, categoria y responsable</p>
        </div>
        <Button size="sm" variant="outline" onClick={addRow} className="gap-1">
          <Plus className="w-4 h-4" /> Agregar Gasto
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-[100px]">Categoria</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-[220px]">Concepto</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-[110px]">Responsable</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 w-[100px]">Presupuesto</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 w-[100px]">Real</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 w-[80px]">Varianza</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-[130px]">Observaciones</th>
                <th className="px-3 py-2 w-[40px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {gastos.map((g) => {
                const varianza = g.real - g.presupuesto;
                return (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5">
                      <select
                        value={g.categoria}
                        onChange={(e) => updateRow(g.id, "categoria", e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${CATEGORIA_COLORS[g.categoria]}`}
                      >
                        {Object.entries(GASTO_CATEGORIAS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        value={g.concepto}
                        onChange={(e) => updateRow(g.id, "concepto", e.target.value)}
                        placeholder="Descripcion"
                        className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        value={g.responsable || ""}
                        onChange={(e) => updateRow(g.id, "responsable", e.target.value)}
                        placeholder="Persona"
                        className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        type="number"
                        value={g.presupuesto || ""}
                        onChange={(e) => updateRow(g.id, "presupuesto", parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm text-right font-mono border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        type="number"
                        value={g.real || ""}
                        onChange={(e) => updateRow(g.id, "real", parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm text-right font-mono border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                      />
                    </td>
                    <td className={`px-3 py-1.5 text-right font-mono text-xs ${varianza > 0 ? "text-red-600" : varianza < 0 ? "text-green-600" : "text-gray-400"}`}>
                      {varianza !== 0 ? (varianza > 0 ? "+" : "") + formatCurrency(varianza) : "-"}
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        value={g.observaciones || ""}
                        onChange={(e) => updateRow(g.id, "observaciones", e.target.value)}
                        placeholder="Notas"
                        className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <button onClick={() => removeRow(g.id)} className="text-gray-300 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {/* Category subtotals */}
              {Object.entries(byCategoria).map(([cat, totals]) => (
                <tr key={cat} className="bg-gray-50 text-xs">
                  <td className="px-3 py-1.5" colSpan={3}>
                    <span className={`px-2 py-0.5 rounded-full ${CATEGORIA_COLORS[cat as GastoCategoria]}`}>
                      {GASTO_CATEGORIAS[cat as GastoCategoria]}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(totals.presupuesto)}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(totals.real)}</td>
                  <td className={`px-3 py-1.5 text-right font-mono ${totals.real - totals.presupuesto > 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(totals.real - totals.presupuesto)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              ))}
              <tr className="bg-gray-200 font-bold">
                <td className="px-3 py-2" colSpan={3}>TOTAL GASTOS</td>
                <td className="px-3 py-2 text-right font-mono">{formatCurrency(totalPresupuesto)}</td>
                <td className="px-3 py-2 text-right font-mono">{formatCurrency(totalReal)}</td>
                <td className={`px-3 py-2 text-right font-mono ${totalReal > totalPresupuesto ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(totalReal - totalPresupuesto)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
