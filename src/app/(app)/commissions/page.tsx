"use client";

import { useState } from "react";
import { ComisionRegla, ComisionRol, COMISION_ROLES, MOCK_COMISION_REGLAS } from "@/lib/types-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, AlertCircle } from "lucide-react";

const BASE_OPTIONS = [
  { value: "venta_real", label: "Venta Real" },
  { value: "utilidad_bruta", label: "Utilidad Bruta" },
  { value: "utilidad_neta", label: "Utilidad Neta" },
  { value: "utilidad_total", label: "Utilidad Total" },
];

const ROL_COLORS: Record<ComisionRol, string> = {
  vendedor: "bg-blue-100 text-blue-700",
  pm: "bg-green-100 text-green-700",
  productor: "bg-purple-100 text-purple-700",
  direccion_ventas: "bg-orange-100 text-orange-700",
  direccion_operacion: "bg-cyan-100 text-cyan-700",
};

export default function CommissionsPage() {
  const [reglas, setReglas] = useState<ComisionRegla[]>(MOCK_COMISION_REGLAS);
  const [saved, setSaved] = useState(false);

  const addRegla = () => {
    setReglas([...reglas, {
      id: `cr-new-${Date.now()}`,
      rol: "vendedor",
      porcentaje: 0,
      base_calculo: "venta_real",
      is_active: true,
    }]);
  };

  const updateRegla = (id: string, field: keyof ComisionRegla, value: string | number | boolean) => {
    setReglas(reglas.map((r) => r.id === id ? { ...r, [field]: value } : r));
    setSaved(false);
  };

  const removeRegla = (id: string) => {
    setReglas(reglas.filter((r) => r.id !== id));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracion de Comisiones</h1>
        <p className="text-sm text-gray-500 mt-1">
          Define los porcentajes de comision por rol. Estos se aplican automaticamente a cada proyecto.
        </p>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Como funcionan las comisiones</p>
          <p className="mt-1">Todas las comisiones se calculan sobre la <strong>Utilidad Total</strong> del proyecto.
          Cada proyecto tiene un Vendedor (4.5%), PM (3%), Productor (2%), Dir. Operaciones (0.75%) y Dir. Ventas (0.75%).</p>
        <p className="mt-1 text-blue-600 font-medium">Regla especial: Si Daniel Cebada es el vendedor, la Directora de Ventas no cobra comision en ese proyecto.</p>
        </div>
      </div>

      {/* Rules table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Reglas de Comision</CardTitle>
          <Button size="sm" variant="outline" onClick={addRegla} className="gap-1">
            <Plus className="w-4 h-4" /> Nueva Regla
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Rol</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Porcentaje</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Base de Calculo</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Activo</th>
                <th className="px-4 py-3 w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reglas.map((r) => (
                <tr key={r.id} className={`hover:bg-gray-50 ${!r.is_active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <select
                      value={r.rol}
                      onChange={(e) => updateRegla(r.id, "rol", e.target.value)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer ${ROL_COLORS[r.rol]}`}
                    >
                      {Object.entries(COMISION_ROLES).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Input
                        type="number"
                        value={r.porcentaje}
                        onChange={(e) => updateRegla(r.id, "porcentaje", parseFloat(e.target.value) || 0)}
                        className="w-20 h-8 text-center font-mono text-sm"
                        step={0.5}
                        min={0}
                        max={100}
                      />
                      <span className="text-gray-400">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.base_calculo}
                      onChange={(e) => updateRegla(r.id, "base_calculo", e.target.value)}
                      className="text-sm border rounded-md px-3 py-1.5 cursor-pointer bg-white"
                    >
                      {BASE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => updateRegla(r.id, "is_active", !r.is_active)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${r.is_active ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${r.is_active ? "left-5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => removeRegla(r.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Summary preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vista Previa (ejemplo con proyecto de $100,000)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reglas.filter((r) => r.is_active).map((r) => {
              const exampleBases: Record<string, number> = {
                venta_real: 100000,
                utilidad_bruta: 85000,
                utilidad_neta: 70000,
                utilidad_total: 75000,
              };
              const base = exampleBases[r.base_calculo];
              const comision = Math.round(base * r.porcentaje / 100);
              return (
                <div key={r.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <Badge className={ROL_COLORS[r.rol]}>{COMISION_ROLES[r.rol]}</Badge>
                    <span className="text-xs text-gray-400">{r.porcentaje}% de {BASE_OPTIONS.find((o) => o.value === r.base_calculo)?.label}</span>
                  </div>
                  <span className="font-mono font-medium text-green-600">${comision.toLocaleString()}</span>
                </div>
              );
            })}
            <div className="border-t pt-2 flex items-center justify-between font-bold">
              <span>Total Comisiones</span>
              <span className="font-mono">
                ${reglas.filter((r) => r.is_active).reduce((s, r) => {
                  const exampleBases: Record<string, number> = { venta_real: 100000, utilidad_bruta: 85000, utilidad_neta: 70000, utilidad_total: 75000 };
                  return s + Math.round(exampleBases[r.base_calculo] * r.porcentaje / 100);
                }, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          {saved ? "Guardado!" : "Guardar Reglas"}
        </Button>
      </div>
    </div>
  );
}
