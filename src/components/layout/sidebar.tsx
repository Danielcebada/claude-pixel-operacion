"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  FileSpreadsheet,
  DollarSign,
  Settings,
  Zap,
  Database,
  Megaphone,
  Wallet,
  ScanLine,
  FileText,
  FileBarChart,
  CalendarRange,
  Trophy,
  Scale,
  Users,
  PieChart,
  Bell,
  TrendingUp,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    label: "VENTAS",
    icon: TrendingUp,
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Proyectos", href: "/projects", icon: FolderKanban },
      { name: "Cotizaciones", href: "/quotes", icon: FileText },
      { name: "Contratos", href: "/contracts", icon: Scale },
    ],
  },
  {
    label: "OPERACIONES",
    icon: Settings,
    items: [
      { name: "Consolidacion", href: "/consolidation", icon: FileSpreadsheet },
      { name: "Finanzas", href: "/finance", icon: PieChart },
      { name: "Comisiones", href: "/commissions", icon: DollarSign },
      { name: "Centro Costos", href: "/costs", icon: Database },
      { name: "Cash Flow", href: "/cashflow", icon: Wallet },
      { name: "Recursos", href: "/resources", icon: CalendarRange },
      { name: "Tickets IA", href: "/tickets", icon: ScanLine },
    ],
  },
  {
    label: "MARKETING",
    icon: Megaphone,
    items: [
      { name: "Marketing", href: "/marketing", icon: Megaphone },
      { name: "Equipo", href: "/team", icon: Trophy },
    ],
  },
  {
    label: "ANALISIS",
    icon: BarChart3,
    items: [
      { name: "Reportes", href: "/reports", icon: FileBarChart },
      { name: "Clientes", href: "/clients", icon: Users },
      { name: "Alertas", href: "/alerts", icon: Bell },
    ],
  },
  {
    label: "SISTEMA",
    icon: Settings,
    items: [
      { name: "Configuracion", href: "/admin", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-56 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide">PIXEL OPS</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Control de Rentabilidad
          </p>
        </div>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full">
        {sections.map((section) => {
          const isCollapsed = collapsed[section.label] ?? false;
          const SectionIcon = section.icon;

          return (
            <div key={section.label}>
              {/* Section header */}
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold tracking-wider text-gray-500 uppercase hover:text-gray-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <SectionIcon className="w-3.5 h-3.5" />
                  {section.label}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    isCollapsed && "-rotate-90"
                  )}
                />
              </button>

              {/* Section items */}
              {!isCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        )}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
            DC
          </div>
          <div>
            <p className="text-sm font-medium">Daniel Cebada</p>
            <p className="text-[11px] text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
