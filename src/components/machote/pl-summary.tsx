import { ProjectFinancials, formatCurrency, getMarginColor } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PLProps {
  financials: ProjectFinancials;
  profit: {
    utilidad_bruta_presupuesto: number;
    utilidad_bruta_real: number;
    total_gastos_presupuesto: number;
    total_gastos_real: number;
    utilidad_neta_presupuesto: number;
    utilidad_neta_real: number;
    utilidad_viaticos: number;
    utilidad_total: number;
    pct_utilidad: number;
  };
  currency: "MXN" | "USD";
}

function Row({ label, presupuesto, real, bold, highlight }: {
  label: string; presupuesto: number; real: number; bold?: boolean; highlight?: "green" | "red" | "blue";
}) {
  const diff = real - presupuesto;
  const colorClass = highlight === "green" ? "bg-green-50" : highlight === "red" ? "bg-red-50" : highlight === "blue" ? "bg-blue-50" : "";
  const textClass = bold ? "font-bold" : "font-medium";

  return (
    <tr className={colorClass}>
      <td className={`px-4 py-2 text-sm ${textClass} text-gray-700`}>{label}</td>
      <td className="px-4 py-2 text-sm text-right font-mono text-gray-500">{formatCurrency(presupuesto)}</td>
      <td className="px-4 py-2 text-sm text-right font-mono text-gray-900">{formatCurrency(real)}</td>
      <td className={`px-4 py-2 text-sm text-right font-mono ${diff >= 0 ? "text-green-600" : "text-red-600"}`}>
        {diff !== 0 ? (diff > 0 ? "+" : "") + formatCurrency(diff) : "-"}
      </td>
    </tr>
  );
}

export function PLSummary({ financials: f, profit: p, currency }: PLProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: P&L */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado de Resultados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Presupuesto</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Real</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Varianza</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <Row label="Venta" presupuesto={f.venta_presupuesto} real={f.venta_real} bold />
              <Row label="Costos Directos" presupuesto={f.costos_presupuesto} real={f.costos_real} />
              <Row label="Utilidad Bruta" presupuesto={p.utilidad_bruta_presupuesto} real={p.utilidad_bruta_real} bold highlight="green" />

              <tr><td colSpan={4} className="px-4 py-1"><div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gastos de Operacion</div></td></tr>
              <Row label="Gasolina" presupuesto={f.gasolina_presupuesto} real={f.gasolina_real} />
              <Row label="Internet" presupuesto={f.internet_presupuesto} real={f.internet_real} />
              <Row label="Operacion" presupuesto={f.operacion_presupuesto} real={f.operacion_real} />
              <Row label="Instalacion" presupuesto={f.instalacion_presupuesto} real={f.instalacion_real} />
              <Row label="Ubers" presupuesto={f.ubers_presupuesto} real={f.ubers_real} />
              <Row label="Extras" presupuesto={f.extras_presupuesto} real={f.extras_real} />
              <Row label="Total Gastos" presupuesto={p.total_gastos_presupuesto} real={p.total_gastos_real} bold highlight="red" />

              <Row label="Utilidad Neta" presupuesto={p.utilidad_neta_presupuesto} real={p.utilidad_neta_real} bold highlight="green" />
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Right: Viaticos + Final */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Viaticos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-2 text-sm font-medium">Venta Viaticos</td>
                  <td className="px-4 py-2 text-sm text-right font-mono">{formatCurrency(f.viaticos_venta)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm font-medium">Gasto Viaticos</td>
                  <td className="px-4 py-2 text-sm text-right font-mono text-red-600">{formatCurrency(f.viaticos_gasto)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm font-medium">Uber Viaticos</td>
                  <td className="px-4 py-2 text-sm text-right font-mono text-red-600">{formatCurrency(f.viaticos_uber)}</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="px-4 py-2 text-sm font-bold">Utilidad Viaticos</td>
                  <td className={`px-4 py-2 text-sm text-right font-mono font-bold ${p.utilidad_viaticos >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(p.utilidad_viaticos)}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-900">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Utilidad Neta</span>
                <span className="text-lg font-mono font-bold">{formatCurrency(p.utilidad_neta_real)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Utilidad Viaticos</span>
                <span className="text-lg font-mono font-bold">{formatCurrency(p.utilidad_viaticos)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">UTILIDAD TOTAL</span>
                <span className={`text-2xl font-mono font-bold ${p.utilidad_total >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(p.utilidad_total)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">% Rentabilidad</span>
                <span className={`text-xl font-bold ${getMarginColor(p.pct_utilidad)}`}>
                  {p.pct_utilidad}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
