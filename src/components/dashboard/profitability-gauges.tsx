"use client";

import { getMarginBg, getMarginColor, getMarginLabel, formatCurrency } from "@/lib/types";

interface ProjectWithProfit {
  deal_name: string;
  financials: { venta_real: number };
  pct_utilidad: number;
  utilidad_total: number;
}

export function ProfitabilityGauges({ projects }: { projects: ProjectWithProfit[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {projects.map((p) => (
        <div key={p.deal_name} className="flex flex-col items-center gap-2">
          {/* Circular gauge */}
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={
                  p.pct_utilidad >= 50 ? "#3b82f6" :
                  p.pct_utilidad >= 30 ? "#22c55e" :
                  p.pct_utilidad >= 15 ? "#eab308" : "#ef4444"
                }
                strokeWidth="3"
                strokeDasharray={`${Math.min(Math.max(p.pct_utilidad, 0), 100)}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold ${getMarginColor(p.pct_utilidad)}`}>
                {p.pct_utilidad}%
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-medium text-gray-700 truncate max-w-[100px]" title={p.deal_name}>
              {p.deal_name.split("/")[0].trim()}
            </p>
            <p className="text-[10px] text-gray-400">{formatCurrency(p.utilidad_total)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
