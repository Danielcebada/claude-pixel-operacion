"use client";

import { useState } from "react";
import { formatCurrency, getMarginColor } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  CheckCircle, AlertTriangle, Lock, Send, FileCheck,
  ArrowRight, Loader2, ExternalLink, BookCheck,
} from "lucide-react";

interface Props {
  projectId: string;
  projectName: string;
  status: string;
  ventaReal: number;
  costosReal: number;
  gastosReal: number;
  utilidadTotal: number;
  pctUtilidad: number;
  viaticosVenta: number;
  viaticosGasto: number;
  comisionesTotal: number;
  hasAllReals: boolean; // all financial data filled
  odooSaleOrderId?: number;
}

interface CheckItem {
  label: string;
  passed: boolean;
  detail: string;
}

export function FinalizarProyecto(props: Props) {
  const [step, setStep] = useState<"idle" | "review" | "sending" | "done">("idle");
  const [open, setOpen] = useState(false);

  const checks: CheckItem[] = [
    {
      label: "Datos financieros completos",
      passed: props.ventaReal > 0 && (props.costosReal > 0 || props.gastosReal > 0),
      detail: props.ventaReal > 0 ? `Venta: ${formatCurrency(props.ventaReal)}` : "Falta capturar venta real",
    },
    {
      label: "Costos y gastos reales capturados",
      passed: props.costosReal > 0 || props.gastosReal > 0,
      detail: `Costos: ${formatCurrency(props.costosReal)} + Gastos: ${formatCurrency(props.gastosReal)}`,
    },
    {
      label: "Utilidad calculada",
      passed: props.utilidadTotal !== 0,
      detail: `${formatCurrency(props.utilidadTotal)} (${props.pctUtilidad}%)`,
    },
    {
      label: "Comisiones calculadas",
      passed: props.comisionesTotal > 0,
      detail: `Total comisiones: ${formatCurrency(props.comisionesTotal)}`,
    },
    {
      label: "Conexion a Odoo activa",
      passed: !!props.odooSaleOrderId,
      detail: props.odooSaleOrderId ? `Orden de venta #${props.odooSaleOrderId}` : "Sin orden de venta vinculada",
    },
  ];

  const allPassed = checks.every((c) => c.passed);
  const passedCount = checks.filter((c) => c.passed).length;

  const handleFinalize = () => {
    setStep("sending");
    // Simulate sending to Odoo
    setTimeout(() => {
      setStep("done");
    }, 3000);
  };

  const odooData = {
    costos_directos: props.costosReal,
    gastos_operacion: props.gastosReal,
    viaticos: props.viaticosGasto,
    comisiones: props.comisionesTotal,
    utilidad_total: props.utilidadTotal,
    margen: props.pctUtilidad,
  };

  if (props.status === "cerrado") {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg border">
        <Lock className="w-5 h-5 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-600">Proyecto Finalizado</p>
          <p className="text-xs text-gray-400">Los datos fueron enviados a Odoo. El proyecto esta bloqueado.</p>
        </div>
        {props.odooSaleOrderId && (
          <a
            href={`https://odoo.pixelplay.mx/odoo/accounting/analytic-accounts`}
            target="_blank"
            rel="noopener"
            className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            Ver en Odoo <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="gap-2 bg-green-600 hover:bg-green-700 text-white inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8"
        disabled={props.status === "cerrado"}
      >
          <BookCheck className="w-5 h-5" />
          Finalizar Proyecto
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookCheck className="w-5 h-5" />
            Finalizar: {props.projectName}
          </DialogTitle>
        </DialogHeader>

        {step === "idle" || step === "review" ? (
          <div className="space-y-4">
            {/* Pre-flight checks */}
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Al finalizar, se enviaran los datos a las <strong>cuentas analiticas de Odoo</strong> y el proyecto se bloqueara.
              </p>
              <div className="space-y-2">
                {checks.map((check, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border ${check.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    {check.passed
                      ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${check.passed ? "text-green-700" : "text-red-700"}`}>{check.label}</p>
                      <p className="text-xs text-gray-500">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">{passedCount}/{checks.length} verificaciones pasadas</p>
            </div>

            {/* What will be sent */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Lo que se registrara en Odoo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cuenta analitica</span>
                  <span className="font-medium">{props.projectName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Costos directos</span>
                  <span className="font-mono">{formatCurrency(odooData.costos_directos)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Gastos de operacion</span>
                  <span className="font-mono">{formatCurrency(odooData.gastos_operacion)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Viaticos</span>
                  <span className="font-mono">{formatCurrency(odooData.viaticos)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Comisiones</span>
                  <span className="font-mono">{formatCurrency(odooData.comisiones)}</span>
                </div>
                <div className="border-t pt-1.5 flex justify-between text-sm font-bold">
                  <span>Utilidad Total</span>
                  <span className={`font-mono ${getMarginColor(odooData.margen)}`}>
                    {formatCurrency(odooData.utilidad_total)} ({odooData.margen}%)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleFinalize}
              disabled={!allPassed}
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              {allPassed ? "Confirmar y enviar a Odoo" : `Faltan ${checks.length - passedCount} verificaciones`}
            </Button>

            {!allPassed && (
              <p className="text-xs text-center text-red-500">
                Completa todas las verificaciones antes de finalizar.
              </p>
            )}
          </div>
        ) : step === "sending" ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
            <div className="text-center">
              <p className="font-medium">Enviando a Odoo...</p>
              <p className="text-sm text-gray-500 mt-1">Registrando en cuentas analiticas</p>
            </div>
            <div className="w-full space-y-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Creando cuenta analitica
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Registrando costos directos
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Registrando gastos de operacion
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ArrowRight className="w-4 h-4" /> Registrando comisiones
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ArrowRight className="w-4 h-4" /> Cerrando proyecto
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <FileCheck className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-700">Proyecto Finalizado</p>
              <p className="text-sm text-gray-500 mt-1">
                Todos los datos fueron enviados a las cuentas analiticas de Odoo.
              </p>
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Cuenta analitica creada
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Costos registrados: {formatCurrency(odooData.costos_directos)}
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Gastos registrados: {formatCurrency(odooData.gastos_operacion)}
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Comisiones registradas: {formatCurrency(odooData.comisiones)}
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Proyecto bloqueado
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <a
                href="https://odoo.pixelplay.mx/odoo/accounting/analytic-accounts"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4" /> Ver en Odoo
              </a>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
