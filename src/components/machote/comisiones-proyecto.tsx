"use client";

import { useState } from "react";
import { ComisionRol, COMISION_ROLES, MOCK_COMISION_REGLAS } from "@/lib/types-detail";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, User, Briefcase, Clapperboard, RotateCcw, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface Props {
  projectId: string;
  vendedorName: string;
  pmName: string;
  productorName?: string;
  ventaReal: number;
  utilidadBruta: number;
  utilidadNeta: number;
  utilidadTotal: number;
}

interface ProjectComisionRule {
  id: string;
  rol: ComisionRol;
  persona: string;
  porcentaje: number;
  base_calculo: "venta_real" | "utilidad_bruta" | "utilidad_neta" | "utilidad_total";
  is_override: boolean;
}

const ROL_COLORS: Record<ComisionRol, string> = {
  vendedor: "bg-blue-50 border-blue-200 text-blue-700",
  pm: "bg-green-50 border-green-200 text-green-700",
  productor: "bg-purple-50 border-purple-200 text-purple-700",
  direccion_ventas: "bg-orange-50 border-orange-200 text-orange-700",
  direccion_operacion: "bg-cyan-50 border-cyan-200 text-cyan-700",
};

const BASE_OPTIONS = [
  { value: "venta_real", label: "Venta Real" },
  { value: "utilidad_bruta", label: "Utilidad Bruta" },
  { value: "utilidad_neta", label: "Utilidad Neta" },
  { value: "utilidad_total", label: "Utilidad Total" },
];

export function ComisionesProyecto({ projectId, vendedorName, pmName, productorName, ventaReal, utilidadBruta, utilidadNeta, utilidadTotal }: Props) {
  const bases: Record<string, number> = {
    venta_real: ventaReal,
    utilidad_bruta: utilidadBruta,
    utilidad_neta: utilidadNeta,
    utilidad_total: utilidadTotal,
  };

  const isDanielVendedor = vendedorName.toLowerCase().includes("daniel");

  const rolAssignments: Record<ComisionRol, string> = {
    vendedor: vendedorName,
    pm: pmName,
    productor: productorName || "Sin asignar",
    direccion_ventas: "Pricila Dominguez", // Siempre es Pris
    direccion_operacion: "Joyce Perez",
  };

  // Initialize from template - skip direccion_ventas if Daniel is the vendedor
  const [rules, setRules] = useState<ProjectComisionRule[]>(
    MOCK_COMISION_REGLAS
      .filter((r) => r.is_active)
      .filter((r) => !(r.rol === "direccion_ventas" && isDanielVendedor))
      .map((regla) => ({
        id: regla.id,
        rol: regla.rol,
        persona: rolAssignments[regla.rol],
        porcentaje: regla.porcentaje,
        base_calculo: regla.base_calculo,
        is_override: false,
      }))
  );
  const [saved, setSaved] = useState(true);
  const [modified, setModified] = useState(false);

  const updateRule = (id: string, field: keyof ProjectComisionRule, value: string | number | boolean) => {
    setRules(rules.map((r) => r.id === id ? { ...r, [field]: value, is_override: true } : r));
    setSaved(false);
    setModified(true);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
    setSaved(false);
    setModified(true);
  };

  const addRule = () => {
    setRules([...rules, {
      id: `pcr-${Date.now()}`,
      rol: "vendedor",
      persona: "",
      porcentaje: 0,
      base_calculo: "venta_real",
      is_override: true,
    }]);
    setSaved(false);
    setModified(true);
  };

  const resetToTemplate = () => {
    setRules(
      MOCK_COMISION_REGLAS
        .filter((r) => r.is_active)
        .filter((r) => !(r.rol === "direccion_ventas" && isDanielVendedor))
        .map((regla) => ({
          id: regla.id,
          rol: regla.rol,
          persona: rolAssignments[regla.rol],
          porcentaje: regla.porcentaje,
          base_calculo: regla.base_calculo,
          is_override: false,
        }))
    );
    setSaved(true);
    setModified(false);
  };

  const handleSave = () => {
    setSaved(true);
  };

  // Calculate
  const comisiones = rules.map((r) => {
    const baseAmount = bases[r.base_calculo] || 0;
    const comisionAmount = Math.round(baseAmount * r.porcentaje / 100);
    return { ...r, base_amount: baseAmount, comision_amount: comisionAmount };
  });

  const totalComisiones = comisiones.reduce((s, c) => s + c.comision_amount, 0);
  const comisionPagadora = Math.round(totalComisiones * 0.10);

  return (
    <div className="space-y-4">
      {/* Team from Odoo */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Equipo del Proyecto</CardTitle>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Datos de Odoo</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50 border-blue-200">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-[11px] text-gray-500 uppercase font-medium">Vendedor</p>
                <p className="text-sm font-bold">{vendedorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-green-50 border-green-200">
              <User className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-[11px] text-gray-500 uppercase font-medium">Project Manager</p>
                <p className="text-sm font-bold">{pmName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-purple-50 border-purple-200">
              <Clapperboard className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-[11px] text-gray-500 uppercase font-medium">Productor</p>
                <p className="text-sm font-bold">{productorName || "Sin asignar"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-project commission rules (editable) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Comisiones del Proyecto</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              {modified
                ? "Reglas modificadas para este proyecto"
                : "Usando template estandar"
              }
              {!saved && <span className="text-orange-500 ml-2">(sin guardar)</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {modified && (
              <Button size="sm" variant="ghost" onClick={resetToTemplate} className="gap-1 text-xs text-gray-500">
                <RotateCcw className="w-3.5 h-3.5" />
                Reset a template
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={addRule} className="gap-1">
              <Plus className="w-4 h-4" /> Agregar
            </Button>
            <Link href="/commissions" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" />
              Templates
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Rol</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Persona</th>
                <th className="px-4 py-2 text-center font-medium text-gray-500">%</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Base</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Base ($)</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Comision</th>
                <th className="px-4 py-2 w-[40px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {comisiones.map((c) => (
                <tr key={c.id} className={`hover:bg-gray-50 ${c.is_override ? "bg-yellow-50/50" : ""}`}>
                  <td className="px-4 py-2">
                    <select
                      value={c.rol}
                      onChange={(e) => updateRule(c.id, "rol", e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer ${ROL_COLORS[c.rol]}`}
                    >
                      {Object.entries(COMISION_ROLES).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    {c.is_override && (
                      <span className="ml-1 text-[9px] text-orange-500">editado</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      value={c.persona}
                      onChange={(e) => updateRule(c.id, "persona", e.target.value)}
                      className="h-7 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                      placeholder="Nombre"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Input
                      type="number"
                      value={c.porcentaje}
                      onChange={(e) => updateRule(c.id, "porcentaje", parseFloat(e.target.value) || 0)}
                      className="w-16 h-7 text-center font-mono text-sm mx-auto"
                      step={0.5}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={c.base_calculo}
                      onChange={(e) => updateRule(c.id, "base_calculo", e.target.value)}
                      className="text-xs border rounded px-2 py-1 cursor-pointer bg-white"
                    >
                      {BASE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-gray-500 text-xs">
                    {formatCurrency(c.base_amount)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-green-600">
                    {formatCurrency(c.comision_amount)}
                  </td>
                  <td className="px-2 py-2">
                    <button onClick={() => removeRule(c.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td className="px-4 py-2 font-bold" colSpan={5}>Subtotal Comisiones</td>
                <td className="px-4 py-2 text-right font-mono font-bold">{formatCurrency(totalComisiones)}</td>
                <td></td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 text-gray-500" colSpan={5}>Comision Pagadora (10%)</td>
                <td className="px-4 py-2 text-right font-mono text-gray-600">{formatCurrency(comisionPagadora)}</td>
                <td></td>
              </tr>
              <tr className="bg-gray-900 text-white">
                <td className="px-4 py-3 font-bold text-base" colSpan={5}>TOTAL COMISIONES</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-lg">{formatCurrency(totalComisiones + comisionPagadora)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Save button */}
      {!saved && (
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Guardar Comisiones del Proyecto
          </Button>
        </div>
      )}
    </div>
  );
}
