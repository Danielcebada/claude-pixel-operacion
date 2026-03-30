"use client";

import { useState, useRef, useCallback } from "react";
import {
  ScanLine,
  Upload,
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Receipt,
  DollarSign,
} from "lucide-react";

interface TicketData {
  fecha: string | null;
  monto_total: number | null;
  proveedor: string | null;
  metodo_pago: string | null;
  descripcion: string | null;
  moneda: string | null;
  items_detectados: string[] | null;
}

interface ScannedTicket {
  id: string;
  imageUrl: string;
  imageBase64: string;
  mimeType: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "error";
  data: TicketData | null;
  error: string | null;
  timestamp: Date;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<ScannedTicket[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newTickets: ScannedTicket[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];

        const ticket: ScannedTicket = {
          id: crypto.randomUUID(),
          imageUrl: dataUrl,
          imageBase64: base64,
          mimeType: file.type,
          fileName: file.name,
          status: "pending",
          data: null,
          error: null,
          timestamp: new Date(),
        };

        setTickets((prev) => [ticket, ...prev]);
      };
      reader.readAsDataURL(file);
    });

    return newTickets;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const scanTicket = async (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, status: "processing", error: null } : t
      )
    );

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    try {
      const res = await fetch("/api/scan-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: ticket.imageBase64,
          mimeType: ticket.mimeType,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error en el servidor");
      }

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status: "completed", data: json.data }
            : t
        )
      );
      setExpandedId(ticketId);
    } catch (err) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: "error",
                error:
                  err instanceof Error ? err.message : "Error desconocido",
              }
            : t
        )
      );
    }
  };

  const scanAll = async () => {
    const pending = tickets.filter((t) => t.status === "pending");
    for (const ticket of pending) {
      await scanTicket(ticket.id);
    }
  };

  const removeTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const completedTickets = tickets.filter((t) => t.status === "completed");
  const totalMonto = completedTickets.reduce(
    (sum, t) => sum + (t.data?.monto_total || 0),
    0
  );
  const pendingCount = tickets.filter((t) => t.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            Tickets IA
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sube fotos de tickets y deja que la IA extraiga los datos
            automaticamente
          </p>
        </div>

        {pendingCount > 0 && (
          <button
            onClick={scanAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm"
          >
            <ScanLine className="w-4 h-4" />
            Escanear Todos ({pendingCount})
          </button>
        )}
      </div>

      {/* Stats */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.length}
              </p>
              <p className="text-xs text-gray-500">Tickets Cargados</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {completedTickets.length}
              </p>
              <p className="text-xs text-gray-500">Procesados</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${totalMonto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500">Total Escaneado</p>
            </div>
          </div>
        </div>
      )}

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
          dragActive
            ? "border-violet-500 bg-violet-50"
            : "border-gray-300 bg-white hover:border-violet-400 hover:bg-violet-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              dragActive ? "bg-violet-100" : "bg-gray-100"
            }`}
          >
            {dragActive ? (
              <ImageIcon className="w-8 h-8 text-violet-500" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-700">
              {dragActive
                ? "Suelta las imagenes aqui"
                : "Arrastra fotos de tickets aqui"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              o haz click para seleccionar archivos (JPG, PNG, WebP)
            </p>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {tickets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Tickets ({tickets.length})
          </h2>

          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm"
            >
              {/* Row */}
              <div className="flex items-center gap-4 p-4">
                {/* Thumbnail */}
                <img
                  src={ticket.imageUrl}
                  alt={ticket.fileName}
                  className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {ticket.data?.proveedor || ticket.fileName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {ticket.timestamp.toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {ticket.data?.fecha && ` · ${ticket.data.fecha}`}
                  </p>
                </div>

                {/* Amount */}
                {ticket.data?.monto_total != null && (
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gray-900">
                      ${ticket.data.monto_total.toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {ticket.data.moneda || "MXN"}
                    </p>
                  </div>
                )}

                {/* Status Badge */}
                <div className="shrink-0">
                  {ticket.status === "pending" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Pendiente
                    </span>
                  )}
                  {ticket.status === "processing" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Procesando
                    </span>
                  )}
                  {ticket.status === "completed" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Completado
                    </span>
                  )}
                  {ticket.status === "error" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                      <AlertCircle className="w-3 h-3" />
                      Error
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {ticket.status === "pending" && (
                    <button
                      onClick={() => scanTicket(ticket.id)}
                      className="p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                      title="Escanear"
                    >
                      <ScanLine className="w-4 h-4" />
                    </button>
                  )}
                  {ticket.status === "error" && (
                    <button
                      onClick={() => scanTicket(ticket.id)}
                      className="p-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                      title="Reintentar"
                    >
                      <ScanLine className="w-4 h-4" />
                    </button>
                  )}
                  {ticket.status === "completed" && (
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === ticket.id ? null : ticket.id
                        )
                      }
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                      title="Ver detalle"
                    >
                      {expandedId === ticket.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => removeTicket(ticket.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Error message */}
              {ticket.status === "error" && ticket.error && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    {ticket.error}
                  </p>
                </div>
              )}

              {/* Expanded Detail */}
              {expandedId === ticket.id && ticket.data && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Fecha
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {ticket.data.fecha || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Proveedor
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {ticket.data.proveedor || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Metodo de Pago
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">
                        {ticket.data.metodo_pago || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Moneda
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {ticket.data.moneda || "MXN"}
                      </p>
                    </div>
                  </div>

                  {ticket.data.descripcion && (
                    <div className="mt-3">
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Descripcion
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {ticket.data.descripcion}
                      </p>
                    </div>
                  )}

                  {ticket.data.items_detectados &&
                    ticket.data.items_detectados.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                          Items Detectados
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ticket.data.items_detectados.map((item, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-700"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {tickets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">
            Aun no hay tickets. Sube una foto para comenzar.
          </p>
        </div>
      )}
    </div>
  );
}
