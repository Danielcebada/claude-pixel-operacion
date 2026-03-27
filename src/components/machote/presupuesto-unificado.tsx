"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus, Trash2, Paperclip, FileText, FileDown, ChevronDown, ChevronRight, ShoppingCart,
} from "lucide-react";
import { ODCGeneratorDialog } from "./odc-generator";

type LineaTipo = "costo" | "gasolina" | "internet" | "operacion" | "instalacion" | "ubers" | "extras" | "otro";

interface LineaPresupuesto {
  id: string;
  tipo: LineaTipo;
  concepto: string;
  proveedor_responsable: string;
  presupuesto: number;
  real: number;
  odc_file?: string;
  odc_status: "sin_odc" | "pendiente" | "enviada" | "aprobada";
  observaciones: string;
}

const TIPO_CONFIG: Record<LineaTipo, { label: string; color: string; section: "costos" | "gastos" }> = {
  costo: { label: "Costo Directo", color: "bg-red-100 text-red-700", section: "costos" },
  gasolina: { label: "Gasolina", color: "bg-orange-100 text-orange-700", section: "gastos" },
  internet: { label: "Internet", color: "bg-blue-100 text-blue-700", section: "gastos" },
  operacion: { label: "Operacion", color: "bg-purple-100 text-purple-700", section: "gastos" },
  instalacion: { label: "Instalacion", color: "bg-cyan-100 text-cyan-700", section: "gastos" },
  ubers: { label: "Ubers", color: "bg-yellow-100 text-yellow-700", section: "gastos" },
  extras: { label: "Extras", color: "bg-gray-100 text-gray-700", section: "gastos" },
  otro: { label: "Otro", color: "bg-pink-100 text-pink-700", section: "gastos" },
};

const ODC_COLORS: Record<string, string> = {
  sin_odc: "text-gray-300",
  pendiente: "bg-gray-100 text-gray-600",
  enviada: "bg-yellow-100 text-yellow-700",
  aprobada: "bg-green-100 text-green-700",
};

const INITIAL_DATA: LineaPresupuesto[] = [
  // Costos directos
  { id: "1", tipo: "costo", concepto: "Equipo iPad Booth (3 unidades)", proveedor_responsable: "Interno", presupuesto: 15000, real: 14500, odc_status: "aprobada", odc_file: "ODC-001.pdf", observaciones: "" },
  { id: "2", tipo: "costo", concepto: "Pantallas LED 55\"", proveedor_responsable: "RentaVisual MX", presupuesto: 8000, real: 7200, odc_status: "aprobada", odc_file: "ODC-002.pdf", observaciones: "" },
  { id: "3", tipo: "costo", concepto: "Impresora termica + insumos", proveedor_responsable: "Interno", presupuesto: 4000, real: 3800, odc_status: "enviada", observaciones: "Toner extra" },
  { id: "4", tipo: "costo", concepto: "Estructura metalica booth", proveedor_responsable: "MetalEvent", presupuesto: 3000, real: 3000, odc_status: "aprobada", odc_file: "ODC-003.pdf", observaciones: "" },
  // Gastos
  { id: "5", tipo: "gasolina", concepto: "Traslado equipo CDMX-Venue", proveedor_responsable: "Eduardo", presupuesto: 2000, real: 1800, odc_status: "sin_odc", observaciones: "" },
  { id: "6", tipo: "internet", concepto: "Renta MiFi 3 dias", proveedor_responsable: "Oscar", presupuesto: 800, real: 800, odc_status: "sin_odc", observaciones: "" },
  { id: "7", tipo: "operacion", concepto: "Staff operativo dia 1 (3 personas)", proveedor_responsable: "Joyce", presupuesto: 3000, real: 2800, odc_status: "sin_odc", observaciones: "" },
  { id: "8", tipo: "operacion", concepto: "Staff operativo dia 2 (3 personas)", proveedor_responsable: "Joyce", presupuesto: 3000, real: 2500, odc_status: "sin_odc", observaciones: "" },
  { id: "9", tipo: "operacion", concepto: "Staff operativo dia 3 (3 personas)", proveedor_responsable: "Joyce", presupuesto: 2000, real: 2200, odc_status: "sin_odc", observaciones: "Hora extra" },
  { id: "10", tipo: "instalacion", concepto: "Montaje estructura + calibracion", proveedor_responsable: "Alvaro", presupuesto: 3000, real: 2800, odc_status: "sin_odc", observaciones: "" },
  { id: "11", tipo: "ubers", concepto: "Uber Joyce ida/vuelta x3 dias", proveedor_responsable: "Joyce", presupuesto: 1000, real: 900, odc_status: "sin_odc", observaciones: "" },
  { id: "12", tipo: "ubers", concepto: "Uber Oscar montaje", proveedor_responsable: "Oscar", presupuesto: 500, real: 500, odc_status: "sin_odc", observaciones: "" },
  { id: "13", tipo: "extras", concepto: "Cables HDMI respaldo", proveedor_responsable: "Alvaro", presupuesto: 500, real: 400, odc_status: "sin_odc", observaciones: "" },
  { id: "14", tipo: "extras", concepto: "Comida equipo dia 2", proveedor_responsable: "Joyce", presupuesto: 500, real: 400, odc_status: "sin_odc", observaciones: "" },
];

// ODC Generator component
function ODCGenerator({ linea, onGenerate }: { linea: LineaPresupuesto; onGenerate: (filename: string) => void }) {
  const [odcData, setOdcData] = useState({
    proveedor: linea.proveedor_responsable,
    descripcion: linea.concepto,
    cantidad: 1,
    precio_unitario: linea.presupuesto,
    condiciones_pago: "Contado",
    fecha_requerida: "",
    notas: "",
  });

  const handleGenerate = () => {
    const filename = `ODC-${Date.now().toString(36).toUpperCase()}.pdf`;
    onGenerate(filename);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Proveedor</Label>
          <Input value={odcData.proveedor} onChange={(e) => setOdcData({ ...odcData, proveedor: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Fecha Requerida</Label>
          <Input type="date" value={odcData.fecha_requerida} onChange={(e) => setOdcData({ ...odcData, fecha_requerida: e.target.value })} className="mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Descripcion</Label>
        <Input value={odcData.descripcion} onChange={(e) => setOdcData({ ...odcData, descripcion: e.target.value })} className="mt-1" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-xs">Cantidad</Label>
          <Input type="number" value={odcData.cantidad} onChange={(e) => setOdcData({ ...odcData, cantidad: parseInt(e.target.value) || 1 })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Precio Unitario</Label>
          <Input type="number" value={odcData.precio_unitario} onChange={(e) => setOdcData({ ...odcData, precio_unitario: parseFloat(e.target.value) || 0 })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Total</Label>
          <div className="mt-1 h-9 flex items-center px-3 bg-gray-100 rounded-md font-mono font-bold">
            {formatCurrency(odcData.cantidad * odcData.precio_unitario)}
          </div>
        </div>
      </div>
      <div>
        <Label className="text-xs">Condiciones de Pago</Label>
        <select value={odcData.condiciones_pago} onChange={(e) => setOdcData({ ...odcData, condiciones_pago: e.target.value })} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
          <option>Contado</option>
          <option>15 dias</option>
          <option>30 dias</option>
          <option>45 dias</option>
          <option>60 dias</option>
        </select>
      </div>
      <div>
        <Label className="text-xs">Notas adicionales</Label>
        <Input value={odcData.notas} onChange={(e) => setOdcData({ ...odcData, notas: e.target.value })} className="mt-1" placeholder="Instrucciones especiales..." />
      </div>
      <Button onClick={handleGenerate} className="w-full gap-2">
        <FileDown className="w-4 h-4" />
        Generar ODC
      </Button>
    </div>
  );
}

export function PresupuestoUnificado({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [lineas, setLineas] = useState<LineaPresupuesto[]>(INITIAL_DATA);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [odcDialogOpen, setOdcDialogOpen] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === lineas.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(lineas.map((l) => l.id)));
    }
  };

  const selectedLineas = lineas.filter((l) => selected.has(l.id));

  const handleODCCreated = (odcNumber: string, lineaIds: string[]) => {
    setLineas(lineas.map((l) =>
      lineaIds.includes(l.id) ? { ...l, odc_file: `${odcNumber}.pdf`, odc_status: "pendiente" as const } : l
    ));
    setSelected(new Set());
  };

  const addRow = (tipo: LineaTipo) => {
    setLineas([...lineas, {
      id: `new-${Date.now()}`,
      tipo,
      concepto: "",
      proveedor_responsable: "",
      presupuesto: 0,
      real: 0,
      odc_status: "sin_odc",
      observaciones: "",
    }]);
  };

  const updateRow = (id: string, field: keyof LineaPresupuesto, value: string | number) => {
    setLineas(lineas.map((l) => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeRow = (id: string) => setLineas(lineas.filter((l) => l.id !== id));

  const handleODCGenerated = (id: string, filename: string) => {
    setLineas(lineas.map((l) => l.id === id ? { ...l, odc_file: filename, odc_status: "pendiente" as const } : l));
  };

  // Separate by section
  const costos = lineas.filter((l) => TIPO_CONFIG[l.tipo].section === "costos");
  const gastos = lineas.filter((l) => TIPO_CONFIG[l.tipo].section === "gastos");

  const totalCostosPresup = costos.reduce((s, l) => s + l.presupuesto, 0);
  const totalCostosReal = costos.reduce((s, l) => s + l.real, 0);
  const totalGastosPresup = gastos.reduce((s, l) => s + l.presupuesto, 0);
  const totalGastosReal = gastos.reduce((s, l) => s + l.real, 0);
  const grandTotalPresup = totalCostosPresup + totalGastosPresup;
  const grandTotalReal = totalCostosReal + totalGastosReal;

  // Group gastos by tipo
  const gastosByTipo: Record<string, LineaPresupuesto[]> = {};
  gastos.forEach((g) => {
    if (!gastosByTipo[g.tipo]) gastosByTipo[g.tipo] = [];
    gastosByTipo[g.tipo].push(g);
  });

  const toggleCollapse = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderRow = (l: LineaPresupuesto) => {
    const varianza = l.real - l.presupuesto;
    const isSelected = selected.has(l.id);
    return (
      <tr key={l.id} className={`hover:bg-gray-50 group ${isSelected ? "bg-blue-50" : ""}`}>
        <td className="px-2 py-1.5 text-center">
          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(l.id)}
            className="rounded border-gray-300 cursor-pointer" />
        </td>
        <td className="px-3 py-1.5">
          <select
            value={l.tipo}
            onChange={(e) => updateRow(l.id, "tipo", e.target.value)}
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${TIPO_CONFIG[l.tipo].color}`}
          >
            {Object.entries(TIPO_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </td>
        <td className="px-3 py-1.5">
          <Input value={l.concepto} onChange={(e) => updateRow(l.id, "concepto", e.target.value)}
            placeholder="Descripcion" className="h-7 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded" />
        </td>
        <td className="px-3 py-1.5">
          <Input value={l.proveedor_responsable} onChange={(e) => updateRow(l.id, "proveedor_responsable", e.target.value)}
            placeholder="Proveedor / Persona" className="h-7 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded" />
        </td>
        <td className="px-3 py-1.5">
          <Input type="number" value={l.presupuesto || ""} onChange={(e) => updateRow(l.id, "presupuesto", parseFloat(e.target.value) || 0)}
            className="h-7 text-sm text-right font-mono border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded w-24" />
        </td>
        <td className="px-3 py-1.5">
          <Input type="number" value={l.real || ""} onChange={(e) => updateRow(l.id, "real", parseFloat(e.target.value) || 0)}
            className="h-7 text-sm text-right font-mono border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded w-24" />
        </td>
        <td className={`px-3 py-1.5 text-right font-mono text-xs ${varianza > 0 ? "text-red-600" : varianza < 0 ? "text-green-600" : "text-gray-300"}`}>
          {varianza !== 0 ? (varianza > 0 ? "+" : "") + formatCurrency(varianza) : "-"}
        </td>
        <td className="px-3 py-1.5 text-center">
          {l.odc_file ? (
            <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-[11px]">
              <FileText className="w-3 h-3" /> {l.odc_file}
            </button>
          ) : (
            <Dialog>
              <DialogTrigger className="inline-flex items-center gap-1 text-gray-400 hover:text-blue-600 text-[11px] border border-dashed border-gray-300 rounded px-2 py-0.5 hover:border-blue-400 transition-colors">
                  <FileDown className="w-3 h-3" /> Generar ODC
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Generar Orden de Compra</DialogTitle>
                </DialogHeader>
                <ODCGenerator linea={l} onGenerate={(filename) => handleODCGenerated(l.id, filename)} />
              </DialogContent>
            </Dialog>
          )}
        </td>
        <td className="px-2 py-1.5">
          {l.odc_status !== "sin_odc" && (
            <select value={l.odc_status} onChange={(e) => updateRow(l.id, "odc_status", e.target.value)}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border-0 cursor-pointer ${ODC_COLORS[l.odc_status]}`}>
              <option value="pendiente">Pendiente</option>
              <option value="enviada">Enviada</option>
              <option value="aprobada">Aprobada</option>
            </select>
          )}
        </td>
        <td className="px-2 py-1.5">
          <button onClick={() => removeRow(l.id)} className="text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">Presupuesto y Ejecucion</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">Costos directos + gastos de operacion en un solo lugar</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => addRow("costo")} className="gap-1 text-xs">
            <Plus className="w-3.5 h-3.5" /> Costo
          </Button>
          <Button size="sm" variant="outline" onClick={() => addRow("operacion")} className="gap-1 text-xs">
            <Plus className="w-3.5 h-3.5" /> Gasto
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-[11px]">
                <th className="px-2 py-2 w-[30px]">
                  <input type="checkbox" checked={selected.size === lineas.length && lineas.length > 0}
                    onChange={toggleSelectAll} className="rounded border-gray-300 cursor-pointer" />
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-[110px]">Tipo</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Concepto</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-[130px]">Proveedor / Resp.</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 w-[100px]">Presup.</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 w-[100px]">Real</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500 w-[80px]">Var.</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 w-[120px]">ODC</th>
                <th className="px-3 py-2 w-[70px]">Status</th>
                <th className="px-3 py-2 w-[30px]"></th>
              </tr>
            </thead>
            <tbody>
              {/* COSTOS DIRECTOS */}
              <tr className="bg-red-50 cursor-pointer" onClick={() => toggleCollapse("costos")}>
                <td></td>
                <td colSpan={3} className="px-3 py-2 font-bold text-xs text-red-800 flex items-center gap-1">
                  {collapsed.costos ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  COSTOS DIRECTOS ({costos.length})
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-xs text-red-700">{formatCurrency(totalCostosPresup)}</td>
                <td className="px-3 py-2 text-right font-mono font-bold text-xs text-red-700">{formatCurrency(totalCostosReal)}</td>
                <td className={`px-3 py-2 text-right font-mono text-xs font-bold ${totalCostosReal - totalCostosPresup > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(totalCostosReal - totalCostosPresup)}
                </td>
                <td colSpan={3}></td>
              </tr>
              {!collapsed.costos && costos.map(renderRow)}

              {/* GASTOS DE OPERACION */}
              <tr className="bg-purple-50 cursor-pointer" onClick={() => toggleCollapse("gastos")}>
                <td></td>
                <td colSpan={3} className="px-3 py-2 font-bold text-xs text-purple-800 flex items-center gap-1">
                  {collapsed.gastos ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  GASTOS DE OPERACION ({gastos.length})
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-xs text-purple-700">{formatCurrency(totalGastosPresup)}</td>
                <td className="px-3 py-2 text-right font-mono font-bold text-xs text-purple-700">{formatCurrency(totalGastosReal)}</td>
                <td className={`px-3 py-2 text-right font-mono text-xs font-bold ${totalGastosReal - totalGastosPresup > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(totalGastosReal - totalGastosPresup)}
                </td>
                <td colSpan={3}></td>
              </tr>
              {!collapsed.gastos && gastos.map(renderRow)}
            </tbody>
            <tfoot>
              <tr className="bg-gray-900 text-white">
                <td></td>
                <td className="px-3 py-2.5 font-bold" colSpan={3}>TOTAL COSTOS + GASTOS</td>
                <td className="px-3 py-2.5 text-right font-mono font-bold">{formatCurrency(grandTotalPresup)}</td>
                <td className="px-3 py-2.5 text-right font-mono font-bold">{formatCurrency(grandTotalReal)}</td>
                <td className={`px-3 py-2.5 text-right font-mono font-bold ${grandTotalReal - grandTotalPresup > 0 ? "text-red-400" : "text-green-400"}`}>
                  {formatCurrency(grandTotalReal - grandTotalPresup)}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>

      {/* Floating action bar when items selected */}
      {selected.size > 0 && (
        <div className="sticky bottom-0 bg-blue-600 text-white px-4 py-3 rounded-b-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{selected.size} conceptos seleccionados</span>
            <span className="text-blue-200 text-sm">
              Total: {formatCurrency(selectedLineas.reduce((s, l) => s + l.presupuesto, 0))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelected(new Set())}
              className="text-xs"
            >
              Deseleccionar
            </Button>
            <Button
              size="sm"
              onClick={() => setOdcDialogOpen(true)}
              className="gap-1.5 bg-white text-blue-600 hover:bg-blue-50"
            >
              <ShoppingCart className="w-4 h-4" />
              Generar ODC y enviar a Odoo
            </Button>
          </div>
        </div>
      )}
    </Card>

    {/* ODC Generator Dialog */}
    <ODCGeneratorDialog
      open={odcDialogOpen}
      onOpenChange={setOdcDialogOpen}
      lineas={selectedLineas}
      projectName={projectName}
      projectId={projectId}
      onODCCreated={handleODCCreated}
    />
    </>
  );
}
