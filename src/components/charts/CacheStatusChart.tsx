"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CacheStatusCount } from "@/lib/types";

const COLORS: Record<string, string> = {
  hit: "#22c55e",
  miss: "#f97316",
  stale: "#eab308",
};

const DEFAULT_COLOR = "#94a3b8";

interface CacheStatusChartProps {
  data: CacheStatusCount[];
}

export function CacheStatusChart({ data }: CacheStatusChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="cacheStatus"
          cx="50%"
          cy="50%"
          outerRadius={80}
        >
          {data.map((entry) => (
            <Cell
              key={entry.cacheStatus}
              fill={COLORS[entry.cacheStatus] ?? DEFAULT_COLOR}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) =>
            typeof value === "number" ? value.toLocaleString() : String(value)
          }
        />
        <Legend
          formatter={(value) => {
            const entry = data.find(
              (item) => item.cacheStatus === String(value),
            );
            const percentage =
              entry && total > 0
                ? Math.round((entry.count / total) * 100)
                : 0;
            return `${value} ${percentage}% · ${entry?.count.toLocaleString() ?? 0} requests`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
