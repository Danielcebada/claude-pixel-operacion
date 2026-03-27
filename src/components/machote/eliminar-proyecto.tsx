"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface EliminarProyectoProps {
  projectId: string;
  projectName: string;
  status: string;
  hasInvoices?: boolean;
  hasOdcPending?: boolean;
}

export function EliminarProyecto({
  projectId,
  projectName,
  status,
  hasInvoices = false,
  hasOdcPending = false,
}: EliminarProyectoProps) {
  const [step, setStep] = useState<"idle" | "confirm1" | "confirm2" | "deleting" | "deleted">("idle");
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const isFinalized = status === "finalizado";
  const hasBlockers = hasInvoices || hasOdcPending || isFinalized;

  const handleDelete = async () => {
    setStep("deleting");
    // Simulate API call to delete
    await new Promise((r) => setTimeout(r, 1500));
    setStep("deleted");
    setTimeout(() => {
      router.push("/projects");
    }, 1500);
  };

  if (step === "idle") {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2"
        onClick={() => setStep("confirm1")}
      >
        <Trash2 className="w-4 h-4" />
        Eliminar Proyecto
      </Button>
    );
  }

  if (step === "deleted") {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-center">
        <p className="text-red-700 font-medium">Proyecto eliminado correctamente</p>
        <p className="text-sm text-red-500 mt-1">Redirigiendo...</p>
      </div>
    );
  }

  if (step === "confirm1") {
    return (
      <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4 space-y-3 max-w-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-red-800">Eliminar proyecto</h3>
            <p className="text-sm text-red-700 mt-1">
              Estas a punto de eliminar <strong>{projectName}</strong>. Esta accion es irreversible.
            </p>

            {hasBlockers && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-bold text-red-800 uppercase">Advertencias:</p>
                {isFinalized && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Este proyecto ya fue finalizado y enviado a Odoo
                  </div>
                )}
                {hasInvoices && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Tiene facturas vinculadas que no se eliminaran de Odoo
                  </div>
                )}
                {hasOdcPending && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Tiene ODCs pendientes de aprobacion
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setStep("confirm2")}
              >
                Si, quiero eliminar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("idle")}
              >
                Cancelar
              </Button>
            </div>
          </div>
          <button onClick={() => setStep("idle")} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirm2") {
    const expectedText = projectName.substring(0, 10).toUpperCase();
    const isMatch = confirmText.toUpperCase() === expectedText;

    return (
      <div className="border-2 border-red-500 bg-red-50 rounded-lg p-4 space-y-3 max-w-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-800">Confirmacion final</h3>
            <p className="text-sm text-red-700 mt-1">
              Escribe <strong className="font-mono bg-red-100 px-1 rounded">{expectedText}</strong> para confirmar la eliminacion:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Escribe ${expectedText}`}
              className="mt-2 w-full border-2 border-red-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-red-500 bg-white"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="destructive"
                size="sm"
                disabled={!isMatch}
                onClick={handleDelete}
                className="gap-2"
              >
                {(step as string) === "deleting" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar definitivamente
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setStep("idle"); setConfirmText(""); }}
              >
                Cancelar
              </Button>
            </div>
            {confirmText.length > 0 && !isMatch && (
              <p className="text-xs text-red-500 mt-1">El texto no coincide</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // deleting state
  return (
    <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-red-700 font-medium">Eliminando proyecto y notificando a Odoo...</span>
      </div>
    </div>
  );
}
