"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Upload, FileText, File, Link2, CheckCircle, AlertTriangle,
  Search, X, Eye, Download, Plus, Trash2, Filter,
} from "lucide-react";

interface Factura {
  id: string;
  archivo: string;
  tipo: "pdf" | "xml" | "xlsx";
  proveedor: string;
  numero_factura: string;
  monto: number;
  fecha: string;
  numero_proyecto: string; // Debe coincidir con el del proyecto
  matched_to?: string; // ID de la linea de costo/gasto
  matched_concepto?: string;
  status: "sin_match" | "matched" | "discrepancia";
  notas?: string;
}

interface LineaMatch {
  id: string;
  concepto: string;
  proveedor: string;
  real: number;
  tipo: string;
}

const MOCK_FACTURAS: Factura[] = [
  {
    id: "fac1", archivo: "FAC-RV-2026-0234.pdf", tipo: "pdf",
    proveedor: "RentaVisual MX", numero_factura: "RV-2026-0234", monto: 8352,
    fecha: "2026-02-08", numero_proyecto: "PXL-2026-0045",
    matched_to: "2", matched_concepto: "Pantallas LED 55\"", status: "matched",
  },
  {
    id: "fac2", archivo: "FAC-ME-1089.pdf", tipo: "pdf",
    proveedor: "MetalEvent", numero_factura: "ME-1089", monto: 3480,
    fecha: "2026-02-07", numero_proyecto: "PXL-2026-0045",
    matched_to: "4", matched_concepto: "Estructura metalica booth", status: "matched",
  },
  {
    id: "fac3", archivo: "FAC-ME-1090.xml", tipo: "xml",
    proveedor: "MetalEvent", numero_factura: "ME-1090", monto: 3480,
    fecha: "2026-02-07", numero_proyecto: "PXL-2026-0045",
    matched_to: "4", matched_concepto: "Estructura metalica booth", status: "matched",
  },
  {
    id: "fac4", archivo: "comprobante-uber-joyce.pdf", tipo: "pdf",
    proveedor: "Uber", numero_factura: "UBER-FEB-001", monto: 1044,
    fecha: "2026-02-12", numero_proyecto: "PXL-2026-0045",
    status: "sin_match",
  },
  {
    id: "fac5", archivo: "nota-gasolina-eduardo.pdf", tipo: "pdf",
    proveedor: "Pemex", numero_factura: "PX-98234", monto: 2088,
    fecha: "2026-02-10", numero_proyecto: "PXL-2026-0048",
    status: "discrepancia", notas: "Numero de proyecto incorrecto",
  },
];

const MOCK_LINEAS: LineaMatch[] = [
  { id: "1", concepto: "Equipo iPad Booth (3 unidades)", proveedor: "Interno", real: 14500, tipo: "Costo Directo" },
  { id: "2", concepto: "Pantallas LED 55\"", proveedor: "RentaVisual MX", real: 7200, tipo: "Costo Directo" },
  { id: "3", concepto: "Impresora termica + insumos", proveedor: "Interno", real: 3800, tipo: "Costo Directo" },
  { id: "4", concepto: "Estructura metalica booth", proveedor: "MetalEvent", real: 3000, tipo: "Costo Directo" },
  { id: "5", concepto: "Traslado equipo CDMX-Venue", proveedor: "Eduardo", real: 1800, tipo: "Gasolina" },
  { id: "7", concepto: "Staff operativo dia 1", proveedor: "Joyce", real: 2800, tipo: "Operacion" },
  { id: "11", concepto: "Uber Joyce ida/vuelta x3 dias", proveedor: "Joyce", real: 900, tipo: "Ubers" },
];

const TIPO_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-red-500" />,
  xml: <File className="w-4 h-4 text-green-500" />,
  xlsx: <File className="w-4 h-4 text-blue-500" />,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  matched: { label: "Matched", color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  sin_match: { label: "Sin match", color: "bg-gray-100 text-gray-600", icon: <Search className="w-3.5 h-3.5" /> },
  discrepancia: { label: "Discrepancia", color: "bg-red-100 text-red-700", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

function MatchDialog({ factura, lineas, onMatch }: { factura: Factura; lineas: LineaMatch[]; onMatch: (facturaId: string, lineaId: string, concepto: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = lineas.filter((l) =>
    l.concepto.toLowerCase().includes(search.toLowerCase()) ||
    l.proveedor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">Factura a matchear:</p>
        <p className="text-sm font-medium">{factura.numero_factura} - {factura.proveedor}</p>
        <p className="text-sm font-mono">{formatCurrency(factura.monto)} (con IVA)</p>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar concepto o proveedor..."
          className="pl-9"
        />
      </div>
      <div className="max-h-[250px] overflow-y-auto space-y-1">
        {filtered.map((l) => (
          <button
            key={l.id}
            onClick={() => onMatch(factura.id, l.id, l.concepto)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-medium">{l.concepto}</p>
              <p className="text-xs text-gray-500">{l.tipo} - {l.proveedor}</p>
            </div>
            <span className="text-sm font-mono text-gray-600">{formatCurrency(l.real)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface Props {
  projectId: string;
  numeroProyecto: string;
}

export function FacturasPanel({ projectId, numeroProyecto }: Props) {
  const [facturas, setFacturas] = useState<Factura[]>(MOCK_FACTURAS);
  const [matchingFactura, setMatchingFactura] = useState<Factura | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [uploading, setUploading] = useState(false);

  const handleMatch = (facturaId: string, lineaId: string, concepto: string) => {
    setFacturas(facturas.map((f) =>
      f.id === facturaId ? { ...f, matched_to: lineaId, matched_concepto: concepto, status: "matched" as const } : f
    ));
    setMatchingFactura(null);
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setFacturas([...facturas, {
        id: `fac-${Date.now()}`,
        archivo: "nueva-factura.pdf",
        tipo: "pdf",
        proveedor: "",
        numero_factura: "",
        monto: 0,
        fecha: new Date().toISOString().split("T")[0],
        numero_proyecto: numeroProyecto,
        status: "sin_match",
      }]);
      setUploading(false);
    }, 1000);
  };

  const removeFactura = (id: string) => setFacturas(facturas.filter((f) => f.id !== id));

  const filtered = filterStatus === "all" ? facturas : facturas.filter((f) => f.status === filterStatus);
  const matchedCount = facturas.filter((f) => f.status === "matched").length;
  const unmatchedCount = facturas.filter((f) => f.status === "sin_match").length;
  const discrepancyCount = facturas.filter((f) => f.status === "discrepancia").length;
  const totalFacturado = facturas.filter((f) => f.status === "matched").reduce((s, f) => s + f.monto, 0);

  return (
    <div className="space-y-4">
      {/* Project number banner */}
      <div className="flex items-center gap-3 p-3 bg-gray-900 text-white rounded-lg">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-xs font-bold">#</div>
        <div>
          <p className="text-xs text-gray-400">Numero de Proyecto (Odoo)</p>
          <p className="text-lg font-mono font-bold tracking-wider">{numeroProyecto}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Todos los proveedores deben incluir este numero en sus facturas</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        <button onClick={() => setFilterStatus("all")}
          className={`p-3 rounded-lg border text-center transition-colors ${filterStatus === "all" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}>
          <p className="text-2xl font-bold">{facturas.length}</p>
          <p className="text-xs text-gray-500">Total facturas</p>
        </button>
        <button onClick={() => setFilterStatus("matched")}
          className={`p-3 rounded-lg border text-center transition-colors ${filterStatus === "matched" ? "border-green-500 bg-green-50" : "hover:bg-gray-50"}`}>
          <p className="text-2xl font-bold text-green-600">{matchedCount}</p>
          <p className="text-xs text-gray-500">Matched</p>
        </button>
        <button onClick={() => setFilterStatus("sin_match")}
          className={`p-3 rounded-lg border text-center transition-colors ${filterStatus === "sin_match" ? "border-gray-500 bg-gray-50" : "hover:bg-gray-50"}`}>
          <p className="text-2xl font-bold text-gray-600">{unmatchedCount}</p>
          <p className="text-xs text-gray-500">Sin match</p>
        </button>
        <button onClick={() => setFilterStatus("discrepancia")}
          className={`p-3 rounded-lg border text-center transition-colors ${filterStatus === "discrepancia" ? "border-red-500 bg-red-50" : "hover:bg-gray-50"}`}>
          <p className="text-2xl font-bold text-red-600">{discrepancyCount}</p>
          <p className="text-xs text-gray-500">Discrepancias</p>
        </button>
      </div>

      {/* Facturas table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Facturas del Proyecto</CardTitle>
          <Button size="sm" onClick={handleUpload} disabled={uploading} className="gap-1.5">
            <Upload className="w-4 h-4" />
            {uploading ? "Subiendo..." : "Subir Factura"}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-[11px]">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Archivo</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Proveedor</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">N. Factura</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Monto</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">N. Proyecto</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Match</th>
                <th className="px-4 py-2 text-center font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 w-[70px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((f) => {
                const statusCfg = STATUS_CONFIG[f.status];
                const numProyectoOk = f.numero_proyecto === numeroProyecto;
                return (
                  <tr key={f.id} className={`hover:bg-gray-50 ${f.status === "discrepancia" ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {TIPO_ICONS[f.tipo]}
                        <span className="text-sm truncate max-w-[160px]" title={f.archivo}>{f.archivo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <Input value={f.proveedor}
                        onChange={(e) => setFacturas(facturas.map((x) => x.id === f.id ? { ...x, proveedor: e.target.value } : x))}
                        className="h-7 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                        placeholder="Proveedor" />
                    </td>
                    <td className="px-4 py-2">
                      <Input value={f.numero_factura}
                        onChange={(e) => setFacturas(facturas.map((x) => x.id === f.id ? { ...x, numero_factura: e.target.value } : x))}
                        className="h-7 text-sm border-0 bg-transparent px-0 font-mono focus-visible:ring-0 focus-visible:bg-blue-50 rounded"
                        placeholder="N. Factura" />
                    </td>
                    <td className="px-4 py-2">
                      <Input type="number" value={f.monto || ""}
                        onChange={(e) => setFacturas(facturas.map((x) => x.id === f.id ? { ...x, monto: parseFloat(e.target.value) || 0 } : x))}
                        className="h-7 text-sm text-right font-mono border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:bg-blue-50 rounded w-24" />
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${numProyectoOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {f.numero_proyecto}
                      </span>
                      {!numProyectoOk && <p className="text-[10px] text-red-500 mt-0.5">No coincide</p>}
                    </td>
                    <td className="px-4 py-2">
                      {f.matched_concepto ? (
                        <div className="flex items-center gap-1">
                          <Link2 className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-700 truncate max-w-[120px]" title={f.matched_concepto}>
                            {f.matched_concepto}
                          </span>
                        </div>
                      ) : (
                        <Dialog>
                          <DialogTrigger
                              onClick={() => setMatchingFactura(f)}
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Link2 className="w-3 h-3" /> Matchear
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Matchear Factura con Costo/Gasto</DialogTitle>
                            </DialogHeader>
                            <MatchDialog factura={f} lineas={MOCK_LINEAS} onMatch={handleMatch} />
                          </DialogContent>
                        </Dialog>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge variant="secondary" className={`gap-1 ${statusCfg.color}`}>
                        {statusCfg.icon} {statusCfg.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <button className="text-gray-400 hover:text-blue-600"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => removeFactura(f.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td className="px-4 py-2 font-bold" colSpan={3}>Total Facturado (matched)</td>
                <td className="px-4 py-2 text-right font-mono font-bold">{formatCurrency(totalFacturado)}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
