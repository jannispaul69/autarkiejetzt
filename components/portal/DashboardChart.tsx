"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

export default function DashboardChart({ data }: Props) {
  if (data.every((d) => d.received === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-sm text-gray-400 gap-2">
        <span className="text-2xl">📊</span>
        Noch keine Daten für diesen Zeitraum.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: fmtDate(d.date),
    Erhalten: d.received,
    Abgeschlossen: d.closed,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
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
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="Erhalten"
          stroke="#0A4D3C"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="Abgeschlossen"
          stroke="#16A34A"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          strokeDasharray="4 2"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
