"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyCount } from "@/lib/portal/types";

interface Props {
  data: DailyCount[];
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

export default function AdminBarChart({ data }: Props) {
  if (data.every((d) => d.received === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-sm text-gray-400 gap-2">
        <span className="text-2xl">📊</span>
        Noch keine Leads in diesem Zeitraum.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: fmtDate(d.date),
    Leads: d.received,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          interval={Math.floor(chartData.length / 10)}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <Bar dataKey="Leads" fill="#0A4D3C" radius={[3, 3, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
