"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PixelChat } from "@/components/chat/pixel-chat";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const BREADCRUMB_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Proyectos",
  "/quotes": "Cotizaciones",
  "/contracts": "Contratos",
  "/vendors": "Proveedores",
  "/clients": "Clientes",
  "/settings": "Configuracion",
  "/tickets": "Tickets IA",
  "/cmo": "CMO Studio",
  "/consolidation": "Consolidacion",
  "/finance": "Finanzas",
  "/commissions": "Comisiones",
  "/costs": "Centro de Costos",
  "/cashflow": "Cash Flow",
  "/resources": "Recursos",
  "/inventory": "Inventario",
  "/marketing": "Marketing",
  "/team": "Equipo",
  "/reports": "Reportes",
  "/alerts": "Alertas",
  "/admin": "Configuracion",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const pageTitle = BREADCRUMB_MAP[pathname] || "Pixel Operations";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col">
        {/* ─── Top Header Bar ─── */}
        <header className="sticky top-0 z-30 h-16 border-b border-gray-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 shrink-0">
          {/* Left: Breadcrumb / Page Title */}
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Pixel Operations</p>
              <h1 className="text-sm font-semibold text-gray-900 -mt-0.5">{pageTitle}</h1>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proyectos, deals, clientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100/80 border border-transparent rounded-xl placeholder:text-gray-400 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Right: Notifications + Avatar */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Notificaciones">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">Daniel C.</p>
                <p className="text-[11px] text-gray-400">Admin</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                DC
              </div>
            </div>
          </div>
        </header>

        {/* ─── Main Content Area ─── */}
        <main className="flex-1 main-content-bg">
          <div className="p-6 lg:p-8 page-transition">{children}</div>
        </main>
      </div>
      <PixelChat />
    </div>
  );
}
