"use client";

import { useState } from "react";
import { ProjectFinancials, formatCurrency, computeProfitability, getMarginColor } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

type FinancialField = keyof Omit<ProjectFinancials, "id" | "project_id">;

const SECTIONS: { title: string; fields: { key: FinancialField; label: string }[] }[] = [
  {
    title: "Ingresos",
    fields: [
      { key: "venta_presupuesto", label: "Venta Presupuesto" },
      { key: "venta_real", label: "Venta Real" },
    ],
  },
  {
    title: "Costos Directos",
    fields: [
      { key: "costos_presupuesto", label: "Costos Presupuesto" },
      { key: "costos_real", label: "Costos Real" },
    ],
  },
  {
    title: "Gastos de Operacion",
    fields: [
      { key: "gasolina_presupuesto", label: "Gasolina Presup." },
      { key: "gasolina_real", label: "Gasolina Real" },
      { key: "internet_presupuesto", label: "Internet Presup." },
      { key: "internet_real", label: "Internet Real" },
      { key: "operacion_presupuesto", label: "Operacion Presup." },
      { key: "operacion_real", label: "Operacion Real" },
      { key: "instalacion_presupuesto", label: "Instalacion Presup." },
      { key: "instalacion_real", label: "Instalacion Real" },
      { key: "ubers_presupuesto", label: "Ubers Presup." },
      { key: "ubers_real", label: "Ubers Real" },
      { key: "extras_presupuesto", label: "Extras Presup." },
      { key: "extras_real", label: "Extras Real" },
    ],
  },
  {
    title: "Viaticos",
    fields: [
      { key: "viaticos_venta", label: "Viaticos Venta" },
      { key: "viaticos_gasto", label: "Viaticos Gasto" },
      { key: "viaticos_uber", label: "Viaticos Uber" },
    ],
  },
];

export function FinancialsForm({ financials, currency }: { financials: ProjectFinancials; currency: "MXN" | "USD" }) {
  const [values, setValues] = useState<Record<FinancialField, number>>(() => {
    const v: Record<string, number> = {};
    for (const section of SECTIONS) {
      for (const field of section.fields) {
        v[field.key] = financials[field.key] as number;
      }
    }
    return v as Record<FinancialField, number>;
  });

  const handleChange = (key: FinancialField, val: string) => {
    setValues((prev) => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  const profit = computeProfitability({ ...financials, ...values } as ProjectFinancials);

  return (
    <div className="space-y-6">
      {/* Live P&L preview */}
      <Card className="bg-gray-900 text-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Venta Real</p>
              <p className="text-lg font-bold font-mono">{formatCurrency(values.venta_real || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Utilidad Bruta</p>
              <p className="text-lg font-bold font-mono text-green-400">{formatCurrency(profit.utilidad_bruta_real)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Utilidad Neta</p>
              <p className="text-lg font-bold font-mono text-green-400">{formatCurrency(profit.utilidad_neta_real)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Utilidad Total</p>
              <p className="text-lg font-bold font-mono text-green-400">{formatCurrency(profit.utilidad_total)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">% Margen</p>
              <p className={`text-2xl font-bold ${getMarginColor(profit.pct_utilidad)}`}>{profit.pct_utilidad}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form sections */}
      {SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-xs text-gray-500">{field.label}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <Input
                      type="number"
                      value={values[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="pl-7 font-mono text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button size="lg" className="gap-2">
          <Save className="w-4 h-4" />
          Guardar Financieros
        </Button>
      </div>
    </div>
  );
}
