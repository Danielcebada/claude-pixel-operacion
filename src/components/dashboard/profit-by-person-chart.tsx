"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/lib/types";

interface ChartData {
  name: string;
  venta: number;
  utilidad: number;
  count: number;
}

export function ProfitByPersonChart({ data, color }: { data: ChartData[]; color: string }) {
  const chartData = data.map((d) => ({
    ...d,
    margin: d.venta > 0 ? Math.round((d.utilidad / d.venta) * 100) : 0,
    shortName: d.name.split(" ")[0],
  }));

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis
            type="number"
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            fontSize={11}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            width={80}
            fontSize={12}
          />
          <Tooltip
            formatter={(value: unknown) => formatCurrency(Number(value))}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.shortName === label);
              return `${item?.name} (${item?.count} eventos)`;
            }}
          />
          <Bar dataKey="utilidad" name="Utilidad Total" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.margin >= 30 ? "#22c55e" : entry.margin >= 15 ? "#eab308" : "#ef4444"}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
